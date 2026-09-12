/**
 * Single source of truth for Antakshari Phonetics in Surftest (Desi Songless)
 * Maps song titles to normalized Devanagari/Romanized sound buckets with high precision.
 * Concept:
 * Song 1: "Main Agar Kahoon" ends in 'N' (from "Kahoon")
 * Song 2: "Nashe Si Chadh Gayi" starts in 'N' (from "Nashe")
 */

export const ANTAKSHARI_BUCKETS = {
  N: { id: 'N', devanagari: 'न/ण', label: 'N (न)', examples: ['Nashe', 'Naina', 'Kahoon', 'Hoon', 'Main', 'Daman', 'Been'] },
  T: { id: 'T', devanagari: 'त/थ/ट/ठ', label: 'T (त)', examples: ['Tum', 'Tere', 'Thi', 'Teer', 'Tochan', 'Tunak'] },
  K: { id: 'K', devanagari: 'क/ख', label: 'K (क)', examples: ['Kesariya', 'Kal', 'Kabira', 'Clash', 'Hooka'] },
  H: { id: 'H', devanagari: 'ह', label: 'H (ह)', examples: ['Hawayein', 'High', 'Ho', 'Hai', 'Hooka'] },
  L: { id: 'L', devanagari: 'ल', label: 'L (ल)', examples: ['Lover', 'Lahore', 'Le', 'Pal', 'Challa', 'Chameli'] },
  R: { id: 'R', devanagari: 'र/ड़', label: 'R (र)', examples: ['Raat', 'Raabta', 'Kabira', 'Ghungroo', 'Amplifier'] },
  D: { id: 'D', devanagari: 'द/ध/ड/ढ', label: 'D (द)', examples: ['Dhun', 'Do', 'Munde', 'Prada', 'Girlfriend'] },
  M: { id: 'M', devanagari: 'म', label: 'M (म)', examples: ['Main', 'Manwa', 'Maddham', 'Naam', 'Morni'] },
  Y: { id: 'Y', devanagari: 'य', label: 'Y (य)', examples: ['Yamraaj', 'Yanta', 'Gayi', 'Chaiyya', 'Kesariya', 'Mereya'] },
  G: { id: 'G', devanagari: 'ग/घ', label: 'G (ग)', examples: ['Gerua', 'Ghungroo', 'Lage', 'Laage', 'Song'] },
  S: { id: 'S', devanagari: 'स/श/ष', label: 'S (स)', examples: ['Sapphire', 'Samjhawan', 'Celebrity', 'Excuses', 'Clash'] },
  CH: { id: 'CH', devanagari: 'च/छ', label: 'CH (च)', examples: ['Chaiyya', 'Channa', 'Chaleya', 'Pinch', 'Laachi'] },
  J: { id: 'J', devanagari: 'ज/झ', label: 'J (ज)', examples: ['Jhoome', 'Jeene', 'Jatt', 'Yamraaj'] },
  Z: { id: 'Z', devanagari: 'ज़', label: 'Z (ज़)', examples: ['Zaalima', 'Zero'] },
  P: { id: 'P', devanagari: 'प', label: 'P (प)', examples: ['Pal', 'Param', 'Piya', 'Proper', 'Pinch'] },
  B: { id: 'B', devanagari: 'ब/भ', label: 'B (ब)', examples: ['Brown', 'Barso', 'Born', 'Bole', 'Bang'] },
  F: { id: 'F', devanagari: 'फ़/फ', label: 'F (फ़)', examples: ['Faad', 'Fizawan', 'Beef', 'Bewafa'] },
  V: { id: 'V', devanagari: 'व/W', label: 'V (व)', examples: ['Waliyan', 'Vibe', 'Flow', 'Jeeve'] },
  A: { id: 'A', devanagari: 'अ/आ', label: 'A (आ)', examples: ['Apna', 'Agar', 'Aavan', 'Ae', 'Amplifier'] },
  I: { id: 'I', devanagari: 'इ/ई', label: 'I (ई)', examples: ['Insane', 'Illegal'] },
  U: { id: 'U', devanagari: 'उ/ऊ', label: 'U (ऊ)', examples: ['Unchi', 'Us'] },
  E: { id: 'E', devanagari: 'ए/ऐ', label: 'E (ए)', examples: ['Enna', 'East', 'Eyes'] },
  O: { id: 'O', devanagari: 'ओ/औ', label: 'O (ओ)', examples: ['Om', 'Ore'] }
};

