## Senior Care Management System - Microservices Architecture

This guide follows the Lab 02 requirements for building cloud-native web service applications with Docker containers.

---

## 📋 System Architecture

```
┌──────────────────────────────────────────────────────────────┐
│                  Docker Containerized Services               │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  Frontend Layer (Nginx):                                     │
│  ├─ Senior App          (Port 3000)  - React/TypeScript      │
│  ├─ Admin Portal        (Port 3001)  - React/TypeScript      │
│  └─ Caregiver Dashboard (Port 3002)  - React/TypeScript      │
│                                                              │
│  Backend Services (Node.js):                                 │
│  ├─ API Gateway         (Port 8080)  - Express/MongoDB       │
│  └─ Games Service       (Port 8081)  - Express/MongoDB       │
│                                                              │
│  Infrastructure:                                             │
│  ├─ HiveMQ MQTT Broker  (Ports 1883, 8000)                   │
│  ├─ MongoDB Main        (Port 27017)                         │
│  └─ MongoDB Games       (Port 27018)                         │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

---

## 🐳 Lab 02 Task Completion

### ✅ Task 1: Install Docker on Local Machine

```bash
# Verify Docker installation
docker --version
docker info

# Test Docker with hello-world
docker run hello-world
```

### ✅ Task 2: Build Docker Images

Following the lab requirements, we have created individual Dockerfiles for each service:

#### Build Individual Images (Lab Pattern)

```bash
# Build API Gateway
cd api
docker build . -t seniorcare-api:v2
docker images  # Verify creation

# Build Games Service
cd ../games-service
docker build . -t seniorcare-games:v2
docker images  # Verify creation

# Build Senior App
cd ../front-end/senior-app
docker build . -t seniorcare-senior-app:v2
docker images  # Verify creation

# Build Admin Portal
cd ../admin-portal
docker build . -t seniorcare-admin-portal:v2
docker images  # Verify creation

# Build Caregiver Dashboard
cd ../caregiver-dashboard
docker build . -t seniorcare-caregiver-dashboard:v2
docker images  # Verify creation
```

#### Or Build All at Once with Docker Compose

```bash
cd /path/to/project/root
docker compose build
```

### ✅ Task 3: Run Docker Containers

#### Start All Services

```bash
# Start everything
docker compose up -d

# Check running containers
docker compose ps
docker ps

# View logs
docker compose logs -f

# View specific service logs
docker compose logs -f senior-app
docker compose logs -f api-gateway
```

#### Run Individual Containers (Lab Pattern)

```bash
# Create network first
docker network create seniorcare-network

# Start MongoDB Main
docker run -d -p 27017:27017 \
  --name mongodb-main \
  --network seniorcare-network \
  mongo:latest

# Start MongoDB Games
docker run -d -p 27018:27017 \
  --name mongodb-games \
  --network seniorcare-network \
  mongo:latest

# Start HiveMQ
docker run -d -p 1883:1883 -p 8000:8000 \
  --name hivemq \
  --network seniorcare-network \
  hivemq/hivemq-ce:latest

# Start API Gateway
docker run -d -p 8080:8080 \
  --name api-gateway \
  --network seniorcare-network \
  -e MONGODB_URI=mongodb://mongodb-main:27017/seniorcare \
  -e MQTT_BROKER_URL=mqtt://hivemq:1883 \
  seniorcare-api:v2

# Start Games Service
docker run -d -p 8081:8081 \
  --name games-service \
  --network seniorcare-network \
  -e MONGODB_URI=mongodb://mongodb-games:27017/games \
  -e MQTT_BROKER_URL=mqtt://hivemq:1883 \
  seniorcare-games:v2

# Start Senior App
docker run -d -p 3000:80 \
  --name senior-app \
  --network seniorcare-network \
  seniorcare-senior-app:v2

