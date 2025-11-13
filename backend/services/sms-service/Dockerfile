FROM node:18-slim
WORKDIR /app

# Install CA certificates for HTTPS
RUN apt-get update && apt-get install -y --no-install-recommends ca-certificates && rm -rf /var/lib/apt/lists/*

# Copy package.json from services/sms-service folder (build context is backend/)
COPY services/sms-service/package*.json ./
RUN npm install --production

# Copy entire sms service source
COPY services/sms-service/ ./

EXPOSE 4004
CMD ["npm", "start"]
