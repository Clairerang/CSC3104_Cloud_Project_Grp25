# Communication Architecture: MQTT & gRPC

## Overview

The backend uses a **hybrid communication architecture**:
- **MQTT**: Async event-driven notifications (pub/sub pattern)
- **gRPC**: Synchronous request-response queries (RPC pattern)

This follows microservices best practices where each protocol serves its optimal use case.

## Architecture Decision

### Use MQTT for:
✅ **Async Notifications** - Fire-and-forget events  
✅ **Broadcasting** - One-to-many message delivery  
✅ **Event-Driven** - Loose coupling between services  
✅ **Offline Resilience** - Services can reconnect and catch up  

### Use gRPC for:
✅ **Queries** - Get user profile, device tokens, check-ins  
✅ **Request-Response** - Need immediate data back  
✅ **Type Safety** - Strong contracts via protobuf  
✅ **Performance** - Low latency, efficient serialization  

---

## Current Architecture

### MQTT (Primary)
- **Broker**: HiveMQ (port 1883, 8080 for dashboard)
- **QoS Level**: 1 (at-least-once delivery)
- **Protocol**: MQTT 3.1.1

### Services Using MQTT

| Service | MQTT Topics | Role |
|---------|-------------|------|
| **notification-service** | `notification/events` | Publisher & Consumer |
| **ai-companion-service** | `chat.message`, `sms/send` | Publisher |
| **sms-service** | `sms/send` (subscribe), `notification/events` (publish) | Consumer & Publisher |
| **email-service** | `notification/events` | Consumer |
| **push-notification-service** | `notification/events` | Consumer |

### gRPC (Synchronous Queries)
- **Server**: notification-service (port 50051)
- **Proto**: `backend/config/protos/notification.proto`
- **Status**: ✅ 5 RPC Methods - GetUser, GetDeviceTokens, GetCheckIns, HealthCheck, PublishEvent
- **Use Case**: When services need immediate data (user profile, tokens, history)

---

## MQTT Topics

### 1. `notification/events` (Main Event Bus)
**Publishers**:
- notification-service
- sms-service (delivery receipts, acks)

**Subscribers**:
- sms-service
- email-service
- push-notification-service

**Event Types**:
```javascript
{
  type: 'daily_login',
  userId: 'senior-1',
  timestamp: '2025-11-11T03:00:00.000Z',
  familyEmail: 'family@example.com',
  familyPhone: '+6512345678'
}

{
  type: 'sms',
  userId: 'senior-1',
  to: '+6512345678',
  body: 'Message text',
  urgent: true,
  timestamp: '2025-11-11T03:00:00.000Z'
}

{
  type: 'email.send',
  userId: 'senior-1',
  to: 'user@example.com',
  subject: 'Daily Check-in',
  body: 'Email content',
  timestamp: '2025-11-11T03:00:00.000Z'
}

{
  type: 'push',
  userId: 'senior-1',
  title: 'Notification Title',
  body: 'Notification body',
  timestamp: '2025-11-11T03:00:00.000Z'
}
```

### 2. `sms/send` (SMS Queue)
**Publishers**:
- notification-service
- ai-companion-service (via SMS intent)

**Subscribers**:
- sms-service

**Event Structure**:
```javascript
{
  to: '+6512345678',
  body: 'SMS message text',
  userId: 'senior-1',
  timestamp: '2025-11-11T03:00:00.000Z'
}
```

### 3. `chat.message` (AI Chat Events)
**Publishers**:
- ai-companion-service

**Subscribers**:
- None (logged for analytics)

**Event Structure**:
```javascript
{
  userId: 'senior-1',
  sessionId: 'uuid',
  message: 'User message',
  response: 'AI response',
  intent: 'CommunityEvents',
  timestamp: '2025-11-11T03:00:00.000Z'
}
```

### 4. `notification/dlq` (Dead Letter Queue)
**Publishers**:
- sms-service (failed messages after retries)

**Subscribers**:
- None (monitored by admins)

---

## Service Communication Patterns

### Pattern 1: Direct MQTT Pub/Sub
```
Client → notification-service (HTTP) → MQTT (notification/events) → sms/email/push services
```

**Example**: Daily login triggers email and SMS
1. Client POST `/daily-login` to notification-service
2. notification-service publishes to `notification/events`
3. email-service consumes event, sends email
4. sms-service consumes event, sends SMS

### Pattern 2: AI-Triggered Events
```
Client → ai-companion-service (HTTP) → MQTT (sms/send) → sms-service
```

**Example**: User asks AI to "call my son"
1. Client POST `/chat` to ai-companion-service
2. AI detects SMS intent
3. ai-companion publishes to `sms/send` topic
4. sms-service consumes and sends SMS

### Pattern 3: gRPC Synchronous Queries
```
Service → gRPC Client → notification-service (port 50051) → MongoDB → Response
```

