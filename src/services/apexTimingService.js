/**
 * Apex Timing Service - Phase 2 (Client-Side Direct Connection)
 * 
 * This service connects DIRECTLY from your browser (mobile phone or computer)
 * to Apex Timing's WebSocket servers. It eliminates the need for any backend 
 * proxy server, making the app 100% standalone!
 * 
 * Apex Timing WebSocket Protocol:
 * - Host: www.apex-timing.com
 * - Secure WebSocket Port: configPort + 3 (e.g. 9950 + 3 = 9953)
 * - Format: Lines separated by \n, fields separated by | (id|cssClass|content)
 * - "grid" contains the full timing HTML table
 * - "dyn1"/"dyn2" contain session state and time remaining
 */
import { useRaceStore } from '../store/useRaceStore';

let ws = null;
let reconnectTimer = null;

// Temporary state to hold parser results
let currentState = {
  sessionTimeLeft: '--:--',
  sessionLapsLeft: null,
  drivers: [],
};

/**
 * Parses the HTML timing table sent by Apex Timing.
 */
function parseGridHtml(html) {
  const drivers = [];
  const trRegex = /<tr[^>]*data-id="([^"]*)"[^>]*>([\s\S]*?)<\/tr>/gi;
  let trMatch;
  
  while ((trMatch = trRegex.exec(html)) !== null) {
    const rowId = trMatch[1];
    const rowContent = trMatch[2];
    
    if (!rowContent || rowContent.includes('progress_lap')) continue;
    
    const cells = [];
    const tdRegex = /<td[^>]*>([\s\S]*?)<\/td>/gi;
    let tdMatch;
    while ((tdMatch = tdRegex.exec(rowContent)) !== null) {
      let text = tdMatch[1].replace(/<[^>]*>/g, '').trim();
      cells.push(text);
    }
    
    if (cells.length < 3) continue;
    
    // Position | Kart# | Name | Laps | Last Lap | Best Lap | Gap
    const driver = {
      id: rowId,
      position: parseInt(cells[0], 10) || 0,
      kartNumber: cells[1] || '',
      name: cells[2] || '',
      laps: parseInt(cells[3], 10) || 0,
      lastLap: cells[4] || '--:--',
      bestLap: cells[5] || '--:--',
      gapToLeader: cells[6] || '',
      gapAhead: '',
      gapBehind: '',
    };
    
    if (driver.position > 0 && driver.name) {
      drivers.push(driver);
    }
  }
  
  drivers.sort((a, b) => a.position - b.position);
  
  // Calculate relative gaps
  for (let i = 0; i < drivers.length; i++) {
    if (i > 0) {
      drivers[i].gapAhead = drivers[i].gapToLeader || '';
    }
    if (i < drivers.length - 1) {
      drivers[i].gapBehind = drivers[i + 1].gapToLeader || '';
    }
  }
  
  return drivers;
}

/**
 * Processes a single line of Apex Timing WebSocket protocol.
 */
function processApexLine(line) {
  const parts = line.split('|');
  if (parts.length < 1) return;
  
  const id = parts[0];
  const cssClass = parts.length >= 2 ? parts[1] : '';
  const content = parts.length >= 3 ? parts.slice(2).join('|') : '';
  
  if (id === 'init') {
    currentState.drivers = [];
    return;
  }
  
  if (id === 'grid') {
    const drivers = parseGridHtml(content);
    if (drivers.length > 0) {
      currentState.drivers = drivers;
      updateStoreData();
    }
    return;
  }
  
  if (id === 'dyn1' || id === 'dyn2') {
    const text = content.replace(/<[^>]*>/g, '').trim();
    if (text) {
      const timeMatch = text.match(/(\d{1,2}:\d{2}(?::\d{2})?)/);
      if (timeMatch) {
        currentState.sessionTimeLeft = timeMatch[1];
        updateStoreData();
      }
      
      const lapMatch = text.match(/(\d+)\s*(?:laps?|vueltas?|tours?)/i);
      if (lapMatch) {
        currentState.sessionLapsLeft = parseInt(lapMatch[1], 10);
        updateStoreData();
      }
    }
  }
}

function processApexData(data) {
  const lines = data.split('\n');
  for (const line of lines) {
    if (line.trim()) {
      processApexLine(line.trim());
    }
  }
}

/**
 * Updates the Zustand store with parsed timing data.
 */
