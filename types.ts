
export interface GroundingSource {
  title?: string;
  uri?: string;
}

export interface ForecastDay {
  day: string;
  high: number;
  low: number;
  precip: number;
  windSpeed: number;
  condition: string;
}

export interface HourlyForecast {
  time: string;
  temp: number;
  condition: string;
}

export interface WeatherData {
  location: string;
  summary: string;
  aqi?: {
    value: number;
    category: string;
  };
  hourly: HourlyForecast[];
  forecast: ForecastDay[];
  sources: GroundingSource[];
  timestamp: string;
}

export interface Coordinates {
  latitude: number;
  longitude: number;
}
