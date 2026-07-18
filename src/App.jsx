import React, { useEffect } from 'react'
import { SetupScreen } from './components/SetupScreen'
import { Dashboard } from './components/Dashboard'
import { useRaceStore } from './store/useRaceStore'

function App() {
  const isSetupComplete = useRaceStore((state) => state.isSetupComplete);

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
      {!isSetupComplete ? <SetupScreen /> : <Dashboard />}
    </div>
  )
}

export default App
