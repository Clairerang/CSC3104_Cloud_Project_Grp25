// Games - Redirect to interactive game webpage
// Addresses: Active participation, cognitive engagement, social interaction
const { publishEvent } = require('../index');

module.exports = {
  async handle({ userId, logger }) {
    logger.info(`🎮 Game requested by ${userId} - preparing game session`);

    // Publish game session event with redirect URL
    try {
      await publishEvent('notification/events', {
        type: 'game_session_requested',
        userId,
        redirectUrl: '/games/interactive',
        sessionId: `game_${userId}_${Date.now()}`,
        timestamp: new Date().toISOString(),
        source: 'ai-companion'
      });
      logger.info(`🎮 Game session event published for ${userId}`);
    } catch (error) {
      logger.error('❌ Failed to publish game session event:', error);
    }

    // Gemini will provide instructions about games
    // Actual gameplay will be on separate webpage
    return { success: true };
  }
};
