/**
 * Runs before `npm start` (via "prestart" in package.json).
 * Detects the local network IPv4 address and writes:
 *   REACT_APP_QR_BASE_URL  – encodes network URL into QR codes
 *   REACT_APP_API_URL      – points the frontend API client at the network backend
 * to .env.local so phones on the same WiFi can reach both the app and backend.
 */
const os = require('os');
const fs = require('fs');
const path = require('path');

const FRONTEND_PORT = process.env.PORT || 3001;
const BACKEND_PORT  = 3000; // Express backend port

function getNetworkIP() {
  const interfaces = os.networkInterfaces();
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name]) {
      if (iface.family === 'IPv4' && !iface.internal) {
        return iface.address;
      }
    }
  }
  return 'localhost';
}

const ip          = getNetworkIP();
const frontendUrl = `http://${ip}:${FRONTEND_PORT}`;
const backendUrl  = `http://${ip}:${BACKEND_PORT}`;

const envLocalPath = path.join(__dirname, '..', '.env.local');

// Read existing .env.local (if any), strip our managed lines, re-append
let contents = '';
if (fs.existsSync(envLocalPath)) {
  contents = fs.readFileSync(envLocalPath, 'utf8');
  contents = contents
    .replace(/^REACT_APP_QR_BASE_URL=.*$/m, '')
    .replace(/^REACT_APP_API_URL=.*$/m, '')
    .trim();
  if (contents) contents += '\n';
}

contents += `REACT_APP_QR_BASE_URL=${frontendUrl}\n`;
contents += `REACT_APP_API_URL=${backendUrl}\n`;
fs.writeFileSync(envLocalPath, contents);

console.log(`\n📡 HaldiChain network URLs set:`);
console.log(`   Frontend (QR):  ${frontendUrl}`);
console.log(`   Backend  (API): ${backendUrl}`);
console.log(`   Phones on the same WiFi can now scan QR codes and load all data.\n`);
