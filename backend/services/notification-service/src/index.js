require("dotenv").config();
const express = require("express");
const path = require('path');
const { startKafkaConsumer, publishEvent } = require("./kafkaConsumer");
const { startDashboardConsumer, emitter, getRecent } = require('./dashboardConsumer');
const { startMobileConsumer } = require('./mobileConsumer');
const { connectMongo, models } = require('./models');
// Prometheus metrics
const client = require('prom-client');
client.collectDefaultMetrics({ timeout: 5000 });

const app = express();
app.use(express.json());

app.get("/", (req, res) => res.send("Notification Service Running ✅"));

// Register a user (simple for testing)
app.post('/register-user', async (req, res) => {
  const { userId, name, contact } = req.body;
  if (!userId) return res.status(400).json({ error: 'userId required' });
  try {
    const doc = await models.User.findOneAndUpdate({ userId }, { userId, name, contact }, { upsert: true, new: true, setDefaultsOnInsert: true });
    res.json({ ok: true, user: doc });
  } catch (e) {
    res.status(500).json({ error: e.message || String(e) });
  }
});

// Accept a check-in event
app.post('/checkin', async (req, res) => {
  const { userId, mood, timestamp } = req.body;
  if (!userId) return res.status(400).json({ error: 'userId required' });
  try {
    const ts = timestamp ? new Date(timestamp) : new Date();
    const check = await models.CheckIn.create({ userId, mood, timestamp: ts });
    await models.User.findOneAndUpdate({ userId }, { $set: { lastCheckInAt: ts } }, { upsert: true });

    // publish an internal notification event so dashboard / mobile can react
    const evt = { type: 'checkin', userId, mood: mood || null, timestamp: ts.toISOString(), target: ['dashboard','mobile','tablet'] };
    publishEvent(evt).catch(err => console.warn('publishEvent err', err));

    res.json({ ok: true, checkin: check, publishedEvent: evt });
  } catch (e) {
    res.status(500).json({ error: e.message || String(e) });
  }
});

// Daily login endpoint used by testing UI to both persist a checkin and
// publish a `daily_login` event which the email-service listens for.
// Additionally, if a familyPhone is provided, publish an SMS send event.
app.post('/daily-login', async (req, res) => {
  const { userId, mood, timestamp, familyEmail, familyPhone, userName } = req.body;
  if (!userId) return res.status(400).json({ error: 'userId required' });
  try {
    const ts = timestamp ? new Date(timestamp) : new Date();
    const check = await models.CheckIn.create({ userId, mood, timestamp: ts });
    await models.User.findOneAndUpdate({ userId }, { $set: { lastCheckInAt: ts, name: userName || undefined } }, { upsert: true });

  // include targets so consumers (dashboard/mobile) will receive this event
  const evt = { type: 'daily_login', userId, userName: userName || null, mood: mood || null, timestamp: ts.toISOString(), familyEmail: familyEmail || null, familyPhone: familyPhone || null, target: ['dashboard','mobile','tablet'] };
    publishEvent(evt).catch(err => console.warn('publishEvent err', err));

    // If familyPhone provided, publish a dedicated SMS event with the requested message
    let smsPublishedEvent = null;
    try {
      if (familyPhone && String(familyPhone).trim()) {
        const smsEvt = {
          type: 'sms',
          userId,
          to: String(familyPhone).trim(),
          body: `Daily Login Achieved for '${userId}'`,
          timestamp: new Date().toISOString()
        };
        await publishEvent(smsEvt);
        smsPublishedEvent = smsEvt;
      }
    } catch (se) {
      console.warn('publishEvent (sms) err', se);
    }

    res.json({ ok: true, checkin: check, publishedEvent: evt, smsPublishedEvent });
  } catch (e) {
    res.status(500).json({ error: e.message || String(e) });
  }
});

// Simple debug endpoints
app.get('/users', async (req, res) => {
  const list = await models.User.find().lean().exec();
  res.json(list);
});

