// Community Events & Activities - Connect seniors to local community with REAL data
// Addresses: Social isolation, active participation, community integration

const axios = require('axios');
const User = require('../models/User');

// Google Places API configuration
const GOOGLE_PLACES_API_KEY = process.env.GOOGLE_PLACES_API_KEY || process.env.GEMINI_API_KEY;

// Fetch real community centers and activities using Google Places API
async function fetchGooglePlacesEvents(location, interestType = 'general') {
  if (!GOOGLE_PLACES_API_KEY) {
    console.warn('⚠️ No Google API key found, using fallback events');
    return null;
  }

  try {
    // Map interest types to Google Places types
    const placeTypeMap = {
      exercise: ['gym', 'park', 'stadium'],
      arts: ['art_gallery', 'museum', 'library'],
      social: ['cafe', 'restaurant', 'park'],
      cultural: ['place_of_worship', 'museum', 'library'],
      learning: ['library', 'school', 'university'],
      general: ['community_center', 'library', 'park']
    };

    const placeTypes = placeTypeMap[interestType] || placeTypeMap.general;
    
    // First, geocode the location to get coordinates
    const geocodeUrl = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(location + ', Singapore')}&key=${GOOGLE_PLACES_API_KEY}`;
    const geocodeResponse = await axios.get(geocodeUrl);
    
    if (geocodeResponse.data.status !== 'OK' || !geocodeResponse.data.results || geocodeResponse.data.results.length === 0) {
      console.warn(`⚠️ Geocoding failed for ${location}. Status: ${geocodeResponse.data.status}, Error: ${geocodeResponse.data.error_message || 'No error message'}`);
      return null;
    }

    const { lat, lng } = geocodeResponse.data.results[0].geometry.location;
    console.log(`📍 Geocoded ${location} to: ${lat}, ${lng}`);

    // Search for nearby places using the primary place type
    const searchUrl = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${lat},${lng}&radius=2000&type=${placeTypes[0]}&keyword=community+senior+activities&key=${GOOGLE_PLACES_API_KEY}`;
    const placesResponse = await axios.get(searchUrl);

    if (!placesResponse.data.results || placesResponse.data.results.length === 0) {
      console.warn(`⚠️ No places found for ${location}`);
      return null;
    }

    // Format the places into events
    const events = placesResponse.data.results.slice(0, 5).map(place => {
      const activitySuggestions = {
        community_center: 'Active ageing programs, exercise classes, social gatherings',
        library: 'Reading groups, computer classes, storytelling sessions',
        park: 'Morning walks, tai chi, outdoor exercises',
        gym: 'Senior fitness classes, light exercises',
        cafe: 'Coffee meetups, social gatherings',
        place_of_worship: 'Community events, prayer groups, volunteer activities'
      };

      const placeType = place.types[0] || 'community_center';
      const suggestions = activitySuggestions[placeType] || 'Various senior-friendly activities';

      return {
        title: place.name,
        location: place.vicinity || place.formatted_address || 'Near you',
        distance: `${(place.geometry ? '1-2 km' : 'Nearby')}`,
        description: suggestions,
        rating: place.rating ? `⭐ ${place.rating}/5` : 'No ratings yet',
        type: interestType,
        isOpen: place.opening_hours?.open_now ? '✅ Open now' : '🕐 Check hours'
      };
    });

    return events;
  } catch (error) {
    console.error('❌ Google Places API error:', error.message);
    return null;
  }
}

// Fallback events data when Google API is unavailable
function getFallbackEvents(area = 'Singapore', interestType = 'general') {
  const areaName = area.charAt(0).toUpperCase() + area.slice(1).toLowerCase();
  
  return [
    {
      title: "Senior Citizens' Active Ageing Programme",
      location: `${areaName} Community Centre`,
      distance: "In your neighborhood",
      description: "Exercise classes, tai chi, arts & crafts, and social activities for seniors",
      rating: "Popular with seniors",
      type: interestType,
      contact: "Visit your nearest Community Centre or call 1800-CALL-PA (1800-2255 72)"
    },
    {
      title: "ActiveSG Senior Fitness Classes",
      location: `${areaName} ActiveSG Gym`,
      distance: "Check ActiveSG website",
      description: "Free gym sessions and fitness classes for seniors aged 65 and above",
      rating: "Government-supported",
      type: "exercise",
      contact: "Visit www.myactivesg.com or call 1800-344-1177"
    },
    {
      title: "National Library Board Activities",
      location: `${areaName} Public Library`,
      distance: "Near you",
      description: "Free programs including talks, workshops, computer classes, and reading groups",
      rating: "Free admission",
      type: "learning",
      contact: "Visit www.nlb.gov.sg or call 6332 3255"
    }
  ];
}

