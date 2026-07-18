/**
 * Fake Apex Timing Server
 * 
 * Réplica EXACTA del protocolo de Apex Timing para pruebas.
 * 
 * Componentes replicados:
 * 1. config.js        → GET /kartodromo-lucas-guerrero/javascript/config.js
 * 2. WebSocket (ws)   → ws://localhost:{configPort+2}/
 * 3. HTTP Polling      → GET /commonv2/functions/live_ajax.php?...
 * 
 * Protocolo de datos (idéntico al real):
 * - Mensajes separados por \n
 * - Cada línea: "id|css_class|html_content"
 * - init|r  → Inicio de sesión tipo carrera
 * - init|q  → Inicio de sesión tipo qualifying
 * - grid||<table HTML con <tr data-id="X">...</tr>>  → Tabla de clasificación
 * - dyn1||<html>  → Info dinámica 1 (nombre sesión)
 * - dyn2||<html>  → Info dinámica 2 (tiempo restante)
 * - title1||<html> → Título del circuito
 * - title2||<html> → Título de la sesión
 */

import { WebSocketServer } from 'ws';
import http from 'http';

// ====== Configuration (same as real Kartódromo Lucas Guerrero) ======
const CONFIG_PORT = 9950;
const WS_PORT = CONFIG_PORT + 2;   // 9952 — same as real Apex
const HTTP_PORT = 8080;            // HTTP server for config.js + polling

// ====== Simulated Drivers ======
const DRIVER_NAMES = [
  'ALEJANDRO G.', 'CARLOS M.', 'PABLO R.', 'SERGIO L.',
  'DANIEL F.', 'MARIO V.', 'JORGE S.', 'ADRIAN P.',
  'LUCAS H.', 'DAVID T.'
];

const KART_NUMBERS = ['07', '12', '23', '34', '45', '56', '67', '78', '89', '91'];
const KART_COLORS = ['#FF4136', '#0074D9', '#2ECC40', '#FF851B', '#B10DC9',
                     '#FFDC00', '#01FF70', '#7FDBFF', '#F012BE', '#85144b'];

// Base lap time in seconds (around 38s for a kart track)
const BASE_LAP_TIME = 38.0;

// ====== Race State ======
let drivers = [];
let sessionTimeLeftSec = 0;
let sessionName = '';
let sessionNumber = 0;
let raceInterval = null;
let gridInterval = null;
let dynInterval = null;
let wsClients = new Set();

// HTTP polling state
let pollBuffer = '';    // Accumulated data for HTTP polling clients
let pollInit = 0;
let pollIndex = 0;

// ====== Initialize Drivers ======
function initDrivers() {
  drivers = DRIVER_NAMES.map((name, i) => ({
    id: `r${i + 1}`,
    position: i + 1,
    kartNumber: KART_NUMBERS[i],
    kartColor: KART_COLORS[i],
    name: name,
    laps: 0,
    lastLap: '',
    bestLap: '',
    bestLapSeconds: Infinity,
    totalTime: 0,
    // Each driver has slightly different pace
    pace: BASE_LAP_TIME + (Math.random() * 2.5 - 0.5), // 37.5 - 40.5s range
  }));
}

// ====== Format time mm:ss.SSS ======
function formatLapTime(seconds) {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  if (mins > 0) {
    return `${mins}:${secs.toFixed(3).padStart(6, '0')}`;
  }
  return secs.toFixed(3);
}

// ====== Format session countdown mm:ss ======
function formatCountdown(totalSeconds) {
  const mins = Math.floor(totalSeconds / 60);
  const secs = Math.floor(totalSeconds % 60);
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}

// ====== Format gap +X.XXX ======
function formatGap(seconds) {
  if (seconds <= 0) return '';
  return `+${seconds.toFixed(3)}`;
}

// ====== Generate a realistic lap time with variance ======
function generateLapTime(driver) {
  // Random variance: ±1.5 seconds from driver's base pace
  const variance = (Math.random() * 3.0) - 1.5;
  return driver.pace + variance;
}

