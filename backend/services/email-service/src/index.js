require('dotenv').config();
const mqtt = require('mqtt');
const { v4: uuidv4 } = require('uuid');
const nodemailer = require('nodemailer');
const winston = require('winston');

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  transports: [new winston.transports.Console({ format: winston.format.simple() })]
});

const MQTT_BROKER = process.env.MQTT_BROKER || 'hivemq';
const MQTT_PORT = process.env.MQTT_PORT || 1883;
const TOPIC = 'notification/events';

// MQTT setup
const mqttClient = mqtt.connect(`mqtt://${MQTT_BROKER}:${MQTT_PORT}`, {
  clientId: `email-service-${uuidv4()}`,
  clean: true,
  reconnectPeriod: 1000
});

mqttClient.on('connect', () => {
  logger.info(`✅ MQTT connected to HiveMQ at ${MQTT_BROKER}:${MQTT_PORT}`);
});

mqttClient.on('error', (err) => {
  logger.error('❌ MQTT connection error:', err);
});

// Setup Nodemailer transporter (Gmail SMTP for dev)
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// Prometheus metrics
const client = require('prom-client');
client.collectDefaultMetrics({ timeout: 5000 });
const emailSent = new client.Counter({ name: 'email_sent_total', help: 'Total emails successfully sent' });
const emailFailed = new client.Counter({ name: 'email_failed_total', help: 'Total emails failed to send' });

// Simple metrics HTTP server (no extra deps)
const http = require('http');
const METRICS_PORT = parseInt(process.env.METRICS_PORT || '4003', 10);
http.createServer(async (req, res) => {
  if (req.url === '/metrics') {
    res.setHeader('Content-Type', client.register.contentType);
    res.end(await client.register.metrics());
    return;
  }
  if (req.url === '/health') {
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ ok: true }));
    return;
  }
  res.statusCode = 404; res.end('not found');
}).listen(METRICS_PORT, () => logger.info(`Metrics server listening on ${METRICS_PORT}`));

async function sendEmail({ to, subject, text, html }) {
  const mail = {
    from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
    to,
    subject,
    text,
    html
  };
  logger.info(`Sending email to ${to} subject='${subject}'`);
  try {
    const res = await transporter.sendMail(mail);
    try { emailSent.inc(1); } catch (e) { /* ignore */ }
    return res;
  } catch (err) {
    try { emailFailed.inc(1); } catch (e) { /* ignore */ }
    throw err;
  }
}

async function start() {
  // Subscribe to notification/events MQTT topic
  mqttClient.subscribe(TOPIC, { qos: 1 }, (err) => {
    if (err) {
      logger.error('❌ Failed to subscribe to notification/events:', err);
      return;
    }
    logger.info(`📧 Email service subscribed to ${TOPIC}`);
  });

  // Handle incoming MQTT messages
  mqttClient.on('message', async (topic, message) => {
    try {
      const raw = message.toString();
      const evt = JSON.parse(raw);
      logger.info(`Received event type='${evt.type}' userId='${evt.userId || ''}'`);

      // Only handle daily_login events (adjust as needed)
      if (evt.type !== 'daily_login' && evt.type !== 'email.send') return;

      // Determine recipient(s)
      const to = evt.familyEmail || (evt.to ? (Array.isArray(evt.to) ? evt.to.join(',') : evt.to) : process.env.EMAIL_USER);
      const name = evt.userName || evt.userId || 'User';
      const subject = evt.subject || `Daily login: ${name}`;
      const text = evt.text || `${name} checked in today.`;
      const html = evt.html || `<p>${name} checked in today.</p>`;

      try {
        const res = await sendEmail({ to, subject, text, html });
        logger.info(`Email sent: ${res && res.messageId ? res.messageId : JSON.stringify(res)}`);
      } catch (err) {
        logger.error('Error sending email', err && err.message ? err.message : err);
        // In a production system, push to DLQ or implement retry logic here
      }
    } catch (e) {
      logger.error('Failed to process MQTT message', e && e.message ? e.message : e);
    }
  });
}

start().catch(e => {
  logger.error('Fatal email-service error', e && e.stack ? e.stack : e);
  process.exit(1);
});
