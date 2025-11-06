const winston = require('winston');
const logger = winston.createLogger({ level: process.env.LOG_LEVEL || 'info', transports: [ new winston.transports.Console({ format: winston.format.simple() }) ] });

module.exports.sendSms = async function sendSms({ to, body, meta }) {
  // Simple mock adapter: logs and returns a fake message id
  logger.info(`[mockAdapter] dry-run send to ${to}: ${body}`);
  return { provider: 'mock', dryRun: true, messageId: `mock-${Date.now()}` };
};
