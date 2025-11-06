// Call family intent handler
module.exports = {
  async handle({ userId, message, producer, logger }) {
    // Extract family member name from message
    const familyMember = message.match(/(daughter|son|wife|husband|mom|dad|family|sarah|john)/i)?.[1] || 'family';
    
    logger.info(`📞 User ${userId} wants to call ${familyMember}`);

    // Publish call request via Kafka
    try {
      await producer.send({
        topic: 'notification.events',
        messages: [{
          value: JSON.stringify({
            type: 'call_request',
            userId,
            requestedContact: familyMember,
            message: `User wants to talk to ${familyMember}`,
            timestamp: new Date().toISOString(),
            source: 'ai-companion'
          })
        }]
      });
      logger.info(`📞 Call request published for ${userId}`);
    } catch (error) {
      logger.error('❌ Failed to publish call request:', error);
    }

    return {
      success: true,
      response: `I'll help you connect with your ${familyMember} right away. Getting them on the line now...`
    };
  }
};
