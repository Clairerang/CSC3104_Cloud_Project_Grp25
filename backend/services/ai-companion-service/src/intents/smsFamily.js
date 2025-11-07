// SMS Family - Send text messages to family members
// Addresses: Family connection, communication, reducing isolation
module.exports = {
  async handle({ userId, message, producer, logger }) {
    logger.info(` SMS family request from ${userId}`);

    // Extract family member mentioned
    const familyMembers = ['daughter', 'son', 'grandson', 'granddaughter', 'mom', 'dad', 
                          'mother', 'father', 'wife', 'husband', 'child', 'brother', 'sister'];
    
    let familyMember = 'family';
    const lowerMsg = message.toLowerCase();
    
    for (const member of familyMembers) {
      if (lowerMsg.includes(member)) {
        familyMember = member;
        break;
      }
    }

    // Extract message content if explicitly stated
    const contentMatch = message.match(/(?:tell|message|text|let.*know|send|say)\s+(?:them|her|him|that)?\s*(.+)/i);
    const messageContent = contentMatch ? contentMatch[1] : message;

    // Publish SMS request to Kafka
    try {
      await producer.send({
        topic: 'notification.events',
        messages: [{
          value: JSON.stringify({
            type: 'sms_family_request',
            userId,
            recipient: familyMember,
            messageContent,
            originalRequest: message,
            timestamp: new Date().toISOString(),
            source: 'ai-companion'
          })
        }]
      });
      logger.info(` SMS family request published to ${familyMember}`);
    } catch (error) {
      logger.error(' Failed to publish SMS request:', error);
    }

    return {
      success: true,
      response: null // Let Gemini AI handle the response naturally
    };
  }
};
