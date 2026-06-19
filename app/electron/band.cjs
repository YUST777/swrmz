// Band coordination layer — real REST Request API (Client → Platform).
// Docs: https://docs.band.ai/api/introduction
//   Agent API base: https://app.band.ai/api/v1/agent
//   Auth header:    X-API-Key: <agent api key>
//   POST /agent/chats/{id}/messages  -> text messages (@mentions = handoffs)
//   POST /agent/chats/{id}/events    -> tool calls / thoughts / findings
//
// Gated on env (BAND_API_KEY + BAND_CHAT_ID). When absent, all calls no-op,
// so the local scan workflow still runs without a Band account.
const https = require('https');

const BASE = process.env.BAND_AGENT_BASE || 'https://app.band.ai/api/v1/agent';

function enabled() {
  return !!process.env.BAND_API_KEY && !!process.env.BAND_CHAT_ID;
}

function request(method, p, payload) {
  return new Promise((resolve) => {
    const key = process.env.BAND_API_KEY;
    if (!key) return resolve({ ok: false });
    const data = payload ? JSON.stringify(payload) : null;
    const url = new URL(`${BASE}${p}`);
    const req = https.request(
      url,
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
        let body = '';
        res.on('data', (c) => (body += c));
        res.on('end', () => {
          let json = null;
          try {
            json = JSON.parse(body);
          } catch {
            /* ignore */
          }
          resolve({ ok: res.statusCode < 400, status: res.statusCode, json });
        });
      },
    );
    req.on('error', () => resolve({ ok: false }));
    req.on('timeout', () => {
      req.destroy();
      resolve({ ok: false });
    });
    if (data) req.write(data);
    req.end();
  });
}

/** Validate the connection / identity. GET /agent/me */
function whoami() {
  return request('GET', '/me');
}

/** Post a text message into the room (use @mentions to hand off). */
function sendMessage(text) {
  if (!enabled()) return Promise.resolve({ ok: false });
  const chatId = process.env.BAND_CHAT_ID;
  return request('POST', `/chats/${chatId}/messages`, { content: text });
}

/** Post a structured event (tool call / thought / finding). */
function sendEvent(type, data) {
  if (!enabled()) return Promise.resolve({ ok: false });
  const chatId = process.env.BAND_CHAT_ID;
  return request('POST', `/chats/${chatId}/events`, { type, data });
}

module.exports = { enabled, whoami, sendMessage, sendEvent };
