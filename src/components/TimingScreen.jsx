import React from 'react';
import { useRaceStore } from '../store/useRaceStore';
import { ArrowLeft } from 'lucide-react';

export const TimingScreen = ({ onBack }) => {
  const drivers = useRaceStore((state) => state.drivers) || [];
  const sessionTimeLeft = useRaceStore((state) => state.sessionTimeLeft) || '00:00';
  const targetDriverName = useRaceStore((state) => state.targetDriverName) || '';

  // Sort drivers by position
  const sortedDrivers = [...drivers].sort((a, b) => a.position - b.position);

  // Status lights (green as standard)
  const lights = [1, 2, 3, 4];

  return (
    <div className="w-full h-full bg-pure-black text-white flex flex-col font-sans select-none overflow-hidden">
      {/* HEADER SECTION (Apex Timing style) */}
      <div className="h-14 sm:h-16 bg-gradient-to-b from-[#111] to-[#222] border-b border-dark-gray flex items-center justify-between px-4">
        {/* Left Info: Session & Time */}
        <div className="flex items-center gap-4">
          <div className="flex flex-col">
            <span className="text-gray-400 text-xs uppercase font-sans tracking-wider">Sesión</span>
            <span className="text-white font-mono font-bold text-sm sm:text-base leading-tight">Sesión Activa</span>
          </div>
          <div className="h-8 w-px bg-dark-gray" />
          <div className="flex flex-col">
            <span className="text-gray-400 text-xs uppercase font-sans tracking-wider">Tiempo</span>
            <span className="text-white font-mono font-bold text-lg sm:text-xl leading-tight text-neon-yellow">{sessionTimeLeft}</span>
          </div>
        </div>

        {/* Center: Live Status Lights (Green circles) */}
        <div className="flex items-center gap-2">
          {lights.map((l) => (
            <div 
              key={l} 
              className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-neon-green shadow-[0_0_12px_rgba(57,255,20,0.8)] border border-green-800"
            />
          ))}
        </div>

        {/* Right Info: Volver button */}
        <button 
          onClick={onBack}
          className="flex items-center gap-2 bg-dark-gray hover:bg-gray-800 text-white font-bold text-xs uppercase px-3 py-2 rounded-lg border border-gray-700 transition-colors"
        >
          <ArrowLeft size={16} />
          <span>Volver</span>
        </button>
      </div>

      {/* MAIN LAYOUT: Split into timing table and track graphic */}
      <div className="flex-1 flex overflow-hidden">
        {/* LEFT COLUMN: Timing Table (70% width) */}
        <div className="w-[70%] h-full overflow-y-auto border-r border-dark-gray">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#151515] text-[#999] uppercase text-xxs sm:text-xs tracking-wider border-b border-dark-gray font-sans">
                <th className="p-2 sm:p-3 text-center w-12">Clasif.</th>
                <th className="p-2 sm:p-3 text-center w-12">Kart</th>
                <th className="p-2 sm:p-3">Piloto</th>
                <th className="p-2 sm:p-3 text-right">Última vuelta</th>
                <th className="p-2 sm:p-3 text-right">Mejor vuelta</th>
                <th className="p-2 sm:p-3 text-right">Gap</th>
                <th className="p-2 sm:p-3 text-center w-16">Vueltas</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#151515] font-mono text-sm">
              {sortedDrivers.map((driver) => {
                const isTarget = driver.name.toLowerCase().includes(targetDriverName.toLowerCase()) || 
                                 targetDriverName.toLowerCase().includes(driver.name.toLowerCase());
                
                return (
                  <tr 
                    key={driver.id} 
                    className={`${isTarget ? 'bg-neon-red/10 text-white' : 'hover:bg-[#090909] text-gray-300'}`}
                  >
                    {/* Position */}
                    <td className="p-2 sm:p-3 text-center font-bold">
                      {isTarget ? (
                        <span className="bg-neon-red text-white px-2 py-0.5 rounded text-xs">
                          {driver.position}
                        </span>
                      ) : (
                        <span className="text-white">{driver.position}</span>
                      )}
                    </td>
                    
                    {/* Kart Number */}
                    <td className="p-2 sm:p-3 text-center font-bold">
                      <span 
                        className="px-1.5 py-0.5 rounded text-xs"
                        style={{ 
                          backgroundColor: isTarget ? '#ff073a' : '#222',
                          color: isTarget ? '#fff' : '#fff'
                        }}
                      >
                        {driver.kartNumber}
                      </span>
                    </td>
                    
                    {/* Driver Name */}
                    <td className={`p-2 sm:p-3 font-sans font-bold truncate max-w-[120px] sm:max-w-none ${isTarget ? 'text-neon-red' : 'text-white'}`}>
                      {driver.name}
                    </td>
                    
                    {/* Last Lap */}
                    <td className="p-2 sm:p-3 text-right text-neon-yellow font-bold">
                      {driver.lastLap}
                    </td>
                    
                    {/* Best Lap */}
                    <td className="p-2 sm:p-3 text-right text-neon-green">
                      {driver.bestLap}
                    </td>
                    
                    {/* Gap to Leader */}
                    <td className="p-2 sm:p-3 text-right text-gray-400">
                      {driver.position === 1 ? 'Líder' : (driver.gapToLeader || '--')}
                    </td>
                    
                    {/* Laps */}
                    <td className="p-2 sm:p-3 text-center text-white">
                      {driver.laps}
                    </td>
                  </tr>
                );
              })}
              {sortedDrivers.length === 0 && (
                <tr>
                  <td colSpan="7" className="p-8 text-center text-gray-500 font-sans">
                    Esperando datos en vivo de Apex Timing...
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* RIGHT COLUMN: Track & Circuit Info (30% width) */}
        <div className="w-[30%] h-full flex flex-col bg-[#050505]">
          {/* Header of track section (red background) */}
          <div className="bg-neon-red text-pure-black font-bold uppercase text-xs sm:text-sm px-3 py-2 tracking-wider text-center font-sans">
            Pista Principal (1428m)
          </div>

          {/* SVG Map Container */}
          <div className="flex-1 p-4 flex items-center justify-center min-h-0 relative">
            <svg 
              viewBox="104 197 371 216" 
              className="w-full h-full max-h-[80%] max-w-[95%] drop-shadow-[0_0_15px_rgba(255,255,255,0.05)]" 
              strokeWidth="5" 
              fill="none" 
              strokeLinecap="round" 
              strokeLinejoin="round"
            >
              {/* Sector 1: Red */}
              <path 
                d="M 245,355 C 245,355 216,339 216,339 C 216,339 184,319 184,319 C 184,319 158,302 158,302 C 158,302 140,291 140,291 C 140,291 127,273 127,273 C 127,273 123,251 123,251 C 123,251 145,241 145,241 C 145,241 170,238 170,238 C 170,238 188,246 188,246 C 188,246 195,259 195,259 C 195,259 192,276 192,276 C 192,276 194,287 194,287 C 194,287 203,295 203,295 C 203,295 234,311 234,311 C 234,311 252,321 252,321 C 252,321 260,323 260,323 C 260,323 273,311 273,311 C 273,311 288,307 288,307" 
                stroke="#ff073a" 
              />
              {/* Sector 2: Yellow */}
              <path 
                d="M 288,307 C 288,307 329,301 329,301 C 329,301 352,303 352,303 C 352,303 370,319 370,319 C 370,319 363,337 363,337 C 363,337 341,330 341,330 C 341,330 319,322 319,322 C 319,322 299,325 299,325 C 299,325 296,336 296,336 C 296,336 312,345 312,345 C 312,345 324,355 324,355 C 324,355 340,362 340,362 C 340,362 360,360 360,360 C 360,360 380,355 380,355 C 380,355 397,347 397,347 C 397,347 413,335 413,335 C 413,335 414,319 414,319 C 414,319 398,299 398,299 C 398,299 326,249 326,249 C 326,249 300,242 300,242 C 300,242 293,254 293,254 C 293,254 297,272 297,272 C 297,272 291,285 291,285 C 291,285 275,286 275,286 C 275,286 257,278 257,278 C 257,278 244,268 244,268 C 244,268 240,252 240,252" 
                stroke="#e5ff00" 
              />
              {/* Sector 3: White */}
              <path 
                d="M 240,252 C 240,252 252,231 252,231 C 252,231 274,221 274,221 C 274,221 301,217 301,217 C 301,217 328,223 328,223 C 328,223 350,235 350,235 C 350,235 404,271 404,271 C 404,271 437,293 437,293 C 437,293 454,304 454,304 C 454,304 456,333 456,333 C 456,333 440,351 440,351 C 440,351 412,374 412,374 C 412,374 387,395 387,395 C 387,395 372,388 372,388 C 372,388 355,379 355,379 C 355,379 336,383 336,383 C 336,383 322,387 322,387 C 322,387 300,380 300,380 C 300,380 277,368 277,368 C 277,368 256,359 256,359 C 256,359 245,355 245,355" 
                stroke="#ffffff" 
              />
              
              {/* Timing loops */}
              <circle cx="245" cy="355" r="7" fill="#ffffff" stroke="#ff073a" strokeWidth="2" title="Meta" />
              <circle cx="288" cy="307" r="5" fill="#7FDBFF" stroke="#111111" strokeWidth="1.5" title="S1" />
              <circle cx="240" cy="252" r="5" fill="#7FDBFF" stroke="#111111" strokeWidth="1.5" title="S2" />
            </svg>
          </div>

          {/* Bottom Branding (Logo 10 Aniversario / Lucas Guerrero) */}
          <div className="p-3 border-t border-dark-gray flex flex-col gap-2">
            <div className="text-center font-sans tracking-wide font-bold text-[#888] text-xs">
              10 Aniversario - Kartodromo Lucas Guerrero
            </div>
            
            <div className="flex justify-around items-center py-2 bg-black rounded-lg border border-gray-900">
              {/* 10 Aniversario Logo Recreated */}
              <div className="flex items-center gap-1.5 text-white font-mono text-sm leading-none font-bold">
                <span className="text-neon-red text-lg">10</span>
                <div className="flex flex-col text-[8px] uppercase tracking-wider text-gray-400 font-sans">
                  <span>Años</span>
                  <span>Karting</span>
                </div>
              </div>
              
              {/* Divider */}
              <div className="w-px h-6 bg-dark-gray" />

              {/* Lucas Guerrero Logo Recreated */}
              <div className="flex items-center gap-1">
                <div className="text-white text-xs font-sans font-bold leading-none uppercase text-center bg-neon-red px-1.5 py-1 rounded tracking-tighter">
                  LUCAS
                </div>
                <div className="text-white text-[10px] font-sans font-bold leading-none tracking-tight">
                  GUERRERO
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
