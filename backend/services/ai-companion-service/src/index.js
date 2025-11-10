const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const winston = require('winston');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const { v4: uuidv4 } = require('uuid');
const mqtt = require('mqtt');
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

// MQTT setup
const MQTT_BROKER = process.env.MQTT_BROKER || 'hivemq';
const MQTT_PORT = process.env.MQTT_PORT || 1883;
const mqttClient = mqtt.connect(`mqtt://${MQTT_BROKER}:${MQTT_PORT}`, {
  clientId: `ai-companion-${uuidv4()}`,
  clean: true,
  reconnectPeriod: 1000
});

mqttClient.on('connect', () => {
  logger.info(`✅ MQTT connected to HiveMQ at ${MQTT_BROKER}:${MQTT_PORT}`);
});

mqttClient.on('error', (err) => {
  logger.error('❌ MQTT connection error:', err);
});

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
    intent: String
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
  'MedicationReminder': require('./intents/medication'),
  'WeatherInfo': require('./intents/weather'),
  
  // Communication & Social
  'SMSFamily': require('./intents/smsFamily'),  // SMS to family members
  'CommunityEvents': require('./intents/communityEvents'),  // Local activities
  'VolunteerConnect': require('./intents/volunteerConnect'),
  'GameRequest': require('./intents/game')
};

// Fallback intent detection (keyword-based when Gemini is not available)
// Simplified system - 6 intents only
function detectIntentFallback(message) {
  const lowerMsg = message.toLowerCase();
  
  // 1. SMS Family (specific - message + family member)
  if (lowerMsg.match(/\b(message|text|sms|tell|inform|let.*know|send|call)\b/) && 
      lowerMsg.match(/\b(family|daughter|son|mom|dad|wife|husband|child|brother|sister|grandson|granddaughter)\b/)) {
    return { intent: 'SMSFamily', response: "I'll help you contact your family right away." };
  }
  
  // 2. Community Events (activities, things to do, events nearby)
  if (lowerMsg.match(/\b(event|activit(y|ies)|community|group|club|class|workshop|exercise|tai chi|what.*do|happening|near me)\b/)) {
    return { intent: 'CommunityEvents', response: "Let me find community activities for you!" };
  }
  
  // 3. Volunteer Connection
  if (lowerMsg.match(/\b(volunteer|visitor|companion|befriend|social.*worker)\b/)) {
    return { intent: 'VolunteerConnect', response: "I can connect you with friendly volunteers!" };
  }
  
  // 4. Medication
  if (lowerMsg.match(/\b(medication|medicine|pills|tablet|doctor|prescription)\b/)) {
    return { intent: 'MedicationReminder', response: "Let me check your medication schedule." };
  }
  
  // 5. Weather (Singapore specific)
  if (lowerMsg.match(/\b(weather|rain|sunny|temperature|forecast|hot|humid|go.*out)\b/)) {
    return { intent: 'WeatherInfo', response: "Let me check the weather for you." };
  }
  
  // 6. Games
  if (lowerMsg.match(/\b(game|play|trivia|fun|entertainment|bored)\b/)) {
    return { intent: 'GameRequest', response: "Let's have some fun! What game would you like?" };
  }
  
  return { intent: 'Default', response: "I'm here to help! Ask me about activities, family, health, or just chat." };
}

