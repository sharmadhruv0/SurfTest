import fs from 'fs';
import path from 'path';
import { spawnSync } from 'child_process';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

const SIZE = 1080;
const CX = SIZE / 2;
const CY = SIZE / 2;

const socialDir = path.join(rootDir, 'frontend', 'public', 'social');
const mediaKitDir = path.join(rootDir, 'Instagram_Media_Kit');
const artifactDir = 'C:\\Users\\sharm\\.gemini\\antigravity-cli\\brain\\9efd3757-8576-41a4-815a-50c46b6f48b7';

fs.mkdirSync(socialDir, { recursive: true });
fs.mkdirSync(mediaKitDir, { recursive: true });
fs.mkdirSync(artifactDir, { recursive: true });

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

// Draw anti-aliased glowing circle ring (for Instagram circular crop safety)
function drawCircleRing(buf, cx, cy, radius, thickness, r1, g1, b1, r2, g2, b2, alpha = 0.95) {
  const outer = radius + thickness / 2 + 2;
  const inner = Math.max(0, radius - thickness / 2 - 2);
  const x0 = Math.max(0, Math.floor(cx - outer));
  const y0 = Math.max(0, Math.floor(cy - outer));
  const x1 = Math.min(SIZE, Math.ceil(cx + outer));
  const y1 = Math.min(SIZE, Math.ceil(cy + outer));

  for (let y = y0; y < y1; y++) {
    const dy = y - cy;
    for (let x = x0; x < x1; x++) {
      const dx = x - cx;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist >= inner && dist <= outer) {
        const distFromRing = Math.abs(dist - radius);
        const halfT = thickness / 2;
        if (distFromRing <= halfT + 1.5) {
          const edgeSmooth = distFromRing <= halfT ? 1.0 : Math.max(0, 1 - (distFromRing - halfT) / 1.5);
          const a = edgeSmooth * alpha;
          const invA = 1 - a;
          const tGrad = (x - (cx - radius)) / (radius * 2);
          const r = Math.floor(r1 * (1 - tGrad) + r2 * tGrad);
          const g = Math.floor(g1 * (1 - tGrad) + g2 * tGrad);
          const b = Math.floor(b1 * (1 - tGrad) + b2 * tGrad);
          const idx = (y * SIZE + x) * 3;
          buf[idx] = Math.min(255, Math.floor(buf[idx] * invA + r * a));
          buf[idx + 1] = Math.min(255, Math.floor(buf[idx + 1] * invA + g * a));
          buf[idx + 2] = Math.min(255, Math.floor(buf[idx + 2] * invA + b * a));
        }
      }
    }
  }
}

// Draw rounded rectangle with vertical/diagonal gradient + top gloss highlight
function drawRoundedBadge(buf, cx, cy, w, h, cornerRadius, rTop, gTop, bTop, rBot, gBot, bBot, alpha = 1.0, topGloss = true) {
  const x0 = Math.floor(cx - w / 2);
  const y0 = Math.floor(cy - h / 2);
  const x1 = Math.floor(cx + w / 2);
  const y1 = Math.floor(cy + h / 2);

  for (let y = y0; y < y1; y++) {
    for (let x = x0; x < x1; x++) {
      if (x < 0 || x >= SIZE || y < 0 || y >= SIZE) continue;
      // Check rounded corner distance
      let dx = 0;
      let dy = 0;
      if (x < x0 + cornerRadius) dx = (x0 + cornerRadius) - x;
      else if (x > x1 - cornerRadius) dx = x - (x1 - cornerRadius);
      if (y < y0 + cornerRadius) dy = (y0 + cornerRadius) - y;
      else if (y > y1 - cornerRadius) dy = y - (y1 - cornerRadius);

      const d = Math.sqrt(dx * dx + dy * dy);
      if (d <= cornerRadius + 1.2) {
        const smooth = d <= cornerRadius ? 1.0 : Math.max(0, 1 - (d - cornerRadius) / 1.2);
        const a = smooth * alpha;
        const invA = 1 - a;
        const vRatio = (y - y0) / h;
        let r = Math.floor(rTop * (1 - vRatio) + rBot * vRatio);
        let g = Math.floor(gTop * (1 - vRatio) + gBot * vRatio);
        let b = Math.floor(bTop * (1 - vRatio) + bBot * vRatio);

        // Specular top-half gloss refraction (just like TopBar.jsx!)
        if (topGloss && vRatio < 0.48) {
          const glossFactor = (1 - vRatio / 0.48) * 0.35;
          r = Math.min(255, Math.floor(r + (255 - r) * glossFactor));
          g = Math.min(255, Math.floor(g + (255 - g) * glossFactor));
          b = Math.min(255, Math.floor(b + (255 - b) * glossFactor));
        }

        const idx = (y * SIZE + x) * 3;
        buf[idx] = Math.min(255, Math.floor(buf[idx] * invA + r * a));
        buf[idx + 1] = Math.min(255, Math.floor(buf[idx + 1] * invA + g * a));
        buf[idx + 2] = Math.min(255, Math.floor(buf[idx + 2] * invA + b * a));
      }
    }
  }
}

