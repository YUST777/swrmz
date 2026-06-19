// Bridge: the SWRMZ desktop app drives the REAL Band agents.
// The app authenticates as an "Operator" agent (its own Band identity), creates a
// room, recruits the 3 worker agents, posts the scan request, and reads the full
// transcript back via the diagnostics endpoint. This makes the app the front-end
// for genuine through-Band coordination.
const https = require('https');

const BASE = process.env.BAND_AGENT_BASE || 'https://app.band.ai/api/v1/agent';

function enabled() {
  return !!process.env.BAND_OPERATOR_KEY;
}

function request(method, p, body) {
  return requestWith(process.env.BAND_OPERATOR_KEY, method, p, body);
}

function requestWith(key, method, p, body) {
  return new Promise((resolve) => {
    if (!key) return resolve({ ok: false, status: 0 });
    const data = body ? JSON.stringify(body) : null;
    const req = https.request(
      `${BASE}${p}`,
      {
        method,
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': key,
          ...(data ? { 'Content-Length': Buffer.byteLength(data) } : {}),
        },
        timeout: 20000,
      },
      (res) => {
        let b = '';
        res.on('data', (c) => (b += c));
        res.on('end', () => {
          let json = null;
          try {
            json = JSON.parse(b);
          } catch {
            /* ignore */
          }
          resolve({ ok: res.statusCode < 300, status: res.statusCode, json });
        });
      },
    );
    req.on('error', () => resolve({ ok: false, status: 0 }));
    req.on('timeout', () => {
      req.destroy();
      resolve({ ok: false, status: 0 });
    });
    if (data) req.write(data);
    req.end();
  });
}

/** Find the 3 SWRMZ worker agents in the operator's peer network. */
async function findWorkers() {
  const r = await request('GET', '/peers');
  const peers = r.json?.data || [];
  const pick = (suffix) => peers.find((p) => (p.handle || '').endsWith(suffix) && p.type === 'Agent');
  return {
    analyst: pick('swrmz-analyst'),
    fixer: pick('swrmz-fixer'),
    reviewer: pick('swrmz-reviewer'),
  };
}

/** Create a fresh room, recruit the 3 agents, and post the scan request. Returns {chatId}. */
async function startBandScan(repoPath) {
  const workers = await findWorkers();
  const missing = Object.entries(workers)
    .filter(([, worker]) => !worker)
    .map(([role]) => `SWRMZ ${role[0].toUpperCase()}${role.slice(1)}`);
  if (missing.length) {
    throw new Error(`Band worker peer${missing.length === 1 ? '' : 's'} not found: ${missing.join(', ')}`);
  }

  const created = await request('POST', '/chats', { chat: {} });
  const chatId = created.json?.data?.id;
  if (!chatId) throw new Error('Could not create Band room');

  const participants = [workers.analyst, workers.fixer, workers.reviewer];
  for (const w of participants) {
    await request('POST', `/chats/${chatId}/participants`, { participant: { participant_id: w.id } });
  }

  await request('POST', `/chats/${chatId}/messages`, {
    message: {
      content: `@${workers.analyst.name} scan ${repoPath}`,
      mentions: [{ id: workers.analyst.id, name: workers.analyst.name, handle: workers.analyst.handle }],
    },
  });

  return {
    chatId,
    participants: participants.map((w) => ({ id: w.id, name: w.name, handle: w.handle })),
  };
}

/** Pull the full room transcript by merging the 3 worker agents' /context views
 * (each sees its own + mentioned messages; the union is the whole chain),
 * resolving @[[id]] mentions to names. Falls back to the operator's view. */
async function getTranscript(chatId) {
  const workerKeys = [
    process.env.BAND_ANALYST_KEY,
    process.env.BAND_FIXER_KEY,
    process.env.BAND_REVIEWER_KEY,
  ].filter(Boolean);

  const byId = new Map();
  const sources = workerKeys.length
    ? workerKeys.map((k) => ({ key: k, path: `/chats/${chatId}/context` }))
    : [{ key: process.env.BAND_OPERATOR_KEY, path: `/chats/${chatId}/messages?status=all` }];

  for (const src of sources) {
    const r = await requestWith(src.key, 'GET', src.path);
    for (const m of r.json?.data || []) {
      if (!byId.has(m.id)) byId.set(m.id, m);
    }
  }

  const rows = [...byId.values()].sort((a, b) => (a.inserted_at || '').localeCompare(b.inserted_at || ''));
  return rows.map((m) => {
    const mentions = m.metadata?.mentions || [];
    let content = m.content || '';
    for (const mn of mentions) content = content.split(`@[[${mn.id}]]`).join(`@${mn.name}`);
    content = content.replace(/@\[\[[0-9a-f-]+\]\]/gi, '@agent');
    return {
      id: m.id,
      sender: m.sender_name || 'agent',
      senderId: m.sender_id || '',
      content,
      type: m.message_type || 'text',
      at: m.inserted_at || '',
    };
  });
}

async function whoami() {
  return request('GET', '/me');
}

module.exports = { enabled, startBandScan, getTranscript, findWorkers, whoami };
