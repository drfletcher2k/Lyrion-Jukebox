require('dotenv').config();

const config = {
  port: parseInt(process.env.PORT || '3001', 10),
  lms: {
    host: process.env.LMS_HOST || 'localhost',
    port: parseInt(process.env.LMS_PORT || '9000', 10),
    playerId: process.env.LMS_PLAYER_ID || '',
  },
  spotify: {
    clientId: process.env.SPOTIFY_CLIENT_ID || '',
    clientSecret: process.env.SPOTIFY_CLIENT_SECRET || '',
  },
  publicBaseUrl: process.env.PUBLIC_BASE_URL || 'http://localhost:3000',
  dbPath: process.env.DB_PATH || './data/jukebox.db',
  pollingIntervalMs: parseInt(process.env.POLLING_INTERVAL_MS || '5000', 10),
};

module.exports = config;