function drawEqualizerSymmetrical(buf, centerY, numBars, barW, gap, maxH, r1, g1, b1, r2, g2, b2) {
  const totalW = numBars * (barW + gap) - gap;
  const startX = Math.floor(CX - totalW / 2);
  const heights = [0.28, 0.45, 0.68, 0.88, 0.62, 1.0, 0.72, 0.92, 0.58, 0.78, 0.42, 0.28];

  for (let i = 0; i < numBars; i++) {
    const hRatio = heights[i % heights.length];
    const bh = Math.floor(maxH * hRatio);
    const bx = startX + i * (barW + gap);
    const ratio = i / Math.max(1, numBars - 1);
    const r = Math.floor(r1 * (1 - ratio) + r2 * ratio);
    const g = Math.floor(g1 * (1 - ratio) + g2 * ratio);
    const b = Math.floor(b1 * (1 - ratio) + b2 * ratio);

    drawRoundedBadge(buf, bx + barW / 2, centerY, barW, bh, Math.floor(barW / 2), r, g, b, r, g, b, 0.95, true);
  }
}

function createObsidianCanvas() {
  const buf = Buffer.alloc(SIZE * SIZE * 3);
  for (let y = 0; y < SIZE; y++) {
    const ny = y / SIZE;
    for (let x = 0; x < SIZE; x++) {
      const nx = x / SIZE;
      const idx = (y * SIZE + x) * 3;
      const isGrid = (x % 54 === 0 || y % 54 === 0);
      const gBoost = isGrid ? 5 : 0;
      buf[idx] = Math.min(255, Math.floor(5 + ny * 6 + gBoost));
      buf[idx + 1] = Math.min(255, Math.floor(8 + (1 - ny) * 10 + gBoost));
      buf[idx + 2] = Math.min(255, Math.floor(15 + nx * 12 + gBoost));
    }
  }
  return buf;
}

const assHeader = `[Script Info]
ScriptType: v4.00+
PlayResX: 1080
PlayResY: 1080
WrapStyle: 0
ScaledBorderAndShadow: yes

[V4+ Styles]
Format: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding
Style: BadgeST,Segoe UI,230,&H000A1604,&H000A1604,&H00000000,&H00000000,-1,0,0,0,100,100,-4,0,1,0,0,5,20,20,20,1
Style: NeonST,Segoe UI,250,&H00FFFFFF,&H00FFFFFF,&H006BE022,&H80000000,-1,0,0,0,100,100,-4,0,1,4,8,5,20,20,20,1
Style: BrandWord,Segoe UI,82,&H00FFFFFF,&H00FFFFFF,&H000C141E,&H80000000,-1,0,0,0,100,100,2,0,1,3,4,5,20,20,20,1
Style: SubTag,Consolas,26,&H006BE022,&H006BE022,&H0008120C,&H00000000,-1,0,0,0,100,100,4,0,1,2,0,5,20,20,20,1

[Events]
Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text
`;

function renderLogoPng(filename, buf, events) {
  const tempAss = path.join(socialDir, `_tmp_${filename}.ass`);
  fs.writeFileSync(tempAss, assHeader + events, 'utf8');
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

  fs.copyFileSync(outPath, path.join(mediaKitDir, filename));
  fs.copyFileSync(outPath, path.join(artifactDir, filename));
  console.log(`✅ Generated Logo: ${filename}`);
}

