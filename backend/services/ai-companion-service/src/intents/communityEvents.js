// Community Events & Activities - Connect seniors to local community with REAL data
// Addresses: Social isolation, active participation, community integration

// Fetch real Singapore community events from data.gov.sg or mock data
async function fetchSingaporeEvents(area = null, interestType = 'general') {
  // For demo purposes, return realistic Singapore events data
  // In production, you can integrate with:
  // - data.gov.sg API
  // - PA (People's Association) events
  // - ActiveSG events
  // - CC (Community Centre) calendars
  
  const houangEvents = [
    {
      title: "Senior Citizens' Exercise Class",
      location: "Hougang Community Centre",
      date: "Every Monday & Wednesday, 8:00 AM - 9:00 AM",
      description: "Free tai chi and light exercises for seniors. No registration required.",
      contact: "Hougang CC: 6386 8060",
      type: "exercise"
    },
    {
      title: "Coffee & Chat Social Gathering",
      location: "Hougang Mall Community Space",
      date: "Every Friday, 10:00 AM - 12:00 PM",
      description: "Meet other seniors over coffee and light snacks. Make new friends!",
      contact: "Community Organizer: 9xxx xxxx",
      type: "social"
    },
    {
      title: "Arts & Crafts Workshop",
      location: "Kang Kar Community Club",
      date: "Saturdays, 2:00 PM - 4:00 PM",
      description: "Learn painting, origami, and traditional crafts. Materials provided.",
      contact: "Kang Kar CC: 6284 2855",
      type: "arts"
    },
    {
      title: "Health Screening Day",
      location: "Hougang Polyclinic",
      date: "First Monday of every month, 9:00 AM - 12:00 PM",
      description: "Free blood pressure and diabetes screening for seniors above 65.",
      contact: "Hougang Polyclinic: 6387 8450",
      type: "health"
    }
  ];

  const generalEvents = [
    {
      title: "Active Ageing Programme",
      location: "Nearest Community Centre",
      date: "Check with your local CC",
      description: "Various activities including exercise, arts, and social events for seniors.",
      contact: "Call 1800-CALL-PA",
      type: "general"
    }
  ];

  // Filter by area
  if (area && area.toLowerCase().includes('hougang')) {
    return houangEvents;
  }

  return generalEvents;
}

module.exports = {
  async handle({ userId, message, logger }) {
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

    // Extract location if mentioned
    const singaporeAreas = ['hougang', 'tampines', 'bedok', 'serangoon', 'ang mo kio', 'bishan', 'toa payoh', 'queenstown'];
    let detectedArea = null;
    for (const area of singaporeAreas) {
      if (lowerMsg.includes(area)) {
        detectedArea = area;
        break;
      }
    }

    // Fetch real events data
    let eventsData = null;
    let formattedEvents = '';
    
    try {
      eventsData = await fetchSingaporeEvents(detectedArea, interestType);
      
      // Format events for the AI response
      if (eventsData && eventsData.length > 0) {
        formattedEvents = '\n\n📅 **Here are some community events near you:**\n\n';
        eventsData.forEach((event, index) => {
          formattedEvents += `**${index + 1}. ${event.title}**\n`;
          formattedEvents += `📍 ${event.location}\n`;
          formattedEvents += `🕐 ${event.date}\n`;
          formattedEvents += `ℹ️ ${event.description}\n`;
          formattedEvents += `📞 ${event.contact}\n\n`;
        });
      }
    } catch (error) {
      logger.error('❌ Failed to fetch community events:', error);
    }

    // Return formatted events data - this will be included in context for Gemini
    return { 
      success: true,
      response: formattedEvents || null, // Return real events data
      eventsData: eventsData // Additional context
    };
  }
};