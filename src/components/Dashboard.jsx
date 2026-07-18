import React, { useEffect } from 'react';
import { SessionBlock } from './blocks/SessionBlock';
import { TimesBlock } from './blocks/TimesBlock';
import { GapsBlock } from './blocks/GapsBlock';
import { StintBlock } from './blocks/StintBlock';
import { startApexTimingService, stopApexTimingService } from '../services/apexTimingService';
import { useRaceStore } from '../store/useRaceStore';

export const Dashboard = ({ onShowTiming }) => {
  const apexUrl = useRaceStore((state) => state.apexUrl);
  const apexPort = useRaceStore((state) => state.apexPort);

  useEffect(() => {
    if (apexUrl) {
      startApexTimingService(apexUrl, apexPort);
    }
    
    return () => {
      stopApexTimingService();
    };
  }, [apexUrl, apexPort]);

  // Show TIMING button only if using Kartódromo Lucas Guerrero (or local simulated test server)
  const isLucasGuerrero = apexUrl.includes('kartodromo-lucas-guerrero') || 
                          apexUrl.includes('localhost') || 
                          apexUrl.includes('127.0.0.1');

  return (
    <div className="w-full h-full relative">
      <div className="w-full h-full grid grid-cols-2 grid-rows-2 landscape:grid-cols-4 landscape:grid-rows-1 overflow-hidden select-none">
        {/* Session Info */}
        <SessionBlock />
        
        {/* Lap Times */}
        <TimesBlock />
        
        {/* Gaps */}
        <GapsBlock />
        
        {/* Stint Timer */}
        <StintBlock />
      </div>

      {/* Floating TIMING Button */}
      {isLucasGuerrero && (
        <button
          onClick={onShowTiming}
          className="absolute bottom-6 left-1/2 transform -translate-x-1/2 bg-neon-green hover:bg-green-500 active:scale-95 text-pure-black font-bold tracking-widest text-xs py-3 px-6 rounded-full border border-green-800 shadow-[0_0_15px_rgba(57,255,20,0.5)] transition-all uppercase flex items-center gap-2"
        >
          <span>TIMING</span>
        </button>
      )}
    </div>
  );
};