# Check if running
docker ps
```

#### Access the Applications

Once all containers are running:

- **Senior App**: http://localhost:3000
- **Admin Portal**: http://localhost:3001
- **Caregiver Dashboard**: http://localhost:3002
- **API Gateway**: http://localhost:8080
- **Games Service**: http://localhost:8081/health
- **HiveMQ Control Center**: http://localhost:8000
- **MongoDB Main**: mongodb://localhost:27017
- **MongoDB Games**: mongodb://localhost:27018

### ✅ Task 4: Interactively Update Running Container

Following Lab 02 Task 3 pattern:

```bash
# Enter a running container
docker exec -it api-gateway sh

# Navigate and explore
cd /app
ls -la

# Install text editor (if needed)
apk add vim

# Edit a file
vim app.js
# Make your changes...

# Exit container
exit

# Save changes to new image (Lab 02 Task 4 pattern)
docker commit api-gateway seniorcare-api:v3

# Verify new image
docker images

# Run container from updated image
docker run -d -p 8082:8080 --name api-gateway-v3 seniorcare-api:v3

# Verify it's running
docker ps
```

### ✅ Task 5: Upload Docker Images to Docker Hub

```bash
# 1. Login to Docker Hub
docker login

# 2. Tag images with your Docker Hub username
docker tag seniorcare-api:v2 <YOUR_USERNAME>/seniorcare-api:v2
docker tag seniorcare-games:v2 <YOUR_USERNAME>/seniorcare-games:v2
docker tag seniorcare-senior-app:v2 <YOUR_USERNAME>/seniorcare-senior-app:v2
docker tag seniorcare-admin-portal:v2 <YOUR_USERNAME>/seniorcare-admin-portal:v2
docker tag seniorcare-caregiver-dashboard:v2 <YOUR_USERNAME>/seniorcare-caregiver-dashboard:v2

# 3. Push to Docker Hub
docker push <YOUR_USERNAME>/seniorcare-api:v2
docker push <YOUR_USERNAME>/seniorcare-games:v2
docker push <YOUR_USERNAME>/seniorcare-senior-app:v2
docker push <YOUR_USERNAME>/seniorcare-admin-portal:v2
docker push <YOUR_USERNAME>/seniorcare-caregiver-dashboard:v2

# 4. Verify on Docker Hub
# Visit https://hub.docker.com and check your repositories
```

---

## 📁 Dockerfile Explanations

### Backend Services (API Gateway & Games Service)

```dockerfile
# Use official Node.js runtime
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install --production

# Copy application code
COPY . .

# Expose port
EXPOSE 8080  # or 8081 for games service

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=40s \
  CMD node -e "require('http').get('http://localhost:8080/', (res) => process.exit(res.statusCode === 200 ? 0 : 1))"

# Start the service
CMD ["node", "app.js"]  # or server.js for games service
```

**Explanation:**
- `FROM`: Base image (Node.js 18 on Alpine Linux)
- `WORKDIR`: Sets working directory inside container
- `COPY package*.json`: Copies dependency files
- `RUN npm install`: Installs Node.js dependencies
- `COPY . .`: Copies all application code
- `EXPOSE`: Documents which port the app uses
- `HEALTHCHECK`: Automated health monitoring
- `CMD`: Command to start the application

### Frontend Applications (React Apps)

```dockerfile
# Build stage
FROM node:18-alpine AS build

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy application code
COPY . .

# Build the application
RUN npm run build

# Production stage
FROM nginx:alpine

# Copy built assets from build stage
COPY --from=build /app/build /usr/share/nginx/html

# Expose port 80
EXPOSE 80

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=10s \
  CMD wget --quiet --tries=1 --spider http://localhost/ || exit 1

# Start nginx
CMD ["nginx", "-g", "daemon off;"]
```

**Explanation:**
- **Multi-stage build**: Separates build and runtime stages
- **Build stage**: Compiles React TypeScript code
- **Production stage**: Serves static files with Nginx
- **Benefits**: Smaller final image size (no build tools in production)

---

## 🔧 Common Docker Commands

### Container Management
```bash
# Start containers
docker compose start

# Stop containers
docker compose stop

# Restart containers
docker compose restart

# Stop and remove containers
docker compose down

