# AI Companion Service 🤖💚

**Version**: 4.0.0 (Simplified)  
**AI Model**: Google Gemini 2.0 Flash (Experimental)  
**Cost**: 100% FREE Forever  
**Purpose**: Reduce social isolation among Singapore seniors through AI-powered companionship

---

## 🎯 Mission Statement

This service provides **simplified, focused support** for elderly citizens in Singapore:

- ✅ **Emotional Support** - Keyword-based loneliness detection with empathy
- ✅ **Family Connection** - Easy SMS messaging to loved ones
- ✅ **Community Engagement** - Discovery of local events by asking about their area
- ✅ **Companionship** - Volunteer visitor matching
- ✅ **Health Support** - Medication reminders
- ✅ **Weather Safety** - Singapore weather with outdoor safety advice
- ✅ **Entertainment** - Fun games and cognitive engagement

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- MongoDB running on port 27017
- Kafka running on port 9092
- Google AI Studio API key ([Get one here](https://makersuite.google.com/app/apikey))

### Installation

```bash
# Navigate to service directory
cd backend/services/ai-companion-service

# Install dependencies
npm install

# Configure environment variables
# Add GEMINI_API_KEY to your .env file

# Start with Docker Compose
docker compose up -d --build ai-companion
```

### Environment Variables

```bash
# Required
GEMINI_API_KEY=your_google_ai_studio_key_here

# Optional (with defaults)
PORT=4015
MONGO_URI=mongodb://mongo:27017/ai-companion
KAFKA_BROKER=kafka:9092
```

---

## 📡 API Endpoints

### POST `/chat`
Send a message to the AI companion.

**Request:**
```json
{
  "userId": "senior123",
  "message": "I feel lonely today"
}
```

**Response:**
```json
{
  "success": true,
  "response": "I'm so sorry to hear you're feeling lonely. I'm here with you. Would you like me to help you connect with someone nearby?",
  "intent": "SocialIsolation",
  "sentiment": "NEGATIVE",
  "sentimentScore": -4,
  "mode": "gemini",
  "aiProvider": "Google Gemini 2.0 Flash (Exp)"
}
```

### GET `/health`
Service health check.

**Response:**
```json
{
  "status": "healthy",
  "service": "ai-companion-service",
  "version": "4.0.0",
  "aiProvider": "Google Gemini 2.0 Flash (Experimental)",
  "mode": "gemini",
  "intents": 7
}
```

---

## 🧠 Intent System (Simplified - 7 Intents)

### 1. **SocialIsolation** - Loneliness Detection
- **Keywords**: lonely, alone, sad, depressed, isolated, miss, empty, hopeless
- **Severity Levels**: Critical, High, Moderate (based on keywords)
- **Action**: Publishes `social_isolation_alert` to Kafka with severity and recommendations
- **Gemini**: Provides empathetic, supportive responses
- **Example**: "I feel so lonely today, nobody visits me"

### 2. **SMSFamily** - Send Text Messages to Family
- **Keywords**: message/text/sms + family member name
- **Action**: Publishes `sms_family_request` to Kafka
- **Gemini**: Helps compose message naturally
- **Example**: "Can you message my daughter that I miss her?"

### 3. **CommunityEvents** - Find Local Activities
- **Keywords**: event, activity, community, group, club, class
- **Action**: Publishes `community_events_request` with `needsLocationInfo: true`
- **Gemini**: Asks about their neighborhood/area first
- **Example**: "Are there any tai chi classes near me?"

### 4. **VolunteerConnect** - Match with Volunteer Visitors
- **Keywords**: volunteer, visitor, companion, befriend
- **Action**: Publishes `volunteer_connect_request` to Kafka
- **Gemini**: Explains volunteer program warmly
- **Example**: "Can someone visit me this week?"

### 5. **MedicationReminder** - Track Medications
- **Keywords**: medication, medicine, pills, prescription
- **Action**: Publishes `medication_schedule_request` to Kafka
- **Gemini**: Helps explain medication schedule
- **Example**: "What medications do I need to take today?"

### 6. **WeatherInfo** - Singapore Weather with Safety Advice
- **Keywords**: weather, rain, sunny, hot, go out
- **Action**: Publishes `weather_info_request` for Singapore with `purpose: elderly_outdoor_safety`
- **Gemini**: Specifically advises if elderly should go out based on weather
- **Example**: "Is it safe to go out today? What's the weather like?"

### 7. **GameRequest** - Fun and Entertainment
- **Keywords**: game, play, trivia, fun, bored
- **Action**: Publishes `game_session_requested` to Kafka
- **Gemini**: Suggests appropriate games
- **Example**: "I'm bored, let's play a game!"

### Default - General Conversation
- Catches all other messages
- Gemini provides warm, helpful conversation
- No specific intent action needed

---

## 🔄 Event Publishing

All intents publish structured events to Kafka for downstream processing:

### Kafka Topics
- **Topic**: `notification.events`
- **Format**: JSON
- **Consumers**: notification-service, sms-service

### Example Event - Social Isolation Alert
```json
{
  "type": "social_isolation_alert",
  "userId": "senior123",
  "severity": "high",
  "sentimentScore": -5,
  "detectedKeywords": ["lonely", "sad"],
  "keywordSeverity": "high",
  "recommendations": [
    "Schedule video call with family within 24 hours",
    "Connect with volunteer visitor ASAP",
    "Arrange community activity participation"
  ],
  "requiresFollowUp": true,
  "urgentAction": false,
  "timestamp": "2025-11-07T12:00:00.000Z"
}
```

### Example Event - SMS Family Request
```json
{
  "type": "sms_family_request",
  "userId": "senior123",
  "recipient": "daughter",
  "messageContent": "I miss you, please visit soon",
  "originalRequest": "Tell my daughter I miss her",
  "timestamp": "2025-11-07T12:00:00.000Z"
}
```

---

## 🤖 Google Gemini AI Integration

### Why Gemini 2.0 Flash?

- ✅ **100% FREE** - No API costs, forever
- ✅ **Fast Responses** - Average 1-2 seconds
- ✅ **Natural Language** - Context-aware, empathetic
- ✅ **Singapore-Aware** - Understands local context
- ✅ **Rate Limit** - 15 requests/minute

### Context-Aware Prompting

The system provides Gemini with specific instructions for each intent:

```javascript
const prompt = `You are a warm, caring AI companion for senior citizens in Singapore.
Your mission is to reduce social isolation and improve wellbeing through:

**Core Services (7 intents):**
1. Loneliness Support - Detect keywords and provide emotional support
2. SMS Family - Help seniors send text messages to family
3. Community Events - Ask about their area to find nearby activities
4. Volunteer Connection - Connect with friendly volunteers
5. Medication Reminders - Help track medication schedules
6. Weather Advice - Singapore weather with safety advice for going outside
7. Fun Games - Entertainment and cognitive engagement

**For weather**: Specifically advise if elderly should go out based on Singapore weather
**For community events**: Ask about their neighborhood/area first
**For loneliness**: Be extra compassionate and supportive`;
```

---

## 🧪 Testing

### Test Social Isolation (Keyword Detection)

```bash
curl -X POST http://localhost:4015/chat \
  -H "Content-Type: application/json" \
  -d '{"userId":"test","message":"I feel very lonely and sad today"}'
```

**Expected**: Detects "lonely" and "sad" keywords, severity: high

### Test SMS Family

```powershell
Invoke-RestMethod -Uri "http://localhost:4015/chat" `
  -Method POST `
  -ContentType "application/json" `
  -Body '{"userId":"test","message":"Can you message my daughter that I miss her?"}'
```

### Test Community Events (Should ask for area)

```bash
curl -X POST http://localhost:4015/chat \
  -H "Content-Type: application/json" \
  -d '{"userId":"test","message":"Are there any activities near me?"}'
```

**Expected**: Gemini asks "Where do you live?" or "What's your area?"

### Test Weather (Should advise if safe to go out)

```bash
curl -X POST http://localhost:4015/chat \
  -H "Content-Type: application/json" \
  -d '{"userId":"test","message":"What's the weather like? Can I go out?"}'
```

**Expected**: Gemini provides weather info + safety advice for elderly

---

## 📊 Key Changes from v3.0

### ❌ Removed (6 intents):
- EmergencyHelp
- TransportHelp
- VideoCallFamily
- TechHelp
- CulturalSupport
- Old CallFamily (replaced with SMSFamily)

### ✅ Simplified to 7 Core Intents:
1. SocialIsolation (enhanced keyword detection)
2. SMSFamily (text messaging)
3. CommunityEvents (asks for area)
4. VolunteerConnect
5. MedicationReminder
6. WeatherInfo (Singapore-specific safety advice)
7. GameRequest

### 🔧 Enhanced Features:
- **Loneliness detection**: 3-tier severity system with specific keywords
- **Weather**: AI specifically advises if elderly should go outside
- **Community events**: AI asks about location/area first
- **SMS Family**: Dedicated intent (no longer mixed with calling)

---

## 📁 Project Structure

```
ai-companion-service/
├── src/
│   ├── index.js                 # Main service (simplified)
│   ├── intents/
│   │   ├── loneliness.js        # Keyword-based loneliness detection
│   │   ├── smsFamily.js         # SMS to family members
│   │   ├── communityEvents.js   # Asks for area/location
│   │   ├── volunteerConnect.js  # Volunteer matching
│   │   ├── medication.js        # Medication reminders
│   │   ├── weather.js           # Weather with safety advice
│   │   └── game.js              # Entertainment
├── package.json
├── Dockerfile
└── README.md                    # This file
```

---

## 🌟 Architecture

```
┌────────────────────────────────────────────────┐
│         AI Companion Service (v4.0)             │
│                                                  │
│  ┌──────────┐      ┌──────────┐      ┌───────┐│
│  │ Express  │ ───► │ Gemini   │ ───► │ 7     ││
│  │ API      │      │ AI       │      │Intent ││
│  │          │      │ (2.0)    │      │Handle ││
│  └──────────┘      └──────────┘      └───────┘│
│         │                                  │    │
│         ▼                                  ▼    │
│  ┌──────────┐                      ┌──────────┐│
│  │Sentiment │                      │  Kafka   ││
│  │Analysis  │                      │ Events   ││
│  └──────────┘                      └──────────┘│
└────────────────────────────────────────────────┘
                        │
                        ▼
            ┌───────────────────────┐
            │  notification.events  │
            └───────────────────────┘
                        │
            ┌───────────┴────────────┐
            ▼                        ▼
    ┌──────────────┐      ┌──────────────┐
    │Notification  │      │ SMS Service  │
    │   Service    │      │              │
    └──────────────┘      └──────────────┘
```

---

## 📝 Summary

**Version 4.0** is a **streamlined, focused** AI companion service:

- ✅ **7 core intents** (down from 13)
- ✅ **Keyword-based loneliness detection** with 3 severity levels
- ✅ **Weather with safety advice** specifically for elderly
- ✅ **Community events ask for location** first
- ✅ **100% FREE** Google Gemini 2.0 Flash AI
- ✅ **Simplified codebase** for easier maintenance

**No Dialogflow, no AWS Lex, no complex dependencies - just pure Gemini AI with focused senior care support! 💚**

---

**Made with 💚 for Singapore Seniors**
