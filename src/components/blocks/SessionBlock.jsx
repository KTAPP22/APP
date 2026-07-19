import React from 'react';
import { useRaceStore } from '../../store/useRaceStore';
import { Timer } from 'lucide-react';

export const SessionBlock = ({ onShowTiming }) => {
  const sessionTimeLeft = useRaceStore((state) => state.sessionTimeLeft);
  const apexUrl = useRaceStore((state) => state.apexUrl);
  
  const isLucasGuerrero = apexUrl.includes('kartodromo-lucas-guerrero') || 
                          apexUrl.includes('localhost') || 
                          apexUrl.includes('127.0.0.1');
  
  return (
    <div className="flex flex-col items-center justify-center p-2 border-b landscape:border-b-0 border-r border-white/20 md:border-0 bg-pure-black h-full overflow-hidden">
      {isLucasGuerrero && onShowTiming && (
        <button
          onClick={onShowTiming}
          className="mb-1 sm:mb-2 bg-neon-purple hover:bg-purple-600 active:scale-95 text-white font-bold tracking-widest text-[9px] sm:text-xs py-1 px-4 rounded-full border border-purple-800 shadow-[0_0_10px_rgba(176,38,255,0.4)] transition-all uppercase whitespace-nowrap"
        >
          TIMING
        </button>
      )}
      
      <div className="flex items-center gap-1 sm:gap-2 mb-1 sm:mb-2 text-gray-400 uppercase font-sans tracking-widest text-xs landscape:text-[10px] sm:text-base">
        <Timer size={16} className="sm:w-5 sm:h-5" />
        <span>Tiempo Restante</span>
      </div>
      <div className="text-4xl landscape:text-3xl sm:text-7xl font-bold font-mono text-white tracking-tight">
        {sessionTimeLeft}
      </div>
    </div>
  );
};
