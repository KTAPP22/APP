import { WebSocketServer, WebSocket } from 'ws';
import http from 'http';
import https from 'https';
import { URL } from 'url';

const PORT = 3001;

/**
 * ApexTimingProxy
 * 
 * Connects to an Apex Timing live timing page, extracts the configPort,
 * then connects via WebSocket to receive real-time data.
 * Parses the proprietary protocol and forwards structured JSON to our frontend.
 * 
 * Apex Timing Protocol:
 * - WebSocket URL: ws(s)://www.apex-timing.com:{configPort+2 or +3}/
 * - HTTP Polling:  .../commonv2/functions/live_ajax.php?...&port={configPort+4}
 * - Data format: lines separated by \n, each line is "id|css_class|html_content"
 * - "grid" message contains the full HTML table of the leaderboard
 * - "init" message signals a new session
 * - "dyn1"/"dyn2" contain dynamic header info (session name, time remaining, etc.)
 */

// ====== State ======
let apexWs = null;
let frontendClients = new Set();
let currentState = {
  sessionInfo: '',
  sessionTimeLeft: '--:--',
  sessionLapsLeft: null,
  drivers: [],
  isRace: false,
  trackName: '',
};

// Parsed from the Apex page
let configPort = null;
let apexHost = 'www.apex-timing.com';

// HTTP polling state
let pollTimer = null;
let pollInit = 0;
let pollIndex = 0;
let pollCounter = 0;
let pollId = Math.floor(1e9 * Math.random()) || 1;

// ====== HTML Table Parser ======

/**
 * Parse the HTML table sent by Apex Timing in the "grid" message.
 * Each row (<tr>) represents a driver/kart.
 * We extract position, kart number, name, laps, last lap, best lap, and gap.
 */