module.exports = {
  async handle({ userId, message, logger }) {
    logger.info(`🏘️ Community events requested by ${userId}`);

    // Fetch user profile to get their address/location
    let userLocation = null;
    try {
      const user = await User.findOne({ userId });
      if (user && user.profile && user.profile.address) {
        userLocation = user.profile.address;
        logger.info(`📍 User location from profile: ${userLocation}`);
      } else {
        logger.warn(`⚠️ No address found in profile for user ${userId}`);
      }
    } catch (error) {
      logger.error('❌ Failed to fetch user profile:', error);
    }

    // Extract interest/activity type if mentioned
    const interests = {
      exercise: ['exercise', 'tai chi', 'yoga', 'walk', 'fitness', 'gym', 'workout'],
      arts: ['art', 'craft', 'painting', 'music', 'singing', 'dance', 'creative'],
      social: ['coffee', 'chat', 'meetup', 'gathering', 'friends', 'social'],
      cultural: ['cultural', 'festival', 'chinese', 'malay', 'indian', 'temple', 'church', 'religious'],
      learning: ['learn', 'class', 'workshop', 'course', 'computer', 'study', 'education']
    };

    let interestType = 'general';
    const lowerMsg = message.toLowerCase();
    
    for (const [category, keywords] of Object.entries(interests)) {
      if (keywords.some(kw => lowerMsg.includes(kw))) {
        interestType = category;
        break;
      }
    }

    // Extract location override if mentioned in message (overrides profile)
    const singaporeAreas = ['sengkang', 'hougang', 'tampines', 'bedok', 'serangoon', 'ang mo kio', 'bishan', 'toa payoh', 'queenstown', 'punggol', 'pasir ris'];
    let detectedArea = userLocation; // Default to user's profile location
    
    for (const area of singaporeAreas) {
      if (lowerMsg.includes(area)) {
        detectedArea = area;
        logger.info(`📍 Location override from message: ${detectedArea}`);
        break;
      }
    }

    // If no location found, use default
    if (!detectedArea) {
      detectedArea = 'Singapore';
      logger.info(`📍 Using default location: ${detectedArea}`);
    }

    // Fetch real events data from Google Places API
    let eventsData = null;
    let formattedEvents = '';
    
    try {
      // Try Google Places API first
      logger.info(`🔍 Searching Google Places for ${interestType} activities in ${detectedArea}...`);
      eventsData = await fetchGooglePlacesEvents(detectedArea, interestType);
      
      // If Google API fails or returns no results, use fallback
      if (!eventsData || eventsData.length === 0) {
        logger.warn('⚠️ Google Places returned no results, using fallback events');
        eventsData = getFallbackEvents(detectedArea, interestType);
      } else {
        logger.info(`✅ Found ${eventsData.length} places via Google Places API`);
      }
      
      // Format events for the AI response with better spacing
      if (eventsData && eventsData.length > 0) {
        formattedEvents = `\n\n📅 **Community activities near ${detectedArea}:**\n\n`;
        eventsData.forEach((event, index) => {
          formattedEvents += `**${index + 1}. ${event.title}**\n\n`;
          formattedEvents += `   📍 Location: ${event.location}`;
          if (event.distance) formattedEvents += ` (${event.distance})`;
          formattedEvents += `\n\n`;
          formattedEvents += `   ℹ️  Activities: ${event.description}\n\n`;
          if (event.rating) formattedEvents += `   ${event.rating}\n\n`;
          if (event.isOpen) formattedEvents += `   ${event.isOpen}\n\n`;
          if (event.contact) formattedEvents += `   📞 Contact: ${event.contact}\n\n`;
          formattedEvents += `   ─────────────────────────────\n\n`;
        });
        
        // Add helpful footer with better spacing
        formattedEvents += `💡 **Tip**: Most community centers offer free or subsidized programs for seniors!\n\n`;
        formattedEvents += `📞 **Need help?** Call PA (People's Association): 1800-2255 72\n`;
      }
    } catch (error) {
      logger.error('❌ Failed to fetch community events:', error);
      // Use fallback on error
      eventsData = getFallbackEvents(detectedArea, interestType);
      formattedEvents = `\n\n📅 **Community activities in ${detectedArea}:**\n\n`;
      eventsData.forEach((event, index) => {
        formattedEvents += `**${index + 1}. ${event.title}**\n\n`;
        formattedEvents += `   📍 Location: ${event.location}\n\n`;
        formattedEvents += `   ℹ️  Activities: ${event.description}\n\n`;
        if (event.contact) formattedEvents += `   📞 Contact: ${event.contact}\n\n`;
        formattedEvents += `   ─────────────────────────────\n\n`;
      });
    }

    // Return formatted events data - this will be included in context for Gemini
    return { 
      success: true,
      response: formattedEvents || null, // Return real events data
      eventsData: eventsData, // Additional context
      location: detectedArea // Where we searched
    };
  }
};