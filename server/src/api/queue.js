const express = require('express');
const queueService = require('../services/queueService');
const lmsService = require('../services/lmsService');

const router = express.Router();

const VALID_SOURCES = ['tablet', 'phone'];

router.post('/request', async (req, res, next) => {
  const {
    spotify_track_id,
    title,
    artist,
    album,
    duration_ms,
    album_art_url,
    guest_name,
    source,
  } = req.body;

  if (!spotify_track_id || !title || !artist || !album || !duration_ms) {
    return res.status(400).json({ error: 'Missing required fields' });
  }
  if (!VALID_SOURCES.includes(source)) {
    return res.status(400).json({ error: 'source must be "tablet" or "phone"' });
  }

  try {
    if (queueService.hasDuplicate(spotify_track_id)) {
      return res.status(409).json({ error: 'This track is already in the queue' });
    }

    const id = queueService.addRequest({
      spotify_track_id,
      title,
      artist,
      album,
      duration_ms: parseInt(duration_ms, 10),
      album_art_url: album_art_url || null,
      guest_name: guest_name || null,
      source,
    });

    const position = queueService.getQueuePosition(id);
    res.status(201).json({ id, position });
  } catch (err) {
    next(err);
  }
});

router.get('/status', async (req, res, next) => {
  try {
    let nowPlaying = null;
    try {
      const lmsStatus = await lmsService.getNowPlaying();
      const cur = lmsStatus?.playlist_loop?.[0];
      if (cur) {
        nowPlaying = {
          title: cur.title || null,
          artist: cur.artist || null,
          album: cur.album || null,
          albumArtUrl: cur.artwork_url || null,
          duration_ms: cur.duration ? Math.round(cur.duration * 1000) : null,
          position_ms: lmsStatus.time ? Math.round(lmsStatus.time * 1000) : null,
          playerMode: lmsStatus.mode || null,
        };
      }
    } catch (lmsErr) {
      console.error('[queue/status] LMS error:', lmsErr.message);
    }

    const queue = queueService.getAllPending();
    res.json({ nowPlaying, queue });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
