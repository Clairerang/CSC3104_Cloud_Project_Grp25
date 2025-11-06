require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const { startKafkaConsumer } = require("./kafkaConsumer");
const { publishEventViaGrpc } = require('./notificationGrpcClient');

const app = express();
app.use(express.json());

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URL)
  .then(() => console.log("✅ MongoDB connected"))
  .catch(err => console.error("❌ MongoDB error:", err));

app.get("/", (req, res) => res.send("Gamification Service Running ✅"));

// PoC route: call notification.PublishEvent via gRPC
app.post('/rpc-publish', (req, res) => {
  const evt = req.body || { type: 'gamify', userId: 'gamer-1', timestamp: new Date().toISOString() };
  publishEventViaGrpc(evt, (err, resp) => {
    if (err) return res.status(500).json({ error: String(err) });
    res.json({ ok: true, resp });
  });
});

const PORT = process.env.PORT || 4001;
app.listen(PORT, () => {
  console.log(`🎮 Gamification Service listening on port ${PORT}`);
  startKafkaConsumer();
});