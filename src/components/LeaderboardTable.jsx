import React from 'react';
import { useRaceStore } from '../store/useRaceStore';

export const LeaderboardTable = () => {
  const drivers = useRaceStore((state) => state.drivers) || [];
  const targetDriverName = useRaceStore((state) => state.targetDriverName) || '';

  // Sort drivers by position
  const sortedDrivers = [...drivers].sort((a, b) => a.position - b.position);

  return (
    <div className="w-full">
      <table className="w-full text-left border-collapse table-fixed landscape:table-auto md:table-auto">
        <thead>
          <tr className="bg-[#151515] text-[#999] uppercase text-[10px] sm:text-xs tracking-wider border-b border-dark-gray font-sans">
            <th className="py-2 px-1 text-center w-[12%] landscape:w-12 md:w-12">Pos</th>
            <th className="py-2 px-1 text-center w-[12%] landscape:w-12 md:w-12">Kart</th>
            <th className="py-2 px-1 w-[26%] landscape:w-auto md:w-auto">Piloto</th>
            <th className="py-2 px-1 text-right w-[18%] landscape:w-auto md:w-auto">Última</th>
            <th className="py-2 px-1 text-right w-[18%] landscape:w-auto md:w-auto">Mejor</th>
            <th className="py-2 px-1 text-right w-[14%] landscape:w-auto md:w-auto">Gap</th>
            <th className="py-2 px-1 text-center w-[10%] landscape:w-16 md:w-16">V.</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-[#151515] font-mono text-xs sm:text-sm">
          {sortedDrivers.map((driver) => {
            const isTarget = driver.name.toLowerCase().includes(targetDriverName.toLowerCase()) || 
                             targetDriverName.toLowerCase().includes(driver.name.toLowerCase());
            
            return (
              <tr 
                key={driver.id} 
                className={`${isTarget ? 'bg-neon-red/10 text-white' : 'hover:bg-[#090909] text-gray-300'}`}
              >
                {/* Position */}
                <td className="py-2 px-1 text-center font-bold">
                  {isTarget ? (
                    <span className="bg-neon-red text-white px-1.5 py-0.5 rounded text-[10px] sm:text-xs">
                      {driver.position}
                    </span>
                  ) : (
                    <span className="text-white">{driver.position}</span>
                  )}
                </td>
                
                {/* Kart Number */}
                <td className="py-2 px-1 text-center font-bold">
                  <span 
                    className="px-1 py-0.5 rounded text-[10px] sm:text-xs"
                    style={{ 
                      backgroundColor: isTarget ? '#ff073a' : '#222',
                      color: isTarget ? '#fff' : '#fff'
                    }}
                  >
                    {driver.kartNumber}
                  </span>
                </td>
                
                {/* Driver Name */}
                <td className={`py-2 px-1 font-sans font-bold truncate max-w-[80px] landscape:max-w-none sm:max-w-none md:max-w-none ${isTarget ? 'text-neon-red' : 'text-white'}`}>
                  {driver.name}
                </td>
                
                {/* Last Lap */}
                <td className="py-2 px-1 text-right text-neon-yellow font-bold truncate">
                  {driver.lastLap}
                </td>
                
                {/* Best Lap */}
                <td className="py-2 px-1 text-right text-neon-green truncate">
                  {driver.bestLap}
                </td>
                
                {/* Gap to Leader */}
                <td className="py-2 px-1 text-right text-gray-400 truncate">
                  {driver.position === 1 ? 'Líd.' : (driver.gapToLeader || '--')}
                </td>
                
                {/* Laps */}
                <td className="py-2 px-1 text-center text-white">
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
  );
};
