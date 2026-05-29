const express = require('express');
const lmsService = require('../services/lmsService');
const spotifyService = require('../services/spotifyService');

const router = express.Router();

router.get('/', async (req, res) => {
  const results = { spotify: false, lms: false };
  const errors = {};

  await Promise.allSettled([
    spotifyService.checkConnectivity().then(() => { results.spotify = true; }),
    lmsService.checkConnectivity().then(() => { results.lms = true; }),
  ]).then((outcomes) => {
    outcomes.forEach((o, i) => {
      if (o.status === 'rejected') {
        const key = i === 0 ? 'spotify' : 'lms';
        errors[key] = o.reason?.message || 'Unknown error';
      }
    });
  });

  const healthy = results.spotify && results.lms;
  res.status(healthy ? 200 : 500).json({
    status: healthy ? 'ok' : 'degraded',
    services: results,
    errors: Object.keys(errors).length ? errors : undefined,
  });
});

module.exports = router;
