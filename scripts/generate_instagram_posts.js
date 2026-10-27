import fs from 'fs';
import path from 'path';
import { spawnSync } from 'child_process';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

const SIZE = 1080;
const socialDir = path.join(rootDir, 'frontend', 'public', 'social');
const artifactDir = 'C:\\Users\\sharm\\.gemini\\antigravity-cli\\brain\\9efd3757-8576-41a4-815a-50c46b6f48b7';

fs.mkdirSync(socialDir, { recursive: true });
fs.mkdirSync(artifactDir, { recursive: true });

function fillRectAlpha(buf, x0, y0, w, h, r, g, b, alpha) {
  const xStart = Math.max(0, Math.floor(x0));
  const yStart = Math.max(0, Math.floor(y0));
  const xEnd = Math.min(SIZE, Math.floor(x0 + w));
  const yEnd = Math.min(SIZE, Math.floor(y0 + h));
  const invA = 1 - alpha;

  for (let y = yStart; y < yEnd; y++) {
    let rowIdx = y * SIZE * 3 + xStart * 3;
    for (let x = xStart; x < xEnd; x++) {
      buf[rowIdx] = Math.min(255, Math.floor(buf[rowIdx] * invA + r * alpha));
      buf[rowIdx + 1] = Math.min(255, Math.floor(buf[rowIdx + 1] * invA + g * alpha));
      buf[rowIdx + 2] = Math.min(255, Math.floor(buf[rowIdx + 2] * invA + b * alpha));
      rowIdx += 3;
    }
  }
}

function drawBorderRect(buf, x0, y0, w, h, thickness, r, g, b, alpha) {
  fillRectAlpha(buf, x0, y0, w, thickness, r, g, b, alpha);
  fillRectAlpha(buf, x0, y0 + h - thickness, w, thickness, r, g, b, alpha);
  fillRectAlpha(buf, x0, y0, thickness, h, r, g, b, alpha);
  fillRectAlpha(buf, x0 + w - thickness, y0, thickness, h, r, g, b, alpha);
}

function fillRadialGlow(buf, cx, cy, radius, r, g, b, maxAlpha) {
  const x0 = Math.max(0, Math.floor(cx - radius));
  const y0 = Math.max(0, Math.floor(cy - radius));
  const x1 = Math.min(SIZE, Math.ceil(cx + radius));
  const y1 = Math.min(SIZE, Math.ceil(cy + radius));
  const rSq = radius * radius;

  for (let y = y0; y < y1; y++) {
    const dy = y - cy;
    for (let x = x0; x < x1; x++) {
      const dx = x - cx;
      const dSq = dx * dx + dy * dy;
      if (dSq < rSq) {
        const factor = 1 - Math.sqrt(dSq) / radius;
        const a = factor * factor * maxAlpha;
        const invA = 1 - a;
        const idx = (y * SIZE + x) * 3;
        buf[idx] = Math.min(255, Math.floor(buf[idx] * invA + r * a));
        buf[idx + 1] = Math.min(255, Math.floor(buf[idx + 1] * invA + g * a));
        buf[idx + 2] = Math.min(255, Math.floor(buf[idx + 2] * invA + b * a));
      }
    }
  }
}

function createBaseCanvas(orb1, orb2) {
  const buf = Buffer.alloc(SIZE * SIZE * 3);
  for (let y = 0; y < SIZE; y++) {
    const ny = y / SIZE;
    for (let x = 0; x < SIZE; x++) {
      const nx = x / SIZE;
      const idx = (y * SIZE + x) * 3;
      const isGrid = (x % 60 === 0 || y % 60 === 0);
      const gBoost = isGrid ? 6 : 0;
      buf[idx] = Math.min(255, Math.floor(6 + ny * 6 + gBoost));
      buf[idx + 1] = Math.min(255, Math.floor(9 + (1 - ny) * 10 + gBoost));
      buf[idx + 2] = Math.min(255, Math.floor(17 + nx * 12 + gBoost));
    }
  }

  fillRadialGlow(buf, orb1.x, orb1.y, orb1.rad, orb1.r, orb1.g, orb1.b, orb1.a);
  fillRadialGlow(buf, orb2.x, orb2.y, orb2.rad, orb2.r, orb2.g, orb2.b, orb2.a);

  // Outer subtle glass frame
  drawBorderRect(buf, 28, 28, SIZE - 56, SIZE - 56, 2, 255, 255, 255, 0.12);
  return buf;
}

