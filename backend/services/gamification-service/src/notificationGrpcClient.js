const path = require('path');
const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');

const PROTO_PATH = path.join(__dirname, '..', 'protos', 'notification.proto');

const packageDefinition = protoLoader.loadSync(PROTO_PATH, {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true,
});
const proto = grpc.loadPackageDefinition(packageDefinition).notification;

function publishEventViaGrpc(event, callback) {
  const target = process.env.NOTIFICATION_GRPC_HOST || 'notification:50051';
  const client = new proto.NotificationService(target, grpc.credentials.createInsecure());
  client.PublishEvent(event, (err, res) => {
    if (callback) return callback(err, res);
  });
}

module.exports = { publishEventViaGrpc };
