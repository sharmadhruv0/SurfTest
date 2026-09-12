import {
  ANTAKSHARI_BUCKETS,
  VALID_SOUND_BUCKET_IDS,
  computeSongSounds,
  matchSounds,
  ensureSongSounds,
  validateAntakshariSubmission,
  normalizeSongTitle
} from '../shared/antakshari.js';
import { ERAS, VALID_ERA_IDS, getEraFromYear } from '../shared/eras.js';
import { GAME_MODES, VALID_MODE_IDS, getModeMeta } from '../shared/modes.js';
import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());
app.use('/audio', express.static(path.join(__dirname, 'public/audio')));

// In-memory catalog database
const trackCatalog = [
  {
    "id": "hi_01",
    "title": "Tum Hi Ho",
    "artist": "Arijit Singh",
    "album": "Aashiqui 2",
    "year": 2013,
    "difficulty": "easy",
    "hints": [
      "Blockbuster romantic anthem",
      "Mithoon composed the music"
    ],
    "previewUrl": "/audio/tum-hi-ho.m4a",
    "language": "hindi",
    "stages": [
      1,
      2,
      4,
      7,
      11,
      16
    ],
    "hookStartSeconds": 0,
    "era": "2010s",
    "reversedPreviewUrl": "/audio/reversed/tum-hi-ho.m4a",
    "startSound": "T",
    "endSound": "H",
    "startSyllable": "Tum",
    "endSyllable": "Ho",
    "startSoundLabel": "T (त)",
    "endSoundLabel": "H (ह)",
    "startDevanagari": "त/थ/ट/ठ",
    "endDevanagari": "ह",
    "startWord": "Tum",
    "endWord": "Ho"
  },
  {
    "id": "hi_02",
    "title": "Chaiyya Chaiyya",
    "artist": "Sukhwinder Singh, Sapna Awasthi",
    "album": "Dil Se..",
    "year": 1998,
    "difficulty": "medium",
    "hints": [
      "Train top iconic dance",
      "A. R. Rahman masterpiece"
    ],
    "previewUrl": "/audio/chaiyya-chaiyya.m4a",
    "language": "hindi",
    "stages": [
      1,
      2,
      4,
      7,
      11,
      16
    ],
    "hookStartSeconds": 0,
    "era": "old-is-gold",
    "reversedPreviewUrl": "/audio/reversed/chaiyya-chaiyya.m4a",
    "startSound": "CH",
    "endSound": "Y",
    "startSyllable": "Chaiyya",
    "endSyllable": "Chaiyya",
    "startSoundLabel": "CH (च)",
    "endSoundLabel": "Y (य)",
    "startDevanagari": "च/छ",
    "endDevanagari": "य",
    "startWord": "Chaiyya",
    "endWord": "Chaiyya"
  },
  {
    "id": "hi_03",
    "title": "Kesariya",
    "artist": "Arijit Singh, Pritam",
    "album": "Brahmāstra",
    "year": 2022,
    "difficulty": "easy",
    "hints": [
      "Love storiyaan fame",
      "Ranbir & Alia"
    ],
    "previewUrl": "/audio/kesariya.m4a",
    "language": "hindi",
    "stages": [
      1,
      2,
      4,
      7,
      11,
      16
    ],
    "hookStartSeconds": 0,
    "era": "new",
    "reversedPreviewUrl": "/audio/reversed/kesariya.m4a",
    "startSound": "K",
    "endSound": "Y",
    "startSyllable": "Kesariya",
    "endSyllable": "Kesariya",
    "startSoundLabel": "K (क)",
    "endSoundLabel": "Y (य)",
    "startDevanagari": "क/ख",
    "endDevanagari": "य",
    "startWord": "Kesariya",
    "endWord": "Kesariya"
  },
  {
    "id": "hi_04",
    "title": "Kal Ho Naa Ho",
    "artist": "Sonu Nigam",
    "album": "Kal Ho Naa Ho",
    "year": 2003,
    "difficulty": "hard",
    "hints": [
      "Emotional title track",
      "Shankar-Ehsaan-Loy"
    ],
    "previewUrl": "/audio/kal-ho-naa-ho.m4a",
    "language": "hindi",
    "stages": [
      1,
      2,
      4,
      7,
      11,
      16
    ],
    "hookStartSeconds": 0,
    "era": "2000s",
    "reversedPreviewUrl": "/audio/reversed/kal-ho-naa-ho.m4a",
    "startSound": "K",
    "endSound": "H",
    "startSyllable": "Kal",
    "endSyllable": "Ho",
    "startSoundLabel": "K (क)",
    "endSoundLabel": "H (ह)",
    "startDevanagari": "क/ख",
    "endDevanagari": "ह",
    "startWord": "Kal",
    "endWord": "Ho"
  },
  {
    "id": "hi_05",
    "title": "Apna Bana Le",
    "artist": "Arijit Singh, Sachin-Jigar",
    "album": "Bhediya",
    "year": 2022,
    "difficulty": "easy",
    "hints": [
      "Soulful ballad with Varun Dhawan",
      "Sachin-Jigar melody"
    ],
    "previewUrl": "/audio/apna-bana-le.m4a",
    "language": "hindi",
    "stages": [
      1,
      2,
      4,
      7,
      11,
      16
    ],
    "hookStartSeconds": 0,
    "era": "new",
    "reversedPreviewUrl": "/audio/reversed/apna-bana-le.m4a",
    "startSound": "A",
    "endSound": "L",
    "startSyllable": "Apna",
    "endSyllable": "Le",
    "startSoundLabel": "A (आ)",
    "endSoundLabel": "L (ल)",
    "startDevanagari": "अ/आ",
    "endDevanagari": "ल",
    "startWord": "Apna",
    "endWord": "Le"
  },
  {
    "id": "hi_06",
    "title": "Kabira",
    "artist": "Tochi Raina, Rekha Bhardwaj",
    "album": "Yeh Jawaani Hai Deewani",
    "year": 2013,
    "difficulty": "medium",
    "hints": [
      "Classic wedding Sufi vibe",
      "Ranbir Kapoor & Deepika Padukone"
    ],
    "previewUrl": "/audio/kabira.m4a",
    "language": "hindi",
    "stages": [
      1,
      2,
      4,
      7,
      11,
      16
    ],
    "hookStartSeconds": 0,
    "era": "2010s",
    "reversedPreviewUrl": "/audio/reversed/kabira.m4a",
    "startSound": "K",
    "endSound": "R",
    "startSyllable": "Kabira",
    "endSyllable": "Kabira",
    "startSoundLabel": "K (क)",
    "endSoundLabel": "R (र)",
    "startDevanagari": "क/ख",
    "endDevanagari": "र/ड़",
    "startWord": "Kabira",
    "endWord": "Kabira"
  },
  {
    "id": "hi_07",
    "title": "Gerua",
    "artist": "Arijit Singh, Antara Mitra",
    "album": "Dilwale",
    "year": 2015,
    "difficulty": "medium",
    "hints": [
      "SRK & Kajol in Iceland",
      "Pritam composition"
    ],
    "previewUrl": "/audio/gerua.m4a",
    "language": "hindi",
    "stages": [
      1,
      2,
      4,
      7,
      11,
      16
    ],
    "hookStartSeconds": 0,
    "era": "2010s",
    "reversedPreviewUrl": "/audio/reversed/gerua.m4a",
    "startSound": "G",
    "endSound": "A",
    "startSyllable": "Gerua",
    "endSyllable": "Gerua",
    "startSoundLabel": "G (ग)",
    "endSoundLabel": "A (आ)",
    "startDevanagari": "ग/घ",
    "endDevanagari": "अ/आ",
    "startWord": "Gerua",
    "endWord": "Gerua"
  },
  {
    "id": "hi_08",
    "title": "Ghungroo",
    "artist": "Arijit Singh, Shilpa Rao",
    "album": "War",
    "year": 2019,
    "difficulty": "medium",
    "hints": [
      "Hrithik Roshan beach party dance",
      "Vishal-Shekhar groovy rhythm"
    ],
    "previewUrl": "/audio/ghungroo.m4a",
    "language": "hindi",
    "stages": [
      1,
      2,
      4,
      7,
      11,
      16
    ],
    "hookStartSeconds": 0,
    "era": "2010s",
    "reversedPreviewUrl": "/audio/reversed/ghungroo.m4a",
    "startSound": "G",
    "endSound": "R",
    "startSyllable": "Ghungroo",
    "endSyllable": "Ghungroo",
    "startSoundLabel": "G (ग)",
    "endSoundLabel": "R (र)",
    "startDevanagari": "ग/घ",
    "endDevanagari": "र/ड़",
    "startWord": "Ghungroo",
    "endWord": "Ghungroo"
  },
  {
    "id": "hi_09",
    "title": "Kun Faya Kun",
    "artist": "A. R. Rahman, Mohit Chauhan, Javed Ali",
    "album": "Rockstar",
    "year": 2011,
    "difficulty": "hard",
    "hints": [
      "Nizamuddin Dargah spiritual anthem",
      "A. R. Rahman masterpiece"
    ],
    "previewUrl": "/audio/kun-faya-kun.m4a",
    "language": "hindi",
    "stages": [
      1,
      2,
      4,
      7,
      11,
      16
    ],
    "hookStartSeconds": 0,
    "era": "2010s",
    "reversedPreviewUrl": "/audio/reversed/kun-faya-kun.m4a",
    "startSound": "K",
    "endSound": "N",
    "startSyllable": "Kun",
    "endSyllable": "Kun",
    "startSoundLabel": "K (क)",
    "endSoundLabel": "N (न)",
    "startDevanagari": "क/ख",
    "endDevanagari": "न/ण",
    "startWord": "Kun",
    "endWord": "Kun"
  },
  {
    "id": "hi_10",
    "title": "Tujh Mein Rab Dikhta Hai",
    "artist": "Roop Kumar Rathod",
    "album": "Rab Ne Bana Di Jodi",
    "year": 2008,
    "difficulty": "easy",
    "hints": [
      "SRK & Anushka Sharma debut",
      "Salim-Sulaiman classic"
    ],
    "previewUrl": "/audio/tujh-mein-rab-dikhta-hai.m4a",
    "language": "hindi",
    "stages": [
      1,
      2,
      4,
      7,
      11,
      16
    ],
    "hookStartSeconds": 0,
    "era": "2000s",
    "reversedPreviewUrl": "/audio/reversed/tujh-mein-rab-dikhta-hai.m4a",
    "startSound": "T",
    "endSound": "H",
    "startSyllable": "Tujh",
    "endSyllable": "Hai",
    "startSoundLabel": "T (त)",
    "endSoundLabel": "H (ह)",
    "startDevanagari": "त/थ/ट/ठ",
    "endDevanagari": "ह",
    "startWord": "Tujh",
    "endWord": "Hai"
  },
  {
    "id": "hi_11",
    "title": "Raat Akeli Thi",
    "artist": "Pritam, Arijit Singh & Antara Mitra",
    "album": "Bollywood New Love Hits",
    "year": 2026,
    "language": "hindi",
    "difficulty": "easy",
    "hookStartSeconds": 0,
    "previewUrl": "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview221/v4/67/61/b0/6761b0f0-ceda-55ab-f85d-635a4f522bcf/mzaf_14668412813825465699.plus.aac.p.m4a",
    "stages": [
      1,
      2,
      4,
      7,
      11,
      16
    ],
    "hints": [
      "Massive hit by Pritam, Arijit Singh & Antara Mitra",
      "Featured in \"Bollywood New Love Hits\" (2026)"
    ],
    "era": "new",
    "reversedPreviewUrl": "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview221/v4/67/61/b0/6761b0f0-ceda-55ab-f85d-635a4f522bcf/mzaf_14668412813825465699.plus.aac.p.m4a",
    "startSound": "R",
    "endSound": "H",
    "startSyllable": "Raat",
    "endSyllable": "Thi",
    "startSoundLabel": "R (र)",
    "endSoundLabel": "H (ह)",
    "startDevanagari": "र/ड़",
    "endDevanagari": "ह",
    "startWord": "Raat",
    "endWord": "Thi"
  },
  {
    "id": "hi_12",
    "title": "Chaleya",
    "artist": "Anirudh Ravichander, Arijit Singh, Shilpa Rao & Kumaar",
    "album": "Chaleya",
    "year": 2023,
    "language": "hindi",
    "difficulty": "hard",
    "hookStartSeconds": 0,
    "previewUrl": "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview221/v4/55/fb/9c/55fb9c31-320a-5dba-0a3f-5e69552085a7/mzaf_13508224660474474886.plus.aac.p.m4a",
    "stages": [
      1,
      2,
      4,
      7,
      11,
      16
    ],
    "hints": [
      "Massive hit by Anirudh Ravichander, Arijit Singh, Shilpa Rao & Kumaar",
      "Featured in \"Chaleya\" (2023)"
    ],
    "era": "new",
    "reversedPreviewUrl": "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview221/v4/55/fb/9c/55fb9c31-320a-5dba-0a3f-5e69552085a7/mzaf_13508224660474474886.plus.aac.p.m4a",
    "startSound": "CH",
    "endSound": "Y",
    "startSyllable": "Chaleya",
    "endSyllable": "Chaleya",
    "startSoundLabel": "CH (च)",
    "endSoundLabel": "Y (य)",
    "startDevanagari": "च/छ",
    "endDevanagari": "य",
    "startWord": "Chaleya",
    "endWord": "Chaleya"
  },
  {
    "id": "hi_13",
    "title": "Tujhe Kitna Chahne Lage",
    "artist": "Arijit Singh",
    "album": "Kabir Singh",
    "year": 2019,
    "language": "hindi",
    "difficulty": "medium",
    "hookStartSeconds": 0,
    "previewUrl": "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview211/v4/7e/f3/43/7ef34316-c0d1-4c3c-afc9-53716b8f3473/mzaf_13869194700915977502.plus.aac.p.m4a",
    "stages": [
      1,
      2,
      4,
      7,
      11,
      16
    ],
    "hints": [
      "Massive hit by Arijit Singh",
      "Featured in \"Kabir Singh\" (2019)"
    ],
    "era": "2010s",
    "reversedPreviewUrl": "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview211/v4/7e/f3/43/7ef34316-c0d1-4c3c-afc9-53716b8f3473/mzaf_13869194700915977502.plus.aac.p.m4a",
    "startSound": "T",
    "endSound": "G",
    "startSyllable": "Tujhe",
    "endSyllable": "Lage",
    "startSoundLabel": "T (त)",
    "endSoundLabel": "G (ग)",
    "startDevanagari": "त/थ/ट/ठ",
    "endDevanagari": "ग/घ",
    "startWord": "Tujhe",
    "endWord": "Lage"
  },
  {
    "id": "hi_14",
    "title": "Pal",
    "artist": "Javed Mohsin, Arijit Singh & Shreya Ghoshal",
    "album": "Pal",
    "year": 2018,
    "language": "hindi",
    "difficulty": "expert",
    "hookStartSeconds": 0,
    "previewUrl": "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview221/v4/b0/45/3a/b0453aba-4aa3-6d10-e70f-367a7e559e84/mzaf_6465472741528865032.plus.aac.p.m4a",
    "stages": [
      1,
      2,
      4,
      7,
      11,
      16
    ],
    "hints": [
      "Massive hit by Javed Mohsin, Arijit Singh & Shreya Ghoshal",
      "Featured in \"Pal\" (2018)"
    ],
    "era": "2010s",
    "reversedPreviewUrl": "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview221/v4/b0/45/3a/b0453aba-4aa3-6d10-e70f-367a7e559e84/mzaf_6465472741528865032.plus.aac.p.m4a",
    "startSound": "P",
    "endSound": "L",
    "startSyllable": "Pal",
    "endSyllable": "Pal",
    "startSoundLabel": "P (प)",
    "endSoundLabel": "L (ल)",
    "startDevanagari": "प",
    "endDevanagari": "ल",
    "startWord": "Pal",
    "endWord": "Pal"
  },
  {
    "id": "hi_15",
    "title": "Agar Tum Saath Ho",
    "artist": "Alka Yagnik & Arijit Singh",
    "album": "Tamasha",
    "year": 2015,
    "language": "hindi",
    "difficulty": "easy",
    "hookStartSeconds": 0,
    "previewUrl": "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview221/v4/75/a8/7d/75a87dcc-5b69-795d-7dcc-27d1c728f31f/mzaf_18055325784732588932.plus.aac.p.m4a",
    "stages": [
      1,
      2,
      4,
      7,
      11,
      16
    ],
    "hints": [
      "Massive hit by Alka Yagnik & Arijit Singh",
      "Featured in \"Tamasha\" (2015)"
    ],
    "era": "2010s",
    "reversedPreviewUrl": "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview221/v4/75/a8/7d/75a87dcc-5b69-795d-7dcc-27d1c728f31f/mzaf_18055325784732588932.plus.aac.p.m4a",
    "startSound": "A",
    "endSound": "H",
    "startSyllable": "Agar",
    "endSyllable": "Ho",
    "startSoundLabel": "A (आ)",
    "endSoundLabel": "H (ह)",
    "startDevanagari": "अ/आ",
    "endDevanagari": "ह",
    "startWord": "Agar",
    "endWord": "Ho"
  },
  {
    "id": "hi_16",
    "title": "Sapphire",
    "artist": "Ed Sheeran",
    "album": "Sapphire",
    "year": 2025,
    "language": "hindi",
    "difficulty": "impossible",
    "hookStartSeconds": 0,
    "previewUrl": "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview211/v4/ad/fd/bc/adfdbcca-c021-eb4f-4832-fbab211a8b2b/mzaf_13305391657250572374.plus.aac.p.m4a",
    "stages": [
      1,
      2,
      4,
      7,
      11,
      16
    ],
    "hints": [
      "Massive hit by Ed Sheeran",
      "Featured in \"Sapphire\" (2025)"
    ],
    "era": "new",
    "reversedPreviewUrl": "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview211/v4/ad/fd/bc/adfdbcca-c021-eb4f-4832-fbab211a8b2b/mzaf_13305391657250572374.plus.aac.p.m4a",
    "startSound": "S",
    "endSound": "R",
    "startSyllable": "Sapphire",
    "endSyllable": "Sapphire",
    "startSoundLabel": "S (स)",
    "endSoundLabel": "R (र)",
    "startDevanagari": "स/श/ष",
    "endDevanagari": "र/ड़",
    "startWord": "Sapphire",
    "endWord": "Sapphire"
  },
  {
    "id": "hi_17",
    "title": "Dhun",
    "artist": "Mithoon & Arijit Singh",
    "album": "Saiyaara",
    "year": 2025,
    "language": "hindi",
    "difficulty": "easy",
    "hookStartSeconds": 0,
    "previewUrl": "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview221/v4/43/55/7e/43557ef0-ece1-632f-3e5b-c6dee38e4d62/mzaf_11064858646624629484.plus.aac.p.m4a",
    "stages": [
      1,
      2,
      4,
      7,
      11,
      16
    ],
    "hints": [
      "Massive hit by Mithoon & Arijit Singh",
      "Featured in \"Saiyaara\" (2025)"
    ],
    "era": "new",
    "reversedPreviewUrl": "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview221/v4/43/55/7e/43557ef0-ece1-632f-3e5b-c6dee38e4d62/mzaf_11064858646624629484.plus.aac.p.m4a",
    "startSound": "D",
    "endSound": "N",
    "startSyllable": "Dhun",
    "endSyllable": "Dhun",
    "startSoundLabel": "D (द)",
    "endSoundLabel": "N (न)",
    "startDevanagari": "द/ध/ड/ढ",
    "endDevanagari": "न/ण",
    "startWord": "Dhun",
    "endWord": "Dhun"
  },
  {
    "id": "hi_18",
    "title": "Enna Sona",
    "artist": "A.R. Rahman & Arijit Singh",
    "album": "OK Jaanu",
    "year": 2016,
    "language": "hindi",
    "difficulty": "medium",
    "hookStartSeconds": 0,
    "previewUrl": "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview221/v4/5b/b6/d7/5bb6d78f-1bba-c0a9-0731-d3286ed06914/mzaf_1092273590896407309.plus.aac.p.m4a",
    "stages": [
      1,
      2,
      4,
      7,
      11,
      16
    ],
    "hints": [
      "Massive hit by A.R. Rahman & Arijit Singh",
      "Featured in \"OK Jaanu\" (2016)"
    ],
    "era": "2010s",
    "reversedPreviewUrl": "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview221/v4/5b/b6/d7/5bb6d78f-1bba-c0a9-0731-d3286ed06914/mzaf_1092273590896407309.plus.aac.p.m4a",
    "startSound": "E",
    "endSound": "N",
    "startSyllable": "Enna",
    "endSyllable": "Sona",
    "startSoundLabel": "E (ए)",
    "endSoundLabel": "N (न)",
    "startDevanagari": "ए/ऐ",
    "endDevanagari": "न/ण",
    "startWord": "Enna",
    "endWord": "Sona"
  },
  {
    "id": "hi_19",
    "title": "Channa Mereya",
    "artist": "Pritam & Arijit Singh",
    "album": "Ae Dil Hai Mushkil",
    "year": 2016,
    "language": "hindi",
    "difficulty": "easy",
    "hookStartSeconds": 0,
    "previewUrl": "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview211/v4/d5/f9/98/d5f998a7-0090-ee2d-03f8-557ad6c5bf65/mzaf_14251357991592637728.plus.aac.p.m4a",
    "stages": [
      1,
      2,
      4,
      7,
      11,
      16
    ],
    "hints": [
      "Massive hit by Pritam & Arijit Singh",
      "Featured in \"Ae Dil Hai Mushkil\" (2016)"
    ],
    "era": "2010s",
    "reversedPreviewUrl": "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview211/v4/d5/f9/98/d5f998a7-0090-ee2d-03f8-557ad6c5bf65/mzaf_14251357991592637728.plus.aac.p.m4a",
    "startSound": "CH",
    "endSound": "Y",
    "startSyllable": "Channa",
    "endSyllable": "Mereya",
    "startSoundLabel": "CH (च)",
    "endSoundLabel": "Y (य)",
    "startDevanagari": "च/छ",
    "endDevanagari": "य",
    "startWord": "Channa",
    "endWord": "Mereya"
  },
  {
    "id": "hi_20",
    "title": "Nashe Si Chadh Gayi",
    "artist": "Vishal & Shekhar, Arijit Singh & Caralisa Monteiro",
    "album": "Befikre",
    "year": 2016,
    "language": "hindi",
    "difficulty": "hard",
    "hookStartSeconds": 0,
    "previewUrl": "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview211/v4/af/d1/25/afd125f4-14ec-96db-f041-734b2be25ebf/mzaf_16119343562690640430.plus.aac.p.m4a",
    "stages": [
      1,
      2,
      4,
      7,
      11,
      16
    ],
    "hints": [
      "Massive hit by Vishal & Shekhar, Arijit Singh & Caralisa Monteiro",
      "Featured in \"Befikre\" (2016)"
    ],
    "era": "2010s",
    "reversedPreviewUrl": "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview211/v4/af/d1/25/afd125f4-14ec-96db-f041-734b2be25ebf/mzaf_16119343562690640430.plus.aac.p.m4a",
    "startSound": "N",
    "endSound": "Y",
    "startSyllable": "Nashe",
    "endSyllable": "Gayi",
    "startSoundLabel": "N (न)",
    "endSoundLabel": "Y (य)",
    "startDevanagari": "न/ण",
    "endDevanagari": "य",
    "startWord": "Nashe",
    "endWord": "Gayi"
  },
  {
    "id": "hi_21",
    "title": "Aavan Jaavan",
    "artist": "Pritam, Arijit Singh, Nikhita Gandhi & Amitabh Bhattacharya",
    "album": "Aavan Jaavan",
    "year": 2025,
    "language": "hindi",
    "difficulty": "medium",
    "hookStartSeconds": 0,
    "previewUrl": "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview221/v4/95/59/1f/95591f7e-4121-963c-891c-18025f811f22/mzaf_2089489847054162062.plus.aac.p.m4a",
    "stages": [
      1,
      2,
      4,
      7,
      11,
      16
    ],
    "hints": [
      "Massive hit by Pritam, Arijit Singh, Nikhita Gandhi & Amitabh Bhattacharya",
      "Featured in \"Aavan Jaavan\" (2025)"
    ],
    "era": "new",
    "reversedPreviewUrl": "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview221/v4/95/59/1f/95591f7e-4121-963c-891c-18025f811f22/mzaf_2089489847054162062.plus.aac.p.m4a",
    "startSound": "A",
    "endSound": "N",
    "startSyllable": "Aavan",
    "endSyllable": "Jaavan",
    "startSoundLabel": "A (आ)",
    "endSoundLabel": "N (न)",
    "startDevanagari": "अ/आ",
    "endDevanagari": "न/ण",
    "startWord": "Aavan",
    "endWord": "Jaavan"
  },
  {
    "id": "hi_22",
    "title": "Jhoome Jo Pathaan",
    "artist": "Vishal & Shekhar, Arijit Singh, Sukriti Kakar, Vishal Dadlani & Shekhar Ravjiani",
    "album": "Pathaan",
    "year": 2022,
    "language": "hindi",
    "difficulty": "expert",
    "hookStartSeconds": 0,
    "previewUrl": "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview221/v4/be/80/45/be8045ce-1ce5-b099-fc9d-7141b1d3d6f2/mzaf_10087280935419764280.plus.aac.p.m4a",
    "stages": [
      1,
      2,
      4,
      7,
      11,
      16
    ],
    "hints": [
      "Massive hit by Vishal & Shekhar, Arijit Singh, Sukriti Kakar, Vishal Dadlani & Shekhar Ravjiani",
      "Featured in \"Pathaan\" (2022)"
    ],
    "era": "new",
    "reversedPreviewUrl": "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview221/v4/be/80/45/be8045ce-1ce5-b099-fc9d-7141b1d3d6f2/mzaf_10087280935419764280.plus.aac.p.m4a",
    "startSound": "J",
    "endSound": "N",
    "startSyllable": "Jhoome",
    "endSyllable": "Pathaan",
    "startSoundLabel": "J (ज)",
    "endSoundLabel": "N (न)",
    "startDevanagari": "ज/झ",
    "endDevanagari": "न/ण",
    "startWord": "Jhoome",
    "endWord": "Pathaan"
  },
  {
    "id": "hi_23",
    "title": "Kalank",
    "artist": "Pritam & Arijit Singh",
    "album": "Kalank",
    "year": 2018,
    "language": "hindi",
    "difficulty": "easy",
    "hookStartSeconds": 0,
    "previewUrl": "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview211/v4/c8/a2/09/c8a20920-52a8-9728-a305-9f12a85ae305/mzaf_8477813248295499776.plus.aac.p.m4a",
    "stages": [
      1,
      2,
      4,
      7,
      11,
      16
    ],
    "hints": [
      "Massive hit by Pritam & Arijit Singh",
      "Featured in \"Kalank\" (2018)"
    ],
    "era": "2010s",
    "reversedPreviewUrl": "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview211/v4/c8/a2/09/c8a20920-52a8-9728-a305-9f12a85ae305/mzaf_8477813248295499776.plus.aac.p.m4a",
    "startSound": "K",
    "endSound": "K",
    "startSyllable": "Kalank",
    "endSyllable": "Kalank",
    "startSoundLabel": "K (क)",
    "endSoundLabel": "K (क)",
    "startDevanagari": "क/ख",
    "endDevanagari": "क/ख",
    "startWord": "Kalank",
    "endWord": "Kalank"
  },
  {
    "id": "hi_24",
    "title": "Hawayein",
    "artist": "Pritam & Arijit Singh",
    "album": "Jab Harry Met Sejal",
    "year": 2017,
    "language": "hindi",
    "difficulty": "impossible",
    "hookStartSeconds": 0,
    "previewUrl": "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview221/v4/15/d1/a8/15d1a862-edcd-6a92-624a-2bbf0f7eff26/mzaf_7165241817401822857.plus.aac.p.m4a",
    "stages": [
      1,
      2,
      4,
      7,
      11,
      16
    ],
    "hints": [
      "Massive hit by Pritam & Arijit Singh",
      "Featured in \"Jab Harry Met Sejal\" (2017)"
    ],
    "era": "2010s",
    "reversedPreviewUrl": "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview221/v4/15/d1/a8/15d1a862-edcd-6a92-624a-2bbf0f7eff26/mzaf_7165241817401822857.plus.aac.p.m4a",
    "startSound": "H",
    "endSound": "N",
    "startSyllable": "Hawayein",
    "endSyllable": "Hawayein",
    "startSoundLabel": "H (ह)",
    "endSoundLabel": "N (न)",
    "startDevanagari": "ह",
    "endDevanagari": "न/ण",
    "startWord": "Hawayein",
    "endWord": "Hawayein"
  },
  {
    "id": "hi_25",
    "title": "Dilliwaali Girlfriend",
    "artist": "Pritam, Arijit Singh & Sunidhi Chauhan",
    "album": "Yeh Jawaani Hai Deewani",
    "year": 2013,
    "language": "hindi",
    "difficulty": "easy",
    "hookStartSeconds": 0,
    "previewUrl": "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview211/v4/95/f6/5f/95f65f13-4a42-6b9a-2689-0b221473ea3b/mzaf_12878159079636166594.plus.aac.p.m4a",
    "stages": [
      1,
      2,
      4,
      7,
      11,
      16
    ],
    "hints": [
      "Massive hit by Pritam, Arijit Singh & Sunidhi Chauhan",
      "Featured in \"Yeh Jawaani Hai Deewani\" (2013)"
    ],
    "era": "2010s",
    "reversedPreviewUrl": "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview211/v4/95/f6/5f/95f65f13-4a42-6b9a-2689-0b221473ea3b/mzaf_12878159079636166594.plus.aac.p.m4a",
    "startSound": "D",
    "endSound": "D",
    "startSyllable": "Dilliwaali",
    "endSyllable": "Girlfriend",
    "startSoundLabel": "D (द)",
    "endSoundLabel": "D (द)",
    "startDevanagari": "द/ध/ड/ढ",
    "endDevanagari": "द/ध/ड/ढ",
    "startWord": "Dilliwaali",
    "endWord": "Girlfriend"
  },
  {
    "id": "hi_26",
    "title": "Raabta",
    "artist": "Pritam, Arijit Singh & Nikhita Gandhi",
    "album": "Raabta",
    "year": 2017,
    "language": "hindi",
    "difficulty": "medium",
    "hookStartSeconds": 0,
    "previewUrl": "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview221/v4/a1/64/ba/a164ba3d-286a-86b1-7733-4cb46bd32c42/mzaf_11652427257551252255.plus.aac.p.m4a",
    "stages": [
      1,
      2,
      4,
      7,
      11,
      16
    ],
    "hints": [
      "Massive hit by Pritam, Arijit Singh & Nikhita Gandhi",
      "Featured in \"Raabta\" (2017)"
    ],
    "era": "2010s",
    "reversedPreviewUrl": "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview221/v4/a1/64/ba/a164ba3d-286a-86b1-7733-4cb46bd32c42/mzaf_11652427257551252255.plus.aac.p.m4a",
    "startSound": "R",
    "endSound": "T",
    "startSyllable": "Raabta",
    "endSyllable": "Raabta",
    "startSoundLabel": "R (र)",
    "endSoundLabel": "T (त)",
    "startDevanagari": "र/ड़",
    "endDevanagari": "त/थ/ट/ठ",
    "startWord": "Raabta",
    "endWord": "Raabta"
  },
  {
    "id": "hi_27",
    "title": "Samjhawan",
    "artist": "Jawad Ahmed, Sharib Toshi, Arijit Singh & Shreya Ghoshal",
    "album": "Humpty Sharma Ki Dulhania",
    "year": 2014,
    "language": "hindi",
    "difficulty": "easy",
    "hookStartSeconds": 0,
    "previewUrl": "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview211/v4/65/06/39/65063981-71d1-0ac9-27a8-3d5d4aaae812/mzaf_10463263695656246233.plus.aac.p.m4a",
    "stages": [
      1,
      2,
      4,
      7,
      11,
      16
    ],
    "hints": [
      "Massive hit by Jawad Ahmed, Sharib Toshi, Arijit Singh & Shreya Ghoshal",
      "Featured in \"Humpty Sharma Ki Dulhania\" (2014)"
    ],
    "era": "2010s",
    "reversedPreviewUrl": "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview211/v4/65/06/39/65063981-71d1-0ac9-27a8-3d5d4aaae812/mzaf_10463263695656246233.plus.aac.p.m4a",
    "startSound": "S",
    "endSound": "N",
    "startSyllable": "Samjhawan",
    "endSyllable": "Samjhawan",
    "startSoundLabel": "S (स)",
    "endSoundLabel": "N (न)",
    "startDevanagari": "स/श/ष",
    "endDevanagari": "न/ण",
    "startWord": "Samjhawan",
    "endWord": "Samjhawan"
  },
  {
    "id": "hi_28",
    "title": "Soch Na Sake",
    "artist": "Amaal Mallik, Arijit Singh & Tulsi Kumar",
    "album": "Airlift",
    "year": 2015,
    "language": "hindi",
    "difficulty": "hard",
    "hookStartSeconds": 0,
    "previewUrl": "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview221/v4/72/9f/cc/729fccc5-f040-286a-9280-c4db3340e895/mzaf_7361386354918913207.plus.aac.p.m4a",
    "stages": [
      1,
      2,
      4,
      7,
      11,
      16
    ],
    "hints": [
      "Massive hit by Amaal Mallik, Arijit Singh & Tulsi Kumar",
      "Featured in \"Airlift\" (2015)"
    ],
    "era": "2010s",
    "reversedPreviewUrl": "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview221/v4/72/9f/cc/729fccc5-f040-286a-9280-c4db3340e895/mzaf_7361386354918913207.plus.aac.p.m4a",
    "startSound": "S",
    "endSound": "E",
    "startSyllable": "Soch",
    "endSyllable": "Sake",
    "startSoundLabel": "S (स)",
    "endSoundLabel": "E (ए)",
    "startDevanagari": "स/श/ष",
    "endDevanagari": "ए/ऐ",
    "startWord": "Soch",
    "endWord": "Sake"
  },
  {
    "id": "hi_29",
    "title": "The Breakup Song",
    "artist": "Pritam, Arijit Singh, Badshah, Jonita Gandhi & Nakash Aziz",
    "album": "Ae Dil Hai Mushkil",
    "year": 2016,
    "language": "hindi",
    "difficulty": "medium",
    "hookStartSeconds": 0,
    "previewUrl": "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview211/v4/da/9f/97/da9f97db-8166-2a2b-9d17-f39bad669fec/mzaf_2946091284630161949.plus.aac.p.m4a",
    "stages": [
      1,
      2,
      4,
      7,
      11,
      16
    ],
    "hints": [
      "Massive hit by Pritam, Arijit Singh, Badshah, Jonita Gandhi & Nakash Aziz",
      "Featured in \"Ae Dil Hai Mushkil\" (2016)"
    ],
    "era": "2010s",
    "reversedPreviewUrl": "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview211/v4/da/9f/97/da9f97db-8166-2a2b-9d17-f39bad669fec/mzaf_2946091284630161949.plus.aac.p.m4a",
    "startSound": "T",
    "endSound": "G",
    "startSyllable": "The",
    "endSyllable": "Song",
    "startSoundLabel": "T (त)",
    "endSoundLabel": "G (ग)",
    "startDevanagari": "त/थ/ट/ठ",
    "endDevanagari": "ग/घ",
    "startWord": "The",
    "endWord": "Song"
  },
  {
    "id": "hi_30",
    "title": "Ae Dil Hai Mushkil",
    "artist": "Pritam & Arijit Singh",
    "album": "Ae Dil Hai Mushkil",
    "year": 2016,
    "language": "hindi",
    "difficulty": "expert",
    "hookStartSeconds": 0,
    "previewUrl": "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview221/v4/11/4d/5f/114d5f2e-795e-67e0-0d33-b28045ef668a/mzaf_3719171959426225060.plus.aac.p.m4a",
    "stages": [
      1,
      2,
      4,
      7,
      11,
      16
    ],
    "hints": [
      "Massive hit by Pritam & Arijit Singh",
      "Featured in \"Ae Dil Hai Mushkil\" (2016)"
    ],
    "era": "2010s",
    "reversedPreviewUrl": "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview221/v4/11/4d/5f/114d5f2e-795e-67e0-0d33-b28045ef668a/mzaf_3719171959426225060.plus.aac.p.m4a",
    "startSound": "A",
    "endSound": "L",
    "startSyllable": "Ae",
    "endSyllable": "Mushkil",
    "startSoundLabel": "A (आ)",
    "endSoundLabel": "L (ल)",
    "startDevanagari": "अ/आ",
    "endDevanagari": "ल",
    "startWord": "Ae",
    "endWord": "Mushkil"
  },
  {
    "id": "hi_31",
    "title": "Tera Yaar Hoon Main",
    "artist": "Arijit Singh",
    "album": "Sonu Ke Titu Ki Sweety",
    "year": 2018,
    "language": "hindi",
    "difficulty": "easy",
    "hookStartSeconds": 0,
    "previewUrl": "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview221/v4/44/26/50/442650b7-256e-034a-380a-4bbf16e59e53/mzaf_272051127111758324.plus.aac.p.m4a",
    "stages": [
      1,
      2,
      4,
      7,
      11,
      16
    ],
    "hints": [
      "Massive hit by Arijit Singh",
      "Featured in \"Sonu Ke Titu Ki Sweety\" (2018)"
    ],
    "era": "2010s",
    "reversedPreviewUrl": "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview221/v4/44/26/50/442650b7-256e-034a-380a-4bbf16e59e53/mzaf_272051127111758324.plus.aac.p.m4a",
    "startSound": "T",
    "endSound": "N",
    "startSyllable": "Tera",
    "endSyllable": "Main",
    "startSoundLabel": "T (त)",
    "endSoundLabel": "N (न)",
    "startDevanagari": "त/थ/ट/ठ",
    "endDevanagari": "न/ण",
    "startWord": "Tera",
    "endWord": "Main"
  },
  {
    "id": "hi_32",
    "title": "Zaalima",
    "artist": "Arijit Singh & Harshdeep Kaur",
    "album": "Raees",
    "year": 2017,
    "language": "hindi",
    "difficulty": "impossible",
    "hookStartSeconds": 0,
    "previewUrl": "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview221/v4/cd/9f/4a/cd9f4a3f-8f5d-922b-2db9-933751017f8f/mzaf_8736831722992033377.plus.aac.p.m4a",
    "stages": [
      1,
      2,
      4,
      7,
      11,
      16
    ],
    "hints": [
      "Massive hit by Arijit Singh & Harshdeep Kaur",
      "Featured in \"Raees\" (2017)"
    ],
    "era": "2010s",
    "reversedPreviewUrl": "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview221/v4/cd/9f/4a/cd9f4a3f-8f5d-922b-2db9-933751017f8f/mzaf_8736831722992033377.plus.aac.p.m4a",
    "startSound": "Z",
    "endSound": "M",
    "startSyllable": "Zaalima",
    "endSyllable": "Zaalima",
    "startSoundLabel": "Z (ज़)",
    "endSoundLabel": "M (म)",
    "startDevanagari": "ज़",
    "endDevanagari": "म",
    "startWord": "Zaalima",
    "endWord": "Zaalima"
  },
  {
    "id": "hi_33",
    "title": "Jeene Laga Hoon",
    "artist": "Sachin-Jigar, Atif Aslam & Shreya Ghoshal",
    "album": "Best of Romance",
    "year": 2013,
    "language": "hindi",
    "difficulty": "easy",
    "hookStartSeconds": 0,
    "previewUrl": "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview211/v4/4b/2d/4f/4b2d4f04-d0cc-f881-d727-681654bc70b6/mzaf_13367997401121922565.plus.aac.p.m4a",
    "stages": [
      1,
      2,
      4,
      7,
      11,
      16
    ],
    "hints": [
      "Massive hit by Sachin-Jigar, Atif Aslam & Shreya Ghoshal",
      "Featured in \"Best of Romance\" (2026)"
    ],
    "era": "2010s",
    "reversedPreviewUrl": "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview211/v4/4b/2d/4f/4b2d4f04-d0cc-f881-d727-681654bc70b6/mzaf_13367997401121922565.plus.aac.p.m4a",
    "startSound": "J",
    "endSound": "N",
    "startSyllable": "Jeene",
    "endSyllable": "Hoon",
    "startSoundLabel": "J (ज)",
    "endSoundLabel": "N (न)",
    "startDevanagari": "ज/झ",
    "endDevanagari": "न/ण",
    "startWord": "Jeene",
    "endWord": "Hoon"
  },
  {
    "id": "hi_34",
    "title": "Rang Jo Lagyo",
    "artist": "Sachin-Jigar, Atif Aslam & Shreya Ghoshal",
    "album": "Best of Romance",
    "year": 2026,
    "language": "hindi",
    "difficulty": "medium",
    "hookStartSeconds": 0,
    "previewUrl": "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview221/v4/67/ae/b7/67aeb7cc-1f2c-6592-e0a1-b0b72e795ab5/mzaf_3335681661527723457.plus.aac.p.m4a",
    "stages": [
      1,
      2,
      4,
      7,
      11,
      16
    ],
    "hints": [
      "Massive hit by Sachin-Jigar, Atif Aslam & Shreya Ghoshal",
      "Featured in \"Best of Romance\" (2026)"
    ],
    "era": "new",
    "reversedPreviewUrl": "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview221/v4/67/ae/b7/67aeb7cc-1f2c-6592-e0a1-b0b72e795ab5/mzaf_3335681661527723457.plus.aac.p.m4a",
    "startSound": "R",
    "endSound": "Y",
    "startSyllable": "Rang",
    "endSyllable": "Lagyo",
    "startSoundLabel": "R (र)",
    "endSoundLabel": "Y (य)",
    "startDevanagari": "र/ड़",
    "endDevanagari": "य",
    "startWord": "Rang",
    "endWord": "Lagyo"
  },
  {
    "id": "hi_35",
    "title": "Tere Liye",
    "artist": "Atif Aslam, Shreya Ghoshal, Sachin Gupta & Sameer Anjaan",
    "album": "Best of Romance",
    "year": 2004,
    "language": "hindi",
    "difficulty": "easy",
    "hookStartSeconds": 0,
    "previewUrl": "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview221/v4/ed/a8/94/eda89425-5efe-56fc-d9fe-2ea66b4066e0/mzaf_17603165549467154971.plus.aac.p.m4a",
    "stages": [
      1,
      2,
      4,
      7,
      11,
      16
    ],
    "hints": [
      "Massive hit by Atif Aslam, Shreya Ghoshal, Sachin Gupta & Sameer Anjaan",
      "Featured in \"Best of Romance\" (2026)"
    ],
    "era": "2000s",
    "reversedPreviewUrl": "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview221/v4/ed/a8/94/eda89425-5efe-56fc-d9fe-2ea66b4066e0/mzaf_17603165549467154971.plus.aac.p.m4a",
    "startSound": "T",
    "endSound": "Y",
    "startSyllable": "Tere",
    "endSyllable": "Liye",
    "startSoundLabel": "T (त)",
    "endSoundLabel": "Y (य)",
    "startDevanagari": "त/थ/ट/ठ",
    "endDevanagari": "य",
    "startWord": "Tere",
    "endWord": "Liye"
  },
  {
    "id": "hi_36",
    "title": "Piya O Re Piya",
    "artist": "Sachin-Jigar, Atif Aslam & Shreya Ghoshal",
    "album": "Best of Romance",
    "year": 2026,
    "language": "hindi",
    "difficulty": "hard",
    "hookStartSeconds": 0,
    "previewUrl": "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview211/v4/15/86/c8/1586c825-1c89-f903-4d1b-74d4ba3f034a/mzaf_15145147228947309126.plus.aac.p.m4a",
    "stages": [
      1,
      2,
      4,
      7,
      11,
      16
    ],
    "hints": [
      "Massive hit by Sachin-Jigar, Atif Aslam & Shreya Ghoshal",
      "Featured in \"Best of Romance\" (2026)"
    ],
    "era": "new",
    "reversedPreviewUrl": "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview211/v4/15/86/c8/1586c825-1c89-f903-4d1b-74d4ba3f034a/mzaf_15145147228947309126.plus.aac.p.m4a",
    "startSound": "P",
    "endSound": "Y",
    "startSyllable": "Piya",
    "endSyllable": "Piya",
    "startSoundLabel": "P (प)",
    "endSoundLabel": "Y (य)",
    "startDevanagari": "प",
    "endDevanagari": "य",
    "startWord": "Piya",
    "endWord": "Piya"
  },
  {
    "id": "hi_37",
    "title": "Naamumkin",
    "artist": "Sachin-Jigar, Shreya Ghoshal, Varun Jain & Amitabh Bhattacharya",
    "album": "Bollywood New Love Hits",
    "year": 2026,
    "language": "hindi",
    "difficulty": "medium",
    "hookStartSeconds": 0,
    "previewUrl": "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview221/v4/26/6c/3c/266c3c37-01bf-f95a-9720-935f76a5e994/mzaf_14757561431345934629.plus.aac.p.m4a",
    "stages": [
      1,
      2,
      4,
      7,
      11,
      16
    ],
    "hints": [
      "Massive hit by Sachin-Jigar, Shreya Ghoshal, Varun Jain & Amitabh Bhattacharya",
      "Featured in \"Bollywood New Love Hits\" (2026)"
    ],
    "era": "new",
    "reversedPreviewUrl": "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview221/v4/26/6c/3c/266c3c37-01bf-f95a-9720-935f76a5e994/mzaf_14757561431345934629.plus.aac.p.m4a",
    "startSound": "N",
    "endSound": "N",
    "startSyllable": "Naamumkin",
    "endSyllable": "Naamumkin",
    "startSoundLabel": "N (न)",
    "endSoundLabel": "N (न)",
    "startDevanagari": "न/ण",
    "endDevanagari": "न/ण",
    "startWord": "Naamumkin",
    "endWord": "Naamumkin"
  },
  {
    "id": "hi_38",
    "title": "Saiyaara Reprise",
    "artist": "Tanishk Bagchi, Faheem Abdullah, Arslan Nizami, Shreya Ghoshal & Irshad Kamil",
    "album": "Saiyaara",
    "year": 2025,
    "language": "hindi",
    "difficulty": "expert",
    "hookStartSeconds": 0,
    "previewUrl": "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview211/v4/61/96/ac/6196ace1-d0fe-089f-f4ff-e322160010e1/mzaf_17718692881128881262.plus.aac.p.m4a",
    "stages": [
      1,
      2,
      4,
      7,
      11,
      16
    ],
    "hints": [
      "Massive hit by Tanishk Bagchi, Faheem Abdullah, Arslan Nizami, Shreya Ghoshal & Irshad Kamil",
      "Featured in \"Saiyaara\" (2025)"
    ],
    "era": "new",
    "reversedPreviewUrl": "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview211/v4/61/96/ac/6196ace1-d0fe-089f-f4ff-e322160010e1/mzaf_17718692881128881262.plus.aac.p.m4a",
    "startSound": "S",
    "endSound": "S",
    "startSyllable": "Saiyaara",
    "endSyllable": "Reprise",
    "startSoundLabel": "S (स)",
    "endSoundLabel": "S (स)",
    "startDevanagari": "स/श/ष",
    "endDevanagari": "स/श/ष",
    "startWord": "Saiyaara",
    "endWord": "Reprise"
  },
  {
    "id": "hi_39",
    "title": "Thodi Si Daaru",
    "artist": "AP Dhillon & Shreya Ghoshal",
    "album": "Thodi Si Daaru",
    "year": 2025,
    "language": "hindi",
    "difficulty": "easy",
    "hookStartSeconds": 0,
    "previewUrl": "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview221/v4/87/d8/cf/87d8cf61-85c6-daba-e756-a26d3f94bc52/mzaf_6968223182607551222.plus.aac.p.m4a",
    "stages": [
      1,
      2,
      4,
      7,
      11,
      16
    ],
    "hints": [
      "Massive hit by AP Dhillon & Shreya Ghoshal",
      "Featured in \"Thodi Si Daaru\" (2025)"
    ],
    "era": "new",
    "reversedPreviewUrl": "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview221/v4/87/d8/cf/87d8cf61-85c6-daba-e756-a26d3f94bc52/mzaf_6968223182607551222.plus.aac.p.m4a",
    "startSound": "T",
    "endSound": "R",
    "startSyllable": "Thodi",
    "endSyllable": "Daaru",
    "startSoundLabel": "T (त)",
    "endSoundLabel": "R (र)",
    "startDevanagari": "त/थ/ट/ठ",
    "endDevanagari": "र/ड़",
    "startWord": "Thodi",
    "endWord": "Daaru"
  },
  {
    "id": "hi_40",
    "title": "Teri Meri",
    "artist": "Rahat Fateh Ali Khan & Shreya Ghoshal",
    "album": "Bodyguard",
    "year": 2011,
    "language": "hindi",
    "difficulty": "impossible",
    "hookStartSeconds": 0,
    "previewUrl": "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview221/v4/7c/e5/61/7ce56139-27f0-adc2-910c-585947bc7978/mzaf_5981256548607018969.plus.aac.p.m4a",
    "stages": [
      1,
      2,
      4,
      7,
      11,
      16
    ],
    "hints": [
      "Massive hit by Rahat Fateh Ali Khan & Shreya Ghoshal",
      "Featured in \"Bodyguard\" (2011)"
    ],
    "era": "2010s",
    "reversedPreviewUrl": "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview221/v4/7c/e5/61/7ce56139-27f0-adc2-910c-585947bc7978/mzaf_5981256548607018969.plus.aac.p.m4a",
    "startSound": "T",
    "endSound": "R",
    "startSyllable": "Teri",
    "endSyllable": "Meri",
    "startSoundLabel": "T (त)",
    "endSoundLabel": "R (र)",
    "startDevanagari": "त/थ/ट/ठ",
    "endDevanagari": "र/ड़",
    "startWord": "Teri",
    "endWord": "Meri"
  },
  {
    "id": "hi_41",
    "title": "Teri Ore",
    "artist": "Rahat Fateh Ali Khan, Shreya Ghoshal & Pritam",
    "album": "Singh Is Kinng",
    "year": 2008,
    "language": "hindi",
    "difficulty": "easy",
    "hookStartSeconds": 0,
    "previewUrl": "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview211/v4/72/1e/13/721e13a2-7ea0-1dfb-7d9c-c5bbcf1f4df4/mzaf_14014711574677331364.plus.aac.p.m4a",
    "stages": [
      1,
      2,
      4,
      7,
      11,
      16
    ],
    "hints": [
      "Massive hit by Rahat Fateh Ali Khan, Shreya Ghoshal & Pritam",
      "Featured in \"Singh Is Kinng\" (2001)"
    ],
    "era": "2000s",
    "reversedPreviewUrl": "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview211/v4/72/1e/13/721e13a2-7ea0-1dfb-7d9c-c5bbcf1f4df4/mzaf_14014711574677331364.plus.aac.p.m4a",
    "startSound": "T",
    "endSound": "R",
    "startSyllable": "Teri",
    "endSyllable": "Ore",
    "startSoundLabel": "T (त)",
    "endSoundLabel": "R (र)",
    "startDevanagari": "त/थ/ट/ठ",
    "endDevanagari": "र/ड़",
    "startWord": "Teri",
    "endWord": "Ore"
  },
  {
    "id": "hi_42",
    "title": "Nagada Sang Dhol",
    "artist": "Sanjay Leela Bhansali, Shreya Ghoshal, Osman Mir & Siddharth-Garima",
    "album": "Goliyon Ki Raasleela Ram",
    "year": 2013,
    "language": "hindi",
    "difficulty": "medium",
    "hookStartSeconds": 0,
    "previewUrl": "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview211/v4/9d/61/f8/9d61f83f-aa69-c546-c815-3004b90164b3/mzaf_2767219084759408058.plus.aac.p.m4a",
    "stages": [
      1,
      2,
      4,
      7,
      11,
      16
    ],
    "hints": [
      "Massive hit by Sanjay Leela Bhansali, Shreya Ghoshal, Osman Mir & Siddharth-Garima",
      "Featured in \"Goliyon Ki Raasleela Ram\" (2013)"
    ],
    "era": "2010s",
    "reversedPreviewUrl": "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview211/v4/9d/61/f8/9d61f83f-aa69-c546-c815-3004b90164b3/mzaf_2767219084759408058.plus.aac.p.m4a",
    "startSound": "N",
    "endSound": "L",
    "startSyllable": "Nagada",
    "endSyllable": "Dhol",
    "startSoundLabel": "N (न)",
    "endSoundLabel": "L (ल)",
    "startDevanagari": "न/ण",
    "endDevanagari": "ल",
    "startWord": "Nagada",
    "endWord": "Dhol"
  },
  {
    "id": "hi_43",
    "title": "Param Sundari",
    "artist": "A.R. Rahman & Shreya Ghoshal",
    "album": "Mimi",
    "year": 2021,
    "language": "hindi",
    "difficulty": "easy",
    "hookStartSeconds": 0,
    "previewUrl": "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview221/v4/37/af/f0/37aff08b-cdfd-ae7e-7f0a-251d07f342d0/mzaf_4304999715906555670.plus.aac.p.m4a",
    "stages": [
      1,
      2,
      4,
      7,
      11,
      16
    ],
    "hints": [
      "Massive hit by A.R. Rahman & Shreya Ghoshal",
      "Featured in \"Mimi\" (2021)"
    ],
    "era": "new",
    "reversedPreviewUrl": "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview221/v4/37/af/f0/37aff08b-cdfd-ae7e-7f0a-251d07f342d0/mzaf_4304999715906555670.plus.aac.p.m4a",
    "startSound": "P",
    "endSound": "R",
    "startSyllable": "Param",
    "endSyllable": "Sundari",
    "startSoundLabel": "P (प)",
    "endSoundLabel": "R (र)",
    "startDevanagari": "प",
    "endDevanagari": "र/ड़",
    "startWord": "Param",
    "endWord": "Sundari"
  },
  {
    "id": "hi_44",
    "title": "Tabaah Ho Gaye",
    "artist": "Pritam & Shreya Ghoshal",
    "album": "Kalank",
    "year": 2019,
    "language": "hindi",
    "difficulty": "hard",
    "hookStartSeconds": 0,
    "previewUrl": "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview211/v4/96/32/f0/9632f09e-f0d7-6a8d-3237-7d060cbc2c38/mzaf_9620523506585837672.plus.aac.p.m4a",
    "stages": [
      1,
      2,
      4,
      7,
      11,
      16
    ],
    "hints": [
      "Massive hit by Pritam & Shreya Ghoshal",
      "Featured in \"Kalank\" (2019)"
    ],
    "era": "2010s",
    "reversedPreviewUrl": "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview211/v4/96/32/f0/9632f09e-f0d7-6a8d-3237-7d060cbc2c38/mzaf_9620523506585837672.plus.aac.p.m4a",
    "startSound": "T",
    "endSound": "Y",
    "startSyllable": "Tabaah",
    "endSyllable": "Gaye",
    "startSoundLabel": "T (त)",
    "endSoundLabel": "Y (य)",
    "startDevanagari": "त/थ/ट/ठ",
    "endDevanagari": "य",
    "startWord": "Tabaah",
    "endWord": "Gaye"
  },
  {
    "id": "hi_45",
    "title": "Deewani Mastani",
    "artist": "Sanjay Leela Bhansali, Shreya Ghoshal, Ganesh Chandanshive, Mujtaba Aziz Naza, Shadab Faridi, Altamash Faridi, Farhan Sabri & Siddharth-Garima",
    "album": "Bajirao Mastani",
    "year": 2015,
    "language": "hindi",
    "difficulty": "medium",
    "hookStartSeconds": 0,
    "previewUrl": "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview211/v4/ef/e6/b9/efe6b9d4-3318-19ff-01fa-5c51f2ffe9b9/mzaf_3533703985365202572.plus.aac.p.m4a",
    "stages": [
      1,
      2,
      4,
      7,
      11,
      16
    ],
    "hints": [
      "Massive hit by Sanjay Leela Bhansali, Shreya Ghoshal, Ganesh Chandanshive, Mujtaba Aziz Naza, Shadab Faridi, Altamash Faridi, Farhan Sabri & Siddharth-Garima",
      "Featured in \"Bajirao Mastani\" (2015)"
    ],
    "era": "2010s",
    "reversedPreviewUrl": "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview211/v4/ef/e6/b9/efe6b9d4-3318-19ff-01fa-5c51f2ffe9b9/mzaf_3533703985365202572.plus.aac.p.m4a",
    "startSound": "D",
    "endSound": "N",
    "startSyllable": "Deewani",
    "endSyllable": "Mastani",
    "startSoundLabel": "D (द)",
    "endSoundLabel": "N (न)",
    "startDevanagari": "द/ध/ड/ढ",
    "endDevanagari": "न/ण",
    "startWord": "Deewani",
    "endWord": "Mastani"
  },
  {
    "id": "hi_46",
    "title": "Main Agar Kahoon",
    "artist": "Sonu Nigam, Shreya Ghoshal & Vishal & Shekhar",
    "album": "Om Shanti Om",
    "year": 2007,
    "language": "hindi",
    "difficulty": "expert",
    "hookStartSeconds": 0,
    "previewUrl": "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview211/v4/6f/c6/6d/6fc66d9a-e830-b08a-ffe1-b67ed7d991e5/mzaf_5170129302151051752.plus.aac.p.m4a",
    "stages": [
      1,
      2,
      4,
      7,
      11,
      16
    ],
    "hints": [
      "Massive hit by Sonu Nigam, Shreya Ghoshal & Vishal & Shekhar",
      "Featured in \"Om Shanti Om\" (2007)"
    ],
    "era": "2000s",
    "reversedPreviewUrl": "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview211/v4/6f/c6/6d/6fc66d9a-e830-b08a-ffe1-b67ed7d991e5/mzaf_5170129302151051752.plus.aac.p.m4a",
    "startSound": "M",
    "endSound": "N",
    "startSyllable": "Main",
    "endSyllable": "Kahoon",
    "startSoundLabel": "M (म)",
    "endSoundLabel": "N (न)",
    "startDevanagari": "म",
    "endDevanagari": "न/ण",
    "startWord": "Main",
    "endWord": "Kahoon"
  },
  {
    "id": "hi_47",
    "title": "Ghoomar",
    "artist": "Shreya Ghoshal, Swaroop Khan & A M Turaz",
    "album": "Padmaavat",
    "year": 2017,
    "language": "hindi",
    "difficulty": "easy",
    "hookStartSeconds": 0,
    "previewUrl": "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview211/v4/d9/c9/40/d9c94030-237c-1acf-4bff-a8ea8f9abaa8/mzaf_3319838461581527542.plus.aac.p.m4a",
    "stages": [
      1,
      2,
      4,
      7,
      11,
      16
    ],
    "hints": [
      "Massive hit by Shreya Ghoshal, Swaroop Khan & A M Turaz",
      "Featured in \"Padmaavat\" (2017)"
    ],
    "era": "2010s",
    "reversedPreviewUrl": "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview211/v4/d9/c9/40/d9c94030-237c-1acf-4bff-a8ea8f9abaa8/mzaf_3319838461581527542.plus.aac.p.m4a",
    "startSound": "G",
    "endSound": "R",
    "startSyllable": "Ghoomar",
    "endSyllable": "Ghoomar",
    "startSoundLabel": "G (ग)",
    "endSoundLabel": "R (र)",
    "startDevanagari": "ग/घ",
    "endDevanagari": "र/ड़",
    "startWord": "Ghoomar",
    "endWord": "Ghoomar"
  },
  {
    "id": "hi_48",
    "title": "Tum Kya Mile",
    "artist": "Pritam, Arijit Singh, Shreya Ghoshal & Amitabh Bhattacharya",
    "album": "Tum Kya Mile",
    "year": 2023,
    "language": "hindi",
    "difficulty": "impossible",
    "hookStartSeconds": 0,
    "previewUrl": "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview211/v4/22/f8/f1/22f8f120-e3cb-31ed-2bf5-b217c1b17873/mzaf_15170293722669283908.plus.aac.p.m4a",
    "stages": [
      1,
      2,
      4,
      7,
      11,
      16
    ],
    "hints": [
      "Massive hit by Pritam, Arijit Singh, Shreya Ghoshal & Amitabh Bhattacharya",
      "Featured in \"Tum Kya Mile\" (2023)"
    ],
    "era": "new",
    "reversedPreviewUrl": "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview211/v4/22/f8/f1/22f8f120-e3cb-31ed-2bf5-b217c1b17873/mzaf_15170293722669283908.plus.aac.p.m4a",
    "startSound": "T",
    "endSound": "L",
    "startSyllable": "Tum",
    "endSyllable": "Mile",
    "startSoundLabel": "T (त)",
    "endSoundLabel": "L (ल)",
    "startDevanagari": "त/थ/ट/ठ",
    "endDevanagari": "ल",
    "startWord": "Tum",
    "endWord": "Mile"
  },
  {
    "id": "hi_49",
    "title": "Barso Re",
    "artist": "A.R. Rahman, Shreya Ghoshal & Uday Majumdar",
    "album": "Guru",
    "year": 2006,
    "language": "hindi",
    "difficulty": "easy",
    "hookStartSeconds": 0,
    "previewUrl": "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview221/v4/64/c9/32/64c932f0-4109-6760-2002-130797769cff/mzaf_3510266217199157761.plus.aac.p.m4a",
    "stages": [
      1,
      2,
      4,
      7,
      11,
      16
    ],
    "hints": [
      "Massive hit by A.R. Rahman, Shreya Ghoshal & Uday Majumdar",
      "Featured in \"Guru\" (2006)"
    ],
    "era": "2000s",
    "reversedPreviewUrl": "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview221/v4/64/c9/32/64c932f0-4109-6760-2002-130797769cff/mzaf_3510266217199157761.plus.aac.p.m4a",
    "startSound": "B",
    "endSound": "R",
    "startSyllable": "Barso",
    "endSyllable": "Re",
    "startSoundLabel": "B (ब)",
    "endSoundLabel": "R (र)",
    "startDevanagari": "ब/भ",
    "endDevanagari": "र/ड़",
    "startWord": "Barso",
    "endWord": "Re"
  },
  {
    "id": "hi_50",
    "title": "Ghar More Pardesiya",
    "artist": "Shreya Ghoshal & Pritam",
    "album": "Kalank",
    "year": 2019,
    "language": "hindi",
    "difficulty": "medium",
    "hookStartSeconds": 0,
    "previewUrl": "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview211/v4/9a/60/80/9a6080be-7d09-efa8-3159-205a6446aa0d/mzaf_10170063406531518646.plus.aac.p.m4a",
    "stages": [
      1,
      2,
      4,
      7,
      11,
      16
    ],
    "hints": [
      "Massive hit by Shreya Ghoshal & Pritam",
      "Featured in \"Kalank\" (2019)"
    ],
    "era": "2010s",
    "reversedPreviewUrl": "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview211/v4/9a/60/80/9a6080be-7d09-efa8-3159-205a6446aa0d/mzaf_10170063406531518646.plus.aac.p.m4a",
    "startSound": "G",
    "endSound": "Y",
    "startSyllable": "Ghar",
    "endSyllable": "Pardesiya",
    "startSoundLabel": "G (ग)",
    "endSoundLabel": "Y (य)",
    "startDevanagari": "ग/घ",
    "endDevanagari": "य",
    "startWord": "Ghar",
    "endWord": "Pardesiya"
  },
  {
    "id": "hi_51",
    "title": "Chikni Chameli",
    "artist": "Shreya Ghoshal & Ajay-Atul",
    "album": "Agneepath",
    "year": 2011,
    "language": "hindi",
    "difficulty": "easy",
    "hookStartSeconds": 0,
    "previewUrl": "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview211/v4/a3/9e/d7/a39ed7ef-c701-852b-c3fe-1a272c2f628a/mzaf_6941640775895803860.plus.aac.p.m4a",
    "stages": [
      1,
      2,
      4,
      7,
      11,
      16
    ],
    "hints": [
      "Massive hit by Shreya Ghoshal & Ajay-Atul",
      "Featured in \"Agneepath\" (2011)"
    ],
    "era": "2010s",
    "reversedPreviewUrl": "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview211/v4/a3/9e/d7/a39ed7ef-c701-852b-c3fe-1a272c2f628a/mzaf_6941640775895803860.plus.aac.p.m4a",
    "startSound": "CH",
    "endSound": "L",
    "startSyllable": "Chikni",
    "endSyllable": "Chameli",
    "startSoundLabel": "CH (च)",
    "endSoundLabel": "L (ल)",
    "startDevanagari": "च/छ",
    "endDevanagari": "ल",
    "startWord": "Chikni",
    "endWord": "Chameli"
  },
  {
    "id": "hi_52",
    "title": "Manwa Laage",
    "artist": "Shreya Ghoshal & Arijit Singh",
    "album": "Happy New Year",
    "year": 2014,
    "language": "hindi",
    "difficulty": "hard",
    "hookStartSeconds": 0,
    "previewUrl": "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview211/v4/b8/c5/80/b8c580f1-a0d3-f97b-182b-0ad433e15206/mzaf_2137440550280544636.plus.aac.p.m4a",
    "stages": [
      1,
      2,
      4,
      7,
      11,
      16
    ],
    "hints": [
      "Massive hit by Shreya Ghoshal & Arijit Singh",
      "Featured in \"Happy New Year\" (2014)"
    ],
    "era": "2010s",
    "reversedPreviewUrl": "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview211/v4/b8/c5/80/b8c580f1-a0d3-f97b-182b-0ad433e15206/mzaf_2137440550280544636.plus.aac.p.m4a",
    "startSound": "M",
    "endSound": "G",
    "startSyllable": "Manwa",
    "endSyllable": "Laage",
    "startSoundLabel": "M (म)",
    "endSoundLabel": "G (ग)",
    "startDevanagari": "म",
    "endDevanagari": "ग/घ",
    "startWord": "Manwa",
    "endWord": "Laage"
  },
  {
    "id": "pb_01",
    "title": "Brown Munde",
    "artist": "AP Dhillon, Gurinder Gill, Shinda Kahlon",
    "album": "Brown Munde",
    "year": 2020,
    "difficulty": "easy",
    "hints": [
      "Global Punjabi hip-hop wave",
      "G-Wagon anthem"
    ],
    "previewUrl": "/audio/brown-munde.m4a",
    "language": "punjabi",
    "stages": [
      1,
      2,
      4,
      7,
      11,
      16
    ],
    "hookStartSeconds": 0,
    "era": "new",
    "reversedPreviewUrl": "/audio/reversed/brown-munde.m4a",
    "startSound": "B",
    "endSound": "D",
    "startSyllable": "Brown",
    "endSyllable": "Munde",
    "startSoundLabel": "B (ब)",
    "endSoundLabel": "D (द)",
    "startDevanagari": "ब/भ",
    "endDevanagari": "द/ध/ड/ढ",
    "startWord": "Brown",
    "endWord": "Munde"
  },
  {
    "id": "pb_02",
    "title": "Amplifier",
    "artist": "Imran Khan",
    "album": "Unforgettable",
    "year": 2009,
    "difficulty": "medium",
    "hints": [
      "Dutch-Pakistani banger",
      "Gaadi sadi behja"
    ],
    "previewUrl": "/audio/amplifier.m4a",
    "language": "punjabi",
    "stages": [
      1,
      2,
      4,
      7,
      11,
      16
    ],
    "hookStartSeconds": 0,
    "era": "2000s",
    "reversedPreviewUrl": "/audio/reversed/amplifier.m4a",
    "startSound": "A",
    "endSound": "R",
    "startSyllable": "Amplifier",
    "endSyllable": "Amplifier",
    "startSoundLabel": "A (आ)",
    "endSoundLabel": "R (र)",
    "startDevanagari": "अ/आ",
    "endDevanagari": "र/ड़",
    "startWord": "Amplifier",
    "endWord": "Amplifier"
  },
  {
    "id": "pb_03",
    "title": "Lover",
    "artist": "Diljit Dosanjh",
    "album": "MoonChild Era",
    "year": 2021,
    "difficulty": "hard",
    "hints": [
      "Synthwave Punjabi sound",
      "Diljit Coachella vibe"
    ],
    "previewUrl": "/audio/lover.m4a",
    "language": "punjabi",
    "stages": [
      1,
      2,
      4,
      7,
      11,
      16
    ],
    "hookStartSeconds": 0,
    "era": "new",
    "reversedPreviewUrl": "/audio/reversed/lover.m4a",
    "startSound": "L",
    "endSound": "R",
    "startSyllable": "Lover",
    "endSyllable": "Lover",
    "startSoundLabel": "L (ल)",
    "endSoundLabel": "R (र)",
    "startDevanagari": "ल",
    "endDevanagari": "र/ड़",
    "startWord": "Lover",
    "endWord": "Lover"
  },
  {
    "id": "pb_04",
    "title": "Excuses",
    "artist": "AP Dhillon, Gurinder Gill",
    "album": "Hidden Gems",
    "year": 2020,
    "difficulty": "easy",
    "hints": [
      "Kehndi hundi si chan tak raah bana de",
      "Viral reels sensation"
    ],
    "previewUrl": "/audio/excuses.m4a",
    "language": "punjabi",
    "stages": [
      1,
      2,
      4,
      7,
      11,
      16
    ],
    "hookStartSeconds": 0,
    "era": "new",
    "reversedPreviewUrl": "/audio/reversed/excuses.m4a",
    "startSound": "E",
    "endSound": "S",
    "startSyllable": "Excuses",
    "endSyllable": "Excuses",
    "startSoundLabel": "E (ए)",
    "endSoundLabel": "S (स)",
    "startDevanagari": "ए/ऐ",
    "endDevanagari": "स/श/ष",
    "startWord": "Excuses",
    "endWord": "Excuses"
  },
  {
    "id": "pb_05",
    "title": "Insane",
    "artist": "AP Dhillon, Shinda Kahlon",
    "album": "Insane",
    "year": 2021,
    "difficulty": "medium",
    "hints": [
      "Dark trap Punjabi beat",
      "Gminxr production"
    ],
    "previewUrl": "/audio/insane.m4a",
    "language": "punjabi",
    "stages": [
      1,
      2,
      4,
      7,
      11,
      16
    ],
    "hookStartSeconds": 0,
    "era": "new",
    "reversedPreviewUrl": "/audio/reversed/insane.m4a",
    "startSound": "I",
    "endSound": "N",
    "startSyllable": "Insane",
    "endSyllable": "Insane",
    "startSoundLabel": "I (ई)",
    "endSoundLabel": "N (न)",
    "startDevanagari": "इ/ई",
    "endDevanagari": "न/ण",
    "startWord": "Insane",
    "endWord": "Insane"
  },
  {
    "id": "pb_06",
    "title": "High Rated Gabru",
    "artist": "Guru Randhawa",
    "album": "High Rated Gabru",
    "year": 2017,
    "difficulty": "easy",
    "hints": [
      "Billion views chart-topper",
      "Hayye nakhra tera ni"
    ],
    "previewUrl": "/audio/high-rated-gabru.m4a",
    "language": "punjabi",
    "stages": [
      1,
      2,
      4,
      7,
      11,
      16
    ],
    "hookStartSeconds": 0,
    "era": "2010s",
    "reversedPreviewUrl": "/audio/reversed/high-rated-gabru.m4a",
    "startSound": "H",
    "endSound": "R",
    "startSyllable": "High",
    "endSyllable": "Gabru",
    "startSoundLabel": "H (ह)",
    "endSoundLabel": "R (र)",
    "startDevanagari": "ह",
    "endDevanagari": "र/ड़",
    "startWord": "High",
    "endWord": "Gabru"
  },
  {
    "id": "pb_07",
    "title": "Lahore",
    "artist": "Guru Randhawa",
    "album": "Lahore",
    "year": 2017,
    "difficulty": "easy",
    "hints": [
      "Lagdi Lahore di aa",
      "Global Billboard ranking"
    ],
    "previewUrl": "/audio/lahore.m4a",
    "language": "punjabi",
    "stages": [
      1,
      2,
      4,
      7,
      11,
      16
    ],
    "hookStartSeconds": 0,
    "era": "2010s",
    "reversedPreviewUrl": "/audio/reversed/lahore.m4a",
    "startSound": "L",
    "endSound": "R",
    "startSyllable": "Lahore",
    "endSyllable": "Lahore",
    "startSoundLabel": "L (ल)",
    "endSoundLabel": "R (र)",
    "startDevanagari": "ल",
    "endDevanagari": "र/ड़",
    "startWord": "Lahore",
    "endWord": "Lahore"
  },
  {
    "id": "pb_08",
    "title": "Proper Patola",
    "artist": "Diljit Dosanjh, Badshah",
    "album": "Proper Patola",
    "year": 2018,
    "difficulty": "medium",
    "hints": [
      "Iconic urban Punjabi hit",
      "Diljit x Badshah collab"
    ],
    "previewUrl": "/audio/proper-patola.m4a",
    "language": "punjabi",
    "stages": [
      1,
      2,
      4,
      7,
      11,
      16
    ],
    "hookStartSeconds": 0,
    "era": "2010s",
    "reversedPreviewUrl": "/audio/reversed/proper-patola.m4a",
    "startSound": "P",
    "endSound": "L",
    "startSyllable": "Proper",
    "endSyllable": "Patola",
    "startSoundLabel": "P (प)",
    "endSoundLabel": "L (ल)",
    "startDevanagari": "प",
    "endDevanagari": "ल",
    "startWord": "Proper",
    "endWord": "Patola"
  },
  {
    "id": "pb_09",
    "title": "Do You Know",
    "artist": "Diljit Dosanjh",
    "album": "Do You Know",
    "year": 2016,
    "difficulty": "medium",
    "hints": [
      "Romantic signature ballad",
      "Jaani lyrics & B Praak"
    ],
    "previewUrl": "/audio/do-you-know.m4a",
    "language": "punjabi",
    "stages": [
      1,
      2,
      4,
      7,
      11,
      16
    ],
    "hookStartSeconds": 0,
    "era": "2010s",
    "reversedPreviewUrl": "/audio/reversed/do-you-know.m4a",
    "startSound": "D",
    "endSound": "V",
    "startSyllable": "Do",
    "endSyllable": "Know",
    "startSoundLabel": "D (द)",
    "endSoundLabel": "V (व)",
    "startDevanagari": "द/ध/ड/ढ",
    "endDevanagari": "व/W",
    "startWord": "Do",
    "endWord": "Know"
  },
  {
    "id": "pb_10",
    "title": "Prada",
    "artist": "Jass Manak",
    "album": "Prada",
    "year": 2018,
    "difficulty": "hard",
    "hints": [
      "Breakout anthem for Jass Manak",
      "Lehanga fame singer"
    ],
    "previewUrl": "/audio/prada.m4a",
    "language": "punjabi",
    "stages": [
      1,
      2,
      4,
      7,
      11,
      16
    ],
    "hookStartSeconds": 0,
    "era": "2010s",
    "reversedPreviewUrl": "/audio/reversed/prada.m4a",
    "startSound": "P",
    "endSound": "D",
    "startSyllable": "Prada",
    "endSyllable": "Prada",
    "startSoundLabel": "P (प)",
    "endSoundLabel": "D (द)",
    "startDevanagari": "प",
    "endDevanagari": "द/ध/ड/ढ",
    "startWord": "Prada",
    "endWord": "Prada"
  },
  {
    "id": "pb_11",
    "title": "Morni",
    "artist": "Diljit Dosanjh, Chani Nattan & Tru-Skool",
    "album": "The Call of Panjab",
    "year": 2026,
    "language": "punjabi",
    "difficulty": "easy",
    "hookStartSeconds": 0,
    "previewUrl": "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview221/v4/f5/6e/e4/f56ee414-2027-b605-7455-a24fbc433373/mzaf_3937962578481238111.plus.aac.p.m4a",
    "stages": [
      1,
      2,
      4,
      7,
      11,
      16
    ],
    "hints": [
      "Massive hit by Diljit Dosanjh, Chani Nattan & Tru-Skool",
      "Featured in \"The Call of Panjab\" (2026)"
    ],
    "era": "new",
    "reversedPreviewUrl": "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview221/v4/f5/6e/e4/f56ee414-2027-b605-7455-a24fbc433373/mzaf_3937962578481238111.plus.aac.p.m4a",
    "startSound": "M",
    "endSound": "N",
    "startSyllable": "Morni",
    "endSyllable": "Morni",
    "startSoundLabel": "M (म)",
    "endSoundLabel": "N (न)",
    "startDevanagari": "म",
    "endDevanagari": "न/ण",
    "startWord": "Morni",
    "endWord": "Morni"
  },
  {
    "id": "pb_12",
    "title": "Tere Paas Main",
    "artist": "A.R. Rahman, Irshad Kamil & Deepali Sahay",
    "album": "Bollywood New Love Hits",
    "year": 2026,
    "language": "punjabi",
    "difficulty": "hard",
    "hookStartSeconds": 0,
    "previewUrl": "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview221/v4/77/73/94/7773949e-b06c-4cbf-7123-0910751f7f73/mzaf_7957841193102258977.plus.aac.p.m4a",
    "stages": [
      1,
      2,
      4,
      7,
      11,
      16
    ],
    "hints": [
      "Massive hit by A.R. Rahman, Irshad Kamil & Deepali Sahay",
      "Featured in \"Bollywood New Love Hits\" (2026)"
    ],
    "era": "new",
    "reversedPreviewUrl": "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview221/v4/77/73/94/7773949e-b06c-4cbf-7123-0910751f7f73/mzaf_7957841193102258977.plus.aac.p.m4a",
    "startSound": "T",
    "endSound": "N",
    "startSyllable": "Tere",
    "endSyllable": "Main",
    "startSoundLabel": "T (त)",
    "endSoundLabel": "N (न)",
    "startDevanagari": "त/थ/ट/ठ",
    "endDevanagari": "न/ण",
    "startWord": "Tere",
    "endWord": "Main"
  },
  {
    "id": "pb_13",
    "title": "Maskara",
    "artist": "A.R. Rahman, Vedang Raina, Nilanjana Ghosh & Irshad Kamil",
    "album": "Bollywood New Love Hits",
    "year": 2026,
    "language": "punjabi",
    "difficulty": "medium",
    "hookStartSeconds": 0,
    "previewUrl": "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview221/v4/13/35/22/1335229a-c2bf-737e-1d39-7a1b513bfd52/mzaf_16633123156127684499.plus.aac.p.m4a",
    "stages": [
      1,
      2,
      4,
      7,
      11,
      16
    ],
    "hints": [
      "Massive hit by A.R. Rahman, Vedang Raina, Nilanjana Ghosh & Irshad Kamil",
      "Featured in \"Bollywood New Love Hits\" (2026)"
    ],
    "era": "new",
    "reversedPreviewUrl": "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview221/v4/13/35/22/1335229a-c2bf-737e-1d39-7a1b513bfd52/mzaf_16633123156127684499.plus.aac.p.m4a",
    "startSound": "M",
    "endSound": "R",
    "startSyllable": "Maskara",
    "endSyllable": "Maskara",
    "startSoundLabel": "M (म)",
    "endSoundLabel": "R (र)",
    "startDevanagari": "म",
    "endDevanagari": "र/ड़",
    "startWord": "Maskara",
    "endWord": "Maskara"
  },
  {
    "id": "pb_14",
    "title": "Naina",
    "artist": "Diljit Dosanjh, Badshah & Raj Ranjodh",
    "album": "Bollywood New Love Hits",
    "year": 2026,
    "language": "punjabi",
    "difficulty": "expert",
    "hookStartSeconds": 0,
    "previewUrl": "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview211/v4/1d/49/39/1d4939fe-d4bf-4805-638c-d4b3bd16e06b/mzaf_17683402818359607342.plus.aac.p.m4a",
    "stages": [
      1,
      2,
      4,
      7,
      11,
      16
    ],
    "hints": [
      "Massive hit by Diljit Dosanjh, Badshah & Raj Ranjodh",
      "Featured in \"Bollywood New Love Hits\" (2026)"
    ],
    "era": "new",
    "reversedPreviewUrl": "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview211/v4/1d/49/39/1d4939fe-d4bf-4805-638c-d4b3bd16e06b/mzaf_17683402818359607342.plus.aac.p.m4a",
    "startSound": "N",
    "endSound": "N",
    "startSyllable": "Naina",
    "endSyllable": "Naina",
    "startSoundLabel": "N (न)",
    "endSoundLabel": "N (न)",
    "startDevanagari": "न/ण",
    "endDevanagari": "न/ण",
    "startWord": "Naina",
    "endWord": "Naina"
  },
  {
    "id": "pb_15",
    "title": "Waliyan",
    "artist": "Diljit Dosanjh & thiarajxtt",
    "album": "Im an Artist Bro",
    "year": 2026,
    "language": "punjabi",
    "difficulty": "easy",
    "hookStartSeconds": 0,
    "previewUrl": "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview221/v4/4f/b5/2e/4fb52efa-e3f3-6148-2e1d-57c430a9d43b/mzaf_3267499481749907151.plus.aac.p.m4a",
    "stages": [
      1,
      2,
      4,
      7,
      11,
      16
    ],
    "hints": [
      "Massive hit by Diljit Dosanjh & thiarajxtt",
      "Featured in \"Im an Artist Bro\" (2026)"
    ],
    "era": "new",
    "reversedPreviewUrl": "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview221/v4/4f/b5/2e/4fb52efa-e3f3-6148-2e1d-57c430a9d43b/mzaf_3267499481749907151.plus.aac.p.m4a",
    "startSound": "V",
    "endSound": "N",
    "startSyllable": "Waliyan",
    "endSyllable": "Waliyan",
    "startSoundLabel": "V (व)",
    "endSoundLabel": "N (न)",
    "startDevanagari": "व/W",
    "endDevanagari": "न/ण",
    "startWord": "Waliyan",
    "endWord": "Waliyan"
  },
  {
    "id": "pb_16",
    "title": "Fizawan",
    "artist": "Diljit Dosanjh & Intense",
    "album": "Im an Artist Bro",
    "year": 2026,
    "language": "punjabi",
    "difficulty": "impossible",
    "hookStartSeconds": 0,
    "previewUrl": "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview221/v4/eb/74/e5/eb74e5dd-b56a-651b-339b-b7807b5b258f/mzaf_1729878272172403337.plus.aac.p.m4a",
    "stages": [
      1,
      2,
      4,
      7,
      11,
      16
    ],
    "hints": [
      "Massive hit by Diljit Dosanjh & Intense",
      "Featured in \"Im an Artist Bro\" (2026)"
    ],
    "era": "new",
    "reversedPreviewUrl": "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview221/v4/eb/74/e5/eb74e5dd-b56a-651b-339b-b7807b5b258f/mzaf_1729878272172403337.plus.aac.p.m4a",
    "startSound": "F",
    "endSound": "N",
    "startSyllable": "Fizawan",
    "endSyllable": "Fizawan",
    "startSoundLabel": "F (फ़)",
    "endSoundLabel": "N (न)",
    "startDevanagari": "फ़/फ",
    "endDevanagari": "न/ण",
    "startWord": "Fizawan",
    "endWord": "Fizawan"
  },
  {
    "id": "pb_17",
    "title": "Sweet Ting",
    "artist": "Diljit Dosanjh & thiarajxtt",
    "album": "Im an Artist Bro",
    "year": 2026,
    "language": "punjabi",
    "difficulty": "easy",
    "hookStartSeconds": 0,
    "previewUrl": "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview221/v4/60/b7/ed/60b7eda4-70d6-6bf5-5e82-f05c6676e6dd/mzaf_8085178124681752317.plus.aac.p.m4a",
    "stages": [
      1,
      2,
      4,
      7,
      11,
      16
    ],
    "hints": [
      "Massive hit by Diljit Dosanjh & thiarajxtt",
      "Featured in \"Im an Artist Bro\" (2026)"
    ],
    "era": "new",
    "reversedPreviewUrl": "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview221/v4/60/b7/ed/60b7eda4-70d6-6bf5-5e82-f05c6676e6dd/mzaf_8085178124681752317.plus.aac.p.m4a",
    "startSound": "S",
    "endSound": "G",
    "startSyllable": "Sweet",
    "endSyllable": "Ting",
    "startSoundLabel": "S (स)",
    "endSoundLabel": "G (ग)",
    "startDevanagari": "स/श/ष",
    "endDevanagari": "ग/घ",
    "startWord": "Sweet",
    "endWord": "Ting"
  },
  {
    "id": "pb_18",
    "title": "Love Like This",
    "artist": "Diljit Dosanjh, thiarajxtt & Simar",
    "album": "Im an Artist Bro",
    "year": 2026,
    "language": "punjabi",
    "difficulty": "medium",
    "hookStartSeconds": 0,
    "previewUrl": "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview211/v4/79/19/f9/7919f9ed-a8dd-51c9-9008-405d810fce24/mzaf_10230035391364041415.plus.aac.p.m4a",
    "stages": [
      1,
      2,
      4,
      7,
      11,
      16
    ],
    "hints": [
      "Massive hit by Diljit Dosanjh, thiarajxtt & Simar",
      "Featured in \"Im an Artist Bro\" (2026)"
    ],
    "era": "new",
    "reversedPreviewUrl": "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview211/v4/79/19/f9/7919f9ed-a8dd-51c9-9008-405d810fce24/mzaf_10230035391364041415.plus.aac.p.m4a",
    "startSound": "L",
    "endSound": "S",
    "startSyllable": "Love",
    "endSyllable": "This",
    "startSoundLabel": "L (ल)",
    "endSoundLabel": "S (स)",
    "startDevanagari": "ल",
    "endDevanagari": "स/श/ष",
    "startWord": "Love",
    "endWord": "This"
  },
  {
    "id": "pb_19",
    "title": "Lambo",
    "artist": "Diljit Dosanjh & Intense",
    "album": "Im an Artist Bro",
    "year": 2026,
    "language": "punjabi",
    "difficulty": "easy",
    "hookStartSeconds": 0,
    "previewUrl": "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview221/v4/38/a6/8e/38a68ebb-dffe-0eb4-2d6f-799d80090a0b/mzaf_191470908763982590.plus.aac.p.m4a",
    "stages": [
      1,
      2,
      4,
      7,
      11,
      16
    ],
    "hints": [
      "Massive hit by Diljit Dosanjh & Intense",
      "Featured in \"Im an Artist Bro\" (2026)"
    ],
    "era": "new",
    "reversedPreviewUrl": "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview221/v4/38/a6/8e/38a68ebb-dffe-0eb4-2d6f-799d80090a0b/mzaf_191470908763982590.plus.aac.p.m4a",
    "startSound": "L",
    "endSound": "B",
    "startSyllable": "Lambo",
    "endSyllable": "Lambo",
    "startSoundLabel": "L (ल)",
    "endSoundLabel": "B (ब)",
    "startDevanagari": "ल",
    "endDevanagari": "ब/भ",
    "startWord": "Lambo",
    "endWord": "Lambo"
  },
  {
    "id": "pb_20",
    "title": "Gustakhi",
    "artist": "Diljit Dosanjh & thiarajxtt",
    "album": "Im an Artist Bro",
    "year": 2026,
    "language": "punjabi",
    "difficulty": "hard",
    "hookStartSeconds": 0,
    "previewUrl": "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview221/v4/38/5a/87/385a8772-917d-9366-113f-ff974edd39e6/mzaf_3106516877787382513.plus.aac.p.m4a",
    "stages": [
      1,
      2,
      4,
      7,
      11,
      16
    ],
    "hints": [
      "Massive hit by Diljit Dosanjh & thiarajxtt",
      "Featured in \"Im an Artist Bro\" (2026)"
    ],
    "era": "new",
    "reversedPreviewUrl": "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview221/v4/38/5a/87/385a8772-917d-9366-113f-ff974edd39e6/mzaf_3106516877787382513.plus.aac.p.m4a",
    "startSound": "G",
    "endSound": "H",
    "startSyllable": "Gustakhi",
    "endSyllable": "Gustakhi",
    "startSoundLabel": "G (ग)",
    "endSoundLabel": "H (ह)",
    "startDevanagari": "ग/घ",
    "endDevanagari": "ह",
    "startWord": "Gustakhi",
    "endWord": "Gustakhi"
  },
  {
    "id": "pb_21",
    "title": "Dealer",
    "artist": "Diljit Dosanjh",
    "album": "Dealer",
    "year": 2026,
    "language": "punjabi",
    "difficulty": "medium",
    "hookStartSeconds": 0,
    "previewUrl": "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview221/v4/c9/f5/36/c9f53664-7e5f-1646-347a-a3836c6b24b4/mzaf_14025775664665894818.plus.aac.p.m4a",
    "stages": [
      1,
      2,
      4,
      7,
      11,
      16
    ],
    "hints": [
      "Massive hit by Diljit Dosanjh",
      "Featured in \"Dealer\" (2026)"
    ],
    "era": "new",
    "reversedPreviewUrl": "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview221/v4/c9/f5/36/c9f53664-7e5f-1646-347a-a3836c6b24b4/mzaf_14025775664665894818.plus.aac.p.m4a",
    "startSound": "D",
    "endSound": "R",
    "startSyllable": "Dealer",
    "endSyllable": "Dealer",
    "startSoundLabel": "D (द)",
    "endSoundLabel": "R (र)",
    "startDevanagari": "द/ध/ड/ढ",
    "endDevanagari": "र/ड़",
    "startWord": "Dealer",
    "endWord": "Dealer"
  },
  {
    "id": "pb_22",
    "title": "Devil",
    "artist": "Diljit Dosanjh & Intense",
    "album": "Im an Artist Bro",
    "year": 2026,
    "language": "punjabi",
    "difficulty": "expert",
    "hookStartSeconds": 0,
    "previewUrl": "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview211/v4/8f/d4/38/8fd438af-5e35-70b2-593d-618ba9f177d6/mzaf_3000434930303075538.plus.aac.p.m4a",
    "stages": [
      1,
      2,
      4,
      7,
      11,
      16
    ],
    "hints": [
      "Massive hit by Diljit Dosanjh & Intense",
      "Featured in \"Im an Artist Bro\" (2026)"
    ],
    "era": "new",
    "reversedPreviewUrl": "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview211/v4/8f/d4/38/8fd438af-5e35-70b2-593d-618ba9f177d6/mzaf_3000434930303075538.plus.aac.p.m4a",
    "startSound": "D",
    "endSound": "L",
    "startSyllable": "Devil",
    "endSyllable": "Devil",
    "startSoundLabel": "D (द)",
    "endSoundLabel": "L (ल)",
    "startDevanagari": "द/ध/ड/ढ",
    "endDevanagari": "ल",
    "startWord": "Devil",
    "endWord": "Devil"
  },
  {
    "id": "pb_23",
    "title": "G.O.A.T.",
    "artist": "Diljit Dosanjh",
    "album": "G.O.A.T.",
    "year": 2020,
    "language": "punjabi",
    "difficulty": "easy",
    "hookStartSeconds": 0,
    "previewUrl": "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview221/v4/ba/5c/57/ba5c5769-536b-1884-dfbf-5930cab13332/mzaf_7745269360294572986.plus.aac.p.m4a",
    "stages": [
      1,
      2,
      4,
      7,
      11,
      16
    ],
    "hints": [
      "Massive hit by Diljit Dosanjh",
      "Featured in \"G.O.A.T.\" (2020)"
    ],
    "era": "new",
    "reversedPreviewUrl": "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview221/v4/ba/5c/57/ba5c5769-536b-1884-dfbf-5930cab13332/mzaf_7745269360294572986.plus.aac.p.m4a",
    "startSound": "G",
    "endSound": "T",
    "startSyllable": "Goat",
    "endSyllable": "Goat",
    "startSoundLabel": "G (ग)",
    "endSoundLabel": "T (त)",
    "startDevanagari": "ग/घ",
    "endDevanagari": "त/थ/ट/ठ",
    "startWord": "Goat",
    "endWord": "Goat"
  },
  {
    "id": "pb_24",
    "title": "Hass Hass",
    "artist": "Diljit Dosanjh, Sia & Greg Kurstin",
    "album": "Hass Hass",
    "year": 2023,
    "language": "punjabi",
    "difficulty": "impossible",
    "hookStartSeconds": 0,
    "previewUrl": "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview211/v4/eb/db/03/ebdb0359-01ba-81fe-aeb6-951c3a6dbad7/mzaf_15406119153944779161.plus.aac.p.m4a",
    "stages": [
      1,
      2,
      4,
      7,
      11,
      16
    ],
    "hints": [
      "Massive hit by Diljit Dosanjh, Sia & Greg Kurstin",
      "Featured in \"Hass Hass\" (2023)"
    ],
    "era": "new",
    "reversedPreviewUrl": "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview211/v4/eb/db/03/ebdb0359-01ba-81fe-aeb6-951c3a6dbad7/mzaf_15406119153944779161.plus.aac.p.m4a",
    "startSound": "H",
    "endSound": "S",
    "startSyllable": "Hass",
    "endSyllable": "Hass",
    "startSoundLabel": "H (ह)",
    "endSoundLabel": "S (स)",
    "startDevanagari": "ह",
    "endDevanagari": "स/श/ष",
    "startWord": "Hass",
    "endWord": "Hass"
  },
  {
    "id": "pb_25",
    "title": "Kinni Kinni",
    "artist": "Diljit Dosanjh",
    "album": "Ghost",
    "year": 2023,
    "language": "punjabi",
    "difficulty": "easy",
    "hookStartSeconds": 0,
    "previewUrl": "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview211/v4/72/0b/25/720b2576-27b5-671c-d535-410670f2ed65/mzaf_3758350615454838636.plus.aac.p.m4a",
    "stages": [
      1,
      2,
      4,
      7,
      11,
      16
    ],
    "hints": [
      "Massive hit by Diljit Dosanjh",
      "Featured in \"Ghost\" (2023)"
    ],
    "era": "new",
    "reversedPreviewUrl": "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview211/v4/72/0b/25/720b2576-27b5-671c-d535-410670f2ed65/mzaf_3758350615454838636.plus.aac.p.m4a",
    "startSound": "K",
    "endSound": "N",
    "startSyllable": "Kinni",
    "endSyllable": "Kinni",
    "startSoundLabel": "K (क)",
    "endSoundLabel": "N (न)",
    "startDevanagari": "क/ख",
    "endDevanagari": "न/ण",
    "startWord": "Kinni",
    "endWord": "Kinni"
  },
  {
    "id": "pb_26",
    "title": "God Bless",
    "artist": "Diljit Dosanjh, Sunny Malton, Offgrid & Ranbir Singh",
    "album": "AURA",
    "year": 2025,
    "language": "punjabi",
    "difficulty": "medium",
    "hookStartSeconds": 0,
    "previewUrl": "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview211/v4/01/31/80/01318075-3bd0-1039-31b8-446f7a10ef54/mzaf_1235216793633511688.plus.aac.p.m4a",
    "stages": [
      1,
      2,
      4,
      7,
      11,
      16
    ],
    "hints": [
      "Massive hit by Diljit Dosanjh, Sunny Malton, Offgrid & Ranbir Singh",
      "Featured in \"AURA\" (2025)"
    ],
    "era": "new",
    "reversedPreviewUrl": "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview211/v4/01/31/80/01318075-3bd0-1039-31b8-446f7a10ef54/mzaf_1235216793633511688.plus.aac.p.m4a",
    "startSound": "G",
    "endSound": "S",
    "startSyllable": "God",
    "endSyllable": "Bless",
    "startSoundLabel": "G (ग)",
    "endSoundLabel": "S (स)",
    "startDevanagari": "ग/घ",
    "endDevanagari": "स/श/ष",
    "startWord": "God",
    "endWord": "Bless"
  },
  {
    "id": "pb_27",
    "title": "Born to Shine",
    "artist": "Diljit Dosanjh",
    "album": "G.O.A.T.",
    "year": 2020,
    "language": "punjabi",
    "difficulty": "easy",
    "hookStartSeconds": 0,
    "previewUrl": "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview221/v4/38/12/41/38124195-4bd9-1fc7-fe40-f793ee38d163/mzaf_14837378210736189248.plus.aac.p.m4a",
    "stages": [
      1,
      2,
      4,
      7,
      11,
      16
    ],
    "hints": [
      "Massive hit by Diljit Dosanjh",
      "Featured in \"G.O.A.T.\" (2020)"
    ],
    "era": "new",
    "reversedPreviewUrl": "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview221/v4/38/12/41/38124195-4bd9-1fc7-fe40-f793ee38d163/mzaf_14837378210736189248.plus.aac.p.m4a",
    "startSound": "B",
    "endSound": "N",
    "startSyllable": "Born",
    "endSyllable": "Shine",
    "startSoundLabel": "B (ब)",
    "endSoundLabel": "N (न)",
    "startDevanagari": "ब/भ",
    "endDevanagari": "न/ण",
    "startWord": "Born",
    "endWord": "Shine"
  },
  {
    "id": "pb_28",
    "title": "Charmer",
    "artist": "Diljit Dosanjh, Avvy Sra & Raj Ranjodh",
    "album": "AURA",
    "year": 2025,
    "language": "punjabi",
    "difficulty": "hard",
    "hookStartSeconds": 0,
    "previewUrl": "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview221/v4/8c/d1/64/8cd164a2-eca2-9721-be13-a2ba01f96985/mzaf_8167614870836702274.plus.aac.p.m4a",
    "stages": [
      1,
      2,
      4,
      7,
      11,
      16
    ],
    "hints": [
      "Massive hit by Diljit Dosanjh, Avvy Sra & Raj Ranjodh",
      "Featured in \"AURA\" (2025)"
    ],
    "era": "new",
    "reversedPreviewUrl": "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview221/v4/8c/d1/64/8cd164a2-eca2-9721-be13-a2ba01f96985/mzaf_8167614870836702274.plus.aac.p.m4a",
    "startSound": "CH",
    "endSound": "R",
    "startSyllable": "Charmer",
    "endSyllable": "Charmer",
    "startSoundLabel": "CH (च)",
    "endSoundLabel": "R (र)",
    "startDevanagari": "च/छ",
    "endDevanagari": "र/ड़",
    "startWord": "Charmer",
    "endWord": "Charmer"
  },
  {
    "id": "pb_29",
    "title": "Vibe",
    "artist": "Diljit Dosanjh",
    "album": "MoonChild Era",
    "year": 2021,
    "language": "punjabi",
    "difficulty": "medium",
    "hookStartSeconds": 0,
    "previewUrl": "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview221/v4/62/8a/36/628a36d9-fe94-ad7a-02d9-e12e25c1a765/mzaf_14288362415021829966.plus.aac.p.m4a",
    "stages": [
      1,
      2,
      4,
      7,
      11,
      16
    ],
    "hints": [
      "Massive hit by Diljit Dosanjh",
      "Featured in \"MoonChild Era\" (2021)"
    ],
    "era": "new",
    "reversedPreviewUrl": "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview221/v4/62/8a/36/628a36d9-fe94-ad7a-02d9-e12e25c1a765/mzaf_14288362415021829966.plus.aac.p.m4a",
    "startSound": "V",
    "endSound": "B",
    "startSyllable": "Vibe",
    "endSyllable": "Vibe",
    "startSoundLabel": "V (व)",
    "endSoundLabel": "B (ब)",
    "startDevanagari": "व/W",
    "endDevanagari": "ब/भ",
    "startWord": "Vibe",
    "endWord": "Vibe"
  },
  {
    "id": "pb_30",
    "title": "Kufar",
    "artist": "Diljit Dosanjh, Mixsingh & Raj Ranjodh",
    "album": "AURA",
    "year": 2025,
    "language": "punjabi",
    "difficulty": "expert",
    "hookStartSeconds": 0,
    "previewUrl": "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview221/v4/ee/b8/6d/eeb86d90-2ee7-6932-1696-563442db5f2c/mzaf_110250619489375199.plus.aac.p.m4a",
    "stages": [
      1,
      2,
      4,
      7,
      11,
      16
    ],
    "hints": [
      "Massive hit by Diljit Dosanjh, Mixsingh & Raj Ranjodh",
      "Featured in \"AURA\" (2025)"
    ],
    "era": "new",
    "reversedPreviewUrl": "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview221/v4/ee/b8/6d/eeb86d90-2ee7-6932-1696-563442db5f2c/mzaf_110250619489375199.plus.aac.p.m4a",
    "startSound": "K",
    "endSound": "R",
    "startSyllable": "Kufar",
    "endSyllable": "Kufar",
    "startSoundLabel": "K (क)",
    "endSoundLabel": "R (र)",
    "startDevanagari": "क/ख",
    "endDevanagari": "र/ड़",
    "startWord": "Kufar",
    "endWord": "Kufar"
  },
  {
    "id": "pb_31",
    "title": "Clash",
    "artist": "Diljit Dosanjh",
    "album": "G.O.A.T.",
    "year": 2020,
    "language": "punjabi",
    "difficulty": "easy",
    "hookStartSeconds": 0,
    "previewUrl": "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview211/v4/fa/2d/fc/fa2dfc04-a11e-1f92-b930-3570a2b9f678/mzaf_385503078900813650.plus.aac.p.m4a",
    "stages": [
      1,
      2,
      4,
      7,
      11,
      16
    ],
    "hints": [
      "Massive hit by Diljit Dosanjh",
      "Featured in \"G.O.A.T.\" (2020)"
    ],
    "era": "new",
    "reversedPreviewUrl": "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview211/v4/fa/2d/fc/fa2dfc04-a11e-1f92-b930-3570a2b9f678/mzaf_385503078900813650.plus.aac.p.m4a",
    "startSound": "K",
    "endSound": "S",
    "startSyllable": "Clash",
    "endSyllable": "Clash",
    "startSoundLabel": "K (क)",
    "endSoundLabel": "S (स)",
    "startDevanagari": "क/ख",
    "endDevanagari": "स/श/ष",
    "startWord": "Clash",
    "endWord": "Clash"
  },
  {
    "id": "pb_32",
    "title": "Lalkara",
    "artist": "Diljit Dosanjh",
    "album": "Ghost",
    "year": 2023,
    "language": "punjabi",
    "difficulty": "impossible",
    "hookStartSeconds": 0,
    "previewUrl": "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview221/v4/fc/14/9d/fc149d13-a7b2-1513-3277-13d7ce8501e9/mzaf_15135201120387957557.plus.aac.p.m4a",
    "stages": [
      1,
      2,
      4,
      7,
      11,
      16
    ],
    "hints": [
      "Massive hit by Diljit Dosanjh",
      "Featured in \"Ghost\" (2023)"
    ],
    "era": "new",
    "reversedPreviewUrl": "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview221/v4/fc/14/9d/fc149d13-a7b2-1513-3277-13d7ce8501e9/mzaf_15135201120387957557.plus.aac.p.m4a",
    "startSound": "L",
    "endSound": "R",
    "startSyllable": "Lalkara",
    "endSyllable": "Lalkara",
    "startSoundLabel": "L (ल)",
    "endSoundLabel": "R (र)",
    "startDevanagari": "ल",
    "endDevanagari": "र/ड़",
    "startWord": "Lalkara",
    "endWord": "Lalkara"
  },
  {
    "id": "pb_33",
    "title": "High End",
    "artist": "Diljit Dosanjh",
    "album": "Con.Fi.Den.Tial",
    "year": 2018,
    "language": "punjabi",
    "difficulty": "easy",
    "hookStartSeconds": 0,
    "previewUrl": "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview221/v4/ba/fd/94/bafd94d3-81e1-4180-3c0d-60b958c0b93c/mzaf_17806157143260225992.plus.aac.p.m4a",
    "stages": [
      1,
      2,
      4,
      7,
      11,
      16
    ],
    "hints": [
      "Massive hit by Diljit Dosanjh",
      "Featured in \"Con.Fi.Den.Tial\" (2018)"
    ],
    "era": "2010s",
    "reversedPreviewUrl": "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview221/v4/ba/fd/94/bafd94d3-81e1-4180-3c0d-60b958c0b93c/mzaf_17806157143260225992.plus.aac.p.m4a",
    "startSound": "H",
    "endSound": "D",
    "startSyllable": "High",
    "endSyllable": "End",
    "startSoundLabel": "H (ह)",
    "endSoundLabel": "D (द)",
    "startDevanagari": "ह",
    "endDevanagari": "द/ध/ड/ढ",
    "startWord": "High",
    "endWord": "End"
  },
  {
    "id": "pb_34",
    "title": "Din Shagna Da",
    "artist": "Jasleen Royal",
    "album": "Phillauri",
    "year": 2017,
    "language": "punjabi",
    "difficulty": "medium",
    "hookStartSeconds": 0,
    "previewUrl": "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview221/v4/4f/cc/f8/4fccf86a-eedd-0bba-a3ba-c44041835c9a/mzaf_10644835758459052916.plus.aac.p.m4a",
    "stages": [
      1,
      2,
      4,
      7,
      11,
      16
    ],
    "hints": [
      "Massive hit by Jasleen Royal",
      "Featured in \"Phillauri\" (2017)"
    ],
    "era": "2010s",
    "reversedPreviewUrl": "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview221/v4/4f/cc/f8/4fccf86a-eedd-0bba-a3ba-c44041835c9a/mzaf_10644835758459052916.plus.aac.p.m4a",
    "startSound": "D",
    "endSound": "D",
    "startSyllable": "Din",
    "endSyllable": "Da",
    "startSoundLabel": "D (द)",
    "endSoundLabel": "D (द)",
    "startDevanagari": "द/ध/ड/ढ",
    "endDevanagari": "द/ध/ड/ढ",
    "startWord": "Din",
    "endWord": "Da"
  },
  {
    "id": "pb_35",
    "title": "Black & White",
    "artist": "Diljit Dosanjh",
    "album": "MoonChild Era",
    "year": 2021,
    "language": "punjabi",
    "difficulty": "easy",
    "hookStartSeconds": 0,
    "previewUrl": "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview221/v4/f5/51/20/f55120a4-722e-fb05-c925-645e045cc892/mzaf_14344133666199467193.plus.aac.p.m4a",
    "stages": [
      1,
      2,
      4,
      7,
      11,
      16
    ],
    "hints": [
      "Massive hit by Diljit Dosanjh",
      "Featured in \"MoonChild Era\" (2021)"
    ],
    "era": "new",
    "reversedPreviewUrl": "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview221/v4/f5/51/20/f55120a4-722e-fb05-c925-645e045cc892/mzaf_14344133666199467193.plus.aac.p.m4a",
    "startSound": "B",
    "endSound": "T",
    "startSyllable": "Black",
    "endSyllable": "White",
    "startSoundLabel": "B (ब)",
    "endSoundLabel": "T (त)",
    "startDevanagari": "ब/भ",
    "endDevanagari": "त/थ/ट/ठ",
    "startWord": "Black",
    "endWord": "White"
  },
  {
    "id": "pb_36",
    "title": "Lemonade",
    "artist": "Diljit Dosanjh",
    "album": "Drive Thru",
    "year": 2022,
    "language": "punjabi",
    "difficulty": "hard",
    "hookStartSeconds": 0,
    "previewUrl": "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview211/v4/18/27/b1/1827b18b-6b70-6c1d-3665-38f2c0effc74/mzaf_158287080029555485.plus.aac.p.m4a",
    "stages": [
      1,
      2,
      4,
      7,
      11,
      16
    ],
    "hints": [
      "Massive hit by Diljit Dosanjh",
      "Featured in \"Drive Thru\" (2022)"
    ],
    "era": "new",
    "reversedPreviewUrl": "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview211/v4/18/27/b1/1827b18b-6b70-6c1d-3665-38f2c0effc74/mzaf_158287080029555485.plus.aac.p.m4a",
    "startSound": "L",
    "endSound": "D",
    "startSyllable": "Lemonade",
    "endSyllable": "Lemonade",
    "startSoundLabel": "L (ल)",
    "endSoundLabel": "D (द)",
    "startDevanagari": "ल",
    "endDevanagari": "द/ध/ड/ढ",
    "startWord": "Lemonade",
    "endWord": "Lemonade"
  },
  {
    "id": "pb_37",
    "title": "So High",
    "artist": "Sidhu Moose Wala",
    "album": "So High",
    "year": 2017,
    "language": "punjabi",
    "difficulty": "medium",
    "hookStartSeconds": 0,
    "previewUrl": "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview211/v4/cf/6f/b6/cf6fb600-051d-66f2-4acb-df0259000b60/mzaf_13129631117141800671.plus.aac.p.m4a",
    "stages": [
      1,
      2,
      4,
      7,
      11,
      16
    ],
    "hints": [
      "Massive hit by Sidhu Moose Wala",
      "Featured in \"So High\" (2017)"
    ],
    "era": "2010s",
    "reversedPreviewUrl": "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview211/v4/cf/6f/b6/cf6fb600-051d-66f2-4acb-df0259000b60/mzaf_13129631117141800671.plus.aac.p.m4a",
    "startSound": "S",
    "endSound": "H",
    "startSyllable": "So",
    "endSyllable": "High",
    "startSoundLabel": "S (स)",
    "endSoundLabel": "H (ह)",
    "startDevanagari": "स/श/ष",
    "endDevanagari": "ह",
    "startWord": "So",
    "endWord": "High"
  },
  {
    "id": "pb_38",
    "title": "Never Fold",
    "artist": "Sidhu Moose Wala",
    "album": "No Name",
    "year": 2022,
    "language": "punjabi",
    "difficulty": "expert",
    "hookStartSeconds": 0,
    "previewUrl": "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview221/v4/6c/2b/b5/6c2bb54c-cbb6-558e-87e6-cc750aa39c54/mzaf_11043876483606963092.plus.aac.p.m4a",
    "stages": [
      1,
      2,
      4,
      7,
      11,
      16
    ],
    "hints": [
      "Massive hit by Sidhu Moose Wala",
      "Featured in \"No Name\" (2022)"
    ],
    "era": "new",
    "reversedPreviewUrl": "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview221/v4/6c/2b/b5/6c2bb54c-cbb6-558e-87e6-cc750aa39c54/mzaf_11043876483606963092.plus.aac.p.m4a",
    "startSound": "N",
    "endSound": "D",
    "startSyllable": "Never",
    "endSyllable": "Fold",
    "startSoundLabel": "N (न)",
    "endSoundLabel": "D (द)",
    "startDevanagari": "न/ण",
    "endDevanagari": "द/ध/ड/ढ",
    "startWord": "Never",
    "endWord": "Fold"
  },
  {
    "id": "pb_39",
    "title": "The Last Ride",
    "artist": "Sidhu Moose Wala",
    "album": "The Last Ride",
    "year": 2022,
    "language": "punjabi",
    "difficulty": "easy",
    "hookStartSeconds": 0,
    "previewUrl": "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview211/v4/f9/db/be/f9dbbefa-0600-ad3f-6a71-32d17c9e7040/mzaf_5987343399381681108.plus.aac.p.m4a",
    "stages": [
      1,
      2,
      4,
      7,
      11,
      16
    ],
    "hints": [
      "Massive hit by Sidhu Moose Wala",
      "Featured in \"The Last Ride\" (2022)"
    ],
    "era": "new",
    "reversedPreviewUrl": "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview211/v4/f9/db/be/f9dbbefa-0600-ad3f-6a71-32d17c9e7040/mzaf_5987343399381681108.plus.aac.p.m4a",
    "startSound": "T",
    "endSound": "D",
    "startSyllable": "The",
    "endSyllable": "Ride",
    "startSoundLabel": "T (त)",
    "endSoundLabel": "D (द)",
    "startDevanagari": "त/थ/ट/ठ",
    "endDevanagari": "द/ध/ड/ढ",
    "startWord": "The",
    "endWord": "Ride"
  },
  {
    "id": "pb_40",
    "title": "Eyes on Me",
    "artist": "Sidhu Moose Wala & The Kidd",
    "album": "Eyes on Me",
    "year": 2026,
    "language": "punjabi",
    "difficulty": "impossible",
    "hookStartSeconds": 0,
    "previewUrl": "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview221/v4/27/23/4b/27234b9b-a460-7375-fde5-095218d567b6/mzaf_1029815409180685138.plus.aac.p.m4a",
    "stages": [
      1,
      2,
      4,
      7,
      11,
      16
    ],
    "hints": [
      "Massive hit by Sidhu Moose Wala & The Kidd",
      "Featured in \"Eyes on Me\" (2026)"
    ],
    "era": "new",
    "reversedPreviewUrl": "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview221/v4/27/23/4b/27234b9b-a460-7375-fde5-095218d567b6/mzaf_1029815409180685138.plus.aac.p.m4a",
    "startSound": "E",
    "endSound": "M",
    "startSyllable": "Eyes",
    "endSyllable": "Me",
    "startSoundLabel": "E (ए)",
    "endSoundLabel": "M (म)",
    "startDevanagari": "ए/ऐ",
    "endDevanagari": "म",
    "startWord": "Eyes",
    "endWord": "Me"
  },
  {
    "id": "pb_41",
    "title": "Barota",
    "artist": "Sidhu Moose Wala & The Kidd",
    "album": "Barota",
    "year": 2025,
    "language": "punjabi",
    "difficulty": "easy",
    "hookStartSeconds": 0,
    "previewUrl": "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview211/v4/af/c8/0c/afc80c89-8651-dba1-36b8-a5a36d2af289/mzaf_12958948224195820623.plus.aac.p.m4a",
    "stages": [
      1,
      2,
      4,
      7,
      11,
      16
    ],
    "hints": [
      "Massive hit by Sidhu Moose Wala & The Kidd",
      "Featured in \"Barota\" (2025)"
    ],
    "era": "new",
    "reversedPreviewUrl": "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview211/v4/af/c8/0c/afc80c89-8651-dba1-36b8-a5a36d2af289/mzaf_12958948224195820623.plus.aac.p.m4a",
    "startSound": "B",
    "endSound": "T",
    "startSyllable": "Barota",
    "endSyllable": "Barota",
    "startSoundLabel": "B (ब)",
    "endSoundLabel": "T (त)",
    "startDevanagari": "ब/भ",
    "endDevanagari": "त/थ/ट/ठ",
    "startWord": "Barota",
    "endWord": "Barota"
  },
  {
    "id": "pb_42",
    "title": "Mafia Style",
    "artist": "Sidhu Moose Wala",
    "album": "Mafia Style",
    "year": 2019,
    "language": "punjabi",
    "difficulty": "medium",
    "hookStartSeconds": 0,
    "previewUrl": "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview221/v4/d5/83/34/d583346b-92c8-d118-8136-4fa83debe900/mzaf_4544059527955712231.plus.aac.p.m4a",
    "stages": [
      1,
      2,
      4,
      7,
      11,
      16
    ],
    "hints": [
      "Massive hit by Sidhu Moose Wala",
      "Featured in \"Mafia Style\" (2019)"
    ],
    "era": "2010s",
    "reversedPreviewUrl": "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview221/v4/d5/83/34/d583346b-92c8-d118-8136-4fa83debe900/mzaf_4544059527955712231.plus.aac.p.m4a",
    "startSound": "M",
    "endSound": "L",
    "startSyllable": "Mafia",
    "endSyllable": "Style",
    "startSoundLabel": "M (म)",
    "endSoundLabel": "L (ल)",
    "startDevanagari": "म",
    "endDevanagari": "ल",
    "startWord": "Mafia",
    "endWord": "Style"
  },
  {
    "id": "pb_43",
    "title": "Celebrity Killer",
    "artist": "Sidhu Moose Wala & Tion Wayne",
    "album": "Moosetape",
    "year": 2021,
    "language": "punjabi",
    "difficulty": "easy",
    "hookStartSeconds": 0,
    "previewUrl": "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview221/v4/8b/e2/6d/8be26df0-dda9-0f52-e466-72236b0b7b6b/mzaf_6366668529718034129.plus.aac.p.m4a",
    "stages": [
      1,
      2,
      4,
      7,
      11,
      16
    ],
    "hints": [
      "Massive hit by Sidhu Moose Wala & Tion Wayne",
      "Featured in \"Moosetape\" (2021)"
    ],
    "era": "new",
    "reversedPreviewUrl": "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview221/v4/8b/e2/6d/8be26df0-dda9-0f52-e466-72236b0b7b6b/mzaf_6366668529718034129.plus.aac.p.m4a",
    "startSound": "S",
    "endSound": "R",
    "startSyllable": "Celebrity",
    "endSyllable": "Killer",
    "startSoundLabel": "S (स)",
    "endSoundLabel": "R (र)",
    "startDevanagari": "स/श/ष",
    "endDevanagari": "र/ड़",
    "startWord": "Celebrity",
    "endWord": "Killer"
  },
  {
    "id": "pb_44",
    "title": "Same Beef",
    "artist": "Bohemia & Sidhu Moose Wala",
    "album": "Same Beef",
    "year": 2019,
    "language": "punjabi",
    "difficulty": "hard",
    "hookStartSeconds": 0,
    "previewUrl": "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview221/v4/73/50/a2/7350a22e-c82f-5f73-a5ab-f6ebfaeb740b/mzaf_16018650222916631510.plus.aac.p.m4a",
    "stages": [
      1,
      2,
      4,
      7,
      11,
      16
    ],
    "hints": [
      "Massive hit by Bohemia & Sidhu Moose Wala",
      "Featured in \"Same Beef\" (2019)"
    ],
    "era": "2010s",
    "reversedPreviewUrl": "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview221/v4/73/50/a2/7350a22e-c82f-5f73-a5ab-f6ebfaeb740b/mzaf_16018650222916631510.plus.aac.p.m4a",
    "startSound": "S",
    "endSound": "F",
    "startSyllable": "Same",
    "endSyllable": "Beef",
    "startSoundLabel": "S (स)",
    "endSoundLabel": "F (फ़)",
    "startDevanagari": "स/श/ष",
    "endDevanagari": "फ़/फ",
    "startWord": "Same",
    "endWord": "Beef"
  },
  {
    "id": "pb_45",
    "title": "G Wagon",
    "artist": "Sidhu Moose Wala & Gurlej Akhtar",
    "album": "G Wagon",
    "year": 2017,
    "language": "punjabi",
    "difficulty": "medium",
    "hookStartSeconds": 0,
    "previewUrl": "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview125/v4/73/5c/11/735c1154-70c4-2e84-0830-87adf5ba3768/mzaf_12129116849651600410.plus.aac.p.m4a",
    "stages": [
      1,
      2,
      4,
      7,
      11,
      16
    ],
    "hints": [
      "Massive hit by Sidhu Moose Wala & Gurlej Akhtar",
      "Featured in \"G Wagon\" (2017)"
    ],
    "era": "2010s",
    "reversedPreviewUrl": "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview125/v4/73/5c/11/735c1154-70c4-2e84-0830-87adf5ba3768/mzaf_12129116849651600410.plus.aac.p.m4a",
    "startSound": "G",
    "endSound": "N",
    "startSyllable": "G",
    "endSyllable": "Wagon",
    "startSoundLabel": "G (ग)",
    "endSoundLabel": "N (न)",
    "startDevanagari": "ग/घ",
    "endDevanagari": "न/ण",
    "startWord": "G",
    "endWord": "Wagon"
  },
  {
    "id": "pb_46",
    "title": "Sohne Lagde",
    "artist": "Sidhu Moose Wala & The PropheC",
    "album": "Sohne Lagde",
    "year": 2019,
    "language": "punjabi",
    "difficulty": "expert",
    "hookStartSeconds": 0,
    "previewUrl": "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview221/v4/65/56/94/655694f2-c58e-00f6-4ef9-e5e130a90440/mzaf_1189930010027731457.plus.aac.p.m4a",
    "stages": [
      1,
      2,
      4,
      7,
      11,
      16
    ],
    "hints": [
      "Massive hit by Sidhu Moose Wala & The PropheC",
      "Featured in \"Sohne Lagde\" (2019)"
    ],
    "era": "2010s",
    "reversedPreviewUrl": "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview221/v4/65/56/94/655694f2-c58e-00f6-4ef9-e5e130a90440/mzaf_1189930010027731457.plus.aac.p.m4a",
    "startSound": "S",
    "endSound": "D",
    "startSyllable": "Sohne",
    "endSyllable": "Lagde",
    "startSoundLabel": "S (स)",
    "endSoundLabel": "D (द)",
    "startDevanagari": "स/श/ष",
    "endDevanagari": "द/ध/ड/ढ",
    "startWord": "Sohne",
    "endWord": "Lagde"
  },
  {
    "id": "pb_47",
    "title": "Badfella",
    "artist": "Sidhu Moose Wala",
    "album": "Pbx 1",
    "year": 2018,
    "language": "punjabi",
    "difficulty": "easy",
    "hookStartSeconds": 0,
    "previewUrl": "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview211/v4/17/dd/77/17dd77f6-89f8-87a8-1968-584ec2fd3ef5/mzaf_8603927932984351843.plus.aac.p.m4a",
    "stages": [
      1,
      2,
      4,
      7,
      11,
      16
    ],
    "hints": [
      "Massive hit by Sidhu Moose Wala",
      "Featured in \"Pbx 1\" (2018)"
    ],
    "era": "2010s",
    "reversedPreviewUrl": "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview211/v4/17/dd/77/17dd77f6-89f8-87a8-1968-584ec2fd3ef5/mzaf_8603927932984351843.plus.aac.p.m4a",
    "startSound": "B",
    "endSound": "L",
    "startSyllable": "Badfella",
    "endSyllable": "Badfella",
    "startSoundLabel": "B (ब)",
    "endSoundLabel": "L (ल)",
    "startDevanagari": "ब/भ",
    "endDevanagari": "ल",
    "startWord": "Badfella",
    "endWord": "Badfella"
  },
  {
    "id": "pb_48",
    "title": "Jatt Da Muqabala",
    "artist": "Sidhu Moose Wala",
    "album": "Pbx 1",
    "year": 2018,
    "language": "punjabi",
    "difficulty": "impossible",
    "hookStartSeconds": 0,
    "previewUrl": "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview211/v4/69/75/f2/6975f271-0109-ce08-2578-863a40ff0fa9/mzaf_17434096247309872935.plus.aac.p.m4a",
    "stages": [
      1,
      2,
      4,
      7,
      11,
      16
    ],
    "hints": [
      "Massive hit by Sidhu Moose Wala",
      "Featured in \"Pbx 1\" (2018)"
    ],
    "era": "2010s",
    "reversedPreviewUrl": "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview211/v4/69/75/f2/6975f271-0109-ce08-2578-863a40ff0fa9/mzaf_17434096247309872935.plus.aac.p.m4a",
    "startSound": "J",
    "endSound": "L",
    "startSyllable": "Jatt",
    "endSyllable": "Muqabala",
    "startSoundLabel": "J (ज)",
    "endSoundLabel": "L (ल)",
    "startDevanagari": "ज/झ",
    "endDevanagari": "ल",
    "startWord": "Jatt",
    "endWord": "Muqabala"
  },
  {
    "id": "pb_49",
    "title": "295",
    "artist": "Sidhu Moose Wala",
    "album": "Moosetape",
    "year": 2021,
    "language": "punjabi",
    "difficulty": "easy",
    "hookStartSeconds": 0,
    "previewUrl": "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview211/v4/7f/f3/6d/7ff36d63-b933-3993-cd2f-f3fd770c3763/mzaf_12675758250838366519.plus.aac.p.m4a",
    "stages": [
      1,
      2,
      4,
      7,
      11,
      16
    ],
    "hints": [
      "Massive hit by Sidhu Moose Wala",
      "Featured in \"Moosetape\" (2021)"
    ],
    "era": "new",
    "reversedPreviewUrl": "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview211/v4/7f/f3/6d/7ff36d63-b933-3993-cd2f-f3fd770c3763/mzaf_12675758250838366519.plus.aac.p.m4a",
    "startSound": "D",
    "endSound": "E",
    "startSyllable": "Do",
    "endSyllable": "Pichanve",
    "startSoundLabel": "D (द)",
    "endSoundLabel": "E (ए)",
    "startDevanagari": "द/ध/ड/ढ",
    "endDevanagari": "ए/ऐ",
    "startWord": "Do",
    "endWord": "Pichanve"
  },
  {
    "id": "pb_50",
    "title": "Tochan",
    "artist": "Sidhu Moose Wala & Byg Byrd",
    "album": "Tochan",
    "year": 2018,
    "language": "punjabi",
    "difficulty": "medium",
    "hookStartSeconds": 0,
    "previewUrl": "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview122/v4/0b/72/0c/0b720c64-2de2-0cf0-2e80-11889131ddff/mzaf_18241111511893827435.plus.aac.p.m4a",
    "stages": [
      1,
      2,
      4,
      7,
      11,
      16
    ],
    "hints": [
      "Massive hit by Sidhu Moose Wala & Byg Byrd",
      "Featured in \"Tochan\" (2018)"
    ],
    "era": "2010s",
    "reversedPreviewUrl": "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview122/v4/0b/72/0c/0b720c64-2de2-0cf0-2e80-11889131ddff/mzaf_18241111511893827435.plus.aac.p.m4a",
    "startSound": "T",
    "endSound": "N",
    "startSyllable": "Tochan",
    "endSyllable": "Tochan",
    "startSoundLabel": "T (त)",
    "endSoundLabel": "N (न)",
    "startDevanagari": "त/थ/ट/ठ",
    "endDevanagari": "न/ण",
    "startWord": "Tochan",
    "endWord": "Tochan"
  },
  {
    "id": "pb_51",
    "title": "East Side Flow",
    "artist": "Sidhu Moose Wala",
    "album": "East Side Flow",
    "year": 2019,
    "language": "punjabi",
    "difficulty": "easy",
    "hookStartSeconds": 0,
    "previewUrl": "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview211/v4/66/68/79/66687969-7313-cd54-ef38-9aafc70291f1/mzaf_6084125319629311003.plus.aac.p.m4a",
    "stages": [
      1,
      2,
      4,
      7,
      11,
      16
    ],
    "hints": [
      "Massive hit by Sidhu Moose Wala",
      "Featured in \"East Side Flow\" (2019)"
    ],
    "era": "2010s",
    "reversedPreviewUrl": "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview211/v4/66/68/79/66687969-7313-cd54-ef38-9aafc70291f1/mzaf_6084125319629311003.plus.aac.p.m4a",
    "startSound": "E",
    "endSound": "V",
    "startSyllable": "East",
    "endSyllable": "Flow",
    "startSoundLabel": "E (ए)",
    "endSoundLabel": "V (व)",
    "startDevanagari": "ए/ऐ",
    "endDevanagari": "व/W",
    "startWord": "East",
    "endWord": "Flow"
  },
  {
    "id": "pb_52",
    "title": "0 To 100",
    "artist": "Sidhu Moose Wala",
    "album": "No Name",
    "year": 2022,
    "language": "punjabi",
    "difficulty": "hard",
    "hookStartSeconds": 0,
    "previewUrl": "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview211/v4/cc/d2/00/ccd20040-d9d8-7c56-8deb-5b3b2e3662c7/mzaf_8318391531308955047.plus.aac.p.m4a",
    "stages": [
      1,
      2,
      4,
      7,
      11,
      16
    ],
    "hints": [
      "Massive hit by Sidhu Moose Wala",
      "Featured in \"No Name\" (2022)"
    ],
    "era": "new",
    "reversedPreviewUrl": "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview211/v4/cc/d2/00/ccd20040-d9d8-7c56-8deb-5b3b2e3662c7/mzaf_8318391531308955047.plus.aac.p.m4a",
    "startSound": "Z",
    "endSound": "D",
    "startSyllable": "Zero",
    "endSyllable": "Hundred",
    "startSoundLabel": "Z (ज़)",
    "endSoundLabel": "D (द)",
    "startDevanagari": "ज़",
    "endDevanagari": "द/ध/ड/ढ",
    "startWord": "Zero",
    "endWord": "Hundred"
  },
  {
    "id": "hr_01",
    "title": "52 Gaj Ka Daman",
    "artist": "Renuka Panwar",
    "album": "52 Gaj Ka Daman",
    "year": 2020,
    "difficulty": "easy",
    "hints": [
      "Billion+ views record",
      "Traditional ghagra dance beat"
    ],
    "previewUrl": "/audio/52-gaj-ka-daman.m4a",
    "language": "haryanvi",
    "stages": [
      1,
      2,
      4,
      7,
      11,
      16
    ],
    "hookStartSeconds": 0,
    "era": "new",
    "reversedPreviewUrl": "/audio/reversed/52-gaj-ka-daman.m4a",
    "startSound": "B",
    "endSound": "N",
    "startSyllable": "Bawan",
    "endSyllable": "Daman",
    "startSoundLabel": "B (ब)",
    "endSoundLabel": "N (न)",
    "startDevanagari": "ब/भ",
    "endDevanagari": "न/ण",
    "startWord": "Bawan",
    "endWord": "Daman"
  },
  {
    "id": "hr_02",
    "title": "Solid Body",
    "artist": "Raju Punjabi, Sheenam Katholic",
    "album": "Solid Body",
    "year": 2015,
    "difficulty": "medium",
    "hints": [
      "Classic village DJ anthem",
      "Raju Punjabi legend"
    ],
    "previewUrl": "/audio/solid-body.m4a",
    "language": "haryanvi",
    "stages": [
      1,
      2,
      4,
      7,
      11,
      16
    ],
    "hookStartSeconds": 0,
    "era": "2010s",
    "reversedPreviewUrl": "/audio/reversed/solid-body.m4a",
    "startSound": "S",
    "endSound": "Y",
    "startSyllable": "Solid",
    "endSyllable": "Body",
    "startSoundLabel": "S (स)",
    "endSoundLabel": "Y (य)",
    "startDevanagari": "स/श/ष",
    "endDevanagari": "य",
    "startWord": "Solid",
    "endWord": "Body"
  },
  {
    "id": "hr_03",
    "title": "Bahu Kale Ki",
    "artist": "Gajender Phogat, Anu Kadyan",
    "album": "Bahu Kale Ki",
    "year": 2018,
    "difficulty": "hard",
    "hints": [
      "Iconic desi folk anthem",
      "Gajender Phogat hit"
    ],
    "previewUrl": "/audio/bahu-kale-ki.m4a",
    "language": "haryanvi",
    "stages": [
      1,
      2,
      4,
      7,
      11,
      16
    ],
    "hookStartSeconds": 0,
    "era": "2010s",
    "reversedPreviewUrl": "/audio/reversed/bahu-kale-ki.m4a",
    "startSound": "B",
    "endSound": "K",
    "startSyllable": "Bahu",
    "endSyllable": "Ki",
    "startSoundLabel": "B (ब)",
    "endSoundLabel": "K (क)",
    "startDevanagari": "ब/भ",
    "endDevanagari": "क/ख",
    "startWord": "Bahu",
    "endWord": "Ki"
  },
  {
    "id": "hr_04",
    "title": "Moto",
    "artist": "Diler Kharkiya",
    "album": "Moto",
    "year": 2020,
    "difficulty": "easy",
    "hints": [
      "Diler Kharkiya blockbuster",
      "Tareef karegi teri moto"
    ],
    "previewUrl": "/audio/moto.m4a",
    "language": "haryanvi",
    "stages": [
      1,
      2,
      4,
      7,
      11,
      16
    ],
    "hookStartSeconds": 0,
    "era": "new",
    "reversedPreviewUrl": "/audio/reversed/moto.m4a",
    "startSound": "M",
    "endSound": "T",
    "startSyllable": "Moto",
    "endSyllable": "Moto",
    "startSoundLabel": "M (म)",
    "endSoundLabel": "T (त)",
    "startDevanagari": "म",
    "endDevanagari": "त/थ/ट/ठ",
    "startWord": "Moto",
    "endWord": "Moto"
  },
  {
    "id": "hr_05",
    "title": "Chatak Matak",
    "artist": "Renuka Panwar",
    "album": "Chatak Matak",
    "year": 2020,
    "difficulty": "medium",
    "hints": [
      "Sapna Choudhary dance video",
      "Renuka Panwar vocals"
    ],
    "previewUrl": "/audio/chatak-matak.m4a",
    "language": "haryanvi",
    "stages": [
      1,
      2,
      4,
      7,
      11,
      16
    ],
    "hookStartSeconds": 0,
    "era": "new",
    "reversedPreviewUrl": "/audio/reversed/chatak-matak.m4a",
    "startSound": "CH",
    "endSound": "K",
    "startSyllable": "Chatak",
    "endSyllable": "Matak",
    "startSoundLabel": "CH (च)",
    "endSoundLabel": "K (क)",
    "startDevanagari": "च/छ",
    "endDevanagari": "क/ख",
    "startWord": "Chatak",
    "endWord": "Matak"
  },
  {
    "id": "hr_06",
    "title": "Gypsy",
    "artist": "GD Kaur, Pranjal Dahiya",
    "album": "Gypsy",
    "year": 2022,
    "difficulty": "easy",
    "hints": [
      "Mera Balam Thanedaar chalave gypsy",
      "Viral nationwide reels anthem"
    ],
    "previewUrl": "/audio/gypsy.m4a",
    "language": "haryanvi",
    "stages": [
      1,
      2,
      4,
      7,
      11,
      16
    ],
    "hookStartSeconds": 0,
    "era": "new",
    "reversedPreviewUrl": "/audio/reversed/gypsy.m4a",
    "startSound": "G",
    "endSound": "Y",
    "startSyllable": "Gypsy",
    "endSyllable": "Gypsy",
    "startSoundLabel": "G (ग)",
    "endSoundLabel": "Y (य)",
    "startDevanagari": "ग/घ",
    "endDevanagari": "य",
    "startWord": "Gypsy",
    "endWord": "Gypsy"
  },
  {
    "id": "hr_07",
    "title": "Teri Aakhya Ka Yo Kajal",
    "artist": "DC Madana",
    "album": "Teri Aakhya Ka Yo Kajal",
    "year": 2018,
    "difficulty": "easy",
    "hints": [
      "All-time viral dance craze",
      "Sapna Choudhary signature song"
    ],
    "previewUrl": "/audio/teri-aakhya-ka-yo-kajal.m4a",
    "language": "haryanvi",
    "stages": [
      1,
      2,
      4,
      7,
      11,
      16
    ],
    "hookStartSeconds": 0,
    "era": "2010s",
    "reversedPreviewUrl": "/audio/reversed/teri-aakhya-ka-yo-kajal.m4a",
    "startSound": "T",
    "endSound": "L",
    "startSyllable": "Teri",
    "endSyllable": "Kajal",
    "startSoundLabel": "T (त)",
    "endSoundLabel": "L (ल)",
    "startDevanagari": "त/थ/ट/ठ",
    "endDevanagari": "ल",
    "startWord": "Teri",
    "endWord": "Kajal"
  },
  {
    "id": "hr_08",
    "title": "Middle Class",
    "artist": "Gulzaar Chhaniwala",
    "album": "Middle Class",
    "year": 2019,
    "difficulty": "hard",
    "hints": [
      "Emotional middle class youth anthem",
      "Gulzaar Chhaniwala rap"
    ],
    "previewUrl": "/audio/middle-class.m4a",
    "language": "haryanvi",
    "stages": [
      1,
      2,
      4,
      7,
      11,
      16
    ],
    "hookStartSeconds": 0,
    "era": "2010s",
    "reversedPreviewUrl": "/audio/reversed/middle-class.m4a",
    "startSound": "M",
    "endSound": "S",
    "startSyllable": "Middle",
    "endSyllable": "Class",
    "startSoundLabel": "M (म)",
    "endSoundLabel": "S (स)",
    "startDevanagari": "म",
    "endDevanagari": "स/श/ष",
    "startWord": "Middle",
    "endWord": "Class"
  },
  {
    "id": "hr_09",
    "title": "Jug Jug Jeeve",
    "artist": "Gulzaar Chhaniwala",
    "album": "Jug Jug Jeeve",
    "year": 2020,
    "difficulty": "medium",
    "hints": [
      "High-energy desi dhol beats",
      "Gulzaar Chhaniwala anthem"
    ],
    "previewUrl": "/audio/jug-jug-jeeve.m4a",
    "language": "haryanvi",
    "stages": [
      1,
      2,
      4,
      7,
      11,
      16
    ],
    "hookStartSeconds": 0,
    "era": "new",
    "reversedPreviewUrl": "/audio/reversed/jug-jug-jeeve.m4a",
    "startSound": "J",
    "endSound": "V",
    "startSyllable": "Jug",
    "endSyllable": "Jeeve",
    "startSoundLabel": "J (ज)",
    "endSoundLabel": "V (व)",
    "startDevanagari": "ज/झ",
    "endDevanagari": "व/W",
    "startWord": "Jug",
    "endWord": "Jeeve"
  },
  {
    "id": "hr_10",
    "title": "Kabootar",
    "artist": "Renuka Panwar & Surender Romio",
    "album": "Kabootar",
    "year": 2021,
    "language": "haryanvi",
    "difficulty": "medium",
    "hookStartSeconds": 0,
    "previewUrl": "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview221/v4/e8/70/4d/e8704d82-e7ee-a9d8-0695-0154644fcb93/mzaf_9489783275684648951.plus.aac.p.m4a",
    "stages": [
      1,
      2,
      4,
      7,
      11,
      16
    ],
    "hints": [
      "Massive hit by Renuka Panwar & Surender Romio",
      "Featured in \"Kabootar\" (2021)"
    ],
    "era": "new",
    "reversedPreviewUrl": "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview221/v4/e8/70/4d/e8704d82-e7ee-a9d8-0695-0154644fcb93/mzaf_9489783275684648951.plus.aac.p.m4a",
    "startSound": "K",
    "endSound": "R",
    "startSyllable": "Kabootar",
    "endSyllable": "Kabootar",
    "startSoundLabel": "K (क)",
    "endSoundLabel": "R (र)",
    "startDevanagari": "क/ख",
    "endDevanagari": "र/ड़",
    "startWord": "Kabootar",
    "endWord": "Kabootar"
  },
  {
    "id": "hr_11",
    "title": "Child Of The",
    "artist": "Raj Meena & Renuka Panwar",
    "album": "Child Of The",
    "year": 2023,
    "language": "haryanvi",
    "difficulty": "easy",
    "hookStartSeconds": 0,
    "previewUrl": "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview221/v4/6f/c2/13/6fc213ad-446a-29cd-ad57-aab00d382a7d/mzaf_15230458548270488584.plus.aac.p.m4a",
    "stages": [
      1,
      2,
      4,
      7,
      11,
      16
    ],
    "hints": [
      "Massive hit by Raj Meena & Renuka Panwar",
      "Featured in \"Child Of The\" (2023)"
    ],
    "era": "new",
    "reversedPreviewUrl": "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview221/v4/6f/c2/13/6fc213ad-446a-29cd-ad57-aab00d382a7d/mzaf_15230458548270488584.plus.aac.p.m4a",
    "startSound": "CH",
    "endSound": "E",
    "startSyllable": "Child",
    "endSyllable": "The",
    "startSoundLabel": "CH (च)",
    "endSoundLabel": "E (ए)",
    "startDevanagari": "च/छ",
    "endDevanagari": "ए/ऐ",
    "startWord": "Child",
    "endWord": "The"
  },
  {
    "id": "hr_12",
    "title": "KARIZMA",
    "artist": "Guru Randhawa",
    "album": "KARIZMA",
    "year": 2025,
    "language": "haryanvi",
    "difficulty": "hard",
    "hookStartSeconds": 0,
    "previewUrl": "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview221/v4/2f/28/b3/2f28b329-7429-8d6e-5364-e34f589aa801/mzaf_6712672935705668097.plus.aac.p.m4a",
    "stages": [
      1,
      2,
      4,
      7,
      11,
      16
    ],
    "hints": [
      "Massive hit by Guru Randhawa",
      "Featured in \"KARIZMA\" (2025)"
    ],
    "era": "new",
    "reversedPreviewUrl": "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview221/v4/2f/28/b3/2f28b329-7429-8d6e-5364-e34f589aa801/mzaf_6712672935705668097.plus.aac.p.m4a",
    "startSound": "K",
    "endSound": "M",
    "startSyllable": "KARIZMA",
    "endSyllable": "KARIZMA",
    "startSoundLabel": "K (क)",
    "endSoundLabel": "M (म)",
    "startDevanagari": "क/ख",
    "endDevanagari": "म",
    "startWord": "KARIZMA",
    "endWord": "KARIZMA"
  },
  {
    "id": "hr_13",
    "title": "Laung Laachi",
    "artist": "Renuka Panwar",
    "album": "Laung Laachi",
    "year": 2022,
    "language": "haryanvi",
    "difficulty": "medium",
    "hookStartSeconds": 0,
    "previewUrl": "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview122/v4/2b/9f/d6/2b9fd6db-e72a-49a9-5051-ee6a59378639/mzaf_3002018446614906445.plus.aac.p.m4a",
    "stages": [
      1,
      2,
      4,
      7,
      11,
      16
    ],
    "hints": [
      "Massive hit by Renuka Panwar",
      "Featured in \"Laung Laachi\" (2022)"
    ],
    "era": "new",
    "reversedPreviewUrl": "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview122/v4/2b/9f/d6/2b9fd6db-e72a-49a9-5051-ee6a59378639/mzaf_3002018446614906445.plus.aac.p.m4a",
    "startSound": "L",
    "endSound": "H",
    "startSyllable": "Laung",
    "endSyllable": "Laachi",
    "startSoundLabel": "L (ल)",
    "endSoundLabel": "H (ह)",
    "startDevanagari": "ल",
    "endDevanagari": "ह",
    "startWord": "Laung",
    "endWord": "Laachi"
  },
  {
    "id": "hr_14",
    "title": "Lanka Lutegi",
    "artist": "Surender Romio & Renuka Panwar",
    "album": "Lanka Lutegi",
    "year": 2020,
    "language": "haryanvi",
    "difficulty": "expert",
    "hookStartSeconds": 0,
    "previewUrl": "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview221/v4/39/10/29/39102993-8684-1338-e765-89e3fb916490/mzaf_7805846346517331287.plus.aac.p.m4a",
    "stages": [
      1,
      2,
      4,
      7,
      11,
      16
    ],
    "hints": [
      "Massive hit by Surender Romio & Renuka Panwar",
      "Featured in \"Lanka Lutegi\" (2020)"
    ],
    "era": "new",
    "reversedPreviewUrl": "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview221/v4/39/10/29/39102993-8684-1338-e765-89e3fb916490/mzaf_7805846346517331287.plus.aac.p.m4a",
    "startSound": "L",
    "endSound": "G",
    "startSyllable": "Lanka",
    "endSyllable": "Lutegi",
    "startSoundLabel": "L (ल)",
    "endSoundLabel": "G (ग)",
    "startDevanagari": "ल",
    "endDevanagari": "ग/घ",
    "startWord": "Lanka",
    "endWord": "Lutegi"
  },
  {
    "id": "hr_15",
    "title": "Patbijna",
    "artist": "Surender Romio & Renuka Panwar",
    "album": "Patbijna",
    "year": 2020,
    "language": "haryanvi",
    "difficulty": "easy",
    "hookStartSeconds": 0,
    "previewUrl": "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview211/v4/a5/43/af/a543af55-0fb4-5bc7-f9cb-1a7f1621f2be/mzaf_11777628259065956028.plus.aac.p.m4a",
    "stages": [
      1,
      2,
      4,
      7,
      11,
      16
    ],
    "hints": [
      "Massive hit by Surender Romio & Renuka Panwar",
      "Featured in \"Patbijna\" (2020)"
    ],
    "era": "new",
    "reversedPreviewUrl": "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview211/v4/a5/43/af/a543af55-0fb4-5bc7-f9cb-1a7f1621f2be/mzaf_11777628259065956028.plus.aac.p.m4a",
    "startSound": "P",
    "endSound": "N",
    "startSyllable": "Patbijna",
    "endSyllable": "Patbijna",
    "startSoundLabel": "P (प)",
    "endSoundLabel": "N (न)",
    "startDevanagari": "प",
    "endDevanagari": "न/ण",
    "startWord": "Patbijna",
    "endWord": "Patbijna"
  },
  {
    "id": "hr_16",
    "title": "Sun Sonio",
    "artist": "Tarun Panchal & Renuka Panwar",
    "album": "Sun Sonio",
    "year": 2019,
    "language": "haryanvi",
    "difficulty": "impossible",
    "hookStartSeconds": 0,
    "previewUrl": "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview125/v4/03/c3/c5/03c3c5a9-d683-f423-9790-093b08d76fe9/mzaf_741794275442954036.plus.aac.p.m4a",
    "stages": [
      1,
      2,
      4,
      7,
      11,
      16
    ],
    "hints": [
      "Massive hit by Tarun Panchal & Renuka Panwar",
      "Featured in \"Sun Sonio\" (2019)"
    ],
    "era": "2010s",
    "reversedPreviewUrl": "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview125/v4/03/c3/c5/03c3c5a9-d683-f423-9790-093b08d76fe9/mzaf_741794275442954036.plus.aac.p.m4a",
    "startSound": "S",
    "endSound": "Y",
    "startSyllable": "Sun",
    "endSyllable": "Sonio",
    "startSoundLabel": "S (स)",
    "endSoundLabel": "Y (य)",
    "startDevanagari": "स/श/ष",
    "endDevanagari": "य",
    "startWord": "Sun",
    "endWord": "Sonio"
  },
  {
    "id": "hr_17",
    "title": "Bhaga Aala",
    "artist": "Renuka Panwar",
    "album": "Bhaga Aala",
    "year": 2022,
    "language": "haryanvi",
    "difficulty": "easy",
    "hookStartSeconds": 0,
    "previewUrl": "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview122/v4/48/75/a1/4875a111-e245-f6ab-7efe-7d7774195078/mzaf_2563083722775131908.plus.aac.p.m4a",
    "stages": [
      1,
      2,
      4,
      7,
      11,
      16
    ],
    "hints": [
      "Massive hit by Renuka Panwar",
      "Featured in \"Bhaga Aala\" (2022)"
    ],
    "era": "new",
    "reversedPreviewUrl": "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview122/v4/48/75/a1/4875a111-e245-f6ab-7efe-7d7774195078/mzaf_2563083722775131908.plus.aac.p.m4a",
    "startSound": "B",
    "endSound": "L",
    "startSyllable": "Bhaga",
    "endSyllable": "Aala",
    "startSoundLabel": "B (ब)",
    "endSoundLabel": "L (ल)",
    "startDevanagari": "ब/भ",
    "endDevanagari": "ल",
    "startWord": "Bhaga",
    "endWord": "Aala"
  },
  {
    "id": "hr_18",
    "title": "Illegal Hathiyar",
    "artist": "Elvish Yadav, Renuka Panwar & Muzik Amy",
    "album": "Illegal Hathiyar",
    "year": 2024,
    "language": "haryanvi",
    "difficulty": "medium",
    "hookStartSeconds": 0,
    "previewUrl": "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview221/v4/4b/bd/4b/4bbd4bb6-2f01-7af8-2562-e64cce333721/mzaf_2251513344900899605.plus.aac.p.m4a",
    "stages": [
      1,
      2,
      4,
      7,
      11,
      16
    ],
    "hints": [
      "Massive hit by Elvish Yadav, Renuka Panwar & Muzik Amy",
      "Featured in \"Illegal Hathiyar\" (2024)"
    ],
    "era": "new",
    "reversedPreviewUrl": "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview221/v4/4b/bd/4b/4bbd4bb6-2f01-7af8-2562-e64cce333721/mzaf_2251513344900899605.plus.aac.p.m4a",
    "startSound": "I",
    "endSound": "R",
    "startSyllable": "Illegal",
    "endSyllable": "Hathiyar",
    "startSoundLabel": "I (ई)",
    "endSoundLabel": "R (र)",
    "startDevanagari": "इ/ई",
    "endDevanagari": "र/ड़",
    "startWord": "Illegal",
    "endWord": "Hathiyar"
  },
  {
    "id": "hr_19",
    "title": "Baar Baar",
    "artist": "Sukhwinder Singh & Renuka Panwar",
    "album": "Baar Baar",
    "year": 2024,
    "language": "haryanvi",
    "difficulty": "easy",
    "hookStartSeconds": 0,
    "previewUrl": "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview221/v4/ab/6c/72/ab6c7228-39c8-77c8-1798-d9acca9af164/mzaf_17749838029839211746.plus.aac.p.m4a",
    "stages": [
      1,
      2,
      4,
      7,
      11,
      16
    ],
    "hints": [
      "Massive hit by Sukhwinder Singh & Renuka Panwar",
      "Featured in \"Baar Baar\" (2024)"
    ],
    "era": "new",
    "reversedPreviewUrl": "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview221/v4/ab/6c/72/ab6c7228-39c8-77c8-1798-d9acca9af164/mzaf_17749838029839211746.plus.aac.p.m4a",
    "startSound": "B",
    "endSound": "R",
    "startSyllable": "Baar",
    "endSyllable": "Baar",
    "startSoundLabel": "B (ब)",
    "endSoundLabel": "R (र)",
    "startDevanagari": "ब/भ",
    "endDevanagari": "र/ड़",
    "startWord": "Baar",
    "endWord": "Baar"
  },
  {
    "id": "hr_20",
    "title": "Raataan Lambiyan",
    "artist": "Renuka Panwar & Tanishk Bagchi",
    "album": "Raataan Lambiyan",
    "year": 2022,
    "language": "haryanvi",
    "difficulty": "hard",
    "hookStartSeconds": 0,
    "previewUrl": "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview126/v4/5d/c0/62/5dc06215-5506-296d-4168-56bc04a714c4/mzaf_499678344991921726.plus.aac.p.m4a",
    "stages": [
      1,
      2,
      4,
      7,
      11,
      16
    ],
    "hints": [
      "Massive hit by Renuka Panwar & Tanishk Bagchi",
      "Featured in \"Raataan Lambiyan\" (2022)"
    ],
    "era": "new",
    "reversedPreviewUrl": "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview126/v4/5d/c0/62/5dc06215-5506-296d-4168-56bc04a714c4/mzaf_499678344991921726.plus.aac.p.m4a",
    "startSound": "R",
    "endSound": "N",
    "startSyllable": "Raataan",
    "endSyllable": "Lambiyan",
    "startSoundLabel": "R (र)",
    "endSoundLabel": "N (न)",
    "startDevanagari": "र/ड़",
    "endDevanagari": "न/ण",
    "startWord": "Raataan",
    "endWord": "Lambiyan"
  },
  {
    "id": "hr_21",
    "title": "Jutti Tilledar",
    "artist": "Surender Romio & Renuka Panwar",
    "album": "Jutti Tilledar",
    "year": 2020,
    "language": "haryanvi",
    "difficulty": "medium",
    "hookStartSeconds": 0,
    "previewUrl": "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview221/v4/63/76/9a/63769a71-30ec-f83d-97c5-622d85aed0a4/mzaf_16907762348003558674.plus.aac.p.m4a",
    "stages": [
      1,
      2,
      4,
      7,
      11,
      16
    ],
    "hints": [
      "Massive hit by Surender Romio & Renuka Panwar",
      "Featured in \"Jutti Tilledar\" (2020)"
    ],
    "era": "new",
    "reversedPreviewUrl": "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview221/v4/63/76/9a/63769a71-30ec-f83d-97c5-622d85aed0a4/mzaf_16907762348003558674.plus.aac.p.m4a",
    "startSound": "J",
    "endSound": "R",
    "startSyllable": "Jutti",
    "endSyllable": "Tilledar",
    "startSoundLabel": "J (ज)",
    "endSoundLabel": "R (र)",
    "startDevanagari": "ज/झ",
    "endDevanagari": "र/ड़",
    "startWord": "Jutti",
    "endWord": "Tilledar"
  },
  {
    "id": "hr_22",
    "title": "Bairan Begani",
    "artist": "Uchana Amit, NITC & Renuka Panwar",
    "album": "Bairan Begani",
    "year": 2024,
    "language": "haryanvi",
    "difficulty": "expert",
    "hookStartSeconds": 0,
    "previewUrl": "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview221/v4/0c/0f/db/0c0fdbb2-6f11-baf1-1dd3-efd24d1f3b62/mzaf_12174244044315648918.plus.aac.p.m4a",
    "stages": [
      1,
      2,
      4,
      7,
      11,
      16
    ],
    "hints": [
      "Massive hit by Uchana Amit, NITC & Renuka Panwar",
      "Featured in \"Bairan Begani\" (2024)"
    ],
    "era": "new",
    "reversedPreviewUrl": "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview221/v4/0c/0f/db/0c0fdbb2-6f11-baf1-1dd3-efd24d1f3b62/mzaf_12174244044315648918.plus.aac.p.m4a",
    "startSound": "B",
    "endSound": "N",
    "startSyllable": "Bairan",
    "endSyllable": "Begani",
    "startSoundLabel": "B (ब)",
    "endSoundLabel": "N (न)",
    "startDevanagari": "ब/भ",
    "endDevanagari": "न/ण",
    "startWord": "Bairan",
    "endWord": "Begani"
  },
  {
    "id": "hr_23",
    "title": "Khuda Ki Inayat",
    "artist": "Tarun Panchal & Renuka Panwar",
    "album": "Khuda Ki Inayat",
    "year": 2020,
    "language": "haryanvi",
    "difficulty": "easy",
    "hookStartSeconds": 0,
    "previewUrl": "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview115/v4/b7/65/5d/b7655dfe-7385-2366-1e41-9d8bfac4267e/mzaf_1390143502177286662.plus.aac.p.m4a",
    "stages": [
      1,
      2,
      4,
      7,
      11,
      16
    ],
    "hints": [
      "Massive hit by Tarun Panchal & Renuka Panwar",
      "Featured in \"Khuda Ki Inayat\" (2020)"
    ],
    "era": "new",
    "reversedPreviewUrl": "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview115/v4/b7/65/5d/b7655dfe-7385-2366-1e41-9d8bfac4267e/mzaf_1390143502177286662.plus.aac.p.m4a",
    "startSound": "K",
    "endSound": "T",
    "startSyllable": "Khuda",
    "endSyllable": "Inayat",
    "startSoundLabel": "K (क)",
    "endSoundLabel": "T (त)",
    "startDevanagari": "क/ख",
    "endDevanagari": "त/थ/ट/ठ",
    "startWord": "Khuda",
    "endWord": "Inayat"
  },
  {
    "id": "hr_24",
    "title": "Saiyaan Ki Bandook",
    "artist": "Sonu Thukral, Renuka Panwar & Jaani",
    "album": "Saiyaan Ki Bandook",
    "year": 2024,
    "language": "haryanvi",
    "difficulty": "impossible",
    "hookStartSeconds": 0,
    "previewUrl": "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview221/v4/80/21/15/80211535-0919-962d-37c2-dc14b3b1e269/mzaf_12344750848023681295.plus.aac.p.m4a",
    "stages": [
      1,
      2,
      4,
      7,
      11,
      16
    ],
    "hints": [
      "Massive hit by Sonu Thukral, Renuka Panwar & Jaani",
      "Featured in \"Saiyaan Ki Bandook\" (2024)"
    ],
    "era": "new",
    "reversedPreviewUrl": "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview221/v4/80/21/15/80211535-0919-962d-37c2-dc14b3b1e269/mzaf_12344750848023681295.plus.aac.p.m4a",
    "startSound": "S",
    "endSound": "K",
    "startSyllable": "Saiyaan",
    "endSyllable": "Bandook",
    "startSoundLabel": "S (स)",
    "endSoundLabel": "K (क)",
    "startDevanagari": "स/श/ष",
    "endDevanagari": "क/ख",
    "startWord": "Saiyaan",
    "endWord": "Bandook"
  },
  {
    "id": "hr_25",
    "title": "Hooka",
    "artist": "Masoom Sharma & Renuka Panwar",
    "album": "Hooka",
    "year": 2020,
    "language": "haryanvi",
    "difficulty": "easy",
    "hookStartSeconds": 0,
    "previewUrl": "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview114/v4/09/d3/6c/09d36c2c-8bd6-10e7-d54e-498ae0c8fa58/mzaf_2589008834639148248.plus.aac.p.m4a",
    "stages": [
      1,
      2,
      4,
      7,
      11,
      16
    ],
    "hints": [
      "Massive hit by Masoom Sharma & Renuka Panwar",
      "Featured in \"Hooka\" (2020)"
    ],
    "era": "new",
    "reversedPreviewUrl": "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview114/v4/09/d3/6c/09d36c2c-8bd6-10e7-d54e-498ae0c8fa58/mzaf_2589008834639148248.plus.aac.p.m4a",
    "startSound": "H",
    "endSound": "K",
    "startSyllable": "Hooka",
    "endSyllable": "Hooka",
    "startSoundLabel": "H (ह)",
    "endSoundLabel": "K (क)",
    "startDevanagari": "ह",
    "endDevanagari": "क/ख",
    "startWord": "Hooka",
    "endWord": "Hooka"
  },
  {
    "id": "hr_26",
    "title": "Unchi Haveli",
    "artist": "Renuka Panwar & ADITYA KALKAL",
    "album": "Unchi Haveli",
    "year": 2019,
    "language": "haryanvi",
    "difficulty": "medium",
    "hookStartSeconds": 0,
    "previewUrl": "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview116/v4/b7/5e/e9/b75ee9c6-3a1a-4e20-58e5-91a0c166e32a/mzaf_16282243557037359898.plus.aac.p.m4a",
    "stages": [
      1,
      2,
      4,
      7,
      11,
      16
    ],
    "hints": [
      "Massive hit by Renuka Panwar & ADITYA KALKAL",
      "Featured in \"Unchi Haveli\" (2019)"
    ],
    "era": "2010s",
    "reversedPreviewUrl": "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview116/v4/b7/5e/e9/b75ee9c6-3a1a-4e20-58e5-91a0c166e32a/mzaf_16282243557037359898.plus.aac.p.m4a",
    "startSound": "U",
    "endSound": "L",
    "startSyllable": "Unchi",
    "endSyllable": "Haveli",
    "startSoundLabel": "U (ऊ)",
    "endSoundLabel": "L (ल)",
    "startDevanagari": "उ/ऊ",
    "endDevanagari": "ल",
    "startWord": "Unchi",
    "endWord": "Haveli"
  },
  {
    "id": "hr_27",
    "title": "Naina Ke Teer",
    "artist": "Renuka Panwar & Vikram Pannu",
    "album": "Naina Ke Teer",
    "year": 2022,
    "language": "haryanvi",
    "difficulty": "easy",
    "hookStartSeconds": 0,
    "previewUrl": "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview221/v4/09/9b/64/099b64bf-5942-3673-50aa-84704d8f2a2b/mzaf_5912032597442136498.plus.aac.p.m4a",
    "stages": [
      1,
      2,
      4,
      7,
      11,
      16
    ],
    "hints": [
      "Massive hit by Renuka Panwar & Vikram Pannu",
      "Featured in \"Naina Ke Teer\" (2022)"
    ],
    "era": "new",
    "reversedPreviewUrl": "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview221/v4/09/9b/64/099b64bf-5942-3673-50aa-84704d8f2a2b/mzaf_5912032597442136498.plus.aac.p.m4a",
    "startSound": "N",
    "endSound": "R",
    "startSyllable": "Naina",
    "endSyllable": "Teer",
    "startSoundLabel": "N (न)",
    "endSoundLabel": "R (र)",
    "startDevanagari": "न/ण",
    "endDevanagari": "र/ड़",
    "startWord": "Naina",
    "endWord": "Teer"
  },
  {
    "id": "hr_28",
    "title": "Laad Ladaaye Jaa",
    "artist": "CK Nara & Renuka Panwar",
    "album": "Laad Ladaaye Jaa",
    "year": 2018,
    "language": "haryanvi",
    "difficulty": "hard",
    "hookStartSeconds": 0,
    "previewUrl": "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview118/v4/00/b4/6c/00b46c8d-a571-503b-299a-74deab2c0adb/mzaf_6562622995107148693.plus.aac.p.m4a",
    "stages": [
      1,
      2,
      4,
      7,
      11,
      16
    ],
    "hints": [
      "Massive hit by CK Nara & Renuka Panwar",
      "Featured in \"Laad Ladaaye Jaa\" (2018)"
    ],
    "era": "2010s",
    "reversedPreviewUrl": "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview118/v4/00/b4/6c/00b46c8d-a571-503b-299a-74deab2c0adb/mzaf_6562622995107148693.plus.aac.p.m4a",
    "startSound": "L",
    "endSound": "A",
    "startSyllable": "Laad",
    "endSyllable": "Jaa",
    "startSoundLabel": "L (ल)",
    "endSoundLabel": "A (आ)",
    "startDevanagari": "ल",
    "endDevanagari": "अ/आ",
    "startWord": "Laad",
    "endWord": "Jaa"
  },
  {
    "id": "hr_29",
    "title": "Banno",
    "artist": "Renuka Panwar",
    "album": "Banno",
    "year": 2023,
    "language": "haryanvi",
    "difficulty": "medium",
    "hookStartSeconds": 0,
    "previewUrl": "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview116/v4/85/23/09/852309e4-93d4-e07f-c43f-9932464df636/mzaf_8570961739808852799.plus.aac.p.m4a",
    "stages": [
      1,
      2,
      4,
      7,
      11,
      16
    ],
    "hints": [
      "Massive hit by Renuka Panwar",
      "Featured in \"Banno\" (2023)"
    ],
    "era": "new",
    "reversedPreviewUrl": "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview116/v4/85/23/09/852309e4-93d4-e07f-c43f-9932464df636/mzaf_8570961739808852799.plus.aac.p.m4a",
    "startSound": "B",
    "endSound": "N",
    "startSyllable": "Banno",
    "endSyllable": "Banno",
    "startSoundLabel": "B (ब)",
    "endSoundLabel": "N (न)",
    "startDevanagari": "ब/भ",
    "endDevanagari": "न/ण",
    "startWord": "Banno",
    "endWord": "Banno"
  },
  {
    "id": "hr_30",
    "title": "About We",
    "artist": "Gulzaar Chhaniwala, Sumit Goswami, Diler Kharkiya, Khasa Aala Chahar, Renuka Panwar & Masoom Sharma",
    "album": "About We",
    "year": 2021,
    "language": "haryanvi",
    "difficulty": "expert",
    "hookStartSeconds": 0,
    "previewUrl": "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview221/v4/90/f9/c4/90f9c4a2-857d-61d6-24be-4ba1be8f6f75/mzaf_13735808132603177923.plus.aac.p.m4a",
    "stages": [
      1,
      2,
      4,
      7,
      11,
      16
    ],
    "hints": [
      "Massive hit by Gulzaar Chhaniwala, Sumit Goswami, Diler Kharkiya, Khasa Aala Chahar, Renuka Panwar & Masoom Sharma",
      "Featured in \"About We\" (2021)"
    ],
    "era": "new",
    "reversedPreviewUrl": "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview221/v4/90/f9/c4/90f9c4a2-857d-61d6-24be-4ba1be8f6f75/mzaf_13735808132603177923.plus.aac.p.m4a",
    "startSound": "A",
    "endSound": "V",
    "startSyllable": "About",
    "endSyllable": "We",
    "startSoundLabel": "A (आ)",
    "endSoundLabel": "V (व)",
    "startDevanagari": "अ/आ",
    "endDevanagari": "व/W",
    "startWord": "About",
    "endWord": "We"
  },
  {
    "id": "hr_31",
    "title": "Yanta",
    "artist": "Renuka Panwar & Raja",
    "album": "Yanta",
    "year": 2024,
    "language": "haryanvi",
    "difficulty": "easy",
    "hookStartSeconds": 0,
    "previewUrl": "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview211/v4/1c/23/55/1c235565-be69-874e-2eb2-976ee5a2a142/mzaf_18059345026947853360.plus.aac.p.m4a",
    "stages": [
      1,
      2,
      4,
      7,
      11,
      16
    ],
    "hints": [
      "Massive hit by Renuka Panwar & Raja",
      "Featured in \"Yanta\" (2024)"
    ],
    "era": "new",
    "reversedPreviewUrl": "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview211/v4/1c/23/55/1c235565-be69-874e-2eb2-976ee5a2a142/mzaf_18059345026947853360.plus.aac.p.m4a",
    "startSound": "Y",
    "endSound": "T",
    "startSyllable": "Yanta",
    "endSyllable": "Yanta",
    "startSoundLabel": "Y (य)",
    "endSoundLabel": "T (त)",
    "startDevanagari": "य",
    "endDevanagari": "त/थ/ट/ठ",
    "startWord": "Yanta",
    "endWord": "Yanta"
  },
  {
    "id": "hr_32",
    "title": "Chittiyan Kalaiyan",
    "artist": "Renuka Panwar",
    "album": "Chittiyan Kalaiyan",
    "year": 2018,
    "language": "haryanvi",
    "difficulty": "impossible",
    "hookStartSeconds": 0,
    "previewUrl": "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview126/v4/06/89/38/0689387b-ba51-7eb9-8c13-f1f547f190f6/mzaf_5597031922837202089.plus.aac.p.m4a",
    "stages": [
      1,
      2,
      4,
      7,
      11,
      16
    ],
    "hints": [
      "Massive hit by Renuka Panwar",
      "Featured in \"Chittiyan Kalaiyan\" (2018)"
    ],
    "era": "2010s",
    "reversedPreviewUrl": "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview126/v4/06/89/38/0689387b-ba51-7eb9-8c13-f1f547f190f6/mzaf_5597031922837202089.plus.aac.p.m4a",
    "startSound": "CH",
    "endSound": "N",
    "startSyllable": "Chittiyan",
    "endSyllable": "Kalaiyan",
    "startSoundLabel": "CH (च)",
    "endSoundLabel": "N (न)",
    "startDevanagari": "च/छ",
    "endDevanagari": "न/ण",
    "startWord": "Chittiyan",
    "endWord": "Kalaiyan"
  },
  {
    "id": "hr_33",
    "title": "Chunni",
    "artist": "Sonu Nigam & Renuka Panwar",
    "album": "Chunni",
    "year": 2026,
    "language": "haryanvi",
    "difficulty": "easy",
    "hookStartSeconds": 0,
    "previewUrl": "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview221/v4/11/62/03/116203f8-e78c-c9f8-868b-1039b600bb5b/mzaf_9899577208276876567.plus.aac.p.m4a",
    "stages": [
      1,
      2,
      4,
      7,
      11,
      16
    ],
    "hints": [
      "Massive hit by Sonu Nigam & Renuka Panwar",
      "Featured in \"Chunni\" (2026)"
    ],
    "era": "new",
    "reversedPreviewUrl": "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview221/v4/11/62/03/116203f8-e78c-c9f8-868b-1039b600bb5b/mzaf_9899577208276876567.plus.aac.p.m4a",
    "startSound": "CH",
    "endSound": "N",
    "startSyllable": "Chunni",
    "endSyllable": "Chunni",
    "startSoundLabel": "CH (च)",
    "endSoundLabel": "N (न)",
    "startDevanagari": "च/छ",
    "endDevanagari": "न/ण",
    "startWord": "Chunni",
    "endWord": "Chunni"
  },
  {
    "id": "hr_34",
    "title": "Haryanvi Beat",
    "artist": "Diler Kharkiya & Renuka Panwar",
    "album": "Haryanvi Beat",
    "year": 2021,
    "language": "haryanvi",
    "difficulty": "medium",
    "hookStartSeconds": 0,
    "previewUrl": "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview125/v4/7b/aa/c4/7baac420-72bd-4d3f-084b-935ae2cfa0bd/mzaf_15287881281600476121.plus.aac.p.m4a",
    "stages": [
      1,
      2,
      4,
      7,
      11,
      16
    ],
    "hints": [
      "Massive hit by Diler Kharkiya & Renuka Panwar",
      "Featured in \"Haryanvi Beat\" (2021)"
    ],
    "era": "new",
    "reversedPreviewUrl": "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview125/v4/7b/aa/c4/7baac420-72bd-4d3f-084b-935ae2cfa0bd/mzaf_15287881281600476121.plus.aac.p.m4a",
    "startSound": "H",
    "endSound": "T",
    "startSyllable": "Haryanvi",
    "endSyllable": "Beat",
    "startSoundLabel": "H (ह)",
    "endSoundLabel": "T (त)",
    "startDevanagari": "ह",
    "endDevanagari": "त/थ/ट/ठ",
    "startWord": "Haryanvi",
    "endWord": "Beat"
  },
  {
    "id": "hr_35",
    "title": "Been",
    "artist": "Kaka WRLD, Renuka Panwar & Jaani",
    "album": "Been",
    "year": 2023,
    "language": "haryanvi",
    "difficulty": "easy",
    "hookStartSeconds": 0,
    "previewUrl": "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview126/v4/ee/ff/7b/eeff7beb-a8b3-4615-8aeb-11b35d485132/mzaf_736428894869694277.plus.aac.p.m4a",
    "stages": [
      1,
      2,
      4,
      7,
      11,
      16
    ],
    "hints": [
      "Massive hit by Kaka WRLD, Renuka Panwar & Jaani",
      "Featured in \"Been\" (2023)"
    ],
    "era": "new",
    "reversedPreviewUrl": "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview126/v4/ee/ff/7b/eeff7beb-a8b3-4615-8aeb-11b35d485132/mzaf_736428894869694277.plus.aac.p.m4a",
    "startSound": "B",
    "endSound": "N",
    "startSyllable": "Been",
    "endSyllable": "Been",
    "startSoundLabel": "B (ब)",
    "endSoundLabel": "N (न)",
    "startDevanagari": "ब/भ",
    "endDevanagari": "न/ण",
    "startWord": "Been",
    "endWord": "Been"
  },
  {
    "id": "hr_36",
    "title": "Kasoote 2",
    "artist": "Gulzaar Chhaniwala",
    "album": "Kasoote 2",
    "year": 2019,
    "language": "haryanvi",
    "difficulty": "hard",
    "hookStartSeconds": 0,
    "previewUrl": "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview122/v4/3b/fc/cf/3bfccf11-3286-27d6-4497-7b28de39a355/mzaf_1639642261869436108.plus.aac.p.m4a",
    "stages": [
      1,
      2,
      4,
      7,
      11,
      16
    ],
    "hints": [
      "Massive hit by Gulzaar Chhaniwala",
      "Featured in \"Kasoote 2\" (2019)"
    ],
    "era": "2010s",
    "reversedPreviewUrl": "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview122/v4/3b/fc/cf/3bfccf11-3286-27d6-4497-7b28de39a355/mzaf_1639642261869436108.plus.aac.p.m4a",
    "startSound": "K",
    "endSound": "D",
    "startSyllable": "Kasoote",
    "endSyllable": "Do",
    "startSoundLabel": "K (क)",
    "endSoundLabel": "D (द)",
    "startDevanagari": "क/ख",
    "endDevanagari": "द/ध/ड/ढ",
    "startWord": "Kasoote",
    "endWord": "Do"
  },
  {
    "id": "hr_37",
    "title": "Faad Faad",
    "artist": "Gulzaar Chhaniwala",
    "album": "Faad Faad",
    "year": 2018,
    "language": "haryanvi",
    "difficulty": "medium",
    "hookStartSeconds": 0,
    "previewUrl": "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview112/v4/d1/52/e7/d152e7da-c799-71d7-5fd1-b7ccbc2b61b8/mzaf_8065671175245437248.plus.aac.p.m4a",
    "stages": [
      1,
      2,
      4,
      7,
      11,
      16
    ],
    "hints": [
      "Massive hit by Gulzaar Chhaniwala",
      "Featured in \"Faad Faad\" (2018)"
    ],
    "era": "2010s",
    "reversedPreviewUrl": "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview112/v4/d1/52/e7/d152e7da-c799-71d7-5fd1-b7ccbc2b61b8/mzaf_8065671175245437248.plus.aac.p.m4a",
    "startSound": "F",
    "endSound": "D",
    "startSyllable": "Faad",
    "endSyllable": "Faad",
    "startSoundLabel": "F (फ़)",
    "endSoundLabel": "D (द)",
    "startDevanagari": "फ़/फ",
    "endDevanagari": "द/ध/ड/ढ",
    "startWord": "Faad",
    "endWord": "Faad"
  },
  {
    "id": "hr_38",
    "title": "Mafia Love",
    "artist": "Gulzaar Chhaniwala",
    "album": "Mafia Love",
    "year": 2019,
    "language": "haryanvi",
    "difficulty": "expert",
    "hookStartSeconds": 0,
    "previewUrl": "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview115/v4/83/a9/60/83a960cf-2f94-8bf6-a3a3-4e5adf76fb86/mzaf_10341243233669098974.plus.aac.p.m4a",
    "stages": [
      1,
      2,
      4,
      7,
      11,
      16
    ],
    "hints": [
      "Massive hit by Gulzaar Chhaniwala",
      "Featured in \"Mafia Love\" (2019)"
    ],
    "era": "2010s",
    "reversedPreviewUrl": "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview115/v4/83/a9/60/83a960cf-2f94-8bf6-a3a3-4e5adf76fb86/mzaf_10341243233669098974.plus.aac.p.m4a",
    "startSound": "M",
    "endSound": "V",
    "startSyllable": "Mafia",
    "endSyllable": "Love",
    "startSoundLabel": "M (म)",
    "endSoundLabel": "V (व)",
    "startDevanagari": "म",
    "endDevanagari": "व/W",
    "startWord": "Mafia",
    "endWord": "Love"
  },
  {
    "id": "hr_39",
    "title": "Godfather",
    "artist": "Gulzaar Chhaniwala",
    "album": "Godfather",
    "year": 2022,
    "language": "haryanvi",
    "difficulty": "easy",
    "hookStartSeconds": 0,
    "previewUrl": "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview112/v4/fc/d2/6c/fcd26cff-768b-3218-01ee-b90bc2993981/mzaf_9477037218596213790.plus.aac.p.m4a",
    "stages": [
      1,
      2,
      4,
      7,
      11,
      16
    ],
    "hints": [
      "Massive hit by Gulzaar Chhaniwala",
      "Featured in \"Godfather\" (2022)"
    ],
    "era": "new",
    "reversedPreviewUrl": "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview112/v4/fc/d2/6c/fcd26cff-768b-3218-01ee-b90bc2993981/mzaf_9477037218596213790.plus.aac.p.m4a",
    "startSound": "G",
    "endSound": "R",
    "startSyllable": "Godfather",
    "endSyllable": "Godfather",
    "startSoundLabel": "G (ग)",
    "endSoundLabel": "R (र)",
    "startDevanagari": "ग/घ",
    "endDevanagari": "र/ड़",
    "startWord": "Godfather",
    "endWord": "Godfather"
  },
  {
    "id": "hr_40",
    "title": "Chidi Udd Kaa Udd",
    "artist": "Gulzaar Chhaniwala",
    "album": "Chidi Udd Kaa Udd",
    "year": 2018,
    "language": "haryanvi",
    "difficulty": "impossible",
    "hookStartSeconds": 0,
    "previewUrl": "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview125/v4/66/4b/e8/664be804-0967-4966-dde8-c90c1579ef59/mzaf_3161115304031577667.plus.aac.p.m4a",
    "stages": [
      1,
      2,
      4,
      7,
      11,
      16
    ],
    "hints": [
      "Massive hit by Gulzaar Chhaniwala",
      "Featured in \"Chidi Udd Kaa Udd\" (2018)"
    ],
    "era": "2010s",
    "reversedPreviewUrl": "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview125/v4/66/4b/e8/664be804-0967-4966-dde8-c90c1579ef59/mzaf_3161115304031577667.plus.aac.p.m4a",
    "startSound": "CH",
    "endSound": "D",
    "startSyllable": "Chidi",
    "endSyllable": "Udd",
    "startSoundLabel": "CH (च)",
    "endSoundLabel": "D (द)",
    "startDevanagari": "च/छ",
    "endDevanagari": "द/ध/ड/ढ",
    "startWord": "Chidi",
    "endWord": "Udd"
  },
  {
    "id": "hr_41",
    "title": "Yamraaj",
    "artist": "Gulzaar Chhaniwala",
    "album": "Yamraaj",
    "year": 2021,
    "language": "haryanvi",
    "difficulty": "easy",
    "hookStartSeconds": 0,
    "previewUrl": "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview125/v4/e3/69/89/e36989a8-1e0b-5771-085f-053722392ba0/mzaf_5957766447678301253.plus.aac.p.m4a",
    "stages": [
      1,
      2,
      4,
      7,
      11,
      16
    ],
    "hints": [
      "Massive hit by Gulzaar Chhaniwala",
      "Featured in \"Yamraaj\" (2021)"
    ],
    "era": "new",
    "reversedPreviewUrl": "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview125/v4/e3/69/89/e36989a8-1e0b-5771-085f-053722392ba0/mzaf_5957766447678301253.plus.aac.p.m4a",
    "startSound": "Y",
    "endSound": "J",
    "startSyllable": "Yamraaj",
    "endSyllable": "Yamraaj",
    "startSoundLabel": "Y (य)",
    "endSoundLabel": "J (ज)",
    "startDevanagari": "य",
    "endDevanagari": "ज/झ",
    "startWord": "Yamraaj",
    "endWord": "Yamraaj"
  },
  {
    "id": "hr_42",
    "title": "Shambhu Shambhu",
    "artist": "Gulzaar Chhaniwala",
    "album": "Shambhu Shambhu",
    "year": 2026,
    "language": "haryanvi",
    "difficulty": "medium",
    "hookStartSeconds": 0,
    "previewUrl": "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview221/v4/b0/89/5e/b0895e4b-af85-32a6-4a7d-89c82cd7b1be/mzaf_2720650966860832647.plus.aac.p.m4a",
    "stages": [
      1,
      2,
      4,
      7,
      11,
      16
    ],
    "hints": [
      "Massive hit by Gulzaar Chhaniwala",
      "Featured in \"Shambhu Shambhu\" (2026)"
    ],
    "era": "new",
    "reversedPreviewUrl": "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview221/v4/b0/89/5e/b0895e4b-af85-32a6-4a7d-89c82cd7b1be/mzaf_2720650966860832647.plus.aac.p.m4a",
    "startSound": "S",
    "endSound": "U",
    "startSyllable": "Shambhu",
    "endSyllable": "Shambhu",
    "startSoundLabel": "S (स)",
    "endSoundLabel": "U (ऊ)",
    "startDevanagari": "स/श/ष",
    "endDevanagari": "उ/ऊ",
    "startWord": "Shambhu",
    "endWord": "Shambhu"
  },
  {
    "id": "hr_43",
    "title": "Dada Ravan",
    "artist": "Gulzaar Chhaniwala",
    "album": "Dada Ravan",
    "year": 2021,
    "language": "haryanvi",
    "difficulty": "easy",
    "hookStartSeconds": 0,
    "previewUrl": "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview221/v4/fd/33/d9/fd33d969-ff36-4dd6-0c0c-77b5ecf3ea22/mzaf_6742943328326963715.plus.aac.p.m4a",
    "stages": [
      1,
      2,
      4,
      7,
      11,
      16
    ],
    "hints": [
      "Massive hit by Gulzaar Chhaniwala",
      "Featured in \"Dada Ravan\" (2021)"
    ],
    "era": "new",
    "reversedPreviewUrl": "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview221/v4/fd/33/d9/fd33d969-ff36-4dd6-0c0c-77b5ecf3ea22/mzaf_6742943328326963715.plus.aac.p.m4a",
    "startSound": "D",
    "endSound": "N",
    "startSyllable": "Dada",
    "endSyllable": "Ravan",
    "startSoundLabel": "D (द)",
    "endSoundLabel": "N (न)",
    "startDevanagari": "द/ध/ड/ढ",
    "endDevanagari": "न/ण",
    "startWord": "Dada",
    "endWord": "Ravan"
  },
  {
    "id": "hr_44",
    "title": "Kanya",
    "artist": "Gulzaar Chhaniwala",
    "album": "Kanya",
    "year": 2019,
    "language": "haryanvi",
    "difficulty": "hard",
    "hookStartSeconds": 0,
    "previewUrl": "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview122/v4/23/30/18/233018ae-f289-c825-1b6f-6e13a617f03e/mzaf_3082485254364545557.plus.aac.p.m4a",
    "stages": [
      1,
      2,
      4,
      7,
      11,
      16
    ],
    "hints": [
      "Massive hit by Gulzaar Chhaniwala",
      "Featured in \"Kanya\" (2019)"
    ],
    "era": "2010s",
    "reversedPreviewUrl": "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview122/v4/23/30/18/233018ae-f289-c825-1b6f-6e13a617f03e/mzaf_3082485254364545557.plus.aac.p.m4a",
    "startSound": "K",
    "endSound": "Y",
    "startSyllable": "Kanya",
    "endSyllable": "Kanya",
    "startSoundLabel": "K (क)",
    "endSoundLabel": "Y (य)",
    "startDevanagari": "क/ख",
    "endDevanagari": "य",
    "startWord": "Kanya",
    "endWord": "Kanya"
  },
  {
    "id": "hr_45",
    "title": "Thandi Thandi",
    "artist": "Gulzaar Chhaniwala",
    "album": "Thandi Thandi",
    "year": 2020,
    "language": "haryanvi",
    "difficulty": "medium",
    "hookStartSeconds": 0,
    "previewUrl": "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview125/v4/79/12/0c/79120ce0-58fe-781b-b564-5af7cf8df537/mzaf_12315280887028974255.plus.aac.p.m4a",
    "stages": [
      1,
      2,
      4,
      7,
      11,
      16
    ],
    "hints": [
      "Massive hit by Gulzaar Chhaniwala",
      "Featured in \"Thandi Thandi\" (2020)"
    ],
    "era": "new",
    "reversedPreviewUrl": "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview125/v4/79/12/0c/79120ce0-58fe-781b-b564-5af7cf8df537/mzaf_12315280887028974255.plus.aac.p.m4a",
    "startSound": "T",
    "endSound": "D",
    "startSyllable": "Thandi",
    "endSyllable": "Thandi",
    "startSoundLabel": "T (त)",
    "endSoundLabel": "D (द)",
    "startDevanagari": "त/थ/ट/ठ",
    "endDevanagari": "द/ध/ड/ढ",
    "startWord": "Thandi",
    "endWord": "Thandi"
  },
  {
    "id": "hr_46",
    "title": "Us",
    "artist": "Gulzaar Chhaniwala, Inder Chahal, Maninder Buttar, Gagan Kokri, Barbie Maan & Tasrem Jassar",
    "album": "Us",
    "year": 2021,
    "language": "haryanvi",
    "difficulty": "expert",
    "hookStartSeconds": 0,
    "previewUrl": "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview125/v4/14/5b/9a/145b9af9-8c56-f85f-59ea-028614945e59/mzaf_12901538787948358970.plus.aac.p.m4a",
    "stages": [
      1,
      2,
      4,
      7,
      11,
      16
    ],
    "hints": [
      "Massive hit by Gulzaar Chhaniwala, Inder Chahal, Maninder Buttar, Gagan Kokri, Barbie Maan & Tasrem Jassar",
      "Featured in \"Us\" (2021)"
    ],
    "era": "new",
    "reversedPreviewUrl": "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview125/v4/14/5b/9a/145b9af9-8c56-f85f-59ea-028614945e59/mzaf_12901538787948358970.plus.aac.p.m4a",
    "startSound": "U",
    "endSound": "S",
    "startSyllable": "Us",
    "endSyllable": "Us",
    "startSoundLabel": "U (ऊ)",
    "endSoundLabel": "S (स)",
    "startDevanagari": "उ/ऊ",
    "endDevanagari": "स/श/ष",
    "startWord": "Us",
    "endWord": "Us"
  },
  {
    "id": "hr_47",
    "title": "Raakshas",
    "artist": "Gulzaar Chhaniwala & Shine",
    "album": "Raakshas",
    "year": 2025,
    "language": "haryanvi",
    "difficulty": "easy",
    "hookStartSeconds": 0,
    "previewUrl": "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview221/v4/fe/28/29/fe2829be-fd84-961b-7378-4218104b9531/mzaf_8958937689066045461.plus.aac.p.m4a",
    "stages": [
      1,
      2,
      4,
      7,
      11,
      16
    ],
    "hints": [
      "Massive hit by Gulzaar Chhaniwala & Shine",
      "Featured in \"Raakshas\" (2025)"
    ],
    "era": "new",
    "reversedPreviewUrl": "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview221/v4/fe/28/29/fe2829be-fd84-961b-7378-4218104b9531/mzaf_8958937689066045461.plus.aac.p.m4a",
    "startSound": "R",
    "endSound": "S",
    "startSyllable": "Raakshas",
    "endSyllable": "Raakshas",
    "startSoundLabel": "R (र)",
    "endSoundLabel": "S (स)",
    "startDevanagari": "र/ड़",
    "endDevanagari": "स/श/ष",
    "startWord": "Raakshas",
    "endWord": "Raakshas"
  },
  {
    "id": "hr_48",
    "title": "Pinch",
    "artist": "Gulzaar Chhaniwala",
    "album": "Pinch",
    "year": 2020,
    "language": "haryanvi",
    "difficulty": "impossible",
    "hookStartSeconds": 0,
    "previewUrl": "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview115/v4/33/ca/3a/33ca3a52-ef00-06e5-1f2b-d7237419069c/mzaf_3381149314497425891.plus.aac.p.m4a",
    "stages": [
      1,
      2,
      4,
      7,
      11,
      16
    ],
    "hints": [
      "Massive hit by Gulzaar Chhaniwala",
      "Featured in \"Pinch\" (2020)"
    ],
    "era": "new",
    "reversedPreviewUrl": "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview115/v4/33/ca/3a/33ca3a52-ef00-06e5-1f2b-d7237419069c/mzaf_3381149314497425891.plus.aac.p.m4a",
    "startSound": "P",
    "endSound": "CH",
    "startSyllable": "Pinch",
    "endSyllable": "Pinch",
    "startSoundLabel": "P (प)",
    "endSoundLabel": "CH (च)",
    "startDevanagari": "प",
    "endDevanagari": "च/छ",
    "startWord": "Pinch",
    "endWord": "Pinch"
  },
  {
    "id": "hr_49",
    "title": "Chandrashekhar",
    "artist": "Gulzaar Chhaniwala",
    "album": "Chandrashekhar",
    "year": 2020,
    "language": "haryanvi",
    "difficulty": "easy",
    "hookStartSeconds": 0,
    "previewUrl": "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview115/v4/26/b9/64/26b9643f-e0f6-83f2-6e6e-91cf01df7048/mzaf_926190095465812777.plus.aac.p.m4a",
    "stages": [
      1,
      2,
      4,
      7,
      11,
      16
    ],
    "hints": [
      "Massive hit by Gulzaar Chhaniwala",
      "Featured in \"Chandrashekhar\" (2020)"
    ],
    "era": "new",
    "reversedPreviewUrl": "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview115/v4/26/b9/64/26b9643f-e0f6-83f2-6e6e-91cf01df7048/mzaf_926190095465812777.plus.aac.p.m4a",
    "startSound": "CH",
    "endSound": "R",
    "startSyllable": "Chandrashekhar",
    "endSyllable": "Chandrashekhar",
    "startSoundLabel": "CH (च)",
    "endSoundLabel": "R (र)",
    "startDevanagari": "च/छ",
    "endDevanagari": "र/ड़",
    "startWord": "Chandrashekhar",
    "endWord": "Chandrashekhar"
  },
  {
    "id": "hr_50",
    "title": "Bang! Bang!",
    "artist": "Sumit Goswami, Gulzaar Chhaniwala & Diler Kharkiya",
    "album": "Bang! Bang!",
    "year": 2019,
    "language": "haryanvi",
    "difficulty": "medium",
    "hookStartSeconds": 0,
    "previewUrl": "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview115/v4/28/c2/12/28c212eb-3640-d238-aa11-c8297c2771cf/mzaf_16407782973026265128.plus.aac.p.m4a",
    "stages": [
      1,
      2,
      4,
      7,
      11,
      16
    ],
    "hints": [
      "Massive hit by Sumit Goswami, Gulzaar Chhaniwala & Diler Kharkiya",
      "Featured in \"Bang! Bang!\" (2019)"
    ],
    "era": "2010s",
    "reversedPreviewUrl": "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview115/v4/28/c2/12/28c212eb-3640-d238-aa11-c8297c2771cf/mzaf_16407782973026265128.plus.aac.p.m4a",
    "startSound": "B",
    "endSound": "G",
    "startSyllable": "Bang",
    "endSyllable": "Bang",
    "startSoundLabel": "B (ब)",
    "endSoundLabel": "G (ग)",
    "startDevanagari": "ब/भ",
    "endDevanagari": "ग/घ",
    "startWord": "Bang",
    "endWord": "Bang"
  },
  {
    "id": "hr_51",
    "title": "Dhooma",
    "artist": "Gulzaar Chhaniwala",
    "album": "Dhooma",
    "year": 2021,
    "language": "haryanvi",
    "difficulty": "easy",
    "hookStartSeconds": 0,
    "previewUrl": "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview115/v4/7f/74/74/7f747444-ab8c-a140-e381-adde7efa0e52/mzaf_12829835358654900742.plus.aac.p.m4a",
    "stages": [
      1,
      2,
      4,
      7,
      11,
      16
    ],
    "hints": [
      "Massive hit by Gulzaar Chhaniwala",
      "Featured in \"Dhooma\" (2021)"
    ],
    "era": "new",
    "reversedPreviewUrl": "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview115/v4/7f/74/74/7f747444-ab8c-a140-e381-adde7efa0e52/mzaf_12829835358654900742.plus.aac.p.m4a",
    "startSound": "D",
    "endSound": "M",
    "startSyllable": "Dhooma",
    "endSyllable": "Dhooma",
    "startSoundLabel": "D (द)",
    "endSoundLabel": "M (म)",
    "startDevanagari": "द/ध/ड/ढ",
    "endDevanagari": "म",
    "startWord": "Dhooma",
    "endWord": "Dhooma"
  },
  {
    "id": "hr_52",
    "title": "Randa Party",
    "artist": "Gulzaar Chhaniwala",
    "album": "Randa Party",
    "year": 2019,
    "language": "haryanvi",
    "difficulty": "hard",
    "hookStartSeconds": 0,
    "previewUrl": "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview221/v4/68/2a/e1/682ae1b7-3664-7287-83df-cbec418caacb/mzaf_16961943560268402284.plus.aac.p.m4a",
    "stages": [
      1,
      2,
      4,
      7,
      11,
      16
    ],
    "hints": [
      "Massive hit by Gulzaar Chhaniwala",
      "Featured in \"Randa Party\" (2019)"
    ],
    "era": "2010s",
    "reversedPreviewUrl": "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview221/v4/68/2a/e1/682ae1b7-3664-7287-83df-cbec418caacb/mzaf_16961943560268402284.plus.aac.p.m4a",
    "startSound": "R",
    "endSound": "Y",
    "startSyllable": "Randa",
    "endSyllable": "Party",
    "startSoundLabel": "R (र)",
    "endSoundLabel": "Y (य)",
    "startDevanagari": "र/ड़",
    "endDevanagari": "य",
    "startWord": "Randa",
    "endWord": "Party"
  },
  {
    "id": "hi_old_01",
    "title": "Kuch Kuch Hota Hai",
    "artist": "Udit Narayan, Alka Yagnik",
    "album": "Kuch Kuch Hota Hai",
    "year": 1998,
    "language": "hindi",
    "difficulty": "easy",
    "hookStartSeconds": 0,
    "previewUrl": "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview115/v4/4a/c5/ee/4ac5ee4d-2a1d-a3d5-e3ea-959c1c1f77d3/mzaf_6718012674332306283.plus.aac.p.m4a",
    "stages": [
      1,
      2,
      4,
      7,
      11,
      16
    ],
    "hints": [
      "SRK, Kajol & Rani Mukherjee iconic college love",
      "Jatin-Lalit unforgettable title melody"
    ],
    "era": "old-is-gold",
    "reversedPreviewUrl": "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview115/v4/4a/c5/ee/4ac5ee4d-2a1d-a3d5-e3ea-959c1c1f77d3/mzaf_6718012674332306283.plus.aac.p.m4a",
    "startSound": "K",
    "endSound": "H",
    "startSyllable": "Kuch",
    "endSyllable": "Hai",
    "startSoundLabel": "K (क)",
    "endSoundLabel": "H (ह)",
    "startDevanagari": "क/ख",
    "endDevanagari": "ह",
    "startWord": "Kuch",
    "endWord": "Hai"
  },
  {
    "id": "hi_old_02",
    "title": "Suraj Hua Maddham",
    "artist": "Sonu Nigam, Alka Yagnik",
    "album": "Kabhi Khushi Kabhie Gham",
    "year": 2001,
    "language": "hindi",
    "difficulty": "easy",
    "hookStartSeconds": 0,
    "previewUrl": "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview115/v4/c3/38/54/c338541e-6447-3cf8-07ee-99e31d45c57b/mzaf_11306352011986420177.plus.aac.p.m4a",
    "stages": [
      1,
      2,
      4,
      7,
      11,
      16
    ],
    "hints": [
      "Pyramids of Egypt romantic visual",
      "Sandesh Shandilya eternal melody"
    ],
    "era": "2000s",
    "reversedPreviewUrl": "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview115/v4/c3/38/54/c338541e-6447-3cf8-07ee-99e31d45c57b/mzaf_11306352011986420177.plus.aac.p.m4a",
    "startSound": "S",
    "endSound": "M",
    "startSyllable": "Suraj",
    "endSyllable": "Maddham",
    "startSoundLabel": "S (स)",
    "endSoundLabel": "M (म)",
    "startDevanagari": "स/श/ष",
    "endDevanagari": "म",
    "startWord": "Suraj",
    "endWord": "Maddham"
  },
  {
    "id": "hi_old_03",
    "title": "Bole Chudiyan",
    "artist": "Amit Kumar, Sonu Nigam, Alka Yagnik, Udit Narayan, Kavita Krishnamurthy",
    "album": "Kabhi Khushi Kabhie Gham",
    "year": 2001,
    "language": "hindi",
    "difficulty": "easy",
    "hookStartSeconds": 0,
    "previewUrl": "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview125/v4/24/bb/94/24bb94a2-ae31-3148-52ad-8ec7891bb26d/mzaf_1352494541300957583.plus.aac.p.m4a",
    "stages": [
      1,
      2,
      4,
      7,
      11,
      16
    ],
    "hints": [
      "Karwa Chauth grand family dance",
      "Hrithik, Kareena, SRK & Kajol"
    ],
    "era": "2000s",
    "reversedPreviewUrl": "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview125/v4/24/bb/94/24bb94a2-ae31-3148-52ad-8ec7891bb26d/mzaf_1352494541300957583.plus.aac.p.m4a",
    "startSound": "B",
    "endSound": "N",
    "startSyllable": "Bole",
    "endSyllable": "Chudiyan",
    "startSoundLabel": "B (ब)",
    "endSoundLabel": "N (न)",
    "startDevanagari": "ब/भ",
    "endDevanagari": "न/ण",
    "startWord": "Bole",
    "endWord": "Chudiyan"
  },
  {
    "id": "hi_old_04",
    "title": "Tere Naam",
    "artist": "Udit Narayan, Alka Yagnik",
    "album": "Tere Naam",
    "year": 2003,
    "language": "hindi",
    "difficulty": "medium",
    "hookStartSeconds": 0,
    "previewUrl": "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview115/v4/33/c4/99/33c499f5-46ff-544d-578b-3bb4dca166e4/mzaf_14115165416390161408.plus.aac.p.m4a",
    "stages": [
      1,
      2,
      4,
      7,
      11,
      16
    ],
    "hints": [
      "Radhe Mohan iconic middle-parting hairstyle",
      "Himesh Reshammiya blockbuster album"
    ],
    "era": "2000s",
    "reversedPreviewUrl": "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview115/v4/33/c4/99/33c499f5-46ff-544d-578b-3bb4dca166e4/mzaf_14115165416390161408.plus.aac.p.m4a",
    "startSound": "T",
    "endSound": "M",
    "startSyllable": "Tere",
    "endSyllable": "Naam",
    "startSoundLabel": "T (त)",
    "endSoundLabel": "M (म)",
    "startDevanagari": "त/थ/ट/ठ",
    "endDevanagari": "म",
    "startWord": "Tere",
    "endWord": "Naam"
  },
  {
    "id": "hi_old_05",
    "title": "Tumse Milke Dil Ka",
    "artist": "Sonu Nigam, Aftab Sabri, Hashim Sabri",
    "album": "Main Hoon Na",
    "year": 2004,
    "language": "hindi",
    "difficulty": "medium",
    "hookStartSeconds": 0,
    "previewUrl": "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview125/v4/e5/5d/47/e55d4750-61ca-77c8-47bc-e1daeaec14e5/mzaf_6422363063065406085.plus.aac.p.m4a",
    "stages": [
      1,
      2,
      4,
      7,
      11,
      16
    ],
    "hints": [
      "Major Ram and Chemist teacher romance",
      "Qawwali fused with western violin"
    ],
    "era": "2000s",
    "reversedPreviewUrl": "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview125/v4/e5/5d/47/e55d4750-61ca-77c8-47bc-e1daeaec14e5/mzaf_6422363063065406085.plus.aac.p.m4a",
    "startSound": "T",
    "endSound": "K",
    "startSyllable": "Tumse",
    "endSyllable": "Ka",
    "startSoundLabel": "T (त)",
    "endSoundLabel": "K (क)",
    "startDevanagari": "त/थ/ट/ठ",
    "endDevanagari": "क/ख",
    "startWord": "Tumse",
    "endWord": "Ka"
  },
  {
    "id": "hi_old_06",
    "title": "Mauja Hi Mauja",
    "artist": "Mika Singh",
    "album": "Jab We Met",
    "year": 2007,
    "language": "hindi",
    "difficulty": "easy",
    "hookStartSeconds": 0,
    "previewUrl": "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview125/v4/ce/eb/e6/ceebe6bb-e6ae-f190-38e9-ec3be8353a39/mzaf_14349377484197775586.plus.aac.p.m4a",
    "stages": [
      1,
      2,
      4,
      7,
      11,
      16
    ],
    "hints": [
      "Kareena & Shahid Kapoor celebration end credits",
      "Pritam high-voltage dance hit"
    ],
    "era": "2000s",
    "reversedPreviewUrl": "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview125/v4/ce/eb/e6/ceebe6bb-e6ae-f190-38e9-ec3be8353a39/mzaf_14349377484197775586.plus.aac.p.m4a",
    "startSound": "M",
    "endSound": "J",
    "startSyllable": "Mauja",
    "endSyllable": "Mauja",
    "startSoundLabel": "M (म)",
    "endSoundLabel": "J (ज)",
    "startDevanagari": "म",
    "endDevanagari": "ज/झ",
    "startWord": "Mauja",
    "endWord": "Mauja"
  },
  {
    "id": "hi_old_07",
    "title": "Tum Se Hi",
    "artist": "Mohit Chauhan",
    "album": "Jab We Met",
    "year": 2007,
    "language": "hindi",
    "difficulty": "easy",
    "hookStartSeconds": 0,
    "previewUrl": "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview125/v4/03/f9/54/03f9547d-f495-ea57-fcb6-6d63bb182283/mzaf_17246419702672535071.plus.aac.p.m4a",
    "stages": [
      1,
      2,
      4,
      7,
      11,
      16
    ],
    "hints": [
      "Rain sequence in Himachal & Mumbai",
      "Pritam acoustic guitar classic"
    ],
    "era": "2000s",
    "reversedPreviewUrl": "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview125/v4/03/f9/54/03f9547d-f495-ea57-fcb6-6d63bb182283/mzaf_17246419702672535071.plus.aac.p.m4a",
    "startSound": "T",
    "endSound": "H",
    "startSyllable": "Tum",
    "endSyllable": "Hi",
    "startSoundLabel": "T (त)",
    "endSoundLabel": "H (ह)",
    "startDevanagari": "त/थ/ट/ठ",
    "endDevanagari": "ह",
    "startWord": "Tum",
    "endWord": "Hi"
  },
  {
    "id": "hi_old_08",
    "title": "Aankhon Mein Teri",
    "artist": "KK",
    "album": "Om Shanti Om",
    "year": 2007,
    "language": "hindi",
    "difficulty": "easy",
    "hookStartSeconds": 0,
    "previewUrl": "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview115/v4/95/9b/ea/959bea01-8b3f-1d89-c454-e0b6df4b0f3e/mzaf_8422409756193755486.plus.aac.p.m4a",
    "stages": [
      1,
      2,
      4,
      7,
      11,
      16
    ],
    "hints": [
      "Deepika Padukone red carpet entry",
      "Vishal-Shekhar & unforgettable KK vocals"
    ],
    "era": "2000s",
    "reversedPreviewUrl": "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview115/v4/95/9b/ea/959bea01-8b3f-1d89-c454-e0b6df4b0f3e/mzaf_8422409756193755486.plus.aac.p.m4a",
    "startSound": "A",
    "endSound": "R",
    "startSyllable": "Aankhon",
    "endSyllable": "Teri",
    "startSoundLabel": "A (आ)",
    "endSoundLabel": "R (र)",
    "startDevanagari": "अ/आ",
    "endDevanagari": "र/ड़",
    "startWord": "Aankhon",
    "endWord": "Teri"
  },
  {
    "id": "pb_old_01",
    "title": "Bolo Ta Ra Ra",
    "artist": "Daler Mehndi",
    "album": "Bolo Ta Ra Ra",
    "year": 1995,
    "language": "punjabi",
    "difficulty": "easy",
    "hookStartSeconds": 0,
    "previewUrl": "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview125/v4/71/34/4e/71344e2a-ce04-b9ba-6415-dc34d402371c/mzaf_17495521927702816301.plus.aac.p.m4a",
    "stages": [
      1,
      2,
      4,
      7,
      11,
      16
    ],
    "hints": [
      "The album that launched Indi-pop Bhangra fever",
      "Daler Mehndi energetic signature hook"
    ],
    "era": "old-is-gold",
    "reversedPreviewUrl": "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview125/v4/71/34/4e/71344e2a-ce04-b9ba-6415-dc34d402371c/mzaf_17495521927702816301.plus.aac.p.m4a",
    "startSound": "B",
    "endSound": "R",
    "startSyllable": "Bolo",
    "endSyllable": "Ra",
    "startSoundLabel": "B (ब)",
    "endSoundLabel": "R (र)",
    "startDevanagari": "ब/भ",
    "endDevanagari": "र/ड़",
    "startWord": "Bolo",
    "endWord": "Ra"
  },
  {
    "id": "pb_old_02",
    "title": "Tunak Tunak Tun",
    "artist": "Daler Mehndi",
    "album": "Tunak Tunak Tun",
    "year": 1998,
    "language": "punjabi",
    "difficulty": "easy",
    "hookStartSeconds": 0,
    "previewUrl": "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview125/v4/cb/15/8e/cb158e24-ffba-ee13-057d-f42111cbbd25/mzaf_1350849405626577312.plus.aac.p.m4a",
    "stages": [
      1,
      2,
      4,
      7,
      11,
      16
    ],
    "hints": [
      "First Indian music video to use blue screen CGI",
      "Global internet viral sensation"
    ],
    "era": "old-is-gold",
    "reversedPreviewUrl": "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview125/v4/cb/15/8e/cb158e24-ffba-ee13-057d-f42111cbbd25/mzaf_1350849405626577312.plus.aac.p.m4a",
    "startSound": "T",
    "endSound": "N",
    "startSyllable": "Tunak",
    "endSyllable": "Tun",
    "startSoundLabel": "T (त)",
    "endSoundLabel": "N (न)",
    "startDevanagari": "त/थ/ट/ठ",
    "endDevanagari": "न/ण",
    "startWord": "Tunak",
    "endWord": "Tun"
  },
  {
    "id": "pb_old_03",
    "title": "Challa",
    "artist": "Gurdas Maan",
    "album": "Long Da Lishkara",
    "year": 1986,
    "language": "punjabi",
    "difficulty": "medium",
    "hookStartSeconds": 0,
    "previewUrl": "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview115/v4/7e/3d/8c/7e3d8ccf-2f7a-8d19-ee15-f12658a514d7/mzaf_8462002341235128031.plus.aac.p.m4a",
    "stages": [
      1,
      2,
      4,
      7,
      11,
      16
    ],
    "hints": [
      "Gurdas Maan eternal folk ballad",
      "Challa beriyan pattan te"
    ],
    "era": "old-is-gold",
    "reversedPreviewUrl": "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview115/v4/7e/3d/8c/7e3d8ccf-2f7a-8d19-ee15-f12658a514d7/mzaf_8462002341235128031.plus.aac.p.m4a",
    "startSound": "CH",
    "endSound": "L",
    "startSyllable": "Challa",
    "endSyllable": "Challa",
    "startSoundLabel": "CH (च)",
    "endSoundLabel": "L (ल)",
    "startDevanagari": "च/छ",
    "endDevanagari": "ल",
    "startWord": "Challa",
    "endWord": "Challa"
  },
  {
    "id": "pb_old_04",
    "title": "Dil Luteya",
    "artist": "Jazzy B, Apache Indian",
    "album": "Romeo",
    "year": 2004,
    "language": "punjabi",
    "difficulty": "easy",
    "hookStartSeconds": 0,
    "previewUrl": "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview115/v4/e5/74/4a/e5744a56-4c4f-c020-f4ca-6e1d9d9eb2d7/mzaf_880798150493892705.plus.aac.p.m4a",
    "stages": [
      1,
      2,
      4,
      7,
      11,
      16
    ],
    "hints": [
      "Crown Prince of Bhangra Jazzy B",
      "Sukshinder Shinda powerhouse music"
    ],
    "era": "2000s",
    "reversedPreviewUrl": "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview115/v4/e5/74/4a/e5744a56-4c4f-c020-f4ca-6e1d9d9eb2d7/mzaf_880798150493892705.plus.aac.p.m4a",
    "startSound": "D",
    "endSound": "Y",
    "startSyllable": "Dil",
    "endSyllable": "Luteya",
    "startSoundLabel": "D (द)",
    "endSoundLabel": "Y (य)",
    "startDevanagari": "द/ध/ड/ढ",
    "endDevanagari": "य",
    "startWord": "Dil",
    "endWord": "Luteya"
  },
  {
    "id": "pb_old_05",
    "title": "Sadi Gali",
    "artist": "Lehmber Hussainpuri",
    "album": "Chal Gandasiye",
    "year": 2006,
    "language": "punjabi",
    "difficulty": "easy",
    "hookStartSeconds": 0,
    "previewUrl": "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview115/v4/5c/d9/a2/5cd9a25b-06d2-a740-d63c-3dafa544ae5d/mzaf_10072049887713437256.plus.aac.p.m4a",
    "stages": [
      1,
      2,
      4,
      7,
      11,
      16
    ],
    "hints": [
      "Tanu Weds Manu wedding anthem",
      "Lehmber Hussainpuri iconic high notes"
    ],
    "era": "2000s",
    "reversedPreviewUrl": "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview115/v4/5c/d9/a2/5cd9a25b-06d2-a740-d63c-3dafa544ae5d/mzaf_10072049887713437256.plus.aac.p.m4a",
    "startSound": "S",
    "endSound": "L",
    "startSyllable": "Sadi",
    "endSyllable": "Gali",
    "startSoundLabel": "S (स)",
    "endSoundLabel": "L (ल)",
    "startDevanagari": "स/श/ष",
    "endDevanagari": "ल",
    "startWord": "Sadi",
    "endWord": "Gali"
  },
  {
    "id": "pb_old_06",
    "title": "Bewafa",
    "artist": "Imran Khan",
    "album": "Unforgettable",
    "year": 2009,
    "language": "punjabi",
    "difficulty": "medium",
    "hookStartSeconds": 0,
    "previewUrl": "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview125/v4/ad/7e/03/ad7e0344-93ad-e24f-ef07-4228c2c1995f/mzaf_11322238473489816226.plus.aac.p.m4a",
    "stages": [
      1,
      2,
      4,
      7,
      11,
      16
    ],
    "hints": [
      "Imran Khan Unforgettable album heartbreak anthem",
      "Bewafa nikli hai tu"
    ],
    "era": "2000s",
    "reversedPreviewUrl": "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview125/v4/ad/7e/03/ad7e0344-93ad-e24f-ef07-4228c2c1995f/mzaf_11322238473489816226.plus.aac.p.m4a",
    "startSound": "B",
    "endSound": "F",
    "startSyllable": "Bewafa",
    "endSyllable": "Bewafa",
    "startSoundLabel": "B (ब)",
    "endSoundLabel": "F (फ़)",
    "startDevanagari": "ब/भ",
    "endDevanagari": "फ़/फ",
    "startWord": "Bewafa",
    "endWord": "Bewafa"
  },
  {
    "id": "hr_old_01",
    "title": "Gagan Pe Ghata Chhai",
    "artist": "Chandrawali Heritage",
    "album": "Chandrawal",
    "year": 1984,
    "language": "haryanvi",
    "difficulty": "hard",
    "hookStartSeconds": 0,
    "previewUrl": "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview115/v4/8e/3c/6d/8e3c6d69-3610-84c4-7fae-f65561a35a64/mzaf_15729707921389814402.plus.aac.p.m4a",
    "stages": [
      1,
      2,
      4,
      7,
      11,
      16
    ],
    "hints": [
      "Historic all-time highest grossing Haryanvi film",
      "Usha Sharma & Jagat Singh classic"
    ],
    "era": "old-is-gold",
    "reversedPreviewUrl": "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview115/v4/8e/3c/6d/8e3c6d69-3610-84c4-7fae-f65561a35a64/mzaf_15729707921389814402.plus.aac.p.m4a",
    "startSound": "G",
    "endSound": "H",
    "startSyllable": "Gagan",
    "endSyllable": "Chhai",
    "startSoundLabel": "G (ग)",
    "endSoundLabel": "H (ह)",
    "startDevanagari": "ग/घ",
    "endDevanagari": "ह",
    "startWord": "Gagan",
    "endWord": "Chhai"
  },
  {
    "id": "hr_old_02",
    "title": "Dhakad Chhora",
    "artist": "Uttar Kumar",
    "album": "Dhakad Chhora",
    "year": 2004,
    "language": "haryanvi",
    "difficulty": "medium",
    "hookStartSeconds": 0,
    "previewUrl": "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview125/v4/bd/16/8d/bd168db6-e822-263a-bbff-d59648939c36/mzaf_17070104618228331908.plus.aac.p.m4a",
    "stages": [
      1,
      2,
      4,
      7,
      11,
      16
    ],
    "hints": [
      "Uttar Kumar cult film title anthem",
      "West UP & Haryana cinema record breaker"
    ],
    "era": "2000s",
    "reversedPreviewUrl": "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview125/v4/bd/16/8d/bd168db6-e822-263a-bbff-d59648939c36/mzaf_17070104618228331908.plus.aac.p.m4a",
    "startSound": "D",
    "endSound": "R",
    "startSyllable": "Dhakad",
    "endSyllable": "Chhora",
    "startSoundLabel": "D (द)",
    "endSoundLabel": "R (र)",
    "startDevanagari": "द/ध/ड/ढ",
    "endDevanagari": "र/ड़",
    "startWord": "Dhakad",
    "endWord": "Chhora"
  }
];

