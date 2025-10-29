# CSC3104_Cloud_Project_Grp25

Cloud-based Senior Care Management System with Microservices Architecture

## Architecture

This system uses a microservices architecture with MQTT for inter-service communication:

```
┌──────────────────┐
│   Senior App     │ (React - Port 3000)
│   Frontend       │
└────────┬─────────┘
         │ HTTP/REST
    ┌────▼─────────────────┐
    │   API Gateway        │ (Express - Port 8080)
    │   (HTTP → MQTT)      │
    └────────┬─────────────┘
             │ MQTT Pub/Sub
    ┌────────▼──────────────────────┐
    │   HiveMQ Community Broker     │ (Ports: 1883, 8000, 8080)
    └────┬──────────────────┬───────┘
         │                  │
    ┌────▼────────┐    ┌───▼──────────────┐
    │  Main API   │    │  Games Service   │
    │  Service    │    │  Microservice    │
    │  Port 8080  │    │  Port 8081       │
    └────┬────────┘    └────┬─────────────┘
         │                  │
    ┌────▼────────┐    ┌───▼──────────────┐
    │  MongoDB    │    │  MongoDB         │
    │  (main DB)  │    │  (games DB)      │
    │  Port 27017 │    │  Port 27018      │
    └─────────────┘    └──────────────────┘
```

## Project Structure

```
CSC3104_Cloud_Project_Grp25/
├── front-end/                    # All frontend applications
│   ├── admin-portal/             # Administrative portal for system management
│   ├── caregiver-dashboard/      # Dashboard for caregivers and staff
│   └── senior-app/               # Application for senior citizens
├── api/                          # API Gateway (Main backend service)
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
- **API Gateway**: http://localhost:8080
- **Games Service**: http://localhost:8081
- **HiveMQ Control Center**: http://localhost:8080 (MQTT broker UI)
- **MongoDB Main**: mongodb://localhost:27017
- **MongoDB Games**: mongodb://localhost:27018

### Seed Games Database

```bash
# Enter games-service container
docker-compose exec games-service sh

# Run seed script
npm run seed

# Exit container
exit
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

# Games Service
curl http://localhost:8081/health

# HiveMQ
curl http://localhost:8080  # Control Center
```

### View MQTT Messages
Access HiveMQ Control Center at http://localhost:8080 to:
- Monitor active topics
- View message flow
- Debug service communication

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
docker-compose logs mongodb-main
docker-compose logs mongodb-games

# Restart MongoDB
docker-compose restart mongodb-main mongodb-games
```

### MQTT connection issues
```bash
# Check HiveMQ logs
docker-compose logs hivemq

# Restart HiveMQ
docker-compose restart hivemq
```

## Contributing

1. Create feature branch
2. Make changes
3. Test locally with Docker Compose
4. Create pull request

## License

This project is for educational purposes (CSC3104 Cloud Computing course).