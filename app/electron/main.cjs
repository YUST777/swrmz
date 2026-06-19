// SWRMZ Swarm Control — Electron main process.
const { app, BrowserWindow, ipcMain, dialog, shell } = require('electron');
const path = require('path');
const crypto = require('crypto');
require('./env.cjs').load(); // load .env.local before modules that read env
const { runScan, writeReport, applyFix } = require('./scanner.cjs');
const llm = require('./llm.cjs');
const band = require('./band.cjs');
const bandBridge = require('./band_bridge.cjs');
const store = require('./store.cjs');

const isDev = !app.isPackaged;
const DEV_URL = 'http://localhost:5173';

/** @type {BrowserWindow | null} */
let mainWindow = null;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 820,
    minWidth: 960,
    minHeight: 600,
    backgroundColor: '#0c0809',
    show: false,
    frame: false,
    titleBarStyle: 'hidden',
    trafficLightPosition: { x: 16, y: 18 },
    webPreferences: {
      preload: path.join(__dirname, 'preload.cjs'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false,
    },
  });

  mainWindow.once('ready-to-show', () => mainWindow?.show());

  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith('http')) shell.openExternal(url);
    return { action: 'deny' };
  });

  if (isDev) mainWindow.loadURL(DEV_URL);
  else mainWindow.loadFile(path.join(__dirname, '..', 'dist', 'index.html'));

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

// --- Window controls ---
ipcMain.on('window:minimize', () => mainWindow?.minimize());
ipcMain.on('window:maximize', () => {
  if (!mainWindow) return;
  mainWindow.isMaximized() ? mainWindow.unmaximize() : mainWindow.maximize();
});
ipcMain.on('window:close', () => mainWindow?.close());
ipcMain.handle('app:getVersion', () => app.getVersion());

// --- Integration status (which providers are wired) ---
ipcMain.handle('status:get', async () => {
  const os = require('os');
  const bandReady = bandBridge.enabled() || band.enabled();
  const status = {
    model: llm.enabled() ? llm.model() : null,
    modelReady: llm.enabled(),
    bandReady,
    bandIdentity: null,
    user: os.userInfo().username || 'operator',
  };
  if (bandBridge.enabled()) {
    const me = await bandBridge.whoami();
    status.bandIdentity = me.ok ? me.json?.data?.name || me.json?.name || me.json?.data?.handle || 'operator' : null;
  } else if (band.enabled()) {
    const me = await band.whoami();
    status.bandIdentity = me.ok ? me.json?.name || me.json?.id || 'connected' : null;
  }
  return status;
});

