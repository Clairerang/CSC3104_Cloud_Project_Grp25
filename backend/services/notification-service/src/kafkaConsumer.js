const { Kafka } = require("kafkajs");
const { connectMongo } = require('./models');
// metrics
const client = require('prom-client');
const publishCounter = new client.Counter({ name: 'notification_events_published_total', help: 'Total number of events published to notification.events', labelNames: ['type'] });
const publishErrors = new client.Counter({ name: 'notification_publish_errors_total', help: 'Total number of publish errors' });

const kafka = new Kafka({
  clientId: "notification-service",
  brokers: [process.env.KAFKA_BROKER || "kafka:9092"]
});

const consumer = kafka.consumer({ groupId: "notification-group" });
const producer = kafka.producer();

async function startKafkaConsumer() {
  // Ensure Mongo is connected (models may be used elsewhere)
  try {
    await connectMongo();
  } catch (e) {
    console.warn('⚠️ models connectMongo warning:', e && e.message ? e.message : e);
  }

  // Connect producer & consumer
  await producer.connect();
  // start outbox publisher to drain persisted events into Kafka
  startOutboxPublisher();
  await consumer.connect();

  // Subscribe to gamification events (existing behaviour)
  await consumer.subscribe({ topic: "gamification.events" });

  console.log("🎧 Notification Service listening to gamification.events...");

  await consumer.run({
    eachMessage: async ({ message }) => {
      let event = null;
      try {
        event = JSON.parse(message.value.toString());
      } catch (err) {
        console.warn('⚠️ Received non-JSON event in gamification.events');
        return;
      }

      console.log("📨 Received event:", event);

      // Example: forward badge events as internal notification events
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

// Publish a generic event to notification.events using Outbox pattern
const { models } = require('./models');
const MAX_OUTBOX_ATTEMPTS = parseInt(process.env.OUTBOX_MAX_ATTEMPTS || '5', 10);

async function publishEvent(payload) {
  try {
    // Persist to outbox for reliable publish
    const out = await models.Outbox.create({ eventType: payload.type || 'unknown', payload, nextAttemptAt: new Date() });
    console.log('🗳️ Queued event in Outbox:', out.messageId, payload.type || '(no type)');
    try { publishCounter.inc({ type: payload.type || 'unknown' }, 1); } catch (e) { /* ignore */ }
    return out;
  } catch (e) {
    console.error('❌ publishEvent (outbox) error:', e && e.message ? e.message : e);
    try { publishErrors.inc(1); } catch (err) { /* ignore */ }
    throw e;
  }
}

// Outbox publisher: polls the Outbox collection and publishes pending messages to Kafka
async function startOutboxPublisher(pollIntervalMs = 2000) {
  if (!producer) {
    console.warn('Outbox publisher: producer not initialized');
    return;
  }
  console.log('🔁 Starting Outbox publisher...');
  async function publishBatch() {
    try {
      const now = new Date();
      const batch = await models.Outbox.find({ published: false, $or: [{ nextAttemptAt: { $lte: now } }, { nextAttemptAt: null }] }).sort({ createdAt: 1 }).limit(50).lean().exec();
      if (!batch || !batch.length) return;
      for (const row of batch) {
        try {
          const msg = { value: JSON.stringify(row.payload) };
          await producer.send({ topic: 'notification.events', messages: [msg] });
          await models.Outbox.updateOne({ _id: row._id }, { $set: { published: true, publishedAt: new Date() } });
          console.log('📣 Outbox published:', row.messageId, row.eventType || '(no type)');
        } catch (err) {
          const attempts = (row.attempts || 0) + 1;
          const nextAttemptIn = Math.min(60 * 1000 * attempts, 15 * 60 * 1000); // backoff capped at 15m
          const nextAttemptAt = new Date(Date.now() + nextAttemptIn);
          const update = { $set: { attempts, lastError: String(err && err.message ? err.message : err), nextAttemptAt } };
          // move to DLQ if too many attempts
          if (attempts >= MAX_OUTBOX_ATTEMPTS) {
            console.warn('Outbox moving to DLQ after attempts:', row.messageId);
            try {
              await producer.send({ topic: 'notification.dlq', messages: [{ value: JSON.stringify({ type: 'outbox.dlq', original: row }) }] });
            } catch (px) { console.warn('Failed to publish DLQ message for outbox', px && px.message ? px.message : px); }
            update.$set.published = true; update.$set.publishedAt = new Date();
          }
          await models.Outbox.updateOne({ _id: row._id }, update);
        }
      }
    } catch (e) {
      console.error('Outbox publisher error', e && e.message ? e.message : e);
    }
  }

  // Poll loop
  (async function loop() {
    while (true) {
      await publishBatch();
      await new Promise(r => setTimeout(r, pollIntervalMs));
    }
  })();
}

module.exports = { startKafkaConsumer, publishEvent };
