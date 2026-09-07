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
  // Hindi tracks
  {
    id: "hi_01",
    title: "Tum Hi Ho",
    artist: "Arijit Singh",
    album: "Aashiqui 2",
    year: 2013,
    language: "hindi",
    difficulty: "easy",
    hookStartSeconds: 0,
    previewUrl: "/audio/tum-hi-ho.m4a",
    stages: [1, 2, 4, 7, 11, 16],
    hints: ["Blockbuster romantic anthem", "Mithoon composed the music"]
  },
  {
    id: "hi_02",
    title: "Chaiyya Chaiyya",
    artist: "Sukhwinder Singh, Sapna Awasthi",
    album: "Dil Se..",
    year: 1998,
    language: "hindi",
    difficulty: "medium",
    hookStartSeconds: 0,
    previewUrl: "/audio/chaiyya-chaiyya.m4a",
    stages: [1, 2, 4, 7, 11, 16],
    hints: ["Train top iconic dance", "A. R. Rahman masterpiece"]
  },
  {
    id: "hi_03",
    title: "Kesariya",
    artist: "Arijit Singh, Pritam",
    album: "Brahmāstra",
    year: 2022,
    language: "hindi",
    difficulty: "easy",
    hookStartSeconds: 0,
    previewUrl: "/audio/kesariya.m4a",
    stages: [1, 2, 4, 7, 11, 16],
    hints: ["Love storiyaan fame", "Ranbir & Alia"]
  },
  {
    id: "hi_04",
    title: "Kal Ho Naa Ho",
    artist: "Sonu Nigam",
    album: "Kal Ho Naa Ho",
    year: 2003,
    language: "hindi",
    difficulty: "hard",
    hookStartSeconds: 0,
    previewUrl: "/audio/kal-ho-naa-ho.m4a",
    stages: [1, 2, 4, 7, 11, 16],
    hints: ["Emotional title track", "Shankar-Ehsaan-Loy"]
  },
  {
    id: "hi_05",
    title: "Apna Bana Le",
    artist: "Arijit Singh, Sachin-Jigar",
    album: "Bhediya",
    year: 2022,
    language: "hindi",
    difficulty: "easy",
    hookStartSeconds: 0,
    previewUrl: "/audio/apna-bana-le.m4a",
    stages: [1, 2, 4, 7, 11, 16],
    hints: ["Soulful ballad with Varun Dhawan", "Sachin-Jigar melody"]
  },
  {
    id: "hi_06",
    title: "Kabira",
    artist: "Tochi Raina, Rekha Bhardwaj",
    album: "Yeh Jawaani Hai Deewani",
    year: 2013,
    language: "hindi",
    difficulty: "medium",
    hookStartSeconds: 0,
    previewUrl: "/audio/kabira.m4a",
    stages: [1, 2, 4, 7, 11, 16],
    hints: ["Classic wedding Sufi vibe", "Ranbir Kapoor & Deepika Padukone"]
  },
  {
    id: "hi_07",
    title: "Gerua",
    artist: "Arijit Singh, Antara Mitra",
    album: "Dilwale",
    year: 2015,
    language: "hindi",
    difficulty: "medium",
    hookStartSeconds: 0,
    previewUrl: "/audio/gerua.m4a",
    stages: [1, 2, 4, 7, 11, 16],
    hints: ["SRK & Kajol in Iceland", "Pritam composition"]
  },
  {
    id: "hi_08",
    title: "Ghungroo",
    artist: "Arijit Singh, Shilpa Rao",
    album: "War",
    year: 2019,
    language: "hindi",
    difficulty: "medium",
    hookStartSeconds: 0,
    previewUrl: "/audio/ghungroo.m4a",
    stages: [1, 2, 4, 7, 11, 16],
    hints: ["Hrithik Roshan beach party dance", "Vishal-Shekhar groovy rhythm"]
  },
  {
    id: "hi_09",
    title: "Kun Faya Kun",
    artist: "A. R. Rahman, Mohit Chauhan, Javed Ali",
    album: "Rockstar",
    year: 2011,
    language: "hindi",
    difficulty: "hard",
    hookStartSeconds: 0,
    previewUrl: "/audio/kun-faya-kun.m4a",
    stages: [1, 2, 4, 7, 11, 16],
    hints: ["Nizamuddin Dargah spiritual anthem", "A. R. Rahman masterpiece"]
  },
  {
    id: "hi_10",
    title: "Tujh Mein Rab Dikhta Hai",
    artist: "Roop Kumar Rathod",
    album: "Rab Ne Bana Di Jodi",
    year: 2008,
    language: "hindi",
    difficulty: "easy",
    hookStartSeconds: 0,
    previewUrl: "/audio/tujh-mein-rab-dikhta-hai.m4a",
    stages: [1, 2, 4, 7, 11, 16],
    hints: ["SRK & Anushka Sharma debut", "Salim-Sulaiman classic"]
  },

  // Punjabi tracks
  {
    id: "pb_01",
    title: "Brown Munde",
    artist: "AP Dhillon, Gurinder Gill, Shinda Kahlon",
    album: "Brown Munde",
    year: 2020,
    language: "punjabi",
    difficulty: "easy",
    hookStartSeconds: 0,
    previewUrl: "/audio/brown-munde.m4a",
    stages: [1, 2, 4, 7, 11, 16],
    hints: ["Global Punjabi hip-hop wave", "G-Wagon anthem"]
  },
  {
    id: "pb_02",
    title: "Amplifier",
    artist: "Imran Khan",
    album: "Unforgettable",
    year: 2009,
    language: "punjabi",
    difficulty: "medium",
    hookStartSeconds: 0,
    previewUrl: "/audio/amplifier.m4a",
    stages: [1, 2, 4, 7, 11, 16],
    hints: ["Dutch-Pakistani banger", "Gaadi sadi behja"]
  },
  {
    id: "pb_03",
    title: "Lover",
    artist: "Diljit Dosanjh",
    album: "MoonChild Era",
    year: 2021,
    language: "punjabi",
    difficulty: "hard",
    hookStartSeconds: 0,
    previewUrl: "/audio/lover.m4a",
    stages: [1, 2, 4, 7, 11, 16],
    hints: ["Synthwave Punjabi sound", "Diljit Coachella vibe"]
  },
  {
    id: "pb_04",
    title: "Excuses",
    artist: "AP Dhillon, Gurinder Gill",
    album: "Hidden Gems",
    year: 2020,
    language: "punjabi",
    difficulty: "easy",
    hookStartSeconds: 0,
    previewUrl: "/audio/excuses.m4a",
    stages: [1, 2, 4, 7, 11, 16],
    hints: ["Kehndi hundi si chan tak raah bana de", "Viral reels sensation"]
  },
  {
    id: "pb_05",
    title: "Insane",
    artist: "AP Dhillon, Shinda Kahlon",
    album: "Insane",
    year: 2021,
    language: "punjabi",
    difficulty: "medium",
    hookStartSeconds: 0,
    previewUrl: "/audio/insane.m4a",
    stages: [1, 2, 4, 7, 11, 16],
    hints: ["Dark trap Punjabi beat", "Gminxr production"]
  },
  {
    id: "pb_06",
    title: "High Rated Gabru",
    artist: "Guru Randhawa",
    album: "High Rated Gabru",
    year: 2017,
    language: "punjabi",
    difficulty: "easy",
    hookStartSeconds: 0,
    previewUrl: "/audio/high-rated-gabru.m4a",
    stages: [1, 2, 4, 7, 11, 16],
    hints: ["Billion views chart-topper", "Hayye nakhra tera ni"]
  },
  {
    id: "pb_07",
    title: "Lahore",
    artist: "Guru Randhawa",
    album: "Lahore",
    year: 2017,
    language: "punjabi",
    difficulty: "easy",
    hookStartSeconds: 0,
    previewUrl: "/audio/lahore.m4a",
    stages: [1, 2, 4, 7, 11, 16],
    hints: ["Lagdi Lahore di aa", "Global Billboard ranking"]
  },
  {
    id: "pb_08",
    title: "Proper Patola",
    artist: "Diljit Dosanjh, Badshah",
    album: "Proper Patola",
    year: 2018,
    language: "punjabi",
    difficulty: "medium",
    hookStartSeconds: 0,
    previewUrl: "/audio/proper-patola.m4a",
    stages: [1, 2, 4, 7, 11, 16],
    hints: ["Iconic urban Punjabi hit", "Diljit x Badshah collab"]
  },
  {
    id: "pb_09",
    title: "Do You Know",
    artist: "Diljit Dosanjh",
    album: "Do You Know",
    year: 2016,
    language: "punjabi",
    difficulty: "medium",
    hookStartSeconds: 0,
    previewUrl: "/audio/do-you-know.m4a",
    stages: [1, 2, 4, 7, 11, 16],
    hints: ["Romantic signature ballad", "Jaani lyrics & B Praak"]
  },
  {
    id: "pb_10",
    title: "Prada",
    artist: "Jass Manak",
    album: "Prada",
    year: 2018,
    language: "punjabi",
    difficulty: "hard",
    hookStartSeconds: 0,
    previewUrl: "/audio/prada.m4a",
    stages: [1, 2, 4, 7, 11, 16],
    hints: ["Breakout anthem for Jass Manak", "Lehanga fame singer"]
  },

  // Haryanvi tracks
  {
    id: "hr_01",
    title: "52 Gaj Ka Daman",
    artist: "Renuka Panwar",
    album: "52 Gaj Ka Daman",
    year: 2020,
    language: "haryanvi",
    difficulty: "easy",
    hookStartSeconds: 0,
    previewUrl: "/audio/52-gaj-ka-daman.m4a",
    stages: [1, 2, 4, 7, 11, 16],
    hints: ["Billion+ views record", "Traditional ghagra dance beat"]
  },
  {
    id: "hr_02",
    title: "Solid Body",
    artist: "Raju Punjabi, Sheenam Katholic",
    album: "Solid Body",
    year: 2015,
    language: "haryanvi",
    difficulty: "medium",
    hookStartSeconds: 0,
    previewUrl: "/audio/solid-body.m4a",
    stages: [1, 2, 4, 7, 11, 16],
    hints: ["Classic village DJ anthem", "Raju Punjabi legend"]
  },
  {
    id: "hr_03",
    title: "Bahu Kale Ki",
    artist: "Gajender Phogat, Anu Kadyan",
    album: "Bahu Kale Ki",
    year: 2018,
    language: "haryanvi",
    difficulty: "hard",
    hookStartSeconds: 0,
    previewUrl: "/audio/bahu-kale-ki.m4a",
    stages: [1, 2, 4, 7, 11, 16],
    hints: ["Iconic desi folk anthem", "Gajender Phogat hit"]
  },
  {
    id: "hr_04",
    title: "Moto",
    artist: "Diler Kharkiya",
    album: "Moto",
    year: 2020,
    language: "haryanvi",
    difficulty: "easy",
    hookStartSeconds: 0,
    previewUrl: "/audio/moto.m4a",
    stages: [1, 2, 4, 7, 11, 16],
    hints: ["Diler Kharkiya blockbuster", "Tareef karegi teri moto"]
  },
  {
    id: "hr_05",
    title: "Chatak Matak",
    artist: "Renuka Panwar",
    album: "Chatak Matak",
    year: 2020,
    language: "haryanvi",
    difficulty: "medium",
    hookStartSeconds: 0,
    previewUrl: "/audio/chatak-matak.m4a",
    stages: [1, 2, 4, 7, 11, 16],
    hints: ["Sapna Choudhary dance video", "Renuka Panwar vocals"]
  },
  {
    id: "hr_06",
    title: "Gypsy",
    artist: "GD Kaur, Pranjal Dahiya",
    album: "Gypsy",
    year: 2022,
    language: "haryanvi",
    difficulty: "easy",
    hookStartSeconds: 0,
    previewUrl: "/audio/gypsy.m4a",
    stages: [1, 2, 4, 7, 11, 16],
    hints: ["Mera Balam Thanedaar chalave gypsy", "Viral nationwide reels anthem"]
  },
  {
    id: "hr_07",
    title: "Teri Aakhya Ka Yo Kajal",
    artist: "DC Madana",
    album: "Teri Aakhya Ka Yo Kajal",
    year: 2018,
    language: "haryanvi",
    difficulty: "easy",
    hookStartSeconds: 0,
    previewUrl: "/audio/teri-aakhya-ka-yo-kajal.m4a",
    stages: [1, 2, 4, 7, 11, 16],
    hints: ["All-time viral dance craze", "Sapna Choudhary signature song"]
  },
  {
    id: "hr_08",
    title: "Middle Class",
    artist: "Gulzaar Chhaniwala",
    album: "Middle Class",
    year: 2019,
    language: "haryanvi",
    difficulty: "hard",
    hookStartSeconds: 0,
    previewUrl: "/audio/middle-class.m4a",
    stages: [1, 2, 4, 7, 11, 16],
    hints: ["Emotional middle class youth anthem", "Gulzaar Chhaniwala rap"]
  },
  {
    id: "hr_09",
    title: "Jug Jug Jeeve",
    artist: "Gulzaar Chhaniwala",
    album: "Jug Jug Jeeve",
    year: 2020,
    language: "haryanvi",
    difficulty: "medium",
    hookStartSeconds: 0,
    previewUrl: "/audio/jug-jug-jeeve.m4a",
    stages: [1, 2, 4, 7, 11, 16],
    hints: ["High-energy desi dhol beats", "Gulzaar Chhaniwala anthem"]
  }
];