function drawEqualizer(buf, baseY, seedOffset = 0) {
  const numBars = 36;
  const barW = 16;
  const gap = 8;
  const totalW = numBars * (barW + gap) - gap;
  const startX = Math.floor((SIZE - totalW) / 2);

  for (let b = 0; b < numBars; b++) {
    const w1 = Math.sin(seedOffset + b * 0.45) * 0.5 + 0.5;
    const w2 = Math.cos(seedOffset * 1.7 - b * 0.32) * 0.5 + 0.5;
    const center = 1 - Math.abs((b - numBars / 2) / (numBars / 2)) * 0.5;
    const barH = Math.max(12, Math.floor((22 + w1 * 75 + w2 * 45) * center));
    const bx = startX + b * (barW + gap);
    const by = baseY - barH;
    const ratio = b / numBars;
    const r = Math.floor(34 * (1 - ratio) + 6 * ratio);
    const g = Math.floor(224 * (1 - ratio) + 211 * ratio);
    const bl = Math.floor(107 * (1 - ratio) + 238 * ratio);

    fillRectAlpha(buf, bx, by, barW, barH, r, g, bl, 0.85);
    fillRectAlpha(buf, bx, by, barW, 3, 255, 255, 255, 0.92);
  }
}

const commonAssHeader = `[Script Info]
ScriptType: v4.00+
PlayResX: 1080
PlayResY: 1080
WrapStyle: 0
ScaledBorderAndShadow: yes

[V4+ Styles]
Format: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding
Style: BrandTop,Consolas,20,&H006BE022,&H006BE022,&H0008100A,&H00000000,-1,0,0,0,100,100,2.5,0,1,2,0,8,20,20,20,1
Style: Eyebrow,Consolas,20,&H00EED322,&H00EED322,&H00101820,&H00000000,-1,0,0,0,100,100,2,0,1,2,0,5,20,20,20,1
Style: GiantTitle,Segoe UI,68,&H00FFFFFF,&H00FFFFFF,&H000C121C,&H00000000,-1,0,0,0,100,100,0.5,0,1,3,4,5,20,20,20,1
Style: SubHero,Segoe UI,30,&H00D8E2EC,&H00D8E2EC,&H000A1018,&H00000000,0,0,0,0,100,100,0.4,0,1,2,2,5,20,20,20,1
Style: CardHeading,Segoe UI,34,&H00FFFFFF,&H00FFFFFF,&H000C121C,&H00000000,-1,0,0,0,100,100,0.5,0,1,2.5,2,5,20,20,20,1
Style: CardBody,Segoe UI,23,&H00C8D4E0,&H00C8D4E0,&H000A0E16,&H00000000,0,0,0,0,100,100,0.3,0,1,2,1,5,20,20,20,1
Style: BigStat,Segoe UI,62,&H006BE022,&H006BE022,&H000E2414,&H00000000,-1,0,0,0,100,100,1,0,1,3,3,5,20,20,20,1
Style: FooterSwipe,Consolas,20,&H00B8A394,&H00B8A394,&H00080C14,&H00000000,-1,0,0,0,100,100,2,0,1,1.5,0,2,20,20,20,1

[Events]
Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text
`;

function renderSlidePng(filename, buf, assEvents) {
  const tempAss = path.join(socialDir, `_tmp_${filename}.ass`);
  fs.writeFileSync(tempAss, commonAssHeader + assEvents, 'utf8');
  const escapedAss = tempAss.replace(/\\/g, '/').replace(/:/g, '\\:');

  const outPath = path.join(socialDir, filename);
  const res = spawnSync(
    'ffmpeg',
    [
      '-y',
      '-f', 'rawvideo',
      '-pixel_format', 'rgb24',
      '-video_size', `${SIZE}x${SIZE}`,
      '-i', 'pipe:0',
      '-vf', `subtitles='${escapedAss}'`,
      '-frames:v', '1',
      outPath
    ],
    { input: buf }
  );

  if (fs.existsSync(tempAss)) fs.unlinkSync(tempAss);
  if (res.status !== 0) {
    throw new Error(`FFmpeg failed for ${filename}: ${res.stderr?.toString()}`);
  }

  // Copy to artifact directory for direct embedding
  fs.copyFileSync(outPath, path.join(artifactDir, filename));
  console.log(`✅ Generated ${filename}`);
}

