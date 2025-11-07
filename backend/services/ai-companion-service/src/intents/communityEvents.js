// Community Events & Activities - Connect seniors to local community
// Addresses: Social isolation, active participation, community integration
module.exports = {
  async handle({ userId, message, producer, logger }) {
    logger.info(`🏘️ Community events requested by ${userId}`);

    // Extract interest/activity type if mentioned
    const interests = {
      exercise: ['exercise', 'tai chi', 'yoga', 'walk', 'fitness'],
      arts: ['art', 'craft', 'painting', 'music', 'singing'],
      social: ['coffee', 'chat', 'meetup', 'gathering', 'friends'],
      cultural: ['cultural', 'festival', 'chinese', 'malay', 'indian', 'temple', 'church'],
      learning: ['learn', 'class', 'workshop', 'course', 'computer']
    };

    let interestType = 'general';
    const lowerMsg = message.toLowerCase();
    
    for (const [category, keywords] of Object.entries(interests)) {
      if (keywords.some(kw => lowerMsg.includes(kw))) {
        interestType = category;
        break;
      }
    }

    // Publish community events request
    try {
      await producer.send({
        topic: 'notification.events',
        messages: [{
          value: JSON.stringify({
            type: 'community_events_request',
            userId,
            interestType,
            originalMessage: message,
            needsLocationInfo: true, // Ask elderly for their area/location
            timestamp: new Date().toISOString(),
            source: 'ai-companion'
          })
        }]
      });
      logger.info(`🏘️ Community events request published (${interestType}) - needs location`);
    } catch (error) {
      logger.error('❌ Failed to publish community events request:', error);
    }

    // Return empty to let Gemini AI ask for the elderly's area/location
    return { 
      success: true,
      response: null // Let Gemini AI ask about their area naturally
    };
  }
};

