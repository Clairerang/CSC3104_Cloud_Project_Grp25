# CSC3104 Cloud Project - Group 25

> **Senior Connect**: Cloud-based Senior Care Management System with Microservices Architecture

[![Docker](https://img.shields.io/badge/Docker-Compose-2496ED?logo=docker)](https://www.docker.com/)
[![MongoDB](https://img.shields.io/badge/Database-MongoDB-47A248?logo=mongodb)](https://www.mongodb.com/)
[![MQTT](https://img.shields.io/badge/MQTT-HiveMQ-FF6600)](https://www.hivemq.com/)
[![React](https://img.shields.io/badge/Frontend-React-61DAFB?logo=react)](https://reactjs.org/)

## 📋 Table of Contents
- [Project Status](#-project-status)
- [Quick Start](#-quick-start)
- [System Architecture](#-system-architecture)
- [Features](#-features)
- [Access & Credentials](#-access--credentials)
- [Detailed Documentation](#-detailed-documentation)
- [Tech Stack](#-tech-stack)
- [Troubleshooting](#-troubleshooting)

---

## 🚀 Project Status

### ✅ Implemented Features

**Backend Services:**
- ✅ MongoDB-based authentication system
- ✅ Unified login with role-based routing
- ✅ JWT token management
- ✅ User registration & profile management
- ✅ MQTT message broker integration
- ✅ Games microservice (Trivia, Memory Match, Stretch exercises)
- ✅ Game session tracking and scoring

**Frontend Applications:**
- ✅ Admin Portal with management dashboard
- ✅ Senior App with gamification features
- ✅ Caregiver Dashboard for family monitoring
- ✅ Unified login system across all apps
- ✅ Role-based automatic redirects

**Infrastructure:**
- ✅ Docker Compose orchestration
- ✅ Multi-container deployment
- ✅ Health checks for all services
- ✅ Persistent data volumes

---

## 🎯 Quick Start

### Prerequisites
- Docker Desktop installed and running
- At least 4GB RAM available
- Ports 3000-3002, 8080-8081, 27017-27018, 1883, 8000 available

### 1. Clone and Navigate
```bash
git clone <repository-url>
cd CSC3104_Cloud_Project_Grp25
```

### 2. Start All Services
```bash
# Build and start all containers
docker-compose up -d

# Wait ~30 seconds for all services to be healthy
docker-compose ps
```

### 3. Access the Application

Open your browser and navigate to:

**🔐 Login Page:** http://localhost:3001/login

Use any of these test accounts:

| Role | Username | Password | Redirects To |
|------|----------|----------|--------------|
| Admin | `admin` | `admin123` | Admin Portal (3001) |
| Senior | `senior1` | `password123` | Senior App (3000) |
| Family | `family1` | `password123` | Caregiver Dashboard (3002) |

**That's it! You're ready to use the system.** 🎉

---

## 🏗️ System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        FRONTEND LAYER                            │
│  ┌───────────────┐  ┌───────────────┐  ┌────────────────────┐  │
│  │ Admin Portal  │  │  Senior App   │  │ Caregiver Dashboard│  │
│  │   Port 3001   │  │  Port 3000    │  │    Port 3002       │  │
│  │  (React/TS)   │  │  (React/TS)   │  │    (React/TS)      │  │
│  └───────┬───────┘  └───────┬───────┘  └─────────┬──────────┘  │
└──────────┼──────────────────┼────────────────────┼─────────────┘
           │                  │                    │
           └──────────────────┼────────────────────┘
                             │ HTTP/REST
                    ┌────────▼─────────┐
                    │   API Gateway    │
                    │   Port 8080      │
                    │   (Express.js)   │
                    └────────┬─────────┘
                             │ MQTT Pub/Sub
                    ┌────────▼──────────┐
                    │   HiveMQ Broker   │
                    │  Ports: 1883,8000 │
                    └────┬──────────┬───┘
                         │          │
              ┌──────────┘          └──────────┐
              │                                 │
     ┌────────▼────────┐              ┌────────▼────────┐
     │  Main API       │              │ Games Service   │
     │  Service        │              │  Port 8081      │
     │  (Auth, Users)  │              │  (Microservice) │
     └────────┬────────┘              └────────┬────────┘
              │                                 │
     ┌────────▼────────┐              ┌────────▼────────┐
     │  MongoDB        │              │  MongoDB        │
     │  (seniorcare)   │              │  (games)        │
     │  Port 27017     │              │  Port 27018     │
     └─────────────────┘              └─────────────────┘
```

### Key Components

| Service | Purpose | Port |
|---------|---------|------|
| **Admin Portal** | System management, user oversight, analytics | 3001 |
| **Senior App** | Senior-friendly interface with games & activities | 3000 |
| **Caregiver Dashboard** | Family monitoring & communication | 3002 |
| **API Gateway** | Authentication, user management, routing | 8080 |
| **Games Service** | Game logic, scoring, session management | 8081 |
| **HiveMQ** | MQTT message broker for microservices | 1883, 8000 |
| **MongoDB (Main)** | User data, authentication | 27017 |
| **MongoDB (Games)** | Game data, sessions, scores | 27018 |

---

## ✨ Features

### 🔐 Authentication & Authorization
- MongoDB-based user authentication
- JWT token generation and validation
- Role-based access control (Admin, Senior, Family)
- Unified login with automatic role-based redirects
- Secure password hashing with bcrypt

### 👤 User Management
- User registration with profile creation
- Support for multiple user roles
- Profile management
- Relationship tracking (seniors ↔ family members)

### 🎮 Gamification (Games Service)
- **Cultural Trivia**: Historical and cultural questions
- **Memory Match**: Card matching game with difficulty levels
- **Morning Stretch**: Guided exercise routines
- Session tracking and scoring system
- User game history and achievements

### 📊 Admin Portal
- Dashboard with system statistics (mock data)
- User management interface
- System health monitoring
- Analytics and reporting

### 👴 Senior App
- Large, easy-to-read interface
- Daily check-in system
- Activity tracking
- Points and rewards system
- Contact management (Circle feature)

### 👨‍👩‍👧 Caregiver Dashboard
- Monitor senior activities
- View engagement metrics
- Activity logs
- Communication tools
- Analytics on senior well-being

---

## 🔑 Access & Credentials

### Application URLs

| Application | URL | Purpose |
|-------------|-----|---------|
| **Admin Portal** | http://localhost:3001 | System administration |
| **Senior App** | http://localhost:3000 | Senior citizen interface |
| **Caregiver Dashboard** | http://localhost:3002 | Family/caregiver monitoring |
| **API Gateway** | http://localhost:8080 | Backend API |
| **Games Service** | http://localhost:8081 | Games microservice |
| **HiveMQ Control** | http://localhost:8000 | MQTT broker dashboard |

### Test Accounts

All users can login at **any** login page and will be automatically redirected to their appropriate dashboard.

#### Admin Account
```
Username: admin
Password: admin123
Access: Full system administration
```

#### Senior Account
```
Username: senior1
Password: password123
Access: Senior app features (games, check-in, activities)
```

#### Family Account
```
Username: family1
Password: password123
Access: Caregiver dashboard (monitoring, analytics)
```

### Creating Additional Users

```bash
# Create a new senior user
curl -X POST http://localhost:8080/register \
  -H "Content-Type: application/json" \
  -d "{\"username\":\"senior2\",\"password\":\"password123\",\"role\":\"senior\",\"profile\":{\"name\":\"Jane Doe\",\"email\":\"jane@example.com\",\"contact\":\"+65 9999 9999\"}}"

# Create a new family user
curl -X POST http://localhost:8080/register \
  -H "Content-Type: application/json" \
  -d "{\"username\":\"family2\",\"password\":\"password123\",\"role\":\"family\",\"profile\":{\"name\":\"Mike Chen\",\"email\":\"mike@example.com\",\"contact\":\"+65 8888 8888\"}}"
```

---

## 📚 Detailed Documentation

Comprehensive guides and documentation are available in the `informational reading/` folder:

| Document | Description |
|----------|-------------|
| **UNIFIED_LOGIN_GUIDE.md** | Complete guide to the unified login system |
| **ARCHITECTURE_DIAGRAMS.txt** | Detailed system architecture diagrams |
| **AUTH_ROUTING_OVERVIEW.md** | Authentication and routing mechanisms |
| **DOCKER_LAB_GUIDE.md** | Docker deployment and management |
| **FRONTEND_STRUCTURE.md** | Frontend architecture and components |
| **QUICK_AUTH_REFERENCE.md** | Quick reference for authentication |

---

## 🛠️ Tech Stack

### Frontend
- **Framework**: React 18 with TypeScript
- **UI Library**: Material-UI (MUI) v5
- **Charts**: Recharts
- **HTTP Client**: Axios
- **Routing**: React Router v7
- **State Management**: React Hooks

### Backend
- **Runtime**: Node.js 18
- **Framework**: Express.js 5
- **Database**: MongoDB 8
- **ODM**: Mongoose
- **Message Broker**: MQTT (HiveMQ Community)
- **Authentication**: JWT (jsonwebtoken)
- **Password Hashing**: bcrypt
- **Unique IDs**: uuid

### DevOps
- **Containerization**: Docker
- **Orchestration**: Docker Compose
- **Web Server**: Nginx (for frontend static files)
- **Health Checks**: Built-in Docker health checks

---

## 📦 Project Structure

```
CSC3104_Cloud_Project_Grp25/
├── front-end/                    # Frontend applications
│   ├── admin-portal/             # Admin management portal
│   │   ├── src/
│   │   │   ├── pages/           # React pages (Login, Dashboard, etc.)
│   │   │   ├── components/      # Reusable components
│   │   │   ├── services/        # API service layer
│   │   │   └── types/           # TypeScript types
│   │   ├── Dockerfile
│   │   └── package.json
│   ├── senior-app/               # Senior citizen application
│   │   ├── src/
│   │   │   ├── pages/           # Games, activities, check-in
│   │   │   ├── components/
│   │   │   └── theme/
│   │   ├── Dockerfile
│   │   └── package.json
│   └── caregiver-dashboard/      # Family/caregiver dashboard
│       ├── src/
│       │   ├── pages/           # Dashboard, analytics, activities
│       │   └── api/
│       ├── Dockerfile
│       └── package.json
├── api/                          # API Gateway (Main backend)
│   ├── mqtt/                     # MQTT client implementation
│   ├── routes/                   # Express routes
│   ├── app.js                    # Main application
│   ├── seed-admin.js             # Admin user seeding script
│   ├── Dockerfile
│   └── package.json
├── games-service/                # Games microservice
│   ├── mqtt/                     # MQTT client
│   ├── services/                 # Game logic services
│   ├── app.js
│   ├── populate.js               # Database seeding
│   ├── Dockerfile
│   └── package.json
├── informational reading/        # Documentation
│   ├── UNIFIED_LOGIN_GUIDE.md
│   ├── ARCHITECTURE_DIAGRAMS.txt
│   └── ... (other documentation)
├── docker-compose.yml            # Docker orchestration
└── README.md                     # This file
```

---

## 🔧 Advanced Usage

### Docker Commands

```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f [service-name]

# Check service status
docker-compose ps

# Restart a specific service
docker-compose restart api-gateway

# Stop all services
docker-compose down

# Clean rebuild (removes all images and rebuilds)
docker-compose down
docker rmi seniorcare-admin-portal:v2 seniorcare-api:v2 seniorcare-caregiver-dashboard:v2 seniorcare-senior-app:v2 seniorcare-games:v2
docker-compose build --no-cache
docker-compose up -d
```

### Database Management

```bash
# Access MongoDB (Main)
docker exec -it mongodb-main mongosh seniorcare

# View all users
db.users.find({}, {username: 1, role: 1, 'profile.name': 1})

# Access MongoDB (Games)
docker exec -it mongodb-games mongosh games-db

# View game sessions
db.gamesessions.find().limit(5)
```

### API Testing

```bash
# Test login
curl -X POST http://localhost:8080/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}'

# Test authentication endpoint
curl http://localhost:8080/

# Check games service health
curl http://localhost:8081/health
```

---

## 🐛 Troubleshooting

### Services Won't Start

```bash
# Check if ports are already in use
netstat -ano | findstr "3000 3001 3002 8080 8081 27017"

# Clean up and restart
docker-compose down -v
docker-compose up -d
```

### Login Issues

1. **"Login failed"**:
   - Verify API gateway is running: `docker logs api-gateway`
   - Check MongoDB is healthy: `docker ps | grep mongodb-main`

2. **"Cannot connect to API"**:
   - Ensure API is on port 8080: `curl http://localhost:8080`
   - Check frontend .env is correct

3. **Wrong redirect after login**:
   - Clear browser localStorage
   - Verify user role in database

### Database Connection Issues

```bash
# Check MongoDB logs
docker logs mongodb-main
docker logs mongodb-games

# Restart MongoDB
docker-compose restart mongodb-main mongodb-games

# Verify connection
docker exec mongodb-main mongosh seniorcare --eval "db.stats()"
```

### Frontend Not Loading

```bash
# Check frontend container status
docker ps --filter "name=admin-portal"

# View frontend logs
docker logs admin-portal

# Rebuild frontend
docker-compose build admin-portal
docker-compose up -d admin-portal
```

### MQTT Issues

```bash
# Check HiveMQ logs
docker logs hivemq

# Restart MQTT broker
docker-compose restart hivemq

# Access HiveMQ control center
# Open: http://localhost:8000
```

---

## 🔒 Security Notes

**⚠️ Current Implementation**: For **development only**

- Tokens stored in localStorage (vulnerable to XSS)
- No token refresh mechanism
- No session timeout
- HTTP only (not HTTPS)
- Simple password validation

**For Production**:
- Use HTTP-only cookies
- Implement token refresh
- Add CSRF protection
- Enable HTTPS/TLS
- Add rate limiting
- Implement session timeout
- Use environment-specific secrets

---

## 🤝 Development Workflow

### Local Development (Without Docker)

1. **Start infrastructure only:**
   ```bash
   docker-compose up -d hivemq mongodb-main mongodb-games
   ```

2. **Run backend services:**
   ```bash
   # Terminal 1: API Gateway
   cd api
   npm install
   npm start

   # Terminal 2: Games Service
   cd games-service
   npm install
   npm run dev
   ```

3. **Run frontend applications:**
   ```bash
   # Terminal 3: Admin Portal
   cd front-end/admin-portal
   npm install
   npm start

   # Terminal 4: Senior App
   cd front-end/senior-app
   npm install
   npm start

   # Terminal 5: Caregiver Dashboard
   cd front-end/caregiver-dashboard
   npm install
   npm start
   ```

### Making Changes

1. Create feature branch
2. Make changes in appropriate service
3. Test locally
4. Build and test with Docker
5. Create pull request

---

## 📊 API Endpoints Reference

### Authentication Endpoints

| Method | Endpoint | Auth Required | Description |
|--------|----------|---------------|-------------|
| POST | `/register` | No | Create new user account |
| POST | `/login` | No | User login (all roles) |

### Protected Endpoints (Require JWT)

| Method | Endpoint | Role | Description |
|--------|----------|------|-------------|
| POST | `/checkin` | Senior | Daily check-in |
| POST | `/add-task` | Senior | Add engagement task |
| POST | `/add-relation` | Senior | Link family member |
| GET | `/api/games/*` | All | Game endpoints |

### Games Service (MQTT Topics)

- `games/request/list` - Get available games
- `games/request/trivia` - Get trivia questions
- `games/request/memory` - Get memory cards
- `games/request/stretch` - Get stretch exercises
- `games/session/start` - Start game session
- `games/session/complete` - Complete game session

---

## 👥 Team - Group 25

CSC3104 Cloud Computing Project

---

## 📄 License

This project is for educational purposes as part of the CSC3104 Cloud Computing course.

---

## 🎓 Course Information

**Course**: CSC3104 Cloud Computing
**Institution**: [Your University]
**Academic Year**: 2024/2025

---

**Last Updated**: November 2025
**Version**: 2.0
