# CSC3104_Cloud_Project_Grp25

Cloud-based Senior Care Management System with Microservices Architecture

## Recent Updates

### ✅ Gamification System (2025-01-13)
Complete implementation of the total points logic system including:
- **Check-in Points**: 5 points per session (morning/afternoon/evening)
- **Streak Bonuses**: 50 points (7 days), 200 points (30 days), 1000 points (100 days)
- **Daily Point Cap**: 100 points maximum per day
- **Game Integration**: Automatic point tracking (10-20 points per game)
- **AI Chat Integration**: 3 points per meaningful conversation
- **Level System**: Exponential XP curve with 50+ levels
- **Service-to-Service Auth**: Secure microservice communication

See [Gamification Details](#gamification-system) section below for complete information.

### ✅ Notification Microservices Integration
Merged notification system from jerald branch:
- AI Companion Service (port 4015) - Google Gemini chatbot
- Push Notification Service (port 4020) - Firebase FCM
- Notification Service (port 4002) - Event dispatcher
- SMS Service (port 4004) - Twilio integration
- Email Service (port 4003) - Gmail SMTP

### ✅ Frontend Enhancements
- Chat modal component for AI companion
- Notification dropdown for admin
- Multi-tab support with sessionStorage
- Beautified UI with animations

## Architecture

**Updated Consolidated Architecture** with API Gateway Proxy pattern:

```
┌──────────────────┐
│   Frontend       │ (React - Port 3000)
│   (Nginx)        │
└────────┬─────────┘
         │ HTTP/REST (All requests via /api)
    ┌────▼─────────────────────────────┐
    │   API Gateway (Single Entry)     │ (Express - Port 8080)
    │   ================                │
    │   • /api/* → Direct handling      │
    │   • /games/* → Proxy to games     │
    └────┬─────────────────────┬────────┘
         │                     │ (Proxy)
         │ MQTT           ┌────▼──────────────┐
         │                │  Games Service    │ (Internal)
         │                │  Microservice     │
         ▼                └────┬──────────────┘
    ┌────────────┐            │
    │  HiveMQ    │◄───────────┘ MQTT
    │  Broker    │
    │  Port 1883 │
    │  Port 8000 │ WebSocket
    └────────────┘
         │
         ▼
    ┌─────────────────────────────────┐
    │      MongoDB (Consolidated)     │ (Port 27017)
    │      Database: senior_care      │
    │      =====================       │
    │      • users                    │
    │      • relationships            │
    │      • engagements              │
    │      • games                    │
    │      • gamesessions             │
    │      • exercises                │
    │      • triviaquestions          │
    │      • memorysets               │
    └─────────────────────────────────┘
```

## Project Structure

```
CSC3104_Cloud_Project_Grp25/
├── front-end/                    # All frontend applications
│   ├── admin-portal/             # Administrative portal for system management
│   ├── caregiver-dashboard/      # Dashboard for caregivers and staff
│   └── senior-app/               # Application for senior citizens
├── api/                          # API Gateway (Main backend service)
├── database/                     # MongoDB Database Storage
│   ├── mongo-init/               # Initialisation script for automated seeding
├── games-service/                # Games microservice
├── docker-compose.yml            # Docker orchestration
└── k3d/                          # Kubernetes deployment configuration (legacy)
```

## Tech Stack

### Frontend
- React with TypeScript
- Material-UI (MUI)
- Recharts for analytics

### Backend
- Node.js + Express
- MongoDB + Mongoose
- MQTT (HiveMQ Community Edition)
- Docker + Docker Compose
- JWT Authentication

### Communication
- Frontend ↔ API Gateway: HTTP/REST
- Microservices ↔ Microservices: MQTT

## Quick Start with Docker Compose

### Prerequisites
- Docker and Docker Compose installed
- At least 4GB RAM available

### Start All Services

```bash
# Start all services (MongoDB, HiveMQ, API Gateway, Games Service)
docker-compose up -d

# View logs
docker-compose logs -f

# Check service health
docker-compose ps

# Stop all services
docker-compose down
```

### Access Points
- **Frontend**: http://localhost:3000
- **API Gateway**: http://localhost:8080 (Single entry point for all backend requests)
- **MongoDB**: mongodb://localhost:27017 (Database: senior_care)
- **MQTT Broker**: mqtt://localhost:1883 (For MQTT client connections)
- **MQTT WebSocket**: ws://localhost:8000 (For WebSocket connections)

**Note:** Games Service runs internally and is not directly accessible from the host. Access it via API Gateway proxy at `http://localhost:8080/games/*`

**Note:** HiveMQ Community Edition does not include a Control Center web UI. To monitor MQTT messages, use a third-party MQTT client tool (see Monitoring section below).

### Verify Seeded Database

```bash
# Enter mongodb container
docker-compose exec -it mongodb mongosh

# View dbs
test>show dbs

# Switch database to senior_care
test>use senior_care

# Show all collections
senior_care>show collections

# Verify each collections have data
senior_care>db.<collection_name>.find().pretty()

# Exit container
senior_care>exit
```

## Local Development (Without Docker)

### Prerequisites
- Node.js 18+
- MongoDB running locally
- MQTT broker (HiveMQ or Mosquitto)

### Frontend Applications

Each frontend application is a TypeScript React app:

**Admin Portal:**
```bash
cd front-end/admin-portal
npm install
npm start
```

**Caregiver Dashboard:**
```bash
cd front-end/caregiver-dashboard
npm install
npm start
```

**Senior App:**
```bash
cd front-end/senior-app
npm install
npm start
```

### Backend Services

**API Gateway:**
```bash
cd api
npm install
# Update .env with local MongoDB and MQTT URLs
npm start
```

**Games Service:**
```bash
cd games-service
npm install
# Update .env with local MongoDB and MQTT URLs
npm run seed  # Populate database
npm start
```

## Services Overview

### API Gateway (Port 8080)
- User authentication and management
- Check-in tracking
- Relationship management
- Task management
- Translates HTTP requests to MQTT messages

### Games Service (Port 8081)
- Cultural Trivia game management
- Memory Match game content
- Morning Stretch exercise routines
- Game session tracking
- Points calculation
- User game history

### HiveMQ MQTT Broker
- Message broker for microservices
- WebSocket support for real-time updates
- Control center UI for monitoring

## Environment Configuration

Copy `.env.example` to create `.env` files in each service directory:

```bash
cp .env.example api/.env
cp .env.example games-service/.env
```

Edit the `.env` files to match your environment (local vs Docker).

## API Documentation

### API Gateway Endpoints
- `POST /register` - User registration
- `POST /login` - User login
- `POST /checkin` - Daily check-in (protected)
- `POST /add-relation` - Add family relationship (protected)
- `POST /add-task` - Add engagement task (protected)

### Games Service Endpoints
- `GET /health` - Service health check

Games functionality accessed via MQTT topics:
- `games/request/list` - Get available games
- `games/request/trivia` - Get trivia questions
- `games/request/memory` - Get memory cards
- `games/request/stretch` - Get exercises
- `games/session/start` - Start game session
- `games/session/complete` - Complete session

## Development Workflow

1. **Start infrastructure:**
   ```bash
   docker-compose up -d hivemq mongodb-main mongodb-games
   ```

2. **Seed databases:**
   ```bash
   cd games-service && npm run seed
   cd ../api && node populate.js
   ```

3. **Run services in dev mode:**
   ```bash
   # Terminal 1: API Gateway
   cd api && npm start

   # Terminal 2: Games Service
   cd games-service && npm run dev

   # Terminal 3: Frontend
   cd front-end/senior-app && npm start
   ```

## Monitoring

### Health Checks
```bash
# API Gateway
curl http://localhost:8080/

# Games Service (via API Gateway proxy)
curl http://localhost:8080/games/health

# Check all Docker services status
docker compose ps

# Check HiveMQ logs
docker compose logs hivemq
```

### View MQTT Messages

**Important:** HiveMQ Community Edition does not include a web-based Control Center. To monitor MQTT messages, use one of these methods:

**Option 1: Using mosquitto_sub (Command line)**
```bash
# Subscribe to all game-related topics
docker run --rm --network csc3104_cloud-_project_grp25_default eclipse-mosquitto mosquitto_sub -h hivemq -t 'games/#' -v

# Subscribe to specific topic
docker run --rm --network csc3104_cloud-_project_grp25_default eclipse-mosquitto mosquitto_sub -h hivemq -t 'games/request/list' -v
```

**Option 2: Using MQTT Explorer (GUI Tool)**
1. Download MQTT Explorer: http://mqtt-explorer.com/
2. Connect to `mqtt://localhost:1883`
3. Subscribe to topic pattern: `games/#`

**Option 3: Using HiveMQ WebSocket Client**
1. Download HiveMQ WebSocket Client: https://www.hivemq.com/demos/websocket-client/
2. Connect to `ws://localhost:8000/mqtt`
3. Subscribe to topics to monitor message flow

## Troubleshooting

### Services won't start
```bash
# Check if ports are in use
netstat -ano | findstr "8080"
netstat -ano | findstr "27017"

# Clean up and restart
docker-compose down -v
docker-compose up -d
```

### MongoDB connection issues
```bash
# Check MongoDB status
docker-compose logs mongodb

# Restart MongoDB
docker-compose restart mongodb
```

### MQTT connection issues
```bash
# Check HiveMQ logs
docker-compose logs hivemq

# Restart HiveMQ
docker-compose restart hivemq
```

## Gamification System

### Overview

The gamification system tracks user engagement through points, levels, and streaks to encourage daily participation and maintain healthy routines.

### Point Earning Activities

| Activity | Base Points | Bonus | Daily Impact |
|----------|-------------|-------|--------------|
| Check-in (morning/afternoon/evening) | 5 | - | 5-15/day |
| 7-day streak milestone | - | 50 | One-time |
| 30-day streak milestone | - | 200 | One-time |
| 100-day streak milestone | - | 1000 | One-time |
| Trivia (perfect score) | 15 | +5 | 20 |
| Memory Match (≤15 moves) | 15 | +5 | 20 |
| Stretch Exercise | 10 | - | 10 |
| Recipe/Tower Games | 20 | - | 20 |
| AI Chat (meaningful intent) | 3 | - | 3-15/day |

**Daily Point Cap**: 100 points maximum per day (streak bonuses excluded)

### Level System

**XP Formula**: `xpForLevel(L) = Math.floor((50 * L² + 100 * 1.1^L) / 4)`

**Level Thresholds**:
- Level 1: 37 XP
- Level 2: 92 XP (+55)
- Level 3: 172 XP (+80)
- Level 5: 437 XP
- Level 10: 1,522 XP
- Level 20: 10,837 XP

### Streak System

**Calculation Logic**:
1. Counts consecutive days with at least one check-in
2. Multiple check-ins per day count as one day
3. Resets to 1 if more than 1 day gap from most recent check-in
4. Awards bonus points at 7, 30, and 100-day milestones

### API Endpoints

#### GET /total-points
Returns user's total points, current level, progress, and streak.

**Response**:
```json
{
  "userId": "user123",
  "totalPoints": 250,
  "level": 3,
  "progress": {
    "percent": 67.8,
    "currentXP": 78,
    "xpToNextLevel": 37
  },
  "latestStreak": 7
}
```

#### POST /checkin
Records daily check-in and awards 5 points.

**Request**:
```json
{
  "mood": "great",
  "session": "morning"
}
```

**Response** (with streak bonus):
```json
{
  "message": "Check-in recorded successfully",
  "engagement": {
    "tasksCompleted": [
      { "type": "checkin", "points": 5 },
      { "type": "streak_bonus", "points": 50 }
    ],
    "totalScore": 55,
    "streak": 7
  },
  "streakBonus": {
    "message": "Congratulations! You've achieved a 7-day streak!",
    "pointsAwarded": 50
  }
}
```

#### POST /add-task
Adds custom task with points (internal/service use).

**Request** (service-to-service):
```json
{
  "userId": "user123",
  "type": "trivia",
  "points": 20,
  "session": "afternoon"
}
```

**Headers**:
```
X-Service-Auth: <SERVICE_AUTH_TOKEN>
```

**Response**:
```json
{
  "message": "Task added successfully",
  "dailyProgress": {
    "todayTotal": 85,
    "dailyCap": 100,
    "remaining": 15
  }
}
```

### Implementation Details

**Files Modified**:
- `api/app.js` - Check-in points, streak bonuses, daily cap, service auth
- `games-service/server.js` - Game completion integration
- `backend/services/ai-companion-service/src/index.js` - Chat interaction tracking

**Service Integration**:
- Games service automatically tracks points via service-to-service auth
- AI companion service awards 3 points for meaningful conversations
- All services use `X-Service-Auth` header for authenticated calls

**Logging**:
All point transactions are logged with format `[COMPONENT] Message`:
- `[CHECK-IN]` - Check-in events
- `[STREAK BONUS]` - Milestone achievements
- `[DAILY-CAP]` - Point cap enforcement
- `[GAME-COMPLETE]` - Game point tracking
- `[TOTAL-POINTS]` - Level calculations

### Testing

**Check-in Points**:
```bash
curl -X POST http://localhost:8080/checkin \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"mood":"great","session":"morning"}'
```

**Verify Points**:
```bash
curl http://localhost:8080/total-points \
  -H "Authorization: Bearer <token>"
```

### Database Schema

**Engagement Collection**:
```javascript
{
  userId: String,
  date: String,              // YYYY-MM-DD
  session: String,           // morning/afternoon/evening
  checkIn: Boolean,
  mood: String,
  tasksCompleted: [
    { type: String, points: Number }
  ],
  totalScore: Number,        // Sum of all task points
  streak: Number,            // Snapshot at check-in time
  lastActiveAt: Date
}
```

**Unique Index**: `{ userId, date, session }` - One engagement per session per day

## Contributing

1. Create feature branch
2. Make changes
3. Test locally with Docker Compose
4. Create pull request

## License

This project is for educational purposes (CSC3104 Cloud Computing course).