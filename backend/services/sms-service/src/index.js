require('dotenv').config();
const mqtt = require('mqtt');
const { v4: uuidv4 } = require('uuid');
const express = require('express');
const http = require('http');
const client = require('prom-client');
const winston = require('winston');
const path = require('path');
const twilioLib = require('twilio');

const logger = winston.createLogger({ level: process.env.LOG_LEVEL || 'info', transports: [ new winston.transports.Console({ format: winston.format.simple() }) ] });

// Metrics
client.collectDefaultMetrics({ timeout: 5000 });
const smsSent = new client.Counter({ name: 'sms_sent_total', help: 'Total SMS messages successfully sent' });
const smsFailed = new client.Counter({ name: 'sms_failed_total', help: 'Total SMS messages failed to send' });

// Adapter selection: pluggable SMS provider implementations live in src/adapters
const SMS_PROVIDER = (process.env.SMS_PROVIDER || 'mock').toLowerCase();
let smsAdapter = null;
try {
  const adapterPath = path.join(__dirname, 'adapters', `${SMS_PROVIDER}Adapter.js`);
  smsAdapter = require(adapterPath);
  logger.info(`SMS adapter loaded: ${SMS_PROVIDER}`);
} catch (e) {
  logger.warn(`Could not load SMS adapter for '${SMS_PROVIDER}', falling back to mock`, e && e.message ? e.message : e);
  smsAdapter = require(path.join(__dirname, 'adapters', 'mockAdapter.js'));
}

// Load Twilio Verify adapter for OTP verification
let verifyAdapter = null;
try {
  verifyAdapter = require(path.join(__dirname, 'adapters', 'twilioVerifyAdapter.js'));
  logger.info('Twilio Verify adapter loaded');
} catch (e) {
  logger.warn('Twilio Verify adapter not available', e && e.message ? e.message : e);
}

// MQTT setup
const MQTT_BROKER = process.env.MQTT_BROKER || 'hivemq';
const MQTT_PORT = process.env.MQTT_PORT || 1883;
const mqttClient = mqtt.connect(`mqtt://${MQTT_BROKER}:${MQTT_PORT}`, {
  clientId: `sms-service-${uuidv4()}`,
  clean: true,
  reconnectPeriod: 1000
});

mqttClient.on('connect', () => {
  logger.info(`✅ MQTT connected to HiveMQ at ${MQTT_BROKER}:${MQTT_PORT}`);
});

mqttClient.on('error', (err) => {
  logger.error('❌ MQTT connection error:', err);
});

// Simple HTTP app for metrics and test send
const app = express();

// CORS middleware - allow requests from notification service frontend
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

app.use(express.json());
// parse urlencoded bodies for Twilio webhook callbacks (application/x-www-form-urlencoded)
app.use(express.urlencoded({ extended: false }));

app.get('/metrics', async (req, res) => { res.set('Content-Type', client.register.contentType); res.end(await client.register.metrics()); });

// Manual test endpoint (PoC) — send an SMS immediately (uses configured adapter; mock by default)
app.post('/send-test', async (req, res) => {
  const { to, body } = req.body || {};
  if (!to || !body) return res.status(400).json({ error: 'to and body required' });
  try {
    const result = await trySendSms({ to, body });
    res.json({ ok: true, result });
  } catch (e) {
    res.status(500).json({ error: e && e.message ? e.message : String(e) });
  }
});

// ==========================================
// TWILIO VERIFY ENDPOINTS (OTP Verification)
// ==========================================

// Simple in-memory rate limiter to prevent error 30039 (message loops)
const verifyRateLimiter = new Map();
const RATE_LIMIT_WINDOW = 10 * 60 * 1000; // 10 minutes

function checkRateLimit(phoneNumber) {
  const now = Date.now();
  const lastSent = verifyRateLimiter.get(phoneNumber);
  
  if (lastSent && (now - lastSent) < RATE_LIMIT_WINDOW) {
    const waitTime = Math.ceil((RATE_LIMIT_WINDOW - (now - lastSent)) / 1000 / 60);
    return { allowed: false, waitMinutes: waitTime };
  }
  
  verifyRateLimiter.set(phoneNumber, now);
  return { allowed: true };
}

