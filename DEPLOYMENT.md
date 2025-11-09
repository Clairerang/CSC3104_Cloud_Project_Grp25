# Senior Care Platform - Docker Deployment Guide

Complete guide for deploying the entire Senior Care Platform using Docker.

## 📋 Table of Contents

- [Architecture Overview](#architecture-overview)
- [Prerequisites](#prerequisites)
- [Quick Start](#quick-start)
- [Services](#services)
- [Configuration](#configuration)
- [Development vs Production](#development-vs-production)
- [Monitoring & Health Checks](#monitoring--health-checks)
- [Troubleshooting](#troubleshooting)
- [Useful Commands](#useful-commands)

## 🏗️ Architecture Overview

The Senior Care Platform consists of the following containerized services:

```
┌─────────────────────────────────────────────────────────────┐
│                    Senior Care Platform                      │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌──────────────┐      ┌──────────────┐                     │
│  │   Frontend   │      │  API Gateway │                     │
│  │   (React)    │─────▶│  (Node.js)   │                     │
│  │  Port: 3000  │      │  Port: 8080  │                     │
│  └──────────────┘      └───────┬──────┘                     │
│                                │                              │
│                         ┌──────▼───────┐                     │
│                         │   MongoDB    │                     │
│                         │  (Main DB)   │                     │
│                         │ Port: 27017  │                     │
│                         └──────────────┘                     │
│                                                               │
│  ┌──────────────┐      ┌──────────────┐                     │
│  │Games Service │      │   MongoDB    │                     │
│  │  (Node.js)   │─────▶│  (Games DB)  │                     │
│  │  Port: 8081  │      │ Port: 27018  │                     │
│  └──────┬───────┘      └──────────────┘                     │
│         │                                                     │
│         │              ┌──────────────┐                     │
│         └─────────────▶│   HiveMQ     │                     │
│                        │ MQTT Broker  │                     │
│                        │ Port: 1883   │                     │
│                        └──────────────┘                     │
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

## ⚙️ Prerequisites

- **Docker**: Version 20.10 or higher
- **Docker Compose**: Version 1.29 or higher
- **System Requirements**:
  - 4GB RAM minimum (8GB recommended)
  - 10GB free disk space
  - Ports available: 3000, 8080, 8081, 1883, 8000, 8888, 27017, 27018

## 🚀 Quick Start

### 1. Clone the repository

```bash
git clone <repository-url>
cd CSC3104_Cloud-_Project_Grp25
```

### 2. Start all services

```bash
docker-compose up -d
```

This will:
- Build all Docker images
- Start all containers
- Set up the network
- Initialize databases

### 3. Verify services are running

```bash
docker-compose ps
```

All services should show as "Up" and "healthy".

### 4. Access the applications

- **Frontend**: http://localhost:3000
- **API Gateway**: http://localhost:8080
- **Games Service**: http://localhost:8081
- **HiveMQ Control Center**: http://localhost:8888

## 📦 Services

### Frontend (Port 3000)

- **Technology**: React with TypeScript, Material-UI
- **Purpose**: User interface for admin, caregiver, and senior users
- **Container**: nginx:alpine (production build)
- **Health Check**: `/health` endpoint

### API Gateway (Port 8080)

- **Technology**: Node.js Express
- **Purpose**: Main REST API with MQTT integration
- **Database**: MongoDB (mongodb-main)
- **Features**:
  - User authentication
  - User management
  - MQTT message publishing

### Games Service (Port 8081)

- **Technology**: Node.js Express
- **Purpose**: Microservice for managing games
- **Database**: MongoDB (mongodb-games)
- **Features**:
  - Game management
  - MQTT integration
  - Independent scaling

### HiveMQ MQTT Broker

- **Ports**:
  - 1883: MQTT protocol
  - 8000: WebSocket
  - 8888: Control Center UI
- **Purpose**: Message broker for real-time communication

### MongoDB Instances

- **mongodb-main** (Port 27017): Main application database
- **mongodb-games** (Port 27018): Games service database

## ⚙️ Configuration

### Environment Variables

Each service can be configured via environment variables in `docker-compose.yml`:

#### Frontend
```yaml
REACT_APP_API_URL: http://localhost:8080
NODE_ENV: production
```

#### API Gateway
```yaml
PORT: 8080
MONGODB_URI: mongodb://mongodb-main:27017/cloud
MQTT_BROKER_URL: mqtt://hivemq:1883
JWT_SECRET: secret1234@
SERVICE_NAME: api-gateway
```

#### Games Service
```yaml
PORT: 8081
MONGODB_URI: mongodb://mongodb-games:27017/games
MQTT_BROKER_URL: mqtt://hivemq:1883
JWT_SECRET: secret1234@
SERVICE_NAME: games-service
```

### Custom Configuration

1. **Create environment file**:
```bash
cp .env.example .env
```

2. **Edit `.env` file** with your settings

3. **Update docker-compose.yml** to use env_file:
```yaml
services:
  api-gateway:
    env_file:
      - .env
```

## 🔄 Development vs Production

### Development Mode

For local development with hot-reload:

```bash
# Frontend (in frontend directory)
npm start

# API Gateway (in api directory)
npm start

# Games Service (in games-service directory)
npm run dev
```

### Production Mode

Use Docker Compose for production:

```bash
docker-compose up -d
```

## 🏥 Monitoring & Health Checks

### Health Check Endpoints

- **Frontend**: `http://localhost:3000/health`
- **API Gateway**: `http://localhost:8080/`
- **Games Service**: `http://localhost:8081/health`
- **HiveMQ**: `http://localhost:8888`

### View Service Health

```bash
docker-compose ps
```

### View Logs

```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f api-gateway
docker-compose logs -f games-service
docker-compose logs -f frontend
```

### Resource Usage

```bash
docker stats
```

## 🔧 Troubleshooting

### Services won't start

1. **Check port conflicts**:
```bash
lsof -i :3000
lsof -i :8080
lsof -i :8081
```

2. **Check Docker resources**:
```bash
docker system df
```

3. **Clean up and rebuild**:
```bash
docker-compose down -v
docker system prune -a
docker-compose up -d --build
```

### Database connection issues

1. **Check MongoDB health**:
```bash
docker exec mongodb-main mongosh --eval "db.adminCommand('ping')"
```

2. **Reset databases**:
```bash
docker-compose down -v
docker volume prune
docker-compose up -d
```

### Frontend can't connect to backend

1. **Check API Gateway is running**:
```bash
curl http://localhost:8080/
```

2. **Verify CORS settings** in API Gateway

3. **Check network connectivity**:
```bash
docker network inspect csc3104_cloud-_project_grp25_senior-care-network
```

### MQTT connection issues

1. **Check HiveMQ status**:
```bash
curl http://localhost:8888
```

2. **View MQTT logs**:
```bash
docker-compose logs hivemq
```

## 📝 Useful Commands

### Start/Stop Services

```bash
# Start all services
docker-compose up -d

# Start specific service
docker-compose up -d frontend

# Stop all services
docker-compose down

# Stop and remove volumes
docker-compose down -v
```

### Build/Rebuild

```bash
# Rebuild all images
docker-compose build

# Rebuild specific service
docker-compose build api-gateway

# Force rebuild and start
docker-compose up -d --build
```

### Database Operations

```bash
# Access MongoDB Main
docker exec -it mongodb-main mongosh cloud

# Access MongoDB Games
docker exec -it mongodb-games mongosh games

# Backup database
docker exec mongodb-main mongodump --out /data/backup

# Restore database
docker exec mongodb-main mongorestore /data/backup
```

### Scaling Services

```bash
# Scale games service to 3 instances
docker-compose up -d --scale games-service=3
```

### Clean Up

```bash
# Remove stopped containers
docker-compose rm

# Remove unused images
docker image prune

# Remove all unused resources
docker system prune -a --volumes
```

### View Service Details

```bash
# View all containers
docker-compose ps

# View container details
docker inspect api-gateway

# View network details
docker network inspect senior-care-network

# View volume details
docker volume ls
```

## 🔐 Security Considerations

### Production Deployment

1. **Change default secrets**:
   - Update `JWT_SECRET` in environment variables
   - Use strong MongoDB passwords
   - Enable authentication on MongoDB

2. **Use environment files**:
```bash
# Don't commit .env files to git
echo ".env" >> .gitignore
```

3. **Enable HTTPS**:
   - Use nginx reverse proxy with SSL
   - Configure Let's Encrypt certificates

4. **Network isolation**:
   - Use internal networks for services
   - Only expose necessary ports

## 📊 Performance Optimization

### Resource Limits

Add resource limits to docker-compose.yml:

```yaml
services:
  api-gateway:
    deploy:
      resources:
        limits:
          cpus: '1'
          memory: 512M
        reservations:
          cpus: '0.5'
          memory: 256M
```

### Database Optimization

1. **Enable MongoDB indexes**
2. **Set up connection pooling**
3. **Configure cache settings**

## 🚢 Deployment to Cloud

### AWS ECS

```bash
# Use ECS CLI
ecs-cli compose up
```

### Google Cloud Run

```bash
# Deploy each service
gcloud run deploy frontend --image gcr.io/project/frontend
```

### Kubernetes

```bash
# Convert to Kubernetes manifests
kompose convert
kubectl apply -f .
```

## 📞 Support

For issues and questions:
- Create an issue in the repository
- Check existing documentation
- Review logs for error messages

---

**Last Updated**: November 2024
**Version**: 1.0.0
