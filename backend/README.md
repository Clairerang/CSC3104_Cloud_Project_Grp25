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
| **AI Companion** | 4015 | Conversational AI (6 Intents) | Node.js, Google Gemini (12 models) |
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
# 12 models with automatic failover
# Primary: gemini-2.5-flash (latest stable)
# Rate limit: 10 requests/minute (client-side)

# ============================================
# GOOGLE PLACES API (Community Events)
# ============================================
GOOGLE_PLACES_API_KEY=AIzaSyXXXXXXXXXXXXXXXXXXXXX
# Get key: https://console.cloud.google.com/
# Used for real-time community center location searches

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
5. **Google Places API**: https://console.cloud.google.com/ → Enable Places API, get API key

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
1. 📱 **SMS Family** - Send messages to family members
2. 💊 **Medication Reminder** - Check today's medications
3. 🎉 **Community Events** - Browse local activities and events (Google Places API integration)
4. 🤝 **Volunteer Connect** - Connect with Lions Befrienders volunteers
5. 🌤️ **Weather Info** - Get weather updates and safety advice
6. 🎮 **Play Game** - Interactive games and activities

**Features**:
- ✅ **12 Gemini Models** - Automatic failover between models
- ✅ **Primary Model**: `gemini-2.5-flash` (latest stable, currently active)
- ✅ **Fallback Models**: 11 backup models (2.5-pro, 2.0-flash, experimental variants)
- ✅ **Rate Limiter** - Client-side 10 RPM limit (under 15 RPM free tier)
- ✅ **Google Places API** - Real-time community center searches based on user location
- ✅ **Natural Conversations** - Context-aware responses
- ✅ **MongoDB Integration** - Conversation history storage
- ✅ **MQTT Publishing** - Triggers real notifications
- ✅ **Graceful Fallback** - Uses context data if all models fail

📘 **Available Models (automatic failover)**:
1. `models/gemini-2.5-flash` ✅ (Primary - Currently Active)
2. `models/gemini-2.5-pro` (More capable backup)
3. `models/gemini-2.0-flash` (Stable backup)
4. `models/gemini-2.0-flash-exp` (Experimental)
5. `models/gemini-2.0-flash-001` (Versioned)
6. `models/gemini-2.0-flash-lite` (Fast/lite)
7. `models/gemini-2.0-pro-exp` (Pro experimental)
8. `models/gemini-exp-1206` (Experimental variant)
9. `models/gemini-2.5-flash-preview-05-20` (Preview)
10. `models/gemini-2.5-pro-preview-06-05` (Preview)
11. `models/gemini-2.0-flash-lite-001` (Lite version)
12. `models/gemini-2.0-flash-lite-preview` (Lite preview)

System tries each model in order until one succeeds. Primary model has 100% success rate.

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

---

## 🔌 Communication Architecture

### Hybrid MQTT + gRPC

The backend uses **two complementary protocols**:

#### MQTT (Async Events) - Port 1883
- **Use For**: Fire-and-forget notifications, broadcasting, event-driven workflows
- **Topics**: `notification/events`, `sms/send`, `chat.message`, `notification/dlq`
- **Coverage**: 100% - All 5 services use MQTT for async communication
- **QoS**: 1 (at-least-once delivery)

#### gRPC (Sync Queries) - Port 50051
- **Use For**: Request-response queries, immediate data retrieval
- **Server**: notification-service
- **Methods**: 5 RPC methods for user data, device tokens, check-ins, health checks, events

**Decision Rule**:
- 📡 Need to **broadcast an event**? → Use MQTT
- ❓ Need to **query data immediately**? → Use gRPC

### gRPC API Reference

**Proto File**: `backend/config/protos/notification.proto`

#### 1. GetUser - Query User Profile
```javascript
// Request
{ userId: "senior-1" }

// Response
{
  userId: "senior-1",
  name: "Ah Seng",
  email: "ahseng@example.com",
  phoneNumber: "+6512345678",
  address: "Sengkang",
  familyEmails: ["family@example.com"],
  familyPhones: ["+6587654321"],
  createdAt: "2025-01-15T10:00:00Z"
}
```

#### 2. GetDeviceTokens - Retrieve FCM Tokens
```javascript
// Request
{ userId: "senior-1" }

// Response
{
  tokens: [
    { token: "fcm_token_123...", platform: "android", createdAt: "..." }
  ]
}
```

#### 3. GetCheckIns - Query Check-in History
```javascript
// Request
{ userId: "senior-1", limit: 10 }  // max 100

// Response
{
  checkIns: [
    { userId: "senior-1", mood: "happy", timestamp: "2025-01-15T08:30:00Z" },
    { userId: "senior-1", mood: "neutral", timestamp: "2025-01-14T08:30:00Z" }
  ]
}
```

#### 4. HealthCheck - Service Status
```javascript
// Request
{}

// Response
{
  healthy: true,
  service: "notification-service",
  version: "1.0.0",
  uptime: 3600,
  timestamp: "2025-01-15T12:00:00Z"
}
```

#### 5. PublishEvent - Publish via gRPC
```javascript
// Request
{
  type: "sms_send",
  userId: "senior-1",
  target: "+6512345678",
  body: "Hello!",
  urgent: false
}

// Response
{ success: true, message: "Event published to MQTT" }
```

### Using gRPC Client

**Example**: `backend/shared/grpcClient.example.js`

