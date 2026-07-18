import React from 'react';
import { useRaceStore } from '../../store/useRaceStore';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs) {
  return twMerge(clsx(inputs));
}

const GapItem = ({ label, gap, colorClass }) => (
  <div className="flex flex-col items-center flex-1 justify-center min-w-0">
    <div className="text-gray-400 uppercase font-sans tracking-widest text-xxs sm:text-xs mb-0.5 whitespace-nowrap">
      {label}
    </div>
    <div className={cn("text-xl landscape:text-2xl sm:text-5xl font-bold font-mono tracking-tighter truncate", colorClass)}>
      {gap}
    </div>
  </div>
);

export const GapsBlock = () => {
  const leaderGap = useRaceStore((state) => state.leaderGap);
  const gapAhead = useRaceStore((state) => state.gapAhead);
  const gapBehind = useRaceStore((state) => state.gapBehind);

  return (
    <div className="flex flex-col landscape:flex-row p-2 border-r border-dark-gray bg-pure-black h-full justify-around items-stretch gap-1 sm:gap-2 overflow-hidden">
      <GapItem label="Dist. Líder" gap={leaderGap} colorClass="text-white" />
      <div className="w-full h-px landscape:w-px landscape:h-auto bg-dark-gray" />
      <GapItem label="Piloto Delante" gap={gapAhead} colorClass="text-neon-red" />
      <div className="w-full h-px landscape:w-px landscape:h-auto bg-dark-gray" />
      <GapItem label="Piloto Detrás" gap={gapBehind} colorClass="text-neon-green" />
    </div>
  );
};
