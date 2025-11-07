// Volunteer Visitor Connection - Match seniors with volunteers
// Addresses: Social isolation, meaningful interaction, emotional support
module.exports = {
  async handle({ userId, message, producer, logger }) {
    logger.info(`🤝 Volunteer connection requested by ${userId}`);

    // Determine request type
    const needsHelp = message.toLowerCase().includes('help') || 
                     message.toLowerCase().includes('visit') ||
                     message.toLowerCase().includes('companion');

    // Publish volunteer connection request
    try {
      await producer.send({
        topic: 'notification.events',
        messages: [{
          value: JSON.stringify({
            type: 'volunteer_connect_request',
            userId,
            requestType: needsHelp ? 'visitor_needed' : 'general_inquiry',
            message: `Senior ${needsHelp ? 'requested volunteer visitor' : 'inquired about volunteer programs'}`,
            originalMessage: message,
            priority: needsHelp ? 'high' : 'normal',
            timestamp: new Date().toISOString(),
            source: 'ai-companion'
          })
        }]
      });
      logger.info(`🤝 Volunteer connection request published`);
    } catch (error) {
      logger.error('❌ Failed to publish volunteer request:', error);
    }

    return { success: true };
  }
};