// In-memory stats
let playerStats = {
  played: 0,
  wins: 0,
  winRate: 0,
  streak: 0,
  bestStreak: 0,
  history: [],
  normal: {
    played: 0,
    wins: 0,
    winRate: 0,
    streak: 0,
    bestStreak: 0,
    history: []
  },
  reverse: {
    played: 0,
    wins: 0,
    winRate: 0,
    streak: 0,
    bestStreak: 0,
    history: []
  }
};

// Health check endpoint
app.get(['/api/health', '/health'], (req, res) => {
  res.json({
    status: 'ok',
    service: 'SurTest Catalog API',
    uptime: process.uptime(),
    timestamp: new Date().toISOString()
  });
});

// Wakeup endpoint (for the global toast button)
app.post(['/api/wake', '/wake'], (req, res) => {
  res.json({
    status: 'awake',
    message: 'Catalog server is awake and ready.',
    timestamp: new Date().toISOString()
  });
});

// Get list of game modes
app.get(['/api/modes', '/modes'], (req, res) => {
  res.json({
    modes: GAME_MODES
  });
});

// Get list of eras with track counts (overall and per-language)
app.get(['/api/eras', '/eras'], (req, res) => {
  const selectedLang = req.query.language;

  const eraList = ERAS.map((era) => {
    let count = 0;
    const byLanguage = { hindi: 0, punjabi: 0, haryanvi: 0 };

    for (const t of trackCatalog) {
      const tEra = t.era || getEraFromYear(t.year);
      const isEraMatch = era.id === 'all' || tEra === era.id;

      if (isEraMatch) {
        if (byLanguage[t.language] !== undefined) {
          byLanguage[t.language]++;
        }
        if (!selectedLang || selectedLang === 'all' || t.language.toLowerCase() === selectedLang.toLowerCase()) {
          count++;
        }
      }
    }

    return {
      id: era.id,
      label: era.label,
      shortLabel: era.shortLabel,
      range: era.range,
      period: era.period,
      tagline: era.tagline,
      total: count,
      byLanguage,
      theme: era.theme
    };
  });

  res.json({
    total: trackCatalog.length,
    eras: eraList
  });
});