export const VALID_SOUND_BUCKET_IDS = Object.keys(ANTAKSHARI_BUCKETS);

// Title word cleaner handling numbers and Indian numerals
export function cleanTitleWords(title) {
  if (!title) return { firstWord: 'Unknown', lastWord: 'Unknown' };
  let clean = String(title).trim();

  // Known special titles / numerals
  if (clean === '0 To 100') return { firstWord: 'Zero', lastWord: 'Hundred' };
  if (clean.startsWith('52 Gaj')) return { firstWord: 'Bawan', lastWord: 'Daman' };
  if (clean.startsWith('295')) return { firstWord: 'Do', lastWord: 'Pichanve' };
  if (clean === 'G.O.A.T.') return { firstWord: 'Goat', lastWord: 'Goat' };
  if (clean.startsWith('Bang!')) return { firstWord: 'Bang', lastWord: 'Bang' };
  if (clean.endsWith(' 2')) clean = clean.replace(/ 2$/, ' Do');

  const words = clean
    .replace(/[^a-zA-Z\s]/g, ' ')
    .trim()
    .split(/\s+/)
    .filter(Boolean);

  return {
    firstWord: words[0] || 'Unknown',
    lastWord: words[words.length - 1] || 'Unknown'
  };
}

// Compute starting phonetic sound
export function computeStartSound(firstWord) {
  const w = (firstWord || '').toLowerCase().replace(/[^a-z]/g, '');
  if (!w) return 'T';

  // Consonant clusters & phonetics
  if (w.startsWith('chh') || w.startsWith('ch')) return 'CH';
  if (w.startsWith('cl')) return 'K'; // Clash -> K
  if (w.startsWith('ce') || w.startsWith('ci')) return 'S'; // Celebrity -> S
  if (w.startsWith('kh')) return 'K';
  if (w.startsWith('gh')) return 'G';
  if (w.startsWith('jh')) return 'J';
  if (w.startsWith('th')) return 'T';
  if (w.startsWith('dh')) return 'D';
  if (w.startsWith('ph')) return 'P';
  if (w.startsWith('bh')) return 'B';
  if (w.startsWith('sh')) return 'S';
  if (w.startsWith('f')) return 'F';
  if (w.startsWith('z')) return 'Z';
  if (w.startsWith('w') || w.startsWith('v')) return 'V';

  const c = w[0];
  if (['a', 'i', 'u', 'e', 'o'].includes(c)) return c.toUpperCase();
  if (VALID_SOUND_BUCKET_IDS.includes(c.toUpperCase())) return c.toUpperCase();

  return 'T';
}