**Example**: Admin portal needs to display user profile
1. admin-portal calls `GetUser` RPC with userId
2. notification-service queries MongoDB User collection
3. Returns user profile (name, email, phone, address, family contacts)
4. admin-portal displays user details

**When to Use**: Need immediate data back (profiles, tokens, history)

---

## gRPC Methods (5 RPCs)

### 1. GetUser
**Purpose**: Query user profile synchronously  
**Request**: `{ userId: "senior-1" }`  
**Response**: User object with name, email, phone, address, family contacts

```javascript
const { getUserProfile } = require('./shared/grpcClient.example');
const user = await getUserProfile('senior-1');
console.log(user.name); // "Ah Seng"
```

### 2. GetDeviceTokens
**Purpose**: Retrieve FCM tokens for push notifications  
**Request**: `{ userId: "senior-1" }`  
**Response**: Array of device tokens with platform info

```javascript
const { getDeviceTokens } = require('./shared/grpcClient.example');
const tokens = await getDeviceTokens('senior-1');
tokens.forEach(t => sendPush(t.token));
```

### 3. GetCheckIns
**Purpose**: Query check-in history  
**Request**: `{ userId: "senior-1", limit: 10 }`  
**Response**: Array of check-ins sorted by timestamp DESC

```javascript
const { getCheckIns } = require('./shared/grpcClient.example');
const history = await getCheckIns('senior-1', 10);
console.log(`Last mood: ${history[0].mood}`);
```

### 4. HealthCheck
**Purpose**: Verify service availability  
**Request**: `{}`  
**Response**: `{ healthy: true, service: "notification-service", uptime: 3600 }`

```javascript
const { healthCheck } = require('./shared/grpcClient.example');
const status = await healthCheck();
if (!status.healthy) console.error('Service down!');
```

### 5. PublishEvent
**Purpose**: Publish events via gRPC (alternative to MQTT)  
**Request**: Event object with type, userId, target, body, etc.  
**Response**: `{ success: true, message: "Event published to MQTT" }`

```javascript
const { publishEvent } = require('./shared/grpcClient.example');
await publishEvent({
  type: 'sms_send',
  userId: 'senior-1',
  target: '+6512345678',
  body: 'Hello!'
});
```

---

## MQTT Configuration

### Environment Variables
```bash
MQTT_BROKER=hivemq          # Default: hivemq (Docker service name)
MQTT_PORT=1883              # Default: 1883 (MQTT protocol)
```

### Client Settings (All Services)
```javascript
const mqttClient = mqtt.connect(`mqtt://${MQTT_BROKER}:${MQTT_PORT}`, {
  clientId: `service-name-${uuidv4()}`,  // Unique client ID
  clean: true,                            // Clean session
  reconnectPeriod: 1000                   // Auto-reconnect
});
```

### QoS Level: 1 (At-Least-Once)
All services use QoS 1 for reliable delivery:
```javascript
mqttClient.publish(topic, JSON.stringify(data), { qos: 1 }, callback);
mqttClient.subscribe(topic, { qos: 1 }, callback);
```

---

## gRPC Configuration

### Proto Definition
**File**: `backend/config/protos/notification.proto`

**Service Definition**:
```protobuf
service NotificationService {
  rpc PublishEvent(Event) returns (EventResponse);
  rpc GetUser(GetUserRequest) returns (GetUserResponse);
  rpc GetDeviceTokens(GetDeviceTokensRequest) returns (GetDeviceTokensResponse);
  rpc GetCheckIns(GetCheckInsRequest) returns (GetCheckInsResponse);
  rpc HealthCheck(HealthCheckRequest) returns (HealthCheckResponse);
}
```

**Key Message Types** (8 total):
- `Event` - Enhanced with 13 fields (type, userId, timestamp, target, to, body, subject, title, message, urgent, sessionId, intent, from)
- `GetUserRequest`, `User`, `GetUserResponse` - User profile queries
- `GetDeviceTokensRequest`, `DeviceToken`, `GetDeviceTokensResponse` - FCM token queries
- `GetCheckInsRequest`, `CheckIn`, `GetCheckInsResponse` - Check-in history queries
- `HealthCheckRequest`, `HealthCheckResponse` - Service health monitoring

### Server
- **Service**: notification-service
- **Port**: 50051 (configurable via `GRPC_PORT`)
- **File**: `backend/services/notification-service/src/grpcServer.js`
- **Startup Logging**: Shows all 5 available RPCs

### Client Example
**File**: `backend/shared/grpcClient.example.js`

Complete gRPC client implementation with promise-based wrappers for all 5 methods. Other services can import and use:

```javascript
const { getUserProfile, getDeviceTokens, getCheckIns, healthCheck, publishEvent } = require('./shared/grpcClient.example');

