# MQTT Integration for API Gateway

This document explains the MQTT integration added to the API Gateway to enable communication with the Games Service.

## Architecture Overview

```
Frontend (React) --HTTP--> API Gateway --MQTT--> HiveMQ Broker <--MQTT--> Games Service
                            (Port 8080)         (Port 1883)              (Port 8081)
```

## What Was Added

### 1. MQTT Client Module (`mqtt/client.js`)

A dedicated MQTT client manager that handles:
- Connection to HiveMQ broker
- Request/response pattern with correlation IDs
- Promise-based API for async communication
- Automatic timeout handling
- Graceful shutdown

**Key Functions:**
- `initializeMQTT()` - Establishes connection to broker
- `sendRequest(topic, payload, timeout)` - Sends request and waits for response
- `disconnect()` - Gracefully closes connection

### 2. Games Routes (`routes/games.js`)

REST API endpoints that bridge HTTP requests to MQTT messages:

| Endpoint | Method | Description | MQTT Topic |
|----------|--------|-------------|------------|
| `/api/games` | GET | Get all available games | `games/request/list` |
| `/api/games/trivia` | GET | Get trivia questions | `games/request/trivia` |
| `/api/games/memory` | GET | Get memory card set | `games/request/memory` |
| `/api/games/stretch` | GET | Get stretch exercises | `games/request/stretch` |
| `/api/games/session/start` | POST | Start game session | `games/session/start` |
| `/api/games/session/complete` | POST | Complete game session | `games/session/complete` |
| `/api/games/history` | GET | Get user's game history | `games/history/request/:userId` |

### 3. Updated `app.js`

Modified to:
- Initialize MQTT client on startup
- Mount games routes at `/api/games`
- Handle graceful shutdown (SIGTERM/SIGINT)
- Use environment variables for configuration

## Environment Variables

Add these to your `.env` file or Docker configuration:

```env
MONGODB_URI=mongodb://mongodb-main:27017/seniorcare
MQTT_BROKER_URL=mqtt://hivemq:1883
JWT_SECRET=your-secret-key-change-in-production
PORT=8080
```

## Message Format

### Request Format
```json
{
  "correlationId": "unique-uuid-v4",
  "userId": "user-id",
  "data": {}
}
```

### Response Format
```json
{
  "success": true,
  "data": {},
  "error": "error message if failed"
}
```

## How It Works

1. **Client makes HTTP request** to API Gateway (e.g., `GET /api/games/trivia`)

2. **API Gateway generates correlation ID** and publishes MQTT message:
   - Topic: `games/request/trivia`
   - Payload: `{ correlationId, userId, count: 3 }`

3. **Games Service receives** the MQTT message and processes it

4. **Games Service publishes response**:
   - Topic: `games/response/trivia/{correlationId}`
   - Payload: `{ success: true, questions: [...] }`

5. **API Gateway receives response**, matches correlation ID, and resolves promise

6. **HTTP response sent** back to client with game data

## Example Usage

### From Frontend (JavaScript/TypeScript)

```javascript
// Get trivia questions
const response = await fetch('http://localhost:8080/api/games/trivia?count=5', {
  headers: {
    'Authorization': `Bearer ${token}`
  }
});

const data = await response.json();
console.log(data.questions); // Array of trivia questions
```

### Testing MQTT Directly

Run the test script:

```bash
cd api
node test-mqtt.js
```

This will test all MQTT endpoints and display responses.

## Benefits of MQTT Integration

### ✅ Advantages

1. **Asynchronous Communication**: Non-blocking requests between services
2. **Loose Coupling**: Services don't need to know each other's locations
3. **Scalability**: Easy to add more game service instances
4. **Resilience**: Messages can be queued if service is temporarily down
5. **Language Agnostic**: Works with any language (your JS backend is fine!)

### ⚠️ Important Notes

- **Timeout**: Default 5-second timeout for MQTT requests
- **QoS Level**: Using QoS 1 (at least once delivery)
- **Clean Session**: Connection uses clean session (doesn't persist state)
- **Authentication**: All routes require JWT authentication

## Troubleshooting

### MQTT Connection Failed
```bash
# Check if HiveMQ is running
docker ps | grep hivemq

# Check HiveMQ logs
docker logs hivemq

# Test MQTT port
telnet localhost 1883
```

### Request Timeout
- Ensure Games Service is running and connected to broker
- Check Games Service logs for errors
- Verify topic names match between services

### No Response Received
- Check correlation IDs match in request/response
- Verify Games Service is subscribed to request topics
- Check HiveMQ Control Center at http://localhost:8000

## Docker Configuration

The `docker-compose.yml` already includes:

```yaml
api-gateway:
  environment:
    - MQTT_BROKER_URL=mqtt://hivemq:1883  # Uses Docker network
  depends_on:
    hivemq:
      condition: service_healthy
```

This ensures:
- API Gateway waits for HiveMQ to be healthy before starting
- Services communicate via Docker network (not localhost)

## Files Modified/Created

### Created:
- ✅ `api/mqtt/client.js` - MQTT client manager
- ✅ `api/routes/games.js` - Games REST API routes
- ✅ `api/test-mqtt.js` - Test script
- ✅ `api/MQTT_INTEGRATION.md` - This documentation

### Modified:
- ✅ `api/package.json` - Added `mqtt` dependency
- ✅ `api/app.js` - Integrated MQTT and games routes

## Next Steps

To fully integrate with your frontend:

1. **Update Frontend Apps** to call new `/api/games/*` endpoints
2. **Add Error Handling** in frontend for timeout scenarios
3. **Implement Retry Logic** for failed requests
4. **Add Monitoring** for MQTT connection health
5. **Set Up Logging** for MQTT message tracking

## Security Considerations

- ✅ All routes require JWT authentication
- ⚠️ Consider adding MQTT broker authentication (username/password)
- ⚠️ Use TLS for production (mqtts://)
- ⚠️ Validate all incoming data from MQTT messages
- ⚠️ Rate limit API endpoints to prevent abuse

## Performance

- **Latency**: Typical round-trip ~50-200ms (local network)
- **Throughput**: HiveMQ can handle thousands of messages/second
- **Concurrent Requests**: Limited by timeout (default 5s) and connection pool

## Conclusion

Your **JavaScript backend architecture works perfectly** for this integration! The MQTT broker provides language-agnostic messaging, so having your API Gateway and Games Service both in Node.js/JavaScript is actually beneficial for consistency and maintainability.

The integration is now complete and ready for testing!