// ============================================================================
// SLIDE 1: HERO COVER SLIDE (ig-01-hero-cover.png)
// ============================================================================
{
  const buf = createBaseCanvas(
    { x: 220, y: 220, rad: 480, r: 34, g: 224, b: 107, a: 0.28 },
    { x: 860, y: 780, rad: 460, r: 6, g: 182, b: 212, a: 0.25 }
  );

  // Central Hero Glass Card
  fillRectAlpha(buf, 85, 150, 910, 620, 14, 20, 32, 0.78);
  drawBorderRect(buf, 85, 150, 910, 620, 3, 34, 224, 107, 0.75);

  // 6 Stage Escalation Pills inside Hero Card
  const stageLabelsX = [145, 285, 425, 565, 705, 845];
  stageLabelsX.forEach((sx, i) => {
    const isFirst = i === 0;
    fillRectAlpha(buf, sx, 535, 110, 56, isFirst ? 34 : 255, isFirst ? 224 : 255, isFirst ? 107 : 255, isFirst ? 0.9 : 0.08);
    drawBorderRect(buf, sx, 535, 110, 56, 2, 34, 224, 107, isFirst ? 1.0 : 0.45);
  });

  // Feature Pill Strip at y = 650
  fillRectAlpha(buf, 145, 640, 790, 72, 6, 182, 212, 0.14);
  drawBorderRect(buf, 145, 640, 790, 72, 2, 34, 211, 238, 0.55);

  drawEqualizer(buf, 955, 1.2);

  const events = `
Dialogue: 2,0:00:00.00,0:00:05.00,BrandTop,,0,0,0,,{\\an8\\pos(540,68)}● SURFTEST · INDIA'S LIQUID-GLASS MUSIC GAME
Dialogue: 2,0:00:00.00,0:00:05.00,Eyebrow,,0,0,0,,{\\an5\\pos(540,220)\\c&H006BE022&}847 ICONIC SONGS  ·  HINDI  ·  PUNJABI  ·  HARYANVI
Dialogue: 2,0:00:00.00,0:00:05.00,GiantTitle,,0,0,0,,{\\an5\\pos(540,315)}Guess the song
Dialogue: 2,0:00:00.00,0:00:05.00,GiantTitle,,0,0,0,,{\\an5\\pos(540,395)\\c&H006BE022&}before the beat drops.
Dialogue: 2,0:00:00.00,0:00:05.00,SubHero,,0,0,0,,{\\an5\\pos(540,475)}6 escalating audio stages. Can you name the track in 1 second?

Dialogue: 3,0:00:00.00,0:00:05.00,CardHeading,,0,0,0,,{\\an5\\pos(200,563)\\fs24\\bord0\\shad0\\c&H0004140A&}1.0s ▶
Dialogue: 3,0:00:00.00,0:00:05.00,CardHeading,,0,0,0,,{\\an5\\pos(340,563)\\fs24\\c&H006BE022&}2.0s
Dialogue: 3,0:00:00.00,0:00:05.00,CardHeading,,0,0,0,,{\\an5\\pos(480,563)\\fs24\\c&H00EED322&}4.0s
Dialogue: 3,0:00:00.00,0:00:05.00,CardHeading,,0,0,0,,{\\an5\\pos(620,563)\\fs24\\c&H00FCFAF8&}7.0s
Dialogue: 3,0:00:00.00,0:00:05.00,CardHeading,,0,0,0,,{\\an5\\pos(760,563)\\fs24\\c&H00FCFAF8&}11.0s
Dialogue: 3,0:00:00.00,0:00:05.00,CardHeading,,0,0,0,,{\\an5\\pos(900,563)\\fs24\\c&H0024BFFB&}16.0s

Dialogue: 3,0:00:00.00,0:00:05.00,CardHeading,,0,0,0,,{\\an5\\pos(540,676)\\fs25\\c&H00EED322&}▶ Normal   ·   ↺ Reverse   ·   🔗 Antakshari   ·   ⚡ 60s Blitz
Dialogue: 2,0:00:00.00,0:00:05.00,FooterSwipe,,0,0,0,,{\\an2\\pos(540,1025)\\c&H006BE022&}SWIPE TO SEE HOW TO PLAY  ➔  (1/5)
`;

  renderSlidePng('ig-01-hero-cover.png', buf, events);
}