// ====== Simulate one "tick" of the race (every ~2 seconds) ======
function simulateRaceTick() {
  // Each tick, some drivers complete a lap
  for (const driver of drivers) {
    // Simulate whether this driver completes a lap this tick
    // Average lap ~38s, tick every 2s, so ~5% chance per tick
    const chanceToCrossLine = 2.0 / driver.pace;
    if (Math.random() < chanceToCrossLine) {
      const lapTime = generateLapTime(driver);
      driver.laps++;
      driver.totalTime += lapTime;
      driver.lastLap = formatLapTime(lapTime);
      
      if (lapTime < driver.bestLapSeconds) {
        driver.bestLapSeconds = lapTime;
        driver.bestLap = formatLapTime(lapTime);
      }
    }
  }

  // Re-sort by laps (desc) then total time (asc) — like a real race
  drivers.sort((a, b) => {
    if (b.laps !== a.laps) return b.laps - a.laps;
    return a.totalTime - b.totalTime;
  });

  // Update positions and calculate gaps
  const leader = drivers[0];
  for (let i = 0; i < drivers.length; i++) {
    drivers[i].position = i + 1;
  }
}

// ====== BUILD THE GRID HTML — exact copy of Apex Timing format ======
function buildGridMessage() {
  // This replicates the EXACT HTML structure that Apex Timing sends
  // The parser in apexTimingService.js expects:
  //   <tr data-id="..."> <td>pos</td> <td>kart</td> <td>name</td> <td>laps</td> <td>lastLap</td> <td>bestLap</td> <td>gap</td> </tr>

  let tableHtml = '<table id="tgrid"><tbody>';

  // Header row (Apex Timing sends this too, but without data-id, so it gets skipped)
  tableHtml += '<tr class="head"><td>Pos</td><td>Kart</td><td>Driver</td><td>Laps</td><td>Last Lap</td><td>Best Lap</td><td>Gap</td></tr>';

  const leader = drivers[0];

  for (const d of drivers) {
    // Calculate gap to leader
    let gapStr = '';
    if (d.position === 1) {
      gapStr = '';
    } else if (d.laps < leader.laps) {
      const lapDiff = leader.laps - d.laps;
      gapStr = `+${lapDiff} vuelta${lapDiff > 1 ? 's' : ''}`;
    } else {
      const gap = d.totalTime - leader.totalTime;
      gapStr = formatGap(Math.abs(gap));
    }

    // CSS class for best lap highlighting (Apex uses "best_lap" class)
    const lastLapClass = d.lastLap === d.bestLap && d.lastLap !== '' ? 'best_lap' : '';

    tableHtml += `<tr data-id="${d.id}">`;
    tableHtml += `<td class="pos">${d.position}</td>`;
    tableHtml += `<td class="kart"><span style="background-color:${d.kartColor}">${d.kartNumber}</span></td>`;
    tableHtml += `<td class="driver">${d.name}</td>`;
    tableHtml += `<td class="laps">${d.laps}</td>`;
    tableHtml += `<td class="last_lap ${lastLapClass}">${d.lastLap}</td>`;
    tableHtml += `<td class="best_lap">${d.bestLap}</td>`;
    tableHtml += `<td class="gap">${gapStr}</td>`;
    tableHtml += '</tr>';
  }

  tableHtml += '</tbody></table>';

  // Apex format: "grid||<html>"
  return `grid||${tableHtml}`;
}

// ====== BUILD DYN1 MESSAGE — session name ======
function buildDyn1Message() {
  // Apex format: "dyn1||<span class='dyn_content'>Session Name</span>"
  return `dyn1||<span class="dyn_content">${sessionName}</span>`;
}

// ====== BUILD DYN2 MESSAGE — time remaining ======
function buildDyn2Message() {
  // Apex format: "dyn2||<span class='countdown'>mm:ss</span>"
  const timeStr = formatCountdown(sessionTimeLeftSec);
  return `dyn2||<span class="countdown">${timeStr}</span>`;
}

// ====== BUILD INIT MESSAGE ======
function buildInitMessage() {
  // "init|r" for race, "init|q" for qualifying
  return 'init|r';
}

