import React, { useState } from 'react';
import { useRaceStore } from '../store/useRaceStore';

export const SetupScreen = () => {
  const completeSetup = useRaceStore((state) => state.completeSetup);
  
  const [driverName, setDriverName] = useState('');
  const [stintDuration, setStintDuration] = useState(20);
  const [stintType, setStintType] = useState('minutes'); // 'minutes' or 'laps'
  const [circuitId, setCircuitId] = useState('');
  const [apexPort, setApexPort] = useState(9950);

  const handleStart = (e) => {
    e.preventDefault();
    if (driverName && stintDuration) {
      completeSetup(driverName, stintDuration, stintType, circuitId, apexPort);
    }
  };

  return (
    <div className="w-full h-full flex flex-col items-center justify-center bg-dark-gray p-8 overflow-y-auto">
      <div className="w-full max-w-md space-y-8 bg-pure-black p-8 rounded-2xl border border-gray-800">
        <h1 className="text-4xl font-bold text-center text-white mb-8 tracking-tight">Configuración AppKart</h1>
        
        <form onSubmit={handleStart} className="space-y-6">
          <div>
            <label className="block text-gray-400 text-xl mb-2 font-sans">Nombre del Piloto a Seguir</label>
            <input 
              type="text" 
              value={driverName}
              onChange={(e) => setDriverName(e.target.value)}
              className="w-full bg-dark-gray text-white text-3xl p-4 rounded-xl border border-gray-700 focus:border-neon-green focus:outline-none"
              placeholder="Ej. Verstappen"
              required
            />
          </div>

          <div>
            <label className="block text-gray-400 text-xl mb-2 font-sans">Duración del Stint</label>
            <div className="flex gap-4">
              <input 
                type="number" 
                value={stintDuration}
                onChange={(e) => setStintDuration(e.target.value)}
                className="w-2/3 bg-dark-gray text-white text-3xl p-4 rounded-xl border border-gray-700 focus:border-neon-green focus:outline-none"
                min="1"
                required
              />
              <select 
                value={stintType}
                onChange={(e) => setStintType(e.target.value)}
                className="w-1/3 bg-dark-gray text-white text-xl p-4 rounded-xl border border-gray-700 focus:border-neon-green focus:outline-none appearance-none cursor-pointer"
              >
                <option value="minutes">Minutos</option>
                <option value="laps">Vueltas</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-gray-400 text-xl mb-2 font-sans">URL de Apex Timing</label>
            <input 
              type="text" 
              value={circuitId}
              onChange={(e) => setCircuitId(e.target.value)}
              className="w-full bg-dark-gray text-white text-lg p-4 rounded-xl border border-gray-700 focus:border-neon-green focus:outline-none"
              placeholder="https://live.apex-timing.com/tu-circuito/"
              required
            />
          </div>

          <div>
            <label className="block text-gray-400 text-xl mb-2 font-sans">Puerto de Apex Timing (Opcional)</label>
            <input 
              type="number" 
              value={apexPort}
              onChange={(e) => setApexPort(e.target.value)}
              className="w-full bg-dark-gray text-white text-lg p-4 rounded-xl border border-gray-700 focus:border-neon-green focus:outline-none"
              placeholder="9950"
            />
          </div>

          <button 
            type="submit"
            className="w-full bg-neon-green text-pure-black text-3xl font-bold py-6 rounded-xl mt-8 active:bg-green-600 transition-colors"
          >
            COMENZAR CARRERA
          </button>
        </form>
      </div>
    </div>
  );
};