```javascript
const { getUserProfile, getDeviceTokens, getCheckIns, healthCheck, publishEvent } = require('./shared/grpcClient.example');

// Get user profile
const user = await getUserProfile('senior-1');
console.log(user.name); // "Ah Seng"

// Get FCM tokens for push notifications
const tokens = await getDeviceTokens('senior-1');
tokens.forEach(t => sendPush(t.token));

// Get last 10 check-ins
const history = await getCheckIns('senior-1', 10);
console.log(`Last mood: ${history[0].mood}`);

// Check service health
const status = await healthCheck();
if (!status.healthy) console.error('Service down!');

// Publish event (alternative to MQTT)
await publishEvent({ type: 'sms_send', userId: 'senior-1', body: 'Hello!' });
```

**Documentation**: See `backend/MQTT_GRPC_ARCHITECTURE.md` for complete architecture guide.

---

## 🧪 Testing

### Browser Testing UI

Visit: **http://localhost:4002/testing-notification/**

Features:
- ✅ **Daily Check-In Interface** - Test senior daily login flow
- ✅ **Phone Verification** - Test Twilio OTP verification
- ✅ **AI Chat Widget** - Floating chat button with 6 quick actions
  - SMS Family
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

✅ **12-Model Gemini Failover System**:
- Implemented automatic failover across 12 Gemini models
- Primary model: `gemini-2.5-flash` (100% success rate)
- Eliminates downtime from rate limiting or model unavailability
- All models validated against Google's API

✅ **Google Places API Integration**:
- Real-time community center searches based on user location
- Geocoding support for Singapore addresses
- Enhanced community events intent with live data
- Returns actual venues with ratings, addresses, and open/closed status

✅ **Client-Side Rate Limiting**:
- 10 requests/minute limit (well under 15 RPM free tier)
- Sliding window algorithm for accurate rate tracking
- Prevents quota exceeded errors
- Graceful fallback to context data when limited

✅ **Improved Response Formatting**:
- Enhanced community events with proper spacing and indentation
- Visual separators for better readability
- Consistent labeling (Location:, Activities:, Contact:)
- Professional presentation of real venue data

✅ **Removed Sentiment Analysis**:
- Simplified AI companion to focus on actionable help
- Removed `sentiment` npm package dependency
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

- **MQTT & gRPC Architecture**: [MQTT_GRPC_ARCHITECTURE.md](MQTT_GRPC_ARCHITECTURE.md) - Complete hybrid communication guide
- **gRPC Client Example**: `shared/grpcClient.example.js` - Ready-to-use client with promise-based wrappers
- **Proto File**: `config/protos/notification.proto` - Service contracts (8 message types, 5 RPC methods)
- **AI Companion Architecture**: See `services/ai-companion-service/src/index.js` - 12-model failover system
- **Google Places Integration**: See `services/ai-companion-service/src/intents/communityEvents.js` - Real-time venue searches
- **Rate Limiting**: Client-side sliding window algorithm in `services/ai-companion-service/src/index.js`
- **Community Events Formatting**: Enhanced response structure with proper spacing and indentation
- [Notification Service API](services/notification-service/README.md) - Core event hub
- [SMS Service](services/sms-service/README.md) - Twilio integration
- [Testing Guide](shared/testing-ui/README.md) - UI testing documentation
- **Archived Features**: `shared/archived-features/` - Phone verification (OTP) for future use

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
- ✅ 12 Gemini models with automatic failover
- ✅ Primary: gemini-2.5-flash (latest stable, 100% success rate)
- ✅ Backups: gemini-2.5-pro, gemini-2.0-flash, 9 additional models
- ✅ Client-side rate limiting (10 RPM sliding window)
- ✅ Google Places API integration for real-time community center searches
- ✅ 6 intent detection system
- ✅ Natural language conversations
- ✅ Context-aware responses
- ✅ MongoDB conversation history
- ✅ MQTT event publishing

### Notification System
- ✅ MQTT-based event distribution (100% service coverage)
- ✅ gRPC synchronous query API (5 RPC methods)
- ✅ Multi-channel delivery (SMS, Email, Push)
- ✅ OTP verification via Twilio Verify
- ✅ Firebase FCM v1 API
- ✅ Real-time dashboard updates
- ✅ Persistent message queuing
- ✅ Hybrid MQTT/gRPC architecture following microservices best practices

### Communication Architecture
- ✅ **MQTT**: All 5 services for async events (QoS 1)
- ✅ **gRPC**: 5 RPC methods for sync queries (GetUser, GetDeviceTokens, GetCheckIns, HealthCheck, PublishEvent)
- ✅ **Protobuf**: 8 message types with complete documentation
- ✅ **Client Ready**: grpcClient.example.js for easy integration

### Testing Interface
- ✅ Floating AI chat widget
- ✅ Daily check-in workflow
- ✅ Phone verification UI
- ✅ Quick action buttons
- ✅ Rich HTML formatting
- ✅ Real-time service logs

---

**Last Updated**: January 15, 2025  
**Architecture**: Hybrid MQTT + gRPC Microservices  
**AI Model**: 12 Gemini Models with Automatic Failover (Primary: gemini-2.5-flash)  
**Communication**: MQTT (async events) + gRPC (sync queries)  
**Status**: Production Ready ✅  
**Team**: CSC3104 Cloud Project Group 25

