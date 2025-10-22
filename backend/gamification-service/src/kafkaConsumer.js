const { Kafka } = require("kafkajs");
const UserGameData = require("./models/UserGameData");

const kafka = new Kafka({
  clientId: "gamification-service",
  brokers: [process.env.KAFKA_BROKER || "kafka:9092"]
});

const consumer = kafka.consumer({ groupId: "gamification-group" });
const producer = kafka.producer();

async function startKafkaConsumer() {
  await consumer.connect();
  await producer.connect();
  await consumer.subscribe({ topic: "engagement.events" });

  console.log("🎧 Gamification Service listening to engagement.events...");

  await consumer.run({
    eachMessage: async ({ message }) => {
      const event = JSON.parse(message.value.toString());
      const { userId, action } = event;

      let user = await UserGameData.findOne({ userId });
      if (!user) user = new UserGameData({ userId });

      if (action === "daily_checkin") {
        user.points += 10;
        user.streak += 1;

        if (user.streak === 7 && !user.badges.includes("7-day streak")) {
          user.badges.push("7-day streak");
          await producer.send({
            topic: "gamification.events",
            messages: [
              {
                value: JSON.stringify({
                  userId,
                  type: "badge_awarded",
                  badge: "7-day streak"
                })
              }
            ]
          });
          console.log(`🏅 Badge awarded to ${userId}: 7-day streak`);
        }
      }

      await user.save();
      console.log(`⭐ Updated gamification data for ${userId}`);
    }
  });
}

module.exports = { startKafkaConsumer };
