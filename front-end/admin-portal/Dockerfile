# Build stage
FROM node:18-alpine AS build

# Set working directory
WORKDIR /app

# Build arguments for environment variables
ARG REACT_APP_USE_MOCK_DATA=false
ARG REACT_APP_API_GATEWAY=http://localhost:8080

# Set environment variables from build args
ENV REACT_APP_USE_MOCK_DATA=$REACT_APP_USE_MOCK_DATA
ENV REACT_APP_API_GATEWAY=$REACT_APP_API_GATEWAY

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install --legacy-peer-deps

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
