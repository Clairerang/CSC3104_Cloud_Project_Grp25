require("dotenv").config();
const express = require("express");
const path = require('path');
const { startMqttConsumer, publishEvent, mqttClient } = require("./mqttClient");
const { startDashboardConsumer, emitter, getRecent } = require('./dashboardConsumer');
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

// HTTP route to publish an SMS send event (so UI can trigger SMS via MQTT)
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
    // publish to MQTT so sms-service will consume and send
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
    
    // Publish SMS events to MQTT for each phone number
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

// Scheduler: missed check-ins within first 3h of today's session
// Tuning:
//  - CHECK_PERIOD_MS: how often to check (default 60s)
//  - MISSED_CHECKIN_WINDOW_MS: window from start-of-day to allow check-in (default 3h)
const CHECK_PERIOD_MS = parseInt(process.env.CHECK_PERIOD_MS || '60000', 10);
const MISSED_CHECKIN_WINDOW_MS = parseInt(process.env.MISSED_CHECKIN_WINDOW_MS || String(3 * 60 * 60 * 1000), 10);

function startOfToday() {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}

async function hasTodayCheckin(userId, todayStart) {
  const docs = await models.CheckIn.find({
    userId,
    timestamp: { $gte: todayStart }
  }).limit(1).lean().exec();
  return docs && docs.length > 0;
}

async function checkForMissedCheckins() {
  try {
    const users = await models.User.find().lean().exec();
    const now = Date.now();
    const todayStart = startOfToday();
    const windowEnd = new Date(todayStart.getTime() + MISSED_CHECKIN_WINDOW_MS);

    // Only evaluate after the window has passed
    if (Date.now() < windowEnd.getTime()) return;

    for (const u of users) {
      // Seniors only (if roles exist elsewhere, rely on downstream consumers)
      const checkedIn = await hasTodayCheckin(u.userId, todayStart);
      if (checkedIn) continue;

      // Prevent repeated alerts: reuse lastReminderAt as a per-day throttle
      const lastReminderAt = u.lastReminderAt ? new Date(u.lastReminderAt) : null;
      if (lastReminderAt && lastReminderAt >= todayStart) {
        // Already alerted today
        continue;
      }

      // Find caregivers/family linked to this senior and notify them
      const relations = await models.Relationship.find({ seniorId: u.userId }).lean().exec();
      const caregiverIds = (relations || []).map(r => r.linkAccId).filter(Boolean);

      if (caregiverIds.length === 0) {
        // Fallback: still publish an alert tagged to the senior (dashboard visibility)
        const alert = {
          type: 'missed_checkin_alert',
          userId: u.userId,
          name: u.name || u.userId,
          windowMs: MISSED_CHECKIN_WINDOW_MS,
          targets: ['dashboard']
        };
        await publishEvent(alert);
      } else {
        // Publish to each caregiver so their devices receive push
        for (const caregiverId of caregiverIds) {
          const alert = {
            type: 'missed_checkin_alert',
            userId: caregiverId,
            seniorId: u.userId,
            seniorName: u.name || u.userId,
            message: `No check-in from ${u.name || u.userId} within the first 3 hours`,
            targets: ['dashboard','mobile']
          };
          await publishEvent(alert);
        }
      }

      // Update lastReminderAt to avoid re-sending today
      await models.User.updateOne({ userId: u.userId }, { $set: { lastReminderAt: new Date() } });
      console.log(`🔔 Published missed-checkin alert (caregivers) for ${u.userId}`);
    }
  } catch (e) {
    console.error('⚠️ checkForMissedCheckins error:', e && e.message ? e.message : e);
  }
}

async function start() {
  const PORT = process.env.PORT || 4002;
  await connectMongo();
  // serve testing-ui static frontend from shared directory
  // Docker mounts ./shared/testing-ui to /app/testing-notification
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

  // Start MQTT consumer
  startMqttConsumer().catch(e => console.error('startMqttConsumer error', e));

  // Start dashboard consumer for notification/events -> SSE
  startDashboardConsumer().catch(e => console.error('startDashboardConsumer error', e));

  // NOTE: Mobile push notifications moved to push-notification-service

  // Start gRPC server with full RPC support
  try {
    const { startGrpcServer } = require('./grpcServer');
    startGrpcServer({ publishEvent, models });
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
