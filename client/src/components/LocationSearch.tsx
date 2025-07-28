import React, { useState, useEffect, useRef } from 'react';
import { Location } from '../types';
import { apiService } from '../services/api';

interface LocationSearchProps {
  onLocationSelect: (location: Location) => void;
  selectedLocation: Location | null;
}

export const LocationSearch: React.FC<LocationSearchProps> = ({
  onLocationSelect,
  selectedLocation,
}) => {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<Location[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const debounceRef = useRef<NodeJS.Timeout>();
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (selectedLocation) {
      setQuery(selectedLocation.displayName);
      setShowSuggestions(false);
    }
  }, [selectedLocation]);

  useEffect(() => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    if (query.length < 2) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    debounceRef.current = setTimeout(async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        const results = await apiService.searchLocations(query);
        setSuggestions(results);
        setShowSuggestions(true);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Fehler beim Suchen');
        setSuggestions([]);
      } finally {
        setIsLoading(false);
      }
    }, 300);

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [query]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value);
    if (selectedLocation) {
      onLocationSelect(null as any); // Clear selection when typing
    }
  };

  const handleLocationClick = (location: Location) => {
    setQuery(location.displayName);
    setShowSuggestions(false);
    onLocationSelect(location);
    inputRef.current?.blur();
  };

  const handleInputBlur = () => {
    // Delay hiding suggestions to allow clicks
    setTimeout(() => setShowSuggestions(false), 200);
  };

  return (
    <div className="relative w-full max-w-md">
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={handleInputChange}
          onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
          onBlur={handleInputBlur}
          placeholder="Ort suchen... (z.B. Reykjavik, Tromsø)"
          className="input-glass w-full pr-10"
        />
        
        <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
          {isLoading ? (
            <div className="animate-spin rounded-full h-4 w-4 border-2 border-aurora-500 border-t-transparent"></div>
          ) : (
            <svg
              className="h-4 w-4 text-white/60"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          )}
        </div>
      </div>

      {error && (
        <div className="mt-2 text-red-400 text-sm">{error}</div>
      )}

      {showSuggestions && suggestions.length > 0 && (
        <div className="absolute z-10 w-full mt-1 card-glass max-h-60 overflow-y-auto">
          {suggestions.map((location) => (
            <button
              key={location.id}
              onClick={() => handleLocationClick(location)}
              className="w-full px-4 py-3 text-left hover:bg-white/10 focus:bg-white/10 focus:outline-none transition-colors border-b border-white/10 last:border-b-0"
            >
              <div className="font-medium text-white">{location.name}</div>
              <div className="text-sm text-white/70">
                {location.adminName && `${location.adminName}, `}{location.country}
              </div>
              {location.population > 0 && (
                <div className="text-xs text-white/50">
                  Einwohner: {location.population.toLocaleString()}
                </div>
              )}
            </button>
          ))}
        </div>
      )}

      {showSuggestions && suggestions.length === 0 && query.length >= 2 && !isLoading && (
        <div className="absolute z-10 w-full mt-1 card-glass px-4 py-3 text-white/70 text-sm">
          Keine Orte gefunden
        </div>
      )}
    </div>
  );
};