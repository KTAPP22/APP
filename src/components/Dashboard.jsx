import React, { useEffect, useState } from 'react';
import { SessionBlock } from './blocks/SessionBlock';
import { TimesBlock } from './blocks/TimesBlock';
import { GapsBlock } from './blocks/GapsBlock';
import { StintBlock } from './blocks/StintBlock';
import { startApexTimingService, stopApexTimingService } from '../services/apexTimingService';
import { useRaceStore } from '../store/useRaceStore';
import { MoreVertical, Settings } from 'lucide-react';

export const Dashboard = ({ onShowTiming }) => {
  const apexUrl = useRaceStore((state) => state.apexUrl);
  const apexPort = useRaceStore((state) => state.apexPort);
  const [menuOpen, setMenuOpen] = useState(false);

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
      {/* 3-Dots Dropdown Button in Top-Right Corner */}
      <div className="absolute top-4 right-4 z-20">
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="p-2 sm:p-2.5 rounded-full bg-dark-gray/80 hover:bg-gray-800 text-white border border-gray-700 shadow-lg active:scale-95 transition-all"
          title="Opciones"
        >
          <MoreVertical size={20} className="w-5 h-5" />
        </button>

        {menuOpen && (
          <>
            {/* Click-away overlay to close dropdown */}
            <div 
              className="fixed inset-0 z-10 cursor-default" 
              onClick={() => setMenuOpen(false)} 
            />
            
            {/* Dropdown Menu */}
            <div className="absolute top-12 right-0 bg-pure-black/95 backdrop-blur-md border border-gray-800 rounded-xl p-1.5 shadow-2xl z-20 min-w-[150px] animate-in fade-in slide-in-from-top-2 duration-100">
              <button
                onClick={() => {
                  setMenuOpen(false);
                  useRaceStore.setState({ isSetupComplete: false });
                }}
                className="w-full flex items-center gap-2.5 px-3.5 py-2.5 text-xs uppercase tracking-wider text-white hover:bg-neon-red/15 hover:text-neon-red rounded-lg transition-colors font-sans text-left font-bold"
              >
                <Settings size={14} />
                <span>Ajustes</span>
              </button>
            </div>
          </>
        )}
      </div>

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

      {/* Floating TIMING Button at the bottom */}
      {isLucasGuerrero && (
        <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 z-10">
          <button
            onClick={onShowTiming}
            className="bg-neon-green hover:bg-green-500 active:scale-95 text-pure-black font-bold tracking-widest text-xs py-3 px-6 rounded-full border border-green-800 shadow-[0_0_15px_rgba(57,255,20,0.5)] transition-all uppercase flex items-center gap-2 whitespace-nowrap"
          >
            <span>TIMING</span>
          </button>
        </div>
      )}
    </div>
  );
};
