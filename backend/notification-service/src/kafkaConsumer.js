const { Kafka } = require("kafkajs");
const { connectMongo } = require('./models');

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

// Publish a generic event to notification.events
async function publishEvent(payload) {
  try {
    if (!producer) throw new Error('Producer not initialized');
    const msg = { value: JSON.stringify(payload) };
    await producer.send({ topic: 'notification.events', messages: [msg] });
    console.log('📣 Published event to notification.events:', payload.type || '(no type)');
  } catch (e) {
    console.error('❌ publishEvent error:', e && e.message ? e.message : e);
  }
}

module.exports = { startKafkaConsumer, publishEvent };