function parseGridHtml(html) {
  const drivers = [];
  // Match each table row
  const trRegex = /<tr[^>]*data-id="([^"]*)"[^>]*>([\s\S]*?)<\/tr>/gi;
  let trMatch;
  
  while ((trMatch = trRegex.exec(html)) !== null) {
    const rowId = trMatch[1];
    const rowContent = trMatch[2];
    
    // Skip header rows, progress bars, etc.
    if (!rowContent || rowContent.includes('progress_lap')) continue;
    
    // Extract all cell contents
    const cells = [];
    const tdRegex = /<td[^>]*>([\s\S]*?)<\/td>/gi;
    let tdMatch;
    while ((tdMatch = tdRegex.exec(rowContent)) !== null) {
      // Strip HTML tags to get text content
      let text = tdMatch[1].replace(/<[^>]*>/g, '').trim();
      cells.push(text);
    }
    
    if (cells.length < 3) continue; // Not a data row
    
    // Apex Timing typical column order (may vary by track):
    // Pos | Kart# | Name | Laps | Last Lap | Best Lap | Gap/Diff
    // Some tracks have different column layouts, we'll do our best
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
  
  // Sort by position
  drivers.sort((a, b) => a.position - b.position);
  
  // Calculate gaps ahead/behind
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

// ====== Apex Timing Protocol Handler ======

/**
 * Process one line of the Apex protocol.
 * Format: "id|css_class|content"
 */
function processApexLine(line) {
  const parts = line.split('|');
  if (parts.length < 1) return;
  
  const id = parts[0];
  const cssClass = parts.length >= 2 ? parts[1] : '';
  const content = parts.length >= 3 ? parts.slice(2).join('|') : '';
  
  if (id === 'init') {
    // New session initialization
    currentState.isRace = cssClass === 'r';
    currentState.drivers = [];
    console.log(`[Apex] Session init. Race mode: ${currentState.isRace}`);
    return;
  }
  
  if (id === 'grid') {
    // Full leaderboard HTML table
    const drivers = parseGridHtml(content);
    if (drivers.length > 0) {
      currentState.drivers = drivers;
      broadcastState();
    }
    return;
  }
  
  if (id === 'dyn1') {
    // Dynamic info 1 - typically session name / time remaining
    const text = content.replace(/<[^>]*>/g, '').trim();
    if (text) {
      currentState.sessionInfo = text;
      // Try to extract time from the text (format like "14:30" or "00:05:30")
      const timeMatch = text.match(/(\d{1,2}:\d{2}(?::\d{2})?)/);
      if (timeMatch) {
        currentState.sessionTimeLeft = timeMatch[1];
      }
    }
    return;
  }
  
  if (id === 'dyn2') {
    // Dynamic info 2 - can also contain time/laps info
    const text = content.replace(/<[^>]*>/g, '').trim();
    if (text) {
      const timeMatch = text.match(/(\d{1,2}:\d{2}(?::\d{2})?)/);
      if (timeMatch) {
        currentState.sessionTimeLeft = timeMatch[1];
      }
      // Check for lap count
      const lapMatch = text.match(/(\d+)\s*(?:laps?|vueltas?|tours?)/i);
      if (lapMatch) {
        currentState.sessionLapsLeft = parseInt(lapMatch[1], 10);
      }
    }
    return;
  }
  
  if (id === 'track') {
    const text = content.replace(/<[^>]*>/g, '').trim();
    currentState.trackName = text;
    return;
  }
  
  // Individual cell updates: "rowId|cssClass|htmlContent"
  // These update individual cells in the table.
  // The id usually maps to "data-id" attributes in the HTML.
  // We handle them by updating the last known state when a full grid refresh comes.
}

/**
 * Process a full message from Apex Timing (may contain multiple lines)
 */
function processApexData(data) {
  const lines = data.split('\n');
  for (const line of lines) {
    if (line.trim()) {
      processApexLine(line.trim());
    }
  }
}

// ====== Broadcast to Frontend ======

function broadcastState() {
  const message = JSON.stringify(currentState);
  for (const client of frontendClients) {
    if (client.readyState === WebSocket.OPEN) {
      client.send(message);
    }
  }
}

// ====== Connect to Apex Timing via WebSocket ======

let usingHttpPolling = false;

function connectApexWebSocket(port) {
  const wsPort = port + 2; // ws uses port+2, wss uses port+3
  const wsUrl = `ws://${apexHost}:${wsPort}/`;
  
  console.log(`[Apex] Connecting via WebSocket to ${wsUrl}...`);
  
  try {
    apexWs = new WebSocket(wsUrl);
    
    apexWs.on('open', () => {
      console.log('[Apex] WebSocket connected!');
      usingHttpPolling = false;
    });
    
    apexWs.on('message', (data) => {
      processApexData(data.toString());
    });
    
    apexWs.on('error', (err) => {
      console.log(`[Apex] WebSocket error: ${err.message}. Falling back to HTTP polling.`);
      usingHttpPolling = true;
      startHttpPolling(port);
    });
    
    apexWs.on('close', () => {
      if (!usingHttpPolling) {
        console.log('[Apex] WebSocket closed. Retrying in 5s...');
        setTimeout(() => connectApexWebSocket(port), 5000);
      }
    });
  } catch (err) {
    console.log(`[Apex] WebSocket failed: ${err.message}. Using HTTP polling.`);
    usingHttpPolling = true;
    startHttpPolling(port);
  }
}

// ====== HTTP Polling Fallback ======

function startHttpPolling(port) {
  if (pollTimer) clearTimeout(pollTimer);
  
  const pollPort = port + 4;
  const baseUrl = `https://live.apex-timing.com/commonv2/functions/live_ajax.php`;
  
  console.log(`[Apex] Starting HTTP polling (port parameter: ${pollPort})...`);
  
  let emptyCount = 0;
  
  function poll() {
    const now = Date.now();
    pollCounter++;
    const url = `${baseUrl}?version=2.01.12&init=${pollInit}&index=${pollIndex}&port=${pollPort}&counter=${pollCounter}&duration=${now}&id=${pollId}&ignored=0`;
    
    https.get(url, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        if (res.statusCode !== 200 || data.length === 0) {
          emptyCount++;
          if (emptyCount <= 3 || emptyCount % 20 === 0) {
            console.log(`[Apex] HTTP poll: No data (status ${res.statusCode}). No hay sesión en vivo. (intento ${emptyCount})`);
          }
          // Poll less frequently when no session is running
          pollTimer = setTimeout(poll, emptyCount > 5 ? 10000 : 5000);
          return;
        }
        
        emptyCount = 0;
        const parts = data.split('@');
        if (parts.length >= 3) {
          pollInit = parts[0];
          pollIndex = parts[1];
          const apexData = parts[2];
          if (apexData !== 'REFRESH_BROWSER') {
            console.log(`[Apex] Data received! (${apexData.length} chars)`);
            processApexData(apexData);
          }
        }
        // Poll again in 5 seconds
        pollTimer = setTimeout(poll, 5000);
      });
    }).on('error', (err) => {
      console.error(`[Apex] HTTP poll error: ${err.message}`);
      pollTimer = setTimeout(poll, 10000);
    });
  }
  
  poll();
}

