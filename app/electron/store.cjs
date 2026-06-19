// Simple JSON persistence for scan sessions + opened targets.
// Lives in the Electron userData dir. No native modules required.
const fs = require('fs');
const path = require('path');
const { app } = require('electron');

function file() {
  return path.join(app.getPath('userData'), 'swrmz-store.json');
}

function read() {
  try {
    return JSON.parse(fs.readFileSync(file(), 'utf8'));
  } catch {
    return { targets: [], sessions: [] };
  }
}

function write(data) {
  try {
    fs.writeFileSync(file(), JSON.stringify(data, null, 2), 'utf8');
  } catch {
    /* ignore */
  }
}

function upsertTarget(target) {
  const db = read();
  const i = db.targets.findIndex((t) => t.id === target.id);
  if (i >= 0) db.targets[i] = { ...db.targets[i], ...target };
  else db.targets.unshift(target);
  write(db);
  return db.targets;
}

function saveSession(session) {
  const db = read();
  const i = db.sessions.findIndex((s) => s.id === session.id);
  if (i >= 0) db.sessions[i] = session;
  else db.sessions.unshift(session);
  write(db);
}

function listTargets() {
  return read().targets;
}

function listSessions() {
  return read().sessions;
}

function getSession(id) {
  return read().sessions.find((s) => s.id === id) || null;
}

function deleteSession(id) {
  const db = read();
  db.sessions = db.sessions.filter((s) => s.id !== id);
  write(db);
}

module.exports = { upsertTarget, saveSession, listTargets, listSessions, getSession, deleteSession };
