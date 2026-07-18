import { create } from 'zustand'

export const useRaceStore = create((set, get) => ({
  // Setup state
  isSetupComplete: false,
  targetDriverId: null, // Driver to track
  targetDriverName: '',
  stintDurationValue: 20,
  stintType: 'minutes', // 'minutes' or 'laps'
  apexUrl: '', // Apex Timing live URL
  apexPort: 9950, // Apex Timing port
  
  // Real-time Race state
  sessionTimeLeft: '00:00',
  sessionLapsLeft: null,
  
  // Driver specific state
  lastLap: '--:--',
  bestLap: '--:--',
  currentDriverLaps: 0,
  
  // Gaps
  leaderGap: '+0.000',
  gapAhead: '+0.000',
  gapBehind: '-0.000',
  
  // Stint
  stintStartTime: null, // timestamp
  stintStartLaps: 0,
  
  // Actions
  completeSetup: (driverName, stintValue, type, circuitUrl, port) => set({ 
    targetDriverName: driverName, 
    stintDurationValue: parseInt(stintValue, 10),
    stintType: type,
    apexUrl: circuitUrl || '',
    apexPort: parseInt(port, 10) || 9950,
    isSetupComplete: true,
    stintStartTime: Date.now(),
    stintStartLaps: get().currentDriverLaps || 0
  }),
  
  updateRaceData: (data) => {
    // This action will be called by the apex timing service when new data arrives.
    // data should contain session info and drivers array.
    const state = get();
    
    // Process data to find target driver
    const me = data.drivers.find(d => 
      d.name.toLowerCase() === state.targetDriverName.toLowerCase() || 
      d.id === state.targetDriverId
    );
    
    if (me) {
      // Find gaps based on position
      const myPos = me.position;
      const leader = data.drivers.find(d => d.position === 1);
      const ahead = data.drivers.find(d => d.position === myPos - 1);
      const behind = data.drivers.find(d => d.position === myPos + 1);

      set({
        sessionTimeLeft: data.sessionTimeLeft,
        sessionLapsLeft: data.sessionLapsLeft,
        lastLap: me.lastLap || '--:--',
        bestLap: me.bestLap || '--:--',
        currentDriverLaps: me.laps || get().currentDriverLaps,
        leaderGap: leader && me.position !== 1 ? me.gapToLeader : 'LÍDER',
        gapAhead: ahead ? me.gapAhead : '--',
        gapBehind: behind ? me.gapBehind : '--',
      });
    } else {
      set({
        sessionTimeLeft: data.sessionTimeLeft,
        sessionLapsLeft: data.sessionLapsLeft,
      });
    }
  },

  resetStint: () => set({ 
    stintStartTime: Date.now(),
    stintStartLaps: get().currentDriverLaps || 0
  })
}));
