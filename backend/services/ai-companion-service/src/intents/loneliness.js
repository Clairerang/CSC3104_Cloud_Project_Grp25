// Loneliness and Social Isolation Detection - Core Problem Statement Intent
// Addresses: Mental health, emotional support, social connection needs
// KEYWORD-BASED ALERT: Detects specific loneliness keywords
module.exports = {
  async handle({ userId, message, sentimentScore, producer, logger }) {
    logger.info(` Social isolation detected for user ${userId} (sentiment: ${sentimentScore})`);

    // Check for specific loneliness keywords
    const lowerMsg = message.toLowerCase();
    const lonelinessKeywords = {
      critical: ['want to die', 'end it all', 'give up', 'no point', 'worthless'],
      high: ['very lonely', 'so lonely', 'completely alone', 'nobody cares', 'depressed', 'hopeless'],
      moderate: ['lonely', 'alone', 'sad', 'isolated', 'miss', 'empty', 'forgotten']
    };

    // Determine severity based on keywords AND sentiment score
    let keywordSeverity = null;
    let detectedKeywords = [];
    
    for (const [severity, keywords] of Object.entries(lonelinessKeywords)) {
      for (const keyword of keywords) {
        if (lowerMsg.includes(keyword)) {
          detectedKeywords.push(keyword);
          if (!keywordSeverity || 
              (severity === 'critical') || 
              (severity === 'high' && keywordSeverity !== 'critical')) {
            keywordSeverity = severity;
          }
        }
      }
    }

    // Final severity combines keyword detection and sentiment
    let finalSeverity = 'moderate';
    if (keywordSeverity === 'critical' || sentimentScore < -7) {
      finalSeverity = 'critical';
    } else if (keywordSeverity === 'high' || sentimentScore < -5) {
      finalSeverity = 'high';
    } else if (keywordSeverity === 'moderate' || sentimentScore < -3) {
      finalSeverity = 'moderate';
    }

    // Publish loneliness alert with severity level
    try {
      await producer.send({
        topic: 'notification.events',
        messages: [{
          value: JSON.stringify({
            type: 'social_isolation_alert',
            userId,
            message: `Senior expressed loneliness: "${message}"`,
            severity: finalSeverity,
            sentimentScore,
            detectedKeywords,
            keywordSeverity,
            recommendations: finalSeverity === 'critical' 
              ? [
                  ' URGENT: Immediate caregiver notification',
                  'Emergency contact notification',
                  'Mental health professional referral',
                  'Schedule immediate check-in call'
                ]
              : finalSeverity === 'high'
              ? [
                  'Schedule video call with family within 24 hours',
                  'Connect with volunteer visitor ASAP',
                  'Arrange community activity participation',
                  'Daily check-in for next week'
                ]
              : [
                  'Schedule video call with family',
                  'Suggest joining interest-based senior groups',
                  'Arrange community activity participation',
                  'Connect with volunteer visitor program'
                ],
            timestamp: new Date().toISOString(),
            source: 'ai-companion',
            requiresFollowUp: finalSeverity !== 'moderate',
            urgentAction: finalSeverity === 'critical'
          })
        }]
      });
      logger.warn(` LONELINESS ALERT published (severity: ${finalSeverity}, keywords: ${detectedKeywords.join(', ')})`);
    } catch (error) {
      logger.error(' Failed to publish social isolation alert:', error);
    }

    return { 
      success: true,
      response: null // Let Gemini AI provide empathetic response
    };
  }
};
