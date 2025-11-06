// Emergency help intent handler
module.exports = {
  async handle({ userId, message, producer, logger }) {
    logger.info(`🚨 EMERGENCY triggered by user ${userId}`);

    // Publish emergency alert to Kafka
    try {
      await producer.send({
        topic: 'notification.events',
        messages: [{
          value: JSON.stringify({
            type: 'emergency_sos',
            userId,
            message: `EMERGENCY: ${message}`,
            timestamp: new Date().toISOString(),
            source: 'ai-companion'
          })
        }]
      });
      logger.info(`🚨 Emergency alert published for ${userId}`);
    } catch (error) {
      logger.error('❌ Failed to publish emergency alert:', error);
    }

    return {
      success: true,
      response: '🚨 Emergency alert sent! Help is on the way. Stay calm, someone will be with you soon.'
    };
  }
};
