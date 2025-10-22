require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const { startKafkaConsumer } = require("./kafkaConsumer");

const app = express();
app.use(express.json());

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URL)
  .then(() => console.log("✅ MongoDB connected"))
  .catch(err => console.error("❌ MongoDB error:", err));

app.get("/", (req, res) => res.send("Gamification Service Running ✅"));

const PORT = process.env.PORT || 4001;
app.listen(PORT, () => {
  console.log(`🎮 Gamification Service listening on port ${PORT}`);
  startKafkaConsumer();
});