// Get tracks filtered by language, era, and optional difficulty
app.get(['/api/tracks', '/tracks'], (req, res) => {
  const { language, era, difficulty } = req.query;
  let filtered = [...trackCatalog];

  if (language && language !== 'all') {
    filtered = filtered.filter(
      (t) => t.language.toLowerCase() === language.toLowerCase()
    );
  }

  if (era && era !== 'all') {
    filtered = filtered.filter(
      (t) => (t.era || getEraFromYear(t.year)) === era.toLowerCase()
    );
  }

  if (difficulty && difficulty !== 'all') {
    filtered = filtered.filter(
      (t) => t.difficulty.toLowerCase() === difficulty.toLowerCase()
    );
  }

  res.json({
    total: filtered.length,
    language: language || 'all',
    era: era || 'all',
    difficulty: difficulty || 'all',
    tracks: filtered
  });
});

// Get single random track for game round (filtered by language, era, difficulty, mode)
app.get(['/api/round', '/round'], (req, res) => {
  const { language, era, difficulty, hook, mode } = req.query;
  const isReversed = mode === 'reverse';
  let pool = [...trackCatalog];

  if (language && language !== 'all') {
    pool = pool.filter((t) => t.language.toLowerCase() === language.toLowerCase());
  }

  if (era && era !== 'all') {
    const eraMatch = pool.filter((t) => (t.era || getEraFromYear(t.year)) === era.toLowerCase());
    if (eraMatch.length > 0) {
      pool = eraMatch;
    }
  }

  if (difficulty && difficulty !== 'all') {
    const diffMatch = pool.filter(
      (t) => t.difficulty.toLowerCase() === difficulty.toLowerCase()
    );
    if (diffMatch.length > 0) {
      pool = diffMatch;
    }
  }

  if (pool.length === 0) {
    pool = trackCatalog;
  }

  const selectedTrack = pool[Math.floor(Math.random() * pool.length)];
  const trackEra = selectedTrack.era || getEraFromYear(selectedTrack.year);
  const activePreviewUrl = isReversed && selectedTrack.reversedPreviewUrl
    ? selectedTrack.reversedPreviewUrl
    : selectedTrack.previewUrl;

  res.json({
    roundId: 'RND-' + Math.random().toString(36).substring(2, 8).toUpperCase(),
    mode: isReversed ? 'reverse' : 'normal',
    isReversed,
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
      startOffset: hook === 'true' ? selectedTrack.hookStartSeconds : 0,
      previewUrl: activePreviewUrl,
      normalPreviewUrl: selectedTrack.previewUrl,
      reversedPreviewUrl: selectedTrack.reversedPreviewUrl || selectedTrack.previewUrl,
      hints: selectedTrack.hints
    },
    options: trackCatalog.map(t => `${t.title} - ${t.artist}`),
    activeFilters: {
      language: language || 'all',
      era: era || 'all',
      mode: isReversed ? 'reverse' : 'normal',
      poolCount: pool.length
    }
  });
});

