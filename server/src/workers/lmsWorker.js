const config = require('../config');
const lmsService = require('../services/lmsService');
const queueService = require('../services/queueService');

const MAX_ATTEMPTS = 3;

async function workerTick() {
  let lmsStatus;
  try {
    lmsStatus = await lmsService.getPlayerStatus();
  } catch (err) {
    console.error('[worker] Failed to fetch LMS status:', err.message);
    return;
  }

  const now = new Date().toISOString();
  const lmsPlaylist = lmsStatus?.playlist_loop || [];

  // Build set of spotify IDs currently in LMS playlist
  const lmsTrackIds = new Set(
    lmsPlaylist
      .map((t) => {
        const uri = t.url || '';
        const match = uri.match(/spotify:track:([A-Za-z0-9]+)/);
        return match ? match[1] : null;
      })
      .filter(Boolean)
  );

  const currentTrackId = (() => {
    const cur = lmsPlaylist.find((t) => t.playlist_cur_index !== undefined);
    if (!cur) return null;
    const match = (cur.url || '').match(/spotify:track:([A-Za-z0-9]+)/);
    return match ? match[1] : null;
  })();

  // Reconcile DB status against LMS state
  const activeRequest = queueService.getInsertedOrPlaying();
  if (activeRequest) {
    const inLms = lmsTrackIds.has(activeRequest.spotify_track_id);
    const isCurrentlyPlaying = currentTrackId === activeRequest.spotify_track_id;

    if (isCurrentlyPlaying && activeRequest.status !== 'playing') {
      queueService.updateStatus(activeRequest.id, 'playing', { played_at: now });
    } else if (!inLms && activeRequest.status !== 'playing') {
      // Track disappeared from LMS queue before playing — treat as failed
      queueService.updateStatus(activeRequest.id, 'failed');
    } else if (!inLms && activeRequest.status === 'playing') {
      // Track was playing and is now gone — it finished
      queueService.updateStatus(activeRequest.id, 'played', { played_at: now });
    }
  }

  // Only insert next track if nothing is currently inserted/playing
  const stillActive = queueService.getInsertedOrPlaying();
  if (stillActive) return;

  const next = queueService.getOldestPending();
  if (!next) return;

  // Don't re-insert if already in LMS playlist
  if (lmsTrackIds.has(next.spotify_track_id)) {
    queueService.updateStatus(next.id, 'inserted', { inserted_at: now });
    return;
  }

  const attempts = (next.attempts || 0) + 1;
  queueService.updateStatus(next.id, 'pending', {
    attempts,
    last_attempt_at: now,
  });

  if (attempts > MAX_ATTEMPTS) {
    console.error(`[worker] Track ${next.spotify_track_id} exceeded max attempts, marking failed`);
    queueService.updateStatus(next.id, 'failed');
    return;
  }

  try {
    await lmsService.insertTrack(next.spotify_track_id);
    queueService.updateStatus(next.id, 'inserted', { inserted_at: now });
    console.log(`[worker] Inserted track "${next.title}" by ${next.artist} into LMS`);
  } catch (err) {
    console.error(`[worker] Failed to insert track ${next.spotify_track_id}:`, err.message);
  }
}

function start() {
  console.log(`[worker] Starting LMS worker (interval: ${config.pollingIntervalMs}ms)`);
  setInterval(async () => {
    try {
      await workerTick();
    } catch (err) {
      console.error('[worker] Unhandled error in worker tick:', err);
    }
  }, config.pollingIntervalMs);
}

module.exports = { start };
