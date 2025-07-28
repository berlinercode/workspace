const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const dotenv = require('dotenv');
const axios = require('axios');

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());

// Aurora prediction service
class AuroraPredictionService {
  constructor() {
    this.cache = new Map();
    this.cacheTimeout = 30 * 60 * 1000; // 30 minutes
  }

  // Get geomagnetic data from NOAA
  async getGeomagneticData() {
    const cacheKey = 'geomagnetic_data';
    const cached = this.cache.get(cacheKey);
    
    if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
      return cached.data;
    }

    try {
      // NOAA Space Weather Prediction Center - kostenlos
      const response = await axios.get('https://services.swpc.noaa.gov/json/planetary_k_index_1m.json');
      const data = response.data.slice(-144); // Last 24 hours (10-minute intervals)
      
      this.cache.set(cacheKey, {
        data,
        timestamp: Date.now()
      });
      
      return data;
    } catch (error) {
      console.error('Error fetching geomagnetic data:', error);
      return [];
    }
  }

  // Get solar wind data
  async getSolarWindData() {
    const cacheKey = 'solar_wind_data';
    const cached = this.cache.get(cacheKey);
    
    if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
      return cached.data;
    }

    try {
      const response = await axios.get('https://services.swpc.noaa.gov/json/rtsw/rtsw_mag_1m.json');
      const data = response.data.slice(-60); // Last hour
      
      this.cache.set(cacheKey, {
        data,
        timestamp: Date.now()
      });
      
      return data;
    } catch (error) {
      console.error('Error fetching solar wind data:', error);
      return [];
    }
  }

  // Get weather data for location
  async getWeatherData(lat, lon) {
    if (!process.env.OPENWEATHER_API_KEY) {
      throw new Error('OpenWeather API key not configured');
    }

    try {
      const response = await axios.get(
        `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${process.env.OPENWEATHER_API_KEY}&units=metric`
      );
      return response.data;
    } catch (error) {
      console.error('Error fetching weather data:', error);
      return null;
    }
  }

  // Calculate magnetic latitude (simplified approximation)
  calculateMagneticLatitude(lat, lon) {
    // Simplified magnetic dipole model
    // Real magnetic latitude calculation would be more complex
    const magneticPoleLatitude = 80.65; // Approximate magnetic north pole
    const magneticPoleLongitude = -72.68;
    
    // Simple approximation - in reality this needs spherical trigonometry
    const latDiff = lat - magneticPoleLatitude;
    const lonDiff = lon - magneticPoleLongitude;
    const distance = Math.sqrt(latDiff * latDiff + lonDiff * lonDiff);
    
    return Math.max(0, 90 - distance);
  }

  // Calculate aurora probability based on various factors
  calculateAuroraProbability(location, geomagneticData, solarWindData, weatherData, days) {
    const { lat, lon } = location;
    const magneticLat = this.calculateMagneticLatitude(lat, lon);
    
    // Base probability based on magnetic latitude
    let baseProbability = 0;
    if (magneticLat > 65) baseProbability = 0.8;
    else if (magneticLat > 60) baseProbability = 0.6;
    else if (magneticLat > 55) baseProbability = 0.4;
    else if (magneticLat > 50) baseProbability = 0.2;
    else if (magneticLat > 45) baseProbability = 0.1;
    else baseProbability = 0.05;

    // Adjust for current geomagnetic activity
    const currentKp = this.getCurrentKpIndex(geomagneticData);
    let activityMultiplier = 1;
    
    if (currentKp >= 7) activityMultiplier = 2.5;
    else if (currentKp >= 5) activityMultiplier = 2.0;
    else if (currentKp >= 4) activityMultiplier = 1.5;
    else if (currentKp >= 3) activityMultiplier = 1.2;

    // Adjust for solar wind conditions
    const solarWindMultiplier = this.getSolarWindMultiplier(solarWindData);
    
    // Adjust for weather conditions (cloud cover)
    let weatherMultiplier = 1;
    if (weatherData && weatherData.clouds) {
      const cloudCover = weatherData.clouds.all;
      weatherMultiplier = Math.max(0.1, (100 - cloudCover) / 100);
    }

    // Time-based adjustments
    let timeMultiplier = 1;
    if (days <= 5) timeMultiplier = 1.0; // Short term - more reliable
    else if (days <= 21) timeMultiplier = 0.8; // Medium term
    else timeMultiplier = 0.6; // Long term - less reliable

    // Seasonal adjustment (simplified)
    const month = new Date().getMonth();
    let seasonalMultiplier = 1;
    if (month >= 2 && month <= 4) seasonalMultiplier = 1.2; // Spring equinox
    else if (month >= 8 && month <= 10) seasonalMultiplier = 1.2; // Fall equinox
    else if (month >= 5 && month <= 7) seasonalMultiplier = 0.7; // Summer
    
    const finalProbability = Math.min(0.95, 
      baseProbability * 
      activityMultiplier * 
      solarWindMultiplier * 
      weatherMultiplier * 
      timeMultiplier * 
      seasonalMultiplier
    );

    return {
      probability: Math.round(finalProbability * 100),
      factors: {
        magneticLatitude: Math.round(magneticLat * 10) / 10,
        currentKp: currentKp,
        cloudCover: weatherData?.clouds?.all || 0,
        season: this.getSeasonName(month),
        solarWindCondition: this.getSolarWindCondition(solarWindData)
      }
    };
  }

  getCurrentKpIndex(geomagneticData) {
    if (!geomagneticData || geomagneticData.length === 0) return 2;
    
    const latest = geomagneticData[geomagneticData.length - 1];
    return parseFloat(latest.kp_index) || 2;
  }

  getSolarWindMultiplier(solarWindData) {
    if (!solarWindData || solarWindData.length === 0) return 1;
    
    const latest = solarWindData[solarWindData.length - 1];
    const bz = parseFloat(latest.bz_gsm);
    
    if (bz < -10) return 1.8; // Strong southward
    if (bz < -5) return 1.4;  // Moderate southward
    if (bz < 0) return 1.1;   // Weak southward
    return 0.9; // Northward
  }

  getSolarWindCondition(solarWindData) {
    if (!solarWindData || solarWindData.length === 0) return 'Unknown';
    
    const latest = solarWindData[solarWindData.length - 1];
    const bz = parseFloat(latest.bz_gsm);
    
    if (bz < -10) return 'Very Favorable';
    if (bz < -5) return 'Favorable';
    if (bz < 0) return 'Moderate';
    return 'Unfavorable';
  }

  getSeasonName(month) {
    if (month >= 2 && month <= 4) return 'Spring (Equinox)';
    if (month >= 5 && month <= 7) return 'Summer';
    if (month >= 8 && month <= 10) return 'Fall (Equinox)';
    return 'Winter';
  }
}