// ============================================================================
// LOGO 1: OFFICIAL SIGNATURE EMERALD APP ICON (ig-logo-01-emerald-badge.png)
// Matches the exact TopBar.jsx "ST" Liquid Emerald tile + circular neon ring
// ============================================================================
{
  const buf = createObsidianCanvas();
  fillRadialGlow(buf, CX, CY - 40, 480, 34, 224, 107, 0.38);
  fillRadialGlow(buf, CX, CY + 120, 420, 6, 182, 212, 0.25);

  // Outer circle-safe neon ring (radius 485 fits inside 1080x1080 Instagram circle crop!)
  drawCircleRing(buf, CX, CY, 485, 14, 34, 224, 107, 34, 211, 238, 0.95);
  drawCircleRing(buf, CX, CY, 455, 3, 255, 255, 255, 34, 224, 107, 0.3);

  // Outer glow behind the Emerald Rounded Square
  drawRoundedBadge(buf, CX, 390, 410, 410, 95, 59, 244, 135, 18, 163, 72, 0.28, false);
  // Signature Emerald Rounded Square Badge (TopBar style)
  drawRoundedBadge(buf, CX, 390, 380, 380, 86, 59, 244, 135, 18, 163, 72, 1.0, true);
  // White inner specular rim
  drawRoundedBadge(buf, CX, 390, 372, 372, 82, 255, 255, 255, 34, 224, 107, 0.15, false);

  // Equalizer bars at the bottom inside the circle
  drawEqualizerSymmetrical(buf, 835, 12, 22, 14, 95, 34, 224, 107, 34, 211, 238);

  const events = `
Dialogue: 3,0:00:00.00,0:00:05.00,BadgeST,,0,0,0,,{\\an5\\pos(540,385)\\bord0\\shad0\\c&H000A1604&}ST
Dialogue: 3,0:00:00.00,0:00:05.00,BrandWord,,0,0,0,,{\\an5\\pos(540,665)}SurTest
Dialogue: 3,0:00:00.00,0:00:05.00,SubTag,,0,0,0,,{\\an5\\pos(540,735)\\c&H006BE022&}INDIA'S SONG QUIZ
`;

  renderLogoPng('ig-logo-01-emerald-badge.png', buf, events);
}

// ============================================================================
// LOGO 2: NEON SOUNDWAVE CREST (ig-logo-02-soundwave-crest.png)
// High-contrast dark glass emblem with big glowing equalizer wave + SurTest
// ============================================================================
{
  const buf = createObsidianCanvas();
  fillRadialGlow(buf, 360, 360, 480, 34, 224, 107, 0.32);
  fillRadialGlow(buf, 720, 720, 480, 168, 85, 247, 0.28);

  // Double neon circle border (Emerald -> Cyan -> Purple)
  drawCircleRing(buf, CX, CY, 485, 16, 34, 224, 107, 168, 85, 247, 0.95);
  drawCircleRing(buf, CX, CY, 450, 4, 34, 211, 238, 34, 224, 107, 0.45);

  // Prominent Center Equalizer Waveform
  drawEqualizerSymmetrical(buf, 360, 12, 32, 18, 260, 34, 224, 107, 34, 211, 238);

  // Pill badge at bottom
  drawRoundedBadge(buf, CX, 790, 520, 74, 37, 34, 224, 107, 6, 182, 212, 0.2, true);

  const events = `
Dialogue: 3,0:00:00.00,0:00:05.00,SubTag,,0,0,0,,{\\an5\\pos(540,165)\\fs24\\c&H00EED322&}● 1s ➔ 16s AUDIO CHALLENGE ●
Dialogue: 3,0:00:00.00,0:00:05.00,BrandWord,,0,0,0,,{\\an5\\pos(540,595)\\fs108}Sur{\\c&H006BE022&}Test
Dialogue: 3,0:00:00.00,0:00:05.00,SubTag,,0,0,0,,{\\an5\\pos(540,685)\\fs28\\c&H00D8E2EC&}HINDI  ·  PUNJABI  ·  HARYANVI
Dialogue: 3,0:00:00.00,0:00:05.00,SubTag,,0,0,0,,{\\an5\\pos(540,790)\\fs26\\c&H006BE022&}GUESS THE SONG ▶
`;

  renderLogoPng('ig-logo-02-soundwave-crest.png', buf, events);
}

console.log('\n🎉 Instagram Profile Picture Logos generated successfully!');
