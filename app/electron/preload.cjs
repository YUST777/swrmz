// Secure bridge between renderer and main. Only whitelisted channels.
const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('swrmz', {
  // window controls
  minimize: () => ipcRenderer.send('window:minimize'),
  maximize: () => ipcRenderer.send('window:maximize'),
  close: () => ipcRenderer.send('window:close'),
  getVersion: () => ipcRenderer.invoke('app:getVersion'),
  getStatus: () => ipcRenderer.invoke('status:get'),
  platform: process.platform,

  // data
  listTargets: () => ipcRenderer.invoke('targets:list'),
  listSessions: () => ipcRenderer.invoke('sessions:list'),
  getSession: (id) => ipcRenderer.invoke('session:get', id),
  deleteSession: (id) => ipcRenderer.invoke('session:delete', id),

  // workflow
  pickRepo: () => ipcRenderer.invoke('repo:pick'),
  startScan: (repoPath) => ipcRenderer.invoke('scan:start', repoPath),
  approve: (sessionId) => ipcRenderer.invoke('scan:approve', sessionId),
  ask: (sessionId, text) => ipcRenderer.invoke('chat:ask', { sessionId, text }),
  revealReport: (filePath) => ipcRenderer.invoke('report:reveal', filePath),

  // Band bridge — drive the real Band agents
  bandAvailable: () => ipcRenderer.invoke('band:available'),
  bandScan: (repoPath) => ipcRenderer.invoke('band:scan', repoPath),
  bandTranscript: (chatId) => ipcRenderer.invoke('band:transcript', chatId),

  // streaming events
  onScanEvent: (cb) => {
    const handler = (_e, payload) => cb(payload);
    ipcRenderer.on('scan:event', handler);
    return () => ipcRenderer.removeListener('scan:event', handler);
  },
  onBandRoom: (cb) => {
    const handler = (_e, payload) => cb(payload);
    ipcRenderer.on('scan:band', handler);
    return () => ipcRenderer.removeListener('scan:band', handler);
  },
  onScanThinking: (cb) => {
    const handler = (_e, payload) => cb(payload);
    ipcRenderer.on('scan:thinking', handler);
    return () => ipcRenderer.removeListener('scan:thinking', handler);
  },
  onScanDone: (cb) => {
    const handler = (_e, payload) => cb(payload);
    ipcRenderer.on('scan:done', handler);
    return () => ipcRenderer.removeListener('scan:done', handler);
  },
});
