import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { getEraFromYear, ERAS, VALID_ERA_IDS } from '../shared/eras.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

// Canonical original release years for famous tracks to fix remaster/digital release dates
const canonicalYearMap = {
  // Pre-2000 classics (old-is-gold)
  'mere sapno ki rani': 1969,
  'roop tera mastana': 1969,
  'yeh jo mohabbat hai': 1971,
  'chura liya hai tumne jo dil ko': 1973,
  'yeh dosti hum nahi todenge': 1975,
  'mehbooba mehbooba': 1975,
  'khaike paan banaraswala': 1978,
  'om shanti om': 1980,
  'challa': 1986,
  'tootak tootak tootiyan': 1987,
  'dheere dheere se': 1990,
  'jind mahi': 1990,
  'baazigar o baazigar': 1993,
  'yeh kaali kaali aankhen': 1993,
  'didi tera devar deewana': 1994,
  'tip tip barsa paani': 1994,
  'tu cheez badi hai mast mast': 1994,
  'apna punjab hove': 1994,
  'dupatta tera satrang da': 1994,
  'tujhe dekha to': 1995,
  'bolo ta ra ra': 1995,
  'pardesi pardesi': 1996,
  'dil to pagal hai': 1997,
  'sandese aate hai': 1997,
  'gur nalo ishq mitha': 1997,
  'chaiyya chaiyya': 1998,
  'kuch kuch hota hai': 1998,
  'tunak tunak tun': 1998,
  'ishq tera tadpave': 1999,
  'tera yaar bolda': 1999,

  // 2000s classics (2000–2009)
  'kaho naa pyaar hai': 2000,
  'ek pal ka jeena': 2000,
  'mukhda dekh ke': 2000,
  'mitwa': 2001,
  'suraj hua maddham': 2001,
  'bole chudiyan': 2001,
  'saun di jhadi': 2001,
  'dola re dola': 2002,
  'mundian to bach ke': 2002,
  'kal ho naa ho': 2003,
  'tere naam': 2003,
  'main hoon na': 2004,
  'tumse milke dil ka': 2004,
  'tere liye': 2004,
  'dhoom machale': 2004,
  'dil luteya': 2004,
  'das ja': 2004,
  'kajra re': 2005,
  'naag': 2005,
  'mitran di chatri': 2005,
  'rang de basanti': 2006,
  'roobaroo': 2006,
  'crazy kiya re': 2006,
  'sadi gali': 2006,
  'mauja hi mauja': 2007,
  'tum se hi': 2007,
  'aankhon mein teri': 2007,
  'deewangi deewangi': 2007,
  'bol na halke halke': 2007,
  'soorma': 2007,
  'ni nachleh': 2007,
  'tujh mein rab dikhta hai': 2008,
  'haule haule': 2008,
  'jai ho': 2008,
  'teri ore': 2008,
  'petrol': 2008,
  'jee karda': 2008,
  'amplifier': 2009,
  'bewafa': 2009,
  'give me some sunshine': 2009,
  'seeti': 2009,

  // 2010s
  'pee loon': 2010,
  'tere mast mast do nain': 2010,
  'kun faya kun': 2011,
  'senorita': 2011,
  'phir le aya dil': 2012,
  'tum hi ho': 2013,
  'kabira': 2013,
  'badtameez dil': 2013,
  'balam pichkari': 2013,
  'ilahi': 2013,
  'subhanallah': 2013,
  'jeene laga hoon': 2013,
  'bapu zimidar': 2014,
  'mast magan': 2014,
  'galliyan': 2014,
  'gerua': 2015,
  'agar tum saath ho': 2015,
  'sun saathiya': 2015,
  'moh moh ke dhaage': 2015,
  'hasi': 2015,
  'solid body': 2015,
  'jaguar': 2015,
  'all black': 2015,
  'channa mereya': 2016,
  'ae dil hai mushkil': 2016,
  'kaun tujhe': 2016,
  'kar gayi chull': 2016,
  'do you know': 2016,
  'sandal': 2016,
  'daru badnaam': 2016,
  'thada bhartar': 2016,
  'zaalima': 2017,
  'dil diyan gallan': 2017,
  'high rated gabru': 2017,
  'lahore': 2017,
  'so high': 2017,
  'qismat': 2017,
  'naah': 2017,
  'madam baith bolero mein': 2017,
  'aankh marey': 2018,
  'dilbar': 2018,
  'proper patola': 2018,
  'prada': 2018,
  'bahu kale ki': 2018,
  'sakhiyaan': 2018,
  'kya baat ay': 2018,
  'filter shot': 2018,
  'chetak': 2018,
  'teri aakhya ka yo kajal': 2018,
  'bahu jamidar ki': 2018,
  'desi desi na bolya kar': 2018,
  'ghungroo': 2019,
  'bekhayali': 2019,
  'tera ban jaunga': 2019,
  'coka': 2019,
  'same beef': 2019,
  'lehenga': 2019,
  'filhall': 2019,
  'middle class': 2019,
  'kaka ji': 2019,
  'randa party': 2019,
  'ghungroo toot jayega': 2019,
  'tagdi': 2019,
  'gangwar': 2019,
  'lilo chaman': 2019,
  'aakha ka kajal': 2019
};

