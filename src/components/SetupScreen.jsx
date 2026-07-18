import React, { useState } from 'react';
import { useRaceStore } from '../store/useRaceStore';

const PRESETS = [
  { name: 'Lucas Guerrero (Chiva, ES)', url: 'https://live.apex-timing.com/kartodromo-lucas-guerrero/', port: 9950 },
  { name: 'Servidor Local (Fake Test)', url: 'http://localhost:8080', port: 9950 },
  { name: 'Karting Zuera (ES)', url: 'https://live.apex-timing.com/karting-zuera/', port: 9950 },
  { name: 'Karting Campillos (ES)', url: 'https://live.apex-timing.com/karting-campillos/', port: 9950 },
  { name: 'Motorland Aragón (ES)', url: 'https://live.apex-timing.com/motorland-aragon/', port: 9950 },
  { name: 'Otro / URL Personalizada...', url: 'custom', port: 9950 }
];

export const SetupScreen = () => {
  const completeSetup = useRaceStore((state) => state.completeSetup);
  const storeTargetDriverName = useRaceStore((state) => state.targetDriverName);
  const storeStintDurations = useRaceStore((state) => state.stintDurations);
  const storeStintType = useRaceStore((state) => state.stintType);
  const storeApexUrl = useRaceStore((state) => state.apexUrl);
  const storeApexPort = useRaceStore((state) => state.apexPort);
  
  const [driverName, setDriverName] = useState(storeTargetDriverName || '');
  
  // Stints State
  const [numStints, setNumStints] = useState(storeStintDurations?.length || 1);
  const [stintDurations, setStintDurations] = useState(storeStintDurations || [20]);
  const [stintType, setStintType] = useState(storeStintType || 'minutes');
  
  // Circuit selector state: Find index of saved URL
  const presetIndex = PRESETS.findIndex(p => p.url === storeApexUrl);
  const initialCircuitIndex = presetIndex !== -1 ? presetIndex : (storeApexUrl ? PRESETS.length - 1 : 0);

  const [selectedCircuitIndex, setSelectedCircuitIndex] = useState(initialCircuitIndex);
  const [customUrl, setCustomUrl] = useState(initialCircuitIndex === PRESETS.length - 1 ? storeApexUrl : '');
  const [customPort, setCustomPort] = useState(storeApexPort || 9950);

  const handleNumStintsChange = (val) => {
    const count = Math.max(1, parseInt(val, 10) || 1);
    setNumStints(count);
    
    // Resize the durations array
    const updated = [...stintDurations];
    if (updated.length < count) {
      while (updated.length < count) {
        updated.push(20); // Default to 20 mins/laps for new stints
      }
    } else if (updated.length > count) {
      updated.splice(count);
    }
    setStintDurations(updated);
  };

  const handleDurationChange = (index, val) => {
    const valInt = Math.max(1, parseInt(val, 10) || 1);
    const updated = [...stintDurations];
    updated[index] = valInt;
    setStintDurations(updated);
  };

  const handleStart = (e) => {
    e.preventDefault();
    if (!driverName) return;

    let finalUrl = '';
    let finalPort = 9950;

    const preset = PRESETS[selectedCircuitIndex];
    if (preset.url === 'custom') {
      finalUrl = customUrl;
      finalPort = customPort;
    } else {
      finalUrl = preset.url;
      finalPort = preset.port;
    }

    if (finalUrl && stintDurations.length > 0) {
      completeSetup(driverName, stintDurations, stintType, finalUrl, finalPort);
    }
  };

  const isCustomSelected = PRESETS[selectedCircuitIndex]?.url === 'custom';

  return (
    <div className="w-full min-h-full flex flex-col items-center justify-start sm:justify-center bg-dark-gray p-4 sm:p-8 overflow-y-auto">
      <div className="w-full max-w-md space-y-6 sm:space-y-8 bg-pure-black p-4 sm:p-8 rounded-2xl border border-gray-800 my-4">
        <h1 className="text-2xl sm:text-4xl font-bold text-center text-white mb-4 sm:mb-8 tracking-tight">KTAPP</h1>
        
        <form onSubmit={handleStart} className="space-y-6">
          {/* Driver Name */}
          <div>
            <label className="block text-gray-400 text-base sm:text-xl mb-2 font-sans">Nombre del Piloto a Seguir</label>
            <input 
              type="text" 
              value={driverName}
              onChange={(e) => setDriverName(e.target.value)}
              className="w-full bg-dark-gray text-white text-xl sm:text-3xl p-3 sm:p-4 rounded-xl border border-gray-700 focus:border-neon-green focus:outline-none"
              placeholder="Ej. Verstappen"
              required
            />
          </div>

          {/* Stint Configuration */}
          <div className="space-y-4">
            <div className="flex gap-4">
              <div className="w-2/3">
                <label className="block text-gray-400 text-base sm:text-xl mb-2 font-sans">Número de Stints</label>
                <input 
                  type="number" 
                  value={numStints}
                  onChange={(e) => handleNumStintsChange(e.target.value)}
                  className="w-full bg-dark-gray text-white text-xl sm:text-3xl p-3 sm:p-4 rounded-xl border border-gray-700 focus:border-neon-green focus:outline-none"
                  min="1"
                  required
                />
              </div>
              <div className="w-1/3">
                <label className="block text-gray-400 text-base sm:text-xl mb-2 font-sans">Tipo</label>
                <select 
                  value={stintType}
                  onChange={(e) => setStintType(e.target.value)}
                  className="w-full bg-dark-gray text-white text-base sm:text-xl p-3 sm:p-4 rounded-xl border border-gray-700 focus:border-neon-green focus:outline-none appearance-none cursor-pointer"
                >
                  <option value="minutes">Minutos</option>
                  <option value="laps">Vueltas</option>
                </select>
              </div>
            </div>

            {/* Individual Stint Durations */}
            <div className="space-y-3 max-h-48 overflow-y-auto pr-1">
              {stintDurations.map((dur, i) => (
                <div key={i} className="flex items-center justify-between gap-4 bg-dark-gray/40 p-2 rounded-lg border border-gray-800">
                  <span className="text-gray-400 font-sans text-sm sm:text-base">Duración Stint {i + 1}</span>
                  <input 
                    type="number"
                    value={dur}
                    onChange={(e) => handleDurationChange(i, e.target.value)}
                    className="w-24 bg-dark-gray text-white text-right font-mono text-lg p-2 rounded-lg border border-gray-700 focus:border-neon-green focus:outline-none"
                    min="1"
                    required
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Circuit Dropdown Selector */}
          <div>
            <label className="block text-gray-400 text-base sm:text-xl mb-2 font-sans">Circuito / Live Timing</label>
            <select
              value={selectedCircuitIndex}
              onChange={(e) => setSelectedCircuitIndex(parseInt(e.target.value, 10))}
              className="w-full bg-dark-gray text-white text-base sm:text-lg p-3 sm:p-4 rounded-xl border border-gray-700 focus:border-neon-green focus:outline-none cursor-pointer"
            >
              {PRESETS.map((p, idx) => (
                <option key={idx} value={idx}>{p.name}</option>
              ))}
            </select>
          </div>

          {/* Custom Circuit fields if custom is selected */}
          {isCustomSelected && (
            <div className="space-y-4 animate-fade-in">
              <div>
                <label className="block text-gray-400 text-xs sm:text-sm mb-1 font-sans">URL Completa de Apex Timing</label>
                <input 
                  type="text" 
                  value={customUrl}
                  onChange={(e) => setCustomUrl(e.target.value)}
                  className="w-full bg-dark-gray text-white text-base p-3 rounded-xl border border-gray-700 focus:border-neon-green focus:outline-none"
                  placeholder="https://live.apex-timing.com/tu-circuito/"
                  required={isCustomSelected}
                />
              </div>

              <div>
                <label className="block text-gray-400 text-xs sm:text-sm mb-1 font-sans">Puerto de Apex Timing</label>
                <input 
                  type="number" 
                  value={customPort}
                  onChange={(e) => setCustomPort(e.target.value)}
                  className="w-full bg-dark-gray text-white text-base p-3 rounded-xl border border-gray-700 focus:border-neon-green focus:outline-none"
                  placeholder="9950"
                  required={isCustomSelected}
                />
              </div>
            </div>
          )}

          <button 
            type="submit"
            className="w-full bg-neon-green text-pure-black text-xl sm:text-3xl font-bold py-4 sm:py-6 rounded-xl mt-6 sm:mt-8 active:bg-green-600 transition-colors"
          >
            COMENZAR CARRERA
          </button>
        </form>
      </div>
    </div>
  );
};
