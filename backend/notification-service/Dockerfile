FROM node:18
WORKDIR /app

# Copy only the notification-service package.json from the backend build context
COPY notification-service/package*.json ./
RUN npm install --production

# Copy notification service source into the image
COPY notification-service/. ./

# Copy the testing-notification static frontend into the image so it can be served
COPY testing-notification/ ./testing-notification/

CMD ["npm", "start"]
