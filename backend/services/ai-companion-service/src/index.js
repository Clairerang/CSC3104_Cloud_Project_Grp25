const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const winston = require('winston');
const { GoogleGenerativeAI } = require('@google/generative-ai');
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
  name: 'ai_companion_chat_messages_total',
  help: 'Total number of chat messages processed',
  labelNames: ['intent', 'status'],
  registers: [register]
});

const sentimentGauge = new promClient.Gauge({
  name: 'ai_companion_user_sentiment',
  help: 'User sentiment score (-5 to 5)',
  labelNames: ['userId'],
  registers: [register]
});

// Sentiment analyzer (free npm package)
const sentiment = new Sentiment();

// Google Gemini AI Configuration
let genAI = null;
let geminiModel = null;
const GEMINI_API_KEY = process.env.GEMINI_API_KEY || null;

// Initialize Google Gemini if API key exists
if (GEMINI_API_KEY) {
  try {
    genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
    // Use Gemini 2.0 Flash (experimental, FREE, latest model from Google AI Studio)
    geminiModel = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });
    logger.info('✅ Google Gemini AI initialized (gemini-2.0-flash-exp)');
    logger.info('💡 Mode: GEMINI (Powered by Google AI Studio)');
  } catch (error) {
    logger.warn('⚠️ Gemini init failed, using fallback:', error.message);
    geminiModel = null;
  }
} else {
  logger.info('💡 Mode: FALLBACK (No API key - keyword-based detection)');
}