// Step 1: Send verification code to user's phone
app.post('/verify/send', async (req, res) => {
  const { to, channel } = req.body || {};
  if (!to) return res.status(400).json({ error: 'to (phone number) is required' });
  
  if (!verifyAdapter) {
    return res.status(503).json({ error: 'Twilio Verify service not configured' });
  }

  // Check rate limit to prevent Twilio error 30039
  const rateCheck = checkRateLimit(to);
  if (!rateCheck.allowed) {
    logger.warn(`Rate limit exceeded for ${to}, wait ${rateCheck.waitMinutes} minutes`);
    return res.status(429).json({ 
      error: 'Too many verification requests',
      message: `Please wait ${rateCheck.waitMinutes} minute(s) before requesting a new code. This prevents Twilio error 30039 (message loops).`,
      waitMinutes: rateCheck.waitMinutes
    });
  }

  try {
    const result = await verifyAdapter.sendVerificationCode({ 
      to, 
      channel: channel || 'sms' 
    });
    logger.info('Verification code sent', `to=${to} status=${result.status}`);
    res.json({ 
      ok: true, 
      status: result.status,
      to: result.to,
      channel: result.channel,
      message: 'Verification code sent successfully'
    });
  } catch (e) {
    logger.error('Failed to send verification code', e && e.message ? e.message : e);
    
    // Check for Twilio-specific errors
    let errorMessage = 'Failed to send verification code';
    if (e.code === 30039) {
      errorMessage = 'Too many messages sent too quickly. Please wait 10 minutes and try again.';
    } else if (e.code) {
      errorMessage = `Twilio error ${e.code}: ${e.message}`;
    }
    
    res.status(500).json({ 
      error: e && e.message ? e.message : String(e),
      code: e.code,
      message: errorMessage
    });
  }
});

// Step 2: Verify the code entered by user
app.post('/verify/check', async (req, res) => {
  const { to, code } = req.body || {};
  if (!to || !code) {
    return res.status(400).json({ error: 'to (phone number) and code are required' });
  }
  
  if (!verifyAdapter) {
    return res.status(503).json({ error: 'Twilio Verify service not configured' });
  }

  try {
    const result = await verifyAdapter.checkVerificationCode({ to, code });
    logger.info('Verification check completed', `to=${to} valid=${result.valid}`);
    
    if (result.valid) {
      res.json({ 
        ok: true, 
        verified: true,
        status: result.status,
        message: '✅ Phone number verified successfully!'
      });
    } else {
      res.status(400).json({ 
        ok: false, 
        verified: false,
        status: result.status,
        message: '❌ Invalid verification code'
      });
    }
  } catch (e) {
    logger.error('Failed to check verification code', e && e.message ? e.message : e);
    res.status(500).json({ 
      error: e && e.message ? e.message : String(e),
      message: 'Failed to verify code'
    });
  }
});

const METRICS_PORT = parseInt(process.env.METRICS_PORT || '4004', 10);
http.createServer(app).listen(METRICS_PORT, () => logger.info(`sms-service HTTP server listening on ${METRICS_PORT}`));

// Delivery status webhook endpoint (Twilio and generic providers)
// Twilio sends POST requests with application/x-www-form-urlencoded payloads.
// Example fields: MessageSid, MessageStatus, To, From, ErrorCode, ErrorMessage
app.post('/sms/status', async (req, res) => {
  try {
    // If running with Twilio as the provider and an auth token is configured,
    // validate the Twilio request signature to ensure callbacks are genuine.
    // Optionally set TWILIO_WEBHOOK_URL to the full public URL Twilio calls
    // (useful if behind proxies or tunneling). If not set, we reconstruct
    // from the incoming request which may fail for some proxy setups.
    if (SMS_PROVIDER === 'twilio' && process.env.TWILIO_AUTH_TOKEN) {
      const signature = req.get('X-Twilio-Signature') || req.get('x-twilio-signature');
      const webhookUrl = process.env.TWILIO_WEBHOOK_URL || (req.protocol + '://' + req.get('host') + req.originalUrl);
      const params = req.body || {};
      try {
        const valid = twilioLib.validateRequest(process.env.TWILIO_AUTH_TOKEN, signature, webhookUrl, params);
        if (!valid) {
          logger.warn('Twilio webhook signature validation failed', { url: webhookUrl, provider: SMS_PROVIDER });
          return res.status(403).send('invalid signature');
        }
      } catch (vErr) {
        logger.warn('Twilio signature validation error', vErr && vErr.message ? vErr.message : vErr);
        return res.status(400).send('signature validation error');
      }
    }

    const body = req.body || {};
    const messageId = body.MessageSid || body.messageId || null;
    const status = body.MessageStatus || body.status || null;
    const to = body.To || body.to || null;
    const from = body.From || body.from || null;
    const errorCode = body.ErrorCode || body.errorCode || null;
    const errorMessage = body.ErrorMessage || body.errorMessage || null;

    const receipt = {
      type: 'sms.delivery',
      provider: SMS_PROVIDER,
      messageId,
      status,
      to,
      from,
      errorCode,
      errorMessage,
      receivedAt: new Date().toISOString()
    };

    // publish delivery receipt to MQTT so other services can react
    try {
      mqttClient.publish('notification/events', JSON.stringify(receipt), { qos: 1 }, (err) => {
        if (err) {
          logger.warn('Failed to publish SMS delivery receipt to MQTT', err);
        } else {
          logger.info('Published SMS delivery receipt to notification/events', messageId || '(no id)');
        }
      });
    } catch (px) {
      logger.warn('Failed to publish SMS delivery receipt to MQTT', px && px.message ? px.message : px);
    }

    // Respond quickly to the webhook sender
    res.status(200).send('ok');
  } catch (e) {
    logger.error('Error handling /sms/status webhook', e && e.message ? e.message : e);
    res.status(500).send('error');
  }
});

