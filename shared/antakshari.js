/**
 * Single source of truth for Antakshari Phonetics in Surftest (Desi Songless)
 * Maps song titles to normalized Devanagari/Romanized sound buckets at the syllable level.
 */

export const ANTAKSHARI_BUCKETS = {
  K: { id: 'K', devanagari: 'क/ख', label: 'K (क)', examples: ['Ka', 'Kha', 'Ke', 'Ki', 'Ko', 'Ku'] },
  G: { id: 'G', devanagari: 'ग/घ', label: 'G (ग)', examples: ['Ga', 'Gha', 'Ge', 'Gi', 'Go', 'Gu'] },
  CH: { id: 'CH', devanagari: 'च/छ', label: 'CH (च)', examples: ['Cha', 'Chha', 'Che', 'Chi', 'Cho', 'Chu'] },
  J: { id: 'J', devanagari: 'ज/झ/ज़', label: 'J (ज)', examples: ['Ja', 'Jha', 'Za', 'Je', 'Ji', 'Jo', 'Ju'] },
  T: { id: 'T', devanagari: 'त/थ/ट/ठ', label: 'T (त)', examples: ['Ta', 'Tha', 'Te', 'Ti', 'To', 'Tu'] },
  D: { id: 'D', devanagari: 'द/ध/ड/ढ', label: 'D (द)', examples: ['Da', 'Dha', 'De', 'Di', 'Do', 'Du'] },
  N: { id: 'N', devanagari: 'न/ण', label: 'N (न)', examples: ['Na', 'Ne', 'Ni', 'No', 'Nu'] },
  P: { id: 'P', devanagari: 'प/फ', label: 'P (प)', examples: ['Pa', 'Pha', 'Fa', 'Pe', 'Pi', 'Po', 'Pu'] },
  B: { id: 'B', devanagari: 'ब/भ', label: 'B (ब)', examples: ['Ba', 'Bha', 'Be', 'Bi', 'Bo', 'Bu'] },
  M: { id: 'M', devanagari: 'म', label: 'M (म)', examples: ['Ma', 'Me', 'Mi', 'Mo', 'Mu'] },
  Y: { id: 'Y', devanagari: 'य', label: 'Y (य)', examples: ['Ya', 'Ye', 'Yi', 'Yo', 'Yu'] },
  R: { id: 'R', devanagari: 'र/ड़', label: 'R (र)', examples: ['Ra', 'Re', 'Ri', 'Ro', 'Ru'] },
  L: { id: 'L', devanagari: 'ल', label: 'L (ल)', examples: ['La', 'Le', 'Li', 'Lo', 'Lu'] },
  V: { id: 'V', devanagari: 'व/W', label: 'V (व)', examples: ['Va', 'Wa', 'Ve', 'Vi', 'Vo', 'Vu'] },
  S: { id: 'S', devanagari: 'स/श/ष', label: 'S (स)', examples: ['Sa', 'Sha', 'Se', 'Si', 'So', 'Su'] },
  H: { id: 'H', devanagari: 'ह', label: 'H (ह)', examples: ['Ha', 'Ho', 'Hoo', 'Hu', 'He', 'Hi', 'Hai'] },
  A: { id: 'A', devanagari: 'अ/आ', label: 'A (आ)', examples: ['A', 'Aa', 'An'] },
  I: { id: 'I', devanagari: 'इ/ई', label: 'I (ई)', examples: ['I', 'Ee'] },
  U: { id: 'U', devanagari: 'उ/ऊ', label: 'U (ऊ)', examples: ['U', 'Oo'] },
  E: { id: 'E', devanagari: 'ए/ऐ', label: 'E (ए)', examples: ['E', 'Ae', 'Ai'] },
  O: { id: 'O', devanagari: 'ओ/औ', label: 'O (ओ)', examples: ['O', 'Au'] }
};

export const VALID_SOUND_BUCKET_IDS = Object.keys(ANTAKSHARI_BUCKETS);

// Title word cleaner handling numbers and Indian numerals
export function cleanTitleWords(title) {
  if (!title) return ['Unknown'];
  let clean = String(title).trim();

  // Known special titles / numerals
  if (clean === '0 To 100') clean = 'Zero To Hundred';
  else if (clean.startsWith('52 Gaj')) clean = 'Bawan Gaj Ka Daman';
  else if (clean.startsWith('295')) clean = 'Do Sau Pichanve';
  else if (clean === 'G.O.A.T.') clean = 'Goat';
  else if (clean.startsWith('Bang!')) clean = 'Bang Bang';
  else if (clean.endsWith(' 2')) clean = clean.replace(/ 2$/, ' Do');

  const words = clean
    .replace(/[^a-zA-Z\s]/g, ' ')
    .trim()
    .split(/\s+/)
    .filter(Boolean);

  return words.length > 0 ? words : ['Unknown'];
}

// Compute starting phonetic sound
export function computeStartSound(firstWord) {
  const w = (firstWord || '').toLowerCase().replace(/[^a-z]/g, '');
  if (!w) return 'T';

  // Consonant clusters
  if (w.startsWith('chh') || w.startsWith('ch')) return 'CH';
  if (w.startsWith('kh')) return 'K';
  if (w.startsWith('gh')) return 'G';
  if (w.startsWith('jh')) return 'J';
  if (w.startsWith('th')) return 'T';
  if (w.startsWith('dh')) return 'D';
  if (w.startsWith('ph')) return 'P';
  if (w.startsWith('bh')) return 'B';
  if (w.startsWith('sh')) return 'S';

  const c = w[0];
  if (['a', 'i', 'u', 'e', 'o'].includes(c)) return c.toUpperCase();
  if (c === 'z') return 'J';
  if (c === 'w') return 'V';
  if (c === 'c') return 'CH';
  if (c === 'f') return 'P';
  if (c === 'q') return 'K';
  if (c === 'x') return 'S';
  if (VALID_SOUND_BUCKET_IDS.includes(c.toUpperCase())) return c.toUpperCase();

  return 'T';
}

