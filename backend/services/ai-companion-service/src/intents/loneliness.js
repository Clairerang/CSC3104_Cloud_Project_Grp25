// Loneliness detection intent handler
module.exports = {
  async handle({ userId, message, producer, logger }) {
    logger.info(`😔 Loneliness detected for user ${userId}`);

    // Alert family about loneliness via Kafka
    try {
      await producer.send({
        topic: 'notification.events',
        messages: [{
          value: JSON.stringify({
            type: 'loneliness_detected',
            userId,
            message: `User expressed feeling lonely: "${message}"`,
            recommendation: 'Consider scheduling a visit or call',
            timestamp: new Date().toISOString(),
            source: 'ai-companion'
          })
        }]
      });
      logger.info(`😔 Loneliness alert published for ${userId}`);
    } catch (error) {
      logger.error('❌ Failed to publish loneliness alert:', error);
    }

    return {
      success: true,
      response: "I'm here with you. 💜 You're not alone. Would you like me to call someone for you? Or we could chat and play a game together!"
    };
  }
};
