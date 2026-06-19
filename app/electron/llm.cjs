// LLM client for SWRMZ. Uses an OpenAI-compatible endpoint.
// Backend is configurable (FreeModel preferred, Featherless fallback); the UI
// label shown to users is independent (DISPLAY_MODEL).
const https = require('https');

function _cfg() {
  if (process.env.FREEMODEL_API_KEY) {
    return {
      base: process.env.FREEMODEL_BASE || 'https://api.freemodel.dev/v1',
      key: process.env.FREEMODEL_API_KEY,
      model: process.env.FREEMODEL_MODEL || 'claude-sonnet-4-6',
    };
  }
  if (process.env.FEATHERLESS_API_KEY) {
    return {
      base: 'https://api.featherless.ai/v1',
      key: process.env.FEATHERLESS_API_KEY,
      model: process.env.FEATHERLESS_MODEL || 'Qwen/Qwen3-Coder-Next',
    };
  }
  return null;
}

function enabled() {
  return !!_cfg();
}

// Label shown in the UI (independent of the actual backend).
function model() {
  return process.env.DISPLAY_MODEL || process.env.FEATHERLESS_MODEL || 'Qwen3-Coder-Next';
}

/** OpenAI-compatible chat. messages = [{role, content}]. Never throws. */
function chat(messages, { maxTokens = 320, temperature = 0.2 } = {}) {
  return new Promise((resolve) => {
    const cfg = _cfg();
    if (!cfg) return resolve(null);
    const payload = JSON.stringify({ model: cfg.model, messages, max_tokens: maxTokens, temperature });
    const req = https.request(
      `${cfg.base}/chat/completions`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${cfg.key}`,
          'Content-Length': Buffer.byteLength(payload),
        },
        timeout: 90000,
      },
      (res) => {
        let b = '';
        res.on('data', (c) => (b += c));
        res.on('end', () => {
          try {
            const j = JSON.parse(b);
            const t = j?.choices?.[0]?.message?.content;
            resolve(typeof t === 'string' ? t.trim() : null);
          } catch {
            resolve(null);
          }
        });
      },
    );
    req.on('error', () => resolve(null));
    req.on('timeout', () => {
      req.destroy();
      resolve(null);
    });
    req.write(payload);
    req.end();
  });
}

module.exports = { chat, enabled, model };
