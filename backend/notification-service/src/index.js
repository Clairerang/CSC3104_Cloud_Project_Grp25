require("dotenv").config();
const express = require("express");
const { startKafkaConsumer } = require("./kafkaConsumer");

const app = express();
app.use(express.json());

app.get("/", (req, res) => res.send("Notification Service Running ✅"));

const PORT = process.env.PORT || 4002;
app.listen(PORT, () => {
  console.log(`🔔 Notification Service running on port ${PORT}`);
  startKafkaConsumer();
});
