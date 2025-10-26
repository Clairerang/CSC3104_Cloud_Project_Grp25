const { Kafka } = require('kafkajs');
const EventEmitter = require('events');
const { connectMongo, models } = require('./models');

const kafka = new Kafka({
  clientId: 'notification-dashboard',
  brokers: [process.env.KAFKA_BROKER || 'kafka:9092']
});

const consumer = kafka.consumer({ groupId: 'notification-dashboard-group' });
const emitter = new EventEmitter();
const RECENT_LIMIT = 200;
const recent = [];

async function startDashboardConsumer() {
  try {
    // Ensure Mongo connected so we can persist events
    try { await connectMongo(); } catch (e) { console.warn('connectMongo warning in dashboardConsumer', e && e.message ? e.message : e); }
    await consumer.connect();
    await consumer.subscribe({ topic: 'notification.events', fromBeginning: false });
    console.log('📡 Dashboard consumer subscribed to notification.events');

    await consumer.run({
      eachMessage: async ({ message }) => {
        let event = null;
        try {
          event = JSON.parse(message.value.toString());
        } catch (e) {
          console.warn('⚠️ dashboardConsumer: invalid JSON message');
          return;
        }
        // persist to Mongo for durability
        try {
          await models.NotificationEvent.create({ eventType: event.type || '', payload: event, sourceTopic: 'notification.events', receivedAt: new Date() });
        } catch (e) {
          console.warn('⚠️ dashboardConsumer: failed to persist event', e && e.message ? e.message : e);
        }

        // keep recent
        recent.unshift({ event, ts: Date.now() });
        if (recent.length > RECENT_LIMIT) recent.pop();
        // emit for SSE listeners
        emitter.emit('event', event);
        console.log('🔔 dashboardConsumer received event:', event.type || '(no type)');
      }
    });
  } catch (e) {
    console.error('❌ startDashboardConsumer error', e && e.message ? e.message : e);
    // don't rethrow to avoid crashing the whole process; try reconnect later
  }
}

function getRecent() {
  return recent.slice();
}

module.exports = { startDashboardConsumer, emitter, getRecent };
