const path = require('path');
const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');

const PROTO_PATH = path.join(__dirname, '../../../config/protos', 'notification.proto');

function startGrpcServer({ publishEvent, models, port = process.env.GRPC_PORT || 50051 } = {}) {
  if (!publishEvent || typeof publishEvent !== 'function') {
    console.warn('gRPC server: publishEvent function not provided — RPC will return an error');
  }

  const packageDefinition = protoLoader.loadSync(PROTO_PATH, {
    keepCase: true,
    longs: String,
    enums: String,
    defaults: true,
    oneofs: true,
  });
  const proto = grpc.loadPackageDefinition(packageDefinition).notification;

  const server = new grpc.Server();

  server.addService(proto.NotificationService.service, {
    // Publish event to MQTT
    PublishEvent: (call, callback) => {
      const evt = call.request || {};
      const eventObj = {
        type: evt.type || 'unknown',
        userId: evt.userId || null,
        timestamp: evt.timestamp || new Date().toISOString(),
        target: Array.isArray(evt.target) ? evt.target : (evt.target ? [evt.target] : []),
        to: evt.to || null,
        body: evt.body || null,
        subject: evt.subject || null,
        title: evt.title || null,
        message: evt.message || null,
        urgent: evt.urgent || false,
        sessionId: evt.sessionId || null,
        intent: evt.intent || null,
        from: evt.from || null
      };

      if (!publishEvent || typeof publishEvent !== 'function') {
        return callback(null, { ok: false, message: 'publishEvent not implemented on server' });
      }

      publishEvent(eventObj)
        .then(() => callback(null, { ok: true, message: 'Event published to MQTT' }))
        .catch(err => callback(null, { ok: false, message: String(err && err.message ? err.message : err) }));
    },

    // Get user profile
    GetUser: async (call, callback) => {
      const { userId } = call.request || {};
      
      if (!userId) {
        return callback(null, { ok: false, error: 'userId required' });
      }

      try {
        if (!models || !models.User) {
          return callback(null, { ok: false, error: 'User model not available' });
        }

        const user = await models.User.findOne({ userId }).lean().exec();
        
        if (!user) {
          return callback(null, { ok: false, error: 'User not found' });
        }

        callback(null, {
          ok: true,
          user: {
            userId: user.userId,
            name: user.name || '',
            email: user.email || '',
            phoneNumber: user.phoneNumber || '',
            address: user.address || '',
            familyEmails: user.familyEmails || [],
            familyPhones: user.familyPhones || [],
            createdAt: user.createdAt ? user.createdAt.toISOString() : ''
          }
        });
      } catch (err) {
        callback(null, { ok: false, error: err.message });
      }
    },

    // Get device tokens for push notifications
    GetDeviceTokens: async (call, callback) => {
      const { userId } = call.request || {};
      
      if (!userId) {
        return callback(null, { ok: false, error: 'userId required' });
      }

      try {
        if (!models || !models.DeviceToken) {
          return callback(null, { ok: false, error: 'DeviceToken model not available' });
        }

        const tokens = await models.DeviceToken.find({ userId }).lean().exec();
        
        callback(null, {
          ok: true,
          tokens: tokens.map(t => ({
            token: t.token,
            platform: t.platform || 'unknown',
            createdAt: t.createdAt ? t.createdAt.toISOString() : ''
          }))
        });
      } catch (err) {
        callback(null, { ok: false, error: err.message });
      }
    },

    // Get check-in history
    GetCheckIns: async (call, callback) => {
      const { userId, limit = 50 } = call.request || {};
      
      if (!userId) {
        return callback(null, { ok: false, error: 'userId required' });
      }

      try {
        if (!models || !models.CheckIn) {
          return callback(null, { ok: false, error: 'CheckIn model not available' });
        }

        const checkins = await models.CheckIn
          .find({ userId })
          .sort({ timestamp: -1 })
          .limit(Math.min(limit, 100))
          .lean()
          .exec();
        
        callback(null, {
          ok: true,
          checkins: checkins.map(c => ({
            userId: c.userId,
            mood: c.mood || 'okay',
            timestamp: c.timestamp ? c.timestamp.toISOString() : ''
          }))
        });
      } catch (err) {
        callback(null, { ok: false, error: err.message });
      }
    },

    // Health check
    HealthCheck: (call, callback) => {
      callback(null, {
        healthy: true,
        service: 'notification-service',
        version: '1.0.0',
        uptime: process.uptime(),
        timestamp: new Date().toISOString()
      });
    }
  });

  const bindAddr = `0.0.0.0:${port}`;
  server.bindAsync(bindAddr, grpc.ServerCredentials.createInsecure(), (err, portBound) => {
    if (err) return console.error('❌ gRPC server bind error', err);
    server.start();
    console.log(`✅ gRPC server started on ${bindAddr}`);
    console.log(`📋 Available RPCs: PublishEvent, GetUser, GetDeviceTokens, GetCheckIns, HealthCheck`);
  });

  return server;
}

module.exports = { startGrpcServer };