// ====== BUILD TITLE MESSAGES ======
function buildTitle1Message() {
  return 'title1||<span>Kartódromo Lucas Guerrero (SIMULADO)</span>';
}

function buildTitle2Message() {
  return `title2||<span>${sessionName}</span>`;
}

// ====== Broadcast raw Apex protocol data to all WS clients ======
function broadcastApexData(data) {
  // Also add to HTTP polling buffer
  pollBuffer += data;
  pollIndex++;

  for (const client of wsClients) {
    if (client.readyState === 1) { // WebSocket.OPEN
      client.send(data);
    }
  }
}

// ====== Start a new race session ======
function startNewSession() {
  sessionNumber++;
  sessionName = `Tanda ${sessionNumber} - Simulada`;
  sessionTimeLeftSec = 10 * 60; // 10 minutes per session

  console.log(`\n🏁 [Fake Apex] New session: "${sessionName}" (${formatCountdown(sessionTimeLeftSec)})`);

  // Reset drivers
  initDrivers();

  // Send init message (exactly like real Apex)
  const initMsg = buildInitMessage();
  const title1Msg = buildTitle1Message();
  const title2Msg = buildTitle2Message();

  // Apex sends all of these as separate lines in one message
  broadcastApexData(`${initMsg}\n${title1Msg}\n${title2Msg}\n`);

  // Wait a beat, then send the first grid
  setTimeout(() => {
    const gridMsg = buildGridMessage();
    const dyn1Msg = buildDyn1Message();
    const dyn2Msg = buildDyn2Message();
    broadcastApexData(`${dyn1Msg}\n${dyn2Msg}\n${gridMsg}\n`);
  }, 500);

  // Clear old intervals
  if (raceInterval) clearInterval(raceInterval);
  if (gridInterval) clearInterval(gridInterval);
  if (dynInterval) clearInterval(dynInterval);

  // Simulate race: update every 2 seconds
  raceInterval = setInterval(() => {
    simulateRaceTick();
  }, 2000);

  // Send grid update every 3 seconds (like real Apex)
  gridInterval = setInterval(() => {
    const gridMsg = buildGridMessage();
    broadcastApexData(`${gridMsg}\n`);
  }, 3000);

  // Send dyn (countdown) update every 1 second
  dynInterval = setInterval(() => {
    sessionTimeLeftSec--;

    if (sessionTimeLeftSec <= 0) {
      // Session ended, start a new one after a 10-second break
      console.log(`🏁 [Fake Apex] Session "${sessionName}" finished!`);
      clearInterval(raceInterval);
      clearInterval(gridInterval);
      clearInterval(dynInterval);

      // Send final grid
      const finalGrid = buildGridMessage();
      broadcastApexData(`${finalGrid}\n`);

      setTimeout(() => {
        startNewSession();
      }, 10000); // 10 second pause between sessions
      return;
    }

    const dyn2Msg = buildDyn2Message();
    broadcastApexData(`${dyn2Msg}\n`);
  }, 1000);
}

