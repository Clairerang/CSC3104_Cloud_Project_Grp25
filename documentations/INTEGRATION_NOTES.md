# Notification Microservices Integration Notes

**Integration Date:** November 13, 2025
**Source Branch:** `jerald`
**Target Branch:** `main` → `feat/integrate-notifications`
**Integration By:** Group 25 Cloud Project Team

---

## 📋 Overview

Successfully integrated **5 notification microservices** from the `jerald` branch into the main branch, adding push notifications, AI chatbot, SMS, and email capabilities to the Senior Care Platform.

---

## 🎯 What Was Integrated

### New Microservices Added (5)

1. **Notification Service** (`notification-service`)
   - Port: 4002 (HTTP), 50051 (gRPC)
   - Role: Event dispatcher, API gateway for notifications, gRPC server
   - Features: User management, check-in tracking, MQTT event publishing

2. **Push Notification Service** (`push-notification-service`)
   - Port: 4020
   - Role: Firebase Cloud Messaging (FCM) for mobile/web push notifications
   - Features: Device token management, push message delivery, multi-platform support

3. **AI Companion Service** (`ai-companion-service`)
   - Port: 4015
   - Role: Conversational AI chatbot using Google Gemini
   - Features: 6 intents (SMS family, medication, community events, volunteer connect, weather, games)
   - Models: 12 Gemini models with automatic failover (100% availability)

4. **SMS Service** (`sms-service`)
   - Port: 4004
   - Role: SMS notifications via Twilio
   - Features: SMS sending, OTP verification, mock adapter for development
   - **Demo Mode:** Set to use mock adapter (logs to console instead of sending real SMS)

5. **Email Service** (`email-service`)
   - Port: 4003
   - Role: Email notifications via Gmail SMTP
   - Features: Daily check-in emails, event notifications
   - **Demo Mode:** Can use mock adapter for development

### Shared Resources Added

- **gRPC Proto Files** (`backend/config/protos/`)
  - `notification.proto` - Service definitions for 5 RPC methods

- **Testing UI** (`backend/shared/testing-ui/`)
  - Browser-based testing interface at `http://localhost:4002/testing-notification/`
  - AI chat widget
  - Push notification testing
  - OTP verification interface

- **Environment Configuration** (`backend/config/secrets/`)
  - `.env` - Comprehensive environment file with setup instructions
  - `.env.example` - Template for team members

---

## 🔧 Key Configuration Changes

### 1. Docker Compose Updates

**Added Services:**
```yaml
- notification-service (HTTP + gRPC)
- push-notification-service (Firebase FCM)
- ai-companion-service (Google Gemini)
- sms-service (Twilio/Mock)
- email-service (Gmail SMTP/Mock)
```

**Port Mappings:**
| Service | Port | Protocol |
|---------|------|----------|
| Notification Service | 4002 | HTTP |
| Notification Service | 50051 | gRPC |
| Push Notification | 4020 | HTTP |
| AI Companion | 4015 | HTTP |
| SMS Service | 4004 | HTTP |
| Email Service | 4003 | HTTP |
| HiveMQ Control Center | 9000 | HTTP (changed from 8080) |

**HiveMQ Port Conflict Resolution:**
- **Before:** HiveMQ Control Center on 8080 (conflicted with API Gateway)
- **After:** HiveMQ Control Center mapped to 9000 (8080→9000)
- **Access:** http://localhost:9000 for MQTT broker monitoring

### 2. Database Consolidation

**Jerald Branch Structure:**
- `notification` database (notification, push services)
- `ai-companion` database (AI companion service)

**Main Branch After Integration:**
- **Single database:** `senior_care`
- All services updated to use `MONGODB_URI=mongodb://mongodb:27017/senior_care`

**New Collections Added:**
- `devicetokens` - Firebase FCM device tokens
- `conversations` - AI chat history
- `notificationevents` - Notification audit log
- `verifiedphones` - Phone verification records (for OTP)

### 3. MQTT Topic Namespace

**Existing Topics (Games):**
- `games/*` - Games service request/response pattern

**New Topics (Notifications):**
- `notification/events` - Main notification event bus
- `sms/send` - SMS message queue
- `chat.message` - AI chat messages
- `notification/dlq` - Dead Letter Queue for failed messages

