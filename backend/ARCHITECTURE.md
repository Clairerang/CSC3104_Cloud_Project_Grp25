# Backend Architecture - CSC3104 Group 25

## Overview
Microservices architecture using **HiveMQ MQTT broker** + **gRPC** + **Firebase Cloud Messaging** for event-driven communication.

## Services

### 1. **Event Dispatcher Service** (Port 4002, gRPC 50051)
- **Container**: `event-dispatcher`
- **Formerly**: notification-service
- **Responsibilities**:
  - User management (registration, check-ins)
  - Event routing and publishing to MQTT
  - Dashboard SSE (Server-Sent Events) streaming
  - gRPC server for service-to-service communication
  - Outbox pattern for reliable message delivery
  - Daily check-in monitoring
- **MQTT Topics**:
  - Subscribes: `gamification/events`
  - Publishes: `notification/events`
- **Technologies**: Express, MQTT, MongoDB, gRPC, Winston

### 2. **Push Notification Service** (Port 4020)
- **Container**: `push-notification`
- **New Service** - Extracted from notification service
- **Responsibilities**:
  - Firebase Cloud Messaging (FCM) push notifications
  - Mobile device token management
  - FCM HTTP v1 fallback support
  - Token revocation handling
- **MQTT Topics**:
  - Subscribes: `notification/events` (QoS 1)
  - Filters: Only processes events with `target: ['mobile']`
- **Technologies**: Firebase Admin SDK, MQTT, MongoDB, Google Auth Library

### 3. **SMS Dispatcher Service** (Port 4004)
- **Container**: `sms-dispatcher`
- **Formerly**: sms-service
- **Responsibilities**:
  - SMS delivery via Twilio
  - Twilio Verify OTP integration
  - SMS delivery receipt webhooks
  - Pluggable adapter architecture (Twilio/Mock)
- **MQTT Topics**:
  - Subscribes: `sms/send`, `notification/events` (QoS 1)
  - Publishes: `notification/events` (delivery receipts), `notification/dlq` (failed messages)
- **Technologies**: Twilio SDK, MQTT, Express, Prometheus metrics

### 4. **Email Dispatcher Service** (Port 4003)
- **Container**: `email-dispatcher`
- **Formerly**: email-service
- **Responsibilities**:
  - Email delivery via Gmail SMTP
  - Daily login notifications to family members
  - Health check monitoring
- **MQTT Topics**:
  - Subscribes: `notification/events` (QoS 1)
  - Filters: Events with type `daily_login`, `email.send`
- **Technologies**: Nodemailer, MQTT, Gmail SMTP

### 5. **AI Companion Service** (Port 4015)
- **Container**: `ai-companion`
- **Responsibilities**:
  - Conversational AI for elderly users (Google Gemini 2.0 Flash)
  - Intent detection (8 intents: weather, loneliness, SMS family, etc.)
  - Sentiment analysis
  - Chat history tracking
  - Event publishing for detected intents
- **MQTT Topics**:
  - Publishes: Various topics based on detected intents
    - `notification/events` - General notifications
    - Topic varies by intent handler
- **Technologies**: Google Generative AI, MQTT, MongoDB, Express

## Infrastructure

### HiveMQ MQTT Broker (Ports 1883, 8080)
- **Container**: `hivemq`
- **Image**: `hivemq/hivemq-ce:latest`
- **Purpose**: Lightweight message broker replacing Apache Kafka
- **Features**:
  - QoS levels 0, 1, 2 support
  - Web UI on port 8080
  - Healthcheck with TCP socket test
  - ~200MB memory footprint (vs Kafka ~1GB)

### MongoDB (Port 27017)
- **Container**: `mongo`
- **Image**: `mongo:7`
- **Purpose**: 
  - User and check-in data storage
  - Chat history (AI companion)
  - Device tokens (push notifications)
  - Outbox pattern for reliable event delivery
  - Idempotency tracking

## Communication Patterns

### MQTT Pub/Sub
- **Primary messaging protocol** for asynchronous event-driven communication
- **QoS Levels**:
  - QoS 0: Fire-and-forget (not used in this project)
  - QoS 1: At-least-once delivery (most events)
  - QoS 2: Exactly-once delivery (critical messages like SMS receipts)

