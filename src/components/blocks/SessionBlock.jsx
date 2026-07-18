import React from 'react';
import { useRaceStore } from '../../store/useRaceStore';
import { Timer } from 'lucide-react';

export const SessionBlock = () => {
  const sessionTimeLeft = useRaceStore((state) => state.sessionTimeLeft);
  
  return (
    <div className="flex flex-col items-center justify-center p-2 border-b border-r border-dark-gray bg-pure-black h-full overflow-hidden">
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