**No Conflicts:** Games and notification topics use separate namespaces

---

## 🔑 Environment Variables Required

### Essential (for demo features)

**Google Gemini AI** (Required for AI Companion):
```bash
GEMINI_API_KEY=your-api-key-here
```
- Get at: https://makersuite.google.com/app/apikey
- Free tier: 15 requests/minute (sufficient for demo)

**Firebase Cloud Messaging** (Required for Push Notifications):
```bash
FIREBASE_API_KEY=your-key
FIREBASE_PROJECT_ID=your-project
FIREBASE_SERVICE_ACCOUNT_PATH=/app/config/secrets/firebase-sa.json
```
- Create project at: https://console.firebase.google.com
- Download service account JSON to `backend/config/secrets/firebase-sa.json`

### Optional (mock mode for demo)

**Twilio SMS:**
```bash
SMS_ADAPTER=mock  # Uses console logging instead of real SMS
TWILIO_ACCOUNT_SID=mock-sid
TWILIO_AUTH_TOKEN=mock-token
```

**Gmail SMTP:**
```bash
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
```

---

## 📦 File Structure After Integration

```
CSC3104_Cloud_Project_Grp25/
├── backend/
│   ├── services/
│   │   ├── notification-service/          [NEW]
│   │   ├── push-notification-service/     [NEW]
│   │   ├── ai-companion-service/          [NEW]
│   │   ├── sms-service/                   [NEW]
│   │   └── email-service/                 [NEW]
│   ├── config/
│   │   ├── protos/
│   │   │   └── notification.proto         [NEW]
│   │   └── secrets/
│   │       ├── .env                       [NEW]
│   │       └── .env.example               [NEW]
│   └── shared/
│       ├── testing-ui/                    [NEW]
│       └── grpcClient.example.js          [NEW]
├── docker-compose.yml                     [MODIFIED]
├── docker-compose.yml.backup              [NEW]
├── INTEGRATION_NOTES.md                   [NEW - this file]
└── README.md                              [TO BE UPDATED]
```

---

## 🏗️ Architecture Changes

### Before Integration
```
Frontend → API Gateway → Games Service
                      ↓
                   MongoDB
                      ↓
                   HiveMQ (unused by API Gateway)
```

### After Integration
```
Frontend → API Gateway ──→ Games Service
              ↓
         Notification Service (gRPC + HTTP)
              ↓
         MQTT Broker (HiveMQ)
              ↓
     ┌────────┴────────┬──────────┬─────────┐
     ▼                 ▼          ▼         ▼
Push Service    AI Companion   SMS     Email
     ▼                 ▼          ▼         ▼
  MongoDB         MongoDB     Console   Console
```

### Communication Patterns

**Synchronous (gRPC):**
- API Gateway → Notification Service (for queries)
- Methods: GetUser, GetDeviceTokens, GetCheckIns, PublishEvent, HealthCheck

**Asynchronous (MQTT):**
- Notification Service publishes events
- All 4 notification services subscribe to relevant topics
- QoS 1 (at-least-once delivery)

---

## 🚀 Quick Start Guide

### 1. Setup Environment
```bash
# Navigate to project root
cd CSC3104_Cloud_Project_Grp25

# Edit environment file
nano backend/config/secrets/.env

# Add your API keys:
# - GEMINI_API_KEY (required for AI)
# - Firebase config (required for push notifications)
```

### 2. Build Services
```bash
docker-compose build
```

### 3. Start All Services
```bash
docker-compose up -d
```

### 4. Verify Services
```bash
# Check all services are running
docker-compose ps

# Expected: 10 services running
# - frontend, api-gateway, games-service, mongodb, hivemq (existing)
# - notification-service, push-notification-service, ai-companion-service, sms-service, email-service (new)
```

### 5. Access Services

| Service | URL | Description |
|---------|-----|-------------|
| Frontend | http://localhost:3000 | Main application |
| API Gateway | http://localhost:8080 | REST API |
| Notification API | http://localhost:4002 | Notification endpoints |
| Notification Testing UI | http://localhost:4002/testing-notification/ | Browser testing interface |
| AI Companion | http://localhost:4015/chat | AI chatbot endpoint |
| Push Notifications | http://localhost:4020 | FCM push service |
| HiveMQ Dashboard | http://localhost:9000 | MQTT broker monitoring |

