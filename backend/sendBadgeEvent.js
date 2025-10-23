// sendBadgeEvent.js
// Sends a badge_awarded event to gamification.events (for testing notification service)

const { Kafka } = require('kafkajs');

const kafka = new Kafka({
  clientId: 'badge-producer',
  brokers: ['kafka:9092'],
});

const producer = kafka.producer();

async function sendBadge() {
  await producer.connect();

  const event = {
    userId: 'demo-user',
    type: 'badge_awarded',
    badge: 'test-badge',
    timestamp: new Date().toISOString(),
  };

  await producer.send({
    topic: 'gamification.events',
    messages: [{ value: JSON.stringify(event) }],
  });

  console.log('✅ Sent badge event:', event);
  await producer.disconnect();
}

sendBadge().catch((e) => {
  console.error('❌ Failed to send badge event', e);
  process.exit(1);
});
