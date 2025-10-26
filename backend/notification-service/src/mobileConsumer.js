const { Kafka } = require('kafkajs');
const { connectMongo, models } = require('./models');
const admin = require('firebase-admin');

// Initialize firebase-admin using SERVICE_ACCOUNT JSON or path provided via env
function initFirebase() {
  if (admin.apps && admin.apps.length) return;
  const svc = process.env.FIREBASE_SERVICE_ACCOUNT_PATH || process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
  if (!svc) {
    console.warn('⚠️ FIREBASE service account not provided. Mobile push will be disabled.');
    return;
  }

  let cred = null;
  try {
    if (process.env.FIREBASE_SERVICE_ACCOUNT_PATH) {
      cred = require(process.env.FIREBASE_SERVICE_ACCOUNT_PATH);
    } else {
      cred = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_JSON);
    }
  } catch (e) {
    console.error('❌ Failed to load Firebase service account:', e && e.message ? e.message : e);
    return;
  }

  try {
    admin.initializeApp({ credential: admin.credential.cert(cred) });
    console.log('✅ Firebase admin initialized');
  } catch (e) {
    console.error('❌ Firebase admin init error', e && e.message ? e.message : e);
  }
}

const kafka = new Kafka({ clientId: 'mobile-consumer', brokers: [process.env.KAFKA_BROKER || 'kafka:9092'] });
const consumer = kafka.consumer({ groupId: 'mobile-delivery-group' });

async function startMobileConsumer() {
  initFirebase();
  if (!admin.apps || admin.apps.length === 0) {
    console.warn('Mobile consumer disabled: firebase admin not initialized');
    return;
  }

  try {
    await connectMongo();
  } catch (e) {
    console.warn('connectMongo warning in mobileConsumer', e && e.message ? e.message : e);
  }

  await consumer.connect();
  await consumer.subscribe({ topic: 'notification.events', fromBeginning: false });
  console.log('📲 Mobile consumer subscribed to notification.events');

  await consumer.run({
    eachMessage: async ({ message }) => {
      let event = null;
      try { event = JSON.parse(message.value.toString()); } catch (e) { console.warn('mobileConsumer: invalid JSON'); return; }

      // only deliver to mobile targets
      const targets = event.target || event.targets || [];
      if (!targets.includes('mobile')) return;

      // find device tokens for user
      try {
        const tokens = await models.DeviceToken.find({ userId: event.userId, revoked: { $ne: true } }).lean().exec();
        if (!tokens || tokens.length === 0) {
          console.log('mobileConsumer: no device tokens for', event.userId);
          return;
        }

        const message = {
          notification: {
            title: event.title || (event.type === 'checkin' ? 'Check-in received' : 'Notification'),
            body: event.body || `Event: ${event.type}`
          },
          data: { payload: JSON.stringify(event) }
        };

        // send to each token
        for (const t of tokens) {
          try {
            const resp = await admin.messaging().sendToDevice(t.token, message);
            console.log('📲 Sent push to', t.token, 'resp:', resp && resp.results ? resp.results.length : '(no results)');
            // update lastSeenAt
            await models.DeviceToken.updateOne({ _id: t._id }, { $set: { lastSeenAt: new Date() } });
          } catch (err) {
            console.error('❌ sendToDevice error', err && err.message ? err.message : err);
            // Optionally mark token revoked if unrecoverable
          }
        }
      } catch (e) {
        console.error('mobileConsumer error', e && e.message ? e.message : e);
      }
    }
  });
}

module.exports = { startMobileConsumer };
