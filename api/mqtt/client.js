const mqtt = require('mqtt');

let mqttClient = null;
const pendingRequests = new Map();

/**
 * Initialize MQTT client connection
 */
function initializeMQTT() {
  // Use environment variable or default to localhost
  const MQTT_BROKER_URL = process.env.MQTT_BROKER_URL || 'mqtt://localhost:1883';

  mqttClient = mqtt.connect(MQTT_BROKER_URL, {
    clientId: `api-gateway-${Math.random().toString(16).slice(3)}`,
    clean: true,
    connectTimeout: 4000,
    reconnectPeriod: 1000,
  });

  mqttClient.on('connect', () => {
    console.log('✅ API Gateway connected to MQTT broker');

    // Subscribe to all response topics
    mqttClient.subscribe('games/response/#', (err) => {
      if (err) {
        console.error('Failed to subscribe to games/response/#:', err);
      } else {
        console.log('Subscribed to games/response/#');
      }
    });
  });

  mqttClient.on('message', (topic, message) => {
    try {
      const payload = JSON.parse(message.toString());

      // Extract correlationId from topic or payload
      const topicParts = topic.split('/');
      const correlationId = topicParts[topicParts.length - 1];

      // Resolve pending promise
      if (pendingRequests.has(correlationId)) {
        const { resolve, reject, timeout } = pendingRequests.get(correlationId);
        clearTimeout(timeout);

        if (payload.success === false || topic.includes('/error/')) {
          reject(new Error(payload.error || 'Request failed'));
        } else {
          resolve(payload);
        }

        pendingRequests.delete(correlationId);
      }
    } catch (error) {
      console.error('Error processing MQTT message:', error);
    }
  });

  mqttClient.on('error', (error) => {
    console.error('MQTT Client Error:', error);
  });

  mqttClient.on('close', () => {
    console.log('MQTT connection closed');
  });

  mqttClient.on('reconnect', () => {
    console.log('Reconnecting to MQTT broker...');
  });

  return mqttClient;
}

/**
 * Send a request via MQTT and wait for response
 * @param {string} topic - MQTT topic to publish to
 * @param {object} payload - Request payload
 * @param {number} timeout - Timeout in milliseconds (default: 5000)
 * @returns {Promise<object>} Response from games service
 */
function sendRequest(topic, payload, timeout = 5000) {
  return new Promise((resolve, reject) => {
    if (!mqttClient || !mqttClient.connected) {
      return reject(new Error('MQTT client not connected'));
    }

    const correlationId = payload.correlationId;

    // Set up timeout
    const timeoutId = setTimeout(() => {
      pendingRequests.delete(correlationId);
      reject(new Error('Request timeout'));
    }, timeout);

    // Store the promise resolvers
    pendingRequests.set(correlationId, { resolve, reject, timeout: timeoutId });

    // Publish request
    mqttClient.publish(topic, JSON.stringify(payload), { qos: 1 }, (err) => {
      if (err) {
        clearTimeout(timeoutId);
        pendingRequests.delete(correlationId);
        reject(err);
      }
    });
  });
}

/**
 * Get MQTT client instance
 */
function getClient() {
  return mqttClient;
}

/**
 * Graceful shutdown
 */
function disconnect() {
  if (mqttClient) {
    // Reject all pending requests
    pendingRequests.forEach(({ reject, timeout }) => {
      clearTimeout(timeout);
      reject(new Error('MQTT client disconnecting'));
    });
    pendingRequests.clear();

    mqttClient.end();
    console.log('MQTT client disconnected');
  }
}

module.exports = {
  initializeMQTT,
  sendRequest,
  getClient,
  disconnect
};
