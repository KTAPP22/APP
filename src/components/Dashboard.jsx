import React, { useEffect } from 'react';
import { SessionBlock } from './blocks/SessionBlock';
import { TimesBlock } from './blocks/TimesBlock';
import { GapsBlock } from './blocks/GapsBlock';
import { StintBlock } from './blocks/StintBlock';
import { startApexTimingService, stopApexTimingService } from '../services/apexTimingService';
import { useRaceStore } from '../store/useRaceStore';

export const Dashboard = () => {
  const apexUrl = useRaceStore((state) => state.apexUrl);
  const apexPort = useRaceStore((state) => state.apexPort);

  useEffect(() => {
    if (apexUrl) {
      startApexTimingService(apexUrl, apexPort);
    }
    
    return () => {
      stopApexTimingService();
    };
  }, [apexUrl, apexPort]);

  return (
    <div className="w-full h-full grid grid-cols-2 grid-rows-2 overflow-hidden select-none">
      {/* Top Left: Session Info */}
      <SessionBlock />
      
      {/* Top Right: Lap Times */}
      <TimesBlock />
      
      {/* Bottom Left: Gaps */}
      <GapsBlock />
      
      {/* Bottom Right: Stint Timer */}
      <StintBlock />
    </div>
  );
};