// ============================================================================
// SLIDE 2: HOW TO PLAY GAMEPLAY UI MOCKUP (ig-02-how-to-play.png)
// ============================================================================
{
  const buf = createBaseCanvas(
    { x: 820, y: 200, rad: 460, r: 34, g: 224, b: 107, a: 0.25 },
    { x: 240, y: 820, rad: 460, r: 245, g: 158, b: 11, a: 0.22 }
  );

  // Gameplay Modal Window Card
  fillRectAlpha(buf, 80, 210, 920, 720, 12, 17, 27, 0.9);
  drawBorderRect(buf, 80, 210, 920, 720, 3, 34, 224, 107, 0.65);

  // Row 1: Skipped
  fillRectAlpha(buf, 120, 260, 840, 62, 255, 255, 255, 0.06);
  drawBorderRect(buf, 120, 260, 840, 62, 1, 255, 255, 255, 0.2);

  // Row 2: Correct Hit (Green)
  fillRectAlpha(buf, 120, 340, 840, 68, 34, 224, 107, 0.22);
  drawBorderRect(buf, 120, 340, 840, 68, 3, 34, 224, 107, 0.95);

  // Row 3 & 4: Locked
  fillRectAlpha(buf, 120, 426, 840, 56, 255, 255, 255, 0.03);
  drawBorderRect(buf, 120, 426, 840, 56, 1, 255, 255, 255, 0.08);

  // Audio Progress Bar
  fillRectAlpha(buf, 120, 520, 840, 24, 255, 255, 255, 0.08);
  fillRectAlpha(buf, 120, 520, 240, 24, 34, 224, 107, 0.92);

  // Search Box + Submit Button
  fillRectAlpha(buf, 120, 600, 640, 68, 8, 12, 20, 0.95);
  drawBorderRect(buf, 120, 600, 640, 68, 2, 34, 211, 238, 0.8);
  fillRectAlpha(buf, 780, 600, 180, 68, 34, 224, 107, 0.95);

  // Victory Banner inside Modal
  fillRectAlpha(buf, 120, 705, 840, 185, 16, 38, 26, 0.92);
  drawBorderRect(buf, 120, 705, 840, 185, 2, 34, 224, 107, 0.85);

  const events = `
Dialogue: 2,0:00:00.00,0:00:05.00,BrandTop,,0,0,0,,{\\an8\\pos(540,58)}● HOW TO PLAY SURFTEST
Dialogue: 2,0:00:00.00,0:00:05.00,GiantTitle,,0,0,0,,{\\an5\\pos(540,130)\\fs52}Listen. Skip to Unlock. Guess!
Dialogue: 2,0:00:00.00,0:00:05.00,SubHero,,0,0,0,,{\\an5\\pos(540,180)\\fs24\\c&H006BE022&}Every skip unlocks more seconds of the intro (1s → 2s → 4s → 7s → 11s → 16s)

Dialogue: 3,0:00:00.00,0:00:05.00,CardBody,,0,0,0,,{\\an4\\pos(150,291)\\c&H00B8A394&}01   [ SKIPPED ]  —  Unlocked +1.0s more context
Dialogue: 3,0:00:00.00,0:00:05.00,CardHeading,,0,0,0,,{\\an4\\pos(150,374)\\fs28\\c&H006BE022&}02   ✓  Kesariya - Arijit Singh, Pritam   (2.0s HIT!)
Dialogue: 3,0:00:00.00,0:00:05.00,CardBody,,0,0,0,,{\\an4\\pos(150,454)\\c&H00B8A394&}03   Stage 3 (4.0s) · Unused

Dialogue: 3,0:00:00.00,0:00:05.00,Eyebrow,,0,0,0,,{\\an4\\pos(120,568)\\fs17\\c&H006BE022&}▶ PLAYING 2.0s CLIP              1s     2s     4s     7s     11s     16s

Dialogue: 3,0:00:00.00,0:00:05.00,CardHeading,,0,0,0,,{\\an4\\pos(148,634)\\fs25\\c&H00FFFFFF&}🔍 Kesariya - Arijit Singh, Pritam
Dialogue: 3,0:00:00.00,0:00:05.00,CardHeading,,0,0,0,,{\\an5\\pos(870,634)\\fs26\\bord0\\shad0\\c&H0004140A&}Submit ✓

Dialogue: 3,0:00:00.00,0:00:05.00,CardHeading,,0,0,0,,{\\an5\\pos(540,752)\\fs34\\c&H006BE022&}🏆 NAILED IT IN 2 SECONDS!
Dialogue: 3,0:00:00.00,0:00:05.00,CardBody,,0,0,0,,{\\an5\\pos(540,805)\\fs24\\c&H00FFFFFF&}Kesariya · Brahmāstra (2022) · Hindi · New Hits
Dialogue: 3,0:00:00.00,0:00:05.00,CardHeading,,0,0,0,,{\\an5\\pos(540,855)\\fs24\\c&H0024BFFB&}Stage 2 Hit (2.0s)     ·     🔥 Win Streak: +1     ·     ⚡ 100% Win Rate
Dialogue: 2,0:00:00.00,0:00:05.00,FooterSwipe,,0,0,0,,{\\an2\\pos(540,1025)\\c&H006BE022&}SWIPE FOR 847 SONGS & ERAS  ➔  (2/5)
`;

  renderSlidePng('ig-02-how-to-play.png', buf, events);
}

