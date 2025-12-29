
import React from 'react';
import { 
  Sun, 
  Cloud, 
  CloudRain, 
  CloudSnow, 
  CloudLightning, 
  Droplets, 
  CloudSun, 
  CloudDrizzle, 
  CloudFog, 
  Wind,
  CloudMoon
} from 'lucide-react';
import { ForecastDay } from '../types';

interface ForecastItemProps {
  data: ForecastDay;
}

const WeatherIcon = ({ condition }: { condition: string }) => {
  const c = condition.toLowerCase();
  
  // High-intensity storms
  if (c.includes('bolt') || c.includes('storm') || c.includes('thunder') || c.includes('lightning')) {
    return <CloudLightning className="w-6 h-6 text-purple-400 animate-weather-pulse" />;
  }
  
  // Snow and Ice
  if (c.includes('snow') || c.includes('ice') || c.includes('freeze') || c.includes('flurries') || c.includes('hail')) {
    return <CloudSnow className="w-6 h-6 text-blue-100 animate-weather-sway" />;
  }
  
  // Drizzle / Light Rain
  if (c.includes('drizzle') || c.includes('light rain') || c.includes('sprinkle')) {
    return <CloudDrizzle className="w-6 h-6 text-sky-400 animate-weather-bounce" />;
  }
  
  // Regular Rain / Showers
  if (c.includes('rain') || c.includes('shower')) {
    return <CloudRain className="w-6 h-6 text-blue-500 animate-weather-bounce" />;
  }
  
  // Fog and Mist
  if (c.includes('fog') || c.includes('mist') || c.includes('haze') || c.includes('smoke')) {
    return <CloudFog className="w-6 h-6 text-slate-300 animate-fog-breathe" />;
  }
  
  // Wind
  if (c.includes('wind') || c.includes('breezy') || c.includes('gusty') || c.includes('gale')) {
    return <Wind className="w-6 h-6 text-teal-400 animate-wind-flow" />;
  }
  
  // Partly Cloudy
  if (c.includes('partly') || c.includes('scattered') || c.includes('broken')) {
    return <CloudSun className="w-6 h-6 text-amber-300 animate-weather-drift" />;
  }
  
  // Cloudy
  if (c.includes('cloud') || c.includes('overcast')) {
    return <Cloud className="w-6 h-6 text-slate-400 animate-weather-drift" />;
  }
  
  // Clear Night (heuristic check for "night" in condition if summary passed)
  if (c.includes('night') && (c.includes('clear') || c.includes('fair'))) {
    return <CloudMoon className="w-6 h-6 text-indigo-200 animate-weather-drift" />;
  }
  
  // Clear / Sunny Default
  return <Sun className="w-6 h-6 text-amber-400 animate-slow-spin" />;
};

/**
 * Heuristic to determine precipitation intensity based on percentage
 */
const getPrecipIntensity = (precip: number) => {
  if (precip === 0) return { label: 'Dry', color: 'text-slate-500', bg: 'bg-slate-500/10' };
  if (precip <= 25) return { label: 'Slight', color: 'text-sky-400', bg: 'bg-sky-400/10' };
  if (precip <= 50) return { label: 'Moderate', color: 'text-blue-400', bg: 'bg-blue-400/10' };
  if (precip <= 75) return { label: 'Heavy', color: 'text-indigo-400', bg: 'bg-indigo-400/10' };
  return { label: 'Extreme', color: 'text-purple-400', bg: 'bg-purple-400/10' };
};

/**
 * Heuristic to determine wind intensity based on speed (km/h)
 */
const getWindIntensity = (speed: number) => {
  if (speed <= 5) return { label: 'Calm', color: 'text-emerald-400', bg: 'bg-emerald-500/10' };
  if (speed <= 15) return { label: 'Breezy', color: 'text-teal-400', bg: 'bg-teal-500/10' };
  if (speed <= 30) return { label: 'Windy', color: 'text-amber-400', bg: 'bg-amber-500/10' };
  if (speed <= 50) return { label: 'Gale', color: 'text-orange-400', bg: 'bg-orange-500/10' };
  return { label: 'Stormy', color: 'text-rose-500', bg: 'bg-rose-500/10' };
};

export const ForecastItem: React.FC<ForecastItemProps> = ({ data }) => {
  const precipIntensity = getPrecipIntensity(data.precip);
  const windIntensity = getWindIntensity(data.windSpeed);

  return (
    <div className="flex flex-col items-center justify-between p-4 bg-slate-800/40 border border-slate-700/50 rounded-2xl min-w-[130px] transition-all duration-300 hover:bg-slate-800/60 hover:scale-105 group ring-1 ring-white/0 hover:ring-white/10 shadow-lg">
      <span className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 group-hover:text-slate-200 transition-colors">
        {data.day}
      </span>
      <div className="py-2 flex items-center justify-center min-h-[40px]">
        <WeatherIcon condition={data.condition} />
      </div>
      <div className="mt-3 flex flex-col items-center">
        <span className="text-lg font-bold text-slate-100 tracking-tight">{data.high}°</span>
        <span className="text-sm text-slate-500 font-medium">{data.low}°</span>
      </div>
      
      <div className="mt-4 w-full space-y-2">
        {/* Precipitation */}
        <div className="flex flex-col items-center space-y-1">
          <div className={`flex items-center text-[10px] ${precipIntensity.color} font-bold ${precipIntensity.bg} px-2 py-0.5 rounded-full w-full justify-center`}>
            <Droplets className="w-3 h-3 mr-1" />
            {data.precip}%
          </div>
          <span className={`text-[8px] uppercase font-black tracking-widest ${precipIntensity.color} opacity-70 group-hover:opacity-100 transition-opacity`}>
            {precipIntensity.label}
          </span>
        </div>

        {/* Wind Speed */}
        <div className="flex flex-col items-center space-y-1">
          <div className={`flex items-center text-[10px] ${windIntensity.color} font-bold ${windIntensity.bg} px-2 py-0.5 rounded-full w-full justify-center`}>
            <Wind className="w-3 h-3 mr-1" />
            {data.windSpeed} <span className="text-[8px] ml-0.5">km/h</span>
          </div>
          <span className={`text-[8px] uppercase font-black tracking-widest ${windIntensity.color} opacity-70 group-hover:opacity-100 transition-opacity`}>
            {windIntensity.label}
          </span>
        </div>
      </div>
    </div>
  );
};
