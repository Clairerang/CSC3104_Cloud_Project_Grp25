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
 * Send verification code via Twilio Verify
 * @param {{to: string, channel?: string}} param0
 * @returns {Promise<{status: string, to: string, channel: string, sid: string}>}
 */
async function sendVerificationCode({ to, channel = 'sms' }) {
  const verifySid = process.env.TWILIO_VERIFY_SERVICE_SID;
  if (!verifySid) {
    throw new Error('TWILIO_VERIFY_SERVICE_SID not configured');
  }

  const tw = ensureClient();
  logger.info('[twilioVerifyAdapter] sending verification code', `to=${to} channel=${channel}`);
  
  try {
    const verification = await tw.verify.v2
      .services(verifySid)
      .verifications
      .create({ to, channel });

    logger.info('[twilioVerifyAdapter] verification sent', `status=${verification.status} sid=${verification.sid} to=${verification.to}`);
    logger.info('[twilioVerifyAdapter] full response:', JSON.stringify(verification));
    
    return {
      status: verification.status,
      to: verification.to,
      channel: verification.channel,
      sid: verification.sid
    };
  } catch (error) {
    logger.error('[twilioVerifyAdapter] failed to send verification', error.message);
    logger.error('[twilioVerifyAdapter] error details:', JSON.stringify(error));
    throw error;
  }
}

/**
 * Check verification code entered by user
 * @param {{to: string, code: string}} param0
 * @returns {Promise<{status: string, valid: boolean, to: string}>}
 */
async function checkVerificationCode({ to, code }) {
  const verifySid = process.env.TWILIO_VERIFY_SERVICE_SID;
  if (!verifySid) {
    throw new Error('TWILIO_VERIFY_SERVICE_SID not configured');
  }

  const tw = ensureClient();
  logger.info('[twilioVerifyAdapter] checking verification code', `to=${to}`);
  
  try {
    const verificationCheck = await tw.verify.v2
      .services(verifySid)
      .verificationChecks
      .create({ to, code });

    const isValid = verificationCheck.status === 'approved';
    logger.info('[twilioVerifyAdapter] verification check result', `status=${verificationCheck.status} valid=${isValid}`);
    
    return {
      status: verificationCheck.status,
      valid: isValid,
      to: verificationCheck.to
    };
  } catch (error) {
    logger.error('[twilioVerifyAdapter] failed to check verification', error.message);
    throw error;
  }
}

module.exports = {
  sendVerificationCode,
  checkVerificationCode
};