// ============================================================================
// SLIDE 3: 847 SONGS ACROSS 3 LANGUAGES & 4 ERAS (ig-03-847-songs-eras.png)
// ============================================================================
{
  const buf = createBaseCanvas(
    { x: 250, y: 300, rad: 480, r: 6, g: 182, b: 212, a: 0.25 },
    { x: 820, y: 780, rad: 480, r: 34, g: 224, b: 107, a: 0.25 }
  );

  // 3 Language Cards (Horizontal Stack)
  fillRectAlpha(buf, 85, 235, 910, 145, 34, 224, 107, 0.15);
  drawBorderRect(buf, 85, 235, 910, 145, 3, 34, 224, 107, 0.85);

  fillRectAlpha(buf, 85, 405, 910, 145, 6, 182, 212, 0.15);
  drawBorderRect(buf, 85, 405, 910, 145, 3, 34, 211, 238, 0.85);

  fillRectAlpha(buf, 85, 575, 910, 145, 245, 158, 11, 0.15);
  drawBorderRect(buf, 85, 575, 910, 145, 3, 245, 158, 11, 0.85);

  // 4 Era Pills Row at Bottom (y = 770)
  const eraColors = [
    [245, 158, 11],
    [129, 140, 248],
    [236, 72, 153],
    [34, 224, 107]
  ];
  [85, 318, 551, 784].forEach((ex, i) => {
    const [r, g, b] = eraColors[i];
    fillRectAlpha(buf, ex, 770, 211, 150, r, g, b, 0.16);
    drawBorderRect(buf, ex, 770, 211, 150, 2, r, g, b, 0.85);
  });

  const events = `
Dialogue: 2,0:00:00.00,0:00:05.00,BrandTop,,0,0,0,,{\\an8\\pos(540,58)}● CURATED DESI MUSIC CATALOG
Dialogue: 2,0:00:00.00,0:00:05.00,GiantTitle,,0,0,0,,{\\an5\\pos(540,132)\\fs58}847 Iconic Indian Songs
Dialogue: 2,0:00:00.00,0:00:05.00,SubHero,,0,0,0,,{\\an5\\pos(540,188)\\fs25\\c&H00EED322&}Filter by your favorite Language, Decade & Escalation Difficulty

Dialogue: 3,0:00:00.00,0:00:05.00,BigStat,,0,0,0,,{\\an4\\pos(125,307)\\c&H006BE022&}285
Dialogue: 3,0:00:00.00,0:00:05.00,CardHeading,,0,0,0,,{\\an4\\pos(285,288)\\fs35}HINDI COLLECTION  ·  BOLLYWOOD
Dialogue: 3,0:00:00.00,0:00:05.00,CardBody,,0,0,0,,{\\an4\\pos(285,334)}Bollywood Classics, Romantic Ballads, 90s & Party Anthems

Dialogue: 3,0:00:00.00,0:00:05.00,BigStat,,0,0,0,,{\\an4\\pos(125,477)\\c&H00EED322&}283
Dialogue: 3,0:00:00.00,0:00:05.00,CardHeading,,0,0,0,,{\\an4\\pos(285,458)\\fs35}PUNJABI COLLECTION  ·  BHANGRA & POP
Dialogue: 3,0:00:00.00,0:00:05.00,CardBody,,0,0,0,,{\\an4\\pos(285,504)}Bhangra Legends, Desi Hip-Hop, Diljit, Moose Wala, Aujla & AP

Dialogue: 3,0:00:00.00,0:00:05.00,BigStat,,0,0,0,,{\\an4\\pos(125,647)\\c&H0024BFFB&}279
Dialogue: 3,0:00:00.00,0:00:05.00,CardHeading,,0,0,0,,{\\an4\\pos(285,628)\\fs35}HARYANVI COLLECTION  ·  DESI FOLK
Dialogue: 3,0:00:00.00,0:00:05.00,CardBody,,0,0,0,,{\\an4\\pos(285,674)}Viral Folk Beats, Desi DJ Bangers & Regional Superhits

Dialogue: 3,0:00:00.00,0:00:05.00,CardHeading,,0,0,0,,{\\an5\\pos(190,820)\\fs25\\c&H0024BFFB&}Old is Gold
Dialogue: 3,0:00:00.00,0:00:05.00,CardBody,,0,0,0,,{\\an5\\pos(190,865)\\fs20}Pre-2000 (273)

Dialogue: 3,0:00:00.00,0:00:05.00,CardHeading,,0,0,0,,{\\an5\\pos(423,820)\\fs25\\c&H00F88C81&}2000s Era
Dialogue: 3,0:00:00.00,0:00:05.00,CardBody,,0,0,0,,{\\an5\\pos(423,865)\\fs20}2000–2009 (126)

Dialogue: 3,0:00:00.00,0:00:05.00,CardHeading,,0,0,0,,{\\an5\\pos(656,820)\\fs25\\c&H009948EC&}2010s Era
Dialogue: 3,0:00:00.00,0:00:05.00,CardBody,,0,0,0,,{\\an5\\pos(656,865)\\fs20}2010–2019 (149)

Dialogue: 3,0:00:00.00,0:00:05.00,CardHeading,,0,0,0,,{\\an5\\pos(889,820)\\fs25\\c&H006BE022&}New Hits
Dialogue: 3,0:00:00.00,0:00:05.00,CardBody,,0,0,0,,{\\an5\\pos(889,865)\\fs20}2020–Now (299)

Dialogue: 2,0:00:00.00,0:00:05.00,FooterSwipe,,0,0,0,,{\\an2\\pos(540,1025)\\c&H006BE022&}SWIPE FOR 4 GAME MODES  ➔  (3/5)
`;

  renderSlidePng('ig-03-847-songs-eras.png', buf, events);
}