// Root endpoint - API info
app.get('/', (req, res) => {
  res.json({
    service: 'AI Companion Service',
    status: 'Running',
    aiProvider: 'Google Gemini 2.0 Flash Thinking Experimental',
    messaging: 'HiveMQ MQTT',
    version: '2.0.0',
    features: [
      'Elderly-friendly conversational AI',
      'Intent detection (6 intents)',
      'MQTT event publishing',
      'Chat history tracking'
    ],
    endpoints: {
      chat: 'POST /chat - Send a chat message',
      history: 'GET /history/:userId - Get chat history',
      health: 'GET /health - Health check',
      metrics: 'GET /metrics - Prometheus metrics'
    },
    intents: [
      'SMS Family',
      'Community Events',
      'Volunteer Connect',
      'Medication Reminder',
      'Weather Info',
      'Play Game'
    ],
    cost: '100% FREE (Google AI Studio)',
    rateLimit: '15 requests/minute',
    documentation: 'https://ai.google.dev/gemini-api/docs'
  });
});

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

    // STEP 1: Detect intent FIRST (before calling Gemini)
    const fallback = detectIntentFallback(message);
    intentName = fallback.intent;
    logger.info(`🎯 Detected Intent: ${intentName}`);

    // STEP 2: Run intent handler to fetch context data (events, weather, etc.)
    let contextData = '';
    if (intentHandlers[intentName]) {
      try {
        const handlerResult = await intentHandlers[intentName].handle({
          userId,
          message,
          sessionId,
          logger
        });

        // If handler provides response data (real events, weather), use it as context
        if (handlerResult && handlerResult.response) {
          contextData = handlerResult.response;
          logger.info(`📦 Context data fetched from ${intentName} handler (${contextData.length} chars)`);
        }

        logger.info(`✅ Intent handler executed: ${intentName}`);
      } catch (handlerError) {
        logger.error(`❌ Intent handler error for ${intentName}:`, handlerError);
      }
    }

    // STEP 3: Use Google Gemini with enriched context
    if (geminiModel) {
      try {
        // Build context-aware prompt with real data injected
        let prompt = `You are a warm, caring AI companion for senior citizens in Singapore.
Your mission is to improve wellbeing and provide helpful assistance through:

**Core Services (6 intents):**
1. **SMS Family** - Help seniors contact their family members
2. **Community Events** - Provide real Singapore community events for their area
3. **Volunteer Connection** - Connect with friendly volunteer visitors
4. **Medication Reminders** - Help track medication schedules
5. **Weather Advice** - Real Singapore weather with safety advice for going outside
6. **Fun Games** - Entertainment and cognitive engagement

**Communication Style:**
- Warm, patient, and respectful
- Use simple language (avoid jargon)
- Show genuine care and empathy
- Keep responses brief (2-4 sentences max)
- NEVER ask for information already provided`;

        // Inject real data if available
        if (contextData) {
          prompt += `\n\n**REAL DATA TO USE IN YOUR RESPONSE:**\n${contextData}\n\nUse this real data in your response. Do not ask for information that's already provided above.`;
        }

        prompt += `\n\n**User message:** "${message}"\n\nRespond warmly using the real data provided above (if any). Show you care about their wellbeing.`;

        // Call Google Gemini AI with enriched context
        const result = await geminiModel.generateContent(prompt);
        const response = await result.response;
        botResponse = response.text();
        confidence = 0.85; // Gemini provides high-quality responses

        logger.info(`🤖 Gemini AI Response Generated for Intent: ${intentName}`);
        logger.info(`✨ Gemini Response: "${botResponse.substring(0, 100)}..."`);
      } catch (error) {
        logger.error('❌ Gemini AI error:', {
          message: error.message,
          stack: error.stack,
          name: error.name
        });
        // Use fallback response or context data
        botResponse = contextData || fallback.response;
      }
    } else {
      // Fallback mode: Use handler response or default
      botResponse = contextData || fallback.response;
      logger.info(`🔄 Fallback Intent: ${intentName}`);
    }

    // Save conversation to MongoDB
    await saveConversation(userId, sessionId, {
      userMessage: message,
      botResponse,
      intent: intentName
    });

    // Publish chat message to MQTT
    await publishEvent('chat.message', {
      userId,
      sessionId,
      message,
      response: botResponse,
      intent: intentName,
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

// Helper: Publish MQTT event
async function publishEvent(topic, data) {
  try {
    mqttClient.publish(topic, JSON.stringify(data), { qos: 1 }, (err) => {
      if (err) {
        logger.error(`❌ MQTT publish error to ${topic}:`, err);
      } else {
        logger.info(`📤 Published to MQTT topic: ${topic}`);
      }
    });
  } catch (error) {
    logger.error(`❌ MQTT publish error:`, error);
  }
}

// Start server
const PORT = process.env.PORT || 4015;

async function startServer() {
  try {
    app.listen(PORT, () => {
      logger.info(`🤖 AI Companion Service running on port ${PORT}`);
      logger.info(`🧠 AI Provider: ${geminiModel ? 'Google Gemini 2.0 Flash ✨' : 'Keyword-based fallback'}`);
      logger.info(`📡 Messaging: HiveMQ MQTT at ${MQTT_BROKER}:${MQTT_PORT}`);
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
  mqttClient.end();
  await mongoose.disconnect();
  process.exit(0);
});

startServer();

// Export for use in intent files
module.exports = { mqttClient, publishEvent };
