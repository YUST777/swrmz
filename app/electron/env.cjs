// Minimal .env loader (no dependency). Loads app/.env.local then app/.env.
const fs = require('fs');
const path = require('path');

function parseAndApply(file) {
  if (!fs.existsSync(file)) return;
  const text = fs.readFileSync(file, 'utf8');
  for (const raw of text.split('\n')) {
    const line = raw.trim();
    if (!line || line.startsWith('#')) continue;
    const eq = line.indexOf('=');
    if (eq === -1) continue;
    const key = line.slice(0, eq).trim();
    let val = line.slice(eq + 1).trim();
    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
      val = val.slice(1, -1);
    }
    if (!(key in process.env)) process.env[key] = val;
  }
}

function load() {
  const dir = path.join(__dirname, '..');
  parseAndApply(path.join(dir, '.env.local'));
  parseAndApply(path.join(dir, '.env'));
}

module.exports = { load };
