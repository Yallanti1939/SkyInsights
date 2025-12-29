
import React from 'react';
import { Cloud, Wind, Droplets, Clock, ExternalLink, MapPin, CalendarDays, Activity, Timer, Info } from 'lucide-react';
import { WeatherData, HourlyForecast } from '../types';
import { ForecastItem } from './ForecastItem';
import { 
  Sun, 
  CloudRain, 
  CloudSnow, 
  CloudLightning, 
  CloudSun, 
  CloudDrizzle, 
  CloudFog, 
  CloudMoon
} from 'lucide-react';

interface WeatherCardProps {
  data: WeatherData;
}

const getAQIStyles = (value: number) => {
  if (value <= 50) return { color: 'text-emerald-400', bg: 'bg-emerald-500', shadow: 'shadow-emerald-500/20' };
  if (value <= 100) return { color: 'text-amber-400', bg: 'bg-amber-500', shadow: 'shadow-amber-500/20' };
  if (value <= 150) return { color: 'text-orange-400', bg: 'bg-orange-500', shadow: 'shadow-orange-500/20' };
  if (value <= 200) return { color: 'text-red-400', bg: 'bg-red-500', shadow: 'shadow-red-500/20' };
  if (value <= 300) return { color: 'text-purple-400', bg: 'bg-purple-500', shadow: 'shadow-purple-500/20' };
  return { color: 'text-rose-600', bg: 'bg-rose-600', shadow: 'shadow-rose-600/20' };
};

const WeatherIconSmall = ({ condition }: { condition: string }) => {
  const c = condition.toLowerCase();
  if (c.includes('bolt') || c.includes('storm')) return <CloudLightning className="w-5 h-5 text-purple-400" />;
  if (c.includes('snow') || c.includes('ice')) return <CloudSnow className="w-5 h-5 text-blue-100" />;
  if (c.includes('rain') || c.includes('shower')) return <CloudRain className="w-5 h-5 text-blue-500" />;
  if (c.includes('drizzle')) return <CloudDrizzle className="w-5 h-5 text-sky-400" />;
  if (c.includes('fog')) return <CloudFog className="w-5 h-5 text-slate-300" />;
  if (c.includes('partly')) return <CloudSun className="w-5 h-5 text-amber-300" />;
  if (c.includes('cloud')) return <Cloud className="w-5 h-5 text-slate-400" />;
  return <Sun className="w-5 h-5 text-amber-400" />;
};

interface HourlyItemProps {
  item: HourlyForecast;
  isCurrent: boolean;
}

const HourlyItem: React.FC<HourlyItemProps> = ({ item, isCurrent }) => {
  return (
    <div className={`flex flex-col items-center justify-center min-w-[80px] p-3 rounded-2xl border transition-all duration-500 ${
      isCurrent 
        ? 'bg-blue-500/20 border-blue-400/50 ring-2 ring-blue-400/20 shadow-[0_0_15px_rgba(96,165,250,0.3)] scale-110' 
        : 'bg-slate-800/30 border-slate-700/30'
    }`}>
      <span className={`text-[10px] font-bold mb-1 uppercase tracking-tighter ${isCurrent ? 'text-blue-300' : 'text-slate-500'}`}>
        {isCurrent ? 'Now' : item.time}
      </span>
      <div className="my-1">
        <WeatherIconSmall condition={item.condition} />
      </div>
      <span className={`text-sm font-bold ${isCurrent ? 'text-white' : 'text-slate-300'}`}>
        {item.temp}°
      </span>
    </div>
  );
};

