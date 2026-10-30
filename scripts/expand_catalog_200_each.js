import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { getEraFromYear, VALID_ERA_IDS } from '../shared/eras.js';
import { computeSongSounds, VALID_SOUND_BUCKET_IDS } from '../shared/antakshari.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

const difficultyCycle = ['easy', 'medium', 'easy', 'hard', 'medium', 'expert', 'easy', 'impossible'];

// Canonical original release years for classic tracks that often have newer remaster dates on iTunes
const canonicalYearOverrides = {
  'mere sapno ki rani': 1969,
  'roop tera mastana': 1969,
  'kora kagaz tha yeh man mera': 1969,
  'yeh sham mastani': 1971,
  'yeh jo mohabbat hai': 1971,
  'zindagi ek safar hai suhana': 1971,
  'dum maro dum': 1971,
  'chura liya hai tumne jo dil ko': 1973,
  'pal pal dil ke paas': 1973,
  'bheegey hont': 2004,
  'kabhi kabhie mere dil mein': 1976,
  'yeh dosti hum nahi todenge': 1975,
  'mehbooba mehbooba': 1975,
  'khaike paan banaraswala': 1978,
  'apni to jaise taise': 1981,
  'inteha ho gayi intezaar ki': 1984,
  'ek do teen': 1988,
  'papa kehte hain': 1988,
  'dheere dheere se': 1990,
  'nazar ke samne': 1990,
  'mera dil bhi kitna pagal hai': 1991,
  'dekha hai pehli baar': 1991,
  'pehla nasha': 1992,
  'baazigar o baazigar': 1993,
  'yeh kaali kaali aankhen': 1993,
  'choli ke peeche': 1993,
  'jaadu teri nazar': 1993,
  'ek ladki ko dekha': 1994,
  'tu cheez badi hai mast mast': 1994,
  'tip tip barsa paani': 1994,
  'didi tera devar deewana': 1994,
  'pehla pehla pyar': 1994,
  'tujhe dekha to': 1995,
  'mehndi laga ke rakhna': 1995,
  'ho gaya hai tujhko to pyar sajna': 1995,
  'ruk ja o dil deewane': 1995,
  'rangeela re': 1995,
  'pardesi pardesi': 1996,
  'ghar se nikalte hi': 1996,
  'dil to pagal hai': 1997,
  'bholi si surat': 1997,
  'are re are': 1997,
  'sandese aate hai': 1997,
  'ishq bina': 1999,
  'taal se taal': 1999,
  'tadap tadap': 1999,
  'nimbooda': 1999,
  'chand chhupa badal mein': 1999,
  'chamma chamma': 1998,
  'o o jaane jaana': 1998,
  'pyar kiya to darna kya': 1998,
  'kuch kuch hota hai': 1998,
  'ladki badi anjani hai': 1998,
  'koi mil gaya': 1998,
  'chaiyya chaiyya': 1998,
  'dil se re': 1998,
  'satrangi re': 1998,
  'gur nalo ishq mitha': 1997,
  'tunak tunak tun': 1998,
  'bolo ta ra ra': 1995,
  'dardi rab rab kardi': 1996,
  'ho jayegi balle balle': 1997,
  'challa': 1986,
  'apna punjab hove': 1994,
  'dupatta tera satrang da': 1994,
  'ishq tera tadpave': 1999,
  'tera yaar bolda': 1999,
  'kaho naa pyaar hai': 2000,
  'ek pal ka jeena': 2000,
  'na tum jaano na hum': 2000,
  'suraj hua maddham': 2001,
  'bole chudiyan': 2001,
  'you are my soniya': 2001,
  'shava shava': 2001,
  'radha kaise na jale': 2001,
  'mitwa': 2001,
  'dil chahta hai': 2001,
  'koi kahe kehta rahe': 2001,
  'tanhaai': 2001,
  'woh ladki hai kahan': 2001,
  'saathiya': 2002,
  'o humdum suniyo re': 2002,
  'dola re dola': 2002,
  'maar daala': 2002,
  'bairi piya': 2002,
  'kal ho naa ho': 2003,
  'maahi ve': 2003,
  'it\'s the time to disco': 2003,
  'kuch to hua hai': 2003,
  'tere naam': 2003,
  'odhani': 2003,
  'koi mil gaya': 2003,
  'idhar chala main udhar chala': 2003,
  'main hoon na': 2004,
  'tumse milke dil ka': 2004,
  'chale jaise hawayein': 2004,
  'dhoom machale': 2004,
  'tere liye': 2004,
  'main yahaan hoon': 2004,
  'do pal': 2004,
  'aap ki kashish': 2005,
  'aashiq banaya aapne': 2005,
  'kajra re': 2005,
  'bंटी aur babli': 2005,
  'dus bahane': 2005,
  'agar tum mil jao': 2005,
  'jiya dhadak dhadak jaye': 2005,
  'aadat': 2005,
  'woh lamhe': 2005,
  'rang de basanti': 2006,
  'roobaroo': 2006,
  'masti ki paathshala': 2006,
  'tu bin bataye': 2006,
  'lukka chuppi': 2006,
  'chand sifarish': 2006,
  'mere haath mein': 2006,
  'crazy kiya re': 2006,
  'mitwa': 2006,
  'kabhi alvida naa kehna': 2006,
  'rock n roll soniye': 2006,
  'beedi': 2006,
  'namak': 2006,
  'ya ali': 2006,
  'tu hi meri shab hai': 2006,
  'bheegi si bhaagi si': 2007,
  'mauja hi mauja': 2007,
  'tum se hi': 2007,
  'ye ishq hai': 2007,
  'nagada nagada': 2007,
  'aankhon mein teri': 2007,
  'deewangi deewangi': 2007,
  'dastaan-e-om shanti om': 2007,
  'main agar kahoon': 2007,
  'in dino': 2007,
  'alvida': 2007,
  'tere bin': 2007,
  'bhool bhulaiyaa': 2007,
  'labon ko': 2007,
  'zara sa': 2008,
  'haan tu hai': 2008,
  'peheli nazar mein': 2008,
  'khuda jaane': 2008,
  'desi girl': 2008,
  'jaane tu mera kya hai': 2008,
  'kabhi kabhi aditi': 2008,
  'pappu cant dance': 2008,
  'teri ore': 2008,
  'jee karda': 2008,
  'tujh mein rab dikhta hai': 2008,
  'haule haule': 2008,
  'guzarish': 2008,
  'kaise mujhe': 2008,
  'jai ho': 2008,
  'masakali': 2009,
  'genda phool': 2009,
  'ajab prem ki ghazab kahani': 2009,
  'tera hone laga hoon': 2009,
  'tu jaane na': 2009,
  'prem ki naiyya': 2009,
  'twist': 2009,
  'chor bazaari': 2009,
  'ahun ahun': 2009,
  'iktara': 2009,
  'wake up sid': 2009,
  'give me some sunshine': 2009,
  'behti hawa sa tha woh': 2009,
  'zoobi doobi': 2009,
  'dhan te nan': 2009
};

