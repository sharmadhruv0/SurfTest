import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

const frontendAudioDir = path.join(rootDir, 'frontend', 'public', 'audio');
const backendAudioDir = path.join(rootDir, 'backend', 'public', 'audio');
const frontendReversedDir = path.join(frontendAudioDir, 'reversed');
const backendReversedDir = path.join(backendAudioDir, 'reversed');

// Ensure output directories exist
fs.mkdirSync(frontendReversedDir, { recursive: true });
fs.mkdirSync(backendReversedDir, { recursive: true });

async function main() {
  console.log('--- STARTING REVERSED AUDIO GENERATION (FFmpeg) ---');

  // 1. Process all local audio files
  const audioFiles = fs.readdirSync(frontendAudioDir).filter(f => f.endsWith('.m4a') && !f.includes('reversed'));
  console.log(`Found ${audioFiles.length} local audio files to reverse.`);

  let reversedCount = 0;
  let failedCount = 0;

  for (const file of audioFiles) {
    const inputPath = path.join(frontendAudioDir, file);
    const outputPath = path.join(frontendReversedDir, file);

    try {
      console.log(`Reversing [${reversedCount + 1}/${audioFiles.length}]: ${file}...`);
      // ffmpeg -y -i input -af areverse output
      execSync(`ffmpeg -y -i "${inputPath}" -af areverse "${outputPath}"`, { stdio: 'ignore' });
      
      // Also copy to backend public directory
      fs.copyFileSync(outputPath, path.join(backendReversedDir, file));
      reversedCount++;
    } catch (err) {
      console.error(`Failed to reverse ${file}:`, err.message);
      failedCount++;
    }
  }

  console.log(`\nReversed ${reversedCount} audio files successfully (${failedCount} failed).`);

  // 2. Update catalog in scratch/catalog.json
  const catalogPath = path.join(rootDir, 'scratch', 'catalog.json');
  let catalog = [];
  if (fs.existsSync(catalogPath)) {
    catalog = JSON.parse(fs.readFileSync(catalogPath, 'utf8'));
  } else {
    const { TRACK_CATALOG } = await import('../frontend/src/data/tracks.js');
    catalog = TRACK_CATALOG;
  }

  console.log(`\nUpdating schema with reversedPreviewUrl for ${catalog.length} tracks...`);

  const updatedCatalog = catalog.map(song => {
    // If local preview exists, set reversedPreviewUrl to /audio/reversed/<filename>
    if (song.previewUrl && song.previewUrl.startsWith('/audio/')) {
      const filename = path.basename(song.previewUrl);
      const reversedPath = `/audio/reversed/${filename}`;
      song.reversedPreviewUrl = reversedPath;
    } else {
      // For remote CDN previews, client Web Audio API reverses on-the-fly,
      // and reversedPreviewUrl can reference the remote URL as source
      song.reversedPreviewUrl = song.previewUrl;
    }
    return song;
  });

  // Save to scratch/catalog.json
  fs.writeFileSync(catalogPath, JSON.stringify(updatedCatalog, null, 2), 'utf8');

  // 3. Update frontend/src/data/tracks.js
  const tracksJsPath = path.join(rootDir, 'frontend', 'src', 'data', 'tracks.js');
  const tracksJsContent = `// 172 Real Curated Indian Tracks with Language, Era, and Reverse Mode Support
import { getEraFromYear, ERAS, VALID_ERA_IDS } from '../constants/eras.js';

export const TRACK_CATALOG = ${JSON.stringify(updatedCatalog, null, 2)};

export const ALL_OPTIONS = TRACK_CATALOG.map(t => \`\${t.title} - \${t.artist}\`);

/**
 * Filter tracks by language, era, and difficulty.
 */
export function getFilteredTracks(language = 'all', era = 'all', difficulty = 'all') {
  let pool = [...TRACK_CATALOG];

  if (language && language !== 'all') {
    pool = pool.filter(t => t.language.toLowerCase() === language.toLowerCase());
  }

  if (era && era !== 'all') {
    pool = pool.filter(t => (t.era || getEraFromYear(t.year)) === era.toLowerCase());
  }

  if (difficulty && difficulty !== 'all') {
    const diffMatch = pool.filter(t => t.difficulty.toLowerCase() === difficulty.toLowerCase());
    if (diffMatch.length > 0) pool = diffMatch;
  }

  return pool;
}

/**
 * Generate a complete round payload matching selected language, era, difficulty, and mode.
 * @param {string} language - 'all' | 'hindi' | 'punjabi' | 'haryanvi'
 * @param {string} era - 'all' | 'old-is-gold' | '2000s' | '2010s' | 'new'
 * @param {string} difficulty - 'all' | 'easy' | 'medium' | 'hard' | 'expert' | 'impossible'
 * @param {boolean} hook - whether to start from hook
 * @param {string} mode - 'normal' | 'reverse'
 */
export function generateRoundData(language = 'all', era = 'all', difficulty = 'all', hook = false, mode = 'normal') {
  let pool = getFilteredTracks(language, era, difficulty);
  
  if (pool.length === 0) {
    pool = getFilteredTracks(language, 'all', difficulty);
  }
  if (pool.length === 0) {
    pool = TRACK_CATALOG;
  }

  const selectedTrack = pool[Math.floor(Math.random() * pool.length)] || TRACK_CATALOG[0];
  const trackEra = selectedTrack.era || getEraFromYear(selectedTrack.year);
  const isReverseMode = mode === 'reverse';

  // In reverse mode, use reversedPreviewUrl if available
  const activePreviewUrl = isReverseMode
    ? (selectedTrack.reversedPreviewUrl || selectedTrack.previewUrl)
    : selectedTrack.previewUrl;

  return {
    roundId: 'RND-' + Math.random().toString(36).substring(2, 8).toUpperCase(),
    mode: mode || 'normal',
    isReversed: isReverseMode,
    track: {
      id: selectedTrack.id,
      title: selectedTrack.title,
      artist: selectedTrack.artist,
      album: selectedTrack.album,
      year: selectedTrack.year,
      era: trackEra,
      language: selectedTrack.language,
      difficulty: selectedTrack.difficulty,
      stages: selectedTrack.stages,
      startOffset: hook ? selectedTrack.hookStartSeconds : 0,
      previewUrl: activePreviewUrl,
      normalPreviewUrl: selectedTrack.previewUrl,
      reversedPreviewUrl: selectedTrack.reversedPreviewUrl || selectedTrack.previewUrl,
      hints: selectedTrack.hints
    },
    options: ALL_OPTIONS,
    activeFilters: {
      language: language || 'all',
      era: era || 'all',
      difficulty: difficulty || 'all',
      mode: mode || 'normal',
      poolCount: pool.length
    }
  };
}
`;

  fs.writeFileSync(tracksJsPath, tracksJsContent, 'utf8');
  console.log('[SUCCESS] Updated frontend/src/data/tracks.js with reversedPreviewUrl & mode support!');

  // 4. Update backend/server.js
  const serverPath = path.join(rootDir, 'backend', 'server.js');
  let serverCode = fs.readFileSync(serverPath, 'utf8');

  const startMarker = '// In-memory catalog database';
  const endMarker = '// In-memory stats';

  const startIndex = serverCode.indexOf(startMarker);
  const endIndex = serverCode.indexOf(endMarker);

  if (startIndex !== -1 && endIndex !== -1) {
    const newSection = startMarker + '\nconst trackCatalog = ' + JSON.stringify(updatedCatalog, null, 2) + ';\n\n';
    serverCode = serverCode.substring(0, startIndex) + newSection + serverCode.substring(endIndex);
    fs.writeFileSync(serverPath, serverCode, 'utf8');
    console.log('[SUCCESS] Updated backend/server.js with reversedPreviewUrl in trackCatalog!');
  }

  console.log('\n=== AUDIO REVERSAL & MIGRATION COMPLETE ===');
}

main().catch(console.error);
