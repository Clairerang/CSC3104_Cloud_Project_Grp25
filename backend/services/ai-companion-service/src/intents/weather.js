// Weather info intent handler
module.exports = {
  async handle({ userId, message, producer, logger }) {
    logger.info(`🌤️ Weather info requested by user ${userId}`);

    // Publish weather request event to Kafka
    // The notification service or weather service will handle the actual API call
    await producer.send({
      topic: 'notification.events',
      messages: [{
        value: JSON.stringify({
          type: 'weather_info_request',
          userId,
          location: 'Singapore',
          purpose: 'elderly_outdoor_safety',
          timestamp: new Date().toISOString(),
          source: 'ai-companion'
        })
      }]
    });

    logger.info(`📡 Weather request published for elderly outdoor safety advice`);

    // Return empty to let Gemini AI handle the response
    // Gemini will use Singapore weather context to advise if elderly should go out
    return {
      success: true,
      response: null // Let Gemini AI generate natural weather advice for Singapore
    };
  }
};

