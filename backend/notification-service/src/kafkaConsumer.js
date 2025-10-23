const { Kafka } = require("kafkajs");
const nodemailer = require("nodemailer");

// Initialize transporter when the module loads
let initializationPromise = null;

const kafka = new Kafka({
  clientId: "notification-service",
  brokers: [process.env.KAFKA_BROKER || "kafka:9092"]
});

const consumer = kafka.consumer({ groupId: "notification-group" });

let transporter;

async function initTransporter() {
  // Create Ethereal test account - no real emails will be sent
  const testAccount = await nodemailer.createTestAccount();
  
  transporter = nodemailer.createTransport({
    host: 'smtp.ethereal.email',
    port: 587,
    secure: false,
    auth: {
      user: testAccount.user,
      pass: testAccount.pass
    }
  });
  
  console.log('📧 Using Ethereal test account for email testing');
  console.log(`📨 Ethereal account: ${testAccount.user}`);
}

async function sendEmail(to, subject, text) {
  try {
    if (!transporter) {
      await initTransporter();
    }
    const info = await transporter.sendMail({
      from: '"Notification Service" <test@example.com>',
      to,
      subject,
      text
    });
    console.log(`📧 Email sent to ${to}: ${subject}`);
    // Get preview URL and log it
    const previewUrl = nodemailer.getTestMessageUrl(info);
    console.log(`🔎 Preview URL: ${previewUrl}`);
  } catch (err) {
    console.error("❌ Email error:", err);
  }
}

async function startKafkaConsumer() {
  // Initialize email transporter
  await initTransporter();
  
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