function updateStoreData() {
  const store = useRaceStore.getState();
  const targetName = store.targetDriverName;
  
  if (!currentState.drivers || currentState.drivers.length === 0) {
    // If no driver data yet, just update session timer
    useRaceStore.setState({
      sessionTimeLeft: currentState.sessionTimeLeft,
      sessionLapsLeft: currentState.sessionLapsLeft,
    });
    return;
  }
  
  // Find the target driver
  const me = currentState.drivers.find(d => 
    d.name.toLowerCase().includes(targetName.toLowerCase()) ||
    targetName.toLowerCase().includes(d.name.toLowerCase())
  );
  
  if (me) {
    const myPos = me.position;
    const leader = currentState.drivers.find(d => d.position === 1);
    const ahead = currentState.drivers.find(d => d.position === myPos - 1);
    const behind = currentState.drivers.find(d => d.position === myPos + 1);
    
    useRaceStore.setState({
      sessionTimeLeft: currentState.sessionTimeLeft || '--:--',
      sessionLapsLeft: currentState.sessionLapsLeft,
      lastLap: me.lastLap || '--:--',
      bestLap: me.bestLap || '--:--',
      currentDriverLaps: me.laps || store.currentDriverLaps,
      leaderGap: leader && me.position !== 1 ? (me.gapToLeader || '+0.000') : 'LÍDER',
      gapAhead: ahead ? (me.gapAhead || ahead.gapToLeader || '--') : '--',
      gapBehind: behind ? (behind.gapToLeader || '--') : '--',
    });
  } else {
    useRaceStore.setState({
      sessionTimeLeft: currentState.sessionTimeLeft || '--:--',
      sessionLapsLeft: currentState.sessionLapsLeft,
    });
  }
}

/**
 * Establishes connection to the Apex Timing WebSocket.
 * Supports both:
 *   - Real Apex: wss://www.apex-timing.com:{configPort+3}/
 *   - Local fake: ws://localhost:{configPort+2}/
 */
const connectWebSocket = (wsUrl) => {
  console.log(`[ApexService] Connecting to ${wsUrl}`);
  
  try {
    ws = new WebSocket(wsUrl);
    
    ws.onopen = () => {
      console.log('[ApexService] WebSocket connected successfully!');
    };
    
    ws.onmessage = (event) => {
      processApexData(event.data);
    };
    
    ws.onerror = (err) => {
      console.error('[ApexService] WebSocket connection error:', err);
    };
    
    ws.onclose = () => {
      console.log('[ApexService] WebSocket closed. Reconnecting in 5s...');
      reconnectTimer = setTimeout(() => connectWebSocket(wsUrl), 5000);
    };
  } catch (err) {
    console.error('[ApexService] Error starting WebSocket:', err);
    reconnectTimer = setTimeout(() => connectWebSocket(wsUrl), 5000);
  }
};

export const startApexTimingService = (apexUrl, port = 9950) => {
  stopApexTimingService();
  
  // Clean up state
  currentState = {
    sessionTimeLeft: '--:--',
    sessionLapsLeft: null,
    drivers: [],
  };
  
  let wsUrl;
  
  // If the URL explicitly starts with ws:// or wss://, use it directly
  if (apexUrl.startsWith('ws://') || apexUrl.startsWith('wss://')) {
    wsUrl = apexUrl;
  }
  // Otherwise, check if it's an HTTP URL and extract the hostname
  else if (apexUrl.startsWith('http://') || apexUrl.startsWith('https://')) {
    try {
      const url = new URL(apexUrl);
      const hostname = url.hostname;
      
      // Check if it's localhost or a local network IP (192.168.x.x, 10.x.x.x, 172.16-31.x.x)
      const isLocalIp = hostname === 'localhost' || 
                        hostname === '127.0.0.1' || 
                        hostname.startsWith('192.168.') || 
                        hostname.startsWith('10.') || 
                        /^172\.(1[6-9]|2[0-9]|3[0-1])\./.test(hostname);
                        
      if (isLocalIp) {
        wsUrl = `ws://${hostname}:${port + 2}/`;
      } else {
        wsUrl = `wss://www.apex-timing.com:${port + 3}/`;
      }
    } catch (e) {
      console.error('[ApexService] Failed to parse URL:', e);
      wsUrl = `wss://www.apex-timing.com:${port + 3}/`;
    }
  }
  // Default fallback
  else {
    wsUrl = `wss://www.apex-timing.com:${port + 3}/`;
  }
  
  connectWebSocket(wsUrl);
};

export const stopApexTimingService = () => {
  if (ws) {
    ws.close();
    ws = null;
  }
  if (reconnectTimer) {
    clearTimeout(reconnectTimer);
    reconnectTimer = null;
  }
};
