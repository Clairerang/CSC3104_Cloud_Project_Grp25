// Medication reminder intent handler
module.exports = {
  async handle({ userId, message, producer, logger }) {
    logger.info(`💊 Medication reminder requested by user ${userId}`);

    // This would fetch actual medication schedule from database
    const mockMedications = [
      { name: 'Blood pressure medication', time: '8:00 AM' },
      { name: 'Vitamin D', time: '8:00 AM' },
      { name: 'Evening medication', time: '6:00 PM' }
    ];

    return {
      success: true,
      response: `Here's your medication schedule:\n• ${mockMedications.map(m => `${m.name} at ${m.time}`).join('\n• ')}\n\nI'll remind you when it's time! 💊`
    };
  }
};