// ============================================================================
// SLIDE 4: 4 ELECTRIFYING GAME MODES (ig-04-four-game-modes.png)
// ============================================================================
{
  const buf = createBaseCanvas(
    { x: 240, y: 240, rad: 460, r: 168, g: 85, b: 247, a: 0.26 },
    { x: 840, y: 820, rad: 480, r: 6, g: 182, b: 212, a: 0.28 }
  );

  // 2x2 Grid of Mode Cards
  // 1. Normal (Top-Left)
  fillRectAlpha(buf, 85, 240, 435, 320, 34, 224, 107, 0.15);
  drawBorderRect(buf, 85, 240, 435, 320, 3, 34, 224, 107, 0.9);

  // 2. Reverse (Top-Right)
  fillRectAlpha(buf, 560, 240, 435, 320, 168, 85, 247, 0.16);
  drawBorderRect(buf, 560, 240, 435, 320, 3, 168, 85, 247, 0.9);

  // 3. Antakshari (Bottom-Left)
  fillRectAlpha(buf, 85, 595, 435, 320, 245, 158, 11, 0.16);
  drawBorderRect(buf, 85, 595, 435, 320, 3, 245, 158, 11, 0.9);

  // 4. 60s Blitz (Bottom-Right)
  fillRectAlpha(buf, 560, 595, 435, 320, 6, 182, 212, 0.18);
  drawBorderRect(buf, 560, 595, 435, 320, 3, 34, 211, 238, 0.95);

  const events = `
Dialogue: 2,0:00:00.00,0:00:05.00,BrandTop,,0,0,0,,{\\an8\\pos(540,58)}● 4 UNIQUE WAYS TO PLAY
Dialogue: 2,0:00:00.00,0:00:05.00,GiantTitle,,0,0,0,,{\\an5\\pos(540,132)\\fs56}Choose Your Play Mode
Dialogue: 2,0:00:00.00,0:00:05.00,SubHero,,0,0,0,,{\\an5\\pos(540,188)\\fs24\\c&H00D8E2EC&}From classic 1-second intros to 60-second speedruns & Antakshari chains

; Card 1: Normal
Dialogue: 3,0:00:00.00,0:00:05.00,Eyebrow,,0,0,0,,{\\an5\\pos(302,290)\\c&H006BE022&}FORWARD ▶  ·  CLASSIC
Dialogue: 3,0:00:00.00,0:00:05.00,CardHeading,,0,0,0,,{\\an5\\pos(302,350)\\fs38}Normal Mode
Dialogue: 3,0:00:00.00,0:00:05.00,CardBody,,0,0,0,,{\\an5\\pos(302,415)}Hear a 1s forward intro clip.
Dialogue: 3,0:00:00.00,0:00:05.00,CardBody,,0,0,0,,{\\an5\\pos(302,450)}Skip to unlock up to 16 seconds
Dialogue: 3,0:00:00.00,0:00:05.00,CardBody,,0,0,0,,{\\an5\\pos(302,485)\\c&H006BE022&}or jump straight to the Hook!

; Card 2: Reverse
Dialogue: 3,0:00:00.00,0:00:05.00,Eyebrow,,0,0,0,,{\\an5\\pos(777,290)\\c&H00FC84C0&}REVERSED ↺  ·  BRAIN TEASER
Dialogue: 3,0:00:00.00,0:00:05.00,CardHeading,,0,0,0,,{\\an5\\pos(777,350)\\fs38}Reverse Mode
Dialogue: 3,0:00:00.00,0:00:05.00,CardBody,,0,0,0,,{\\an5\\pos(777,415)}Audio plays completely backwards!
Dialogue: 3,0:00:00.00,0:00:05.00,CardBody,,0,0,0,,{\\an5\\pos(777,450)}Test your ear on inverted beats
Dialogue: 3,0:00:00.00,0:00:05.00,CardBody,,0,0,0,,{\\an5\\pos(777,485)\\c&H00FC84C0&}& upside-down melodies.

; Card 3: Antakshari
Dialogue: 3,0:00:00.00,0:00:05.00,Eyebrow,,0,0,0,,{\\an5\\pos(302,645)\\c&H0024BFFB&}CHAIN 🔗  ·  SOLO & MULTIPLAYER
Dialogue: 3,0:00:00.00,0:00:05.00,CardHeading,,0,0,0,,{\\an5\\pos(302,705)\\fs38}Antakshari Mode
Dialogue: 3,0:00:00.00,0:00:05.00,CardBody,,0,0,0,,{\\an5\\pos(302,770)}Connect songs by their ending
Dialogue: 3,0:00:00.00,0:00:05.00,CardBody,,0,0,0,,{\\an5\\pos(302,805)}phonetic sound (...Ho ➔ H)!
Dialogue: 3,0:00:00.00,0:00:05.00,CardBody,,0,0,0,,{\\an5\\pos(302,840)\\c&H0024BFFB&}Includes Live Team Room Codes!

; Card 4: 60s Blitz
Dialogue: 3,0:00:00.00,0:00:05.00,Eyebrow,,0,0,0,,{\\an5\\pos(777,645)\\c&H00EED322&}60s BLITZ ⚡  ·  NEW SPEEDRUN
Dialogue: 3,0:00:00.00,0:00:05.00,CardHeading,,0,0,0,,{\\an5\\pos(777,705)\\fs38}60s Blitz Mode
Dialogue: 3,0:00:00.00,0:00:05.00,CardBody,,0,0,0,,{\\an5\\pos(777,770)}Hooks play back-to-back against
Dialogue: 3,0:00:00.00,0:00:05.00,CardBody,,0,0,0,,{\\an5\\pos(777,805)}a 60-second countdown timer.
Dialogue: 3,0:00:00.00,0:00:05.00,CardBody,,0,0,0,,{\\an5\\pos(777,840)\\c&H00EED322&}+3s Bonus Time for Every Hit!

Dialogue: 2,0:00:00.00,0:00:05.00,FooterSwipe,,0,0,0,,{\\an2\\pos(540,1025)\\c&H006BE022&}SWIPE FOR LIVE MULTIPLAYER & LINK  ➔  (4/5)
`;

  renderSlidePng('ig-04-four-game-modes.png', buf, events);
}