// Additional curated tracks for rich era diversity across Old-is-Gold and 2000s
const additionalEraTracks = [
  // HINDI OLD IS GOLD (Pre-2000)
  {
    id: "hi_old_01",
    title: "Kuch Kuch Hota Hai",
    artist: "Udit Narayan, Alka Yagnik",
    album: "Kuch Kuch Hota Hai",
    year: 1998,
    language: "hindi",
    difficulty: "easy",
    hookStartSeconds: 0,
    previewUrl: "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview115/v4/4a/c5/ee/4ac5ee4d-2a1d-a3d5-e3ea-959c1c1f77d3/mzaf_6718012674332306283.plus.aac.p.m4a",
    stages: [1, 2, 4, 7, 11, 16],
    hints: ["SRK, Kajol & Rani Mukherjee iconic college love", "Jatin-Lalit unforgettable title melody"]
  },
  {
    id: "hi_old_02",
    title: "Suraj Hua Maddham",
    artist: "Sonu Nigam, Alka Yagnik",
    album: "Kabhi Khushi Kabhie Gham",
    year: 2001,
    language: "hindi",
    difficulty: "easy",
    hookStartSeconds: 0,
    previewUrl: "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview115/v4/c3/38/54/c338541e-6447-3cf8-07ee-99e31d45c57b/mzaf_11306352011986420177.plus.aac.p.m4a",
    stages: [1, 2, 4, 7, 11, 16],
    hints: ["Pyramids of Egypt romantic visual", "Sandesh Shandilya eternal melody"]
  },
  {
    id: "hi_old_03",
    title: "Bole Chudiyan",
    artist: "Amit Kumar, Sonu Nigam, Alka Yagnik, Udit Narayan, Kavita Krishnamurthy",
    album: "Kabhi Khushi Kabhie Gham",
    year: 2001,
    language: "hindi",
    difficulty: "easy",
    hookStartSeconds: 0,
    previewUrl: "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview125/v4/24/bb/94/24bb94a2-ae31-3148-52ad-8ec7891bb26d/mzaf_1352494541300957583.plus.aac.p.m4a",
    stages: [1, 2, 4, 7, 11, 16],
    hints: ["Karwa Chauth grand family dance", "Hrithik, Kareena, SRK & Kajol"]
  },
  {
    id: "hi_old_04",
    title: "Tere Naam",
    artist: "Udit Narayan, Alka Yagnik",
    album: "Tere Naam",
    year: 2003,
    language: "hindi",
    difficulty: "medium",
    hookStartSeconds: 0,
    previewUrl: "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview115/v4/33/c4/99/33c499f5-46ff-544d-578b-3bb4dca166e4/mzaf_14115165416390161408.plus.aac.p.m4a",
    stages: [1, 2, 4, 7, 11, 16],
    hints: ["Radhe Mohan iconic middle-parting hairstyle", "Himesh Reshammiya blockbuster album"]
  },
  {
    id: "hi_old_05",
    title: "Tumse Milke Dil Ka",
    artist: "Sonu Nigam, Aftab Sabri, Hashim Sabri",
    album: "Main Hoon Na",
    year: 2004,
    language: "hindi",
    difficulty: "medium",
    hookStartSeconds: 0,
    previewUrl: "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview125/v4/e5/5d/47/e55d4750-61ca-77c8-47bc-e1daeaec14e5/mzaf_6422363063065406085.plus.aac.p.m4a",
    stages: [1, 2, 4, 7, 11, 16],
    hints: ["Major Ram and Chemist teacher romance", "Qawwali fused with western violin"]
  },
  {
    id: "hi_old_06",
    title: "Mauja Hi Mauja",
    artist: "Mika Singh",
    album: "Jab We Met",
    year: 2007,
    language: "hindi",
    difficulty: "easy",
    hookStartSeconds: 0,
    previewUrl: "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview125/v4/ce/eb/e6/ceebe6bb-e6ae-f190-38e9-ec3be8353a39/mzaf_14349377484197775586.plus.aac.p.m4a",
    stages: [1, 2, 4, 7, 11, 16],
    hints: ["Kareena & Shahid Kapoor celebration end credits", "Pritam high-voltage dance hit"]
  },
  {
    id: "hi_old_07",
    title: "Tum Se Hi",
    artist: "Mohit Chauhan",
    album: "Jab We Met",
    year: 2007,
    language: "hindi",
    difficulty: "easy",
    hookStartSeconds: 0,
    previewUrl: "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview125/v4/03/f9/54/03f9547d-f495-ea57-fcb6-6d63bb182283/mzaf_17246419702672535071.plus.aac.p.m4a",
    stages: [1, 2, 4, 7, 11, 16],
    hints: ["Rain sequence in Himachal & Mumbai", "Pritam acoustic guitar classic"]
  },
  {
    id: "hi_old_08",
    title: "Aankhon Mein Teri",
    artist: "KK",
    album: "Om Shanti Om",
    year: 2007,
    language: "hindi",
    difficulty: "easy",
    hookStartSeconds: 0,
    previewUrl: "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview115/v4/95/9b/ea/959bea01-8b3f-1d89-c454-e0b6df4b0f3e/mzaf_8422409756193755486.plus.aac.p.m4a",
    stages: [1, 2, 4, 7, 11, 16],
    hints: ["Deepika Padukone red carpet entry", "Vishal-Shekhar & unforgettable KK vocals"]
  },

  // PUNJABI RETRO & 2000s
  {
    id: "pb_old_01",
    title: "Bolo Ta Ra Ra",
    artist: "Daler Mehndi",
    album: "Bolo Ta Ra Ra",
    year: 1995,
    language: "punjabi",
    difficulty: "easy",
    hookStartSeconds: 0,
    previewUrl: "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview125/v4/71/34/4e/71344e2a-ce04-b9ba-6415-dc34d402371c/mzaf_17495521927702816301.plus.aac.p.m4a",
    stages: [1, 2, 4, 7, 11, 16],
    hints: ["The album that launched Indi-pop Bhangra fever", "Daler Mehndi energetic signature hook"]
  },
  {
    id: "pb_old_02",
    title: "Tunak Tunak Tun",
    artist: "Daler Mehndi",
    album: "Tunak Tunak Tun",
    year: 1998,
    language: "punjabi",
    difficulty: "easy",
    hookStartSeconds: 0,
    previewUrl: "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview125/v4/cb/15/8e/cb158e24-ffba-ee13-057d-f42111cbbd25/mzaf_1350849405626577312.plus.aac.p.m4a",
    stages: [1, 2, 4, 7, 11, 16],
    hints: ["First Indian music video to use blue screen CGI", "Global internet viral sensation"]
  },
  {
    id: "pb_old_03",
    title: "Challa",
    artist: "Gurdas Maan",
    album: "Long Da Lishkara",
    year: 1986,
    language: "punjabi",
    difficulty: "medium",
    hookStartSeconds: 0,
    previewUrl: "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview115/v4/7e/3d/8c/7e3d8ccf-2f7a-8d19-ee15-f12658a514d7/mzaf_8462002341235128031.plus.aac.p.m4a",
    stages: [1, 2, 4, 7, 11, 16],
    hints: ["Gurdas Maan eternal folk ballad", "Challa beriyan pattan te"]
  },
  {
    id: "pb_old_04",
    title: "Dil Luteya",
    artist: "Jazzy B, Apache Indian",
    album: "Romeo",
    year: 2004,
    language: "punjabi",
    difficulty: "easy",
    hookStartSeconds: 0,
    previewUrl: "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview115/v4/e5/74/4a/e5744a56-4c4f-c020-f4ca-6e1d9d9eb2d7/mzaf_880798150493892705.plus.aac.p.m4a",
    stages: [1, 2, 4, 7, 11, 16],
    hints: ["Crown Prince of Bhangra Jazzy B", "Sukshinder Shinda powerhouse music"]
  },
  {
    id: "pb_old_05",
    title: "Sadi Gali",
    artist: "Lehmber Hussainpuri",
    album: "Chal Gandasiye",
    year: 2006,
    language: "punjabi",
    difficulty: "easy",
    hookStartSeconds: 0,
    previewUrl: "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview115/v4/5c/d9/a2/5cd9a25b-06d2-a740-d63c-3dafa544ae5d/mzaf_10072049887713437256.plus.aac.p.m4a",
    stages: [1, 2, 4, 7, 11, 16],
    hints: ["Tanu Weds Manu wedding anthem", "Lehmber Hussainpuri iconic high notes"]
  },
  {
    id: "pb_old_06",
    title: "Bewafa",
    artist: "Imran Khan",
    album: "Unforgettable",
    year: 2009,
    language: "punjabi",
    difficulty: "medium",
    hookStartSeconds: 0,
    previewUrl: "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview125/v4/ad/7e/03/ad7e0344-93ad-e24f-ef07-4228c2c1995f/mzaf_11322238473489816226.plus.aac.p.m4a",
    stages: [1, 2, 4, 7, 11, 16],
    hints: ["Imran Khan Unforgettable album heartbreak anthem", "Bewafa nikli hai tu"]
  },

  // HARYANVI RETRO & 2000s
  {
    id: "hr_old_01",
    title: "Gagan Pe Ghata Chhai",
    artist: "Chandrawali Heritage",
    album: "Chandrawal",
    year: 1984,
    language: "haryanvi",
    difficulty: "hard",
    hookStartSeconds: 0,
    previewUrl: "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview115/v4/8e/3c/6d/8e3c6d69-3610-84c4-7fae-f65561a35a64/mzaf_15729707921389814402.plus.aac.p.m4a",
    stages: [1, 2, 4, 7, 11, 16],
    hints: ["Historic all-time highest grossing Haryanvi film", "Usha Sharma & Jagat Singh classic"]
  },
  {
    id: "hr_old_02",
    title: "Dhakad Chhora",
    artist: "Uttar Kumar",
    album: "Dhakad Chhora",
    year: 2004,
    language: "haryanvi",
    difficulty: "medium",
    hookStartSeconds: 0,
    previewUrl: "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview125/v4/bd/16/8d/bd168db6-e822-263a-bbff-d59648939c36/mzaf_17070104618228331908.plus.aac.p.m4a",
    stages: [1, 2, 4, 7, 11, 16],
    hints: ["Uttar Kumar cult film title anthem", "West UP & Haryana cinema record breaker"]
  }
];

