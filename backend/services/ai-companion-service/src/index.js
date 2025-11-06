const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const winston = require('winston');
const dialogflow = require('@google-cloud/dialogflow');
const Sentiment = require('sentiment');
const { v4: uuidv4 } = require('uuid');
const { Kafka } = require('kafkajs');
const promClient = require('prom-client');
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');

// Initialize logger
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.Console()
  ]
});

// Initialize Express
const app = express();
app.use(cors());
app.use(bodyParser.json());

// Prometheus metrics
const register = new promClient.Registry();
promClient.collectDefaultMetrics({ register });

const chatCounter = new promClient.Counter({
  name: 'dialogflow_chat_messages_total',
  help: 'Total number of chat messages processed',
  labelNames: ['intent', 'status'],
  registers: [register]
});

const sentimentGauge = new promClient.Gauge({
  name: 'dialogflow_user_sentiment',
  help: 'User sentiment score (-5 to 5)',
  labelNames: ['userId'],
  registers: [register]
});

// Sentiment analyzer (free npm package)
const sentiment = new Sentiment();

// Dialogflow Configuration (Google Cloud Platform)
let sessionClient = null;
let projectId = process.env.DIALOGFLOW_PROJECT_ID || null;

// Initialize Dialogflow if credentials exist
if (projectId) {
  try {
    const keyPath = process.env.GOOGLE_APPLICATION_CREDENTIALS || '/app/config/dialogflow-key.json';
    if (fs.existsSync(keyPath)) {
      sessionClient = new dialogflow.SessionsClient({ keyFilename: keyPath });
      logger.info('✅ Google Dialogflow initialized (GCP)');
    } else {
      logger.warn('⚠️ Dialogflow key not found, using fallback mode');
      projectId = null;
    }
  } catch (error) {
    logger.warn('⚠️ Dialogflow init failed, using fallback:', error.message);
    projectId = null;
  }
}

// Kafka setup
const kafka = new Kafka({
  clientId: 'dialogflow-companion-service',
  brokers: [process.env.KAFKA_BROKER || 'kafka:9092']
});

const producer = kafka.producer();

