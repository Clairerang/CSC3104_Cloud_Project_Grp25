# ElderCare Connect - Backend Services

> **MQTT-based microservices platform** for elderly care notifications, AI companionship, and real-time communication.

## 📁 Current Architecture

```
backend/
├── services/
│   ├── notification-service/         # API Gateway & Event Hub (Port 4002)
│   ├── ai-companion-service/         # AI Chat with Gemini (Port 4015)
│   ├── sms-service/                  # SMS & OTP Verification (Port 4004)
│   ├── email-service/                # Email Notifications (Port 4003)
│   └── push-notification-service/    # Firebase Push (Port 4020)
│
├── shared/
│   └── testing-ui/                   # Browser testing UI
│       ├── index.html                # Main test interface with AI chat
│       ├── ai-companion-chat.html    # Standalone AI chat UI
│       ├── dashboard.html            # Push notification dashboard
│       └── complete-flow.html        # Full workflow testing
│
├── docker-compose.yml                # Service orchestration
└── README.md                         # This file
```

## 🏗️ System Architecture

### Message Flow (MQTT-based)

```
Client → Notification Service → MQTT Broker (HiveMQ) → Service Subscribers → External APIs
                                       ↓
                                   MongoDB (Persistence)
```

### Active Services

| Service | Port | Purpose | Technology |
|---------|------|---------|------------|
| **Notification Service** | 4002 | API Gateway & Event Publisher | Node.js, Express, MQTT, gRPC |
| **AI Companion** | 4015 | Conversational AI (6 Intents) | Node.js, Google Gemini 2.0 Flash |
| **SMS Service** | 4004 | SMS Delivery & OTP Verification | Node.js, Twilio, Twilio Verify |
| **Email Service** | 4003 | Email Delivery | Node.js, Nodemailer |
| **Push Notification** | 4020 | Mobile Push Notifications | Node.js, Firebase FCM v1 |
| **HiveMQ** | 1883/8080 | MQTT Message Broker | MQTT 3.1.1, QoS 1 |
| **MongoDB** | 27017 | Database | NoSQL Document Store |

## 🚀 Quick Start

### Prerequisites

