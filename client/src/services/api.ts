import { Location, AuroraPrediction, SpaceWeather } from '../types';

const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:5000';

class ApiService {
  private async request<T>(endpoint: string, options?: RequestInit): Promise<T> {
    const response = await fetch(`${API_BASE}${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
      ...options,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Network error' }));
      throw new Error(error.error || `HTTP ${response.status}`);
    }

    return response.json();
  }

  async searchLocations(query: string): Promise<Location[]> {
    if (query.length < 2) return [];
    
    return this.request<Location[]>(`/api/locations/search?q=${encodeURIComponent(query)}`);
  }

  async getAuroraPrediction(location: Location): Promise<AuroraPrediction> {
    return this.request<AuroraPrediction>('/api/aurora/predict', {
      method: 'POST',
      body: JSON.stringify({ location }),
    });
  }

  async getSpaceWeather(): Promise<SpaceWeather> {
    return this.request<SpaceWeather>('/api/space-weather');
  }

  async healthCheck(): Promise<{ status: string; timestamp: string }> {
    return this.request<{ status: string; timestamp: string }>('/api/health');
  }
}

export const apiService = new ApiService();