// MongoDB connection
mongoose.connect(process.env.MONGO_URI || 'mongodb://mongo:27017/ai-companion', {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => {
  logger.info('✅ Connected to MongoDB');
}).catch(err => {
  logger.error('❌ MongoDB connection error:', err);
});

// Conversation history schema
const ConversationSchema = new mongoose.Schema({
  userId: { type: String, required: true, index: true },
  sessionId: { type: String, required: true },
  messages: [{
    timestamp: { type: Date, default: Date.now },
    userMessage: String,
    botResponse: String,
    intent: String,
    sentiment: String,
    sentimentScore: Number
  }],
  metadata: {
    startTime: { type: Date, default: Date.now },
    lastActivity: { type: Date, default: Date.now },
    messageCount: { type: Number, default: 0 }
  }
}, { timestamps: true });

const Conversation = mongoose.model('Conversation', ConversationSchema);

// Intent handlers
const intentHandlers = {
  'EmergencyHelp': require('./intents/emergency'),
  'CallFamily': require('./intents/callFamily'),
  'MedicationReminder': require('./intents/medication'),
  'Loneliness': require('./intents/loneliness'),
  'WeatherInfo': require('./intents/weather'),
  'GameRequest': require('./intents/game')
};

// Fallback responses (when Dialogflow is not configured)
const fallbackResponses = {
  'help': "🚨 I'm sending an emergency alert to your family right now! Help is on the way.",
  'lonely': "I'm here with you. You're not alone. Would you like me to call someone for you? 💜",
  'call': "I'll help you connect with your family. Who would you like to talk to?",
  'medication': "Let me check your medication schedule for you. One moment...",
  'weather': "Let me get the weather information for you...",
  'game': "How about a fun game? I can play trivia, tell jokes, or we can just chat!",
  'default': "I'm here to help! You can ask me about medication, calling family, or just chat with me. 💜"
};

// Simple intent detection for fallback mode
function detectIntentFallback(message) {
  const lowerMsg = message.toLowerCase();
  
  if (lowerMsg.includes('help') || lowerMsg.includes('emergency') || lowerMsg.includes('fell')) {
    return { intent: 'EmergencyHelp', response: fallbackResponses.help };
  }
  if (lowerMsg.includes('lonely') || lowerMsg.includes('sad') || lowerMsg.includes('alone')) {
    return { intent: 'Loneliness', response: fallbackResponses.lonely };
  }
  if (lowerMsg.includes('call') || lowerMsg.includes('family') || lowerMsg.includes('daughter') || lowerMsg.includes('son')) {
    return { intent: 'CallFamily', response: fallbackResponses.call };
  }
  if (lowerMsg.includes('medication') || lowerMsg.includes('medicine') || lowerMsg.includes('pills')) {
    return { intent: 'MedicationReminder', response: fallbackResponses.medication };
  }
  if (lowerMsg.includes('weather')) {
    return { intent: 'WeatherInfo', response: fallbackResponses.weather };
  }
  if (lowerMsg.includes('game') || lowerMsg.includes('play') || lowerMsg.includes('trivia') || lowerMsg.includes('joke')) {
    return { intent: 'GameRequest', response: fallbackResponses.game };
  }
  
  return { intent: 'Default', response: fallbackResponses.default };
}

// Main chat endpoint
app.post('/chat', async (req, res) => {
  const startTime = Date.now();
  
  try {
    const { userId, message, sessionId = uuidv4() } = req.body;

    if (!userId || !message) {
      return res.status(400).json({ 
        success: false, 
        error: 'Missing userId or message' 
      });
    }

    logger.info(`📨 Message from ${userId}: ${message}`);

    let intentName = 'Default';
    let botResponse = '';
    let confidence = 0;

    // Use Dialogflow if available, otherwise use fallback
    if (projectId && sessionClient) {
      try {
        // Google Dialogflow API call
        const sessionPath = sessionClient.projectAgentSessionPath(projectId, sessionId);
        
        const request = {
          session: sessionPath,
          queryInput: {
            text: {
              text: message,
              languageCode: 'en-US',
            },
          },
        };

        const responses = await sessionClient.detectIntent(request);
        const result = responses[0].queryResult;

        intentName = result.intent ? result.intent.displayName : 'Default';
        botResponse = result.fulfillmentText || 'I understand. Let me help you with that.';
        confidence = result.intentDetectionConfidence || 0;

        logger.info(`🤖 Dialogflow Intent: ${intentName} (${(confidence * 100).toFixed(1)}%)`);
      } catch (error) {
        logger.warn('⚠️ Dialogflow error, using fallback:', error.message);
        const fallback = detectIntentFallback(message);
        intentName = fallback.intent;
        botResponse = fallback.response;
      }
    } else {
      // Fallback mode (no Google Cloud credentials)
      const fallback = detectIntentFallback(message);
      intentName = fallback.intent;
      botResponse = fallback.response;
      logger.info(`🔄 Fallback Intent: ${intentName}`);
    }

    // Analyze sentiment (free npm package)
    const sentimentResult = sentiment.analyze(message);
    const sentimentScore = sentimentResult.score;
    const sentimentLabel = sentimentScore > 2 ? 'POSITIVE' : 
                          sentimentScore < -2 ? 'NEGATIVE' : 'NEUTRAL';

    logger.info(`😊 Sentiment: ${sentimentLabel} (${sentimentScore})`);

    // Update sentiment metric
    sentimentGauge.set({ userId }, sentimentScore);

    // Handle specific intents
    if (intentHandlers[intentName]) {
      try {
        const handlerResult = await intentHandlers[intentName].handle({
          userId,
          message,
          sessionId,
          sentiment: sentimentLabel,
          sentimentScore,
          producer,
          logger
        });

        if (handlerResult && handlerResult.response) {
          botResponse = handlerResult.response;
        }

        logger.info(`✅ Intent handler executed: ${intentName}`);
      } catch (handlerError) {
        logger.error(`❌ Intent handler error for ${intentName}:`, handlerError);
      }
    }

    // Publish negative sentiment alert
    if (sentimentScore < -3) {
      await publishEvent('notification.events', {
        type: 'negative_sentiment',
        userId,
        message: `User showing negative sentiment: "${message}"`,
        sentimentScore,
        timestamp: new Date().toISOString()
      });
    }

    // Save conversation to MongoDB
    await saveConversation(userId, sessionId, {
      userMessage: message,
      botResponse,
      intent: intentName,
      sentiment: sentimentLabel,
      sentimentScore
    });

    // Publish chat message to Kafka
    await publishEvent('chat.message', {
      userId,
      sessionId,
      message,
      response: botResponse,
      intent: intentName,
      sentiment: sentimentLabel,
      timestamp: new Date().toISOString()
    });

    // Update metrics
    chatCounter.inc({ intent: intentName, status: 'success' });

    const responseTime = Date.now() - startTime;
    logger.info(`⚡ Response time: ${responseTime}ms`);

    res.json({
      success: true,
      response: botResponse,
      intent: intentName,
      sentiment: sentimentLabel,
      sentimentScore,
      confidence,
      sessionId,
      mode: projectId ? 'dialogflow' : 'fallback'
    });

  } catch (error) {
    logger.error('❌ Chat error:', error);
    chatCounter.inc({ intent: 'unknown', status: 'error' });
    
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: error.message
    });
  }
});

