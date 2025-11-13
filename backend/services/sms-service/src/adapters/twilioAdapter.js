const winston = require('winston');
const logger = winston.createLogger({ level: process.env.LOG_LEVEL || 'info', transports: [ new winston.transports.Console({ format: winston.format.simple() }) ] });

let client = null;
function ensureClient() {
  if (client) return client;
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  if (!accountSid || !authToken) {
    throw new Error('Twilio credentials not configured (TWILIO_ACCOUNT_SID / TWILIO_AUTH_TOKEN)');
  }
  client = require('twilio')(accountSid, authToken);
  return client;
}

/**
 * sendSms adapter for Twilio
 * @param {{to: string, body: string}} param0
 */
module.exports.sendSms = async function sendSms({ to, body }) {
  const from = process.env.TWILIO_FROM;
  if (!from) throw new Error('TWILIO_FROM not set');
  const tw = ensureClient();
  logger.info('[twilioAdapter] sending sms', `to=${to}`);
  const msg = await tw.messages.create({ to, from, body });
  logger.info('[twilioAdapter] sent', msg && msg.sid ? `sid=${msg.sid}` : 'no-sid');
  return { provider: 'twilio', messageId: msg && msg.sid ? msg.sid : null };
};
