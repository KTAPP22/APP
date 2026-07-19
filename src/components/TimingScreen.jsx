import React from 'react';
import { useRaceStore } from '../store/useRaceStore';
import { ArrowLeft } from 'lucide-react';
import { LeaderboardTable } from './LeaderboardTable';
import { TrackMap } from './TrackMap';

export const TimingScreen = ({ onBack }) => {
  const sessionTimeLeft = useRaceStore((state) => state.sessionTimeLeft) || '00:00';

  // Status lights (green as standard)
  const lights = [1, 2, 3, 4];

  return (
    <div className="w-full h-full bg-pure-black text-white flex flex-col font-sans select-none overflow-hidden">
      {/* HEADER SECTION (Apex Timing style) */}
      <div className="h-14 sm:h-16 bg-gradient-to-b from-[#111] to-[#222] border-b border-dark-gray flex items-center justify-between px-4">
        {/* Left Info: Session & Time */}
        <div className="flex items-center gap-4">
          <div className="flex flex-col">
            <span className="text-gray-400 text-xs uppercase font-sans tracking-wider">Sesión</span>
            <span className="text-white font-mono font-bold text-sm sm:text-base leading-tight">Sesión Activa</span>
          </div>
          <div className="h-8 w-px bg-dark-gray" />
          <div className="flex flex-col">
            <span className="text-gray-400 text-xs uppercase font-sans tracking-wider">Tiempo</span>
            <span className="text-white font-mono font-bold text-lg sm:text-xl leading-tight text-neon-yellow">{sessionTimeLeft}</span>
          </div>
        </div>

        {/* Center: Live Status Lights (Green circles) */}
        <div className="flex items-center gap-2">
          {lights.map((l) => (
            <div 
              key={l} 
              className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-neon-green shadow-[0_0_12px_rgba(57,255,20,0.8)] border border-green-800"
            />
          ))}
        </div>

        {/* Right Info: Volver button */}
        <button 
          onClick={onBack}
          className="flex items-center gap-2 bg-dark-gray hover:bg-gray-800 text-white font-bold text-xs uppercase px-3 py-2 rounded-lg border border-gray-700 transition-colors"
        >
          <ArrowLeft size={16} />
          <span>Volver</span>
        </button>
      </div>

      {/* MAIN LAYOUT: Split into timing table and track graphic */}
      {/* On mobile: stacks vertically in portrait (flex-col), side-by-side in landscape (landscape:flex-row) */}
      {/* On tablet/desktop (>=768px): side-by-side in both portrait and landscape (md:flex-row) */}
      <div className="flex-1 flex flex-col landscape:flex-row md:flex-row overflow-y-auto landscape:overflow-y-hidden md:overflow-y-hidden">
        {/* LEFT COLUMN: Timing Table (70% width on landscape/tablet/desktop, full width on mobile portrait) */}
        <div className="w-full landscape:w-[70%] md:w-[65%] lg:w-[70%] border-b landscape:border-b-0 md:border-b-0 landscape:border-r md:border-r border-dark-gray flex-shrink-0 landscape:h-full md:h-full landscape:overflow-y-auto md:overflow-y-auto">
          <LeaderboardTable />
        </div>

        {/* RIGHT COLUMN: Track & Circuit Info (30% width on landscape/tablet/desktop, full width on mobile portrait) */}
        <div className="w-full landscape:w-[30%] md:w-[35%] lg:w-[30%] flex-1 md:flex-initial flex flex-col bg-[#050505] flex-shrink-0 landscape:h-full md:h-full overflow-hidden">
          <TrackMap />
        </div>
      </div>
    </div>
  );
};
