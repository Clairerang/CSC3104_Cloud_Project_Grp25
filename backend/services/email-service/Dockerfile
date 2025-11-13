FROM node:18
WORKDIR /app

ENV TZ=Asia/Singapore
RUN apt-get update && apt-get install -y --no-install-recommends tzdata ca-certificates \
  && ln -snf /usr/share/zoneinfo/${TZ} /etc/localtime \
  && echo ${TZ} > /etc/timezone \
  && apt-get clean && rm -rf /var/lib/apt/lists/*

# Copy package.json from services/email-service folder (build context is backend/)
COPY services/email-service/package*.json ./
RUN npm install --production

# Copy entire email service source
COPY services/email-service/ ./

CMD ["npm", "start"]
