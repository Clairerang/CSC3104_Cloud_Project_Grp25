// Example gRPC Client for notification-service
// Use this from other services to make synchronous RPC calls

const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');
const path = require('path');

const PROTO_PATH = path.join(__dirname, '../../config/protos/notification.proto');
const GRPC_SERVER = process.env.NOTIFICATION_GRPC_HOST || 'localhost:50051';

// Load proto file
const packageDefinition = protoLoader.loadSync(PROTO_PATH, {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true,
});

const proto = grpc.loadPackageDefinition(packageDefinition).notification;

// Create gRPC client
const client = new proto.NotificationService(
  GRPC_SERVER,
  grpc.credentials.createInsecure()
);

// ============================================
// Example Usage Functions
// ============================================

/**
 * Get user profile from notification-service
 */
function getUserProfile(userId) {
  return new Promise((resolve, reject) => {
    client.GetUser({ userId }, (err, response) => {
      if (err) return reject(err);
      if (!response.ok) return reject(new Error(response.error));
      resolve(response.user);
    });
  });
}

/**
 * Get device tokens for push notifications
 */
function getDeviceTokens(userId) {
  return new Promise((resolve, reject) => {
    client.GetDeviceTokens({ userId }, (err, response) => {
      if (err) return reject(err);
      if (!response.ok) return reject(new Error(response.error));
      resolve(response.tokens);
    });
  });
}

/**
 * Get check-in history
 */
function getCheckIns(userId, limit = 50) {
  return new Promise((resolve, reject) => {
    client.GetCheckIns({ userId, limit }, (err, response) => {
      if (err) return reject(err);
      if (!response.ok) return reject(new Error(response.error));
      resolve(response.checkins);
    });
  });
}

/**
 * Publish event via gRPC (alternative to MQTT)
 */
function publishEvent(event) {
  return new Promise((resolve, reject) => {
    client.PublishEvent(event, (err, response) => {
      if (err) return reject(err);
      if (!response.ok) return reject(new Error(response.message));
      resolve(response);
    });
  });
}

/**
 * Health check
 */
function healthCheck() {
  return new Promise((resolve, reject) => {
    client.HealthCheck({ service: 'notification-service' }, (err, response) => {
      if (err) return reject(err);
      resolve(response);
    });
  });
}

// ============================================
// Example Usage
// ============================================

async function example() {
  try {
    // Check service health
    const health = await healthCheck();
    console.log('✅ Service Health:', health);

    // Get user profile
    const user = await getUserProfile('senior-1');
    console.log('👤 User Profile:', user);

    // Get device tokens
    const tokens = await getDeviceTokens('senior-1');
    console.log('📱 Device Tokens:', tokens);

    // Get check-in history
    const checkins = await getCheckIns('senior-1', 10);
    console.log('📋 Check-ins:', checkins);

    // Publish event (can also use MQTT)
    await publishEvent({
      type: 'sms',
      userId: 'senior-1',
      to: '+6512345678',
      body: 'Test message via gRPC',
      timestamp: new Date().toISOString()
    });
    console.log('✅ Event published');

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

// Uncomment to run example
// example();

module.exports = {
  client,
  getUserProfile,
  getDeviceTokens,
  getCheckIns,
  publishEvent,
  healthCheck
};
