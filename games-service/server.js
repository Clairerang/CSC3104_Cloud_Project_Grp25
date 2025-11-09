require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const mqtt = require('mqtt');

// Import models
const Game = require('./models/Game');
const TriviaQuestion = require('./models/TriviaQuestion');
const Exercise = require('./models/Exercise');
const MemorySet = require('./models/MemorySet');
const GameSession = require('./models/GameSession');

// Import MQTT handlers
const mqttHandlers = require('./mqtt/handlers');

const app = express();
const PORT = process.env.PORT || 8081;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/senior_care';
const MQTT_BROKER_URL = process.env.MQTT_BROKER_URL || 'mqtt://localhost:1883';

// Middleware
app.use(cors());
app.use(express.json());

// Connect to MongoDB
mongoose.connect(MONGODB_URI)
  .then(() => console.log('Connected to MongoDB (Games DB)'))
  .catch(err => console.error('MongoDB connection error:', err));

// Connect to MQTT Broker
const mqttClient = mqtt.connect(MQTT_BROKER_URL, {
  clientId: `games-service-${Math.random().toString(16).slice(2, 10)}`,
  clean: true,
  reconnectPeriod: 1000,
});

mqttClient.on('connect', () => {
  console.log('Connected to MQTT Broker');

  // Subscribe to games topics
  const topics = [
    'games/request/list',
    'games/request/trivia',
    'games/request/memory',
    'games/request/stretch',
    'games/session/start',
    'games/session/complete',
    'games/history/request/#'
  ];

  mqttClient.subscribe(topics, (err) => {
    if (err) {
      console.error('MQTT subscription error:', err);
    } else {
      console.log('Subscribed to games topics:', topics);
    }
  });
});

mqttClient.on('error', (error) => {
  console.error('MQTT connection error:', error);
});

mqttClient.on('message', async (topic, message) => {
  try {
    const payload = JSON.parse(message.toString());
    console.log(`Received message on topic: ${topic}`);

    // Route to appropriate handler
    await mqttHandlers.handleMessage(topic, payload, mqttClient);
  } catch (error) {
    console.error('Error processing MQTT message:', error);
  }
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    service: 'games-service',
    status: 'healthy',
    timestamp: new Date().toISOString(),
    mongodb: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
    mqtt: mqttClient.connected ? 'connected' : 'disconnected'
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`Games Service running on port ${PORT}`);
});

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('Shutting down gracefully...');
  mqttClient.end();
  await mongoose.connection.close();
  process.exit(0);
});