// Get and update stats
app.get(['/api/stats', '/stats'], (req, res) => {
  const { mode } = req.query;
  if (mode && playerStats[mode]) {
    return res.json(playerStats[mode]);
  }
  res.json(playerStats);
});

app.post(['/api/stats/record', '/stats/record'], (req, res) => {
  const { won, stage, mode } = req.body;
  const gameMode = mode === 'reverse' ? 'reverse' : 'normal';

  const recordOn = (bucket) => {
    bucket.played += 1;
    if (won) {
      bucket.wins += 1;
      bucket.streak += 1;
      if (bucket.streak > bucket.bestStreak) {
        bucket.bestStreak = bucket.streak;
      }
    } else {
      bucket.streak = 0;
    }

    bucket.winRate = Math.round((bucket.wins / bucket.played) * 100);
    bucket.history.push({
      won: Boolean(won),
      stage: stage || 6,
      mode: gameMode,
      timestamp: new Date().toISOString()
    });
  };

  recordOn(playerStats);
  if (!playerStats[gameMode]) {
    playerStats[gameMode] = {
      played: 0,
      wins: 0,
      winRate: 0,
      streak: 0,
      bestStreak: 0,
      history: []
    };
  }
  recordOn(playerStats[gameMode]);

  res.json(playerStats);
});

