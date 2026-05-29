const { DatabaseSync } = require('node:sqlite');
const path = require('path');
const fs = require('fs');
const config = require('../config');

let db;

function getDb() {
  if (!db) {
    const dbPath = path.resolve(config.dbPath);
    const dir = path.dirname(dbPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    db = new DatabaseSync(dbPath);
    db.exec('PRAGMA journal_mode = WAL');
    db.exec('PRAGMA foreign_keys = ON');
    initSchema(db);
  }
  return db;
}

function initSchema(db) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS requests (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      spotify_track_id TEXT NOT NULL,
      title TEXT NOT NULL,
      artist TEXT NOT NULL,
      album TEXT NOT NULL,
      duration_ms INTEGER NOT NULL,
      album_art_url TEXT,
      guest_name TEXT,
      source TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'pending',
      requested_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      inserted_at DATETIME,
      played_at DATETIME,
      attempts INTEGER DEFAULT 0,
      last_attempt_at DATETIME
    );

    CREATE INDEX IF NOT EXISTS idx_requests_status_requested_at
      ON requests (status, requested_at);
  `);
}

module.exports = { getDb };
