/**
 * Run with: npm run test:lms
 * Tests connectivity and basic commands against a real LMS instance.
 */
require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });

const config = require('../src/config');
const lmsService = require('../src/services/lmsService');

async function run() {
  console.log(`Testing LMS at ${config.lms.host}:${config.lms.port}`);
  console.log(`Player ID: ${config.lms.playerId || '(not set)'}\n`);

  try {
    const version = await lmsService.checkConnectivity();
    console.log('✓ LMS version:', JSON.stringify(version));
  } catch (err) {
    console.error('✗ LMS connectivity failed:', err.message);
    process.exit(1);
  }

  try {
    const status = await lmsService.getNowPlaying();
    const mode = status?.mode || 'unknown';
    const track = status?.playlist_loop?.[0];
    console.log(`✓ Player mode: ${mode}`);
    if (track) {
      console.log(`  Now playing: "${track.title}" by ${track.artist}`);
    } else {
      console.log('  No track currently in playlist');
    }
  } catch (err) {
    console.error('✗ getNowPlaying failed:', err.message);
  }

  console.log('\nDone.');
}

run();
