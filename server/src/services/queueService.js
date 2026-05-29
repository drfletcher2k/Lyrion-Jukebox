const { getDb } = require('../db/setup');

function getAllPending() {
  const db = getDb();
  return db
    .prepare(
      `SELECT * FROM requests
       WHERE status IN ('pending', 'inserted', 'playing')
       ORDER BY requested_at ASC`
    )
    .all();
}

function getOldestPending() {
  const db = getDb();
  return db
    .prepare(
      `SELECT * FROM requests WHERE status = 'pending' ORDER BY requested_at ASC LIMIT 1`
    )
    .get();
}

function getInsertedOrPlaying() {
  const db = getDb();
  return db
    .prepare(
      `SELECT * FROM requests WHERE status IN ('inserted', 'playing') LIMIT 1`
    )
    .get();
}

function hasDuplicate(spotifyTrackId) {
  const db = getDb();
  const row = db
    .prepare(
      `SELECT id FROM requests
       WHERE spotify_track_id = ? AND status IN ('pending', 'inserted', 'playing')`
    )
    .get(spotifyTrackId);
  return !!row;
}

function addRequest(data) {
  const db = getDb();
  const stmt = db.prepare(`
    INSERT INTO requests
      (spotify_track_id, title, artist, album, duration_ms, album_art_url, guest_name, source, status)
    VALUES
      (@spotify_track_id, @title, @artist, @album, @duration_ms, @album_art_url, @guest_name, @source, 'pending')
  `);
  const result = stmt.run(data);
  return result.lastInsertRowid;
}

function getQueuePosition(id) {
  const db = getDb();
  const rows = db
    .prepare(
      `SELECT id FROM requests WHERE status = 'pending' ORDER BY requested_at ASC`
    )
    .all();
  const pos = rows.findIndex((r) => r.id === id);
  return pos === -1 ? null : pos + 1;
}

function updateStatus(id, status, extra = {}) {
  const db = getDb();
  const fields = ['status = @status'];
  const params = { id, status };

  if (extra.inserted_at !== undefined) {
    fields.push('inserted_at = @inserted_at');
    params.inserted_at = extra.inserted_at;
  }
  if (extra.played_at !== undefined) {
    fields.push('played_at = @played_at');
    params.played_at = extra.played_at;
  }
  if (extra.attempts !== undefined) {
    fields.push('attempts = @attempts');
    params.attempts = extra.attempts;
  }
  if (extra.last_attempt_at !== undefined) {
    fields.push('last_attempt_at = @last_attempt_at');
    params.last_attempt_at = extra.last_attempt_at;
  }

  db.prepare(`UPDATE requests SET ${fields.join(', ')} WHERE id = @id`).run(params);
}

function removeRequest(id) {
  const db = getDb();
  db.prepare(`UPDATE requests SET status = 'skipped' WHERE id = ? AND status = 'pending'`).run(id);
}

function moveRequest(id, direction) {
  const db = getDb();
  const rows = db
    .prepare(
      `SELECT id, requested_at FROM requests WHERE status = 'pending' ORDER BY requested_at ASC`
    )
    .all();

  const idx = rows.findIndex((r) => r.id === id);
  if (idx === -1) return false;

  let swapIdx;
  if (direction === 'up' && idx > 0) {
    swapIdx = idx - 1;
  } else if (direction === 'down' && idx < rows.length - 1) {
    swapIdx = idx + 1;
  } else {
    return false;
  }

  const a = rows[idx];
  const b = rows[swapIdx];

  // Swap requested_at timestamps to reorder
  db.prepare(`UPDATE requests SET requested_at = ? WHERE id = ?`).run(b.requested_at, a.id);
  db.prepare(`UPDATE requests SET requested_at = ? WHERE id = ?`).run(a.requested_at, b.id);
  return true;
}

module.exports = {
  getAllPending,
  getOldestPending,
  getInsertedOrPlaying,
  hasDuplicate,
  addRequest,
  getQueuePosition,
  updateStatus,
  removeRequest,
  moveRequest,
};
