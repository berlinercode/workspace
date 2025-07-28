import React, { useState } from 'react';
import { Location, AuroraPrediction } from './types';
import { LocationSearch } from './components/LocationSearch';
import { PredictionCard } from './components/PredictionCard';
import { SpaceWeatherWidget } from './components/SpaceWeatherWidget';
import { apiService } from './services/api';

function App() {
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null);
  const [prediction, setPrediction] = useState<AuroraPrediction | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLocationSelect = async (location: Location) => {
    if (!location) {
      setSelectedLocation(null);
      setPrediction(null);
      return;
    }

    setSelectedLocation(location);
    setIsLoading(true);
    setError(null);

    try {
      const predictionData = await apiService.getAuroraPrediction(location);
      setPrediction(predictionData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Fehler beim Laden der Vorhersage');
      setPrediction(null);
    } finally {
      setIsLoading(false);
    }
  };

  const predictionPeriods = [
    { key: '3_days', title: 'Kurzfristig', days: 'Nächste 3 Tage', highlighted: true },
    { key: '5_days', title: 'Kurz-Mittel', days: 'Nächste 5 Tage', highlighted: false },
    { key: '21_days', title: 'Mittelfristig', days: 'Nächste 3 Wochen', highlighted: false },
    { key: '31_days', title: 'Langfristig', days: 'Nächster Monat', highlighted: false },
  ];

  return (
    <div className="min-h-screen p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <header className="text-center mb-8">
          <div className="inline-flex items-center justify-center mb-4">
            <div className="animate-aurora text-6xl mr-4">🌌</div>
            <div>
              <h1 className="text-4xl md:text-6xl font-bold text-white mb-2">
                Aurora Predictor
              </h1>
              <p className="text-lg md:text-xl text-white/80">
                Nordlicht-Vorhersage für jeden Ort der Welt
              </p>
            </div>
          </div>
          
          <div className="max-w-2xl mx-auto text-white/70 text-sm md:text-base">
            Entdecken Sie die Wahrscheinlichkeit von Aurora Borealis an Ihrem gewünschten Ort.
            Basierend auf aktuellen geomagnetischen Daten, Wetterbedingungen und Sonnenaktivität.
          </div>
        </header>

        {/* Search Section */}
        <div className="flex flex-col lg:flex-row gap-6 mb-8">
          <div className="flex-1">
            <div className="card-glass p-6">
              <h2 className="text-xl font-semibold text-white mb-4">
                📍 Ort auswählen
              </h2>
              <LocationSearch
                onLocationSelect={handleLocationSelect}
                selectedLocation={selectedLocation}
              />
              
              {selectedLocation && (
                <div className="mt-4 p-3 bg-aurora-500/20 rounded-lg border border-aurora-500/30">
                  <div className="text-white font-medium">
                    {selectedLocation.name}
                  </div>
                  <div className="text-white/70 text-sm">
                    {selectedLocation.adminName && `${selectedLocation.adminName}, `}
                    {selectedLocation.country}
                  </div>
                  <div className="text-white/60 text-xs mt-1">
                    Koordinaten: {selectedLocation.lat.toFixed(2)}°, {selectedLocation.lon.toFixed(2)}°
                  </div>
                </div>
              )}
            </div>
          </div>
          
          <div className="lg:w-80">
            <SpaceWeatherWidget />
          </div>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="text-center py-12">
            <div className="inline-flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-2 border-aurora-500 border-t-transparent mr-3"></div>
              <span className="text-white text-lg">Berechne Aurora-Wahrscheinlichkeit...</span>
            </div>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="card-glass p-6 mb-8">
            <div className="text-red-400 text-center">
              <div className="text-4xl mb-2">⚠️</div>
              <div className="text-lg font-medium mb-2">Fehler aufgetreten</div>
              <div className="text-sm">{error}</div>
            </div>
          </div>
        )}

        {/* Prediction Results */}
        {prediction && !isLoading && (
          <div className="space-y-6">
            {/* Current Conditions */}
            <div className="card-glass p-6">
              <h2 className="text-xl font-semibold text-white mb-4 flex items-center">
                <span className="mr-2">🌡️</span>
                Aktuelle Bedingungen
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {prediction.currentConditions.weather && (
                  <div className="text-center p-4 bg-white/5 rounded-lg">
                    <div className="text-2xl mb-2">🌤️</div>
                    <div className="text-white font-medium">
                      {Math.round(prediction.currentConditions.weather.temperature)}°C
                    </div>
                    <div className="text-white/70 text-sm capitalize">
                      {prediction.currentConditions.weather.description}
                    </div>
                    <div className="text-white/60 text-xs mt-1">
                      Wolken: {prediction.currentConditions.weather.cloudCover}%
                    </div>
                  </div>
                )}
                
                <div className="text-center p-4 bg-white/5 rounded-lg">
                  <div className="text-2xl mb-2">🧲</div>
                  <div className="text-white font-medium">
                    Kp {prediction.currentConditions.geomagneticActivity}
                  </div>
                  <div className="text-white/70 text-sm">
                    Geomagnetisch
                  </div>
                </div>
                
                <div className="text-center p-4 bg-white/5 rounded-lg">
                  <div className="text-2xl mb-2">💨</div>
                  <div className="text-white font-medium text-sm">
                    {prediction.currentConditions.solarWindCondition}
                  </div>
                  <div className="text-white/70 text-sm">
                    Sonnenwind
                  </div>
                </div>
              </div>
            </div>

            {/* Predictions Grid */}
            <div>
              <h2 className="text-2xl font-semibold text-white mb-6 text-center">
                🔮 Aurora-Vorhersagen
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {predictionPeriods.map(({ key, title, days, highlighted }) => (
                  <PredictionCard
                    key={key}
                    title={title}
                    days={days}
                    prediction={prediction.predictions[key as keyof typeof prediction.predictions]}
                    isHighlighted={highlighted}
                  />
                ))}
              </div>
            </div>

            {/* Disclaimer */}
            <div className="card-glass p-4 mt-8">
              <div className="text-white/60 text-sm text-center">
                <div className="font-medium mb-2">ℹ️ Hinweise zur Vorhersage</div>
                <div className="space-y-1">
                  <div>• Vorhersagen basieren auf aktuellen wissenschaftlichen Modellen</div>
                  <div>• Kurzfristige Vorhersagen (3-5 Tage) sind genauer als langfristige</div>
                  <div>• Wetterbedingungen können die Sichtbarkeit stark beeinflussen</div>
                  <div>• Beste Sichtbarkeit bei dunklem Himmel, fern von Lichtverschmutzung</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Welcome Message */}
        {!selectedLocation && !isLoading && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4 animate-pulse-slow">✨</div>
            <h2 className="text-2xl font-semibold text-white mb-4">
              Willkommen beim Aurora Predictor
            </h2>
            <p className="text-white/70 max-w-2xl mx-auto">
              Wählen Sie einen Ort aus, um die Wahrscheinlichkeit von Nordlichtern für die nächsten 
              3, 5, 21 und 31 Tage zu erfahren. Die Vorhersagen basieren auf aktuellen 
              geomagnetischen Daten, Wetterbedingungen und Sonnenaktivität.
            </p>
          </div>
        )}

        {/* Footer */}
        <footer className="text-center mt-12 pt-8 border-t border-white/10">
          <div className="text-white/50 text-sm">
            <div className="mb-2">
              Daten von NOAA Space Weather, OpenWeatherMap & GeoNames
            </div>
            <div>
              Made with ❤️ for Aurora enthusiasts
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}

export default App;
