import React from 'react';
import { useRaceStore } from '../../store/useRaceStore';
import { Timer } from 'lucide-react';

export const SessionBlock = () => {
  const sessionTimeLeft = useRaceStore((state) => state.sessionTimeLeft);
  
  return (
    <div className="flex flex-col items-center justify-center p-4 border-b border-dark-gray landscape:border-r md:border-r bg-pure-black h-full min-h-[25vh] landscape:min-h-0">
      <div className="flex items-center gap-2 mb-2 text-gray-400 uppercase font-sans tracking-widest text-sm sm:text-base">
        <Timer size={20} />
        <span>Tiempo Restante</span>
      </div>
      <div className="text-5xl sm:text-7xl font-bold font-mono text-white tracking-tight">
        {sessionTimeLeft}
      </div>
    </div>
  );
};
