FROM node:18
WORKDIR /app

# Build context is ./services/gamification-service
COPY package*.json ./
RUN npm install --production

# Copy entire service source
COPY . ./

CMD ["npm", "start"]