// Compute ending phonetic sound
export function computeEndSound(lastWord) {
  const w = (lastWord || '').toLowerCase().replace(/[^a-z]/g, '');
  if (!w) return 'H';

  // Ending clusters
  if (ewEndsWith(w, 'chh') || ewEndsWith(w, 'ch')) return 'CH';
  if (ewEndsWith(w, 'kh')) return 'K';
  if (ewEndsWith(w, 'gh')) return 'G';
  if (ewEndsWith(w, 'jh')) return 'J';
  if (ewEndsWith(w, 'th')) return 'T';
  if (ewEndsWith(w, 'dh')) return 'D';
  if (ewEndsWith(w, 'ph') || ewEndsWith(w, 'ff')) return 'P';
  if (ewEndsWith(w, 'bh')) return 'B';
  if (ewEndsWith(w, 'sh')) return 'S';
  if (ewEndsWith(w, 'ng')) return 'G';

  // Specific common Hindi word endings
  if (w === 'ho' || w === 'hai' || w === 'hoon' || w === 'hi') return 'H';
  if (w === 'ya' || w === 'ye' || w === 'gayi' || w === 'chaiyya' || w === 'mereya' || w === 'chaleya' || w === 'kesariya' || w === 'pardesiya') return 'Y';
  if (w === 'le' || w === 'la' || w === 'li' || w === 'pal' || w === 'mushkil' || w === 'challa') return 'L';
  if (w === 'thi' || w === 'teer' || w === 'party' || w === 'moto') return 'T';
  if (w === 'lage' || w === 'gaye' || w === 'laage' || w === 'lagde') return 'G';

  const vowels = ['a', 'e', 'i', 'o', 'u'];
  const lastChar = w[w.length - 1];

  if (vowels.includes(lastChar)) {
    let i = w.length - 1;
    while (i >= 0 && vowels.includes(w[i])) i--;
    if (i < 0) {
      // Word is pure vowels (e.g. 'aa')
      return lastChar.toUpperCase();
    }
    const sub = w.slice(0, i + 1);
    if (sub.endsWith('ch') || sub.endsWith('chh')) return 'CH';
    if (sub.endsWith('kh')) return 'K';
    if (sub.endsWith('gh')) return 'G';
    if (sub.endsWith('jh')) return 'J';
    if (sub.endsWith('th')) return 'T';
    if (sub.endsWith('dh')) return 'D';
    if (sub.endsWith('ph')) return 'P';
    if (sub.endsWith('bh')) return 'B';
    if (sub.endsWith('sh')) return 'S';

    const c = w[i];
    if (c === 'z') return 'J';
    if (c === 'w') return 'V';
    if (c === 'c') return 'CH';
    if (c === 'f') return 'P';
    if (VALID_SOUND_BUCKET_IDS.includes(c.toUpperCase())) return c.toUpperCase();
  } else {
    const c = lastChar;
    if (c === 'z') return 'J';
    if (c === 'w') return 'V';
    if (c === 'c') return 'CH';
    if (c === 'f') return 'P';
    if (VALID_SOUND_BUCKET_IDS.includes(c.toUpperCase())) return c.toUpperCase();
  }

  return 'H';
}

function ewEndsWith(str, suffix) {
  return str.endsWith(suffix);
}

// Complete phonetic extraction for a track
export function computeSongSounds(title) {
  const words = cleanTitleWords(title);
  const firstWord = words[0];
  const lastWord = words[words.length - 1];

  const startSound = computeStartSound(firstWord);
  const endSound = computeEndSound(lastWord);

  const startBucket = ANTAKSHARI_BUCKETS[startSound] || ANTAKSHARI_BUCKETS.T;
  const endBucket = ANTAKSHARI_BUCKETS[endSound] || ANTAKSHARI_BUCKETS.H;

  return {
    startSound,
    endSound,
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

  // Natural phonetic aliasing
  const aliases = {
    V: ['W', 'V'],
    J: ['Z', 'J'],
    S: ['SH', 'S'],
    P: ['F', 'P'],
    K: ['Q', 'K']
  };

  for (const group of Object.values(aliases)) {
    if (group.includes(prevEndSound) && group.includes(nextStartSound)) {
      return true;
    }
  }

  return false;
}

// Guarantee startSound and endSound are computed for any new or legacy tracks
export function ensureSongSounds(track) {
  if (!track) return track;
  if (track.startSound && track.endSound && track.startSoundLabel && track.endSoundLabel) {
    return track;
  }
  const sounds = computeSongSounds(track.title);
  return {
    ...track,
    startSound: track.startSound || sounds.startSound,
    endSound: track.endSound || sounds.endSound,
    startSyllable: track.startSyllable || sounds.startSyllable,
    endSyllable: track.endSyllable || sounds.endSyllable,
    startSoundLabel: track.startSoundLabel || sounds.startSoundLabel,
    endSoundLabel: track.endSoundLabel || sounds.endSoundLabel,
    startDevanagari: track.startDevanagari || sounds.startDevanagari,
    endDevanagari: track.endDevanagari || sounds.endDevanagari
  };
}
