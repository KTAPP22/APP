import React from 'react';
import { useRaceStore } from '../../store/useRaceStore';

export const TimesBlock = () => {
  const lastLap = useRaceStore((state) => state.lastLap);
  const bestLap = useRaceStore((state) => state.bestLap);

  return (
    <div className="flex flex-col landscape:flex-row md:flex-col justify-center items-center landscape:justify-around p-2 border-b border-dark-gray bg-pure-black h-full gap-2 sm:gap-8 overflow-hidden">
      <div className="flex flex-col items-center">
        <div className="text-gray-400 uppercase font-sans tracking-widest text-xs sm:text-base mb-0.5">
          Última Vuelta
        </div>
        <div className="text-3xl landscape:text-4xl sm:text-6xl font-bold font-mono text-neon-yellow tracking-tighter">
          {lastLap}
        </div>
      </div>
      <div className="flex flex-col items-center">
        <div className="text-gray-400 uppercase font-sans tracking-widest text-xs sm:text-base mb-0.5">
          Mejor Vuelta
        </div>
        <div className="text-3xl landscape:text-4xl sm:text-6xl font-bold font-mono text-neon-green tracking-tighter">
          {bestLap}
        </div>
      </div>
    </div>
  );
};
