
import React, { useEffect, useState } from 'react';
import { ThermometerSun, Loader2 } from 'lucide-react';

export const SplashScreen: React.FC<{ onComplete: () => void }> = ({ onComplete }) => {
  const [progress, setProgress] = useState(0);
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(timer);
          setTimeout(() => setFadeOut(true), 500);
          setTimeout(onComplete, 1200);
          return 100;
        }
        return prev + 2;
      });
    }, 40);

    return () => clearInterval(timer);
  }, [onComplete]);

  return (
    <div className={`fixed inset-0 z-[100] flex flex-col items-center justify-center bg-[#020617] transition-all duration-700 ease-in-out ${fadeOut ? 'opacity-0 scale-110 pointer-events-none' : 'opacity-100'}`}>
      {/* Background Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-blue-600/20 blur-[120px] rounded-full" />
      
      <div className="relative flex flex-col items-center">
        {/* Logo Mark */}
        <div className="relative mb-8 group">
          <div className="absolute inset-0 bg-blue-500/30 blur-2xl rounded-full animate-pulse" />
          <div className="relative bg-slate-900 p-8 rounded-[2.5rem] border border-white/10 shadow-2xl animate-in zoom-in duration-1000">
            <ThermometerSun className="w-16 h-16 text-blue-400 group-hover:rotate-12 transition-transform duration-500" />
          </div>
        </div>

        {/* Brand Name */}
        <h1 className="text-4xl font-black tracking-tighter text-white mb-2 animate-in slide-in-from-bottom-4 duration-700 delay-200">
          SKY<span className="text-blue-500">INSIGHT</span>
        </h1>
        <p className="text-slate-500 text-xs font-bold uppercase tracking-[0.4em] mb-12 animate-in slide-in-from-bottom-4 duration-700 delay-300">
          Atmospheric Intelligence
        </p>

        {/* Loader */}
        <div className="w-48 h-1 bg-slate-800 rounded-full overflow-hidden relative">
          <div 
            className="absolute top-0 left-0 h-full bg-blue-500 transition-all duration-100 ease-linear shadow-[0_0_10px_#3b82f6]"
            style={{ width: `${progress}%` }}
          />
        </div>
        <div className="mt-4 flex items-center space-x-2 text-slate-500 text-[10px] font-bold uppercase tracking-widest">
          <Loader2 className="w-3 h-3 animate-spin" />
          <span>Syncing Satellites...</span>
        </div>
      </div>
    </div>
  );
};