const auroraService = new AuroraPredictionService();

// Routes

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Search locations
app.get('/api/locations/search', async (req, res) => {
  const { q } = req.query;
  
  if (!q || q.length < 2) {
    return res.status(400).json({ error: 'Query too short' });
  }

  if (!process.env.GEONAMES_USERNAME) {
    return res.status(500).json({ error: 'GeoNames API not configured' });
  }

  try {
    const response = await axios.get(`http://api.geonames.org/searchJSON`, {
      params: {
        q: q,
        maxRows: 10,
        username: process.env.GEONAMES_USERNAME,
        featureClass: 'P', // Populated places
        orderby: 'population'
      }
    });

    const locations = response.data.geonames.map(place => ({
      id: place.geonameId,
      name: place.name,
      country: place.countryName,
      countryCode: place.countryCode,
      adminName: place.adminName1,
      lat: parseFloat(place.lat),
      lon: parseFloat(place.lng),
      population: place.population,
      displayName: `${place.name}, ${place.adminName1 ? place.adminName1 + ', ' : ''}${place.countryName}`
    }));

    res.json(locations);
  } catch (error) {
    console.error('Error searching locations:', error);
    res.status(500).json({ error: 'Failed to search locations' });
  }
});

// Get aurora prediction for location
app.post('/api/aurora/predict', async (req, res) => {
  const { location } = req.body;
  
  if (!location || !location.lat || !location.lon) {
    return res.status(400).json({ error: 'Location with lat/lon required' });
  }

  try {
    // Fetch all data in parallel
    const [geomagneticData, solarWindData, weatherData] = await Promise.all([
      auroraService.getGeomagneticData(),
      auroraService.getSolarWindData(),
      auroraService.getWeatherData(location.lat, location.lon)
    ]);

    // Calculate predictions for different time periods
    const predictions = {
      location: location,
      timestamp: new Date().toISOString(),
      predictions: {
        '3_days': auroraService.calculateAuroraProbability(location, geomagneticData, solarWindData, weatherData, 3),
        '5_days': auroraService.calculateAuroraProbability(location, geomagneticData, solarWindData, weatherData, 5),
        '21_days': auroraService.calculateAuroraProbability(location, geomagneticData, solarWindData, weatherData, 21),
        '31_days': auroraService.calculateAuroraProbability(location, geomagneticData, solarWindData, weatherData, 31)
      },
      currentConditions: {
        weather: weatherData ? {
          temperature: weatherData.main.temp,
          description: weatherData.weather[0].description,
          cloudCover: weatherData.clouds.all
        } : null,
        geomagneticActivity: auroraService.getCurrentKpIndex(geomagneticData),
        solarWindCondition: auroraService.getSolarWindCondition(solarWindData)
      }
    };

    res.json(predictions);
  } catch (error) {
    console.error('Error generating aurora prediction:', error);
    res.status(500).json({ error: 'Failed to generate prediction' });
  }
});

// Get current space weather conditions
app.get('/api/space-weather', async (req, res) => {
  try {
    const [geomagneticData, solarWindData] = await Promise.all([
      auroraService.getGeomagneticData(),
      auroraService.getSolarWindData()
    ]);

    const currentKp = auroraService.getCurrentKpIndex(geomagneticData);
    const solarWindCondition = auroraService.getSolarWindCondition(solarWindData);

    res.json({
      timestamp: new Date().toISOString(),
      kpIndex: currentKp,
      kpLevel: getKpLevel(currentKp),
      solarWindCondition,
      geomagneticActivity: getGeomagneticActivityLevel(currentKp)
    });
  } catch (error) {
    console.error('Error fetching space weather:', error);
    res.status(500).json({ error: 'Failed to fetch space weather data' });
  }
});

// Helper functions for space weather endpoint
function getKpLevel(kp) {
  if (kp >= 8) return 'Severe Storm';
  if (kp >= 6) return 'Strong Storm';
  if (kp >= 5) return 'Moderate Storm';
  if (kp >= 4) return 'Minor Storm';
  if (kp >= 3) return 'Unsettled';
  return 'Quiet';
}

function getGeomagneticActivityLevel(kp) {
  if (kp >= 7) return 'Very High';
  if (kp >= 5) return 'High';
  if (kp >= 4) return 'Moderate';
  if (kp >= 3) return 'Low';
  return 'Very Low';
}

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

app.listen(PORT, () => {
  console.log(`🌌 Aurora Predictor Server running on port ${PORT}`);
  console.log(`📡 Health check: http://localhost:${PORT}/api/health`);
});