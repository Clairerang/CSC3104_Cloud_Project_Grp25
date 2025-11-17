const mqtt = require('mqtt');
const { v4: uuidv4 } = require('uuid');
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
  admin.initializeApp({ credential: admin.credential.cert(cred), projectId: cred && cred.project_id });
    console.log('✅ Firebase admin initialized');
    try {
      console.log('🔎 Firebase admin project:', admin.app() && admin.app().options && admin.app().options.projectId ? admin.app().options.projectId : '<no-project-id>');
    } catch (e) { /* ignore */ }
  } catch (e) {
    console.error('❌ Firebase admin init error', e && e.message ? e.message : e);
  }
}

const MQTT_BROKER = process.env.MQTT_BROKER || 'hivemq';
const MQTT_PORT = process.env.MQTT_PORT || 1883;

const mqttClient = mqtt.connect(`mqtt://${MQTT_BROKER}:${MQTT_PORT}`, {
  clientId: `mobile-consumer-${uuidv4()}`,
  clean: true,
  reconnectPeriod: 1000
});

mqttClient.on('connect', () => {
  console.log(`✅ Mobile consumer MQTT connected to ${MQTT_BROKER}:${MQTT_PORT}`);
});

mqttClient.on('error', (err) => {
  console.error('❌ Mobile consumer MQTT connection error:', err);
});

// Optional send delay to avoid race where a freshly-created token
// may not have fully propagated to FCM. Configure with env
// FCM_SEND_DELAY_MS (default 500ms). Set to 0 to disable.
const FCM_SEND_DELAY_MS = parseInt(process.env.FCM_SEND_DELAY_MS || '500', 10) || 0;
const sleep = (ms) => new Promise((res) => setTimeout(res, ms));

// Optional HTTP v1 fallback on admin SDK failure. Enable by setting
// FCM_FALLBACK_V1=true in the environment. This helps diagnose and
// workaround cases where admin.messaging().sendToDevice returns 404/UNREGISTERED
// but the HTTP v1 API will accept the same token.
const FCM_FALLBACK_V1 = String(process.env.FCM_FALLBACK_V1 || '').toLowerCase() === 'true';
const { GoogleAuth } = require('google-auth-library');
const https = require('https');