// Debug: list device tokens for a user (temporary, for local testing)
app.get('/debug/device-tokens', async (req, res) => {
  const { userId } = req.query;
  if (!userId) return res.status(400).json({ error: 'userId query param required' });
  try {
    const docs = await models.DeviceToken.find({ userId }).lean().exec();
    res.json({ ok: true, userId, tokens: docs });
  } catch (e) {
    res.status(500).json({ error: e && e.message ? e.message : String(e) });
  }
});

// HTTP route to publish an SMS send event (so UI can trigger SMS via Kafka)
app.post('/send-sms', async (req, res) => {
  const { to, body, userId } = req.body || {};
  if (!to || !body) return res.status(400).json({ error: 'to and body are required' });
  try {
    const evt = {
      type: 'sms',
      userId: userId || null,
      to,
      body,
      timestamp: new Date().toISOString()
    };
    // publish to Kafka so sms-service will consume and send
    await publishEvent(evt);
    res.json({ ok: true, publishedEvent: evt });
  } catch (e) {
    res.status(500).json({ error: e && e.message ? e.message : String(e) });
  }
});

// Save verified phone number after successful OTP verification
app.post('/verify-phone/save', async (req, res) => {
  const { userId, phoneNumber, relationship } = req.body || {};
  if (!userId || !phoneNumber) {
    return res.status(400).json({ error: 'userId and phoneNumber are required' });
  }
  
  // Validate E.164 format
  if (!phoneNumber.match(/^\+[1-9]\d{1,14}$/)) {
    return res.status(400).json({ error: 'phoneNumber must be in E.164 format (e.g. +6598765787)' });
  }
  
  try {
    // Check if phone already verified for this user
    const existing = await models.VerifiedPhone.findOne({ userId, phoneNumber }).exec();
    if (existing) {
      existing.isActive = true;
      existing.verifiedAt = new Date();
      if (relationship) existing.relationship = relationship;
      await existing.save();
      return res.json({ ok: true, verified: existing, message: 'Phone number updated' });
    }
    
    // Create new verified phone record
    const verified = await models.VerifiedPhone.create({
      userId,
      phoneNumber,
      relationship: relationship || 'self',
      verificationMethod: 'sms',
      isActive: true
    });
    
    res.json({ 
      ok: true, 
      verified,
      message: 'Phone number verified and saved successfully!' 
    });
  } catch (e) {
    res.status(500).json({ error: e && e.message ? e.message : String(e) });
  }
});

// Get all verified phone numbers for a user
app.get('/verify-phone/list', async (req, res) => {
  const { userId } = req.query;
  if (!userId) return res.status(400).json({ error: 'userId required' });
  
  try {
    const phones = await models.VerifiedPhone.find({ userId, isActive: true })
      .sort({ verifiedAt: -1 })
      .lean()
      .exec();
    res.json({ ok: true, phones });
  } catch (e) {
    res.status(500).json({ error: e && e.message ? e.message : String(e) });
  }
});

// Send urgent SMS to verified phone numbers (bypasses verification, direct SMS)
app.post('/send-urgent-sms', async (req, res) => {
  const { userId, message, phoneNumbers } = req.body || {};
  
  if (!message) {
    return res.status(400).json({ error: 'message is required' });
  }
  
  try {
    let targetPhones = [];
    
    // If phoneNumbers array provided, use those
    if (phoneNumbers && Array.isArray(phoneNumbers)) {
      targetPhones = phoneNumbers;
    } else if (userId) {
      // Otherwise, get all verified phones for this user
      const verified = await models.VerifiedPhone.find({ userId, isActive: true }).lean().exec();
      targetPhones = verified.map(v => v.phoneNumber);
    } else {
      return res.status(400).json({ error: 'Either userId or phoneNumbers array required' });
    }
    
    if (targetPhones.length === 0) {
      return res.status(404).json({ error: 'No verified phone numbers found' });
    }
    
    // Publish SMS events to Kafka for each phone number
    const published = [];
    for (const phone of targetPhones) {
      const evt = {
        type: 'sms',
        userId: userId || null,
        to: phone,
        body: `🚨 URGENT: ${message}`,
        urgent: true,
        timestamp: new Date().toISOString()
      };
      
      await publishEvent(evt);
      published.push({ phone, status: 'queued' });
      
      // Update last SMS timestamp in database
      await models.VerifiedPhone.updateOne(
        { phoneNumber: phone },
        { 
          $set: { lastSmsAt: new Date() },
          $inc: { smsCount: 1 }
        }
      ).exec();
    }
    
    res.json({ 
      ok: true, 
      message: `Urgent SMS queued for ${published.length} recipient(s)`,
      published 
    });
  } catch (e) {
    res.status(500).json({ error: e && e.message ? e.message : String(e) });
  }
});