// ====== Fetch config from Apex Timing page ======

function fetchConfigPort(trackUrl) {
  return new Promise((resolve, reject) => {
    // Extract the track path from the URL
    const urlObj = new URL(trackUrl);
    const trackPath = urlObj.pathname.replace(/\/$/, '');
    const configUrl = `https://live.apex-timing.com${trackPath}/javascript/config.js`;
    
    console.log(`[Apex] Fetching config from ${configUrl}...`);
    
    https.get(configUrl, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        // Parse configPort from the JS file
        const portMatch = data.match(/configPort\s*=\s*(\d+)/);
        if (portMatch) {
          resolve(parseInt(portMatch[1], 10));
        } else {
          reject(new Error('configPort not found in config.js'));
        }
      });
    }).on('error', reject);
  });
}

// ====== Main Server ======

const server = http.createServer((req, res) => {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }
  
  if (req.url === '/health') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ status: 'ok', drivers: currentState.drivers.length }));
    return;
  }
  
  if (req.url === '/state') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(currentState));
    return;
  }
  
  // POST /connect with body { "url": "https://live.apex-timing.com/kartodromo-lucas-guerrero/" }
  if (req.url === '/connect' && req.method === 'POST') {
    let body = '';
    req.on('data', (chunk) => body += chunk);
    req.on('end', async () => {
      try {
        const { url } = JSON.parse(body);
        console.log(`[Server] Connect request for: ${url}`);
        
        // Reset state
        currentState.drivers = [];
        currentState.sessionInfo = '';
        currentState.sessionTimeLeft = '--:--';
        pollInit = 0;
        pollIndex = 0;
        
        // Close existing connections
        if (apexWs) {
          apexWs.close();
          apexWs = null;
        }
        if (pollTimer) {
          clearTimeout(pollTimer);
          pollTimer = null;
        }
        
        const port = await fetchConfigPort(url);
        configPort = port;
        console.log(`[Server] Got configPort: ${port}`);
        
        // Try WebSocket first, fallback to HTTP
        connectApexWebSocket(port);
        
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: true, configPort: port }));
      } catch (err) {
        console.error(`[Server] Connect error: ${err.message}`);
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: err.message }));
      }
    });
    return;
  }
  
  res.writeHead(404);
  res.end('Not found');
});

// Frontend WebSocket server
const wss = new WebSocketServer({ server });

wss.on('connection', (ws) => {
  console.log('[Server] Frontend client connected');
  frontendClients.add(ws);
  
  // Send current state immediately
  ws.send(JSON.stringify(currentState));
  
  ws.on('close', () => {
    frontendClients.delete(ws);
    console.log('[Server] Frontend client disconnected');
  });
  
  ws.on('message', (msg) => {
    try {
      const data = JSON.parse(msg);
      if (data.type === 'connect' && data.url) {
        // Frontend can also request a connection
        console.log(`[Server] Frontend requested connection to: ${data.url}`);
        fetchConfigPort(data.url).then((port) => {
          configPort = port;
          connectApexWebSocket(port);
        }).catch(err => {
          console.error(`[Server] Config fetch error: ${err.message}`);
          // Try HTTP polling with default port
          startHttpPolling(9950);
        });
      }
    } catch (e) {}
  });
});

server.listen(PORT, () => {
  console.log(`\n========================================`);
  console.log(`  AppKart Proxy Server`);
  console.log(`  http://localhost:${PORT}`);
  console.log(`  WebSocket: ws://localhost:${PORT}`);
  console.log(`========================================\n`);
  console.log(`Esperando conexión del frontend...`);
  console.log(`Envía POST /connect con { "url": "https://live.apex-timing.com/tu-circuito/" } para conectar.\n`);
});
