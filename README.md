

# CSC3104_Cloud_Project_Grp25

## ElderCare Connect - Cloud-Based Senior Care Platform

A comprehensive cloud-native platform for elderly care management featuring AI companionship, real-time notifications, and intelligent monitoring systems.

### Quick Start

```bash
# Backend services
cd backend
docker compose up -d

# Admin portal
cd admin-portal
npm install
npm start
```

### Project Structure

- `backend/` - Microservices (AI, notifications, dispatchers)
- `admin-portal/` - React TypeScript admin interface
- `k3d/` - Kubernetes deployment configs

See [Backend README](backend/README.md) for detailed documentation.


## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [System Architecture](#system-architecture)
- [Technology Stack](#technology-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Services Documentation](#services-documentation)
- [API Documentation](#api-documentation)
- [Deployment](#deployment)
- [Contributing](#contributing)
- [License](#license)

## 🌟 Overview

**ElderCare Connect** is an innovative cloud-based platform designed to address the growing need for comprehensive elderly care management in Singapore. The system combines microservices architecture, AI-powered companionship, and multi-channel notification systems to ensure the safety, wellbeing, and social connectivity of senior citizens.

### Problem Statement

- **Social Isolation**: 28% of Singaporean seniors live alone
- **Healthcare Monitoring**: Need for medication reminders and health tracking
- **Emergency Response**: Delayed responses to urgent situations
- **Family Communication**: Challenges in keeping families connected

### Solution

A cloud-native platform offering:
- **AI Companion** with real Singapore community event data and weather information
- **Multi-channel Notifications** (SMS, Email, Push) with MQTT message broker
- **Phone Verification** with OTP for secure family communication
- **Admin Portal** for care management and monitoring
- **Scalable Microservices** architecture for high availability

## ✨ Features

### 🤖 AI Companion Service
- **Natural Language Processing** using Google Gemini 2.0 Flash
- **Real-time Singapore Data**:
  - Community events by neighborhood (Hougang, Tampines, etc.)
  - Weather forecasts with elderly safety recommendations
  - Time-aware suggestions (morning exercise, afternoon heat warnings)
- **Intent Detection**: Loneliness support, medication reminders, family SMS, volunteer connection
- **Sentiment Analysis** for emotional wellbeing monitoring

### 📨 Notification Services
- **SMS Dispatcher**: Twilio integration with rate limiting
- **Email Dispatcher**: Gmail SMTP for family updates
- **Push Notifications**: Firebase Cloud Messaging for mobile alerts
- **MQTT Message Broker**: HiveMQ for reliable event-driven communication
- **Real-time Delivery**: QoS 1 guaranteed message delivery

### 📱 Phone Verification System
- **OTP Verification**: Twilio Verify API for secure phone validation
- **Verified Contacts**: Save family/caregiver phone numbers
- **Urgent Messaging**: Send emergency SMS to all verified contacts
- **Rate Limiting**: 10-minute cooldown to prevent abuse

### 🎮 Admin Portal (React + TypeScript)
- **User Management**: View and manage elderly user profiles
- **Service Monitoring**: Real-time health checks of all microservices
- **Analytics Dashboard**: System usage and notification metrics
- **Recent Activity**: Audit logs of notifications and user actions

### 📊 Monitoring & Observability
- **Prometheus Metrics**: Service performance and health metrics
- **Grafana Dashboards**: Visual monitoring (removed in current architecture)
- **Health Checks**: `/health` endpoints on all services
- **Structured Logging**: Winston for centralized log management

## 🏗️ System Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         Client Layer                             │
├──────────────────┬─────────────────┬──────────────────┬─────────┤
│  Mobile App      │  Admin Portal   │  Testing UI      │  Web    │
│  (React Native)  │  (React/TS)     │  (HTML/JS)       │  Portal │
└──────────────────┴─────────────────┴──────────────────┴─────────┘
                              │
                    ┌─────────▼──────────┐
                    │   Load Balancer    │
                    └─────────┬──────────┘
                              │
         ┌────────────────────┼────────────────────┐
         │                    │                    │
┌────────▼────────┐  ┌────────▼────────┐  ┌──────▼──────┐
│ Event Dispatcher │  │  AI Companion   │  │ Push Notif  │
│   Service        │  │    Service      │  │  Service    │
│   (Port 4001)    │  │  (Port 4015)    │  │ (Port 4007) │
└────────┬────────┘  └────────┬────────┘  └──────┬──────┘
         │                    │                    │
         └────────────────────┼────────────────────┘
                              │
                    ┌─────────▼──────────┐
                    │   MQTT Broker      │
                    │   (HiveMQ)         │
                    │   QoS 1 Delivery   │
                    └─────────┬──────────┘
                              │
         ┌────────────────────┼────────────────────┐
         │                    │                    │
┌────────▼────────┐  ┌────────▼────────┐  ┌──────▼──────┐
│ SMS Dispatcher  │  │ Email Dispatcher│  │   MongoDB   │
│  (Port 4005)    │  │  (Port 4006)    │  │  Database   │
└────────┬────────┘  └────────┬────────┘  └─────────────┘
         │                    │
    ┌────▼────┐          ┌───▼────┐
    │ Twilio  │          │ Gmail  │
    │   SMS   │          │  SMTP  │
    └─────────┘          └────────┘
```

### Microservices Overview

| Service | Port | Technology | Purpose |
|---------|------|------------|---------|
| **Event Dispatcher** | 4001 | Node.js/Express | Main API gateway, event orchestration |
| **AI Companion** | 4015 | Node.js/Gemini AI | Conversational AI with 12-model failover |
| **AI Companion** | 4015 | Node.js/Gemini AI | Conversational AI with real Singapore data |
| **Push Notification** | 4007 | Node.js/FCM | Firebase push notifications |
| **SMS Dispatcher** | 4005 | Node.js/Twilio | SMS delivery and OTP verification |
| **Email Dispatcher** | 4006 | Node.js/Nodemailer | Email notifications |
| **Admin Portal** | 3000 | React/TypeScript | Web-based management interface |
| **HiveMQ** | 1883 | MQTT Broker | Message broker for event-driven architecture |
| **MongoDB** | 27017 | NoSQL Database | User data, verified phones, conversations |

### Communication Flow

```
User Request → Event Dispatcher → MQTT Topic → Dispatchers → External APIs
                                     ↓
                                 MongoDB (Persistence)
```

### Message Flow Example

```
1. Mobile app requests SMS: POST /events → Event Dispatcher
2. Event Dispatcher publishes to MQTT: topic "notification/events"
3. SMS Dispatcher subscribes to MQTT, receives event
4. SMS Dispatcher calls Twilio API
5. Twilio sends SMS to user
6. SMS Dispatcher logs result to MongoDB
```

## 🛠️ Technology Stack

### Backend Services
- **Runtime**: Node.js 18+
- **Framework**: Express.js
- **Language**: JavaScript (ES6+)
- **AI**: Google Gemini 2.0 Flash Thinking Experimental
- **Messaging**: MQTT (HiveMQ) with QoS 1
- **Database**: MongoDB with Mongoose ODM
- **Logging**: Winston for structured logs
- **Monitoring**: Prometheus metrics

### Frontend
- **Framework**: React 18+
- **Language**: TypeScript 5+
- **Styling**: CSS3, Tailwind CSS
- **HTTP Client**: Axios
- **State Management**: React Hooks

### External Services
- **SMS**: Twilio SMS & Verify API
- **Email**: Gmail SMTP (Nodemailer)
- **Push**: Firebase Cloud Messaging (FCM)
- **AI**: Google AI Studio (Gemini 2.5 Flash with 12-model failover)
- **Location**: Google Places API (community center searches)
- **Weather**: Mock Singapore data (production: data.gov.sg API)

### DevOps & Infrastructure
- **Containerization**: Docker & Docker Compose
- **Orchestration**: K3d (Kubernetes) support
- **CI/CD**: GitHub Actions (planned)
- **Cloud**: AWS/Azure compatible (containerized)

## 📁 Project Structure

```
CSC3104_Cloud_Project_Grp25/
│
├── backend/                          # Backend microservices
│   ├── services/
│   │   ├── event-dispatcher-service/ # Main API gateway
│   │   ├── ai-companion-service/     # AI chatbot (12 Gemini models + Google Places)
│   │   ├── sms-dispatcher-service/   # SMS notifications
│   │   ├── email-dispatcher-service/ # Email notifications
│   │   └── push-notification-service/# Firebase push
│   │
│   ├── docker-compose.yml            # Service orchestration
│   ├── docker-compose.override.yml   # Local development overrides
│   └── README.md                     # Backend documentation
│
├── admin-portal/                     # React admin interface
│   ├── src/
│   │   ├── components/               # React components
│   │   ├── services/                 # API clients
│   │   └── types/                    # TypeScript definitions
│   ├── package.json
│   └── README.md
│
├── k3d/                              # Kubernetes deployment
│   ├── k3d-config.yaml               # K3d cluster config
│   ├── Makefile                      # Deployment scripts
│   └── README.md
│
└── README.md                         # This file
```

## 🚀 Getting Started

### Prerequisites

- **Docker Desktop** 24.0+ ([Windows](https://www.docker.com/products/docker-desktop/) / [Mac](https://www.docker.com/products/docker-desktop/) / [Linux](https://docs.docker.com/engine/install/))
- **Node.js** 18+ (for local development)
- **Git** 2.30+
- **External Service Accounts** (see [Configuration](#configuration))

### Quick Start

```powershell
# 1. Clone repository
git clone https://github.com/Clairerang/CSC3104_Cloud_Project_Grp25.git
cd CSC3104_Cloud_Project_Grp25

# 2. Setup backend services
cd backend
Copy-Item config/secrets/.env.example config/secrets/.env
# Edit config/secrets/.env with your credentials

# 3. Start all services
docker compose up -d

# 4. Verify services
docker compose ps

# 5. Access applications
# - Admin Portal: http://localhost:3001
# - AI Companion API: http://localhost:4015
# - Event Dispatcher: http://localhost:4001
# - Testing UI: http://localhost:4001/testing-notification/
```

### Configuration

Create `backend/config/secrets/.env`:

```env
# Twilio SMS (https://console.twilio.com/)
SMS_PROVIDER=twilio
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=xxxxxxxxxxxxxxxxx
TWILIO_FROM=+1234567890
TWILIO_VERIFY_SERVICE_SID=VAxxxxxxxxx

# Gmail SMTP (App Password)
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=xxxx xxxx xxxx xxxx
EMAIL_FROM=your-email@gmail.com

# Firebase (https://console.firebase.google.com/)
FIREBASE_API_KEY=AIzaSyXXXXXXXXXX
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_VAPID_KEY=BXXXXXXXXXXXXXXX

# Google AI Studio (https://ai.google.dev/)
GOOGLE_AI_API_KEY=AIzaSyXXXXXXXXXX

# Google Places API (https://console.cloud.google.com/)
GOOGLE_PLACES_API_KEY=AIzaSyXXXXXXXXXX

# MongoDB (auto-configured)
MONGO_URI=mongodb://mongo:27017/notification

# MQTT Broker (auto-configured)
MQTT_BROKER_URL=mqtt://hivemq:1883
```

See [Backend README](backend/README.md) for detailed configuration guide.

## 📖 Services Documentation

### Event Dispatcher Service
Main API gateway for all notification requests.

```bash
# Send notification event
POST http://localhost:4001/events
Content-Type: application/json

{
  "type": "sms",
  "userId": "user123",
  "message": "Your medication reminder",
  "phoneNumber": "+6512345678"
}
```

[Full API Documentation](backend/services/event-dispatcher-service/README.md)

### AI Companion Service
Conversational AI with 12-model failover and real-time data integration.

```bash
# Chat with AI
POST http://localhost:4015/chat
Content-Type: application/json

{
  "userId": "user123",
  "message": "What community events are near me?"
}

# Response includes real Google Places venues:
# - The Serangoon Community Club (⭐ 4.2/5, ✅ Open now)
# - Punggol Community Club (⭐ 4.3/5, ✅ Open now)
# - Real addresses, ratings, and operating hours
# - Personalized based on user's profile location
```

**Features**:
- 12 Gemini models with automatic failover
- Primary: `gemini-2.5-flash` (100% success rate)
- Google Places API integration for real venue data
- Client-side rate limiting (10 RPM)
- Context-aware responses with user location

**Features**:
- ✅ Real Singapore community events by neighborhood
- ✅ Time-aware weather recommendations
- ✅ Sentiment analysis for wellbeing monitoring
- ✅ Intent detection (7 core intents)

[Full AI Documentation](backend/services/ai-companion-service/README.md)

### SMS Dispatcher Service
SMS delivery with Twilio integration.

```bash
# Send SMS
POST http://localhost:4005/send-sms
{
  "to": "+6512345678",
  "message": "Test message"
}

# OTP Verification
POST http://localhost:4005/verify/send
{
  "to": "+6512345678",
  "channel": "sms"
}

POST http://localhost:4005/verify/check
{
  "to": "+6512345678",
  "code": "123456"
}
```

### Admin Portal
React-based management interface.

```bash
# Start admin portal (development)
cd admin-portal
npm install
npm start

# Access at http://localhost:3000
```

**Features**:
- User management and profiles
- Service health monitoring
- Analytics dashboard
- Recent activity logs

[Admin Portal README](admin-portal/README.md)

## 🧪 Testing

### Browser Testing

**Testing UI**: http://localhost:4001/testing-notification/

1. **SMS Test**: Send test SMS to verified numbers
2. **Email Test**: Send test emails
3. **Push Test**: Test Firebase notifications
4. **AI Chat Test**: Interact with AI companion

### PowerShell API Testing

```powershell
# Test AI Companion
$body = @{
  userId = "test123"
  message = "What's the weather like?"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:4015/chat" `
  -Method POST `
  -ContentType "application/json" `
  -Body $body

# Test SMS
$body = @{
  to = "+6512345678"
  message = "Test SMS"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:4005/send-sms" `
  -Method POST `
  -ContentType "application/json" `
  -Body $body
```

### Service Health Checks

```powershell
# Check all services
docker compose ps

# Individual health endpoints
Invoke-RestMethod http://localhost:4001/health  # Event Dispatcher
Invoke-RestMethod http://localhost:4015/health  # AI Companion
Invoke-RestMethod http://localhost:4007/health  # Push Notification
```

## 🐛 Troubleshooting

### Common Issues

**Services won't start**:
```powershell
docker compose logs <service-name>
docker compose restart <service-name>
```

**Port conflicts**:
```powershell
netstat -ano | findstr "4001"  # Find process
Stop-Process -Id <PID>         # Kill process
```

**MQTT connection issues**:
```powershell
docker logs hivemq --tail 50
docker restart hivemq
```

**Database issues**:
```powershell
docker exec -it mongo mongosh notification
# Run: db.stats()
```

See [Backend README](backend/README.md#troubleshooting) for detailed troubleshooting.

## 📦 Deployment

### Docker Compose (Local/Staging)

```powershell
# Production build
docker compose -f docker-compose.yml up -d --build

# View logs
docker compose logs -f

# Stop services
docker compose down
```

### Kubernetes (K3d)

```bash
# Create cluster
cd k3d
make create-cluster

# Deploy services
make deploy

# Check status
kubectl get pods
kubectl get services
```

[K3d Deployment Guide](k3d/README.md)

### Cloud Deployment (AWS/Azure)

1. **Container Registry**: Push images to ECR/ACR
2. **ECS/AKS**: Deploy using Kubernetes manifests
3. **Secrets Management**: AWS Secrets Manager / Azure Key Vault
4. **Load Balancer**: ALB / Azure Load Balancer
5. **Monitoring**: CloudWatch / Azure Monitor

## 🤝 Contributing

### Development Workflow

1. **Fork & Clone**:
```bash
git clone https://github.com/YOUR_USERNAME/CSC3104_Cloud_Project_Grp25.git
cd CSC3104_Cloud_Project_Grp25
git checkout -b feature/your-feature-name
```

2. **Make Changes**: Follow code style guidelines

3. **Test**:
```powershell
# Test backend
cd backend
docker compose up -d --build
# Run manual tests

# Test frontend
cd admin-portal
npm test
```

4. **Commit**:
```bash
git add .
git commit -m "feat: add new feature"
git push origin feature/your-feature-name
```

5. **Pull Request**: Create PR to `main` branch

### Code Style

- **JavaScript**: ES6+, async/await
- **TypeScript**: Strict mode enabled
- **Naming**: camelCase for functions, PascalCase for components
- **Comments**: JSDoc for functions, inline for complex logic

### Commit Message Convention

```
feat: add new feature
fix: bug fix
docs: documentation update
style: formatting changes
refactor: code restructuring
test: add tests
chore: maintenance tasks
```

## 📄 License

This project is licensed under the MIT License - see [LICENSE](LICENSE) file.

## 👥 Team

**CSC3104 Cloud Computing - Group 25**

- Project Lead: [Name]
- Backend Developer: [Name]
- Frontend Developer: [Name]
- AI/ML Engineer: [Name]
- DevOps Engineer: [Name]

## 📞 Support

- **Issues**: [GitHub Issues](https://github.com/Clairerang/CSC3104_Cloud_Project_Grp25/issues)
- **Documentation**: [Wiki](https://github.com/Clairerang/CSC3104_Cloud_Project_Grp25/wiki)
- **Email**: [team email]

## 🙏 Acknowledgments

- **Singapore Open Data**: [data.gov.sg](https://data.gov.sg)
- **Google AI Studio**: [ai.google.dev](https://ai.google.dev)
- **Twilio**: [twilio.com](https://www.twilio.com)
- **Firebase**: [firebase.google.com](https://firebase.google.com)
- **HiveMQ**: [hivemq.com](https://www.hivemq.com)

---

**Version**: 2.0.0  
**Last Updated**: November 2025  
**Status**: Active Development 🚀
