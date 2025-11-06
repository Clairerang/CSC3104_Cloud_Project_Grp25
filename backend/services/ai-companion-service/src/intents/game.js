// Play game intent handler
module.exports = {
  async handle({ userId, message, producer, logger }) {
    logger.info(`🎮 Game requested by user ${userId}`);

    const gameType = message.toLowerCase().includes('trivia') ? 'trivia' : 'game';

    // Publish engagement event
    try {
      await producer.send({
        topic: 'notification.events',
        messages: [{
          value: JSON.stringify({
            type: 'game_started',
            userId,
            gameType,
            timestamp: new Date().toISOString(),
            source: 'ai-companion'
          })
        }]
      });
      logger.info(`🎮 Game started event published for ${userId}`);
    } catch (error) {
      logger.error('❌ Failed to publish game event:', error);
    }

    return {
      success: true,
      response: `🎮 Let's play ${gameType}! Here's your first question: What year was the first computer invented? (Hint: 1940s)`
    };
  }
};
