# ElderCare Connect - Backend Services

> **MQTT-based microservices platform** for elderly care notifications, AI companionship, and real-time communication.

## 📁 Current Architecture

```
backend/
├── services/
│   ├── event-dispatcher-service/     # API Gateway (Port 4002)
│   ├── ai-companion-service/         # AI Chat with Gemini (Port 4015)
│   ├── sms-dispatcher-service/       # SMS Notifications (Port 4004)
│   ├── email-dispatcher-service/     # Email Notifications (Port 4003)
│   └── push-notification-service/    # Firebase Push (Port 4020)
│
├── testing-notification/             # Browser testing UI
│   ├── index.html                    # Main test interface
│   └── dashboard.html                # Push notification dashboard
│
├── docker-compose.yml                # Service orchestration
└── README.md                         # This file
```

## 🏗️ System Architecture

### Message Flow (MQTT-based)

```
Client → Event Dispatcher → MQTT Broker (HiveMQ) → Dispatchers → External APIs
                                  ↓
                              MongoDB (Persistence)
```

### Active Services

| Service | Port | Purpose | Technology |
|---------|------|---------|------------|
| **Event Dispatcher** | 4002 | API Gateway & Event Publisher | Node.js, Express, MQTT |
| **AI Companion** | 4015 | Conversational AI | Node.js, Google Gemini 2.0 |
| **SMS Dispatcher** | 4004 | SMS Delivery | Node.js, Twilio |
| **Email Dispatcher** | 4003 | Email Delivery | Node.js, Nodemailer |
| **Push Notification** | 4020 | Mobile Push | Node.js, Firebase FCM |
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
- **Event Dispatcher API**: http://localhost:4002
- **AI Companion API**: http://localhost:4015
- **SMS Dispatcher**: http://localhost:4004
- **Email Dispatcher**: http://localhost:4003
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
# GOOGLE AI STUDIO (Gemini)
# ============================================
GOOGLE_AI_API_KEY=AIzaSyXXXXXXXXXXXXXXXXXXXXX

# ============================================
# DATABASE & MESSAGING (Auto-configured)
# ============================================
MONGO_URI=mongodb://mongo:27017/notification
MQTT_BROKER_URL=mqtt://hivemq:1883
```

### Quick Setup Links

1. **Twilio**: https://console.twilio.com/ → Get Account SID, Auth Token, Phone Number
2. **Gmail App Password**: https://myaccount.google.com/apppasswords → Generate 16-char password
3. **Firebase**: https://console.firebase.google.com/ → Create project, enable FCM, download service account
4. **Google AI**: https://ai.google.dev/ → Get API key for Gemini

## 📡 API Reference

### Event Dispatcher (4002) - Main Gateway

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
  "message": "What community events in Hougang?"
}

# Response includes:
# - Real Singapore community events
# - Weather forecasts with elderly safety advice
# - Sentiment analysis
# - Intent detection
```

**Features**:
- ✅ **Real Data**: Singapore community events, weather
- ✅ **Location-Aware**: Detects neighborhoods (Hougang, Tampines, etc.)
- ✅ **Time-Aware**: Morning/afternoon/evening recommendations
- ✅ **7 Intents**: Loneliness, SMS Family, Community Events, Weather, Medication, Volunteers, Games

#### Get Chat History

```bash
GET /history/:userId
# Returns conversation history with sentiment analysis
```

### SMS Dispatcher (4004)

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

### Email Dispatcher (4003)

```bash
POST /send-email
{
  "to": "recipient@example.com",
  "subject": "Test Subject",
  "body": "Test message"
}
```

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
- ✅ **SMS Test**: Send test SMS to any number
- ✅ **Email Test**: Send test emails
- ✅ **Push Test**: Test Firebase notifications
- ✅ **AI Chat**: Interactive AI companion testing

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

# Test Event Dispatcher
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
Invoke-RestMethod http://localhost:4002/health  # Event Dispatcher
Invoke-RestMethod http://localhost:4015/health  # AI Companion
Invoke-RestMethod http://localhost:4004/health  # SMS
Invoke-RestMethod http://localhost:4003/health  # Email
Invoke-RestMethod http://localhost:4020/health  # Push
```

## 🔧 Development

### View Logs

```powershell
# All services
docker compose logs -f

# Specific service
docker compose logs -f ai-companion
docker compose logs -f sms-dispatcher

# Last 50 lines
docker logs ai-companion --tail 50
```

### Restart Services

```powershell
# Restart all
docker compose restart

# Restart specific service
docker compose restart ai-companion

# Rebuild after code changes
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
docker exec ai-companion env | Select-String "GOOGLE_AI"

# View AI logs
docker logs ai-companion --tail 100

# Common errors:
# - "API key not found" → Check GOOGLE_AI_API_KEY in .env
# - "Rate limit exceeded" → Wait or upgrade API quota
# - "publishEvent is not a function" → Fixed in latest version
```

### SMS/Email Not Sending

```powershell
# Check Twilio credentials
docker exec sms-dispatcher env | Select-String "TWILIO"

# Check Gmail credentials
docker exec email-dispatcher env | Select-String "EMAIL"

# Common errors:
# - "Invalid credentials" → Verify API keys
# - "Rate limit" → Wait or upgrade account
# - "Unverified phone" (Twilio trial) → Verify phone in console
```

### MQTT Message Not Received

```powershell
# Check MQTT broker
docker logs hivemq --tail 50

# Check if dispatchers are subscribed
docker logs sms-dispatcher | Select-String "MQTT"
docker logs email-dispatcher | Select-String "MQTT"

# Restart broker and dispatchers
docker restart hivemq
Start-Sleep 5
docker restart sms-dispatcher email-dispatcher push-notification
```

## 📊 Architecture Decisions

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

### Why removed Gamification Service?

✅ **Focus**:
- Project focused on notifications and AI
- Gamification can be added later if needed
- Reduces deployment complexity

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

- [AI Companion Service](services/ai-companion-service/README.md)
- [Event Dispatcher API](services/event-dispatcher-service/README.md)
- [Testing Guide](testing-notification/README.md)

## 🔗 External Resources

- [MQTT Protocol](https://mqtt.org/)
- [HiveMQ Documentation](https://www.hivemq.com/docs/)
- [Google Gemini API](https://ai.google.dev/gemini-api/docs)
- [Twilio SMS](https://www.twilio.com/docs/sms)
- [Firebase FCM](https://firebase.google.com/docs/cloud-messaging)

---

**Last Updated**: November 2025  
**Architecture**: MQTT-based Microservices  
**Status**: Production Ready ✅