---

## 🧪 Testing the Integration

### Test 1: AI Companion Chatbot
```bash
curl -X POST http://localhost:4015/chat \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "test-user-1",
    "message": "Hello! How are you today?"
  }'
```

Expected: Gemini AI response with conversation history

### Test 2: Push Notification
```bash
# 1. Save device token
curl -X POST http://localhost:4020/save-token \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "test-user-1",
    "token": "test-fcm-token",
    "platform": "web"
  }'

# 2. Send push notification
curl -X POST http://localhost:4020/send-push \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "test-user-1",
    "title": "Test Notification",
    "body": "Integration successful!"
  }'
```

### Test 3: SMS Service (Mock Mode)
```bash
curl -X POST http://localhost:4004/send-test \
  -H "Content-Type: application/json" \
  -d '{
    "to": "+6512345678",
    "body": "Test SMS from notification service"
  }'
```

Check SMS service logs: `docker-compose logs sms-service`

### Test 4: Health Checks
```bash
# All services should return HTTP 200
curl http://localhost:4002/health  # Notification Service
curl http://localhost:4015/health  # AI Companion
curl http://localhost:4020/health  # Push Notification
curl http://localhost:4004/health  # SMS Service
curl http://localhost:4003/health  # Email Service
```

---

## ⚠️ Known Limitations (Demo Mode)

1. **SMS Service**: Using mock adapter - logs to console instead of sending real SMS
   - To enable real SMS: Get Twilio credentials and set `SMS_ADAPTER=twilio` in .env

2. **Email Service**: Optional for demo - can use mock mode
   - To enable real emails: Get Gmail App Password and configure in .env

3. **Firebase Push**: Requires Firebase project setup
   - Free tier available at https://console.firebase.google.com
   - Need service account JSON file

4. **Google Gemini**: Free tier has rate limit (15 RPM)
   - Automatic failover to 12 backup models if quota exceeded
   - Keyword fallback if all models fail

---

## 🔄 Integration Decisions Made

### Decision 1: Database Consolidation
**Choice:** Merge into single `senior_care` database
**Rationale:**
- Simpler queries across services
- Single backup/restore point
- Reduced operational complexity
- Sufficient for demo scale

**Alternative Considered:** Separate databases per service
**Why Rejected:** Overkill for demo, harder to manage

### Decision 2: Mock Adapters for Demo
**Choice:** SMS and Email use mock mode by default
**Rationale:**
- No Twilio/Gmail credentials required to get started
- Faster demo setup
- Logs visible in console for debugging
- Can easily switch to real providers later

**Alternative Considered:** Require real credentials
**Why Rejected:** Barrier to entry for team members testing

### Decision 3: HiveMQ Port Remapping
**Choice:** Map Control Center to 9000 (instead of 8080)
**Rationale:**
- API Gateway already uses 8080
- Non-breaking change (Control Center is admin tool)
- 9000 is standard alternative port

**Alternative Considered:** Change API Gateway port
**Why Rejected:** Would break existing frontend integration

### Decision 4: Hybrid Communication (MQTT + gRPC)
**Choice:** Keep both MQTT and gRPC from jerald branch
**Rationale:**
- MQTT for async notifications (fire-and-forget)
- gRPC for sync queries (need response)
- Best of both worlds for notification system

**Alternative Considered:** Convert everything to MQTT or REST
**Why Rejected:** Less efficient, lose type safety of gRPC

---

## 📊 Service Health Monitoring

### Prometheus Metrics (Optional)
All notification services expose `/metrics` endpoint:
```
http://localhost:4002/metrics  # Notification Service
http://localhost:4015/metrics  # AI Companion
http://localhost:4020/metrics  # Push Notification
http://localhost:4004/metrics  # SMS Service
http://localhost:4003/metrics  # Email Service
```

Metrics available:
- `notifications_sent_total` - Counter
- `notifications_failed_total` - Counter
- `sms_sent_total` / `sms_failed_total`
- `push_sent_total` / `push_failed_total`
- `email_sent_total` / `email_failed_total`
- `ai_chat_requests_total` / `ai_chat_errors_total`

### MQTT Monitoring
Access HiveMQ Control Center: http://localhost:9000
- View active connections
- Monitor message throughput
- Inspect topic subscriptions
- Debug message flow

