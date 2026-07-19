import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export const useRaceStore = create(
  persist(
    (set, get) => ({
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
      drivers: [], // All drivers currently in timing session
      
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
      isStintPaused: false,
      stintElapsedAtPitIn: 0,
      
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
        wasInPit: false,
        isStintPaused: false,
        stintElapsedAtPitIn: 0
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
          let isPaused = state.isStintPaused;
          let elapsedAtPitIn = state.stintElapsedAtPitIn;

          // Transition: was not in pit, now is in pit -> Entered box! (Pit In)
          if (!state.wasInPit && isInPitNow) {
            isPaused = true;
            // Calculate elapsed time from the start of the stint to now
            elapsedAtPitIn = Math.max(0, Date.now() - (state.stintStartTime || Date.now()));
            console.log(`[AutoStint] Pilot entered box. Pausing stint timer. Elapsed: ${elapsedAtPitIn}ms`);
          }

          // Transition: was in pit, now is not -> Exited box! (Pit Out)
          if (state.wasInPit && !isInPitNow) {
            nextIndex = (state.currentStintIndex + 1) % state.totalStints;
            startStintTime = Date.now();
            startStintLaps = me.laps || state.currentDriverLaps;
            isPaused = false;
            elapsedAtPitIn = 0;
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
            isStintPaused: isPaused,
            stintElapsedAtPitIn: elapsedAtPitIn,
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
          stintStartLaps: get().currentDriverLaps || 0,
          isStintPaused: false,
          stintElapsedAtPitIn: 0
        });
      }
    }),
    {
      name: 'ktapp-race-storage',
      partialize: (state) => ({
        isSetupComplete: state.isSetupComplete,
        targetDriverId: state.targetDriverId,
        targetDriverName: state.targetDriverName,
        stintDurations: state.stintDurations,
        currentStintIndex: state.currentStintIndex,
        totalStints: state.totalStints,
        stintType: state.stintType,
        apexUrl: state.apexUrl,
        apexPort: state.apexPort,
        stintStartTime: state.stintStartTime,
        stintStartLaps: state.stintStartLaps,
        wasInPit: state.wasInPit,
        isStintPaused: state.isStintPaused,
        stintElapsedAtPitIn: state.stintElapsedAtPitIn,
      }),
    }
  )
)