function cleanTitle(raw) {
  if (!raw) return '';
  let s = raw
    .split('(')[0]
    .split('[')[0]
    .split(' - ')[0]
    .split(' – ')[0]
    .split(' | ')[0]
    .split(' / ')[0]
    .trim();
  s = s.replace(/["'“”‘’]/g, '').trim();
  return s;
}

const JUNK_KEYWORDS = [
  'remix',
  'lofi',
  'lo-fi',
  'unplugged',
  'instrumental',
  'karaoke',
  'mashup',
  'slowed',
  'reverb',
  'version',
  'reprised',
  'reprise',
  'dialogue',
  'ringtone',
  'dj ',
  'mix',
  'electro',
  'acoustic',
  'cover',
  'live',
  'female version',
  'male version',
  'sad version',
  'chillout',
  'medley',
  'tribute',
  'workout',
  'non stop',
  'non-stop',
  'vol.',
  'vol ',
  'jukebox',
  'audio',
  'video'
];

function isValidTrackItem(item, cleanedTitle) {
  if (!item || !item.previewUrl || !item.trackName) return false;
  if (!cleanedTitle || cleanedTitle.length < 3 || cleanedTitle.length > 42) return false;

  // Must contain Latin letters so Antakshari phonetic computation works cleanly
  if (!/^[A-Za-z0-9\s.,'&!-]+$/.test(cleanedTitle)) return false;

  const rawLower = (item.trackName + ' ' + (item.collectionName || '')).toLowerCase();
  for (const kw of JUNK_KEYWORDS) {
    if (item.trackName.toLowerCase().includes(kw)) return false;
  }

  // Must produce valid Antakshari start and end sounds
  const sounds = computeSongSounds(cleanedTitle);
  if (!VALID_SOUND_BUCKET_IDS.includes(sounds.startSound) || !VALID_SOUND_BUCKET_IDS.includes(sounds.endSound)) {
    return false;
  }

  return true;
}

const HINDI_QUERIES = [
  // Old is Gold & 90s
  'kishore kumar bollywood hits',
  'lata mangeshkar classic',
  'mohammed rafi hit songs',
  'asha bhosle bollywood',
  'mukesh hindi classics',
  'kumar sanu 90s hits',
  'udit narayan alka yagnik',
  'abhijeet bhattacharya bollywood',
  'kavita krishnamurthy hits',
  'sadhana sargam bollywood',
  'vinod rathod bollywood',
  'hariharan bollywood',
  'jagjit singh ghazal',
  'lucky ali',
  'jatin lalit hits',
  'nadeem shravan hits',
  'anu malik 90s hits',
  'a r rahman 90s hindi',
  // 2000s
  'sonu nigam bollywood',
  'shaan bollywood hits',
  'kk bollywood songs',
  'sunidhi chauhan hits',
  'shreya ghoshal bollywood',
  'himesh reshammiya hits',
  'shankar ehsaan loy',
  'vishal shekhar bollywood',
  'pritam 2000s bollywood',
  'salim sulaiman bollywood',
  'kailash kher',
  'sukhwinder singh',
  'rahat fateh ali khan bollywood',
  'atif aslam hindi',
  'mohit chauhan bollywood',
  'neeraj shridhar',
  'benny dayal hindi',
  'javed ali bollywood',
  'roop kumar rathod',
  // 2010s & 2020s
  'arijit singh',
  'amit trivedi',
  'mithoon bollywood',
  'ankit tiwari',
  'armaan malik',
  'jubin nautiyal',
  'vishal mishra',
  'sachin jigar',
  'darshan raval hindi',
  'badshah bollywood',
  'neha kakkar bollywood',
  'yo yo honey singh bollywood',
  'asees kaur',
  'shilpa rao',
  'jonita gandhi hindi',
  'नीति मोहन niti mohan',
  'palak muchhal',
  'tulsi kumar',
  'papon bollywood',
  'tochi raina',
  'rekha bhardwaj',
  'divya kumar',
  'nakash aziz',
  'amit mishra bollywood',
  'ash king',
  'sachet tandon',
  'parampara tandon',
  'steebin ben',
  'b praak hindi',
  'tanishk bagchi',
  'anuv jain',
  'prateek kuhad',
  'king hindi pop',
  'ritviz',
  'divine gully gang',
  'raftaar hindi',
  'amitabh bhattacharya',
  'irshad kamil'
];

const PUNJABI_QUERIES = [
  // Legends & 90s/2000s
  'gurdas maan',
  'amar singh chamkila',
  'kuldeep manak',
  'surjit bindrakhia',
  'daler mehndi',
  'malkit singh',
  'hans raj hans',
  'harbhajan mann',
  'babbu maan',
  'jazzy b',
  'sukshinder shinda',
  'amrinder gill',
  'lehmber hussainpuri',
  'bally sagoo',
  'panjabi mc',
  'dr zeus punjabi',
  'imran khan unforgettable',
  'bohemia punjabi rap',
  'miss pooja',
  'master saleem',
  'sardool sikander',
  'surinder shinda',
  'pammi bai',
  'sarbjit cheema',
  // 2010s & Modern Superstars
  'diljit dosanjh',
  'sidhu moose wala',
  'karan aujla',
  'ap dhillon',
  'shubh punjabi',
  'gurinder gill',
  'gippy grewal',
  'sharry mann',
  'ammy virk',
  'hardy sandhu',
  'guru randhawa',
  'jassie gill',
  'ranjit bawa',
  'tarsem jassar',
  'kulwinder billa',
  'mankirt aulakh',
  'parmish verma',
  'garry sandhu',
  'b praak punjabi',
  'jaani punjabi',
  'jass manak',
  'gurnam bhullar',
  'nimrat khaira',
  'sunanda sharma',
  'satinder sartaaj',
  'prabh gill',
  'akhil punjabi',
  'kaka punjabi',
  'arjan dhillon',
  'prem dhillon',
  'jordan sandhu',
  'r nait',
  'korala maan',
  'singga',
  'harnoor punjabi',
  'talwiinder',
  'tegi pannu',
  'sukha punjabi',
  'chani nattan',
  'inderpal moga',
  'navaan sandhu',
  'amrit maan',
  'sippy gill',
  'ninja punjabi',
  'millind gaba',
  'ikky punjabi',
  'intense punjabi',
  'wazir patar',
  'jerry punjabi',
  'gulab sidhu',
  'cheema y',
  'ustad puran shah koti',
  'kanwar grewal',
  'ustad nusrat punjabi',
  'baani sandhu',
  'gurlez akhtar',
  'shipra goyal',
  'afsanakhan punjabi',
  'jasmine sandlas',
  'nooran sisters',
  'happy raikoti',
  'roshan prince',
  'nachhatar gill',
  'feroz khan punjabi',
  'lakhwinder wadali'
];

const HARYANVI_QUERIES = [
  'masoom sharma',
  'raju punjabi',
  'gulzaar chhaniwala',
  'renuka panwar',
  'diler kharkiya',
  'sumit goswami',
  'khasa aala chahar',
  'ajay hooda',
  'gajender phogat',
  'sapna choudhary',
  'pranjal dahiya',
  'md desi rockstar',
  'kd haryanvi',
  'billa sonipat ala',
  'amanraj gill',
  'vishvajeet choudhary',
  'ruchika jangid',
  'sheenam katholic',
  'anu kadyan',
  'tr haryanvi',
  'vicky kajla',
  'raj mawar',
  'sandeep surila',
  'amit saini rohtakiya',
  'ashu twinkle',
  'nidhi sharma haryanvi',
  'surender romio',
  'gagan haryanvi',
  'kay d haryanvi',
  'rp singh haryanvi',
  'mohit sharma haryanvi',
  'kp kundu',
  'bintu pabra',
  'dhanda nyoliwala',
  'addy nagar haryanvi',
  'uttar kumar haryanvi',
  'ramkesh jiwanpurwala',
  'veer sahu',
  'dev kumar deva',
  'somvir kathurwal',
  'monika sharma haryanvi',
  'sushila takhar',
  'ankit baliyan',
  'ak jatti',
  'kaka wrld haryanvi',
  'narendra bhagana',
  'subhash fojji',
  'binder danoda',
  'rohtash gagsiniya',
  'sonika singh haryanvi',
  'pooja hooda',
  'naveen nathia',
  'sanjay kundu',
  'farista haryanvi',
  'aman jaji',
  'pradeep boora',
  'vikash kumar haryanvi',
  'rinku sharma haryanvi',
  'dc madana',
  'gd kaur',
  'vipinmehndiratta haryanvi',
  'haryanvi dj songs',
  'haryanvi folk',
  'haryanvi hits',
  'haryanvi ragni',
  'haryanvi mashup songs',
  'khatri haryanvi',
  'manजीत पांचाल manjeet panchal',
  'ns mahi',
  'kuldeep rathee',
  'mukesh jaji',
  'avinaash haryanvi',
  'parhlad phagna',
  'azad singh khanda',
  'foji karambir',
  'upender rana',
  'deepesh rahi',
  'sapna studio haryanvi',
  'mor music haryanvi',
  'nav haryanvi',
  'sonotek haryanvi',
  'speed records haryanvi',
  'white hill dhakad'
];

async function fetchNewSongsForLanguage({
  queries,
  existingCatalog,
  langName,
  langPrefix,
  addCount = 200,
  globalSeenUrls,
  globalSeenTitlesByLang
}) {
  const existingForLang = existingCatalog.filter(t => t.language.toLowerCase() === langName.toLowerCase());
  const newTracks = [];

  // Determine highest numeric ID suffix used so far for this prefix
  let maxIdNum = existingForLang.length;
  for (const t of existingForLang) {
    const m = String(t.id).match(/(\d+)$/);
    if (m) {
      maxIdNum = Math.max(maxIdNum, parseInt(m[1], 10));
    }
  }

  for (const query of queries) {
    if (newTracks.length >= addCount) break;
    try {
      const url = `https://itunes.apple.com/search?term=${encodeURIComponent(query)}&media=music&entity=song&country=IN&limit=50`;
      const res = await fetch(url);
      if (!res.ok) continue;
      const data = await res.json();

      for (const item of data.results || []) {
        if (newTracks.length >= addCount) break;
        const title = cleanTitle(item.trackName);
        if (!isValidTrackItem(item, title)) continue;

        const titleLangKey = `${title.toLowerCase()}::${langName}`;
        if (globalSeenTitlesByLang.has(titleLangKey)) continue;
        if (globalSeenUrls.has(item.previewUrl)) continue;

        globalSeenTitlesByLang.add(titleLangKey);
        globalSeenUrls.add(item.previewUrl);

        maxIdNum += 1;
        const padId = maxIdNum < 10 ? `0${maxIdNum}` : maxIdNum < 100 ? `${maxIdNum}` : `${maxIdNum}`;

        let year = item.releaseDate ? parseInt(item.releaseDate.substring(0, 4), 10) : 2021;
        if (isNaN(year) || year < 1950 || year > 2026) year = 2021;
        const canonicalYear = canonicalYearOverrides[title.toLowerCase()];
        if (canonicalYear) {
          year = canonicalYear;
        }

        const era = getEraFromYear(year);
        const diff = difficultyCycle[(existingForLang.length + newTracks.length) % difficultyCycle.length];
        const album = item.collectionName ? cleanTitle(item.collectionName) || `${title} - Single` : `${title} - Single`;
        const artist = item.artistName || query;
        const sounds = computeSongSounds(title);

        newTracks.push({
          id: `${langPrefix}_${padId}`,
          title,
          artist,
          album,
          year,
          era,
          language: langName,
          difficulty: diff,
          stages: [1, 2, 4, 7, 11, 16],
          hookStartSeconds: [8, 8.5, 9, 9.5, 10, 10.5, 11, 11.5, 12, 12.5, 13, 13.5, 14][(existingForLang.length + newTracks.length) % 13],
          previewUrl: item.previewUrl,
          reversedPreviewUrl: item.previewUrl,
          hints: [
            `Popular ${langName.charAt(0).toUpperCase() + langName.slice(1)} hit by ${artist}`,
            `Featured in "${album}" (${year})`
          ],
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
        });
      }

      await new Promise(r => setTimeout(r, 120));
    } catch (err) {
      console.warn(`Warning querying "${query}":`, err.message);
    }
  }

  return newTracks;
}

async function main() {
  console.log('=== EXPANDING CATALOG BY ~200 NEW SONGS PER LANGUAGE ===\n');

  const catalogPath = path.join(rootDir, 'scratch', 'catalog.json');
  const existingCatalog = JSON.parse(fs.readFileSync(catalogPath, 'utf8'));

  const globalSeenUrls = new Set();
  const globalSeenTitlesByLang = new Set();

  for (const t of existingCatalog) {
    if (t.previewUrl) globalSeenUrls.add(t.previewUrl);
    globalSeenTitlesByLang.add(`${t.title.toLowerCase().trim()}::${t.language.toLowerCase()}`);
  }

  const existingHindi = existingCatalog.filter(t => t.language === 'hindi');
  const existingPunjabi = existingCatalog.filter(t => t.language === 'punjabi');
  const existingHaryanvi = existingCatalog.filter(t => t.language === 'haryanvi');

  console.log(`Existing counts -> Hindi: ${existingHindi.length}, Punjabi: ${existingPunjabi.length}, Haryanvi: ${existingHaryanvi.length} (Total: ${existingCatalog.length})`);

  const newHindi = await fetchNewSongsForLanguage({
    queries: HINDI_QUERIES,
    existingCatalog,
    langName: 'hindi',
    langPrefix: 'hi',
    addCount: 205,
    globalSeenUrls,
    globalSeenTitlesByLang
  });
  console.log(`Added ${newHindi.length} new Hindi tracks!`);

  const newPunjabi = await fetchNewSongsForLanguage({
    queries: PUNJABI_QUERIES,
    existingCatalog,
    langName: 'punjabi',
    langPrefix: 'pb',
    addCount: 205,
    globalSeenUrls,
    globalSeenTitlesByLang
  });
  console.log(`Added ${newPunjabi.length} new Punjabi tracks!`);

  const newHaryanvi = await fetchNewSongsForLanguage({
    queries: HARYANVI_QUERIES,
    existingCatalog,
    langName: 'haryanvi',
    langPrefix: 'hr',
    addCount: 205,
    globalSeenUrls,
    globalSeenTitlesByLang
  });
  console.log(`Added ${newHaryanvi.length} new Haryanvi tracks!`);

  const finalCatalog = [
    ...existingHindi,
    ...newHindi,
    ...existingPunjabi,
    ...newPunjabi,
    ...existingHaryanvi,
    ...newHaryanvi
  ];

  // Ensure every single track has all required era, reversedPreviewUrl, and Antakshari fields
  const normalizedCatalog = finalCatalog.map(song => {
    const year = Number(song.year) || 2021;
    const era = VALID_ERA_IDS.includes(song.era) ? song.era : getEraFromYear(year);
    const sounds = computeSongSounds(song.title);
    return {
      ...song,
      year,
      era,
      reversedPreviewUrl: song.reversedPreviewUrl || song.previewUrl,
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
  });

  const finalHindiCount = normalizedCatalog.filter(t => t.language === 'hindi').length;
  const finalPunjabiCount = normalizedCatalog.filter(t => t.language === 'punjabi').length;
  const finalHaryanviCount = normalizedCatalog.filter(t => t.language === 'haryanvi').length;

  console.log('\n======================================================');
  console.log(`FINAL CATALOG TOTAL: ${normalizedCatalog.length} TRACKS`);
  console.log(` - Hindi:    ${finalHindiCount} (+${newHindi.length} new)`);
  console.log(` - Punjabi:  ${finalPunjabiCount} (+${newPunjabi.length} new)`);
  console.log(` - Haryanvi: ${finalHaryanviCount} (+${newHaryanvi.length} new)`);
  console.log('======================================================\n');

  // 1. Write scratch/catalog.json
  fs.writeFileSync(catalogPath, JSON.stringify(normalizedCatalog, null, 2), 'utf8');
  console.log('[SUCCESS] Updated scratch/catalog.json');

  // 2. Update frontend/src/data/tracks.js
  const frontendTracksPath = path.join(rootDir, 'frontend', 'src', 'data', 'tracks.js');
  let frontendCode = fs.readFileSync(frontendTracksPath, 'utf8');
  const frontStartMarker = 'export const TRACK_CATALOG = [';
  const frontEndMarker = 'export const ALL_OPTIONS =';
  const frontStartIndex = frontendCode.indexOf(frontStartMarker);
  const frontEndIndex = frontendCode.indexOf(frontEndMarker);

  if (frontStartIndex !== -1 && frontEndIndex !== -1) {
    const newFrontSection = 'export const TRACK_CATALOG = ' + JSON.stringify(normalizedCatalog, null, 2) + ';\n\n';
    frontendCode = frontendCode.substring(0, frontStartIndex) + newFrontSection + frontendCode.substring(frontEndIndex);
    fs.writeFileSync(frontendTracksPath, frontendCode, 'utf8');
    console.log('[SUCCESS] Updated frontend/src/data/tracks.js');
  } else {
    throw new Error('Could not find TRACK_CATALOG markers in frontend/src/data/tracks.js');
  }

  // 3. Update backend/server.js
  const serverPath = path.join(rootDir, 'backend', 'server.js');
  let serverCode = fs.readFileSync(serverPath, 'utf8');
  const startMarker = '// In-memory catalog database';
  const endMarker = '// In-memory stats';
  const startIndex = serverCode.indexOf(startMarker);
  const endIndex = serverCode.indexOf(endMarker);

  if (startIndex !== -1 && endIndex !== -1) {
    const newSection = startMarker + '\nconst trackCatalog = ' + JSON.stringify(normalizedCatalog, null, 2) + ';\n\n';
    serverCode = serverCode.substring(0, startIndex) + newSection + serverCode.substring(endIndex);
    fs.writeFileSync(serverPath, serverCode, 'utf8');
    console.log('[SUCCESS] Updated backend/server.js');
  } else {
    throw new Error('Could not find catalog markers in backend/server.js');
  }
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
