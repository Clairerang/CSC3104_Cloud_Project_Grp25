// SMS Family - Send text messages to family members
// Addresses: Family connection, communication, reducing isolation
const User = require('../models/User');
const Relationship = require('../models/Relationship');

// Export publishEvent function reference (will be set by index.js)
let publishEvent = null;

module.exports = {
  setPublishEvent(fn) {
    publishEvent = fn;
  },
  
  async handle({ userId, message, logger }) {
    logger.info(`📱 SMS family request from ${userId}`);

    try {
      // Extract family member relation mentioned in message
      const familyMembers = {
        'son': 'son',
        'daughter': 'daughter',
        'grandson': 'grandson',
        'granddaughter': 'granddaughter',
        'mom': 'mother',
        'mother': 'mother',
        'dad': 'father',
        'father': 'father',
        'wife': 'wife',
        'husband': 'husband',
        'child': 'child',
        'children': 'child',
        'brother': 'brother',
        'sister': 'sister'
      };
      
      let requestedRelation = 'son'; // Default to son for testing
      const lowerMsg = message.toLowerCase();
      
      // Try to find which family member is mentioned
      for (const [keyword, relation] of Object.entries(familyMembers)) {
        if (lowerMsg.includes(keyword)) {
          requestedRelation = relation;
          break;
        }
      }

      // Look up the relationship in database
      const relationship = await Relationship.findByRelation(userId, requestedRelation);
      
      if (!relationship) {
        logger.warn(`⚠️ No ${requestedRelation} found for user ${userId}, using test number`);
      }

      // Get the family member's details
      let familyPhone = '+6598765787'; // Default test number
      let familyName = requestedRelation.charAt(0).toUpperCase() + requestedRelation.slice(1);
      
      if (relationship) {
        const familyUser = await User.findOne({ userId: relationship.linkAccId });
        if (familyUser && familyUser.profile) {
          familyPhone = familyUser.profile.phoneNumber || '+6598765787';
          familyName = familyUser.profile.name || familyName;
          logger.info(`✅ Found ${requestedRelation}: ${familyName} (${familyPhone})`);
        }
      }

      // Extract message content if explicitly stated
      const contentMatch = message.match(/(?:tell|message|text|let.*know|send|say)\s+(?:them|her|him|that)?\s*["']?([^"']+)["']?/i);
      const customMessage = contentMatch ? contentMatch[1].trim() : null;

      // Generate the SMS message
      const smsBody = customMessage || 
        `Hello! This is an automated check-in from your loved one. They wanted to reach out and say hello. Everything is okay! 💙`;

      // Publish SMS event to MQTT topic that sms-service is listening to
      if (publishEvent) {
        await publishEvent('sms/send', {
          type: 'sms',
          to: familyPhone,
          body: smsBody,
          userId: userId,
          recipient: familyName,
          relation: requestedRelation,
          source: 'ai-companion-sms-family',
          originalMessage: message,
          timestamp: new Date().toISOString()
        });
        
        logger.info(`✅ SMS published to sms/send topic for ${familyName} (${requestedRelation}) at ${familyPhone}`);
        
        return {
          success: true,
          response: `I've sent a message to your ${requestedRelation}, ${familyName}, at ${familyPhone.substring(0, 6)}****. They'll be happy to hear from you! 💙`
        };
      } else {
        logger.error('❌ publishEvent not available');
        return {
          success: false,
          response: "I'm having trouble sending the message right now. Please try again in a moment."
        };
      }
    } catch (error) {
      logger.error('❌ Failed to handle SMS family request:', error);
      return {
        success: false,
        response: "I encountered an issue while trying to contact your family. Please try again."
      };
    }
  }
};
