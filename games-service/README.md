# Games Microservice

Microservice for managing games in the Senior Care Management System. Communicates via MQTT and provides games content for seniors.

## Features

- **Cultural Trivia**: Historical and cultural questions
- **Memory Match**: Card matching game
- **Morning Stretch**: Guided exercise routines
- **Game Sessions**: Track user progress and scores
- **MQTT Communication**: Asynchronous message-based architecture

## Tech Stack

- Node.js + Express
- MongoDB + Mongoose
- MQTT (HiveMQ)
- Docker

## MQTT Topics

### Subscribed Topics (Service listens to):
- `games/request/list` - Get all available games
- `games/request/trivia` - Get trivia questions
- `games/request/memory` - Get memory card set
- `games/request/stretch` - Get exercise routines
- `games/session/start` - Start new game session
- `games/session/complete` - Complete session and calculate points
- `games/history/request/#` - Get user's game history

### Published Topics (Service responds on):
- `games/response/list/{correlationId}`
- `games/response/trivia/{correlationId}`
- `games/response/memory/{correlationId}`
- `games/response/stretch/{correlationId}`
- `games/response/session/start/{correlationId}`
- `games/response/session/complete/{correlationId}`
- `games/response/history/{correlationId}`
- `games/response/error/{correlationId}`

## API Endpoints

- `GET /health` - Health check endpoint

## Database Collections

- `games` - Game metadata
- `triviaquestions` - Trivia questions
- `exercises` - Stretch exercises
- `memorysets` - Memory card sets
- `gamesessions` - User game sessions and scores

## Setup

### Local Development

```bash
# Install dependencies
npm install

# Set up environment variables
cp .env.example .env

# Seed database
npm run seed

# Start service
npm start

# Development mode with auto-reload
npm run dev
```

### Docker

```bash
# Build image
docker build -t games-service .

# Run container
docker run -p 8081:8081 --env-file .env games-service
```

## Environment Variables

- `PORT` - Service port (default: 8081)
- `MONGODB_URI` - MongoDB connection string
- `MQTT_BROKER_URL` - MQTT broker URL
- `JWT_SECRET` - JWT secret for authentication
- `SERVICE_NAME` - Service identifier

## Message Format

All MQTT messages follow this structure:

### Request
```json
{
  "correlationId": "unique-id",
  "userId": "user-id",
  "data": {}
}
```

### Response
```json
{
  "success": true,
  "data": {}
}
```

## Development

1. Ensure MongoDB and HiveMQ are running
2. Update `.env` with correct connection strings
3. Run `npm run seed` to populate database
4. Start service with `npm run dev`
