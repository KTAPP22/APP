import React, { useEffect, useState } from 'react'
import { SetupScreen } from './components/SetupScreen'
import { Dashboard } from './components/Dashboard'
import { TimingScreen } from './components/TimingScreen'
import { useRaceStore } from './store/useRaceStore'

function App() {
  const isSetupComplete = useRaceStore((state) => state.isSetupComplete);
  const [showTiming, setShowTiming] = useState(false);

  // Request Wake Lock to keep screen on during race
  useEffect(() => {
    let wakeLock = null;

    const requestWakeLock = async () => {
      try {
        if ('wakeLock' in navigator) {
          wakeLock = await navigator.wakeLock.request('screen');
          console.log('Wake Lock is active!');
        }
      } catch (err) {
        console.error(`${err.name}, ${err.message}`);
      }
    };

    if (isSetupComplete) {
      requestWakeLock();
    }

    return () => {
      if (wakeLock !== null) {
        wakeLock.release().then(() => {
          wakeLock = null;
          console.log('Wake Lock released!');
        });
      }
    };
  }, [isSetupComplete]);

  return (
    <div className="w-full h-full">
      {!isSetupComplete ? (
        <SetupScreen />
      ) : showTiming ? (
        <TimingScreen onBack={() => setShowTiming(false)} />
      ) : (
        <Dashboard onShowTiming={() => setShowTiming(true)} />
      )}
    </div>
  )
}

export default App