function atTime(value) {
  if (!value) return new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function bandAgentFor(row) {
  const haystack = `${row.sender || ''} ${row.content || ''}`.toLowerCase();
  if (haystack.includes('operator') || haystack.includes('mission control')) return 'human';
  if (haystack.includes('analyst')) return 'analysis';
  if (haystack.includes('fixer')) return 'remediation';
  if (haystack.includes('reviewer')) return 'guardian';
  return 'analysis';
}

function bandTargetFor(content = '') {
  if (/@swrmz fixer/i.test(content) || /@fixer/i.test(content)) return 'remediation';
  if (/@swrmz reviewer/i.test(content) || /@reviewer/i.test(content)) return 'guardian';
  if (/@swrmz analyst/i.test(content) || /@analyst/i.test(content)) return 'analysis';
  return undefined;
}

function bandRowToMessage(row) {
  const text = (row.content || '').trim() || `[${row.type || 'event'}]`;
  return {
    id: `band-${row.id}`,
    agent: bandAgentFor(row),
    at: atTime(row.at),
    to: bandTargetFor(text),
    blocks: [{ kind: 'text', text }],
  };
}

function isBandFinal(rows) {
  return rows.some((row) => {
    const sender = `${row.sender || ''}`.toLowerCase();
    const content = `${row.content || ''}`.toLowerCase();
    if (!sender.includes('reviewer')) return false;
    if (/@swrmz\s+(analyst|fixer|reviewer)/i.test(content)) return false;
    return /verdict|verified|safe|correct|approved|rejected|complete|final|concluding|sign-?off|fix (is )?(valid|invalid)/i.test(
      content,
    );
  });
}

// --- Targets / sessions persistence ---
ipcMain.handle('targets:list', () => store.listTargets());
ipcMain.handle('sessions:list', () => store.listSessions());
ipcMain.handle('session:get', (_e, id) => store.getSession(id));
ipcMain.handle('session:delete', (_e, id) => {
  store.deleteSession(id);
  return store.listSessions();
});

// --- Pick a real local repo ---
ipcMain.handle('repo:pick', async () => {
  const res = await dialog.showOpenDialog(mainWindow, {
    title: 'Select a repository to scan',
    properties: ['openDirectory'],
  });
  if (res.canceled || !res.filePaths[0]) return null;
  const repoPath = res.filePaths[0];
  const name = path.basename(repoPath);
  const target = { id: crypto.createHash('md5').update(repoPath).digest('hex').slice(0, 10), name, kind: 'repo', meta: repoPath, path: repoPath };
  store.upsertTarget(target);
  return target;
});

// --- Run a real scan, streaming messages to the renderer ---
ipcMain.handle('scan:start', async (_e, repoPath) => {
  if (!repoPath) throw new Error('No repo path');
  const sessionId = crypto.randomUUID();
  const messages = [];

  const emit = (message) => {
    messages.push(message);
    mainWindow?.webContents.send('scan:event', { sessionId, message });
  };
  const think = (entry) => {
    mainWindow?.webContents.send('scan:thinking', {
      sessionId,
      ...entry,
      at: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    });
  };

  // create the session record up front (status: live)
  const targetId = crypto.createHash('md5').update(repoPath).digest('hex').slice(0, 10);
  const base = {
    id: sessionId,
    targetId,
    repoPath,
    title: `Scan — ${path.basename(repoPath)}`,
    status: 'live',
    createdAt: Date.now(),
    updated: 'now',
    messages,
  };
  store.saveSession(base);

  if (bandBridge.enabled()) {
    (async () => {
      const seen = new Set();
      let chatId = null;
      try {
        think({ agent: 'recon', text: 'Creating a real Band room with Operator, Analyst, Fixer, and Reviewer…' });
        const started = await bandBridge.startBandScan(repoPath);
        chatId = started.chatId;
        think({ agent: 'recon', text: `Band room created (${chatId}). Waiting for Analyst to receive the scan request…` });

        const startedAt = Date.now();
        let stableFinalSince = null;
        let lastCount = 0;

        while (Date.now() - startedAt < 8 * 60 * 1000) {
          const rows = await bandBridge.getTranscript(chatId);
          for (const row of rows) {
            if (seen.has(row.id)) continue;
            seen.add(row.id);
            const message = bandRowToMessage(row);
            messages.push(message);
            mainWindow?.webContents.send('scan:event', { sessionId, message });
          }

          if (rows.length !== lastCount) {
            lastCount = rows.length;
            stableFinalSince = null;
            think({ agent: 'analysis', text: `Band transcript updated: ${rows.length} message${rows.length === 1 ? '' : 's'} in the room.` });
          }

          if (isBandFinal(rows)) {
            if (!stableFinalSince) stableFinalSince = Date.now();
            if (Date.now() - stableFinalSince > 8000) {
              const complete = {
                id: `band-complete-${Date.now()}`,
                agent: 'reporter',
                at: atTime(),
                blocks: [
                  {
                    kind: 'text',
                    text:
                      '✅ Band assessment complete. Operator, Analyst, Fixer, and Reviewer coordinated through the Band room. The transcript above is the audit trail.',
                  },
                ],
              };
              messages.push(complete);
              mainWindow?.webContents.send('scan:event', { sessionId, message: complete });
              const session = {
                ...base,
                status: 'done',
                agents: 4,
                bandChatId: chatId,
                messages,
                result: { repoPath, repoName: path.basename(repoPath), findings: [], counts: {}, fileCount: 0, auditRan: false, band: true },
              };
              store.saveSession(session);
              mainWindow?.webContents.send('scan:done', { sessionId, status: 'done', result: session.result });
              return;
            }
          }

          await new Promise((resolve) => setTimeout(resolve, 3500));
        }

        const timeout = {
          id: `band-timeout-${Date.now()}`,
          agent: 'guardian',
          at: atTime(),
          blocks: [{ kind: 'text', text: 'Band room is still active, but this app timed out waiting for the Reviewer final message.' }],
        };
        messages.push(timeout);
        mainWindow?.webContents.send('scan:event', { sessionId, message: timeout });
        const session = { ...base, status: 'awaiting', agents: 4, bandChatId: chatId, messages };
        store.saveSession(session);
        mainWindow?.webContents.send('scan:done', { sessionId, status: 'awaiting' });
      } catch (err) {
        const message = {
          id: `band-error-${Date.now()}`,
          agent: 'guardian',
          at: atTime(),
          blocks: [{ kind: 'text', text: `Band flow failed: ${String(err?.message || err)}` }],
        };
        messages.push(message);
        mainWindow?.webContents.send('scan:event', { sessionId, message });
        const session = { ...base, status: 'error', agents: 4, bandChatId: chatId, messages };
        store.saveSession(session);
        mainWindow?.webContents.send('scan:done', { sessionId, status: 'error', error: String(err?.message || err) });
      }
    })();

    return { sessionId, targetId };
  }

  // run async; resolve immediately with the id so the renderer can subscribe
  (async () => {
    try {
      const result = await runScan({ repoPath, emit, think });
      const status = result.findings.length ? 'awaiting' : 'done';
      const session = { ...base, status, agents: result.findings.length ? 5 : 3, result, report: result.report, messages };
      store.saveSession(session);
      mainWindow?.webContents.send('scan:done', { sessionId, status, result });
    } catch (err) {
      mainWindow?.webContents.send('scan:done', { sessionId, status: 'error', error: String(err) });
    }
  })();

  return { sessionId, targetId };
});

// --- Approve gate → apply ALL proposed code patches (report already written) ---
ipcMain.handle('scan:approve', async (_e, sessionId) => {
  const session = store.getSession(sessionId);
  if (!session || !session.result) throw new Error('Session not ready');

  const fixes = session.result.proposedFixes || (session.result.proposedFix ? [session.result.proposedFix] : []);
  const applied = [];
  for (const fix of fixes) {
    try {
      const res = applyFix(fix, session.result.repoPath);
      applied.push({ ...res, title: fix.title });
      if (band.enabled()) {
        band.sendMessage(`@You applied patch to ${res.file} (backup ${res.backup}).`).catch(() => {});
      }
    } catch (err) {
      applied.push({ file: fix.file, error: String(err) });
    }
  }

  const report = session.result.report || { path: '', hash: 'n/a' };
  const updated = { ...session, status: 'done', applied };
  store.saveSession(updated);
  return { path: report.path, hash: report.hash, applied };
});

ipcMain.handle('report:reveal', (_e, filePath) => {
  if (filePath) shell.showItemInFolder(filePath);
});

// --- Band bridge: drive the REAL Band agents from the app ---
ipcMain.handle('band:available', () => bandBridge.enabled());
ipcMain.handle('band:scan', async (_e, repoPath) => {
  if (!repoPath) throw new Error('No repo path');
  return bandBridge.startBandScan(repoPath);
});
ipcMain.handle('band:transcript', async (_e, chatId) => {
  if (!chatId) return [];
  return bandBridge.getTranscript(chatId);
});

// --- Real chat: ask Featherless a question, grounded in the session's findings ---
ipcMain.handle('chat:ask', async (_e, { sessionId, text }) => {
  if (!text || !text.trim()) return null;
  const session = store.getSession(sessionId);
  const res = session?.result;
  const findingsContext = res?.findings?.length
    ? res.findings
        .slice(0, 15)
        .map((f, i) => `${i + 1}. [${f.severity}] ${f.title} — ${f.file}:${f.line} — ${f.detail}`)
        .join('\n')
    : 'No findings were recorded for this scan.';

  const answer = await llm.chat(
    [
      {
        role: 'system',
        content:
          "You are SWRMZ, a friendly AI security pair-programmer living inside the user's project. Chat naturally and casually like a teammate. Greet normally, answer general questions, and help write or fix code when asked (vibe-code). You have the latest scan findings as context, but DO NOT dump or list them unless the user actually asks about the scan, vulnerabilities, or a specific finding. Keep replies short and conversational unless deeper detail is requested. Never echo secret values.",
      },
      {
        role: 'user',
        content: `Project: ${res?.repoName ?? session?.title ?? 'this repo'}.\nScan context (only reference if relevant to the user's message):\n${findingsContext}\n\nUser says: ${text.trim()}`,
      },
    ],
    { maxTokens: 500 },
  );

  // mirror the exchange into Band if connected
  if (band.enabled()) {
    band.sendMessage(`@Analysis operator asked: ${text.trim()}`).catch(() => {});
  }

  return answer ?? null;
});

app.whenReady().then(() => {
  createWindow();
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