// In-memory stats
let playerStats = {
  played: 0,
  wins: 0,
  winRate: 0,
  streak: 0,
  bestStreak: 0,
  history: []
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

// Get tracks filtered by language and optional difficulty
app.get(['/api/tracks', '/tracks'], (req, res) => {
  const { language, difficulty } = req.query;
  let filtered = [...trackCatalog];

  if (language) {
    filtered = filtered.filter(
      (t) => t.language.toLowerCase() === language.toLowerCase()
    );
  }

  if (difficulty) {
    filtered = filtered.filter(
      (t) => t.difficulty.toLowerCase() === difficulty.toLowerCase()
    );
  }

  res.json({
    total: filtered.length,
    language: language || 'all',
    difficulty: difficulty || 'all',
    tracks: filtered
  });
});

// Get single random track for game round
app.get(['/api/round', '/round'], (req, res) => {
  const { language, difficulty, hook } = req.query;
  let pool = [...trackCatalog];

  if (language) {
    pool = pool.filter((t) => t.language.toLowerCase() === language.toLowerCase());
  }

  if (difficulty) {
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

  res.json({
    roundId: 'RND-' + Math.random().toString(36).substring(2, 8).toUpperCase(),
    track: {
      id: selectedTrack.id,
      title: selectedTrack.title,
      artist: selectedTrack.artist,
      album: selectedTrack.album,
      year: selectedTrack.year,
      language: selectedTrack.language,
      difficulty: selectedTrack.difficulty,
      stages: selectedTrack.stages,
      startOffset: hook === 'true' ? selectedTrack.hookStartSeconds : 0,
      previewUrl: selectedTrack.previewUrl,
      hints: selectedTrack.hints
    },
    options: trackCatalog.map(t => `${t.title} - ${t.artist}`)
  });
});

// Get and update stats
app.get(['/api/stats', '/stats'], (req, res) => {
  res.json(playerStats);
});

app.post(['/api/stats/record', '/stats/record'], (req, res) => {
  const { won, stage } = req.body;
  playerStats.played += 1;
  if (won) {
    playerStats.wins += 1;
    playerStats.streak += 1;
    if (playerStats.streak > playerStats.bestStreak) {
      playerStats.bestStreak = playerStats.streak;
    }
  } else {
    playerStats.streak = 0;
  }

  playerStats.winRate = Math.round((playerStats.wins / playerStats.played) * 100);
  playerStats.history.push({
    won: Boolean(won),
    stage: stage || 6,
    timestamp: new Date().toISOString()
  });

  res.json(playerStats);
});

if (!process.env.VERCEL) {
  app.listen(PORT, '::', () => {
    console.log(`SurTest Catalog API running on port ${PORT} (dual-stack IPv4/IPv6)`);
  });
}

export default app;
