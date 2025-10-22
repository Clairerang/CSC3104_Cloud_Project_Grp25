const { Kafka } = require("kafkajs");
const nodemailer = require("nodemailer");

const kafka = new Kafka({
  clientId: "notification-service",
  brokers: [process.env.KAFKA_BROKER || "kafka:9092"]
});

const consumer = kafka.consumer({ groupId: "notification-group" });

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

async function sendEmail(to, subject, text) {
  try {
    await transporter.sendMail({ from: process.env.EMAIL_USER, to, subject, text });
    console.log(`📧 Email sent to ${to}: ${subject}`);
  } catch (err) {
    console.error("❌ Email error:", err);
  }
}

async function startKafkaConsumer() {
  await consumer.connect();
  await consumer.subscribe({ topic: "gamification.events" });

  console.log("🎧 Notification Service listening to gamification.events...");

  await consumer.run({
    eachMessage: async ({ message }) => {
      const event = JSON.parse(message.value.toString());
      console.log("📨 Received event:", event);

      if (event.type === "badge_awarded") {
        await sendEmail(
          "user@example.com", // Replace with actual user email lookup later
          "🎉 New Badge Earned!",
          `Congrats! You earned the "${event.badge}" badge.`
        );
      }
    }
  });
}

module.exports = { startKafkaConsumer };
