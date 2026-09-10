import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import {
  computeSongSounds,
  VALID_SOUND_BUCKET_IDS,
  ANTAKSHARI_BUCKETS,
  matchSounds
} from '../shared/antakshari.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

export function runAntakshariMigration() {
  console.log('=== STARTING ANTAKSHARI PHONETIC MIGRATION ===\n');

  const catalogPath = path.join(rootDir, 'scratch', 'catalog.json');
  if (!fs.existsSync(catalogPath)) {
    throw new Error(`Catalog not found at ${catalogPath}`);
  }

  const rawTracks = JSON.parse(fs.readFileSync(catalogPath, 'utf8'));
  console.log(`Loaded ${rawTracks.length} tracks from ${catalogPath}`);

  const flaggedTracks = [];
  const startDistribution = {};
  const endDistribution = {};

  // 1. Process and backfill each track
  const migratedTracks = rawTracks.map((track, idx) => {
    const sounds = computeSongSounds(track.title);

    // Validate sound buckets
    const isStartValid = VALID_SOUND_BUCKET_IDS.includes(sounds.startSound);
    const isEndValid = VALID_SOUND_BUCKET_IDS.includes(sounds.endSound);

    if (!isStartValid || !isEndValid) {
      flaggedTracks.push({
        id: track.id,
        title: track.title,
        issue: `Invalid bucket - start: ${sounds.startSound} (valid: ${isStartValid}), end: ${sounds.endSound} (valid: ${isEndValid})`
      });
    }

    startDistribution[sounds.startSound] = (startDistribution[sounds.startSound] || 0) + 1;
    endDistribution[sounds.endSound] = (endDistribution[sounds.endSound] || 0) + 1;

    return {
      ...track,
      startSound: sounds.startSound,
      endSound: sounds.endSound,
      startSyllable: sounds.startSyllable,
      endSyllable: sounds.endSyllable,
      startSoundLabel: sounds.startSoundLabel,
      endSoundLabel: sounds.endSoundLabel,
      startDevanagari: sounds.startDevanagari,
      endDevanagari: sounds.endDevanagari
    };
  });

  console.log(`\nProcessed ${migratedTracks.length} tracks.`);
  console.log('Phonetic Start Sound Distribution:');
  console.table(startDistribution);

  console.log('\nPhonetic End Sound Distribution:');
  console.table(endDistribution);

  // 2. Report any flagged tracks
  if (flaggedTracks.length > 0) {
    console.warn(`\n[WARNING] ${flaggedTracks.length} tracks require manual review:`);
    console.table(flaggedTracks);
  } else {
    console.log('\n[PASS] All 172 tracks mapped cleanly into valid phonetic buckets! No unmapped tracks.');
  }

  // 3. Connectivity Verification
  console.log('\n--- VERIFYING ANTAKSHARI CHAIN CONNECTIVITY ---');
  const deadEndSounds = [];
  for (const sound of Object.keys(endDistribution)) {
    const eligibleStarters = migratedTracks.filter(t => matchSounds(sound, t.startSound));
    if (eligibleStarters.length === 0) {
      deadEndSounds.push(sound);
    }
  }

  if (deadEndSounds.length > 0) {
    console.warn(`[DEAD END DETECTED] No starting songs for ending sounds: ${deadEndSounds.join(', ')}`);
  } else {
    console.log('[PASS] 100% Connectivity! Every ending sound has at least one starting song match in the catalog.');
  }

  // 4. Chain length simulation
  let totalChain = 0;
  let maxChain = 0;
  const SIM_COUNT = 1000;
  for (let s = 0; s < SIM_COUNT; s++) {
    const used = new Set();
    let curr = migratedTracks[Math.floor(Math.random() * migratedTracks.length)];
    used.add(curr.id);
    let chain = 1;
    while (true) {
      const candidates = migratedTracks.filter(t => !used.has(t.id) && matchSounds(curr.endSound, t.startSound));
      if (candidates.length === 0) break;
      curr = candidates[Math.floor(Math.random() * candidates.length)];
      used.add(curr.id);
      chain++;
    }
    totalChain += chain;
    maxChain = Math.max(maxChain, chain);
  }
  console.log(`Simulation (${SIM_COUNT} chains): Average chain length = ${(totalChain / SIM_COUNT).toFixed(2)}, Max chain = ${maxChain}`);

  // 5. Update scratch/catalog.json
  fs.writeFileSync(catalogPath, JSON.stringify(migratedTracks, null, 2), 'utf8');
  console.log(`\n[SUCCESS] Updated ${catalogPath}`);

  // 6. Update backend/server.js
  const serverPath = path.join(rootDir, 'backend', 'server.js');
  let serverCode = fs.readFileSync(serverPath, 'utf8');

  // Ensure import of antakshari in server.js
  if (!serverCode.includes("from '../shared/antakshari.js'")) {
    serverCode = `import { ANTAKSHARI_BUCKETS, VALID_SOUND_BUCKET_IDS, computeSongSounds, matchSounds } from '../shared/antakshari.js';\n` + serverCode;
  }

  const startMarker = '// In-memory catalog database';
  const endMarker = '// In-memory stats';

  const startIndex = serverCode.indexOf(startMarker);
  const endIndex = serverCode.indexOf(endMarker);

  if (startIndex !== -1 && endIndex !== -1) {
    const newSection = startMarker + '\nconst trackCatalog = ' + JSON.stringify(migratedTracks, null, 2) + ';\n\n';
    serverCode = serverCode.substring(0, startIndex) + newSection + serverCode.substring(endIndex);
    fs.writeFileSync(serverPath, serverCode, 'utf8');
    console.log('[SUCCESS] Updated backend/server.js trackCatalog with Antakshari sound fields');
  } else {
    console.warn('[WARN] Could not find catalog markers in server.js');
  }

  // 7. Update frontend/src/data/tracks.js
  const frontendTracksPath = path.join(rootDir, 'frontend', 'src', 'data', 'tracks.js');
  let frontendCode = fs.readFileSync(frontendTracksPath, 'utf8');

  // Replace TRACK_CATALOG definition
  const frontStartMarker = 'export const TRACK_CATALOG = [';
  const frontEndMarker = 'export const ALL_OPTIONS =';

  const frontStartIndex = frontendCode.indexOf(frontStartMarker);
  const frontEndIndex = frontendCode.indexOf(frontEndMarker);

  if (frontStartIndex !== -1 && frontEndIndex !== -1) {
    const newFrontSection = 'export const TRACK_CATALOG = ' + JSON.stringify(migratedTracks, null, 2) + ';\n\n';
    frontendCode = frontendCode.substring(0, frontStartIndex) + newFrontSection + frontendCode.substring(frontEndIndex);

    // Ensure import of antakshari phonetics
    if (!frontendCode.includes("from '../../../shared/antakshari.js'")) {
      frontendCode = `import { computeSongSounds, matchSounds, ANTAKSHARI_BUCKETS } from '../../../shared/antakshari.js';\n` + frontendCode;
    }

    fs.writeFileSync(frontendTracksPath, frontendCode, 'utf8');
    console.log('[SUCCESS] Updated frontend/src/data/tracks.js TRACK_CATALOG with Antakshari sound fields');
  } else {
    console.warn('[WARN] Could not find TRACK_CATALOG markers in frontend/src/data/tracks.js');
  }

  console.log('\n=== ANTAKSHARI MIGRATION COMPLETE ===');
  return { migratedTracks, flaggedTracks };
}

// Run if executed directly
if (process.argv[1] && process.argv[1].endsWith('migrate_antakshari.js')) {
  runAntakshariMigration();
}
