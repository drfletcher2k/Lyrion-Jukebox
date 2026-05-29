const express = require('express');
const spotifyService = require('../services/spotifyService');

const router = express.Router();

router.get('/search', async (req, res, next) => {
  const { query } = req.query;
  if (!query || !query.trim()) {
    return res.status(400).json({ error: 'query parameter is required' });
  }

  try {
    const tracks = await spotifyService.searchTracks(query.trim());
    res.json({ tracks });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
