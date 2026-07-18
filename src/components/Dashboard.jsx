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
    <div className="w-full min-h-[100dvh] relative overflow-y-auto">
      <div className="w-full grid grid-cols-2 grid-rows-2 landscape:grid-cols-4 landscape:grid-rows-1 select-none min-h-[100dvh] landscape:min-h-[340px]">
        {/* Session Info */}
        <SessionBlock />
        
        {/* Lap Times */}
        <TimesBlock />
        
        {/* Gaps */}
        <GapsBlock />
        
        {/* Stint Timer */}
        <StintBlock />
      </div>

      {/* Floating Action Buttons */}
      <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 flex items-center gap-3 z-10">
        {isLucasGuerrero && (
          <button
            onClick={onShowTiming}
            className="bg-neon-green hover:bg-green-500 active:scale-95 text-pure-black font-bold tracking-widest text-xs py-3 px-6 rounded-full border border-green-800 shadow-[0_0_15px_rgba(57,255,20,0.5)] transition-all uppercase flex items-center gap-2 whitespace-nowrap"
          >
            <span>TIMING</span>
          </button>
        )}
        <button
          onClick={() => useRaceStore.setState({ isSetupComplete: false })}
          className="bg-dark-gray hover:bg-gray-800 active:scale-95 text-white font-bold tracking-widest text-xs py-3 px-6 rounded-full border border-gray-700 shadow-[0_0_15px_rgba(255,255,255,0.1)] transition-all uppercase flex items-center gap-2 whitespace-nowrap"
          title="Modificar configuración o circuito"
        >
          <span>Ajustes</span>
        </button>
      </div>
    </div>
  );
};