// ============================================================================
// STANDALONE ANTAKSHARI MODE ENDPOINTS & IN-MEMORY SESSION STORE
// Completely isolated from Normal/Reverse mode gameplay and state
// ============================================================================

const antakshariSessions = new Map();

// Helper to get or create session
function getOrCreateAntakshariSession(sessionId, language = 'all') {
  if (sessionId && antakshariSessions.has(sessionId)) {
    return antakshariSessions.get(sessionId);
  }

  // Periodic cleanup of stale sessions older than 24 hours
  if (antakshariSessions.size > 2000) {
    const now = Date.now();
    for (const [id, sess] of antakshariSessions.entries()) {
      if (now - sess.createdAt > 24 * 60 * 60 * 1000) {
        antakshariSessions.delete(id);
      }
    }
  }

  const newId = sessionId || 'ANT-' + Math.random().toString(36).substring(2, 9).toUpperCase();
  const newSession = {
    id: newId,
    language: language || 'all',
    chainLength: 0,
    usedSongIds: new Set(),
    history: [],
    createdAt: Date.now()
  };
  antakshariSessions.set(newId, newSession);
  return newSession;
}

// 1. GET /api/antakshari/start — begin new session, pick random starting song
app.get(['/api/antakshari/start', '/antakshari/start'], (req, res) => {
  const { language } = req.query;
  const lang = language && language !== 'all' ? language.toLowerCase() : 'all';

  let pool = trackCatalog.map(ensureSongSounds);
  if (lang !== 'all') {
    const langPool = pool.filter(t => t.language.toLowerCase() === lang);
    if (langPool.length > 0) {
      pool = langPool;
    }
  }

  const selectedTrack = pool[Math.floor(Math.random() * pool.length)] || pool[0];
  const session = getOrCreateAntakshariSession(null, lang);
  session.chainLength = 1;
  session.usedSongIds.clear();
  session.usedSongIds.add(selectedTrack.id);
  session.history = [{
    step: 1,
    songId: selectedTrack.id,
    title: selectedTrack.title,
    artist: selectedTrack.artist,
    startSound: selectedTrack.startSound,
    endSound: selectedTrack.endSound,
    startWord: selectedTrack.startWord || selectedTrack.startSyllable,
    endWord: selectedTrack.endWord || selectedTrack.endSyllable,
    startSyllable: selectedTrack.startWord || selectedTrack.startSyllable,
    endSyllable: selectedTrack.endWord || selectedTrack.endSyllable,
    startSoundLabel: selectedTrack.startSoundLabel,
    endSoundLabel: selectedTrack.endSoundLabel
  }];

  const trackEra = selectedTrack.era || getEraFromYear(selectedTrack.year);

  res.json({
    sessionId: session.id,
    mode: 'antakshari',
    chainLength: 1,
    chainComplete: false,
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
      previewUrl: selectedTrack.previewUrl,
      normalPreviewUrl: selectedTrack.previewUrl,
      hints: selectedTrack.hints,
      startSound: selectedTrack.startSound,
      endSound: selectedTrack.endSound,
      startWord: selectedTrack.startWord || selectedTrack.startSyllable,
      endWord: selectedTrack.endWord || selectedTrack.endSyllable,
      startSyllable: selectedTrack.startWord || selectedTrack.startSyllable,
      endSyllable: selectedTrack.endWord || selectedTrack.endSyllable,
      startSoundLabel: selectedTrack.startSoundLabel,
      endSoundLabel: selectedTrack.endSoundLabel,
      startDevanagari: selectedTrack.startDevanagari,
      endDevanagari: selectedTrack.endDevanagari
    },
    connectingSound: null,
    options: trackCatalog.map(t => `${t.title} - ${t.artist}`)
  });
});

