const express = require('express');
const cors = require('cors');
const path = require('path');
const config = require('./config');

const healthRouter = require('./api/health');
const spotifyRouter = require('./api/spotify');
const queueRouter = require('./api/queue');
const adminRouter = require('./api/admin');
const lmsWorker = require('./workers/lmsWorker');

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/health', healthRouter);
app.use('/api/spotify', spotifyRouter);
app.use('/api/queue', queueRouter);
app.use('/api/admin', adminRouter);

// Serve built frontend in production
const clientDist = path.resolve(__dirname, '../../client/dist');
app.use(express.static(clientDist));
app.get('*', (req, res) => {
  res.sendFile(path.join(clientDist, 'index.html'));
});

// Centralized error handler
app.use((err, req, res, next) => {
  console.error('[error]', err.message);
  res.status(500).json({ error: err.message || 'Internal server error' });
});

process.on('uncaughtException', (err) => {
  console.error('[uncaughtException]', err);
});
process.on('unhandledRejection', (reason) => {
  console.error('[unhandledRejection]', reason);
});

app.listen(config.port, () => {
  console.log(`Lyrion Jukebox server listening on port ${config.port}`);
  lmsWorker.start();
});

module.exports = app;
