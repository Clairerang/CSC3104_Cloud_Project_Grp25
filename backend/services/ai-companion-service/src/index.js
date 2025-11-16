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
let geminiModels = []; // Array of all available models
const GEMINI_API_KEY = process.env.GEMINI_API_KEY || null;

// ALL available Gemini models (will try each one until success)
// Retrieved from: https://generativelanguage.googleapis.com/v1beta/models
const AVAILABLE_MODELS = [
  'models/gemini-2.5-flash',         // Latest Gemini 2.5 Flash (stable)
  'models/gemini-2.5-pro',           // Latest Gemini 2.5 Pro (most capable)
  'models/gemini-2.0-flash',         // Gemini 2.0 Flash (stable)
  'models/gemini-2.0-flash-exp',     // Experimental 2.0 (may be rate limited)
  'models/gemini-2.0-flash-001',     // Specific version
  'models/gemini-2.0-flash-lite',    // Lite version (faster)
  'models/gemini-2.0-pro-exp',       // Pro experimental
  'models/gemini-exp-1206',          // Experimental variant
  'models/gemini-2.5-flash-preview-05-20', // Preview versions
  'models/gemini-2.5-pro-preview-06-05',
  'models/gemini-2.0-flash-lite-001',
  'models/gemini-2.0-flash-lite-preview'
];

// Rate limiter for Gemini API calls (to stay under 15 RPM free tier limit)
const RATE_LIMIT_RPM = 10; // Set to 10 requests per minute to stay well under the 15 limit
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute in milliseconds
const requestTimestamps = [];

function canMakeGeminiRequest() {
  const now = Date.now();
  // Remove timestamps older than the rate limit window
  while (requestTimestamps.length > 0 && requestTimestamps[0] < now - RATE_LIMIT_WINDOW) {
    requestTimestamps.shift();
  }
  // Check if we're under the limit
  if (requestTimestamps.length >= RATE_LIMIT_RPM) {
    const oldestRequest = requestTimestamps[0];
    const waitTime = Math.ceil((oldestRequest + RATE_LIMIT_WINDOW - now) / 1000);
    logger.warn(`⚠️ Rate limit reached (${RATE_LIMIT_RPM} RPM). Wait ${waitTime}s before next Gemini request.`);
    return false;
  }
  return true;
}

function recordGeminiRequest() {
  requestTimestamps.push(Date.now());
}

