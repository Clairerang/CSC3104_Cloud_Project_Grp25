const path = require('path');
const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');

const PROTO_PATH = path.join(__dirname, '..', 'protos', 'notification.proto');

function startGrpcServer({ publishEvent, port = process.env.GRPC_PORT || 50051 } = {}) {
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
    PublishEvent: (call, callback) => {
      const evt = call.request || {};
      // Convert repeated fields to JS array (proto-loader already does this)
      const eventObj = {
        type: evt.type || 'unknown',
        userId: evt.userId || null,
        mood: evt.mood || null,
        timestamp: evt.timestamp || new Date().toISOString(),
        target: Array.isArray(evt.target) ? evt.target : (evt.target ? [evt.target] : [])
      };

      if (!publishEvent || typeof publishEvent !== 'function') {
        return callback(null, { ok: false, message: 'publishEvent not implemented on server' });
      }

      publishEvent(eventObj)
        .then(() => callback(null, { ok: true, message: 'published' }))
        .catch(err => callback(null, { ok: false, message: String(err && err.message ? err.message : err) }));
    }
  });

  const bindAddr = `0.0.0.0:${port}`;
  server.bindAsync(bindAddr, grpc.ServerCredentials.createInsecure(), (err, portBound) => {
    if (err) return console.error('gRPC server bind error', err);
    server.start();
    console.log(`✅ gRPC server started on ${bindAddr}`);
  });

  return server;
}

module.exports = { startGrpcServer };
