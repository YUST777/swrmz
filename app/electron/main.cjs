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

function isBandTerminal(rows) {
  if (isBandFinal(rows)) return true;
  return rows.some((row) => {
    const sender = `${row.sender || ''}`.toLowerCase();
    const content = `${row.content || ''}`.toLowerCase();
    if (/@swrmz\s+(analyst|fixer|reviewer)/i.test(content)) return false;
    if (
      sender.includes('analyst') &&
      /(only secrets|no fixable|no code issue|no code finding|nothing to hand off|do not mention another agent)/i.test(content)
    ) {
      return true;
    }
    if (
      (sender.includes('fixer') || sender.includes('reviewer')) &&
      /(verdict|verified|approved|rejected|complete|done|cannot safely|no safe patch|final)/i.test(content)
    ) {
      return true;
    }
    return false;
  });
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function runBandSidecar({ repoPath, sessionId, base, messages, emit, think, state, localDone }) {
  const seen = new Set();
  let lastCount = 0;
  try {
    think({ agent: 'recon', text: 'Creating a real Band room with Operator, Analyst, Fixer, and Reviewer…' });
    const started = await bandBridge.startBandScan(repoPath);
    state.chatId = started.chatId;
    const participants = [
      { name: 'SWRMZ Operator', handle: 'operator' },
      ...(started.participants || []),
    ];
    const participantNames = participants.map((p) => p.name || p.handle).filter(Boolean);
    state.participants = participantNames;
    mainWindow?.webContents.send('scan:band', { sessionId, chatId: state.chatId, participants });
    think({
      agent: 'recon',
      text: `Band room created (${state.chatId}). Running local aggressive scan/fix engine in parallel.`,
    });
    emit({
      id: `band-room-${state.chatId}`,
      agent: 'recon',
      at: atTime(),
      blocks: [
        {
          kind: 'text',
          text: `Band room ${state.chatId} is live. Participants: ${participantNames.join(
            ', ',
          )}. The scan request was posted into Band; Analyst, Fixer, and Reviewer handoffs are mirrored below.`,
        },
      ],
    });

    const current = store.getSession(sessionId) || base;
    store.saveSession({
      ...current,
      status: current.status === 'live' ? 'live' : current.status,
      bandChatId: state.chatId,
      bandParticipants: participantNames,
      result: current.result ? { ...current.result, bandChatId: state.chatId } : current.result,
      messages,
      updated: 'now',
    });

    const startedAt = Date.now();
    const maxMs = Number(process.env.BAND_BRIDGE_MAX_MS || 2 * 60 * 1000);
    while (!localDone() && Date.now() - startedAt < maxMs) {
      const rows = await bandBridge.getTranscript(state.chatId);
      for (const row of rows) {
        if (seen.has(row.id)) continue;
        seen.add(row.id);
        emit(bandRowToMessage(row));
      }

      if (rows.length !== lastCount) {
        lastCount = rows.length;
        think({
          agent: 'analysis',
          text: `Band transcript updated: ${rows.length} message${rows.length === 1 ? '' : 's'} in the room.`,
        });
      }

      if (isBandTerminal(rows)) {
        think({
          agent: 'guardian',
          text: 'Band reached a terminal response. Local scanner/fixer continues so the app never stalls on the room.',
        });
        return;
      }

      await sleep(2500);
    }
  } catch (err) {
    const message = {
      id: `band-error-${Date.now()}`,
      agent: 'guardian',
      at: atTime(),
      blocks: [{ kind: 'text', text: `Band room sidecar failed, local scan continues: ${String(err?.message || err)}` }],
    };
    emit(message);
  }
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

  // Resolve first so the renderer can set scanningId before early thinking events arrive.
  setTimeout(() => {
    (async () => {
      const bandState = { chatId: null };
      let localComplete = false;
      think({ agent: 'recon', text: 'Booting the local scan engine and preparing the Band sidecar…' });
      if (bandBridge.enabled()) {
        runBandSidecar({
          repoPath,
          sessionId,
          base,
          messages,
          emit,
          think,
          state: bandState,
          localDone: () => localComplete,
        }).catch(() => {});
      }

      try {
        if (bandBridge.enabled()) {
          think({ agent: 'analysis', text: 'Starting local aggressive scan/fix engine now; Band will not block completion.' });
        }
        const result = await runScan({ repoPath, emit, think });
        localComplete = true;
        const status = result.findings.length ? 'awaiting' : 'done';
        const finalResult = { ...result, bandChatId: bandState.chatId || undefined };
        const session = {
          ...base,
          status,
          agents: result.findings.length ? 5 : 3,
          bandChatId: bandState.chatId || undefined,
          bandParticipants: bandState.participants || undefined,
          result: finalResult,
          report: result.report,
          messages,
        };
        store.saveSession(session);
        mainWindow?.webContents.send('scan:done', { sessionId, status, result: finalResult });
      } catch (err) {
        localComplete = true;
        mainWindow?.webContents.send('scan:done', { sessionId, status: 'error', error: String(err) });
      }
    })();
  }, 75);

  return { sessionId, targetId };
});

// --- Approve gate → apply ALL proposed code patches (report already written) ---
ipcMain.handle('scan:approve', async (_e, sessionId) => {
  const session = store.getSession(sessionId);
  if (!session || !session.result) throw new Error('Session not ready');

  const fixes = (session.result.proposedFixes || (session.result.proposedFix ? [session.result.proposedFix] : [])).filter(
    (fix) => fix && fix.approved !== false,
  );
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
