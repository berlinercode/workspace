import React from 'react';
import { PredictionResult } from '../types';

interface PredictionCardProps {
  title: string;
  days: string;
  prediction: PredictionResult;
  isHighlighted?: boolean;
}

export const PredictionCard: React.FC<PredictionCardProps> = ({
  title,
  days,
  prediction,
  isHighlighted = false,
}) => {
  const getProbabilityColor = (probability: number) => {
    if (probability >= 70) return 'text-aurora-400';
    if (probability >= 40) return 'text-yellow-400';
    if (probability >= 20) return 'text-orange-400';
    return 'text-red-400';
  };

  const getProbabilityBg = (probability: number) => {
    if (probability >= 70) return 'from-aurora-500/20 to-aurora-600/20';
    if (probability >= 40) return 'from-yellow-500/20 to-yellow-600/20';
    if (probability >= 20) return 'from-orange-500/20 to-orange-600/20';
    return 'from-red-500/20 to-red-600/20';
  };

  const getGlowClass = (probability: number) => {
    if (probability >= 70) return 'aurora-glow';
    return '';
  };

  return (
    <div
      className={`card-glass p-6 transition-all duration-300 hover:scale-105 ${
        isHighlighted ? 'ring-2 ring-aurora-500' : ''
      } ${getGlowClass(prediction.probability)}`}
    >
      <div className="text-center">
        <h3 className="text-lg font-semibold mb-2 text-white">{title}</h3>
        <div className="text-sm text-white/70 mb-4">{days}</div>
        
        <div
          className={`relative mb-6 p-4 rounded-lg bg-gradient-to-br ${getProbabilityBg(
            prediction.probability
          )}`}
        >
          <div
            className={`text-4xl font-bold ${getProbabilityColor(
              prediction.probability
            )}`}
          >
            {prediction.probability}%
          </div>
          <div className="text-sm text-white/80 mt-1">
            Wahrscheinlichkeit
          </div>
          
          {prediction.probability >= 70 && (
            <div className="absolute -top-1 -right-1">
              <div className="animate-pulse-slow text-aurora-400">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              </div>
            </div>
          )}
        </div>

        <div className="space-y-2 text-sm">
          <div className="flex justify-between items-center">
            <span className="text-white/70">Magnetische Breite:</span>
            <span className="text-white font-medium">
              {prediction.factors.magneticLatitude}°
            </span>
          </div>
          
          <div className="flex justify-between items-center">
            <span className="text-white/70">Kp-Index:</span>
            <span className="text-white font-medium">
              {prediction.factors.currentKp}
            </span>
          </div>
          
          <div className="flex justify-between items-center">
            <span className="text-white/70">Wolkenbedeckung:</span>
            <span className="text-white font-medium">
              {prediction.factors.cloudCover}%
            </span>
          </div>
          
          <div className="flex justify-between items-center">
            <span className="text-white/70">Sonnenwind:</span>
            <span className="text-white font-medium text-xs">
              {prediction.factors.solarWindCondition}
            </span>
          </div>
          
          <div className="flex justify-between items-center">
            <span className="text-white/70">Saison:</span>
            <span className="text-white font-medium text-xs">
              {prediction.factors.season}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};