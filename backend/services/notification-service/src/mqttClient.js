const mqtt = require('mqtt');
const { v4: uuidv4 } = require('uuid');
const { connectMongo } = require('./models');
// metrics
const client = require('prom-client');
const publishCounter = new client.Counter({ name: 'notification_events_published_total', help: 'Total number of events published to notification/events', labelNames: ['type'] });
const publishErrors = new client.Counter({ name: 'notification_publish_errors_total', help: 'Total number of publish errors' });

const MQTT_BROKER = process.env.MQTT_BROKER || 'hivemq';
const MQTT_PORT = process.env.MQTT_PORT || 1883;

const mqttClient = mqtt.connect(`mqtt://${MQTT_BROKER}:${MQTT_PORT}`, {
  clientId: `notification-service-${uuidv4()}`,
  clean: true,
  reconnectPeriod: 1000
});

mqttClient.on('connect', () => {
  console.log(`✅ MQTT connected to HiveMQ at ${MQTT_BROKER}:${MQTT_PORT}`);
});

mqttClient.on('error', (err) => {
  console.error('❌ MQTT connection error:', err);
});

async function startMqttConsumer() {
  // Ensure Mongo is connected
  try {
    await connectMongo();
  } catch (e) {
    console.warn('⚠️ models connectMongo warning:', e && e.message ? e.message : e);
  }

  // Subscribe to gamification events
  mqttClient.subscribe('gamification/events', { qos: 1 }, (err) => {
    if (err) {
      console.error('❌ Failed to subscribe to gamification/events:', err);
    } else {
      console.log('🎧 Notification Service listening to gamification/events...');
    }
  });

  // Handle incoming messages
  mqttClient.on('message', async (topic, message) => {
    let event = null;
    try {
      event = JSON.parse(message.toString());
    } catch (err) {
      console.warn(`⚠️ Received non-JSON event in ${topic}`);
      return;
    }

    console.log(`📨 Received event from ${topic}:`, event);

    // Handle gamification events
    if (topic === 'gamification/events') {
      if (event.type === "badge_awarded") {
        await publishEvent({
          type: 'badge_notification',
          userId: event.userId,
          badge: event.badge,
          source: 'gamification'
        });
      }
    }
  });
}

// Publish an event directly to MQTT
async function publishEvent(payload) {
  try {
    await new Promise((resolve, reject) => {
      mqttClient.publish('notification/events', JSON.stringify(payload), { qos: 1 }, (err) => {
        if (err) reject(err);
        else resolve();
      });
    });
    
    console.log(`📤 Published event to MQTT: ${payload.type}`);
    try { publishCounter.inc({ type: payload.type || 'unknown' }, 1); } catch (e) { /* ignore */ }
    
    return { success: true, type: payload.type };
  } catch (e) {
    console.error('❌ publishEvent error:', e && e.message ? e.message : e);
    try { publishErrors.inc(1); } catch (err) { /* ignore */ }
    throw e;
  }
}

module.exports = { startMqttConsumer, publishEvent, mqttClient };