function runMigration() {
  console.log('--- STARTING ERA DATA MODEL MIGRATION ---');

  // 1. Read existing catalog
  const catalogPath = path.join(rootDir, 'scratch', 'catalog.json');
  let rawCatalog = [];
  if (fs.existsSync(catalogPath)) {
    rawCatalog = JSON.parse(fs.readFileSync(catalogPath, 'utf8'));
  } else {
    console.error('catalog.json not found in scratch!');
    process.exit(1);
  }

  console.log(`Loaded ${rawCatalog.length} existing tracks.`);

  // 2. Add additional classic tracks if not already present
  const seenIds = new Set(rawCatalog.map(t => t.id));
  const seenTitles = new Set(rawCatalog.map(t => `${t.title.toLowerCase()}::${t.language}`));

  for (const track of additionalEraTracks) {
    const key = `${track.title.toLowerCase()}::${track.language}`;
    if (!seenIds.has(track.id) && !seenTitles.has(key)) {
      rawCatalog.push(track);
      seenIds.add(track.id);
      seenTitles.add(key);
    }
  }

  console.log(`Total after adding era classics: ${rawCatalog.length} tracks.`);

  // 3. Process each song: apply canonical year if known, validate year, and backfill era
  let unflaggedCount = 0;
  let flaggedCount = 0;
  let canonicalOverrides = 0;

  const migratedTracks = rawCatalog.map((song) => {
    const cleanTitleKey = song.title.toLowerCase().trim();
    
    // Check canonical year override
    if (canonicalYearMap[cleanTitleKey]) {
      song.year = canonicalYearMap[cleanTitleKey];
      canonicalOverrides++;
    }

    // Validate year field (required number)
    let yearNum = Number(song.year);
    if (!yearNum || isNaN(yearNum) || yearNum < 1950 || yearNum > 2030) {
      console.warn(`[REVIEW NEEDED] Song missing valid year: "${song.title}" (${song.artist}). Defaulting to 2020.`);
      yearNum = 2020;
      flaggedCount++;
    } else {
      unflaggedCount++;
    }

    song.year = yearNum;

    // Auto-derive era using single source of truth utility
    song.era = getEraFromYear(song.year);

    // Validate era is part of valid enum
    if (!VALID_ERA_IDS.includes(song.era)) {
      throw new Error(`Invalid era calculated: ${song.era} for year ${song.year}`);
    }

    return song;
  });

  // 4. Calculate distributions
  const eraCounts = { "old-is-gold": 0, "2000s": 0, "2010s": 0, "new": 0 };
  const matrix = {};

  for (const song of migratedTracks) {
    eraCounts[song.era] = (eraCounts[song.era] || 0) + 1;
    const mKey = `${song.language} | ${song.era}`;
    matrix[mKey] = (matrix[mKey] || 0) + 1;
  }

  console.log('\n--- MIGRATION STATISTICS ---');
  console.log(`Total songs migrated: ${migratedTracks.length}`);
  console.log(`Canonical year corrections applied: ${canonicalOverrides}`);
  console.log(`Valid years confirmed: ${unflaggedCount} | Flagged/Defaulted: ${flaggedCount}`);
  console.log('\nSongs per Era:');
  for (const era of ERAS) {
    if (era.id === 'all') continue;
    console.log(` - ${era.label} (${era.range}): ${eraCounts[era.id] || 0} songs`);
  }

  console.log('\nLanguage × Era Breakdown:');
  console.table(matrix);

  // 5. Write to frontend/src/data/tracks.js
  const frontendDataContent = `// 172 Real Curated Indian Tracks with Language & Era Categorization
import { getEraFromYear, ERAS, VALID_ERA_IDS } from '../constants/eras';

export const TRACK_CATALOG = ${JSON.stringify(migratedTracks, null, 2)};

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
 * Generate a complete round payload matching selected language, era, and difficulty.
 */
export function generateRoundData(language = 'all', era = 'all', difficulty = 'all', hook = false) {
  let pool = getFilteredTracks(language, era, difficulty);
  
  // Graceful fallback if combo pool is thin
  if (pool.length === 0) {
    pool = getFilteredTracks(language, 'all', difficulty);
  }
  if (pool.length === 0) {
    pool = TRACK_CATALOG;
  }

  const selectedTrack = pool[Math.floor(Math.random() * pool.length)] || TRACK_CATALOG[0];

  return {
    roundId: 'RND-' + Math.random().toString(36).substring(2, 8).toUpperCase(),
    track: {
      id: selectedTrack.id,
      title: selectedTrack.title,
      artist: selectedTrack.artist,
      album: selectedTrack.album,
      year: selectedTrack.year,
      era: selectedTrack.era || getEraFromYear(selectedTrack.year),
      language: selectedTrack.language,
      difficulty: selectedTrack.difficulty,
      stages: selectedTrack.stages,
      startOffset: hook ? selectedTrack.hookStartSeconds : 0,
      previewUrl: selectedTrack.previewUrl,
      hints: selectedTrack.hints
    },
    options: ALL_OPTIONS,
    activeFilters: {
      language: language || 'all',
      era: era || 'all',
      poolCount: pool.length
    }
  };
}
`;

  fs.writeFileSync(path.join(rootDir, 'frontend', 'src', 'data', 'tracks.js'), frontendDataContent, 'utf8');
  console.log('\n[SUCCESS] Updated frontend/src/data/tracks.js');

  // 6. Write back to scratch/catalog.json
  fs.writeFileSync(catalogPath, JSON.stringify(migratedTracks, null, 2), 'utf8');
  console.log('[SUCCESS] Updated scratch/catalog.json');

  // 7. Update backend/server.js
  const serverPath = path.join(rootDir, 'backend', 'server.js');
  let serverCode = fs.readFileSync(serverPath, 'utf8');

  // Ensure import of eras in server.js
  if (!serverCode.includes("from '../shared/eras.js'")) {
    serverCode = `import { ERAS, VALID_ERA_IDS, getEraFromYear } from '../shared/eras.js';\n` + serverCode;
  }

  const startMarker = '// In-memory catalog database';
  const endMarker = '// In-memory stats';

  const startIndex = serverCode.indexOf(startMarker);
  const endIndex = serverCode.indexOf(endMarker);

  if (startIndex !== -1 && endIndex !== -1) {
    const newSection = startMarker + '\nconst trackCatalog = ' + JSON.stringify(migratedTracks, null, 2) + ';\n\n';
    serverCode = serverCode.substring(0, startIndex) + newSection + serverCode.substring(endIndex);
    fs.writeFileSync(serverPath, serverCode, 'utf8');
    console.log('[SUCCESS] Updated backend/server.js catalog with migrated songs!');
  } else {
    console.warn('Could not find catalog markers in server.js');
  }

  console.log('\n=== MIGRATION COMPLETE ===');
}

runMigration();
