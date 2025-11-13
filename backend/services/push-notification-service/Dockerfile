FROM node:18-slim

WORKDIR /app

# Copy package files for the service
COPY services/push-notification-service/package*.json ./

# Install dependencies
RUN npm install --production

# Copy service source code
COPY services/push-notification-service/src ./src

# Expose metrics port
EXPOSE 4020

CMD ["node", "src/index.js"]