# Stop and remove with volumes
docker compose down -v

# Remove individual container
docker rm -f <container_name>
```

### Image Management
```bash
# List all images
docker images

# Remove specific image
docker rmi <image_name>

# Remove dangling images
docker image prune

# Remove all unused images
docker image prune -a
```

### Logs and Debugging
```bash
# View logs
docker compose logs -f <service_name>
docker logs -f <container_name>

# Execute command in container
docker exec -it <container_name> sh
docker exec -it <container_name> /bin/bash

# Copy files to/from container
docker cp <local_path> <container_name>:<container_path>
docker cp <container_name>:<container_path> <local_path>

# Inspect container
docker inspect <container_name>

# View container resource usage
docker stats
```

### Network Management
```bash
# List networks
docker network ls

# Inspect network
docker network inspect seniorcare-network

# Create network
docker network create seniorcare-network
```

---

## 🗂️ Project Structure

```
CSC3104_Cloud_Project_Grp25/
├── docker-compose.yml           # Orchestrates all services
│
├── api/                         # API Gateway Service
│   ├── Dockerfile              # Container definition
│   ├── .dockerignore           # Files to exclude
│   ├── package.json            # Dependencies
│   └── app.js                  # Main application
│
├── games-service/              # Games Microservice
│   ├── Dockerfile
│   ├── .dockerignore
│   ├── package.json
│   └── server.js
│
└── front-end/
    ├── senior-app/             # Senior App Frontend
    │   ├── Dockerfile
    │   ├── .dockerignore
    │   ├── package.json
    │   └── src/
    │
    ├── admin-portal/           # Admin Portal Frontend
    │   ├── Dockerfile
    │   ├── .dockerignore
    │   ├── package.json
    │   └── src/
    │
    └── caregiver-dashboard/    # Caregiver Dashboard Frontend
        ├── Dockerfile
        ├── .dockerignore
        ├── package.json
        └── src/
```

---

## 🚀 Quick Start Commands

```bash
# Build all services
docker compose build

# Start all services
docker compose up -d

# View status
docker compose ps

# View logs
docker compose logs -f

# Stop all services
docker compose down

# Clean everything and restart
docker compose down -v
docker compose up -d --build
```

---

## 🔍 Troubleshooting

### Port Already in Use
```bash
# Find process using port
lsof -i :3000

# Kill process
kill -9 <PID>

# Or change port in docker-compose.yml
```

### Container Won't Start
```bash
# Check logs
docker compose logs <service_name>

# Remove and rebuild
docker compose down
docker compose up -d --build
```

### MongoDB Connection Issues
```bash
# Check MongoDB status
docker compose logs mongodb-main

# Restart MongoDB
docker compose restart mongodb-main

# Connect to MongoDB shell
docker exec -it mongodb-main mongosh
```

### Build Failures
```bash
# Clear Docker cache
docker builder prune

# Rebuild without cache
docker compose build --no-cache

# Check Docker disk space
docker system df
```

---

## ✅ Completion Checklist

- [ ] **Task 1**: Built Docker images for all services
- [ ] **Task 2**: Ran containers and verified web access
  - [ ] Senior App accessible at http://localhost:3000
  - [ ] Admin Portal accessible at http://localhost:3001
  - [ ] Caregiver Dashboard accessible at http://localhost:3002
  - [ ] API Gateway responding at http://localhost:8080
  - [ ] Games Service responding at http://localhost:8081/health
- [ ] **Task 3**: Modified running container and saved as new image
- [ ] **Task 4**: Tagged and pushed images to Docker Hub

---

## 📚 Additional Resources

- [Docker Documentation](https://docs.docker.com/)
- [Docker Compose Documentation](https://docs.docker.com/compose/)
- [Node.js Docker Best Practices](https://github.com/nodejs/docker-node/blob/main/docs/BestPractices.md)
- [React Docker Production Build](https://create-react-app.dev/docs/deployment/#docker)

---

**Completion Date**: November 6, 2025
**Project**: CSC3104 Cloud Computing - Senior Care Management System
