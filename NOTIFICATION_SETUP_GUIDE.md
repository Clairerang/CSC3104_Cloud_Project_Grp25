# 🚀 Quick Setup Guide - Notification Microservices

**For Demo & Presentation** | Setup Time: ~15 minutes

---

## 📦 What You Get

- ✅ **Push Notifications** (Firebase)
- ✅ **AI Chatbot** (Google Gemini with 12 models)
- ✅ **SMS Notifications** (Mock mode - logs to console)
- ✅ **Email Notifications** (Mock mode - logs to console)
- ✅ **gRPC + MQTT Architecture**
- ✅ **Browser Testing UI**

---

## ⚡ 3-Step Setup (Minimum Config)

### Step 1: Get API Keys (5 min)

#### Google Gemini AI (Required for chatbot)
1. Visit https://makersuite.google.com/app/apikey
2. Click "Create API Key"
3. Copy the key

#### Firebase (Required for push notifications)
1. Go to https://console.firebase.google.com
2. Create new project (or use existing)
3. Click ⚙️ Settings > Project Settings
4. Under "Your apps", click Web app icon
5. Copy the config values

### Step 2: Configure Environment (3 min)

Edit `backend/config/secrets/.env`:

```bash
# ===== REQUIRED FOR DEMO =====

# Google Gemini AI (for chatbot)
GEMINI_API_KEY=paste-your-key-here

# Firebase (for push notifications)
FIREBASE_API_KEY=paste-your-firebase-api-key
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_MESSAGING_SENDER_ID=your-sender-id
FIREBASE_APP_ID=your-app-id

# ===== ALREADY CONFIGURED =====
# These are set to mock mode - no action needed
SMS_ADAPTER=mock
MONGODB_URI=mongodb://mongodb:27017/senior_care
```

**Optional:** Download Firebase service account JSON
1. In Firebase Console: Settings > Service Accounts
2. Click "Generate new private key"
3. Save as `backend/config/secrets/firebase-sa.json`

### Step 3: Start Services (5 min)

```bash
# Build all services (first time only)
docker-compose build

# Start everything
docker-compose up -d

# Check status (should show 10 services running)
docker-compose ps

# View logs
docker-compose logs -f notification-service
docker-compose logs -f ai-companion-service
```

---

## 🎯 Test Your Setup

### 1. Open Testing UI
Visit: http://localhost:4002/testing-notification/

Features:
- AI chat widget
- Push notification tester
- Phone verification (OTP)
- SMS/Email simulators

### 2. Test AI Chatbot

```bash
curl -X POST http://localhost:4015/chat \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "demo-user",
    "message": "Hi! Tell me about the weather today."
  }'
```

Expected response: AI-generated weather information

### 3. Test Push Notifications

```bash
# Save device token
curl -X POST http://localhost:4020/save-token \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "demo-user",
    "token": "test-fcm-token-123",
    "platform": "web"
  }'

# Send push
curl -X POST http://localhost:4020/send-push \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "demo-user",
    "title": "Demo Notification",
    "body": "Your notification system is working!"
  }'
```

### 4. Check MQTT Messages

Visit HiveMQ Dashboard: http://localhost:9000

- View active subscriptions
- Monitor message flow
- See real-time events

---

## 📊 Service URLs

| Service | URL | Purpose |
|---------|-----|---------|
| **Testing UI** | http://localhost:4002/testing-notification/ | Interactive demo interface |
| **AI Chatbot** | http://localhost:4015/chat | POST to chat with AI |
| **Push Notifications** | http://localhost:4020 | FCM push service |
| **Notification API** | http://localhost:4002 | Main notification gateway |
| **MQTT Dashboard** | http://localhost:9000 | Monitor message broker |
| **Frontend App** | http://localhost:3000 | Main application |

---

## 🤖 AI Chatbot Intents

Try these messages with the AI:

1. **SMS Family**
   - "Send a message to my son"
   - "Call my daughter" (triggers SMS)

