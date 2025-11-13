const path = require('path');
const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');

const PROTO_PATH = path.join(__dirname, '..', 'protos', 'notification.proto');
const packageDefinition = protoLoader.loadSync(PROTO_PATH, { keepCase: true, longs: String, enums: String, defaults: true, oneofs: true });
const proto = grpc.loadPackageDefinition(packageDefinition).notification;

const client = new proto.NotificationService(process.env.GRPC_TARGET || 'localhost:50051', grpc.credentials.createInsecure());

const evt = {
  type: 'checkin',
  userId: 'poctest-1',
  mood: 'happy',
  timestamp: new Date().toISOString(),
  target: ['dashboard','mobile']
};

console.log('Calling PublishEvent RPC with', evt);
client.PublishEvent(evt, (err, resp) => {
  if (err) {
    console.error('PublishEvent error', err);
    process.exit(1);
  }
  console.log('PublishEvent response', resp);
  process.exit(0);
});
