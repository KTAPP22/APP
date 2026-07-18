import React from 'react';
import { useRaceStore } from '../../store/useRaceStore';

export const TimesBlock = () => {
  const lastLap = useRaceStore((state) => state.lastLap);
  const bestLap = useRaceStore((state) => state.bestLap);

  return (
    <div className="flex flex-col justify-center p-4 border-b border-dark-gray bg-pure-black h-full gap-4 sm:gap-8 min-h-[25vh] landscape:min-h-0">
      <div className="flex flex-col items-center">
        <div className="text-gray-400 uppercase font-sans tracking-widest text-sm sm:text-base mb-1">
          Última Vuelta
        </div>
        <div className="text-4xl sm:text-6xl font-bold font-mono text-neon-yellow tracking-tighter">
          {lastLap}
        </div>
      </div>
      <div className="flex flex-col items-center">
        <div className="text-gray-400 uppercase font-sans tracking-widest text-sm sm:text-base mb-1">
          Mejor Vuelta
        </div>
        <div className="text-4xl sm:text-6xl font-bold font-mono text-neon-green tracking-tighter">
          {bestLap}
        </div>
      </div>
    </div>
  );
};