export const WeatherCard: React.FC<WeatherCardProps> = ({ data }) => {
  const aqiVal = data.aqi?.value || 0;
  const aqiStyles = getAQIStyles(aqiVal);
  const aqiPercentage = Math.min((aqiVal / 300) * 100, 100);

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-12">
      {/* Main Insight Card */}
      <div className="bg-slate-900/60 backdrop-blur-xl border border-slate-700/50 rounded-3xl p-8 shadow-2xl relative overflow-hidden group">
        <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-20 transition-opacity">
          <Cloud className="w-32 h-32" />
        </div>
        
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-2 text-blue-400">
              <MapPin className="w-5 h-5" />
              <h2 className="text-xl font-semibold tracking-tight uppercase">{data.location}</h2>
            </div>
            <div className="flex items-center space-x-2 text-slate-400 text-sm">
              <Clock className="w-4 h-4" />
              <span>{data.timestamp}</span>
            </div>
          </div>

          <div className="prose prose-invert max-w-none">
            <p className="text-slate-200 text-lg leading-relaxed whitespace-pre-wrap">
              {data.summary}
            </p>
          </div>

          <div className="mt-8 grid grid-cols-1 lg:grid-cols-4 gap-4">
             {/* AQI Visual Gauge */}
             {data.aqi && (
               <div className="lg:col-span-2 bg-slate-800/50 rounded-2xl p-5 border border-slate-700/30 flex flex-col justify-between">
                 <div className="flex items-center justify-between mb-4">
                   <div className="flex items-center space-x-2">
                     <Activity className={`w-5 h-5 ${aqiStyles.color}`} />
                     <p className="text-xs text-slate-400 uppercase font-bold tracking-wider">Air Quality Index</p>
                   </div>
                   <span className={`text-sm font-bold ${aqiStyles.color}`}>{data.aqi.category}</span>
                 </div>
                 
                 <div className="relative pt-1">
                   <div className="flex mb-2 items-center justify-between">
                     <div>
                       <span className={`text-2xl font-black inline-block ${aqiStyles.color}`}>
                         {aqiVal}
                       </span>
                     </div>
                     <div className="text-right">
                       <span className="text-xs font-semibold inline-block text-slate-500 uppercase">
                         AQI Score
                       </span>
                     </div>
                   </div>
                   <div className="overflow-hidden h-2 mb-2 text-xs flex rounded-full bg-slate-700">
                     <div 
                        style={{ width: `${aqiPercentage}%` }}
                        className={`shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center ${aqiStyles.bg} transition-all duration-1000 ease-out relative`}
                     >
                       <div className={`absolute right-0 top-0 h-full w-2 bg-white/20 blur-[1px]`} />
                     </div>
                   </div>
                   <div className="flex justify-between text-[10px] text-slate-600 font-medium px-0.5">
                     <span>0</span>
                     <span>50</span>
                     <span>100</span>
                     <span>150</span>
                     <span>200</span>
                     <span>300+</span>
                   </div>
                 </div>
               </div>
             )}
             
             <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-slate-800/50 rounded-2xl p-4 flex items-center space-x-3 border border-slate-700/30">
                  <div className="p-2 bg-blue-500/20 rounded-lg">
                    <Cloud className="w-5 h-5 text-blue-400" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-400 uppercase font-bold tracking-wider">Atmosphere</p>
                    <p className="text-sm text-slate-100">Live Report</p>
                  </div>
                </div>
                <div className="bg-slate-800/50 rounded-2xl p-4 flex items-center space-x-3 border border-slate-700/30">
                  <div className="p-2 bg-emerald-500/20 rounded-lg">
                    <Wind className="w-5 h-5 text-emerald-400" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-400 uppercase font-bold tracking-wider">Wind</p>
                    <p className="text-sm text-slate-100">Current Gusts</p>
                  </div>
                </div>
                <div className="bg-slate-800/50 rounded-2xl p-4 flex items-center space-x-3 border border-slate-700/30">
                  <div className="p-2 bg-purple-500/20 rounded-lg">
                    <Droplets className="w-5 h-5 text-purple-400" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-400 uppercase font-bold tracking-wider">Humidity</p>
                    <p className="text-sm text-slate-100">Precise Data</p>
                  </div>
                </div>
                <div className="bg-slate-800/50 rounded-2xl p-4 flex items-center space-x-3 border border-slate-700/30">
                  <div className="p-2 bg-slate-500/20 rounded-lg">
                    <Info className="w-5 h-5 text-slate-400" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-400 uppercase font-bold tracking-wider">Status</p>
                    <p className="text-sm text-slate-100">Verified AI</p>
                  </div>
                </div>
             </div>
          </div>
        </div>
      </div>

      {/* Hourly Forecast Section */}
      {data.hourly && data.hourly.length > 0 && (
        <div className="bg-slate-900/40 backdrop-blur-md border border-slate-800 rounded-3xl p-6">
          <div className="flex items-center space-x-2 mb-4">
            <Timer className="w-5 h-5 text-blue-400" />
            <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-widest">Next 12 Hours</h3>
          </div>
          <div className="flex overflow-x-auto pb-4 pt-2 gap-4 scrollbar-hide">
            {data.hourly.map((item, idx) => (
              <HourlyItem 
                key={idx} 
                item={item} 
                isCurrent={idx === 0}
              />
            ))}
          </div>
        </div>
      )}

      {/* 7-Day Forecast Section */}
      {data.forecast.length > 0 && (
        <div className="bg-slate-900/40 backdrop-blur-md border border-slate-800 rounded-3xl p-6">
          <div className="flex items-center space-x-2 mb-6">
            <CalendarDays className="w-5 h-5 text-blue-400" />
            <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-widest">7-Day Outlook</h3>
          </div>
          <div className="flex overflow-x-auto pb-4 gap-4 scrollbar-hide">
            {data.forecast.map((day, idx) => (
              <ForecastItem key={idx} data={day} />
            ))}
          </div>
        </div>
      )}

      {/* Sources Section */}
      {data.sources.length > 0 && (
        <div className="bg-slate-900/40 backdrop-blur-md border border-slate-800 rounded-3xl p-6">
          <h3 className="text-sm font-semibold text-slate-400 mb-4 flex items-center">
            Verified Sources via Google Search
          </h3>
          <div className="flex flex-wrap gap-3">
            {data.sources.map((source, idx) => (
              <a
                key={idx}
                href={source.uri}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center space-x-2 px-3 py-1.5 bg-slate-800/50 hover:bg-slate-700 rounded-full text-xs text-slate-300 transition-colors border border-slate-700/50"
              >
                <span>{source.title || source.uri}</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
