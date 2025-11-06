// testProducer.js
// ✅ CommonJS version (works without "type": "module")

const { Kafka } = require("kafkajs"); // ✅ use require()

const kafka = new Kafka({
  clientId: "test-producer",
  brokers: ["kafka:9092"], // ✅ correct when running inside Docker network
});

const producer = kafka.producer();

async function sendTestEvent() {
  await producer.connect();

  const message = {
    userId: "demo-user",
    action: "daily_checkin",
    timestamp: new Date().toISOString(),
    message: "User completed daily check-in",
  };

  await producer.send({
    topic: "engagement.events",   // must match your gamification consumer topic
    messages: [{ value: JSON.stringify(message) }],
  });

  console.log("✅ Test message sent:", message);
  await producer.disconnect();
}

sendTestEvent()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("❌ Error sending message:", err);
    process.exit(1);
  });