// Usage
const user = await getUserProfile('senior-1');
const tokens = await getDeviceTokens('senior-1');
const history = await getCheckIns('senior-1', 10);
const status = await healthCheck();
await publishEvent({ type: 'sms_send', userId: 'senior-1', body: 'Hello' });
```

### Usage
gRPC server is started automatically in notification-service:
```javascript
const { startGrpcServer } = require('./grpcServer');
startGrpcServer({ publishEvent, models });  // models = MongoDB connection
```

---

## Message Flow Examples

### Example 1: Daily Login Flow
```
1. Client → POST /daily-login (notification-service)
2. notification-service → MQTT publish to 'notification/events'
   {
     type: 'daily_login',
     userId: 'senior-1',
     familyEmail: 'son@example.com',
     familyPhone: '+6512345678'
   }
3. email-service → Consumes event, sends email to family
4. sms-service → Consumes event, sends SMS to family
5. sms-service → Publishes delivery receipt to 'notification/events'
```

### Example 2: AI Chat → SMS
```
1. Client → POST /chat "Call my son" (ai-companion-service)
2. ai-companion → Detects SMS intent
3. ai-companion → MQTT publish to 'sms/send'
   {
     to: '+6512345678',
     body: 'Senior John wants to talk. Please call.',
     userId: 'senior-1'
   }
4. sms-service → Consumes from 'sms/send', sends SMS via Twilio
5. sms-service → Publishes ack to 'notification/events'
```

### Example 3: Urgent Alert
```
1. Admin → POST /urgent-sms (notification-service)
2. notification-service → MQTT publish to 'notification/events'
   {
     type: 'sms',
     urgent: true,
     to: ['+65111111', '+65222222'],
     body: '🚨 URGENT: Emergency alert'
   }
3. sms-service → Consumes event, sends SMS immediately
4. push-notification-service → Consumes event, sends push notification
```

---

## Monitoring & Debugging

### MQTT Dashboard
**URL**: http://localhost:8080 (HiveMQ Control Center)

### Check MQTT Logs
```powershell
docker logs hivemq --tail 100
```

### Monitor Topic Activity
```powershell
# Subscribe to all topics (debug)
docker exec -it hivemq hivemq-cli sub -t '#' -v
```

### Service-Specific MQTT Logs
```powershell
docker logs sms-service | Select-String "MQTT"
docker logs email-service | Select-String "MQTT"
docker logs ai-companion | Select-String "MQTT"
```

---

## Benefits of Hybrid MQTT/gRPC Architecture

### MQTT Benefits (Async Events)
✅ **Decoupled Services**: Services don't need to know about each other  
✅ **Scalability**: Easy to add new subscribers to existing events  
✅ **Reliability**: QoS 1 ensures at-least-once delivery  
✅ **Async Processing**: Non-blocking event handling  
✅ **Flexibility**: Multiple services can react to same event  
✅ **Lightweight**: Minimal overhead compared to HTTP polling  

### gRPC Benefits (Sync Queries)
✅ **Type Safety**: Strong contracts via protobuf  
✅ **Performance**: Low latency, efficient binary serialization  
✅ **Request-Response**: Immediate data when needed  
✅ **Code Generation**: Auto-generated client/server stubs  
✅ **Streaming**: Supports bidirectional streaming (future use)  
✅ **Load Balancing**: Built-in support for distributed systems  

### Best of Both Worlds
- **MQTT**: 100% coverage for events (5 services)
- **gRPC**: 5 RPC methods for queries
- **Clear Separation**: Events use MQTT, queries use gRPC
- **No Overlap**: Each protocol serves its optimal use case

---

## Future Enhancements

### MQTT
1. **Message Retention**: Enable MQTT message retention for late subscribers
2. **Topic Wildcards**: Use hierarchical topics (e.g., `notification/sms/#`)
3. **Message Deduplication**: Add message IDs to prevent duplicate processing
4. **Dead Letter Monitoring**: Auto-alert on DLQ messages

### gRPC
1. **Bidirectional Streaming**: Real-time chat/notifications via gRPC streams
2. **Service Mesh**: Integrate with Istio/Linkerd for advanced routing
3. **Authentication**: Add JWT/mTLS for secure RPC calls
4. **More Query Methods**: GetMedications, GetRelationships, GetConversations

---

## Summary

- ✅ **MQTT**: All 5 services use MQTT for async events (100% coverage)
- ✅ **gRPC**: 5 RPC methods for synchronous queries (GetUser, GetDeviceTokens, GetCheckIns, HealthCheck, PublishEvent)
- ✅ **HiveMQ Broker**: Handles all pub/sub with QoS 1 reliability
- ✅ **Hybrid Architecture**: Best practice - MQTT for events, gRPC for queries
- ✅ **Type Safety**: Protobuf with 8 message types and complete documentation
- ✅ **Client Ready**: grpcClient.example.js provides easy integration for all services
- ✅ **Clean Separation**: Each protocol serves its optimal use case