// Initialize Google Gemini if API key exists
if (GEMINI_API_KEY) {
  try {
    genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
    // Initialize ALL models
    geminiModels = AVAILABLE_MODELS.map(modelName => ({
      name: modelName,
      model: genAI.getGenerativeModel({ model: modelName })
    }));
    logger.info(`✅ Google Gemini AI initialized with ${geminiModels.length} fallback models`);
    logger.info(`📋 Models: ${AVAILABLE_MODELS.slice(0, 4).join(', ')}... (+${AVAILABLE_MODELS.length - 4} more)`);
    logger.info(`💡 Mode: GEMINI with Rate Limit (${RATE_LIMIT_RPM} requests/min)`);
  } catch (error) {
    logger.warn('⚠️ Gemini init failed, using fallback:', error.message);
    geminiModels = [];
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
mongoose.connect(process.env.MONGODB_URI || 'mongodb://mongo:27017/senior_care', {
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

// Helper: Publish MQTT event (defined early so it can be passed to handlers)
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

// Pass publishEvent to SMS handler
if (intentHandlers.SMSFamily && intentHandlers.SMSFamily.setPublishEvent) {
  intentHandlers.SMSFamily.setPublishEvent(publishEvent);
}

// Fallback intent detection (keyword-based when Gemini is not available)
// Simplified system - 6 intents only
function detectIntentFallback(message, conversationHistory = '') {
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
  
  // 2b. Location mentions - if user mentions location AND recent conversation was about events
  const locationKeywords = ['live in', 'live at', 'staying in', 'staying at', 'stay in', 'stay at', 'i am from', 'am from', 'from', 'located in', 'located at', 'in the', 'at the', 'near', 'around'];
  
  // Comprehensive list of Singapore areas for regex matching
  const singaporeAreaPattern = /\b(orchard|bugis|chinatown|marina bay|city hall|raffles place|clarke quay|boat quay|little india|kampong glam|dhoby ghaut|somerset|newton|novena|toa payoh|bishan|ang mo kio|thomson|sin ming|marymount|caldecott|woodlands|yishun|sembawang|admiralty|marsiling|kranji|yew tee|choa chu kang|bukit panjang|bukit batok|hillview|beauty world|king albert park|sixth avenue|tampines|pasir ris|simei|tanah merah|bedok|kembangan|eunos|paya lebar|aljunied|kallang|lavender|boon keng|potong pasir|woodleigh|serangoon|kovan|hougang|buangkok|sengkang|punggol|compassvale|rumbia|bakau|jurong east|jurong west|boon lay|pioneer|joo koon|gul circle|tuas link|tuas west road|tuas crescent|clementi|dover|buona vista|commonwealth|queenstown|redhill|tiong bahru|outram park|telok blangah|harbourfront|farrer park)\b/i;
  
  const hasLocationMention = locationKeywords.some(kw => lowerMsg.includes(kw)) || singaporeAreaPattern.test(lowerMsg);
  const recentlyDiscussedEvents = conversationHistory.toLowerCase().includes('event') || 
                                   conversationHistory.toLowerCase().includes('activities') ||
                                   conversationHistory.toLowerCase().includes('community') ||
                                   conversationHistory.toLowerCase().includes('near me') ||
                                   conversationHistory.toLowerCase().includes('what can i do') ||
                                   conversationHistory.toLowerCase().includes('happening');
  
  // SMART RULE: If location is mentioned in isolation (short message < 20 words), assume CommunityEvents
  const wordCount = message.trim().split(/\s+/).length;
  const isShortLocationMessage = wordCount <= 20 && hasLocationMention;
  
  if (hasLocationMention && (recentlyDiscussedEvents || isShortLocationMessage)) {
    return { intent: 'CommunityEvents', response: "Let me find activities in your area!" };
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
  
  // Default - Make it warmer and more helpful
  const greetings = ['hello', 'hi', 'hey', 'good morning', 'good afternoon', 'good evening'];
  const isGreeting = greetings.some(g => lowerMsg.includes(g));
  
  if (isGreeting) {
    return { 
      intent: 'Default', 
      response: "Hello! It's wonderful to chat with you today! 😊 I'm here to help you with many things:\n\n• 📱 Contact your family\n• 🎉 Find fun community activities\n• 💊 Track your medications\n• 🌤️ Check the weather\n• 🎮 Play games together\n• 🤝 Connect with friendly volunteers\n\nWhat would you like to do?" 
    };
  }
  
  // For other unmatched queries, be more helpful
  return { 
    intent: 'Default', 
    response: "I'd love to help you! I can assist with:\n\n• 📱 Sending messages to your family\n• 🎉 Finding community events and activities\n• 💊 Medication reminders\n• 🌤️ Weather updates and safety advice\n• 🎮 Fun games and entertainment\n• 🤝 Connecting you with volunteers\n\nWhat can I help you with today?" 
  };
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

    // STEP 0: Retrieve conversation history for context
    let conversationHistory = '';
    try {
      const existingConversation = await Conversation.findOne({ userId, sessionId }).lean();
      if (existingConversation && existingConversation.messages && existingConversation.messages.length > 0) {
        // Get last 5 messages for context (to avoid token overflow)
        const recentMessages = existingConversation.messages.slice(-5);
        conversationHistory = recentMessages.map(msg => 
          `User: ${msg.userMessage}\nAssistant: ${msg.botResponse}`
        ).join('\n\n');
        logger.info(`📚 Retrieved ${recentMessages.length} previous messages for context`);
      }
    } catch (historyError) {
      logger.warn(`⚠️ Could not retrieve conversation history: ${historyError.message}`);
    }

    // STEP 1: Use AI to detect intent and extract information (smarter than keyword matching)
    let aiDetectedIntent = null;
    let extractedLocation = null;
    
    if (geminiModels.length > 0 && canMakeGeminiRequest()) {
      try {
        // Use Gemini to intelligently detect intent and extract information
        const intentPrompt = `You are an intent classifier for an elderly care AI assistant.

**Available Intents:**
1. SMSFamily - User wants to contact/message family members
2. CommunityEvents - User asking about activities, events, things to do, places to go
3. VolunteerConnect - User wants volunteer visitors or companions
4. MedicationReminder - User asking about medication/medicine
5. WeatherInfo - User asking about weather
6. GameRequest - User wants to play games
7. Default - General conversation or greetings

**Previous Conversation:**
${conversationHistory || 'No previous conversation'}

**Current User Message:**
"${message}"

**CRITICAL RULES:**
1. If user mentions ONLY a location (like "i live at hougang", "i am from tampines"), check previous conversation:
   - If previous conversation was about events/activities/things to do → Intent is CommunityEvents
   - If no previous conversation → Intent is CommunityEvents (they're asking implicitly "what's near me?")
2. Phrases like "i live at X", "i am from X", "i stay at X" usually mean user wants to find things near that location
3. ALWAYS extract location from these patterns even if no explicit question is asked
4. Consider conversation context - users often provide location as a follow-up to their previous request

**Response Format (JSON only):**
{
  "intent": "<intent_name>",
  "location": "<extracted_location_or_null>",
  "confidence": <0.0_to_1.0>,
  "reasoning": "<brief_explanation>"
}`;

        const model = geminiModels[0].model; // Use primary model
        const result = await model.generateContent(intentPrompt);
        const responseText = result.response.text();
        
        // Extract JSON from response
        const jsonMatch = responseText.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          aiDetectedIntent = JSON.parse(jsonMatch[0]);
          intentName = aiDetectedIntent.intent;
          extractedLocation = aiDetectedIntent.location;
          logger.info(`🧠 AI Intent Detection: ${intentName} (confidence: ${aiDetectedIntent.confidence}) ${extractedLocation ? `Location: ${extractedLocation}` : ''}`);
          if (aiDetectedIntent.reasoning) {
            logger.info(`💭 Reasoning: ${aiDetectedIntent.reasoning}`);
          }
        }
      } catch (aiError) {
        logger.warn(`⚠️ AI intent detection failed, using fallback: ${aiError.message}`);
      }
    }
    
    // STEP 1B: Fallback to keyword-based detection if AI fails
    if (!aiDetectedIntent) {
      const fallback = detectIntentFallback(message, conversationHistory);
      intentName = fallback.intent;
      logger.info(`🎯 Fallback Intent Detection: ${intentName}`);
    }

    // STEP 2: Run intent handler to fetch context data (events, weather, etc.)
    let contextData = '';
    if (intentHandlers[intentName]) {
      try {
        const handlerResult = await intentHandlers[intentName].handle({
          userId,
          message,
          sessionId,
          logger,
          extractedLocation // Pass AI-extracted location to handler
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

    // STEP 3: Use Google Gemini with enriched context (with rate limiting)
    if (geminiModels.length > 0 && canMakeGeminiRequest()) {
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

        // Inject conversation history if available
        if (conversationHistory) {
          prompt += `\n\n**CONVERSATION HISTORY (Recent messages):**\n${conversationHistory}\n\n⚠️ IMPORTANT: This is a CONTINUATION of an existing conversation. The user is following up on previous topics. Reference what was discussed before and build upon it. Do NOT start fresh - acknowledge the context.`;
        }

        prompt += `\n\n**User message:** "${message}"\n\nRespond warmly using the real data provided above (if any). Show you care about their wellbeing.`;

        // Try ALL Gemini models until one succeeds
        let modelSucceeded = false;
        let lastError = null;

        for (let i = 0; i < geminiModels.length; i++) {
          const { name: modelName, model: currentModel } = geminiModels[i];
          
          try {
            logger.info(`🔄 Trying model ${i + 1}/${geminiModels.length}: ${modelName}...`);
            
            // Call Google Gemini AI with enriched context
            const result = await currentModel.generateContent(prompt);
            const response = await result.response;
            botResponse = response.text();
            confidence = 0.85; // Gemini provides high-quality responses

            // Record successful API call
            recordGeminiRequest();

            logger.info(`✅ SUCCESS! Model "${modelName}" worked!`);
            logger.info(`🤖 Gemini AI Response Generated for Intent: ${intentName}`);
            logger.info(`✨ Response: "${botResponse.substring(0, 100)}..."`);
            
            modelSucceeded = true;
            break; // Exit loop on first success
            
          } catch (modelError) {
            lastError = modelError;
            logger.warn(`⚠️ Model "${modelName}" failed: ${modelError.message}`);
            // Continue to next model
          }
        }

        // If all models failed, use context data or fallback
        if (!modelSucceeded) {
          logger.error(`❌ ALL ${geminiModels.length} models failed. Last error: ${lastError?.message}`);
          botResponse = contextData || fallback.response;
          logger.info(`🔄 Using fallback response from intent handler`);
        }
      } catch (error) {
        logger.error('❌ Unexpected error in Gemini processing:', error);
        // Use fallback response or context data
        botResponse = contextData || fallback.response;
      }
    } else {
      // Fallback mode: Use handler response, context data, or default
      botResponse = contextData || fallback.response;
      if (geminiModels.length === 0) {
        logger.info(`🔄 Fallback Intent: ${intentName} (No Gemini models initialized)`);
      } else {
        logger.info(`🔄 Fallback Intent: ${intentName} (Rate limited - ${requestTimestamps.length}/${RATE_LIMIT_RPM} requests in window)`);
      }
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

    // Integrate with engagement tracking - award points for chat interactions
    let engagementTracked = false;
    let pointsAwarded = 0;

    try {
      const axios = require('axios');
      const API_GATEWAY_URL = process.env.API_GATEWAY_URL || 'http://api-gateway:8080';

      // Award 3 points per meaningful chat interaction (not for simple greetings)
      const meaningfulIntents = ['CommunityEvents', 'VolunteerConnect', 'MedicationReminder', 'WeatherInfo', 'GameRequest', 'SMSFamily'];
      if (meaningfulIntents.includes(intentName)) {
        pointsAwarded = 3;
      }

      // Only track points if there are points to award
      if (pointsAwarded > 0) {
        // Determine session based on time of day
        const hour = new Date().getHours();
        let sessionTime = 'afternoon';
        if (hour < 12) sessionTime = 'morning';
        else if (hour >= 18) sessionTime = 'evening';

        const trackingResponse = await axios.post(
          `${API_GATEWAY_URL}/add-task`,
          {
            userId: userId,
            type: 'ai_chat',
            points: pointsAwarded,
            session: sessionTime
          },
          {
            headers: {
              'Content-Type': 'application/json',
              'X-Service-Auth': process.env.SERVICE_AUTH_TOKEN || 'games-service-secret'
            },
            timeout: 5000
          }
        );

        if (trackingResponse.data) {
          engagementTracked = true;
          logger.info(`✓ Awarded ${pointsAwarded} points for ${intentName} chat interaction`);
        }
      }
    } catch (error) {
      logger.error(`✗ Failed to track chat engagement: ${error.message}`);
      // Don't fail the chat request if engagement tracking fails
    }

    const responseTime = Date.now() - startTime;
    logger.info(`⚡ Response time: ${responseTime}ms`);

    res.json({
      success: true,
      response: botResponse,
      intent: intentName,
      confidence,
      sessionId,
      mode: geminiModels.length > 0 ? 'gemini' : 'fallback',
      aiProvider: geminiModels.length > 0 ? 'Google Gemini AI' : 'Keyword-based',
      engagement: {
        tracked: engagementTracked,
        pointsAwarded: pointsAwarded
      }
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
    mode: geminiModels.length > 0 ? 'gemini' : 'fallback',
    aiProvider: geminiModels.length > 0 ? 'Google Gemini AI (Multiple Models)' : 'Keyword-based detection',
    model: geminiModels.length > 0 ? `${geminiModels.length} models available` : 'none',
    cloud: geminiModels.length > 0 ? 'Google AI Studio' : 'Local',
    cost: '100% FREE',
    rateLimit: geminiModels.length > 0 ? '10 requests/minute' : 'Unlimited',
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

// Start server
const PORT = process.env.PORT || 4015;

async function startServer() {
  try {
    app.listen(PORT, () => {
      logger.info(`🤖 AI Companion Service running on port ${PORT}`);
      if (geminiModels.length > 0) {
        logger.info(`🧠 Primary AI: ${geminiModels.length} Gemini models with automatic failover ✨`);
        logger.info(`� Models: ${AVAILABLE_MODELS.slice(0, 3).join(', ')}... (+${AVAILABLE_MODELS.length - 3} more)`);
      } else {
        logger.info(`🧠 AI Provider: Keyword-based fallback`);
      }
      logger.info(`📡 Messaging: HiveMQ MQTT at ${MQTT_BROKER}:${MQTT_PORT}`);
      logger.info(`📊 Metrics: http://localhost:${PORT}/metrics`);
      logger.info(`🏥 Health: http://localhost:${PORT}/health`);
      logger.info(`💰 Cost: 100% FREE forever`);
      if (geminiModels.length > 0) {
        logger.info(`⚡ Client Rate Limit: ${RATE_LIMIT_RPM} requests/minute (under 15 RPM FREE tier limit)`);
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