### gRPC
- **Synchronous RPC** for service-to-service communication
- Event dispatcher provides `PublishEvent` RPC endpoint
- Port: 50051

### HTTP REST
- Each service exposes REST endpoints for:
  - Health checks (`GET /health`)
  - Metrics (`GET /metrics`)
  - Service-specific operations

## Topic Schema

### notification/events
**Publishers**: event-dispatcher, sms-dispatcher, push-notification  
**Subscribers**: push-notification, sms-dispatcher, email-dispatcher, dashboard consumer

**Event Types**:
- `checkin` - Daily check-in from elderly user
- `daily_login` - Triggers family notification emails
- `sms.sent` - SMS delivery acknowledgment
- `sms.failed` - SMS delivery failure
- `social_isolation_alert` - AI detected loneliness
- `sms_family_request` - User wants to SMS family
- And more...

**Schema**:
```json
{
  "type": "event_type",
  "userId": "user123",
  "target": ["mobile", "dashboard", "tablet"],
  "title": "Event Title",
  "body": "Event description",
  "timestamp": "2025-11-08T06:00:00.000Z",
  "metadata": {}
}
```

### sms/send
**Publishers**: event-dispatcher, AI companion  
**Subscribers**: sms-dispatcher

**Schema**:
```json
{
  "type": "sms",
  "userId": "user123",
  "to": "+61412345678",
  "body": "Message text"
}
```

### notification/dlq (Dead Letter Queue)
**Publishers**: sms-dispatcher  
**Subscribers**: (monitoring/alerting - future)

**Purpose**: Failed message logging for debugging and alerting

## Service Dependencies

```
HiveMQ MQTT Broker (healthy)
├── Event Dispatcher ✓
│   └── MongoDB (healthy)
├── Push Notification ✓
│   └── MongoDB (healthy)
├── SMS Dispatcher ✓
├── Email Dispatcher ✓
└── AI Companion ✓
    └── MongoDB (healthy)
```

## Data Flow Example: Daily Check-in

1. **User checks in** → POST `/checkin` to event-dispatcher
2. **Event dispatcher**:
   - Saves check-in to MongoDB
   - Publishes `checkin` event to MQTT `notification/events` with `target: ['mobile', 'dashboard']`
3. **Push notification service**:
   - Receives event from MQTT
   - Finds user's FCM tokens in MongoDB
   - Sends push notification via Firebase
4. **Dashboard consumer** (within event-dispatcher):
   - Receives event from MQTT
   - Broadcasts via SSE to web dashboard clients
5. **Monitoring** (within event-dispatcher):
   - Background task checks for missed check-ins
   - Publishes alerts if user hasn't checked in

## Removed Components

### ❌ Apache Kafka (Replaced by HiveMQ MQTT)
- Previously used for message brokering
- Replaced for:
  - **Lower resource usage**: 200MB vs 1GB memory
  - **Faster startup**: <10s vs 30s+
  - **Simpler operation**: No ZooKeeper dependency
  - **Better for IoT**: MQTT designed for lightweight devices

### ❌ Kafdrop (No longer needed)
- Kafka UI tool
- HiveMQ has built-in web UI on port 8080

### ❌ Gamification Service (Removed per user request)
- Previously handled badges, points, streaks
- Functionality removed from project scope

### ❌ Prometheus & Grafana (Removed per user request)
- Monitoring stack removed
- Services still expose `/metrics` endpoints for future integration

## Environment Variables

### Common
- `MQTT_BROKER` - HiveMQ hostname (default: hivemq)
- `MQTT_PORT` - MQTT port (default: 1883)
- `MONGO_URI` - MongoDB connection string
- `TZ` - Timezone (Asia/Singapore)

### Service-Specific
- **Push Notification**:
  - `FIREBASE_SERVICE_ACCOUNT_PATH` - Path to Firebase SA JSON
  - `FIREBASE_SERVICE_ACCOUNT_JSON` - Inline Firebase SA JSON
  - `FCM_FALLBACK_V1` - Enable HTTP v1 fallback (true/false)
  - `FCM_SEND_DELAY_MS` - Delay before FCM send (default: 500ms)

