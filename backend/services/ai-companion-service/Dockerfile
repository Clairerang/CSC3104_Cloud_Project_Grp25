FROM node:18-slim
WORKDIR /app

# Install dependencies
COPY services/lex-companion-service/package*.json ./
RUN npm install --production

# Copy service source
COPY services/lex-companion-service/ ./

EXPOSE 4015

CMD ["npm", "start"]
