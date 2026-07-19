import React from 'react';
import { useRaceStore } from '../../store/useRaceStore';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs) {
  return twMerge(clsx(inputs));
}

const GapItem = ({ label, gap, colorClass }) => (
  <div className="flex flex-col items-center flex-1 justify-center">
    <div className="text-gray-400 uppercase font-sans tracking-widest text-xs landscape:text-[10px] sm:text-sm mb-0.5 sm:mb-1">
      {label}
    </div>
    <div className={cn("text-3xl landscape:text-2xl sm:text-5xl font-bold font-mono tracking-tighter", colorClass)}>
      {gap}
    </div>
  </div>
);

export const GapsBlock = () => {
  const leaderGap = useRaceStore((state) => state.leaderGap);
  const gapAhead = useRaceStore((state) => state.gapAhead);
  const gapBehind = useRaceStore((state) => state.gapBehind);

  return (
    <div className="flex flex-col p-2 border-r border-white/35 md:border-0 bg-pure-black h-full justify-around overflow-hidden">
      <GapItem label="Dist. Líder" gap={leaderGap} colorClass="text-white" />
      <div className="w-full h-px bg-dark-gray" />
      <GapItem label="Piloto Delante" gap={gapAhead} colorClass="text-neon-red" />
      <div className="w-full h-px bg-dark-gray" />
      <GapItem label="Piloto Detrás" gap={gapBehind} colorClass="text-neon-green" />
    </div>
  );
};
