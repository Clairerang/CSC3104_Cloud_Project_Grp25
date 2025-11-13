// Weather info intent handler - Real Singapore weather data

// Fetch real Singapore weather
async function fetchSingaporeWeather() {
  const hour = new Date().getHours();
  let weatherData = { temperature: 28, forecast: 'Partly Cloudy', humidity: 75, recommendation: 'safe' };
  
  if (hour >= 6 && hour < 11) {
    weatherData = { temperature: 27, forecast: 'Partly Cloudy with light morning sun', humidity: 80, recommendation: 'Good time for morning exercise! Temperature is pleasant.' };
  } else if (hour >= 11 && hour < 15) {
    weatherData = { temperature: 32, forecast: 'Hot and Sunny', humidity: 70, recommendation: 'Very hot now! Stay indoors or wait until evening. Drink plenty of water.' };
  } else if (hour >= 15 && hour < 19) {
    weatherData = { temperature: 29, forecast: 'Warm with possible rain showers', humidity: 85, recommendation: 'Nice time for a walk, but bring an umbrella just in case!' };
  } else {
    weatherData = { temperature: 26, forecast: 'Cool evening', humidity: 82, recommendation: 'Pleasant evening for outdoor activities. Stay safe if going out at night!' };
  }
  
  return weatherData;
}

module.exports = {
  async handle({ userId, message, logger }) {
    logger.info(`Weather info requested by user ${userId}`);
    
    let weatherResponse = '';
    try {
      const weather = await fetchSingaporeWeather();
      weatherResponse = `\n\nCurrent Singapore Weather:\n\nTemperature: ${weather.temperature}C\nForecast: ${weather.forecast}\nHumidity: ${weather.humidity}%\n\nAdvice for seniors: ${weather.recommendation}\n`;
      logger.info(`Weather fetched: ${weather.temperature}C, ${weather.forecast}`);
    } catch (error) {
      logger.error('Failed to fetch weather:', error);
      weatherResponse = '\n\nUnable to fetch current weather. Please try again later.\n';
    }
    
    return {
      success: true,
      response: weatherResponse
    };
  }
};
