import React, { useEffect, useState } from 'react';
import { useRaceStore } from '../../store/useRaceStore';
import { RefreshCw } from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export const StintBlock = () => {
  const stintDurationValue = useRaceStore((state) => state.stintDurationValue);
  const stintType = useRaceStore((state) => state.stintType);
  const stintStartTime = useRaceStore((state) => state.stintStartTime);
  const stintStartLaps = useRaceStore((state) => state.stintStartLaps);
  const currentDriverLaps = useRaceStore((state) => state.currentDriverLaps);
  const resetStint = useRaceStore((state) => state.resetStint);

  const [timeLeft, setTimeLeft] = useState(0);

  useEffect(() => {
    if (!stintStartTime || stintType !== 'minutes') return;

    const interval = setInterval(() => {
      const now = Date.now();
      const elapsedMs = now - stintStartTime;
      const totalDurationMs = stintDurationValue * 60 * 1000;
      const remainingMs = totalDurationMs - elapsedMs;
      
      setTimeLeft(Math.max(0, remainingMs));
    }, 1000);

    return () => clearInterval(interval);
  }, [stintStartTime, stintDurationValue, stintType]);

  const formatTime = (ms) => {
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  let displayValue = '';
  let colorClass = 'text-neon-green';

  if (stintType === 'minutes') {
    displayValue = formatTime(timeLeft);
    if (timeLeft < 5 * 60 * 1000) {
      colorClass = 'text-neon-yellow';
    }
    if (timeLeft < 1 * 60 * 1000) {
      colorClass = 'text-neon-red animate-pulse';
    }
  } else {
    // Laps logic
    const lapsDone = currentDriverLaps - stintStartLaps;
    const lapsLeft = Math.max(0, stintDurationValue - lapsDone);
    displayValue = lapsLeft.toString();
    
    if (lapsLeft <= 3) {
      colorClass = 'text-neon-yellow';
    }
    if (lapsLeft <= 1) {
      colorClass = 'text-neon-red animate-pulse';
    }
  }

  return (
    <div className="flex flex-col items-center justify-center p-4 bg-pure-black h-full relative">
      <button 
        onClick={resetStint}
        className="absolute top-4 right-4 p-4 rounded-full bg-dark-gray text-white opacity-50 active:opacity-100"
      >
        <RefreshCw size={32} />
      </button>
      <div className="text-gray-400 uppercase font-sans tracking-widest text-sm sm:text-base mb-2">
        Ventana de Pit
      </div>
      <div className={cn("text-5xl sm:text-7xl font-bold font-mono tracking-tight", colorClass)}>
        {displayValue}
      </div>
    </div>
  );
};
