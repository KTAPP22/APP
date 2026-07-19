import React, { useEffect, useState } from 'react';
import { SessionBlock } from './blocks/SessionBlock';
import { TimesBlock } from './blocks/TimesBlock';
import { GapsBlock } from './blocks/GapsBlock';
import { StintBlock } from './blocks/StintBlock';
import { startApexTimingService, stopApexTimingService } from '../services/apexTimingService';
import { useRaceStore } from '../store/useRaceStore';
import { MoreVertical, Settings } from 'lucide-react';
import { LeaderboardTable } from './LeaderboardTable';
import { TrackMap } from './TrackMap';

export const Dashboard = ({ onShowTiming }) => {
  const apexUrl = useRaceStore((state) => state.apexUrl);
  const apexPort = useRaceStore((state) => state.apexPort);
  const targetDriverName = useRaceStore((state) => state.targetDriverName) || '';
  const driversCount = useRaceStore((state) => state.drivers?.length || 0);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    if (apexUrl) {
      startApexTimingService(apexUrl, apexPort);
    }
    
    return () => {
      stopApexTimingService();
    };
  }, [apexUrl, apexPort]);

  return (
    <div className="w-full min-h-[100dvh] relative bg-pure-black text-white">
      
      {/* ============================================================== */}
      {/* MOBILE LAYOUT (< 768px) — Kept exactly identical to original   */}
      {/* ============================================================== */}
      <div className="md:hidden w-full min-h-[100dvh] relative overflow-y-auto">
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
          <SessionBlock onShowTiming={onShowTiming} />
          
          {/* Lap Times */}
          <TimesBlock />
          
          {/* Gaps */}
          <GapsBlock />
          
          {/* Stint Timer */}
          <StintBlock />
        </div>
      </div>

      {/* ============================================================== */}
      {/* TABLET & DESKTOP LAYOUT (>= 768px) — Unified Cockpit View      */}
      {/* ============================================================== */}
      <div className="hidden md:flex flex-col w-full h-[100dvh] overflow-hidden bg-pure-black">
        {/* Cockpit Header */}
        <div className="h-16 border-b border-dark-gray bg-gradient-to-b from-[#111] to-[#222] flex items-center justify-between px-6 flex-shrink-0 select-none">
          <div className="flex items-center gap-6">
            <span className="text-neon-purple font-mono font-black text-xl tracking-tighter">KTAPP</span>
            <div className="h-6 w-px bg-dark-gray" />
            <div className="flex items-center gap-2.5">
              <span className="text-gray-400 text-[10px] uppercase font-sans tracking-widest">Siguiendo a</span>
              <span className="text-white font-sans font-black text-sm bg-neon-red/15 border border-neon-red/30 px-3 py-1 rounded-lg tracking-wide uppercase">{targetDriverName}</span>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            {/* Live lights */}
            <div className="flex items-center gap-1.5 bg-black/40 border border-gray-900 px-3 py-1.5 rounded-full">
              {[1, 2, 3, 4].map((l) => (
                <div 
                  key={l} 
                  className="w-3 h-3 rounded-full bg-neon-green shadow-[0_0_8px_rgba(57,255,20,0.8)] border border-green-800"
                />
              ))}
              <span className="text-[9px] font-mono text-neon-green uppercase tracking-wider font-bold ml-1">En Vivo</span>
            </div>

            <button
              onClick={() => useRaceStore.setState({ isSetupComplete: false })}
              className="flex items-center gap-2 px-3.5 py-2 rounded-lg bg-dark-gray hover:bg-gray-800 text-white border border-gray-700 shadow-md transition-all active:scale-95 font-sans font-bold text-xs uppercase"
            >
              <Settings size={14} />
              <span>Ajustes</span>
            </button>
          </div>
        </div>

        {/* Cockpit Content Area */}
        <div className="flex-1 flex flex-col md:flex-row gap-6 p-6 overflow-hidden max-w-[1600px] mx-auto w-full h-[calc(100vh-4rem)]">
          {/* Column 1: Telemetry (2x2 Grid) */}
          <div className="w-full md:w-1/2 lg:w-[42%] h-full">
            <div className="grid grid-cols-2 grid-rows-2 gap-4 h-full">
              <div className="bg-[#050505] border border-gray-800 hover:border-neon-purple/50 hover:shadow-[0_0_15px_rgba(176,38,255,0.08)] rounded-2xl overflow-hidden transition-all duration-300 shadow-lg">
                <SessionBlock />
              </div>
              <div className="bg-[#050505] border border-gray-800 hover:border-neon-yellow/50 hover:shadow-[0_0_15px_rgba(255,223,0,0.08)] rounded-2xl overflow-hidden transition-all duration-300 shadow-lg">
                <TimesBlock />
              </div>
              <div className="bg-[#050505] border border-gray-800 hover:border-neon-red/50 hover:shadow-[0_0_15px_rgba(255,7,58,0.08)] rounded-2xl overflow-hidden transition-all duration-300 shadow-lg">
                <GapsBlock />
              </div>
              <div className="bg-[#050505] border border-gray-800 hover:border-neon-green/50 hover:shadow-[0_0_15px_rgba(57,255,20,0.08)] rounded-2xl overflow-hidden transition-all duration-300 shadow-lg">
                <StintBlock />
              </div>
            </div>
          </div>

          {/* Columns 2 & 3 Combined (Leaderboard and Track) */}
          <div className="w-full md:w-1/2 lg:w-[58%] h-full flex flex-col lg:flex-row gap-6">
            {/* Column 2: Leaderboard (takes 60% on tablet, 57% on desktop) */}
            <div className="w-full lg:w-[57%] h-[60%] lg:h-full bg-[#050505] border border-gray-800 rounded-2xl flex flex-col overflow-hidden shadow-lg hover:border-gray-700 transition-colors duration-300">
              <div className="bg-dark-gray/60 px-4 py-2.5 border-b border-gray-800 flex justify-between items-center font-sans select-none flex-shrink-0">
                <span className="text-white text-xs uppercase tracking-wider font-bold">Clasificación en Vivo</span>
                <span className="text-neon-purple text-xs font-mono font-bold">{driversCount} Pilotos</span>
              </div>
              <div className="flex-1 overflow-y-auto">
                <LeaderboardTable />
              </div>
            </div>

            {/* Column 3: Track Map (takes 40% on tablet, 43% on desktop) */}
            <div className="w-full lg:w-[43%] h-[40%] lg:h-full bg-[#050505] border border-gray-800 rounded-2xl flex flex-col overflow-hidden shadow-lg hover:border-gray-700 transition-colors duration-300">
              <TrackMap />
            </div>
          </div>
        </div>
      </div>

    </div>
  );
};