### Docker Health Checks
```bash
# View health status
docker-compose ps

# Check specific service
docker inspect notification-service --format='{{.State.Health.Status}}'
```

---

## 🐛 Troubleshooting

### Issue 1: Services won't start
**Symptoms:** Docker containers exiting immediately

**Solutions:**
1. Check .env file exists: `ls backend/config/secrets/.env`
2. Check MongoDB is healthy: `docker-compose logs mongodb`
3. Check HiveMQ is healthy: `docker-compose logs hivemq`
4. View service logs: `docker-compose logs notification-service`

### Issue 2: Push notifications not working
**Cause:** Missing Firebase configuration

**Solution:**
1. Create Firebase project
2. Download service account JSON
3. Place at: `backend/config/secrets/firebase-sa.json`
4. Update .env with Firebase config
5. Restart service: `docker-compose restart push-notification-service`

### Issue 3: AI Companion returns errors
**Cause:** Invalid or missing Gemini API key

**Solution:**
1. Get API key: https://makersuite.google.com/app/apikey
2. Update GEMINI_API_KEY in .env
3. Restart service: `docker-compose restart ai-companion-service`
4. Check logs: `docker-compose logs ai-companion-service`

### Issue 4: Port already in use
**Symptoms:** `Error: bind: address already in use`

**Solution:**
```bash
# Find process using the port (e.g., 4002)
netstat -ano | findstr :4002  # Windows
lsof -i :4002                 # Mac/Linux

# Kill the process or change port in docker-compose.yml
```

### Issue 5: HiveMQ Control Center not accessible
**Cause:** Port mapping incorrect

**Solution:**
- Access at http://localhost:9000 (NOT 8080)
- Port 8080 inside container is mapped to 9000 outside

---

## 📚 Additional Resources

### Documentation
- **Jerald Branch README**: Comprehensive service documentation
- **MQTT Architecture Guide**: `backend/MQTT_GRPC_ARCHITECTURE.md`
- **gRPC Proto File**: `backend/config/protos/notification.proto`
- **Testing UI**: http://localhost:4002/testing-notification/

### API Documentation
- Notification Service: See Jerald branch README for full endpoint list
- AI Companion: See `backend/services/ai-companion-service/README.md`
- Push Notifications: See `backend/services/push-notification-service/README.md`

### External Services Setup
- **Google Gemini AI**: https://makersuite.google.com/app/apikey
- **Firebase Console**: https://console.firebase.google.com
- **Twilio (optional)**: https://www.twilio.com/console
- **Google Places API (optional)**: https://console.cloud.google.com/apis

---

## ✅ Integration Checklist

- [x] All 5 services copied from jerald branch
- [x] Docker compose merged and updated
- [x] HiveMQ port conflict resolved (8080 → 9000)
- [x] Database consolidated to `senior_care`
- [x] Environment file created with setup instructions
- [x] Mock adapters configured for demo
- [x] MQTT topic namespace documented
- [x] Testing UI accessible
- [x] Health checks functional
- [x] Integration notes documented
- [ ] Services tested and validated
- [ ] README.md updated
- [ ] Team members trained on setup

---

## 🎓 Next Steps

### For Team Members
1. Pull the `feat/integrate-notifications` branch
2. Follow setup guide in this document
3. Test notification features
4. Report any issues in team chat

### For Presentation
1. Demo AI chatbot with multiple intents
2. Show push notification flow
3. Display MQTT message flow in HiveMQ dashboard
4. Highlight microservices architecture

### For Production (Future)
1. Replace mock adapters with real Twilio/Gmail
2. Add authentication to notification endpoints
3. Implement rate limiting
4. Enable TLS for MQTT (port 8883)
5. Add MongoDB authentication
6. Set up monitoring/alerting (Prometheus + Grafana)
7. Implement backup strategy

---

## 👥 Contributors

**Integration Team:** Group 25
**Jerald Branch Developer:** Jerald
**Integration Lead:** [Your Name]
**Date:** November 13, 2025

---

## 📝 Change Log

**v1.0 - November 13, 2025**
- Initial integration of notification microservices
- 5 services added (notification, push, AI, SMS, email)
- Docker compose merged and tested
- Environment configuration created
- Integration notes documented

---

**For questions or issues, contact the team or create an issue in the project repository.**