// Compute ending phonetic sound
export function computeEndSound(lastWord) {
  const w = (lastWord || '').toLowerCase().replace(/[^a-z]/g, '');
  if (!w) return 'N';

  // Nasal endings (e.g. Kahoon -> N, Hoon -> N, Main -> N, Hawayein -> N, Pathaan -> N)
  if (
    w.endsWith('oon') ||
    w.endsWith('on') ||
    w.endsWith('an') ||
    w.endsWith('in') ||
    w.endsWith('ein') ||
    w.endsWith('ain') ||
    w.endsWith('aan') ||
    w.endsWith('een') ||
    w.endsWith('un')
  ) {
    return 'N';
  }

  // Clusters
  if (w.endsWith('chh') || w.endsWith('ch')) return 'CH'; // Pinch, Laachi
  if (w.endsWith('sh')) return 'S'; // Clash, Raakshas
  if (w.endsWith('gh') || w.endsWith('high')) return 'H'; // So High
  if (w.endsWith('th')) return 'T';
  if (w.endsWith('dh')) return 'D';
  if (w.endsWith('kh')) return 'K';
  if (w.endsWith('ef') || w.endsWith('ff')) return 'F'; // Beef
  if (w.endsWith('ho') || w.endsWith('hai') || w.endsWith('hi')) return 'H'; // Tum Hi Ho, Kal Ho Naa Ho
  if (w.endsWith('ya') || w.endsWith('ye') || w.endsWith('yi') || w.endsWith('yo') || w.endsWith('io') || w.endsWith('chhai')) return 'Y'; // Gayi, Chaiyya, Kesariya, Mereya, Sonio
  if (w.endsWith('le') || w.endsWith('la') || w.endsWith('li')) return 'L'; // Apna Bana Le, Patola
  if (w.endsWith('re') || w.endsWith('ra') || w.endsWith('ri') || w.endsWith('roo') || w.endsWith('ru') || w.endsWith('chhora')) return 'R'; // Kabira, Ghungroo
  if (w.endsWith('ge') || w.endsWith('ga') || w.endsWith('gi')) return 'G'; // Chahne Lage, Manwa Laage
  if (w.endsWith('de') || w.endsWith('da') || w.endsWith('di') || w.endsWith('do')) return 'D'; // Brown Munde, Prada, Kasoote 2 (Do)
  if (w.endsWith('na') || w.endsWith('ni') || w.endsWith('no')) return 'N'; // Sona, Morni, Banno, Naina
  if (w.endsWith('te') || w.endsWith('ta') || w.endsWith('ti') || w.endsWith('to')) return 'T'; // Raat Akeli Thi, Barota, Moto, Party
  if (w.endsWith('ma') || w.endsWith('me') || w.endsWith('mi')) return 'M'; // Zaalima, Maddham
  if (w.endsWith('ka') || w.endsWith('ki') || w.endsWith('ko')) return 'K'; // Bahu Kale Ki, Hooka
  if (w.endsWith('ba') || w.endsWith('be') || w.endsWith('bo')) return 'B'; // Lambo, Vibe
  if (w.endsWith('ja') || w.endsWith('je') || w.endsWith('ji')) return 'J'; // Mauja, Jaa
  if (w.endsWith('fa')) return 'F'; // Bewafa

  // English words ending in consonant or silent 'e'
  if (w.endsWith('ride') || w.endsWith('lemonade') || w.endsWith('fold') || w.endsWith('end') || w.endsWith('girlfriend') || w.endsWith('udd')) {
    return 'D';
  }
  if (w.endsWith('white') || w.endsWith('goat') || w.endsWith('beat') || w.endsWith('inayat')) {
    return 'T';
  }
  if (w.endsWith('shine') || w.endsWith('insane') || w.endsWith('wagon')) {
    return 'N';
  }
  if (w.endsWith('style') || w.endsWith('devil') || w.endsWith('pal') || w.endsWith('dhol') || w.endsWith('badfella') || w.endsWith('luteya') || w.endsWith('challa') || w.endsWith('gali')) {
    return 'L';
  }
  if (w.endsWith('class') || w.endsWith('this') || w.endsWith('bless') || w.endsWith('hass') || w.endsWith('excuses') || w.endsWith('us') || w.endsWith('reprise')) {
    return 'S';
  }
  if (w.endsWith('killer') || w.endsWith('charmer') || w.endsWith('kufar') || w.endsWith('dealer') || w.endsWith('lover') || w.endsWith('lahore') || w.endsWith('godfather') || w.endsWith('sapphire') || w.endsWith('ghoomar') || w.endsWith('amplifier') || w.endsWith('kabootar') || w.endsWith('teer') || w.endsWith('baar') || w.endsWith('tilledar') || w.endsWith('chandrashekhar')) {
    return 'R';
  }
  if (w.endsWith('know') || w.endsWith('flow') || w.endsWith('love') || w.endsWith('jeeve') || w.endsWith('we')) {
    return 'V';
  }
  if (w.endsWith('song') || w.endsWith('ting') || w.endsWith('bang')) {
    return 'G';
  }
  if (w.endsWith('bandook') || w.endsWith('kalank') || w.endsWith('matak')) {
    return 'K';
  }
  if (w.endsWith('body') || w.endsWith('gypsy')) {
    return 'Y';
  }

  const lastChar = w[w.length - 1].toUpperCase();
  if (VALID_SOUND_BUCKET_IDS.includes(lastChar)) {
    return lastChar;
  }

  return 'N';
}

// Complete phonetic extraction for a track
export function computeSongSounds(title) {
  const { firstWord, lastWord } = cleanTitleWords(title);

  const startSound = computeStartSound(firstWord);
  const endSound = computeEndSound(lastWord);

  const startBucket = ANTAKSHARI_BUCKETS[startSound] || ANTAKSHARI_BUCKETS.T;
  const endBucket = ANTAKSHARI_BUCKETS[endSound] || ANTAKSHARI_BUCKETS.N;

  return {
    startSound,
    endSound,
    startWord: firstWord,
    endWord: lastWord,
    startSyllable: firstWord,
    endSyllable: lastWord,
    startSoundLabel: startBucket.label,
    endSoundLabel: endBucket.label,
    startDevanagari: startBucket.devanagari,
    endDevanagari: endBucket.devanagari
  };
}

