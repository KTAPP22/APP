import React, { useEffect, useState } from 'react';
import { useRaceStore } from '../../store/useRaceStore';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export const StintBlock = () => {
  const stintDurations = useRaceStore((state) => state.stintDurations);
  const currentStintIndex = useRaceStore((state) => state.currentStintIndex);
  const totalStints = useRaceStore((state) => state.totalStints);
  const stintType = useRaceStore((state) => state.stintType);
  const stintStartTime = useRaceStore((state) => state.stintStartTime);
  const stintStartLaps = useRaceStore((state) => state.stintStartLaps);
  const currentDriverLaps = useRaceStore((state) => state.currentDriverLaps);
  const isStintPaused = useRaceStore((state) => state.isStintPaused);
  const stintElapsedAtPitIn = useRaceStore((state) => state.stintElapsedAtPitIn) || 0;
  const resetStint = useRaceStore((state) => state.resetStint);

  const [timeLeft, setTimeLeft] = useState(0);

  // Active stint duration based on index
  const activeDuration = stintDurations[currentStintIndex] || 20;

  useEffect(() => {
    if (!stintStartTime || stintType !== 'minutes') return;

    if (isStintPaused) {
      const totalDurationMs = activeDuration * 60 * 1000;
      const remainingMs = totalDurationMs - stintElapsedAtPitIn;
      setTimeLeft(Math.max(0, remainingMs));
      return; // Freeze timer
    }

    const updateTimer = () => {
      const now = Date.now();
      const elapsedMs = now - stintStartTime;
      const totalDurationMs = activeDuration * 60 * 1000;
      const remainingMs = totalDurationMs - elapsedMs;
      
      setTimeLeft(Math.max(0, remainingMs));
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);

    return () => clearInterval(interval);
  }, [stintStartTime, activeDuration, stintType, isStintPaused, stintElapsedAtPitIn]);

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
    const lapsLeft = Math.max(0, activeDuration - lapsDone);
    displayValue = lapsLeft.toString();
    
    if (lapsLeft <= 3) {
      colorClass = 'text-neon-yellow';
    }
    if (lapsLeft <= 1) {
      colorClass = 'text-neon-red animate-pulse';
    }
  }

  // Force red color if paused in boxes
  if (isStintPaused) {
    colorClass = 'text-neon-red';
  }

  return (
    <div className="flex flex-col items-center justify-center p-2 bg-pure-black h-full relative overflow-hidden">
      <div className="text-gray-400 uppercase font-sans tracking-widest text-xs landscape:text-[10px] sm:text-base mb-1 sm:mb-2 text-center">
        Stint {totalStints > 1 ? `${currentStintIndex + 1}/${totalStints}` : ''}
      </div>
      <div className={cn("text-4xl landscape:text-3xl sm:text-7xl font-bold font-mono tracking-tight", colorClass)}>
        {displayValue}
      </div>
      
      {isStintPaused && (
        <div className="absolute bottom-2 px-2.5 py-0.5 rounded-full bg-neon-red/15 border border-neon-red/40 text-neon-red font-mono font-bold text-[9px] sm:text-xs tracking-widest uppercase animate-pulse">
          IN PIT
        </div>
      )}
    </div>
  );
};