app.get('/checkins', async (req, res) => {
  const { userId } = req.query;
  const q = userId ? { userId } : {};
  const docs = await models.CheckIn.find(q).sort({ timestamp: -1 }).limit(50).lean().exec();
  res.json(docs);
});

// Save device token for push notifications (FCM)
app.post('/save-device-token', async (req, res) => {
  const { userId, token, platform } = req.body;
  if (!userId || !token) return res.status(400).json({ error: 'userId and token required' });
  try {
    // upsert token; avoid duplicates
    const existing = await models.DeviceToken.findOne({ token }).exec();
    if (existing) {
      existing.userId = userId;
      existing.platform = platform || existing.platform;
      existing.revoked = false;
      existing.lastSeenAt = new Date();
      await existing.save();
      return res.json({ ok: true, token: existing });
    }
    const doc = await models.DeviceToken.create({ userId, token, platform, lastSeenAt: new Date() });
    res.json({ ok: true, token: doc });
  } catch (e) {
    res.status(500).json({ error: e && e.message ? e.message : String(e) });
  }
});

// Scheduler: check for missed checkins and send reminders
const CHECK_PERIOD_MS = parseInt(process.env.CHECK_PERIOD_MS || '60000', 10); // default 60s for testing
const CHECKIN_THRESHOLD_MS = parseInt(process.env.CHECKIN_THRESHOLD_MS || String(24 * 60 * 60 * 1000), 10); // default 24h

async function checkForMissedCheckins() {
  try {
    const users = await models.User.find().lean().exec();
    const now = Date.now();
    for (const u of users) {
      const last = u.lastCheckInAt ? new Date(u.lastCheckInAt).getTime() : 0;
      const lastReminder = u.lastReminderAt ? new Date(u.lastReminderAt).getTime() : 0;
      const age = now - last;
      if (age > CHECKIN_THRESHOLD_MS) {
        // don't spam: only remind once per threshold window
        if (now - lastReminder > CHECKIN_THRESHOLD_MS) {
          const alert = {
            type: 'missed_checkin_alert',
            userId: u.userId,
            name: u.name,
            ageMs: age,
            targets: ['dashboard','mobile','tablet']
          };
          await publishEvent(alert);
          // update lastReminderAt
          await models.User.updateOne({ userId: u.userId }, { $set: { lastReminderAt: new Date() } });
          console.log(`🔔 Published missed-checkin alert for ${u.userId}`);
        }
      }
    }
  } catch (e) {
    console.error('⚠️ checkForMissedCheckins error:', e && e.message ? e.message : e);
  }
}

