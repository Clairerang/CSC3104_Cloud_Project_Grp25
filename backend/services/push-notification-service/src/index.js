require('dotenv').config();
const express = require('express');
const mqtt = require('mqtt');
const { v4: uuidv4 } = require('uuid');
const winston = require('winston');
const client = require('prom-client');
const { connectMongo, models } = require('./models');
const admin = require('firebase-admin');
const { GoogleAuth } = require('google-auth-library');
const https = require('https');

// Logger setup
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.Console({
      format: winston.format.simple()
    })
  ]
});

// Metrics
client.collectDefaultMetrics({ timeout: 5000 });
const pushSent = new client.Counter({ name: 'push_notifications_sent_total', help: 'Total push notifications sent' });
const pushFailed = new client.Counter({ name: 'push_notifications_failed_total', help: 'Total push notifications failed' });

// Initialize Firebase Admin
function initFirebase() {
  if (admin.apps && admin.apps.length) return;
  const svc = process.env.FIREBASE_SERVICE_ACCOUNT_PATH || process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
  if (!svc) {
    logger.warn('⚠️ FIREBASE service account not provided. Push notifications disabled.');
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
    logger.error('❌ Failed to load Firebase service account:', e && e.message ? e.message : e);
    return;
  }

  try {
    admin.initializeApp({ 
      credential: admin.credential.cert(cred), 
      projectId: cred && cred.project_id 
    });
    logger.info('✅ Firebase Admin initialized');
    try {
      logger.info(`🔎 Firebase project: ${admin.app().options.projectId || '<no-project-id>'}`);
    } catch (e) { /* ignore */ }
  } catch (e) {
    logger.error('❌ Firebase admin init error', e && e.message ? e.message : e);
  }
}

// MQTT Setup
const MQTT_BROKER = process.env.MQTT_BROKER || 'hivemq';
const MQTT_PORT = process.env.MQTT_PORT || 1883;

const mqttClient = mqtt.connect(`mqtt://${MQTT_BROKER}:${MQTT_PORT}`, {
  clientId: `push-notification-${uuidv4()}`,
  clean: true,
  reconnectPeriod: 1000
});

mqttClient.on('connect', () => {
  logger.info(`✅ MQTT connected to ${MQTT_BROKER}:${MQTT_PORT}`);
});

mqttClient.on('error', (err) => {
  logger.error('❌ MQTT connection error:', err);
});

// Optional send delay to avoid race conditions
const FCM_SEND_DELAY_MS = parseInt(process.env.FCM_SEND_DELAY_MS || '500', 10) || 0;
const sleep = (ms) => new Promise((res) => setTimeout(res, ms));

// Optional HTTP v1 fallback
const FCM_FALLBACK_V1 = String(process.env.FCM_FALLBACK_V1 || '').toLowerCase() === 'true';

