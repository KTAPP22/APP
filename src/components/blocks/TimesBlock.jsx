import React from 'react';
import { useRaceStore } from '../../store/useRaceStore';

export const TimesBlock = () => {
  const lastLap = useRaceStore((state) => state.lastLap);
  const bestLap = useRaceStore((state) => state.bestLap);

  return (
    <div className="flex flex-col justify-center items-center p-2 border-b landscape:border-b-0 border-white/35 landscape:border-r md:border-0 bg-pure-black h-full gap-1 landscape:gap-0.5 sm:gap-8 overflow-hidden">
      <div className="flex flex-col items-center">
        <div className="text-gray-400 uppercase font-sans tracking-widest text-xs landscape:text-[10px] sm:text-base mb-0.5">
          Última Vuelta
        </div>
        <div className="text-3xl landscape:text-2xl sm:text-6xl font-bold font-mono text-neon-yellow tracking-tighter">
          {lastLap}
        </div>
      </div>
      <div className="flex flex-col items-center">
        <div className="text-gray-400 uppercase font-sans tracking-widest text-xs landscape:text-[10px] sm:text-base mb-0.5">
          Mejor Vuelta
        </div>
        <div className="text-3xl landscape:text-2xl sm:text-6xl font-bold font-mono text-neon-green tracking-tighter">
          {bestLap}
        </div>
      </div>
    </div>
  );
};
