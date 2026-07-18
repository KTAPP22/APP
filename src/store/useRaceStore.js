import { create } from 'zustand'

export const useRaceStore = create((set, get) => ({
  // Setup state
  isSetupComplete: false,
  targetDriverId: null, // Driver to track
  targetDriverName: '',
  stintDurations: [20], // Array of stint durations (minutes or laps)
  currentStintIndex: 0,
  totalStints: 1,
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
  wasInPit: false, // Tracks if driver was in pit in previous tick
  
  // Actions
  completeSetup: (driverName, stintDurationsArray, type, circuitUrl, port) => set({ 
    targetDriverName: driverName, 
    stintDurations: stintDurationsArray,
    totalStints: stintDurationsArray.length,
    currentStintIndex: 0,
    stintType: type,
    apexUrl: circuitUrl || '',
    apexPort: parseInt(port, 10) || 9950,
    isSetupComplete: true,
    stintStartTime: Date.now(),
    stintStartLaps: get().currentDriverLaps || 0,
    wasInPit: false
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

      // Detect if driver is currently in pit (Apex standard is "PIT" or "IN" in lastLap)
      const lastLapStr = String(me.lastLap || '').trim().toUpperCase();
      const isInPitNow = lastLapStr === 'PIT' || lastLapStr === 'IN' || lastLapStr === 'BOX' || lastLapStr.includes('PIT');
      
      let nextIndex = state.currentStintIndex;
      let startStintTime = state.stintStartTime;
      let startStintLaps = state.stintStartLaps;

      // Transition: was in pit, now is not -> Exited box!
      if (state.wasInPit && !isInPitNow) {
        nextIndex = (state.currentStintIndex + 1) % state.totalStints;
        startStintTime = Date.now();
        startStintLaps = me.laps || state.currentDriverLaps;
        console.log(`[AutoStint] Pilot exited box. Transitioning to stint ${nextIndex + 1}/${state.totalStints}`);
      }

      set({
        sessionTimeLeft: data.sessionTimeLeft,
        sessionLapsLeft: data.sessionLapsLeft,
        lastLap: me.lastLap || '--:--',
        bestLap: me.bestLap || '--:--',
        currentDriverLaps: me.laps || get().currentDriverLaps,
        leaderGap: leader && me.position !== 1 ? me.gapToLeader : 'LÍDER',
        gapAhead: ahead ? me.gapAhead : '--',
        gapBehind: behind ? me.gapBehind : '--',
        wasInPit: isInPitNow,
        currentStintIndex: nextIndex,
        stintStartTime: startStintTime,
        stintStartLaps: startStintLaps
      });
    } else {
      set({
        sessionTimeLeft: data.sessionTimeLeft,
        sessionLapsLeft: data.sessionLapsLeft,
      });
    }
  },

  resetStint: () => {
    const { currentStintIndex, totalStints } = get();
    // Advance to the next stint (wrap around to 0 when finished)
    const nextIndex = (currentStintIndex + 1) % totalStints;
    set({ 
      currentStintIndex: nextIndex,
      stintStartTime: Date.now(),
      stintStartLaps: get().currentDriverLaps || 0
    });
  }
}));
