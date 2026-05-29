const fetch = require('node-fetch');
const config = require('../config');

let cachedToken = null;
let tokenExpiresAt = 0;

async function getAccessToken() {
  if (cachedToken && Date.now() < tokenExpiresAt - 60000) {
    return cachedToken;
  }

  const credentials = Buffer.from(
    `${config.spotify.clientId}:${config.spotify.clientSecret}`
  ).toString('base64');

  const res = await fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: {
      Authorization: `Basic ${credentials}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: 'grant_type=client_credentials',
  });

  if (!res.ok) {
    throw new Error(`Spotify auth error: ${res.status} ${res.statusText}`);
  }

  const data = await res.json();
  cachedToken = data.access_token;
  tokenExpiresAt = Date.now() + data.expires_in * 1000;
  return cachedToken;
}

async function searchTracks(query, limit = 10) {
  const token = await getAccessToken();
  const params = new URLSearchParams({
    q: query,
    type: 'track',
    limit: String(limit),
  });

  const res = await fetch(`https://api.spotify.com/v1/search?${params}`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!res.ok) {
    throw new Error(`Spotify search error: ${res.status} ${res.statusText}`);
  }

  const data = await res.json();
  return data.tracks.items.map((track) => ({
    spotify_track_id: track.id,
    title: track.name,
    artist: track.artists.map((a) => a.name).join(', '),
    album: track.album.name,
    duration_ms: track.duration_ms,
    album_art_url: track.album.images[1]?.url || track.album.images[0]?.url || null,
  }));
}

async function checkConnectivity() {
  await getAccessToken();
  return true;
}

module.exports = { searchTracks, checkConnectivity, getAccessToken };