async function trySendSms({ to, body }) {
  // enforce simple E.164-ish presence check (not exhaustive)
  if (typeof to !== 'string' || !to.startsWith('+')) {
    throw new Error('Phone number must be in E.164 format (e.g. +61412345678)');
  }
  // Delegate to adapter
  try {
    const result = await smsAdapter.sendSms({ to, body, meta: { env: process.env.NODE_ENV } });
    // adapter success
    smsSent.inc(1);
    logger.info('SMS adapter result', result && result.messageId ? `id=${result.messageId}` : JSON.stringify(result));
    // publish ack back to MQTT (notification/events) for visibility
    try {
      const ack = { type: 'sms.sent', userId: null, to, messageId: result && result.messageId ? result.messageId : null, timestamp: new Date().toISOString(), provider: SMS_PROVIDER };
      mqttClient.publish('notification/events', JSON.stringify(ack), { qos: 1 }, (err) => {
        if (err) {
          logger.warn('Could not publish sms sent ack to MQTT', err);
        }
      });
    } catch (px) {
      logger.warn('Could not publish sms sent ack to MQTT', px && px.message ? px.message : px);
    }
    return result;
  } catch (err) {
    smsFailed.inc(1);
    logger.error('SMS send failed', err && err.message ? err.message : err);
    // publish to a DLQ topic
    try {
      const dlq = { type: 'sms.failed', error: err && err.message ? err.message : String(err), original: { to, body }, timestamp: new Date().toISOString(), provider: SMS_PROVIDER };
      mqttClient.publish('notification/dlq', JSON.stringify(dlq), { qos: 1 }, (pubErr) => {
        if (pubErr) {
          logger.warn('Could not publish sms DLQ to MQTT', pubErr);
        }
      });
    } catch (px) {
      logger.warn('Could not publish sms DLQ to MQTT', px && px.message ? px.message : px);
    }
    throw err;
  }
}

// MQTT consumer: subscribe to sms/send and notification/events
function startMqtt() {
  mqttClient.subscribe(['sms/send', 'notification/events'], { qos: 1 }, (err) => {
    if (err) {
      logger.error('❌ Failed to subscribe to MQTT topics:', err);
      return;
    }
    logger.info('📞 SMS service subscribed to sms/send, notification/events');
  });

  mqttClient.on('message', async (topic, message) => {
    let evt = null;
    try { evt = JSON.parse(message.toString()); } catch (e) { logger.warn('Invalid JSON in MQTT message'); return; }
    try {
      // IMPORTANT: Ignore acknowledgment/receipt events to prevent message loops!
      if (evt.type === 'sms.sent' || evt.type === 'sms.failed' || evt.type === 'sms.delivery') {
        logger.debug('Ignoring SMS acknowledgment event:', evt.type);
        return;
      }
      
      // Heuristics: message types that indicate SMS should be sent
      if (evt.type === 'sms' || evt.type === 'sms.send' || evt.type === 'sms_family_request' || (evt.type === 'daily_login' && evt.familyPhone)) {
        const to = evt.to || evt.familyPhone;
        const body = evt.body || evt.message || (evt.userName ? `${evt.userName} checked in.` : `User ${evt.userId} checked in.`);
        logger.info('Processing SMS send for', to);
        try {
          await trySendSms({ to, body });
        } catch (err) {
          logger.error('trySendSms failed for MQTT message', err && err.message ? err.message : err);
        }
      }
    } catch (e) {
      logger.error('Error handling MQTT message', e && e.message ? e.message : e);
    }
  });
}

// Start MQTT consumer
startMqtt();
