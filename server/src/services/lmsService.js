const fetch = require('node-fetch');
const config = require('../config');

const lmsBaseUrl = `http://${config.lms.host}:${config.lms.port}/jsonrpc.js`;

async function lmsCommand(playerId, commandArray) {
  const body = JSON.stringify({
    id: 1,
    method: 'slim.request',
    params: [playerId, commandArray],
  });

  const res = await fetch(lmsBaseUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body,
    timeout: 5000,
  });

  if (!res.ok) {
    throw new Error(`LMS HTTP error: ${res.status} ${res.statusText}`);
  }

  const json = await res.json();
  if (json.error) {
    throw new Error(`LMS RPC error: ${JSON.stringify(json.error)}`);
  }
  return json.result;
}

async function getNowPlaying() {
  return lmsCommand(config.lms.playerId, ['status', '-', 1, 'tags:adlKs']);
}

async function getPlayerStatus() {
  return lmsCommand(config.lms.playerId, ['status', 0, 100, 'tags:adlKs']);
}

async function insertTrack(spotifyTrackId) {
  return lmsCommand(config.lms.playerId, [
    'playlist',
    'insert',
    `spotify:track:${spotifyTrackId}`,
  ]);
}

async function skipCurrentTrack() {
  return lmsCommand(config.lms.playerId, ['playlist', 'index', '+1']);
}

async function checkConnectivity() {
  return lmsCommand('', ['version', '?']);
}

module.exports = {
  lmsCommand,
  getNowPlaying,
  getPlayerStatus,
  insertTrack,
  skipCurrentTrack,
  checkConnectivity,
};