// 2. GET /api/antakshari/next?sessionId=X&previousSongId=Y
app.get(['/api/antakshari/next', '/antakshari/next'], (req, res) => {
  const { sessionId, previousSongId } = req.query;

  let session = sessionId ? antakshariSessions.get(sessionId) : null;
  if (!session) {
    session = getOrCreateAntakshariSession(sessionId);
  }

  // Look up previous song
  let prevTrack = trackCatalog.find(t => t.id === previousSongId);
  if (!prevTrack && session.history.length > 0) {
    const lastHist = session.history[session.history.length - 1];
    prevTrack = trackCatalog.find(t => t.id === lastHist.songId);
  }

  if (!prevTrack) {
    return res.status(400).json({ error: 'Previous song not found' });
  }

  prevTrack = ensureSongSounds(prevTrack);
  const targetSound = prevTrack.endSound;

  // Filter available unused tracks matching startSound
  let pool = trackCatalog.map(ensureSongSounds);
  if (session.language && session.language !== 'all') {
    const langPool = pool.filter(t => t.language.toLowerCase() === session.language.toLowerCase());
    if (langPool.length >= 8) {
      pool = langPool;
    }
  }

  const eligibleTracks = pool.filter(t =>
    !session.usedSongIds.has(t.id) && matchSounds(targetSound, t.startSound)
  );

  // If no match exists (dead end): treated as chain completion / WIN
  if (eligibleTracks.length === 0) {
    return res.json({
      sessionId: session.id,
      mode: 'antakshari',
      chainComplete: true,
      chainLength: session.chainLength,
      message: 'You beat the chain! No unused songs left starting with this sound.',
      connectingSound: {
        sound: targetSound,
        label: prevTrack.endSoundLabel || targetSound,
        devanagari: prevTrack.endDevanagari,
        fromTitle: prevTrack.title,
        fromWord: prevTrack.endWord || prevTrack.endSyllable,
        fromSyllable: prevTrack.endWord || prevTrack.endSyllable
      },
      history: session.history
    });
  }

  // Pick random unused matching track
  const nextTrack = eligibleTracks[Math.floor(Math.random() * eligibleTracks.length)];
  session.chainLength += 1;
  session.usedSongIds.add(nextTrack.id);
  session.history.push({
    step: session.chainLength,
    songId: nextTrack.id,
    title: nextTrack.title,
    artist: nextTrack.artist,
    startSound: nextTrack.startSound,
    endSound: nextTrack.endSound,
    startWord: nextTrack.startWord || nextTrack.startSyllable,
    endWord: nextTrack.endWord || nextTrack.endSyllable,
    startSyllable: nextTrack.startWord || nextTrack.startSyllable,
    endSyllable: nextTrack.endWord || nextTrack.endSyllable,
    connectingSound: targetSound
  });

  const trackEra = nextTrack.era || getEraFromYear(nextTrack.year);

  res.json({
    sessionId: session.id,
    mode: 'antakshari',
    chainComplete: false,
    chainLength: session.chainLength,
    connectingSound: {
      sound: targetSound,
      label: prevTrack.endSoundLabel || targetSound,
      devanagari: prevTrack.endDevanagari,
      fromTitle: prevTrack.title,
      fromWord: prevTrack.endWord || prevTrack.endSyllable,
      fromSyllable: prevTrack.endWord || prevTrack.endSyllable,
      toTitle: nextTrack.title,
      toWord: nextTrack.startWord || nextTrack.startSyllable,
      toSyllable: nextTrack.startWord || nextTrack.startSyllable,
      transitionText: `${prevTrack.endWord || prevTrack.endSyllable} […${targetSound}] ➔ [${targetSound}…] ${nextTrack.startWord || nextTrack.startSyllable}`,
      explanation: `"${prevTrack.title}" ended with sound ${targetSound} (from "${prevTrack.endWord || prevTrack.endSyllable}") ➔ Next song starts with sound ${targetSound} ("${nextTrack.startWord || nextTrack.startSyllable}")`
    },
    track: {
      id: nextTrack.id,
      title: nextTrack.title,
      artist: nextTrack.artist,
      album: nextTrack.album,
      year: nextTrack.year,
      era: trackEra,
      language: nextTrack.language,
      difficulty: nextTrack.difficulty,
      stages: nextTrack.stages,
      previewUrl: nextTrack.previewUrl,
      normalPreviewUrl: nextTrack.previewUrl,
      hints: nextTrack.hints,
      startSound: nextTrack.startSound,
      endSound: nextTrack.endSound,
      startWord: nextTrack.startWord || nextTrack.startSyllable,
      endWord: nextTrack.endWord || nextTrack.endSyllable,
      startSyllable: nextTrack.startWord || nextTrack.startSyllable,
      endSyllable: nextTrack.endWord || nextTrack.endSyllable,
      startSoundLabel: nextTrack.startSoundLabel,
      endSoundLabel: nextTrack.endSoundLabel,
      startDevanagari: nextTrack.startDevanagari,
      endDevanagari: nextTrack.endDevanagari
    },
    options: trackCatalog.map(t => `${t.title} - ${t.artist}`)
  });
});

