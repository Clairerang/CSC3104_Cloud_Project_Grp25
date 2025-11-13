FROM node:18
WORKDIR /app

# Ensure the container has timezone data and default to Singapore
ENV TZ=Asia/Singapore
RUN apt-get update && apt-get install -y --no-install-recommends tzdata ca-certificates \
	&& ln -snf /usr/share/zoneinfo/${TZ} /etc/localtime \
	&& echo ${TZ} > /etc/timezone \
	&& apt-get clean && rm -rf /var/lib/apt/lists/*

# Copy package.json from the services/notification-service folder (build context is backend/)
COPY services/notification-service/package*.json ./
RUN npm install --production

# Copy entire notification service source
COPY services/notification-service/ ./

# Testing UI will be mounted as volume via docker-compose.yml
# Secrets will be mounted as volume via docker-compose.yml

CMD ["npm", "start"]
