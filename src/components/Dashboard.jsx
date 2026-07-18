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
    <div className="w-full h-full grid grid-cols-1 grid-rows-4 landscape:grid-cols-2 landscape:grid-rows-2 md:grid-cols-2 md:grid-rows-2 overflow-y-auto landscape:overflow-hidden">
      {/* Session Info */}
      <SessionBlock />
      
      {/* Lap Times */}
      <TimesBlock />
      
      {/* Gaps */}
      <GapsBlock />
      
      {/* Stint Timer */}
      <StintBlock />
    </div>
  );
};