// Get conversation history
app.get('/history/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const limit = parseInt(req.query.limit) || 50;

    const conversations = await Conversation.find({ userId })
      .sort({ 'metadata.lastActivity': -1 })
      .limit(limit);

    res.json({
      success: true,
      userId,
      conversations: conversations.map(conv => ({
        sessionId: conv.sessionId,
        messageCount: conv.metadata.messageCount,
        startTime: conv.metadata.startTime,
        lastActivity: conv.metadata.lastActivity,
        messages: conv.messages.slice(-10) // Last 10 messages per session
      }))
    });
  } catch (error) {
    logger.error('❌ History error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get sentiment trend
app.get('/sentiment/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const days = parseInt(req.query.days) || 7;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const conversations = await Conversation.find({
      userId,
      'metadata.lastActivity': { $gte: startDate }
    });

    const sentimentData = conversations.flatMap(conv => 
      conv.messages.map(msg => ({
        timestamp: msg.timestamp,
        score: msg.sentimentScore,
        sentiment: msg.sentiment
      }))
    );

    const avgSentiment = sentimentData.length > 0
      ? sentimentData.reduce((sum, item) => sum + item.score, 0) / sentimentData.length
      : 0;

    res.json({
      success: true,
      userId,
      period: `${days} days`,
      averageSentiment: avgSentiment.toFixed(2),
      dataPoints: sentimentData.length,
      trend: sentimentData
    });
  } catch (error) {
    logger.error('❌ Sentiment trend error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    service: 'dialogflow-companion',
    mode: projectId ? 'dialogflow' : 'fallback',
    cloud: projectId ? 'Google Cloud Platform (GCP)' : 'Local',
    cost: '100% FREE',
    uptime: process.uptime(),
    timestamp: new Date().toISOString()
  });
});

// Metrics endpoint
app.get('/metrics', async (req, res) => {
  res.set('Content-Type', register.contentType);
  res.end(await register.metrics());
});

// Helper: Save conversation
async function saveConversation(userId, sessionId, messageData) {
  try {
    let conversation = await Conversation.findOne({ userId, sessionId });

    if (!conversation) {
      conversation = new Conversation({
        userId,
        sessionId,
        messages: [],
        metadata: {
          startTime: new Date(),
          lastActivity: new Date(),
          messageCount: 0
        }
      });
    }

    conversation.messages.push(messageData);
    conversation.metadata.lastActivity = new Date();
    conversation.metadata.messageCount += 1;

    await conversation.save();
    logger.info(`💾 Conversation saved for ${userId}`);
  } catch (error) {
    logger.error('❌ Save conversation error:', error);
  }
}

// Helper: Publish Kafka event
async function publishEvent(topic, data) {
  try {
    await producer.send({
      topic,
      messages: [{ value: JSON.stringify(data) }]
    });
    logger.info(`� Published to ${topic}`);
  } catch (error) {
    logger.error(`❌ Kafka publish error:`, error);
  }
}

// Start server
const PORT = process.env.PORT || 4015;

async function startServer() {
  try {
    // Connect Kafka producer
    await producer.connect();
    logger.info('✅ Kafka producer connected');

    app.listen(PORT, () => {
      logger.info(`🤖 Dialogflow Companion Service running on port ${PORT}`);
      logger.info(`📊 Metrics available at http://localhost:${PORT}/metrics`);
      logger.info(`🏥 Health check at http://localhost:${PORT}/health`);
      logger.info(`🌐 Mode: ${projectId ? 'Google Dialogflow (GCP)' : 'Fallback (No credentials)'}`);
      logger.info(`💰 Cost: 100% FREE${projectId ? ' with Google Cloud' : ' (local mode)'}`);
    });
  } catch (error) {
    logger.error('❌ Server startup error:', error);
    process.exit(1);
  }
}

// Graceful shutdown
process.on('SIGTERM', async () => {
  logger.info('⚠️ SIGTERM received, shutting down gracefully...');
  await producer.disconnect();
  await mongoose.disconnect();
  process.exit(0);
});

startServer();
