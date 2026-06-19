#!/usr/bin/env node
require('./env.cjs').load();

const fs = require('fs');
const os = require('os');
const path = require('path');
const bandBridge = require('./band_bridge.cjs');

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

function makeFixture() {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'swrmz-band-flow-'));
  fs.writeFileSync(
    path.join(dir, 'package.json'),
    JSON.stringify({ name: 'swrmz-band-flow', version: '1.0.0', type: 'commonjs' }),
  );
  fs.writeFileSync(
    path.join(dir, 'server.js'),
    [
      "const express = require('express');",
      "const { exec } = require('child_process');",
      'const app = express();',
      '',
      "app.get('/ping', (req, res) => {",
      "  const host = req.query.host || '127.0.0.1';",
      '  exec(`ping -c 1 ${host}`, (err, stdout) => {',
      '    res.send(stdout || String(err));',
      '  });',
      '});',
      '',
    ].join('\n'),
  );
  return dir;
}

function seen(rows, name) {
  return rows.some((row) => String(row.sender || '').toLowerCase().includes(name));
}

async function main() {
  if (!bandBridge.enabled()) {
    throw new Error('BAND_OPERATOR_KEY is not configured');
  }

  const repoPath = process.argv[2] || makeFixture();
  const workers = await bandBridge.findWorkers();
  const workerStatus = Object.fromEntries(Object.entries(workers).map(([role, worker]) => [role, !!worker]));
  if (!workerStatus.analyst || !workerStatus.fixer || !workerStatus.reviewer) {
    throw new Error(`Missing Band worker peers: ${JSON.stringify(workerStatus)}`);
  }

  const started = await bandBridge.startBandScan(repoPath);
  let rows = [];
  for (let i = 0; i < Number(process.env.BAND_SMOKE_POLLS || 24); i += 1) {
    await wait(Number(process.env.BAND_SMOKE_INTERVAL_MS || 5000));
    rows = await bandBridge.getTranscript(started.chatId);
    if (seen(rows, 'analyst') && seen(rows, 'fixer') && seen(rows, 'reviewer')) break;
  }

  const summary = {
    repoPath,
    chatId: started.chatId,
    participants: started.participants?.map((p) => p.name || p.handle).filter(Boolean) || [],
    transcriptMessages: rows.length,
    senders: [...new Set(rows.map((row) => row.sender))],
    completeBandChain: seen(rows, 'operator') && seen(rows, 'analyst') && seen(rows, 'fixer') && seen(rows, 'reviewer'),
  };
  console.log(JSON.stringify(summary, null, 2));
  if (!summary.completeBandChain) process.exit(1);
}

main().catch((err) => {
  console.error(err?.stack || err);
  process.exit(1);
});
