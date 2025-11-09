# Docker Deployment Guide - Senior Care Platform Frontend

This guide explains how to build and run the Senior Care Platform frontend using Docker.

## Prerequisites

- Docker installed (version 20.10 or higher)
- Docker Compose installed (version 1.29 or higher)

## Quick Start

### Using Docker Compose (Recommended)

1. **Build and start the container:**
   ```bash
   docker-compose up -d
   ```

2. **Access the application:**
   - Open your browser and navigate to: `http://localhost:3000`

3. **Stop the container:**
   ```bash
   docker-compose down
   ```

### Using Docker Commands

1. **Build the image:**
   ```bash
   docker build -t senior-care-frontend .
   ```

2. **Run the container:**
   ```bash
   docker run -d -p 3000:80 --name senior-care-frontend senior-care-frontend
   ```

3. **Stop the container:**
   ```bash
   docker stop senior-care-frontend
   docker rm senior-care-frontend
   ```

## Docker Architecture

### Multi-Stage Build

The Dockerfile uses a multi-stage build approach:

1. **Build Stage (Node.js 18 Alpine)**
   - Installs dependencies
   - Builds the React application
   - Optimizes for production

2. **Production Stage (Nginx Alpine)**
   - Copies built assets from build stage
   - Serves the application using Nginx
   - Minimal image size (~50MB)

### Features

- **Optimized Image Size**: Using Alpine Linux base images
- **Production Ready**: Built and served with Nginx
- **Health Checks**: Automated health monitoring
- **Gzip Compression**: Enabled for faster load times
- **Security Headers**: X-Frame-Options, X-Content-Type-Options, etc.
- **SPA Routing**: Configured to support React Router
- **Static Asset Caching**: 1-year cache for static files

## Configuration

### Environment Variables

You can pass environment variables during build or runtime:

```bash
docker build --build-arg REACT_APP_API_URL=https://api.example.com -t senior-care-frontend .
```

Or in docker-compose.yml:
```yaml
environment:
  - REACT_APP_API_URL=https://api.example.com
```

### Ports

- Container Port: `80`
- Host Port: `3000` (configurable in docker-compose.yml)

### Health Check

The container includes a health check endpoint:
- URL: `http://localhost/health`
- Interval: 30 seconds
- Timeout: 3 seconds
- Retries: 3

## Useful Commands

### View logs:
```bash
docker-compose logs -f frontend
```

### Rebuild and restart:
```bash
docker-compose up -d --build
```

### Check container status:
```bash
docker-compose ps
```

### Execute commands in container:
```bash
docker-compose exec frontend sh
```

### Remove all containers and images:
```bash
docker-compose down --rmi all
```

## Production Deployment

For production deployment, consider:

1. **Using a specific image tag:**
   ```bash
   docker build -t senior-care-frontend:1.0.0 .
   ```

2. **Using Docker registry:**
   ```bash
   docker tag senior-care-frontend:1.0.0 your-registry.com/senior-care-frontend:1.0.0
   docker push your-registry.com/senior-care-frontend:1.0.0
   ```

3. **Setting resource limits in docker-compose.yml:**
   ```yaml
   deploy:
     resources:
       limits:
         cpus: '1'
         memory: 512M
   ```

## Troubleshooting

### Container won't start
- Check logs: `docker-compose logs frontend`
- Verify port 3000 is not already in use: `lsof -i :3000`

### Build fails
- Clear Docker cache: `docker system prune -a`
- Try building with no cache: `docker-compose build --no-cache`

### Application not accessible
- Check container is running: `docker-compose ps`
- Verify port mapping: `docker port senior-care-frontend`

## Network Configuration

The frontend is part of the `senior-care-network` Docker network, which allows it to communicate with other services (e.g., backend APIs) when deployed together.

To connect with backend services, update the docker-compose.yml to include all services:

```yaml
services:
  frontend:
    # ... frontend config

  backend:
    # ... backend config
    networks:
      - senior-care-network
```

## File Structure

```
frontend/
├── Dockerfile              # Multi-stage Docker build file
├── docker-compose.yml      # Docker Compose configuration
├── .dockerignore          # Files to exclude from Docker build
├── nginx.conf             # Nginx server configuration
└── DOCKER.md              # This documentation
```