// ====== HTTP Server (serves config.js + polling endpoint) ======
const httpServer = http.createServer((req, res) => {
  // CORS headers (Apex Timing also allows cross-origin)
  res.setHeader('Access-Control-Allow-Origin', '*');

  // Serve config.js — EXACT same format as the real one
  if (req.url?.includes('/javascript/config.js')) {
    res.writeHead(200, { 'Content-Type': 'application/javascript' });
    res.end(`\ufeffvar configPort = ${CONFIG_PORT};\r
var configGMT = 1;\r
var fullscreen = true;\r
var title = 'Kartodromo Lucas Guerrero (SIMULADO)';\r
var logo_title = 'Fake Apex Timing Server';\r
var meta_description = '';\r
var google_analytics = '';\r
var use_kartcom_photo = false;\r
var use_sws_photo = false;\r
var driver_photo_url = '';\r
`);
    return;
  }

  // HTTP Polling endpoint — EXACT same format as real Apex
  // URL: /commonv2/functions/live_ajax.php?version=2.01.12&init=X&index=Y&port=P&counter=N&duration=T&id=ID&ignored=0
  if (req.url?.includes('live_ajax.php')) {
    const urlObj = new URL(req.url, `http://localhost:${HTTP_PORT}`);
    const clientInit = parseInt(urlObj.searchParams.get('init') || '0', 10);
    const clientIndex = parseInt(urlObj.searchParams.get('index') || '0', 10);

    // Build response in Apex format: "init@index@data"
    // If client is fresh (init=0), send full state
    let responseData = '';
    if (clientInit === 0) {
      // Full refresh: send init + grid + dyn
      responseData = `${buildInitMessage()}\n${buildTitle1Message()}\n${buildTitle2Message()}\n${buildDyn1Message()}\n${buildDyn2Message()}\n${buildGridMessage()}\n`;
    } else {
      // Incremental: just send latest grid + dyn2
      responseData = `${buildDyn2Message()}\n${buildGridMessage()}\n`;
    }

    // Apex format: "newInit@newIndex@data"
    const response = `1@${pollIndex}@${responseData}`;

    res.writeHead(200, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end(response);
    return;
  }

  // Default: serve a simple status page
  res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
  res.end(`
    <html>
      <body style="background:#111;color:#0f0;font-family:monospace;padding:40px;">
        <h1>🏎️ Fake Apex Timing Server</h1>
        <p>Simulando: <strong>${sessionName || 'Iniciando...'}</strong></p>
        <p>Tiempo restante: <strong>${formatCountdown(sessionTimeLeftSec)}</strong></p>
        <p>Pilotos: <strong>${drivers.length}</strong></p>
        <p>WebSocket clients: <strong>${wsClients.size}</strong></p>
        <hr>
        <p>WebSocket: <code>ws://localhost:${WS_PORT}/</code></p>
        <p>Config.js: <code>http://localhost:${HTTP_PORT}/kartodromo-lucas-guerrero/javascript/config.js</code></p>
        <p>HTTP Polling: <code>http://localhost:${HTTP_PORT}/commonv2/functions/live_ajax.php</code></p>
      </body>
    </html>
  `);
});

// ====== WebSocket Server (port 9952 = configPort + 2, exact same as real Apex) ======
const wss = new WebSocketServer({ port: WS_PORT, host: '0.0.0.0' });

wss.on('connection', (ws) => {
  console.log(`📡 [Fake Apex] WebSocket client connected (total: ${wsClients.size + 1})`);
  wsClients.add(ws);

  // Send full state to new client immediately (like real Apex does)
  const fullState = [
    buildInitMessage(),
    buildTitle1Message(),
    buildTitle2Message(),
    buildDyn1Message(),
    buildDyn2Message(),
    buildGridMessage(),
  ].join('\n');

  ws.send(fullState + '\n');

  ws.on('close', () => {
    wsClients.delete(ws);
    console.log(`📡 [Fake Apex] WebSocket client disconnected (total: ${wsClients.size})`);
  });

  ws.on('error', (err) => {
    console.error(`[Fake Apex] WS Error: ${err.message}`);
    wsClients.delete(ws);
  });
});

// ====== Start Everything ======
httpServer.listen(HTTP_PORT, '0.0.0.0', () => {
  console.log(`
╔══════════════════════════════════════════════════════╗
║          🏎️  FAKE APEX TIMING SERVER  🏎️            ║
╠══════════════════════════════════════════════════════╣
║                                                      ║
║  Protocolo EXACTO de Apex Timing replicado.          ║
║                                                      ║
║  HTTP Server:  http://0.0.0.0:${HTTP_PORT}               ║
║  WebSocket:    ws://0.0.0.0:${WS_PORT}/               ║
║  Config Port:  ${CONFIG_PORT}                              ║
║                                                      ║
║  config.js:                                          ║
║    http://[TU-IP-LOCAL]:${HTTP_PORT}/kartodromo-lucas-guerrero/ ║
║    /javascript/config.js                             ║
║                                                      ║
║  Para conectar desde AppKart en tu móvil:            ║
║    Usa la IP de tu ordenador en lugar de localhost    ║
║    Ej: http://192.168.1.XX:${HTTP_PORT}               ║
║                                                      ║
╚══════════════════════════════════════════════════════╝
`);

  // Start the first session
  startNewSession();
});