async function sendViaV1(token, messageObj) {
  try {
    // Determine projectId
    let projectId = (admin.app && admin.app().options && admin.app().options.projectId) || process.env.FIREBASE_PROJECT_ID;
    // Try service account file for project_id if still missing
    if (!projectId && process.env.FIREBASE_SERVICE_ACCOUNT_PATH) {
      try { const cred = require(process.env.FIREBASE_SERVICE_ACCOUNT_PATH); projectId = projectId || cred && cred.project_id; } catch (e) { /* ignore */ }
    }
    if (!projectId) throw new Error('projectId not available for FCM v1');

    // Build v1 body
    const body = JSON.stringify({
      message: {
        token,
        notification: messageObj.notification || undefined,
        data: messageObj.data || undefined
      }
    });

    // Use GoogleAuth to obtain access token
    const auth = new GoogleAuth({
      keyFilename: process.env.FIREBASE_SERVICE_ACCOUNT_PATH || undefined,
      credentials: process.env.FIREBASE_SERVICE_ACCOUNT_JSON ? JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_JSON) : undefined,
      scopes: ['https://www.googleapis.com/auth/cloud-platform']
    });
    const client = await auth.getClient();
    const at = await client.getAccessToken();
    const accessToken = at && at.token ? at.token : at;
    if (!accessToken) throw new Error('Could not obtain access token for FCM v1');

    const opts = {
      hostname: 'fcm.googleapis.com',
      path: `/v1/projects/${projectId}/messages:send`,
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(body)
      }
    };

    return await new Promise((resolve, reject) => {
      const req = https.request(opts, (res) => {
        let data = '';
        res.on('data', (c) => data += c.toString());
        res.on('end', () => {
          try { resolve({ status: res.statusCode, body: JSON.parse(data) }); } catch (e) { resolve({ status: res.statusCode, body: data }); }
        });
      });
      req.on('error', (e) => reject(e));
      req.write(body);
      req.end();
    });
  } catch (e) {
    return { error: e && e.message ? e.message : String(e) };
  }
}

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

  // Subscribe to notification/events MQTT topic
  mqttClient.subscribe('notification/events', { qos: 1 }, (err) => {
    if (err) {
      console.error('❌ Failed to subscribe to notification/events:', err);
    } else {
      console.log('📲 Mobile consumer subscribed to notification/events');
    }
  });

  // Handle incoming MQTT messages
  mqttClient.on('message', async (topic, mqttMessage) => {
    if (topic !== 'notification/events') return;

    let event = null;
    try { event = JSON.parse(mqttMessage.toString()); } catch (e) { console.warn('mobileConsumer: invalid JSON'); return; }

    // MESSAGE DEDUPLICATION: Check if already processed
    const messageId = event.messageId || `${event.type}_${event.userId}_${event.timestamp || ''}`;
    try {
      const existing = await models.ProcessedMessage.findOne({ messageId }).lean();
      if (existing) {
        console.log(`⏭️  Skipping already processed message: ${messageId}`);
        return; // Already processed by another replica
      }
      // Mark as processed (with 5-second timeout to handle race conditions)
      await models.ProcessedMessage.create({ messageId, processedAt: new Date() });
    } catch (err) {
      if (err.code === 11000) {
        // Duplicate key error - another replica is processing this
        console.log(`⏭️  Another replica is processing message: ${messageId}`);
        return;
      }
      console.error('Error checking processed messages:', err);
    }

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
          console.log('📣 Sending push to token (preview):', (t.token || '').slice(0,24) + '...');
          if (FCM_SEND_DELAY_MS > 0) {
            console.log(`⏳ Delaying send for ${FCM_SEND_DELAY_MS}ms to allow token propagation`);
            await sleep(FCM_SEND_DELAY_MS);
          }
          const resp = await admin.messaging().sendToDevice(t.token, message);
          console.log('📲 Sent push to', t.token, 'resp:', resp && resp.results ? resp.results.length : '(no results)');
          // update lastSeenAt
          await models.DeviceToken.updateOne({ _id: t._id }, { $set: { lastSeenAt: new Date() } });
        } catch (err) {
            // Log richer error info to help diagnose 4xx/5xx responses from FCM
            try {
              console.error('❌ sendToDevice error', {
                message: err && err.message, code: err && err.code, stack: err && err.stack, toString: err && err.toString && err.toString(), errorInfo: err && err.errorInfo, response: err && err.response
              });
            } catch (le) {
              console.error('❌ sendToDevice error (fallback):', err && err.message ? err.message : err);
            }
            // If FCM reports the token is unregistered / not found, mark it revoked to avoid future attempts
            try {
              const msg = (err && err.errorInfo && err.errorInfo.message) || (err && err.message) || '';
              const isUnregistered = msg && (String(msg).includes('UNREGISTERED') || String(msg).toLowerCase().includes('not found') || (err && err.code === 'messaging/registration-token-not-registered'));
              // If fallback enabled, attempt HTTP v1 send for diagnostics/workaround
              let v1res = null;
              if (FCM_FALLBACK_V1) {
                try {
                  console.log('🔁 admin send failed — attempting HTTP v1 fallback for token (preview):', (t.token||'').slice(0,24) + '...');
                  v1res = await sendViaV1(t.token, message);
                  console.log('🔁 HTTP v1 fallback response for token:', { v1res });
                } catch (vfErr) {
                  console.warn('🔁 HTTP v1 fallback error', vfErr && vfErr.message ? vfErr.message : vfErr);
                }
              }

              // Revoke token only if both admin indicates unregistered AND v1 either not enabled or also failed
              const v1Succeeded = v1res && v1res.status && Number(v1res.status) === 200;
              if (isUnregistered && !v1Succeeded) {
                console.log('🚫 Marking token as revoked due to UNREGISTERED/NOT_FOUND response for', (t.token||'').slice(0,24) + '...');
                await models.DeviceToken.updateOne({ _id: t._id }, { $set: { revoked: true } });
              } else if (isUnregistered && v1Succeeded) {
                console.log('ℹ️ Admin SDK reported UNREGISTERED but HTTP v1 accepted the token; keeping token active for now');
              }
            } catch (revErr) {
              console.warn('Could not mark token revoked', revErr && revErr.message ? revErr.message : revErr);
            }
          }
        }
    } catch (e) {
      console.error('mobileConsumer error', e && e.message ? e.message : e);
    }
  });
}

module.exports = { startMobileConsumer };
