// Weather info intent handler
module.exports = {
  async handle({ userId, message, producer, logger }) {
    logger.info(`🌤️ Weather info requested by user ${userId}`);

    // In production, call a weather API
    const mockWeather = {
      temperature: 75,
      condition: 'sunny',
      recommendation: 'Perfect weather for a walk in the garden!'
    };

    return {
      success: true,
      response: `☀️ It's ${mockWeather.temperature}°F and ${mockWeather.condition} today! ${mockWeather.recommendation}`
    };
  }
};