// Kafka setup
const kafka = new Kafka({
  clientId: 'ai-companion-service',
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

// Intent handlers - Simplified system for senior care
const intentHandlers = {
  // Core intents
  'SocialIsolation': require('./intents/loneliness'),  // Loneliness detection with keywords
  'MedicationReminder': require('./intents/medication'),
  'WeatherInfo': require('./intents/weather'),
  
  // Communication & Social
  'SMSFamily': require('./intents/smsFamily'),  // SMS to family members
  'CommunityEvents': require('./intents/communityEvents'),  // Local activities
  'VolunteerConnect': require('./intents/volunteerConnect'),
  'GameRequest': require('./intents/game')
};

// Fallback intent detection (keyword-based when Gemini is not available)
// Simplified system - 7 intents only
function detectIntentFallback(message) {
  const lowerMsg = message.toLowerCase();
  
  // 1. SMS Family (specific - message + family member)
  if (lowerMsg.match(/\b(message|text|sms|tell|inform|let.*know|send)\b/) && 
      lowerMsg.match(/\b(family|daughter|son|mom|dad|wife|husband|child|brother|sister|grandson|granddaughter)\b/)) {
    return { intent: 'SMSFamily', response: "I'll send a message to your family right away." };
  }
  
  // 2. Community Events (check before loneliness - "miss an activity" != "miss someone")
  if (lowerMsg.match(/\b(event|activit(y|ies)|community|group|club|class|workshop|exercise|tai chi)\b/)) {
    return { intent: 'CommunityEvents', response: "Let me find community activities for you!" };
  }
  
  // 3. Social Isolation & Loneliness (keyword-based alert)
  if (lowerMsg.match(/\b(lonely|alone|sad|depressed|isolated|nobody|feel.*empty|hopeless)\b/) ||
      (lowerMsg.includes('miss') && !lowerMsg.match(/\b(event|activit)/))) {
    return { intent: 'SocialIsolation', response: "I'm here with you. You're not alone." };
  }
  
  // 4. Volunteer Connection
  if (lowerMsg.match(/\b(volunteer|visitor|companion|befriend|social.*worker)\b/)) {
    return { intent: 'VolunteerConnect', response: "I can connect you with friendly volunteers!" };
  }
  
  // 5. Medication
  if (lowerMsg.match(/\b(medication|medicine|pills|tablet|doctor|prescription)\b/)) {
    return { intent: 'MedicationReminder', response: "Let me check your medication schedule." };
  }
  
  // 6. Weather (Singapore specific)
  if (lowerMsg.match(/\b(weather|rain|sunny|temperature|forecast|hot|humid|go.*out)\b/)) {
    return { intent: 'WeatherInfo', response: "Let me check the weather for you." };
  }
  
  // 7. Games
  if (lowerMsg.match(/\b(game|play|trivia|fun|entertainment|bored)\b/)) {
    return { intent: 'GameRequest', response: "Let's have some fun! What game would you like?" };
  }
  
  return { intent: 'Default', response: "I'm here to help! Ask me about activities, family, health, or just chat." };
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

    // Use Google Gemini if available, otherwise use fallback
    if (geminiModel) {
      try {
        // Create context-aware prompt for senior care companion (Singapore-focused)
        const prompt = `You are a warm, caring AI companion for senior citizens in Singapore.
Your mission is to reduce social isolation and improve wellbeing through:

**Core Services (7 intents):**
1. **Loneliness Support** - Detect keywords (lonely, alone, sad, depressed) and provide emotional support
2. **SMS Family** - Help seniors send text messages to family members
3. **Community Events** - Ask about their area/location to find nearby activities
4. **Volunteer Connection** - Connect with friendly volunteer visitors
5. **Medication Reminders** - Help track medication schedules
6. **Weather Advice** - Singapore weather with safety advice for going outside
7. **Fun Games** - Entertainment and cognitive engagement

**Communication Style:**
- Warm, patient, and respectful
- Use simple language (avoid jargon)
- Show genuine care and empathy
- For weather: specifically advise if elderly should go out based on Singapore weather
- For community events: ask about their neighborhood/area first
- For loneliness: be extra compassionate and supportive
- Keep responses brief (2-4 sentences)

**User message:** "${message}"

Respond warmly and helpfully. Always show you care about their wellbeing.`;

        // Call Google Gemini AI
        const result = await geminiModel.generateContent(prompt);
        const response = await result.response;
        botResponse = response.text();

        // Detect intent from message for routing
        const fallback = detectIntentFallback(message);
        intentName = fallback.intent;
        confidence = 0.85; // Gemini provides high-quality responses

        logger.info(`🤖 Gemini AI Response Generated for Intent: ${intentName}`);
        logger.info(`✨ Gemini Response: "${botResponse.substring(0, 100)}..."`);
      } catch (error) {
        logger.error('❌ Gemini AI error:', {
          message: error.message,
          stack: error.stack,
          name: error.name
        });
        const fallback = detectIntentFallback(message);
        intentName = fallback.intent;
        botResponse = fallback.response;
      }
    } else {
      // Fallback mode (no Google Gemini API key)
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

    // Handle specific intents (for event publishing, not response generation)
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

        // Only use handler response if Gemini didn't generate one (fallback mode)
        if (!geminiModel && handlerResult && handlerResult.response) {
          logger.info(`🔄 Using intent handler response (fallback mode)`);
          botResponse = handlerResult.response;
        } else if (geminiModel) {
          logger.info(`✨ Keeping Gemini response (AI mode)`);
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
      mode: geminiModel ? 'gemini' : 'fallback',
      aiProvider: geminiModel ? 'Google Gemini 2.0 Flash (Exp)' : 'Keyword-based'
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
    service: 'ai-companion',
    mode: geminiModel ? 'gemini' : 'fallback',
    aiProvider: geminiModel ? 'Google Gemini 2.0 Flash (Experimental)' : 'Keyword-based detection',
    model: geminiModel ? 'gemini-2.0-flash-exp' : 'none',
    cloud: geminiModel ? 'Google AI Studio' : 'Local',
    cost: '100% FREE',
    rateLimit: geminiModel ? '60 requests/minute' : 'Unlimited',
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
      logger.info(`🤖 AI Companion Service running on port ${PORT}`);
      logger.info(`🧠 AI Provider: ${geminiModel ? 'Google Gemini 2.0 Flash ✨' : 'Keyword-based fallback'}`);
      logger.info(`📊 Metrics: http://localhost:${PORT}/metrics`);
      logger.info(`🏥 Health: http://localhost:${PORT}/health`);
      logger.info(`💰 Cost: 100% FREE forever`);
      if (geminiModel) {
        logger.info(`⚡ Rate Limit: 15 requests/minute (FREE tier)`);
        logger.info(`🌐 Cloud: Google AI Studio`);
      }
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
