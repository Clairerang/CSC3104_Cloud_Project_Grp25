FROM node:18
WORKDIR /app

# Copy only the notification-service package.json from the backend build context
COPY notification-service/package*.json ./
RUN npm install --production

# Copy notification service source into the image
COPY notification-service/. ./

	# Copy helper scripts and download vendor JS for offline use
COPY notification-service/scripts ./scripts/
RUN chmod -R a+rwx ./scripts || true
# Copy the testing-notification static frontend into the image so it can be served
COPY testing-notification/ ./testing-notification/

	# Download firebase compat SDK into testing-notification/vendor so client can load locally
RUN node ./scripts/download-firebase.js || true
CMD ["npm", "start"]