// Sound bucket matching helper with smart phonetics aliasing
export function matchSounds(prevEndSound, nextStartSound) {
  if (!prevEndSound || !nextStartSound) return false;
  if (prevEndSound === nextStartSound) return true;

  // Natural phonetic aliasing (e.g. Z/J, F/P, V/W, S/SH, K/Q)
  const aliases = [
    ['Z', 'J'],
    ['F', 'P'],
    ['V', 'W'],
    ['S', 'SH'],
    ['K', 'Q']
  ];

  for (const group of aliases) {
    if (group.includes(prevEndSound) && group.includes(nextStartSound)) {
      return true;
    }
  }

  return false;
}

// Guarantee startSound and endSound are computed for any new or legacy tracks
export function ensureSongSounds(track) {
  if (!track) return track;
  const sounds = computeSongSounds(track.title);
  return {
    ...track,
    startSound: sounds.startSound,
    endSound: sounds.endSound,
    startWord: sounds.startWord,
    endWord: sounds.endWord,
    startSyllable: sounds.startWord,
    endSyllable: sounds.endWord,
    startSoundLabel: sounds.startSoundLabel,
    endSoundLabel: sounds.endSoundLabel,
    startDevanagari: sounds.startDevanagari,
    endDevanagari: sounds.endDevanagari
  };
}

// Normalize title string for strict duplicate prevention
export function normalizeSongTitle(title) {
  return String(title || '')
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '');
}

/**
 * Validate an Antakshari song submission against required sound, duplicate history, and catalog
 */
export function validateAntakshariSubmission(songTitle, requiredSound, usedSongs = [], catalog = []) {
  if (!songTitle || !String(songTitle).trim()) {
    return { valid: false, error: 'Please enter or pick a song title!' };
  }

  const cleanInput = String(songTitle).trim();
  const normalized = normalizeSongTitle(cleanInput);

  if (!normalized) {
    return { valid: false, error: 'Invalid song title!' };
  }

  // Check for duplicates in used songs
  const isDuplicate = usedSongs.some(item => {
    const norm = typeof item === 'string' ? normalizeSongTitle(item) : normalizeSongTitle(item.title || item.normalized);
    return norm === normalized;
  });

  if (isDuplicate) {
    return {
      valid: false,
      error: `"${cleanInput}" has already been used in this match! You must choose an unused song.`
    };
  }

  // Check if it exists in the catalog (for richer metadata & audio preview)
  const catalogMatch = catalog.find(t => {
    return (
      normalizeSongTitle(t.title) === normalized ||
      normalizeSongTitle(`${t.title} ${t.artist}`) === normalized ||
      normalizeSongTitle(`${t.title} - ${t.artist}`) === normalized
    );
  });

  let songMeta;
  if (catalogMatch) {
    const sounds = computeSongSounds(catalogMatch.title);
    songMeta = {
      id: catalogMatch.id,
      title: catalogMatch.title,
      artist: catalogMatch.artist,
      previewUrl: catalogMatch.previewUrl,
      album: catalogMatch.album,
      year: catalogMatch.year,
      language: catalogMatch.language,
      isCatalog: true,
      ...sounds
    };
  } else {
    // Custom song title
    const sounds = computeSongSounds(cleanInput);
    songMeta = {
      id: 'custom_' + Math.random().toString(36).substring(2, 8),
      title: cleanInput,
      artist: 'Custom Indian Track',
      previewUrl: null,
      isCatalog: false,
      ...sounds
    };
  }

  // If requiredSound is null/undefined (Turn 1 / opening song), any song is valid!
  if (!requiredSound) {
    return {
      valid: true,
      song: songMeta
    };
  }

  const targetSoundId = typeof requiredSound === 'string' ? requiredSound : requiredSound.sound;
  const isSoundMatch = matchSounds(targetSoundId, songMeta.startSound);

  if (!isSoundMatch) {
    const targetLabel = (typeof requiredSound === 'object' && requiredSound.label) ? requiredSound.label : targetSoundId;
    return {
      valid: false,
      error: `Song starts with "${songMeta.startSoundLabel}" ("${songMeta.startWord}"), but must start with "${targetLabel}"!`
    };
  }

  return {
    valid: true,
    song: songMeta
  };
}
