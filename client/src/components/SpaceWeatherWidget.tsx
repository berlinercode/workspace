import React, { useState, useEffect } from 'react';
import { SpaceWeather } from '../types';
import { apiService } from '../services/api';

export const SpaceWeatherWidget: React.FC = () => {
  const [spaceWeather, setSpaceWeather] = useState<SpaceWeather | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSpaceWeather = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const data = await apiService.getSpaceWeather();
        setSpaceWeather(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Fehler beim Laden');
      } finally {
        setIsLoading(false);
      }
    };

    fetchSpaceWeather();
    
    // Refresh every 10 minutes
    const interval = setInterval(fetchSpaceWeather, 10 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const getKpColor = (kp: number) => {
    if (kp >= 7) return 'text-red-400';
    if (kp >= 5) return 'text-orange-400';
    if (kp >= 4) return 'text-yellow-400';
    if (kp >= 3) return 'text-aurora-400';
    return 'text-green-400';
  };

  const getActivityIcon = (level: string) => {
    switch (level.toLowerCase()) {
      case 'very high':
      case 'high':
        return '🔴';
      case 'moderate':
        return '🟡';
      case 'low':
        return '🟢';
      default:
        return '⚪';
    }
  };

  if (isLoading) {
    return (
      <div className="card-glass p-4">
        <div className="animate-pulse">
          <div className="h-4 bg-white/20 rounded mb-2"></div>
          <div className="h-8 bg-white/20 rounded mb-2"></div>
          <div className="h-4 bg-white/20 rounded"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="card-glass p-4">
        <div className="text-red-400 text-sm">{error}</div>
      </div>
    );
  }

  if (!spaceWeather) return null;

  return (
    <div className="card-glass p-4">
      <h3 className="text-lg font-semibold mb-3 text-white flex items-center">
        <span className="mr-2">🌌</span>
        Weltraumwetter
      </h3>
      
      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <span className="text-white/70 text-sm">Kp-Index:</span>
          <span className={`font-bold text-lg ${getKpColor(spaceWeather.kpIndex)}`}>
            {spaceWeather.kpIndex.toFixed(1)}
          </span>
        </div>
        
        <div className="flex justify-between items-center">
          <span className="text-white/70 text-sm">Aktivitätslevel:</span>
          <span className="text-white font-medium text-sm flex items-center">
            <span className="mr-1">{getActivityIcon(spaceWeather.geomagneticActivity)}</span>
            {spaceWeather.kpLevel}
          </span>
        </div>
        
        <div className="flex justify-between items-center">
          <span className="text-white/70 text-sm">Sonnenwind:</span>
          <span className="text-white font-medium text-sm">
            {spaceWeather.solarWindCondition}
          </span>
        </div>
        
        <div className="text-xs text-white/50 mt-3 pt-3 border-t border-white/10">
          Letzte Aktualisierung: {new Date(spaceWeather.timestamp).toLocaleTimeString('de-DE')}
        </div>
      </div>
    </div>
  );
};