export interface Location {
  id: number;
  name: string;
  country: string;
  countryCode: string;
  adminName: string;
  lat: number;
  lon: number;
  population: number;
  displayName: string;
}

export interface PredictionFactors {
  magneticLatitude: number;
  currentKp: number;
  cloudCover: number;
  season: string;
  solarWindCondition: string;
}

export interface PredictionResult {
  probability: number;
  factors: PredictionFactors;
}

export interface WeatherCondition {
  temperature: number;
  description: string;
  cloudCover: number;
}

export interface CurrentConditions {
  weather: WeatherCondition | null;
  geomagneticActivity: number;
  solarWindCondition: string;
}

export interface AuroraPrediction {
  location: Location;
  timestamp: string;
  predictions: {
    '3_days': PredictionResult;
    '5_days': PredictionResult;
    '21_days': PredictionResult;
    '31_days': PredictionResult;
  };
  currentConditions: CurrentConditions;
}

export interface SpaceWeather {
  timestamp: string;
  kpIndex: number;
  kpLevel: string;
  solarWindCondition: string;
  geomagneticActivity: string;
}