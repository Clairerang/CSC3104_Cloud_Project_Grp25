// SMS Family - Send messages to family members about anything
// Addresses: Digital divide, family connections, easy communication
const { publishEvent } = require('../index');

module.exports = {
  async handle({ userId, message, logger }) {
    // Extract family member name
    const familyMemberMatch = message.match(/\b(daughter|son|grandson|granddaughter|mom|mother|dad|father|brother|sister|wife|husband|child|children|family|sarah|john|mary|david)\b/i);
    const familyMember = familyMemberMatch ? familyMemberMatch[0] : 'family';

    // Extract message content - what they want to tell family
    let messageContent = message;
    const contentMatch = message.match(/(?:tell|message|let them know|inform|say to|text)\s+(?:them|him|her|my)?\s*(?:that|about)?\s*[:\-]?\s*(.+)/i);
    if (contentMatch) {
      messageContent = contentMatch[1].trim();
    }

    logger.info(`� SMS family request from ${userId} to ${familyMember}`);

    // Publish SMS request to notification service
    try {
      await publishEvent('notification/events', {
        type: 'sms_family_request',
        userId,
        recipient: familyMember,
        messageContent,
        originalRequest: message,
        priority: 'normal',
        timestamp: new Date().toISOString(),
        source: 'ai-companion'
      });
      logger.info(`� SMS family request published to ${familyMember}`);
    } catch (error) {
      logger.error('❌ Failed to publish SMS family request:', error);
    }

    return { success: true };
  }
};