// ============================================================================
// REAL-TIME MULTIPLAYER ANTAKSHARI ROOMS & MATCH MANAGER
// Turn-based team competition with 30s countdown, phonetics validation & steals
// ============================================================================

const antakshariRooms = new Map();

// Generate human-friendly 5-character room code (e.g. SURF42, TAAL19, RAGA88)
const ROOM_WORDS = ['TAAL', 'SURF', 'RAGA', 'DHUN', 'GEET', 'DESI', 'BEAT', 'DHOL', 'SAAZ', 'GAAN', 'SURR', 'JOSH'];
function generateRoomCode() {
  for (let i = 0; i < 30; i++) {
    const word = ROOM_WORDS[Math.floor(Math.random() * ROOM_WORDS.length)];
    const digit = Math.floor(10 + Math.random() * 89);
    const code = `${word}${digit}`;
    if (!antakshariRooms.has(code)) return code;
  }
  return 'ANT' + Math.random().toString(36).substring(2, 6).toUpperCase();
}

// Clean up rooms older than 12 hours
function cleanupStaleRooms() {
  const now = Date.now();
  for (const [code, room] of antakshariRooms.entries()) {
    if (now - room.createdAt > 12 * 60 * 60 * 1000) {
      antakshariRooms.delete(code);
    }
  }
}

