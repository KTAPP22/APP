import React from 'react';

export const TrackMap = () => {
  return (
    <div className="w-full flex flex-col bg-[#050505] flex-shrink-0 min-h-[340px] md:min-h-0 h-full rounded-xl overflow-hidden border border-gray-900 md:border-0">
      {/* Header of track section (red background) */}
      <div className="bg-neon-red text-pure-black font-bold uppercase text-xs sm:text-sm px-3 py-2 tracking-wider text-center font-sans">
        Pista Principal (1428m)
      </div>

      {/* SVG Map Container */}
      <div className="flex-1 p-4 flex items-center justify-center min-h-[220px] relative">
        <svg 
          viewBox="104 197 371 216" 
          className="w-full h-full max-h-[180px] md:max-h-[200px] max-w-[95%] drop-shadow-[0_0_15px_rgba(255,255,255,0.05)]" 
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
      <div className="p-3 border-t border-dark-gray flex flex-col gap-2 mt-auto">
        <div className="text-center font-sans tracking-wide font-bold text-[#888] text-[10px] sm:text-xs">
          10 Aniversario - Kartodromo Lucas Guerrero
        </div>
        
        <div className="flex justify-around items-center py-1.5 bg-black rounded-lg border border-gray-900">
          {/* 10 Aniversario Logo Recreated */}
          <div className="flex items-center gap-1.5 text-white font-mono text-xs sm:text-sm leading-none font-bold">
            <span className="text-neon-red text-base">10</span>
            <div className="flex flex-col text-[7px] uppercase tracking-wider text-gray-400 font-sans">
              <span>Años</span>
              <span>Karting</span>
            </div>
          </div>
          
          {/* Divider */}
          <div className="w-px h-5 bg-dark-gray" />

          {/* Lucas Guerrero Logo Recreated */}
          <div className="flex items-center gap-1">
            <div className="text-white text-[10px] font-sans font-bold leading-none uppercase text-center bg-neon-red px-1.5 py-0.5 rounded tracking-tighter">
              LUCAS
            </div>
            <div className="text-white text-[8px] sm:text-[10px] font-sans font-bold leading-none tracking-tight">
              GUERRERO
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