async function start() {
  const PORT = process.env.PORT || 4002;
  await connectMongo();
  // serve testing-notification static frontend if present
  // index.js lives in /app/src inside the container, so testing-notification is one level up
  const staticPath = path.join(__dirname, '..', 'testing-notification');
  app.use('/testing-notification', express.static(staticPath));
  app.get('/testing-notification', (req, res) => res.sendFile(path.join(staticPath, 'index.html')));

  // Serve a small dashboard UI and SSE stream for real-time notifications
  // Ensure explicit dashboard route is handled before the static middleware
  app.get('/dashboard', (req, res) => res.sendFile(path.join(staticPath, 'dashboard.html')));
  app.get('/dashboard/', (req, res) => res.sendFile(path.join(staticPath, 'dashboard.html')));
  app.use('/dashboard', express.static(staticPath));

  // SSE endpoint for dashboard clients to receive live events
  app.get('/dashboard/stream', (req, res) => {
    res.set({
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive'
    });
    res.flushHeaders && res.flushHeaders();

    // send recent events snapshot
    try {
      const recent = getRecent();
      res.write(`data: ${JSON.stringify({ type: 'snapshot', items: recent })}\n\n`);
    } catch (e) {
      // ignore
    }

    const onEvent = (evt) => {
      res.write(`data: ${JSON.stringify({ type: 'event', event: evt })}\n\n`);
    };

    emitter.on('event', onEvent);

    // cleanup on client disconnect
    req.on('close', () => {
      emitter.removeListener('event', onEvent);
    });
  });

  // History endpoint: paginated persisted notification events
  app.get('/dashboard/history', async (req, res) => {
    try {
      const limit = Math.min(parseInt(req.query.limit || '50', 10) || 50, 200);
      const page = Math.max(parseInt(req.query.page || '1', 10) || 1, 1);
      const skip = (page - 1) * limit;
      const docs = await models.NotificationEvent.find().sort({ receivedAt: -1 }).skip(skip).limit(limit).lean().exec();
      res.json({ ok: true, items: docs });
    } catch (e) {
      res.status(500).json({ error: e && e.message ? e.message : String(e) });
    }
  });

  // Expose FCM/Web client config for the testing UI and service worker
  app.get('/fcm/config', (req, res) => {
    const cfg = {
        apiKey: process.env.FIREBASE_API_KEY || process.env.FCM_API_KEY || null,
        authDomain: process.env.FIREBASE_AUTH_DOMAIN || null,
        projectId: process.env.FIREBASE_PROJECT_ID || process.env.GCLOUD_PROJECT || process.env.FIREBASE_PROJECT || null,
        messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID || process.env.FCM_SENDER_ID || null,
        appId: process.env.FIREBASE_APP_ID || null,
        vapidKey: process.env.FIREBASE_VAPID_KEY || process.env.FCM_VAPID_KEY || null
    };
    // Some Docker/YAML setups may pass quoted strings (e.g. "value") which end up
    // embedded in the env value. Strip a single surrounding pair of single or
    // double quotes so the client receives the raw key/token.
    function stripQuotes(v) {
      if (typeof v !== 'string') return v;
      if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) {
        return v.slice(1, -1);
      }
      return v;
    }
    Object.keys(cfg).forEach(k => { cfg[k] = stripQuotes(cfg[k]); });
    // only return if at least apiKey and messagingSenderId exist
    if (!cfg.apiKey || !cfg.messagingSenderId) return res.status(404).json({ error: 'FCM client config not set' });
    res.json(cfg);
  });

  // Prometheus metrics endpoint
  app.get('/metrics', async (req, res) => {
    try {
      res.set('Content-Type', client.register.contentType);
      res.send(await client.register.metrics());
    } catch (e) {
      res.status(500).send(e && e.message ? e.message : String(e));
    }
  });

  app.listen(PORT, () => {
    console.log(`🔔 Notification Service running on port ${PORT}`);
    console.log(`📁 Serving testing frontend at http://localhost:${PORT}/testing-notification`);
  });

  // Start Kafka consumer
  startKafkaConsumer().catch(e => console.error('startKafkaConsumer error', e));

  // Start dashboard consumer for notification.events -> SSE
  startDashboardConsumer().catch(e => console.error('startDashboardConsumer error', e));

  // Start mobile push consumer (FCM)
  startMobileConsumer().catch(e => console.error('startMobileConsumer error', e));

  // Start gRPC server (PoC) to accept PublishEvent RPCs from other services
  try {
    const { startGrpcServer } = require('./grpcServer');
    startGrpcServer({ publishEvent });
  } catch (e) {
    console.warn('gRPC server failed to start (missing deps?):', e && e.message ? e.message : e);
  }

  // start periodic checker
  setInterval(checkForMissedCheckins, CHECK_PERIOD_MS);
}

start().catch(e => {
  console.error('Fatal start error', e && e.stack ? e.stack : e);
  process.exit(1);
});