- **SMS Dispatcher**:
  - `TWILIO_ACCOUNT_SID` - Twilio account SID
  - `TWILIO_AUTH_TOKEN` - Twilio auth token
  - `TWILIO_PHONE_NUMBER` - Twilio sender number
  - `SMS_PROVIDER` - SMS adapter (twilio/mock)

- **Email Dispatcher**:
  - `EMAIL_USER` - Gmail account
  - `EMAIL_PASS` - Gmail app password

- **AI Companion**:
  - `GOOGLE_API_KEY` - Google Gemini API key

## Ports Summary

| Service | Port | Protocol | Purpose |
|---------|------|----------|---------|
| HiveMQ | 1883 | MQTT | Message broker |
| HiveMQ | 8080 | HTTP | Web UI |
| MongoDB | 27017 | TCP | Database |
| Event Dispatcher | 4002 | HTTP | REST API + SSE |
| Event Dispatcher | 50051 | TCP | gRPC |
| Email Dispatcher | 4003 | HTTP | REST API + Metrics |
| SMS Dispatcher | 4004 | HTTP | REST API + Metrics |
| AI Companion | 4015 | HTTP | REST API + Chat |
| Push Notification | 4020 | HTTP | REST API + Health |

## Technology Stack

- **Runtime**: Node.js 18
- **Messaging**: HiveMQ MQTT Community Edition
- **Database**: MongoDB 7
- **RPC**: gRPC (@grpc/grpc-js, @grpc/proto-loader)
- **Push Notifications**: Firebase Admin SDK
- **SMS**: Twilio SDK
- **Email**: Nodemailer (Gmail SMTP)
- **AI**: Google Generative AI (Gemini 2.0 Flash Thinking)
- **Metrics**: Prometheus client (prom-client)
- **Logging**: Winston
- **Web Framework**: Express.js

## Key Design Patterns

### 1. Outbox Pattern
- Used in event-dispatcher for reliable message delivery
- Messages stored in MongoDB before MQTT publish
- Background poller retries failed messages with exponential backoff
- Max 5 retry attempts

### 2. Event-Driven Architecture
- Services communicate via MQTT pub/sub
- Loose coupling between services
- Services can be added/removed without affecting others

### 3. Circuit Breaker (Implicit)
- Failed FCM tokens marked as revoked
- Prevents repeated failures
- HTTP v1 fallback for FCM

### 4. Service Discovery (Simple)
- Docker Compose networking
- Services reference each other by container name
- No external service registry needed

## Migration Summary (Kafka → MQTT)

### Changes Made:
1. ✅ Replaced Kafka + ZooKeeper with HiveMQ MQTT broker
2. ✅ Removed gamification service
3. ✅ Extracted push notifications to separate service
4. ✅ Renamed services to reflect functionality:
   - `notification` → `event-dispatcher`
   - `sms` → `sms-dispatcher`
   - `email` → `email-dispatcher`
5. ✅ Updated all topic names (dot notation → slash notation)
6. ✅ Fixed all comments and documentation
7. ✅ Removed old test scripts and migration docs
8. ✅ Updated package.json files with MQTT dependencies

### Zero Kafka References Remaining:
- ✅ No `require('kafkajs')` in active code
- ✅ No Kafka environment variables in docker-compose
- ✅ All comments updated to say "MQTT"
- ✅ Only package-lock.json files have Kafka (auto-generated, ignored)

## Future Enhancements

1. **Authentication & Authorization**
   - Add JWT tokens for REST APIs
   - MQTT authentication/ACLs

2. **Monitoring**
   - Re-integrate Prometheus + Grafana
   - MQTT message rate monitoring
   - Alert on missed check-ins

3. **Scalability**
   - Add load balancer for services
   - MongoDB replica set
   - Redis cache layer

4. **Reliability**
   - Message deduplication
   - Distributed tracing (OpenTelemetry)
   - Health check aggregation

---

**Version**: 2.0.0  
**Last Updated**: November 8, 2025  
**Team**: CSC3104 Group 25
