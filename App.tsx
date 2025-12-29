
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Search, MapPin, Loader2, ThermometerSun, AlertCircle, Cloud, Zap, Navigation } from 'lucide-react';
import { WeatherCard } from './components/WeatherCard';
import { AIChatAssistant } from './components/AIChatAssistant';
import { SplashScreen } from './components/SplashScreen';
import { fetchWeatherInfo } from './services/geminiService';
import { WeatherData } from './types';

type WeatherTheme = 'sunny' | 'rainy' | 'cloudy' | 'snowy' | 'stormy' | 'default';

const INDIAN_CITIES = [
  'Mumbai', 'New Delhi', 'Bangalore', 'Chennai', 'Kolkata', 'Hyderabad', 'Pune', 'Ahmedabad'
];

const App: React.FC = () => {
  const [showSplash, setShowSplash] = useState(true);
  const [query, setQuery] = useState('');
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [locationPermissionStatus, setLocationPermissionStatus] = useState<PermissionState | 'unknown'>('unknown');

  const handleSearch = useCallback(async (searchQuery: string, isGeolocation: boolean = false) => {
    if (!searchQuery.trim()) return;
    setLoading(true);
    setError(null);
    try {
      let data = await fetchWeatherInfo(searchQuery);
      if (isGeolocation) {
        data = {
          ...data,
          location: `Your Current Location - ${data.location}`
        };
      }
      setWeatherData(data);
    } catch (err: any) {
      setError(err.message || 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  }, []);

  const getCurrentLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setError("Geolocation is not supported by your browser");
      return;
    }

    setLoading(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        setLocationPermissionStatus('granted');
        await handleSearch(`${latitude}, ${longitude}`, true);
      },
      (err) => {
        setLoading(false);
        if (err.code === err.PERMISSION_DENIED) {
          setLocationPermissionStatus('denied');
          setError("Location access was denied. Please search manually or enable permissions in your browser.");
        } else {
          setError("Unable to retrieve your location accurately.");
        }
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  }, [handleSearch]);

  // Try to check permission status on mount
  useEffect(() => {
    if ('permissions' in navigator) {
      navigator.permissions.query({ name: 'geolocation' }).then((status) => {
        setLocationPermissionStatus(status.state);
        // If splash is done, we can auto-trigger
        if (status.state === 'granted' && !showSplash) {
          getCurrentLocation();
        }
        status.onchange = () => setLocationPermissionStatus(status.state);
      });
    }
  }, [getCurrentLocation, showSplash]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSearch(query);
  };

  const currentTheme: WeatherTheme = useMemo(() => {
    if (!weatherData) return 'default';
    
    const condition = (weatherData.forecast[0]?.condition || weatherData.summary).toLowerCase();
    
    if (condition.includes('sunny') || condition.includes('clear')) return 'sunny';
    if (condition.includes('rain') || condition.includes('drizzle') || condition.includes('shower')) return 'rainy';
    if (condition.includes('cloud') || condition.includes('overcast') || condition.includes('fog') || condition.includes('mist')) return 'cloudy';
    if (condition.includes('snow') || condition.includes('ice') || condition.includes('freeze')) return 'snowy';
    if (condition.includes('storm') || condition.includes('thunder') || condition.includes('lightning')) return 'stormy';
    
    return 'default';
  }, [weatherData]);

  const themeStyles = {
    default: {
      bg: 'bg-slate-950',
      gradient: 'from-slate-950 to-slate-900',
      glow1: 'bg-blue-600/10',
      glow2: 'bg-indigo-600/10',
      accent: 'text-blue-400',
      btn: 'bg-blue-600 hover:bg-blue-500'
    },
    sunny: {
      bg: 'bg-sky-950',
      gradient: 'from-blue-950 via-sky-900 to-slate-950',
      glow1: 'bg-amber-500/20',
      glow2: 'bg-blue-400/20',
      accent: 'text-amber-400',
      btn: 'bg-amber-600 hover:bg-amber-500'
    },
    rainy: {
      bg: 'bg-slate-950',
      gradient: 'from-slate-950 via-indigo-950 to-slate-900',
      glow1: 'bg-blue-600/15',
      glow2: 'bg-slate-800/20',
      accent: 'text-indigo-400',
      btn: 'bg-indigo-600 hover:bg-indigo-500'
    },
    cloudy: {
      bg: 'bg-zinc-950',
      gradient: 'from-zinc-950 via-slate-900 to-zinc-900',
      glow1: 'bg-slate-500/15',
      glow2: 'bg-zinc-700/15',
      accent: 'text-slate-400',
      btn: 'bg-slate-600 hover:bg-slate-500'
    },
    snowy: {
      bg: 'bg-slate-950',
      gradient: 'from-slate-950 via-blue-900/20 to-indigo-950',
      glow1: 'bg-white/10',
      glow2: 'bg-blue-300/10',
      accent: 'text-blue-200',
      btn: 'bg-blue-400 hover:bg-blue-300 text-slate-900'
    },
    stormy: {
      bg: 'bg-black',
      gradient: 'from-black via-purple-950/20 to-slate-950',
      glow1: 'bg-purple-600/15',
      glow2: 'bg-yellow-500/10',
      accent: 'text-purple-400',
      btn: 'bg-purple-600 hover:bg-purple-500'
    }
  };

  const activeStyle = themeStyles[currentTheme];

  if (showSplash) {
    return <SplashScreen onComplete={() => setShowSplash(false)} />;
  }

  return (
    <div className={`min-h-screen ${activeStyle.bg} bg-gradient-to-br ${activeStyle.gradient} text-slate-100 flex flex-col relative overflow-hidden transition-all duration-1000 animate-in fade-in duration-1000`}>
      {/* Dynamic Background Decor */}
      <div className={`absolute top-[-10%] left-[-10%] w-[60%] h-[60%] ${activeStyle.glow1} blur-[140px] rounded-full pointer-events-none transition-all duration-1000`} />
      <div className={`absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] ${activeStyle.glow2} blur-[140px] rounded-full pointer-events-none transition-all duration-1000`} />

      {/* Header Bar */}
      <header className="relative z-20 w-full p-6 flex items-center justify-between">
        <div className="flex items-center space-x-3 group cursor-pointer" onClick={() => setWeatherData(null)}>
          <div className="bg-white/5 backdrop-blur-md p-2 rounded-xl ring-1 ring-white/10 shadow-lg group-hover:bg-white/10 transition-all">
            <ThermometerSun className={`w-6 h-6 ${activeStyle.accent} transition-colors duration-1000`} />
          </div>
          <h1 className="text-xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-b from-white to-slate-400">
            SkyInsight
          </h1>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="relative z-10 w-full max-w-4xl mx-auto flex-1 flex flex-col items-center px-4 py-8">
        {/* Search Section */}
        <div className="w-full max-w-2xl mt-4 mb-8">
          <form 
            onSubmit={handleSubmit}
            className="w-full flex items-center space-x-2"
          >
            <div className="relative flex-1 group">
              <Search className={`absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 group-focus-within:${activeStyle.accent} transition-colors`} />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search city, region, or zip..."
                className="w-full bg-slate-900/40 border border-slate-800 rounded-2xl py-4 pl-12 pr-4 focus:outline-none focus:ring-2 focus:ring-white/20 focus:border-white/20 transition-all text-slate-100 placeholder:text-slate-600 shadow-lg backdrop-blur-md"
              />
            </div>
            <button
              type="button"
              onClick={getCurrentLocation}
              className={`p-4 bg-slate-900/40 border border-slate-800 rounded-2xl text-slate-400 hover:${activeStyle.accent} hover:bg-slate-800 transition-all shadow-lg group backdrop-blur-md relative overflow-hidden`}
              title="Use Current Location"
            >
              {locationPermissionStatus === 'prompt' && (
                <span className="absolute inset-0 bg-blue-500/10 animate-pulse" />
              )}
              <MapPin className="w-6 h-6 group-hover:scale-110 transition-transform relative z-10" />
            </button>
            <button
              type="submit"
              disabled={loading || !query.trim()}
              className={`px-8 py-4 ${loading ? 'bg-slate-800' : 'bg-white text-slate-950 hover:bg-slate-200'} disabled:text-slate-600 font-bold rounded-2xl transition-all shadow-lg shadow-black/20`}
            >
              {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : 'Search'}
            </button>
          </form>
        </div>

        {/* Feedback / Content Area */}
        <div className="w-full">
          {error && (
            <div className="max-w-2xl mx-auto bg-red-900/20 border border-red-500/30 p-6 rounded-3xl flex items-start space-x-4 mb-8 backdrop-blur-md animate-in fade-in slide-in-from-top-4">
              <AlertCircle className="w-6 h-6 text-red-500 shrink-0 mt-0.5" />
              <div className="flex-1">
                <h4 className="text-red-400 font-bold mb-1">Navigation Issue</h4>
                <p className="text-red-300/80 text-sm mb-3">{error}</p>
                {locationPermissionStatus === 'denied' && (
                  <button 
                    onClick={() => setQuery('')}
                    className="text-xs text-white/60 underline hover:text-white"
                  >
                    Try searching manually below instead
                  </button>
                )}
              </div>
            </div>
          )}

          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 space-y-4">
              <div className="relative">
                <div className={`absolute inset-0 ${activeStyle.accent} blur-xl opacity-20 animate-pulse`} />
                <Loader2 className={`w-12 h-12 ${activeStyle.accent} animate-spin relative z-10`} />
              </div>
              <p className="text-slate-400 animate-pulse font-medium tracking-wide">Syncing with atmospheric sensors...</p>
            </div>
          ) : (
            weatherData ? <WeatherCard data={weatherData} /> : (
              <div className="space-y-8 animate-in fade-in zoom-in duration-700">
                {/* Location Access Hero */}
                <div className="max-w-2xl mx-auto bg-gradient-to-br from-indigo-600/20 to-blue-600/5 backdrop-blur-xl border border-white/10 p-10 rounded-[3rem] shadow-2xl relative overflow-hidden group">
                  <div className="absolute top-0 right-0 p-10 opacity-5 group-hover:opacity-10 transition-opacity">
                    <Navigation className="w-40 h-40 -rotate-12" />
                  </div>
                  
                  <div className="relative z-10 flex flex-col items-center text-center">
                    <div className="mb-6 p-4 bg-white/5 rounded-3xl ring-1 ring-white/10 shadow-inner group-hover:scale-110 transition-transform duration-500">
                      <Zap className="w-10 h-10 text-blue-400" />
                    </div>
                    <h2 className="text-3xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-white via-white to-blue-300">
                      Hyper-Local Insights
                    </h2>
                    <p className="text-slate-400 text-lg mb-8 max-w-md leading-relaxed">
                      Enable location access to get real-time weather, AQI alerts, and lifestyle advice specifically for your street.
                    </p>
                    <button
                      onClick={getCurrentLocation}
                      className="group flex items-center space-x-3 px-8 py-4 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-2xl shadow-[0_0_30px_rgba(37,99,235,0.4)] transition-all hover:scale-105 active:scale-95"
                    >
                      <MapPin className="w-5 h-5 group-hover:animate-bounce" />
                      <span>Locate Me Now</span>
                    </button>
                  </div>
                </div>

                {/* City Shortcuts */}
                <div className="bg-slate-900/30 backdrop-blur-lg border border-slate-800/50 p-8 rounded-[2.5rem] w-full max-w-2xl mx-auto shadow-2xl">
                  <div className="flex items-center justify-center mb-6 space-x-3">
                    <h3 className="text-xs font-bold text-slate-500 uppercase tracking-[0.3em]">Popular Destinations</h3>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {INDIAN_CITIES.map((city) => (
                      <button
                        key={city}
                        onClick={() => {
                          setQuery(city);
                          handleSearch(city);
                        }}
                        className="px-4 py-3 bg-slate-800/40 hover:bg-slate-700/60 border border-slate-700/50 rounded-2xl text-slate-300 text-sm font-medium transition-all hover:scale-105 active:scale-95 shadow-sm"
                      >
                        {city}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )
          )}
        </div>
      </main>

      {/* AI Assistant */}
      {weatherData && <AIChatAssistant weatherData={weatherData} />}

      {/* Footer */}
      <footer className="relative z-10 w-full py-8 px-6 flex flex-col md:flex-row items-center justify-between border-t border-slate-900/50 mt-auto bg-black/20 backdrop-blur-sm">
        <div className="text-slate-600 text-[10px] uppercase tracking-[0.2em] mb-4 md:mb-0">
          &copy; {new Date().getFullYear()} SkyInsight AI &bull; Powered by Gemini
        </div>
        
        <div className="flex items-center space-x-6">
          <div className="text-slate-700 text-[10px] uppercase tracking-[0.2em]">
            Atmospheric Intelligence v2.0
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;