// ============================================================================
// SLIDE 5: MULTIPLAYER ANTAKSHARI & PLAY NOW CTA (ig-05-play-now-cta.png)
// ============================================================================
{
  const buf = createBaseCanvas(
    { x: 540, y: 280, rad: 520, r: 34, g: 224, b: 107, a: 0.28 },
    { x: 540, y: 780, rad: 480, r: 245, g: 158, b: 11, a: 0.24 }
  );

  // Multiplayer Room Showcase Card
  fillRectAlpha(buf, 85, 225, 910, 360, 18, 22, 34, 0.88);
  drawBorderRect(buf, 85, 225, 910, 360, 3, 245, 158, 11, 0.85);

  // Team A vs Team B boxes inside multiplayer card
  fillRectAlpha(buf, 125, 325, 380, 145, 34, 224, 107, 0.16);
  drawBorderRect(buf, 125, 325, 380, 145, 2, 34, 224, 107, 0.8);

  fillRectAlpha(buf, 575, 325, 380, 145, 6, 182, 212, 0.16);
  drawBorderRect(buf, 575, 325, 380, 145, 2, 34, 211, 238, 0.8);

  // Big CTA Card at bottom
  fillRectAlpha(buf, 85, 625, 910, 235, 12, 32, 22, 0.9);
  drawBorderRect(buf, 85, 625, 910, 235, 3, 34, 224, 107, 0.95);

  // Green CTA Button inside CTA Card
  fillRectAlpha(buf, 270, 760, 540, 72, 34, 224, 107, 0.95);

  drawEqualizer(buf, 965, 2.5);

  const events = `
Dialogue: 2,0:00:00.00,0:00:05.00,BrandTop,,0,0,0,,{\\an8\\pos(540,58)}● CHALLENGE YOUR FRIENDS LIVE
Dialogue: 2,0:00:00.00,0:00:05.00,GiantTitle,,0,0,0,,{\\an5\\pos(540,132)\\fs52}Multiplayer Antakshari Rooms
Dialogue: 2,0:00:00.00,0:00:05.00,SubHero,,0,0,0,,{\\an5\\pos(540,185)\\fs24\\c&H0024BFFB&}Create a 5-letter room code, share with friends & battle on a 30s turn timer!

Dialogue: 3,0:00:00.00,0:00:05.00,Eyebrow,,0,0,0,,{\\an5\\pos(540,275)\\fs22\\c&H0024BFFB&}LIVE ROOM CODE:  TAAL42   ·   ⏱ 30s TURN TIMER   ·   TARGET: 5 PTS
Dialogue: 3,0:00:00.00,0:00:05.00,CardHeading,,0,0,0,,{\\an5\\pos(315,372)\\fs30\\c&H006BE022&}TEAM A  (4 PTS)
Dialogue: 3,0:00:00.00,0:00:05.00,CardBody,,0,0,0,,{\\an5\\pos(315,425)\\fs21}Sang: "Tum Hi Ho"  ➔  Ends in [ H (ह) ]

Dialogue: 3,0:00:00.00,0:00:05.00,CardHeading,,0,0,0,,{\\an5\\pos(765,372)\\fs30\\c&H00EED322&}TEAM B  (3 PTS)
Dialogue: 3,0:00:00.00,0:00:05.00,CardBody,,0,0,0,,{\\an5\\pos(765,425)\\fs21}Next Turn: Must sing from [ H (ह) ]!

Dialogue: 3,0:00:00.00,0:00:05.00,CardBody,,0,0,0,,{\\an5\\pos(540,525)\\fs22\\c&H00FCFAF8&}🔗  ...Ho [H]  ➔  "Hawayein" [N]  ➔  "Nadaan Parindey" [Y]

Dialogue: 3,0:00:00.00,0:00:05.00,GiantTitle,,0,0,0,,{\\an5\\pos(540,680)\\fs48}Ready to Test Your Music IQ?
Dialogue: 3,0:00:00.00,0:00:05.00,SubHero,,0,0,0,,{\\an5\\pos(540,728)\\fs22\\c&H00EED322&}847 Songs  ·  4 Game Modes  ·  100% Free in Your Browser
Dialogue: 3,0:00:00.00,0:00:05.00,CardHeading,,0,0,0,,{\\an5\\pos(540,796)\\fs28\\bord0\\shad0\\c&H0004140A&}PLAY SURFTEST NOW  —  LINK IN BIO →

Dialogue: 2,0:00:00.00,0:00:05.00,FooterSwipe,,0,0,0,,{\\an2\\pos(540,1025)\\c&H006BE022&}TAG YOUR GANG & CHALLENGE THEM!  🔥  (5/5)
`;

  renderSlidePng('ig-05-play-now-cta.png', buf, events);
}

console.log('\n🎉 All 5 Instagram 1080x1080 Carousel Slides generated successfully!');