async function sendViaV1(token, messageObj) {
  try {
    let projectId = (admin.app && admin.app().options && admin.app().options.projectId) || process.env.FIREBASE_PROJECT_ID;
    if (!projectId && process.env.FIREBASE_SERVICE_ACCOUNT_PATH) {
      try { 
        const cred = require(process.env.FIREBASE_SERVICE_ACCOUNT_PATH); 
        projectId = projectId || cred && cred.project_id; 
      } catch (e) { /* ignore */ }
    }
    if (!projectId) throw new Error('projectId not available for FCM v1');

    const body = JSON.stringify({
      message: {
        token,
        notification: messageObj.notification || undefined,
        data: messageObj.data || undefined
      }
    });

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
          try { 
            resolve({ status: res.statusCode, body: JSON.parse(data) }); 
          } catch (e) { 
            resolve({ status: res.statusCode, body: data }); 
          }
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

async function startPushService() {
  initFirebase();
  if (!admin.apps || admin.apps.length === 0) {
    logger.warn('⚠️ Push notification service disabled: Firebase Admin not initialized');
    return;
  }

  try {
    await connectMongo();
  } catch (e) {
    logger.warn('MongoDB connection warning:', e && e.message ? e.message : e);
  }

  // Subscribe to notification/events MQTT topic
  mqttClient.subscribe('notification/events', { qos: 1 }, (err) => {
    if (err) {
      logger.error('❌ Failed to subscribe to notification/events:', err);
    } else {
      logger.info('📲 Subscribed to notification/events for push notifications');
    }
  });

  // Handle incoming MQTT messages
  mqttClient.on('message', async (topic, mqttMessage) => {
    if (topic !== 'notification/events') return;
    
    let event = null;
    try { 
      event = JSON.parse(mqttMessage.toString()); 
    } catch (e) { 
      logger.warn('Invalid JSON in MQTT message'); 
      return; 
    }

    // Only deliver to mobile targets
    const targets = event.target || event.targets || [];
    if (!targets.includes('mobile')) return;

    // Find device tokens for user
    try {
      const tokens = await models.DeviceToken.find({ 
        userId: event.userId, 
        revoked: { $ne: true } 
      }).lean().exec();

      if (!tokens || tokens.length === 0) {
        logger.info(`No device tokens for user ${event.userId}`);
        return;
      }

      const message = {
        notification: {
          title: event.title || (event.type === 'checkin' ? 'Check-in received' : 'Notification'),
          body: event.body || `Event: ${event.type}`
        },
        data: { payload: JSON.stringify(event) }
      };

      // Send to each token
      for (const t of tokens) {
        try {
          logger.info(`📣 Sending push to token: ${(t.token || '').slice(0,24)}...`);
          
          if (FCM_SEND_DELAY_MS > 0) {
            logger.info(`⏳ Delaying send for ${FCM_SEND_DELAY_MS}ms`);
            await sleep(FCM_SEND_DELAY_MS);
          }

          const resp = await admin.messaging().sendToDevice(t.token, message);
          logger.info(`📲 Push sent to ${t.token.slice(0, 24)}...`, { results: resp.results ? resp.results.length : 0 });
          
          pushSent.inc(1);
          
          // Update last seen timestamp
          await models.DeviceToken.updateOne(
            { _id: t._id }, 
            { $set: { lastSeenAt: new Date() } }
          );
        } catch (err) {
          pushFailed.inc(1);
          
          // Log detailed error
          try {
            logger.error('❌ sendToDevice error', {
              message: err && err.message, 
              code: err && err.code, 
              errorInfo: err && err.errorInfo
            });
          } catch (le) {
            logger.error('❌ sendToDevice error:', err && err.message ? err.message : err);
          }

          // Check if token is unregistered
          try {
            const msg = (err && err.errorInfo && err.errorInfo.message) || (err && err.message) || '';
            const isUnregistered = msg && (
              String(msg).includes('UNREGISTERED') || 
              String(msg).toLowerCase().includes('not found') || 
              (err && err.code === 'messaging/registration-token-not-registered')
            );

            // Optional HTTP v1 fallback
            let v1res = null;
            if (FCM_FALLBACK_V1) {
              try {
                logger.info(`🔁 Attempting HTTP v1 fallback for token ${(t.token||'').slice(0,24)}...`);
                v1res = await sendViaV1(t.token, message);
                logger.info('🔁 HTTP v1 fallback response:', { status: v1res.status });
              } catch (vfErr) {
                logger.warn('🔁 HTTP v1 fallback error', vfErr && vfErr.message ? vfErr.message : vfErr);
              }
            }

            // Revoke token only if both admin indicates unregistered AND v1 failed
            const v1Succeeded = v1res && v1res.status && Number(v1res.status) === 200;
            if (isUnregistered && !v1Succeeded) {
              logger.info(`🚫 Marking token as revoked: ${(t.token||'').slice(0,24)}...`);
              await models.DeviceToken.updateOne(
                { _id: t._id }, 
                { $set: { revoked: true } }
              );
            } else if (isUnregistered && v1Succeeded) {
              logger.info('ℹ️ Admin SDK reported UNREGISTERED but HTTP v1 succeeded; keeping token active');
            }
          } catch (revErr) {
            logger.warn('Could not mark token revoked', revErr && revErr.message ? revErr.message : revErr);
          }
        }
      }
    } catch (e) {
      logger.error('Push notification error', e && e.message ? e.message : e);
    }
  });
}

// Express server for health checks and metrics
const app = express();
const PORT = process.env.PORT || 4020;

app.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    service: 'push-notification-service',
    firebase: admin.apps && admin.apps.length > 0 ? 'initialized' : 'disabled'
  });
});

app.get('/metrics', async (req, res) => {
  res.set('Content-Type', client.register.contentType);
  res.end(await client.register.metrics());
});

app.get('/', (req, res) => {
  res.json({
    service: 'Push Notification Service',
    status: 'Running',
    messaging: 'Firebase Cloud Messaging (FCM)',
    transport: 'MQTT (HiveMQ)',
    version: '1.0.0',
    endpoints: {
      health: 'GET /health - Health check',
      metrics: 'GET /metrics - Prometheus metrics'
    }
  });
});

app.listen(PORT, () => {
  logger.info(`🚀 Push Notification Service listening on port ${PORT}`);
  startPushService().catch(e => logger.error('Failed to start push service:', e));
});
