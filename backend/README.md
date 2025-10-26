# Backend Microservices

This project contains the backend microservices for the Cloud Computing project, including Kafka event streaming, gamification logic, and notification services.

## Quick Dependencies Setup

Run these commands in the backend directory to set up dependencies:

```bash
# Initialize project
npm init -y

# Core dependencies
npm install express mongoose kafkajs redis dotenv

# Email notification dependencies
npm install nodemailer

# Logging and API dependencies
npm install winston cors
```

## Services Architecture

- **Kafka & Zookeeper**: Event streaming platform
- **MongoDB**: Database for gamification data
- **Gamification Service**: Processes user engagement events
- **Notification Service**: Sends email notifications for achievements
- **Kafdrop**: Web UI for monitoring Kafka (optional)

## Starting the Services

1. Start all services using Docker Compose:
   ```bash
   docker-compose up -d
   ```

2. Verify services are running:
   ```bash
   docker-compose ps
   ```

## Service Endpoints

- **Gamification Service**: http://localhost:4001
- **Notification Service**: http://localhost:4002
- **Kafdrop UI**: http://localhost:9100

## Testing the System

1. View Kafka topics in Kafdrop:
   - Open http://localhost:9100
   - Click on topics to view messages

2. Send a test engagement event:
   ```bash
   docker run --rm -it --network backend_default -v "${PWD}:/app" -w /app node:18 node testProducer.js
   ```

3. Send a test badge event:
   ```bash
   docker run --rm -it --network backend_default -v "${PWD}:/app" -w /app node:18 node sendBadgeEvent.js
   ```

4. Check notification logs (includes email preview URLs):
   ```bash
   docker-compose logs notification --tail=100
   ```

## Troubleshooting

If services fail to start:
```bash
# Stop all services
docker-compose down

# Remove volumes (if needed)
docker volume prune

# Restart services
docker-compose up -d
```

## Local Firebase Setup (for development/demo)
1. Place your Firebase service account JSON at `./backend/firebase-sa.json` (do NOT commit this file).
2. The repository includes a `docker-compose.override.yml` that mounts the file into the notification container and sets the following environment variables for you:
   - FIREBASE_SERVICE_ACCOUNT_PATH (path inside the container)
   - FIREBASE_API_KEY
   - FIREBASE_AUTH_DOMAIN
   - FIREBASE_PROJECT_ID
   - FIREBASE_MESSAGING_SENDER_ID
   - FIREBASE_APP_ID
   - FIREBASE_VAPID_KEY (the Web Push VAPID public key used by the client)

If you prefer to set env vars yourself, remove or edit `docker-compose.override.yml`.

## Build & Run (from the `backend` folder):

1) Build the notification image (this also downloads the Firebase web SDK into the image):
   docker compose build notification

2) Start core infra:
   docker compose up -d zookeeper kafka mongo

3) Start the notification service:
   docker compose up -d --no-build notification

4) Check logs and look for Firebase initialization messages in the `notification` container logs (e.g. "✅ Firebase admin initialized").

## Notes:
- The VAPID key provided in the override is used by the testing static UI at `/testing-notification` to request tokens and send them to the server.
- Remember to keep `firebase-sa.json` private. Do not commit it to git.
## Development Notes

- Email notifications use Ethereal for testing - check logs for preview URLs
- MongoDB data persists in Docker volume
- Kafka topics are auto-created
- Services have health checks for proper startup order