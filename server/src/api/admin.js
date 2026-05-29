const express = require('express');
const queueService = require('../services/queueService');
const lmsService = require('../services/lmsService');

const router = express.Router();

router.delete('/queue/:id', (req, res) => {
  const id = parseInt(req.params.id, 10);
  if (isNaN(id)) return res.status(400).json({ error: 'Invalid id' });

  queueService.removeRequest(id);
  res.json({ success: true });
});

router.put('/queue/:id/move', (req, res) => {
  const id = parseInt(req.params.id, 10);
  const { direction } = req.body;

  if (isNaN(id)) return res.status(400).json({ error: 'Invalid id' });
  if (!['up', 'down'].includes(direction)) {
    return res.status(400).json({ error: 'direction must be "up" or "down"' });
  }

  const moved = queueService.moveRequest(id, direction);
  if (!moved) {
    return res.status(400).json({ error: 'Cannot move item in that direction' });
  }
  res.json({ success: true });
});

router.post('/queue/:id/skip', async (req, res, next) => {
  const id = parseInt(req.params.id, 10);
  if (isNaN(id)) return res.status(400).json({ error: 'Invalid id' });

  try {
    await lmsService.skipCurrentTrack();
    queueService.updateStatus(id, 'skipped');
    res.json({ success: true });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
