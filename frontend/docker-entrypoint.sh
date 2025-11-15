#!/bin/sh
set -e

# Default API Gateway URL if not provided
export API_GATEWAY_URL=${API_GATEWAY_URL:-http://api-gateway:8080}

echo "Configuring Nginx with API_GATEWAY_URL=${API_GATEWAY_URL}"

# Substitute environment variables in nginx template
envsubst '${API_GATEWAY_URL}' < /etc/nginx/conf.d/default.conf.template > /etc/nginx/conf.d/default.conf

echo "Nginx configuration generated:"
cat /etc/nginx/conf.d/default.conf

# Start nginx
exec nginx -g 'daemon off;'
