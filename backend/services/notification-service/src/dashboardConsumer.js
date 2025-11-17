const mqtt = require('mqtt');
const { v4: uuidv4 } = require('uuid');
const EventEmitter = require('events');
const { connectMongo, models } = require('./models');

const MQTT_BROKER = process.env.MQTT_BROKER || 'hivemq';
const MQTT_PORT = process.env.MQTT_PORT || 1883;

const mqttClient = mqtt.connect(`mqtt://${MQTT_BROKER}:${MQTT_PORT}`, {
  clientId: `notification-dashboard-${uuidv4()}`,
  clean: true,
  reconnectPeriod: 1000
});

const emitter = new EventEmitter();
const RECENT_LIMIT = 200;
const recent = [];

mqttClient.on('connect', () => {
  console.log(`✅ Dashboard MQTT client connected to ${MQTT_BROKER}:${MQTT_PORT}`);
});

mqttClient.on('error', (err) => {
  console.error('❌ Dashboard MQTT connection error:', err);
});

async function startDashboardConsumer() {
  try {
    // Ensure Mongo connected so we can persist events
    try { await connectMongo(); } catch (e) { console.warn('connectMongo warning in dashboardConsumer', e && e.message ? e.message : e); }
    
    // Subscribe to notification/events MQTT topic
    mqttClient.subscribe('notification/events', { qos: 1 }, (err) => {
      if (err) {
        console.error('❌ Failed to subscribe to notification/events:', err);
      } else {
        console.log('📡 Dashboard consumer subscribed to notification/events');
      }
    });

    // Handle incoming MQTT messages
    mqttClient.on('message', async (topic, message) => {
      if (topic !== 'notification/events') return;

      let event = null;
      try {
        event = JSON.parse(message.toString());
      } catch (e) {
        console.warn('⚠️ dashboardConsumer: invalid JSON message');
        return;
      }

      // MESSAGE DEDUPLICATION: Check if already processed
      const messageId = event.messageId || `dash_${event.type}_${event.userId}_${event.timestamp || ''}`;
      try {
        const existing = await models.ProcessedMessage.findOne({ messageId }).lean();
        if (existing) {
          console.log(`⏭️  Dashboard: Skipping already processed message: ${messageId}`);
          return; // Already processed by another replica
        }
        // Mark as processed
        await models.ProcessedMessage.create({ messageId, processedAt: new Date() });
      } catch (err) {
        if (err.code === 11000) {
          // Duplicate key error - another replica is processing this
          console.log(`⏭️  Dashboard: Another replica is processing message: ${messageId}`);
          return;
        }
        console.error('Error checking processed messages (dashboard):', err);
      }

      // persist to Mongo for durability
      try {
        await models.NotificationEvent.create({ eventType: event.type || '', payload: event, sourceTopic: 'notification/events', receivedAt: new Date() });
      } catch (e) {
        console.warn('⚠️ dashboardConsumer: failed to persist event', e && e.message ? e.message : e);
      }

      // keep recent
      recent.unshift({ event, ts: Date.now() });
      if (recent.length > RECENT_LIMIT) recent.pop();
      // emit for SSE listeners
      emitter.emit('event', event);
      console.log('🔔 dashboardConsumer received event:', event.type || '(no type)');
    });
  } catch (e) {
    console.error('❌ startDashboardConsumer error', e && e.message ? e.message : e);
  }
}

function getRecent() {
  return recent.slice();
}

module.exports = { startDashboardConsumer, emitter, getRecent };