// Check and process timeout for active turn
function checkRoomTimeout(room) {
  if (!room || room.status !== 'active') return false;
  const now = Date.now();

  if (room.turnExpiresAt && now >= room.turnExpiresAt) {
    const timedOutTeam = room.currentTurn;
    const opposingTeam = timedOutTeam === 'A' ? 'B' : 'A';

    // Award +1 point to opposing team on timeout
    room.teams[opposingTeam].score += 1;
    room.lastAction = {
      type: 'timeout',
      team: timedOutTeam,
      message: `⏰ 30-second timer expired for ${room.teams[timedOutTeam].name}! Point awarded to ${room.teams[opposingTeam].name}.`,
      timestamp: now
    };

    // Check if target score reached
    if (room.teams[opposingTeam].score >= room.targetScore) {
      room.status = 'game_over';
      room.winner = opposingTeam;
      room.turnExpiresAt = null;
      return true;
    }

    // Switch turn to opposing team with fresh timer
    room.currentTurn = opposingTeam;
    room.turnNumber += 1;
    room.turnStartedAt = now;
    room.turnExpiresAt = now + (room.turnDuration * 1000);
    return true;
  }
  return false;
}

// 1. POST /api/antakshari/rooms/create
app.post(['/api/antakshari/rooms/create', '/antakshari/rooms/create'], (req, res) => {
  cleanupStaleRooms();
  const { hostName, teamAName, teamBName, turnDuration, targetScore, startImmediately } = req.body || {};

  const roomCode = generateRoomCode();
  const hostPlayerId = 'usr_' + Math.random().toString(36).substring(2, 9);
  const durationSec = Math.min(Math.max(Number(turnDuration) || 30, 10), 60);
  const targetPts = Math.min(Math.max(Number(targetScore) || 5, 3), 15);
  const isAutoStart = Boolean(startImmediately);

  const room = {
    code: roomCode,
    status: isAutoStart ? 'active' : 'waiting', // 'waiting' for Team B, 'active', 'game_over'
    targetScore: targetPts,
    turnDuration: durationSec,
    teams: {
      A: {
        id: 'A',
        name: (teamAName || 'Team A').trim().substring(0, 24),
        score: 0,
        players: [{ id: hostPlayerId, name: (hostName || 'Player 1').trim().substring(0, 24), isHost: true }]
      },
      B: {
        id: 'B',
        name: (teamBName || 'Team B').trim().substring(0, 24),
        score: 0,
        players: []
      }
    },
    currentTurn: 'A',
    turnNumber: 1,
    turnStartedAt: isAutoStart ? Date.now() : null,
    turnExpiresAt: isAutoStart ? Date.now() + (durationSec * 1000) : null,
    currentRequiredSound: null, // null for round 1 (any opening song of choice!)
    previousSong: null,
    usedSongs: [],
    chainHistory: [],
    winner: null,
    lastAction: {
      type: 'room_created',
      team: 'A',
      message: isAutoStart
        ? `Match started! ${teamAName || 'Team A'} kicks off with any song of choice!`
        : `Room ${roomCode} created! Share code with Team B to start.`,
      timestamp: Date.now()
    },
    createdAt: Date.now(),
    updatedAt: Date.now()
  };

  antakshariRooms.set(roomCode, room);

  res.json({
    success: true,
    roomCode,
    playerId: hostPlayerId,
    myTeam: 'A',
    room
  });
});

// 2. POST /api/antakshari/rooms/join
app.post(['/api/antakshari/rooms/join', '/antakshari/rooms/join'], (req, res) => {
  const { roomCode, playerName, teamName } = req.body || {};
  const code = String(roomCode || '').trim().toUpperCase();
  const room = antakshariRooms.get(code);

  if (!room) {
    return res.status(404).json({ error: 'Room not found! Please check the 5-character code.' });
  }

  if (room.status === 'game_over') {
    return res.status(400).json({ error: 'This match has already ended!' });
  }

  const joinPlayerId = 'usr_' + Math.random().toString(36).substring(2, 9);
  const playerDisplayName = (playerName || 'Player 2').trim().substring(0, 24);

  if (teamName && teamName.trim()) {
    room.teams.B.name = teamName.trim().substring(0, 24);
  }
  room.teams.B.players.push({ id: joinPlayerId, name: playerDisplayName });

  // Activate game if it was waiting
  if (room.status === 'waiting') {
    room.status = 'active';
    room.currentTurn = 'A';
    room.turnStartedAt = Date.now();
    room.turnExpiresAt = Date.now() + (room.turnDuration * 1000);
    room.lastAction = {
      type: 'match_started',
      team: 'A',
      message: `${playerDisplayName} joined Team B! ${room.teams.A.name} kicks off with any song of choice!`,
      timestamp: Date.now()
    };
  }

  room.updatedAt = Date.now();

  res.json({
    success: true,
    roomCode: code,
    playerId: joinPlayerId,
    myTeam: 'B',
    room
  });
});

// 3. GET /api/antakshari/rooms/:roomCode
app.get(['/api/antakshari/rooms/:roomCode', '/antakshari/rooms/:roomCode'], (req, res) => {
  const code = String(req.params.roomCode || '').trim().toUpperCase();
  const room = antakshariRooms.get(code);

  if (!room) {
    return res.status(404).json({ error: 'Room not found' });
  }

  checkRoomTimeout(room);
  room.updatedAt = Date.now();

  res.json({
    room,
    serverTime: Date.now()
  });
});

// 4. POST /api/antakshari/rooms/:roomCode/submit
app.post(['/api/antakshari/rooms/:roomCode/submit', '/antakshari/rooms/:roomCode/submit'], (req, res) => {
  const code = String(req.params.roomCode || '').trim().toUpperCase();
  const room = antakshariRooms.get(code);

  if (!room) {
    return res.status(404).json({ error: 'Room not found' });
  }

  checkRoomTimeout(room);

  if (room.status !== 'active') {
    return res.status(400).json({ error: room.status === 'game_over' ? 'Match is already over!' : 'Match has not started yet!' });
  }

  const { team, songTitle } = req.body || {};

  if (team !== room.currentTurn) {
    return res.status(403).json({ error: `It is currently ${room.teams[room.currentTurn].name}'s turn!` });
  }

  // Validate Antakshari rules (required sound, duplicate history, catalog lookup)
  const validation = validateAntakshariSubmission(
    songTitle,
    room.currentRequiredSound,
    room.usedSongs,
    trackCatalog
  );

  if (!validation.valid) {
    return res.status(422).json({
      success: false,
      error: validation.error
    });
  }

  const song = validation.song;
  const submittingTeam = team;
  const opposingTeam = team === 'A' ? 'B' : 'A';

  // Award +1 point to submitting team
  room.teams[submittingTeam].score += 1;

  // Add to used songs (normalized)
  room.usedSongs.push({
    title: song.title,
    normalized: normalizeSongTitle(song.title),
    artist: song.artist,
    team: submittingTeam,
    startSound: song.startSound,
    endSound: song.endSound
  });

  // Record turn in chain history
  const turnHistoryItem = {
    turnNumber: room.turnNumber,
    team: submittingTeam,
    teamName: room.teams[submittingTeam].name,
    songTitle: song.title,
    artist: song.artist,
    previewUrl: song.previewUrl,
    startWord: song.startWord,
    startSound: song.startSound,
    startSoundLabel: song.startSoundLabel,
    endWord: song.endWord,
    endSound: song.endSound,
    endSoundLabel: song.endSoundLabel,
    transitionText: room.currentRequiredSound
      ? `…${room.currentRequiredSound.sound} ➔ "${song.startWord}" [${song.startSound}] … "${song.endWord}" [${song.endSound}]`
      : `Opening song: "${song.title}" […${song.endSound}]`,
    timestamp: Date.now()
  };

  room.chainHistory.push(turnHistoryItem);
  room.previousSong = {
    title: song.title,
    artist: song.artist,
    previewUrl: song.previewUrl,
    startWord: song.startWord,
    endWord: song.endWord,
    startSound: song.startSound,
    endSound: song.endSound,
    startSoundLabel: song.startSoundLabel,
    endSoundLabel: song.endSoundLabel,
    submittedByTeam: submittingTeam,
    submittedByTeamName: room.teams[submittingTeam].name
  };

  // Next required sound is the ending sound of this song
  const endBucket = ANTAKSHARI_BUCKETS[song.endSound] || { label: `${song.endSound} (${song.endSound})`, devanagari: song.endSound };
  room.currentRequiredSound = {
    sound: song.endSound,
    label: song.endSoundLabel || endBucket.label,
    devanagari: song.endDevanagari || endBucket.devanagari,
    fromWord: song.endWord,
    fromTitle: song.title
  };

  // Check Win Condition (First to target score)
  if (room.teams[submittingTeam].score >= room.targetScore) {
    room.status = 'game_over';
    room.winner = submittingTeam;
    room.turnExpiresAt = null;
    room.lastAction = {
      type: 'game_over',
      team: submittingTeam,
      message: `🏆 ${room.teams[submittingTeam].name} wins the match with ${room.teams[submittingTeam].score} points!`,
      timestamp: Date.now()
    };
  } else {
    // Switch turn to opposing team
    room.currentTurn = opposingTeam;
    room.turnNumber += 1;
    const now = Date.now();
    room.turnStartedAt = now;
    room.turnExpiresAt = now + (room.turnDuration * 1000);
    room.lastAction = {
      type: 'song_accepted',
      team: submittingTeam,
      message: `🎵 ${room.teams[submittingTeam].name} sang "${song.title}" (ended in ${song.endSoundLabel}). Next up: ${room.teams[opposingTeam].name} on sound ${song.endSoundLabel}!`,
      timestamp: now
    };
  }

  room.updatedAt = Date.now();

  res.json({
    success: true,
    song,
    room
  });
});

// 5. POST /api/antakshari/rooms/:roomCode/timeout
app.post(['/api/antakshari/rooms/:roomCode/timeout', '/antakshari/rooms/:roomCode/timeout'], (req, res) => {
  const code = String(req.params.roomCode || '').trim().toUpperCase();
  const room = antakshariRooms.get(code);

  if (!room) {
    return res.status(404).json({ error: 'Room not found' });
  }

  checkRoomTimeout(room);
  room.updatedAt = Date.now();

  res.json({
    success: true,
    room
  });
});

// 6. POST /api/antakshari/rooms/:roomCode/rematch
app.post(['/api/antakshari/rooms/:roomCode/rematch', '/antakshari/rooms/:roomCode/rematch'], (req, res) => {
  const code = String(req.params.roomCode || '').trim().toUpperCase();
  const room = antakshariRooms.get(code);

  if (!room) {
    return res.status(404).json({ error: 'Room not found' });
  }

  // Swap starting team on rematch
  const newStartingTeam = room.winner === 'A' ? 'B' : 'A';

  room.status = 'active';
  room.teams.A.score = 0;
  room.teams.B.score = 0;
  room.currentTurn = newStartingTeam;
  room.turnNumber = 1;
  room.turnStartedAt = Date.now();
  room.turnExpiresAt = Date.now() + (room.turnDuration * 1000);
  room.currentRequiredSound = null;
  room.previousSong = null;
  room.usedSongs = [];
  room.chainHistory = [];
  room.winner = null;
  room.lastAction = {
    type: 'rematch_started',
    team: newStartingTeam,
    message: `Rematch started! ${room.teams[newStartingTeam].name} kicks off!`,
    timestamp: Date.now()
  };
  room.updatedAt = Date.now();

  res.json({
    success: true,
    room
  });
});

const isDirectRun = Boolean(process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1]));

if (!process.env.VERCEL && isDirectRun) {
  app.listen(PORT, '::', () => {
    console.log(`SurTest Catalog API running on port ${PORT} (dual-stack IPv4/IPv6)`);
  });
}

export default app;