- **Docker Desktop** 24.0+ or Docker Engine
- **Git** 2.30+
- **External Accounts**:
  - [Twilio](https://www.twilio.com/try-twilio) - SMS/OTP
  - [Gmail SMTP](https://myaccount.google.com/apppasswords) - Email
  - [Firebase](https://console.firebase.google.com/) - Push notifications
  - [Google AI Studio](https://ai.google.dev/) - Gemini API

### Setup & Start

```powershell
# 1. Clone repository
git clone <repo-url>
cd backend

# 2. Create environment file
Copy-Item .env.example .env
Need .env just message jerald

# 3. Edit .env with your credentials
notepad .env

# 4. Start all services
docker compose up -d

# 5. Check status
docker compose ps

# 6. View logs
docker compose logs -f
```

### Access Points

- **Testing UI**: http://localhost:4002/testing-notification/
- **Notification Service API**: http://localhost:4002
- **AI Companion API**: http://localhost:4015
- **SMS Service**: http://localhost:4004
- **Email Service**: http://localhost:4003
- **Push Notification**: http://localhost:4020
- **HiveMQ Dashboard**: http://localhost:8080
- **MongoDB**: mongodb://localhost:27017

## 🔐 Environment Configuration

Create `.env` file in backend root:

```env
# ============================================
# TWILIO SMS SERVICE
# ============================================
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=xxxxxxxxxxxxxxxxxxxxxxx
TWILIO_FROM=+1234567890
TWILIO_VERIFY_SERVICE_SID=VAxxxxxxxxxxxxx

# ============================================
# EMAIL SERVICE (Gmail)
# ============================================
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=xxxx xxxx xxxx xxxx    # App Password
EMAIL_FROM=your-email@gmail.com

# ============================================
# FIREBASE PUSH NOTIFICATIONS
# ============================================
FIREBASE_API_KEY=AIzaSyXXXXXXXXXXXXXXXXXXXXX
FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_STORAGE_BUCKET=your-project.appspot.com
FIREBASE_MESSAGING_SENDER_ID=123456789012
FIREBASE_APP_ID=1:123456:web:abc123
FIREBASE_VAPID_KEY=BXXXXXXXXXXXXXXXXXXXXXXXXXX

# Also download firebase-sa.json and place in backend/

# ============================================
# GOOGLE GEMINI AI (AI Companion Service)
# ============================================
GEMINI_API_KEY=AIzaSyXXXXXXXXXXXXXXXXXXXXX
# Get your free API key: https://ai.google.dev/
# Model: gemini-2.0-flash-exp (FREE tier, 15 req/min)

# ============================================
# DATABASE & MESSAGING (Auto-configured)
# ============================================
MONGO_URI=mongodb://mongo:27017/notification
MQTT_BROKER_URL=mqtt://hivemq:1883
```

### Quick Setup Links

1. **Twilio**: https://console.twilio.com/ → Get Account SID, Auth Token, Phone Number, Verify Service SID
2. **Gmail App Password**: https://myaccount.google.com/apppasswords → Generate 16-char password
3. **Firebase**: https://console.firebase.google.com/ → Create project, enable FCM, download service account JSON
4. **Google Gemini AI**: https://ai.google.dev/ → Get free API key (15 requests/min, unlimited for personal use)

## 📡 API Reference

### Notification Service (4002) - Main Gateway

#### Send Notification Event

```bash
POST /events
Content-Type: application/json

{
  "type": "sms",
  "userId": "user123",
  "message": "Your medication reminder",
  "phoneNumber": "+6512345678"
}
```

#### Health Check

```bash
GET /health
# Returns: { status: "healthy", timestamp: "..." }
```

### AI Companion (4015) - Conversational AI

#### Chat with AI

```bash
POST /chat
Content-Type: application/json

{
  "userId": "user123",
  "message": "What community events are happening today?"
}

# Response includes:
# - AI-powered natural language responses
# - Intent detection (6 intents)
# - Context-aware suggestions
# - Real-time information
```

**Supported Intents**:
1. 🏠 **Call Family** - Request to SMS family members
2. 💊 **Medication Reminder** - Check today's medications
3. 🎉 **Community Events** - Browse local activities and events
4. 🤝 **Volunteer Connect** - Connect with Lions Befrienders volunteers
5. 🌤️ **Weather Info** - Get weather updates and safety advice
6. 🎮 **Play Game** - Interactive games and activities

**Features**:
- ✅ **Google Gemini 2.0 Flash** - Latest AI model (FREE tier)
- ✅ **Natural Conversations** - Context-aware responses
- ✅ **No Sentiment Analysis** - Simplified, focused on actionable help
- ✅ **MongoDB Integration** - Conversation history storage
- ✅ **MQTT Publishing** - Triggers real notifications

#### Get Chat History

```bash
GET /history/:userId
# Returns conversation history with timestamps and intents
```

### SMS Service (4004)

#### Send SMS

```bash
POST /send-sms
{
  "to": "+6512345678",
  "message": "Test message"
}
```

#### OTP Verification

```bash
# Send OTP
POST /verify/send
{
  "to": "+6512345678",
  "channel": "sms"
}

# Verify OTP
POST /verify/check
{
  "to": "+6512345678",
  "code": "123456"
}
```

### Email Service (4003)

```bash
POST /send-email
{
  "to": "recipient@example.com",
  "subject": "Test Subject",
  "body": "Test message"
}
```

**Features**:
- ✅ Gmail SMTP integration
- ✅ Daily check-in email notifications
- ✅ HTML email templates
- ✅ MQTT consumer for `daily_login` events

### Push Notification (4020)

```bash
# Save device token
POST /save-token
{
  "userId": "user123",
  "token": "fcm_device_token_here"
}

# Send push notification
POST /send-push
{
  "userId": "user123",
  "title": "Notification Title",
  "body": "Notification message"
}
```

## 🧪 Testing

### Browser Testing UI

Visit: **http://localhost:4002/testing-notification/**

Features:
- ✅ **Daily Check-In Interface** - Test senior daily login flow
- ✅ **Phone Verification** - Test Twilio OTP verification
- ✅ **AI Chat Widget** - Floating chat button with 6 quick actions
  - Call Family
  - Medication for the day
  - Community Events
  - Volunteer Connect (Lions Befrienders)
  - Weather
  - Play Game
- ✅ **Push Notifications** - Test Firebase FCM
- ✅ **SMS & Email** - Send test messages
- ✅ **Real-time Logs** - View service responses

**New Features**:
- 🎨 Beautifully formatted Lions Befrienders volunteer info with gradient styling
- 📏 Taller chat window (650px) for better conversation view
- 🤖 AI responses render as HTML for rich formatting
- 🔔 Floating purple AI chat button (bottom-right)

### PowerShell Testing

```powershell
# Test AI Companion
$body = @{
  userId = "test123"
  message = "What's the weather in Singapore?"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:4015/chat" `
  -Method POST `
  -ContentType "application/json" `
  -Body $body

# Test SMS
$body = @{
  to = "+6512345678"
  message = "Test SMS from ElderCare"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:4004/send-sms" `
  -Method POST `
  -ContentType "application/json" `
  -Body $body

# Test Notification Service
$body = @{
  type = "sms"
  userId = "user123"
  message = "Medication reminder"
  phoneNumber = "+6512345678"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:4002/events" `
  -Method POST `
  -ContentType "application/json" `
  -Body $body
```

### Health Checks

```powershell
# Check all services
docker compose ps

# Individual health checks
Invoke-RestMethod http://localhost:4002/health  # Notification Service
Invoke-RestMethod http://localhost:4015/health  # AI Companion
Invoke-RestMethod http://localhost:4004/health  # SMS Service
Invoke-RestMethod http://localhost:4003/health  # Email Service
Invoke-RestMethod http://localhost:4020/health  # Push Notification
```

## 🔧 Development

### View Logs

```powershell
# All services
docker compose logs -f

# Specific service
docker compose logs -f ai-companion
docker compose logs -f sms-service

# Last 50 lines
docker logs ai-companion --tail 50
```

### Restart Services

```powershell
# Restart all
docker compose restart

# Restart specific service
docker compose restart ai-companion

# Rebuild after code changes (important for dependency updates)
docker compose up -d --build ai-companion
```

### Database Access

```powershell
# MongoDB shell
docker exec -it mongo mongosh notification

# View collections
show collections

# Query data
db.conversations.find().limit(5).pretty()
db.notifications.find().limit(5).pretty()
```

### MQTT Monitoring

```powershell
# HiveMQ Dashboard
# Visit: http://localhost:8080

# View MQTT logs
docker logs hivemq --tail 100

# Check MQTT connections
docker exec hivemq cat /opt/hivemq/log/hivemq.log
```

## 🐛 Troubleshooting

### Services Not Starting

```powershell
# Check logs
docker compose logs <service-name>

# Common issues:
# 1. Port conflicts
netstat -ano | findstr "4002"
Stop-Process -Id <PID>

# 2. Missing environment variables
docker exec <service-name> env | Select-String "TWILIO"

# 3. MongoDB not ready
docker logs mongo --tail 50
docker restart mongo

# 4. MQTT broker not ready
docker logs hivemq --tail 50
docker restart hivemq
```

### AI Companion Issues

```powershell
# Check Gemini API key
docker exec ai-companion env | Select-String "GEMINI"

# View AI logs
docker logs ai-companion --tail 100

# Verify Gemini is initialized (look for this in logs)
# ✅ Google Gemini AI initialized (gemini-2.0-flash-exp)
# 💡 Mode: GEMINI (Powered by Google AI Studio)

# Common errors:
# - "API key not found" → Check GEMINI_API_KEY in .env file
# - "Fallback mode" → API key not loaded, rebuild container: docker compose up -d --build ai-companion
# - "Rate limit exceeded" → Free tier: 15 req/min, wait 1 minute
# - Missing dependencies → Ensure package.json is correct, rebuild container
```

**Important**: After updating .env file, you must **rebuild** the container, not just restart:
```powershell
# Wrong (won't pick up new env vars if dependencies changed)
docker compose restart ai-companion

# Correct (rebuilds with new env vars and dependencies)
docker compose up -d --build ai-companion
```

### SMS/Email Not Sending

```powershell
# Check Twilio credentials
docker exec sms-service env | Select-String "TWILIO"

# Check Gmail credentials
docker exec email-service env | Select-String "EMAIL"

# Common errors:
# - "Invalid credentials" → Verify API keys
# - "Rate limit" → Wait or upgrade account
# - "Unverified phone" (Twilio trial) → Verify phone in console
```

### MQTT Message Not Received

```powershell
# Check MQTT broker
docker logs hivemq --tail 50

# Check if services are subscribed to topics
docker logs sms-service | Select-String "MQTT"
docker logs email-service | Select-String "MQTT"
docker logs ai-companion | Select-String "MQTT"

# Restart broker and services
docker restart hivemq
Start-Sleep 5
docker restart sms-service email-service push-notification ai-companion
```

## 📊 Architecture Decisions

### Recent Changes (November 2025)

✅ **Removed Sentiment Analysis**:
- Simplified AI companion to focus on actionable help
- Removed `sentiment` npm package dependency
- Removed sentiment tracking from conversations
- Reduced complexity and improved response times

✅ **Removed Loneliness Intent**:
- Merged into general conversation flow
- Volunteer Connect button provides direct help
- Streamlined from 7 to 6 core intents

✅ **Enhanced UI**:
- Taller chat window (650px) for better UX
- Rich HTML formatting for Lions Befrienders info
- Floating AI chat button with modern gradient design
- Quick action buttons for common tasks

✅ **Improved File Structure**:
- Moved testing UI to `shared/testing-ui/`
- Single source of truth for HTML files
- Docker volume mounts for instant updates (no rebuild needed)

### Why MQTT instead of Kafka?

✅ **Benefits**:
- **Simpler**: No Zookeeper, easier to manage
- **Lightweight**: Lower resource usage
- **QoS 1**: Built-in at-least-once delivery
- **Persistent sessions**: Messages retained for offline clients
- **Pub/Sub**: Native topic-based routing

### Why removed Outbox Pattern?

✅ **Simplified**:
- Direct MQTT publishing with QoS 1 guarantees delivery
- MQTT broker handles persistence and retries
- Reduced complexity (removed 90+ lines of code)
- Fewer failure points
- Better for real-time communication

### MongoDB Collections

The system uses 4 main collections:

1. **users** - Senior user profiles
2. **checkins** - Daily check-in records
3. **devicetokens** - FCM tokens for push notifications
4. **conversations** - AI chat history (removed sentiment fields)
5. **medications** - Medication tracking (new schema)

## 🔒 Security Considerations

- ✅ **Environment Variables**: All secrets in `.env` file (never commit!)
- ✅ **Firebase Service Account**: JSON file excluded from git
- ✅ **MQTT QoS 1**: At-least-once delivery guarantee
- ✅ **MongoDB**: No authentication in dev (add for production)
- ✅ **API Keys**: Validated on container startup
- ⚠️ **CORS**: Currently open for testing (restrict in production)

## 🚀 Production Deployment

### Docker Swarm

```bash
docker stack deploy -c docker-compose.yml eldercare
```

### Kubernetes

```bash
# Generate K8s manifests
kompose convert -f docker-compose.yml

# Deploy
kubectl apply -f k8s/
```

### Environment Variables for Production

```bash
# Use Docker secrets
echo "ACxxx" | docker secret create twilio_sid -
echo "xxx" | docker secret create twilio_token -

# Or use Kubernetes secrets
kubectl create secret generic twilio-creds \
  --from-literal=sid=ACxxx \
  --from-literal=token=xxx
```

## 📚 Additional Documentation

- [AI Companion Service](services/ai-companion-service/README.md) - Gemini AI integration
- [Notification Service API](services/notification-service/README.md) - Core event hub
- [SMS Service](services/sms-service/README.md) - Twilio integration
- [Testing Guide](shared/testing-ui/README.md) - UI testing documentation

## 🔗 External Resources

- [MQTT Protocol](https://mqtt.org/)
- [HiveMQ Documentation](https://www.hivemq.com/docs/)
- [Google Gemini API](https://ai.google.dev/gemini-api/docs) - Get free API key
- [Twilio SMS](https://www.twilio.com/docs/sms)
- [Twilio Verify](https://www.twilio.com/docs/verify/api) - OTP verification
- [Firebase FCM](https://firebase.google.com/docs/cloud-messaging)
- [Lions Befrienders](https://www.lionsbefrienders.org.sg/) - Senior volunteer services

## 🎯 Key Features Summary

### AI Companion
- ✅ Google Gemini 2.0 Flash (FREE tier)
- ✅ 6 intent detection system
- ✅ Natural language conversations
- ✅ Context-aware responses
- ✅ MongoDB conversation history
- ✅ MQTT event publishing

### Notification System
- ✅ MQTT-based event distribution
- ✅ Multi-channel delivery (SMS, Email, Push)
- ✅ OTP verification via Twilio Verify
- ✅ Firebase FCM v1 API
- ✅ Real-time dashboard updates
- ✅ Persistent message queuing

### Testing Interface
- ✅ Floating AI chat widget
- ✅ Daily check-in workflow
- ✅ Phone verification UI
- ✅ Quick action buttons
- ✅ Rich HTML formatting
- ✅ Real-time service logs

---

**Last Updated**: November 11, 2025  
**Architecture**: MQTT-based Microservices  
**AI Model**: Google Gemini 2.0 Flash (FREE)  
**Status**: Production Ready ✅  
**Team**: CSC3104 Cloud Project Group 25