2. **Medication**
   - "What medicines should I take today?"
   - "Remind me about my medication"

3. **Community Events**
   - "What events are happening nearby?"
   - "Find community centers near me"

4. **Volunteer Connect**
   - "I want to connect with a volunteer"
   - "Help me find a Lions Befrienders volunteer"

5. **Weather**
   - "What's the weather today?"
   - "Is it going to rain?"

6. **Games**
   - "I want to play a game"
   - "Suggest some activities"

---

## 🔧 Common Issues & Fixes

### Issue: "Container exited with code 1"

**Solution:**
```bash
# Check logs to see the error
docker-compose logs [service-name]

# Common causes:
# 1. Missing .env file
ls backend/config/secrets/.env

# 2. MongoDB not ready
docker-compose restart notification-service

# 3. Invalid API key
# Edit .env and fix the GEMINI_API_KEY
```

### Issue: "Port already in use"

**Solution:**
```bash
# Find what's using the port
netstat -ano | findstr :4002  # Windows
lsof -i :4002                 # Mac/Linux

# Change port in docker-compose.yml or kill the process
```

### Issue: Push notifications not sending

**Cause:** Firebase not configured properly

**Solution:**
1. Double-check Firebase config in .env
2. Download service account JSON file
3. Place at: `backend/config/secrets/firebase-sa.json`
4. Restart: `docker-compose restart push-notification-service`

### Issue: AI chatbot returns error

**Cause:** Invalid Gemini API key or rate limit exceeded

**Solution:**
1. Verify API key in .env is correct
2. Free tier limit: 15 requests/minute
3. System will failover to backup models automatically
4. Check logs: `docker-compose logs ai-companion-service`

---

## 🎬 Demo Script for Presentation

### Demo 1: AI Chatbot (2 min)
1. Open testing UI: http://localhost:4002/testing-notification/
2. Click AI chat widget
3. Type: "What's the weather like today?"
4. Show Gemini AI response
5. Type: "Find community events near me"
6. Show Google Places API integration

### Demo 2: Push Notifications (1 min)
1. In testing UI, go to "Push Notifications" tab
2. Enter user ID: "demo-senior-1"
3. Enter message: "Time for your daily check-in!"
4. Click "Send Push"
5. Show success message

### Demo 3: MQTT Message Flow (1 min)
1. Open HiveMQ Dashboard: http://localhost:9000
2. Show subscribed topics
3. Send test message via testing UI
4. Show message appearing in MQTT dashboard

### Demo 4: Multi-Service Architecture (1 min)
1. Run: `docker-compose ps`
2. Show 10 running services
3. Explain microservices architecture
4. Highlight MQTT + gRPC communication

---

## 📈 Production Readiness Checklist

For moving beyond demo:

- [ ] Replace mock SMS with real Twilio
  - Get Twilio account: https://www.twilio.com/try-twilio
  - Set `SMS_ADAPTER=twilio` in .env
  - Add real credentials

- [ ] Configure real email service
  - Get Gmail App Password
  - Update EMAIL_USER and EMAIL_PASS
  - Test email delivery

- [ ] Add authentication to notification endpoints
  - JWT middleware
  - API key validation

- [ ] Enable MongoDB authentication
  - Create admin user
  - Update connection strings

- [ ] Enable TLS for MQTT
  - Generate certificates
  - Use port 8883 instead of 1883

- [ ] Set up monitoring
  - Prometheus + Grafana
  - Alert rules for failures

- [ ] Implement backups
  - MongoDB backup strategy
  - Configuration backups

---

## 📞 Support

**Issues?** Check `INTEGRATION_NOTES.md` for detailed troubleshooting

**Questions?** Contact the team or create an issue in the repository

**Documentation:**
- Full Integration Notes: `INTEGRATION_NOTES.md`
- Docker Compose Config: `docker-compose.yml`
- Environment Template: `backend/config/secrets/.env.example`

---

**Last Updated:** November 13, 2025
**Status:** ✅ Ready for Demo

Happy demoing! 🎉
