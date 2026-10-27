import fs from 'fs';
import path from 'path';
import { spawn } from 'child_process';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

const WIDTH = 1280;
const HEIGHT = 720;
const FPS = 30;
const DURATION_SEC = 28;
const TOTAL_FRAMES = FPS * DURATION_SEC;

const videoDir = path.join(rootDir, 'frontend', 'public', 'video');
fs.mkdirSync(videoDir, { recursive: true });

const outputMp4 = path.join(videoDir, 'surftest-gameplay.mp4');
const assPath = path.join(videoDir, 'gameplay_overlay.ass');
const kesariyaAudio = path.join(rootDir, 'frontend', 'public', 'audio', 'kesariya.m4a');
const bgAudio = path.join(rootDir, 'frontend', 'public', 'audio', 'tum-hi-ho.m4a');

// Build ASS overlay for crisp UI labels, step banners, typing animation, dropdown items, and cursor labels
// Remember ASS colors are &HAABBGGRR (BGR order)
// Emerald #22E06B -> 6BE022
// Cyan    #22D3EE -> EED322
// Amber   #FBBF24 -> 24BFFB
// White   #F8FAFC -> FCFAF8
// Slate   #94A3B8 -> B8A394
const assContent = `[Script Info]
ScriptType: v4.00+
PlayResX: 1280
PlayResY: 720
WrapStyle: 0
ScaledBorderAndShadow: yes

[V4+ Styles]
Format: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding
Style: TopStep,Segoe UI,22,&H006BE022,&H006BE022,&H00102015,&H90060B08,-1,0,0,0,100,100,1,0,1,2.5,2,8,20,20,18,1
Style: StepSub,Segoe UI,19,&H00FCFAF8,&H00FCFAF8,&H0010141C,&H80000000,0,0,0,0,100,100,0.4,0,1,2,2,8,20,20,50,1
Style: UITitle,Segoe UI,28,&H00FCFAF8,&H00FCFAF8,&H0010141E,&H00000000,-1,0,0,0,100,100,0.5,0,1,2,2,5,20,20,20,1
Style: UILabel,Segoe UI,18,&H00B8A394,&H00B8A394,&H000A0E16,&H00000000,-1,0,0,0,100,100,1.2,0,1,1.5,1,5,20,20,20,1
Style: CardMain,Segoe UI,26,&H00FFFFFF,&H00FFFFFF,&H00101620,&H00000000,-1,0,0,0,100,100,0.5,0,1,2,2,5,20,20,20,1
Style: CardSub,Segoe UI,16,&H006BE022,&H006BE022,&H000A140E,&H00000000,-1,0,0,0,100,100,0.5,0,1,1.5,1,5,20,20,20,1
Style:MonoTag,Consolas,17,&H00EED322,&H00EED322,&H000A1218,&H00000000,-1,0,0,0,100,100,1,0,1,1.5,1,5,20,20,20,1
Style: SearchText,Segoe UI,22,&H00FFFFFF,&H00FFFFFF,&H00080C12,&H00000000,-1,0,0,0,100,100,0.5,0,1,1.5,0,4,20,20,20,1
Style: WinTitle,Segoe UI,42,&H006BE022,&H006BE022,&H00102815,&H00000000,-1,0,0,0,100,100,0.5,0,1,3,3,5,20,20,20,1

[Events]
Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text
; ================= STEP 1 (0.0s - 5.2s): CHOOSE HINDI & START ROUND =================
Dialogue: 5,0:00:00.10,0:00:05.15,TopStep,,0,0,0,,{\\an8\\pos(640,22)\\fad(200,200)}STEP 1 OF 5 · CHOOSE YOUR LANGUAGE, ERA & GAME MODE
Dialogue: 5,0:00:00.10,0:00:05.15,StepSub,,0,0,0,,{\\an8\\pos(640,54)\\fad(200,200)}Player selects {\\c&H006BE022&\\b1}Hindi (285 Songs){\\c&H00FCFAF8&\\b0}, keeps {\\c&H0024BFFB&\\b1}All Eras{\\c&H00FCFAF8&\\b0} & {\\c&H006BE022&\\b1}Normal Mode{\\c&H00FCFAF8&\\b0}, then clicks {\\c&H006BE022&\\b1}Start a round →

Dialogue: 4,0:00:00.00,0:00:05.15,UILabel,,0,0,0,,{\\an4\\pos(175,140)}01  CHOOSE YOUR SOUND (847 TOTAL TRACKS)
Dialogue: 4,0:00:00.00,0:00:05.15,CardMain,,0,0,0,,{\\an5\\pos(265,215)}All Desi
Dialogue: 4,0:00:00.00,0:00:05.15,CardSub,,0,0,0,,{\\an5\\pos(265,250)\\c&H00B8A394&}847 songs
Dialogue: 4,0:00:00.00,0:00:05.15,CardMain,,0,0,0,,{\\an5\\pos(515,215)}हिंदी Hindi
Dialogue: 4,0:00:00.00,0:00:05.15,CardSub,,0,0,0,,{\\an5\\pos(515,250)\\c&H006BE022&}285 songs · Bollywood
Dialogue: 4,0:00:00.00,0:00:05.15,CardMain,,0,0,0,,{\\an5\\pos(765,215)}ਪੰਜਾਬੀ Punjabi
Dialogue: 4,0:00:00.00,0:00:05.15,CardSub,,0,0,0,,{\\an5\\pos(765,250)\\c&H00B8A394&}283 songs
Dialogue: 4,0:00:00.00,0:00:05.15,CardMain,,0,0,0,,{\\an5\\pos(1015,215)}हरियाणवी Haryanvi
Dialogue: 4,0:00:00.00,0:00:05.15,CardSub,,0,0,0,,{\\an5\\pos(1015,250)\\c&H00B8A394&}279 songs

Dialogue: 4,0:00:00.00,0:00:05.15,UILabel,,0,0,0,,{\\an4\\pos(175,335)}02  SELECTED ERA & MODE
Dialogue: 4,0:00:00.00,0:00:05.15,CardMain,,0,0,0,,{\\an5\\pos(390,405)\\fs22\\c&H0024BFFB&}★ All Eras (Pre-2000 to 2020s)
Dialogue: 4,0:00:00.00,0:00:05.15,CardMain,,0,0,0,,{\\an5\\pos(890,405)\\fs22\\c&H006BE022&}▶ Normal Mode (1s → 16s Intro)

Dialogue: 4,0:00:00.00,0:00:05.15,CardMain,,0,0,0,,{\\an5\\pos(410,545)\\c&H0004140A&\\b1}Start a round  →
Dialogue: 4,0:00:00.00,0:00:05.15,MonoTag,,0,0,0,,{\\an5\\pos(900,545)\\c&H006BE022&}● 285 Hindi tracks available

; ================= STEP 2 (5.2s - 11.2s): STAGE 1 (1s INTRO PLAY & SKIP) =================
Dialogue: 5,0:00:05.20,0:00:11.15,TopStep,,0,0,0,,{\\an8\\pos(640,22)\\fad(200,200)}STEP 2 OF 5 · LISTEN TO STAGE 1 (1.0 SECOND AUDIO CLIP)
Dialogue: 5,0:00:05.20,0:00:08.40,StepSub,,0,0,0,,{\\an8\\pos(640,54)\\fad(150,150)}Player presses {\\c&H006BE022&\\b1}Play ▶{\\c&H00FCFAF8&\\b0} to hear the first {\\c&H00EED322&\\b1}1.0 second{\\c&H00FCFAF8&\\b0} of the mystery Hindi song...
Dialogue: 5,0:00:08.45,0:00:11.15,StepSub,,0,0,0,,{\\an8\\pos(640,54)\\fad(150,150)}1 second is too short! Player clicks {\\c&H0024BFFB&\\b1}Skip (+1s) ⏭{\\c&H00FCFAF8&\\b0} to unlock {\\c&H006BE022&\\b1}Stage 2 (2.0 Seconds){\\c&H00FCFAF8&\\b0}!

Dialogue: 4,0:00:05.20,0:00:22.40,MonoTag,,0,0,0,,{\\an4\\pos(175,128)\\c&H006BE022&}HINDI · ALL ERAS · NORMAL MODE ▶
Dialogue: 4,0:00:05.20,0:00:10.20,MonoTag,,0,0,0,,{\\an6\\pos(1105,128)\\c&H00EED322&}STAGE 1 OF 6  (1.0s UNLOCKED)

; 6 Guess Rows during Stage 1
Dialogue: 4,0:00:05.20,0:00:10.15,UILabel,,0,0,0,,{\\an4\\pos(195,182)\\c&H006BE022&}01   Listening to 1s intro...
Dialogue: 4,0:00:05.20,0:00:22.40,UILabel,,0,0,0,,{\\an4\\pos(195,224)}02   Locked (2s stage)
Dialogue: 4,0:00:05.20,0:00:22.40,UILabel,,0,0,0,,{\\an4\\pos(195,266)}03   Locked (4s stage)
Dialogue: 4,0:00:05.20,0:00:22.40,UILabel,,0,0,0,,{\\an4\\pos(195,308)}04   Locked (7s stage)
Dialogue: 4,0:00:05.20,0:00:22.40,UILabel,,0,0,0,,{\\an4\\pos(195,350)}05   Locked (11s stage)

; Timeline markers
Dialogue: 4,0:00:05.20,0:00:22.40,MonoTag,,0,0,0,,{\\an5\\pos(240,425)\\fs15\\c&H006BE022&}1s
Dialogue: 4,0:00:05.20,0:00:22.40,MonoTag,,0,0,0,,{\\an5\\pos(380,425)\\fs15\\c&H00EED322&}2s
Dialogue: 4,0:00:05.20,0:00:22.40,MonoTag,,0,0,0,,{\\an5\\pos(540,425)\\fs15\\c&H00B8A394&}4s
Dialogue: 4,0:00:05.20,0:00:22.40,MonoTag,,0,0,0,,{\\an5\\pos(720,425)\\fs15\\c&H00B8A394&}7s
Dialogue: 4,0:00:05.20,0:00:22.40,MonoTag,,0,0,0,,{\\an5\\pos(910,425)\\fs15\\c&H00B8A394&}11s
Dialogue: 4,0:00:05.20,0:00:22.40,MonoTag,,0,0,0,,{\\an5\\pos(1090,425)\\fs15\\c&H00B8A394&}16s

; Play & Skip Buttons in Stage 1
Dialogue: 4,0:00:05.20,0:00:11.15,CardMain,,0,0,0,,{\\an5\\pos(575,495)\\fs22\\c&H0004140A&}▶ Play 1s Clip
Dialogue: 4,0:00:05.20,0:00:11.15,CardMain,,0,0,0,,{\\an5\\pos(815,495)\\fs20\\c&H0024BFFB&}Skip (+1s) ⏭

; ================= STEP 3 (11.2s - 16.5s): STAGE 2 (2s AUDIO REVEALS MELODY) =================
Dialogue: 5,0:00:11.20,0:00:16.45,TopStep,,0,0,0,,{\\an8\\pos(640,22)\\fad(200,200)}STEP 3 OF 5 · STAGE 2 UNLOCKS 2.0 SECONDS OF AUDIO!
Dialogue: 5,0:00:11.20,0:00:16.45,StepSub,,0,0,0,,{\\an8\\pos(640,54)\\fad(200,200)}Player presses {\\c&H006BE022&\\b1}Play ▶{\\c&H00FCFAF8&\\b0} again — now hearing {\\c&H006BE022&\\b1}2.0 seconds{\\c&H00FCFAF8&\\b0} reveals the iconic guitar melody!

Dialogue: 4,0:00:10.20,0:00:22.40,MonoTag,,0,0,0,,{\\an6\\pos(1105,128)\\c&H0024BFFB&}STAGE 2 OF 6  (2.0s UNLOCKED)
Dialogue: 4,0:00:10.15,0:00:22.40,UILabel,,0,0,0,,{\\an4\\pos(195,182)\\c&H00B8A394&}01   [ SKIPPED ]  —  Unlocked +1s
Dialogue: 4,0:00:10.15,0:00:22.40,UILabel,,0,0,0,,{\\an4\\pos(195,224)\\c&H006BE022&}02   Active Stage (2.0s unlocked)

Dialogue: 4,0:00:11.20,0:00:22.40,CardMain,,0,0,0,,{\\an5\\pos(575,495)\\fs22\\c&H0004140A&}▶ Play 2s Clip
Dialogue: 4,0:00:11.20,0:00:22.40,CardMain,,0,0,0,,{\\an5\\pos(815,495)\\fs20\\c&H00B8A394&}Skip (+2s) ⏭

Dialogue: 5,0:00:14.00,0:00:16.45,CardMain,,0,0,0,,{\\an5\\pos(640,350)\\fad(200,200)\\c&H006BE022&}💡 "Aha! That's Kesariya by Arijit Singh!"

; ================= STEP 4 (16.5s - 22.4s): TYPE & SELECT FROM AUTOCOMPLETE =================
Dialogue: 5,0:00:16.50,0:00:22.40,TopStep,,0,0,0,,{\\an8\\pos(640,22)\\fad(200,200)}STEP 4 OF 5 · TYPE YOUR GUESS & PICK FROM AUTOCOMPLETE
Dialogue: 5,0:00:16.50,0:00:22.40,StepSub,,0,0,0,,{\\an8\\pos(640,54)\\fad(200,200)}Player types {\\c&H00EED322&\\b1}"Kesariya"{\\c&H00FCFAF8&\\b0}, clicks {\\c&H006BE022&\\b1}Kesariya - Arijit Singh, Pritam{\\c&H00FCFAF8&\\b0}, and hits {\\c&H006BE022&\\b1}Submit ✓

; Placeholder before typing
Dialogue: 4,0:00:05.20,0:00:17.00,SearchText,,0,0,0,,{\\an4\\pos(195,575)\\c&H00B8A394&}🔍 Search song title or artist...
Dialogue: 4,0:00:05.20,0:00:22.40,CardMain,,0,0,0,,{\\an5\\pos(1025,575)\\fs22\\c&H0004140A&}Submit ✓

; Typing animation in search input
Dialogue: 4,0:00:17.00,0:00:17.35,SearchText,,0,0,0,,{\\an4\\pos(195,575)}🔍 K|
Dialogue: 4,0:00:17.35,0:00:17.70,SearchText,,0,0,0,,{\\an4\\pos(195,575)}🔍 Ke|
Dialogue: 4,0:00:17.70,0:00:18.05,SearchText,,0,0,0,,{\\an4\\pos(195,575)}🔍 Kes|
Dialogue: 4,0:00:18.05,0:00:18.40,SearchText,,0,0,0,,{\\an4\\pos(195,575)}🔍 Kesa|
Dialogue: 4,0:00:18.40,0:00:20.40,SearchText,,0,0,0,,{\\an4\\pos(195,575)}🔍 Kesariya|
Dialogue: 4,0:00:20.40,0:00:22.40,SearchText,,0,0,0,,{\\an4\\pos(195,575)\\c&H006BE022&}✓ Kesariya - Arijit Singh, Pritam

; Autocomplete dropdown options (18.0s - 20.6s)
Dialogue: 5,0:00:18.00,0:00:20.50,SearchText,,0,0,0,,{\\an4\\pos(200,632)\\fs20\\c&H006BE022&}🎵 Kesariya - Arijit Singh, Pritam   (Brahmāstra · 2022)   [Click to Select]
Dialogue: 5,0:00:18.00,0:00:20.50,SearchText,,0,0,0,,{\\an4\\pos(200,668)\\fs18\\c&H00B8A394&}🎵 Kabira - Tochi Raina, Rekha Bhardwaj   (YJHD · 2013)

; ================= STEP 5 (22.4s - 28.0s): VICTORY REVEAL & SCORE SHARE =================
Dialogue: 5,0:00:22.45,0:00:27.95,TopStep,,0,0,0,,{\\an8\\pos(640,22)\\fad(200,300)}STEP 5 OF 5 · YOU NAILED IT! FULL SONG UNLOCKED & STREAK +1
Dialogue: 5,0:00:22.45,0:00:27.95,StepSub,,0,0,0,,{\\an8\\pos(640,54)\\fad(200,300)}Full track plays automatically, your {\\c&H006BE022&\\b1}Win Streak{\\c&H00FCFAF8&\\b0} levels up, and you can share your score!

Dialogue: 4,0:00:22.45,0:00:27.95,WinTitle,,0,0,0,,{\\an5\\move(640,195,640,180,0,350)\\fad(200,300)}🏆 GUESSED IN STAGE 2 (2.0 SECONDS)!
Dialogue: 4,0:00:22.45,0:00:27.95,UITitle,,0,0,0,,{\\an5\\pos(640,255)\\fs34\\c&H00FFFFFF&}Kesariya — Arijit Singh, Pritam
Dialogue: 4,0:00:22.45,0:00:27.95,UILabel,,0,0,0,,{\\an5\\pos(640,298)\\fs20\\c&H00EED322&}Album: Brahmāstra (2022)  ·  Language: Hindi  ·  Era: New Hits

Dialogue: 4,0:00:22.45,0:00:27.95,CardMain,,0,0,0,,{\\an5\\pos(640,368)\\fs26\\c&H006BE022&}⬛  🟩  ⬜  ⬜  ⬜  ⬜     🔥 Win Streak: 5     ⚡ Win Rate: 100%
Dialogue: 4,0:00:22.45,0:00:27.95,CardMain,,0,0,0,,{\\an5\\pos(490,460)\\fs22\\c&H0004140A&}Play Next Song →
Dialogue: 4,0:00:22.45,0:00:27.95,CardMain,,0,0,0,,{\\an5\\pos(790,460)\\fs20\\c&H00FCFAF8&}Share Result 📋
`;

fs.writeFileSync(assPath, assContent, 'utf8');

function fillRectAlpha(buf, x0, y0, w, h, r, g, b, alpha) {
  const xStart = Math.max(0, Math.floor(x0));
  const yStart = Math.max(0, Math.floor(y0));
  const xEnd = Math.min(WIDTH, Math.floor(x0 + w));
  const yEnd = Math.min(HEIGHT, Math.floor(y0 + h));
  const invA = 1 - alpha;

  for (let y = yStart; y < yEnd; y++) {
    let rowIdx = y * WIDTH * 3 + xStart * 3;
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

// Draw simulated mouse cursor + click ripple
function drawCursor(buf, cx, cy, isClicking, clickProgress = 0) {
  if (isClicking) {
    const rad = Math.floor(14 + clickProgress * 28);
    drawBorderRect(buf, cx - rad, cy - rad, rad * 2, rad * 2, 3, 34, 224, 107, 1 - clickProgress * 0.8);
  }
  // Outer white pointer box + inner emerald pointer core
  fillRectAlpha(buf, cx - 3, cy - 3, 18, 22, 255, 255, 255, 0.98);
  fillRectAlpha(buf, cx, cy, 12, 16, 34, 224, 107, 0.98);
}

function lerp(a, b, u) {
  const clamped = Math.max(0, Math.min(1, u));
  // Smoothstep easing
  const s = clamped * clamped * (3 - 2 * clamped);
  return a + (b - a) * s;
}

// Compute cursor position (x, y) and click state at time t
function getCursorState(t) {
  // Keyframes: [time, x, y]
  const points = [
    [0.0, 260, 220],
    [1.1, 515, 220], // Move to Hindi card
    [1.8, 515, 220], // Click Hindi card
    [2.6, 890, 405], // Check Normal mode
    [3.6, 410, 545], // Move to "Start a round" button
    [4.6, 410, 545], // Click "Start a round"
    [5.8, 575, 495], // Move to "Play 1s Clip"
    [6.5, 575, 495], // Click Play 1s
    [8.8, 815, 495], // Move to "Skip (+1s)"
    [9.8, 815, 495], // Click Skip (+1s)
    [11.0, 575, 495], // Move back to "Play 2s Clip"
    [11.7, 575, 495], // Click Play 2s
    [16.2, 420, 575], // Move to Search box
    [18.8, 420, 575], // Typing "Kesariya"
    [19.6, 450, 632], // Move to Autocomplete item "Kesariya - Arijit Singh"
    [20.2, 450, 632], // Click Autocomplete item
    [21.0, 1025, 575], // Move to Submit button
    [21.8, 1025, 575], // Click Submit!
    [23.5, 490, 460], // Hover "Play Next Song" on Victory card
    [28.0, 490, 460]
  ];

  let cx = 640;
  let cy = 360;
  for (let i = 0; i < points.length - 1; i++) {
    const [t0, x0, y0] = points[i];
    const [t1, x1, y1] = points[i + 1];
    if (t >= t0 && t <= t1) {
      const u = t1 === t0 ? 1 : (t - t0) / (t1 - t0);
      cx = lerp(x0, x1, u);
      cy = lerp(y0, y1, u);
      break;
    }
  }

  // Click timestamps
  const clickTimes = [1.3, 4.1, 6.1, 9.4, 11.3, 16.8, 19.9, 21.4];
  let isClicking = false;
  let clickProg = 0;
  for (const ct of clickTimes) {
    if (t >= ct && t <= ct + 0.45) {
      isClicking = true;
      clickProg = (t - ct) / 0.45;
      break;
    }
  }

  return { cx, cy, isClicking, clickProg };
}

// Precompute base dark Liquid Glass background
const baseFrame = Buffer.alloc(WIDTH * HEIGHT * 3);
for (let y = 0; y < HEIGHT; y++) {
  const ny = y / HEIGHT;
  for (let x = 0; x < WIDTH; x++) {
    const nx = x / WIDTH;
    const idx = (y * WIDTH + x) * 3;
    const isGrid = (x % 64 === 0 || y % 64 === 0);
    const gridBoost = isGrid ? 5 : 0;
    baseFrame[idx] = Math.min(255, Math.floor(6 + ny * 6 + gridBoost));
    baseFrame[idx + 1] = Math.min(255, Math.floor(10 + (1 - ny) * 10 + gridBoost));
    baseFrame[idx + 2] = Math.min(255, Math.floor(18 + nx * 12 + gridBoost));
  }
}

async function generateGameplayVideo() {
  console.log('🎮 Rendering 28-Second Gameplay Walkthrough Video (1280x720 HD 30fps)...');

  const escapedAssPath = assPath.replace(/\\/g, '/').replace(/:/g, '\\:');

  // Audio filtergraph:
  // - Input 1 (kesariyaAudio):
  //   * Snippet 1 (1.1s clip) played at t = 6.2s (6200ms)
  //   * Snippet 2 (2.2s clip) played at t = 11.4s (11400ms)
  //   * Victory chorus clip (5.5s clip) played at t = 22.4s (22400ms)
  // - Input 2 (bgAudio): soft background bed during setup/typing
  const audioFilter = [
    `[1:a]atrim=0:1.2,asetpts=PTS-STARTPTS,volume=1.35,adelay=6200|6200[s1]`,
    `[1:a]atrim=0:2.3,asetpts=PTS-STARTPTS,volume=1.35,adelay=11400|11400[s2]`,
    `[1:a]atrim=4:9.6,asetpts=PTS-STARTPTS,afade=t=in:st=0:d=0.4,afade=t=out:st=4.2:d=1.3,volume=1.35,adelay=22400|22400[s3]`,
    `[2:a]atrim=0:${DURATION_SEC},asetpts=PTS-STARTPTS,volume=0.14,afade=t=in:st=0:d=1.0,afade=t=out:st=${DURATION_SEC - 2}:d=2.0[bg]`,
    `[bg][s1][s2][s3]amix=inputs=4:duration=first:dropout_transition=0,volume=1.6[aout]`
  ].join(';');

  const ffmpegArgs = [
    '-y',
    '-f', 'rawvideo',
    '-pixel_format', 'rgb24',
    '-video_size', `${WIDTH}x${HEIGHT}`,
    '-framerate', `${FPS}`,
    '-i', 'pipe:0',
    '-i', kesariyaAudio,
    '-i', bgAudio,
    '-filter_complex', `[0:v]subtitles='${escapedAssPath}'[vout];${audioFilter}`,
    '-map', '[vout]',
    '-map', '[aout]',
    '-t', `${DURATION_SEC}`,
    '-c:v', 'libx264',
    '-preset', 'fast',
    '-crf', '20',
    '-pix_fmt', 'yuv420p',
    '-c:a', 'aac',
    '-b:a', '160k',
    '-movflags', '+faststart',
    outputMp4
  ];

  const ff = spawn('ffmpeg', ffmpegArgs, { stdio: ['pipe', 'ignore', 'pipe'] });

  let stderrLog = '';
  ff.stderr.on('data', chunk => {
    stderrLog += chunk.toString();
  });

  const frameBuf = Buffer.alloc(WIDTH * HEIGHT * 3);

  for (let f = 0; f < TOTAL_FRAMES; f++) {
    const t = f / FPS;
    baseFrame.copy(frameBuf);

    // Top instruction banner backdrop
    fillRectAlpha(frameBuf, 80, 12, 1120, 76, 12, 22, 34, 0.85);
    drawBorderRect(frameBuf, 80, 12, 1120, 76, 2, 34, 224, 107, 0.55);

    if (t < 5.2) {
      // ================= SCENE 1: SETUP CARD UI =================
      fillRectAlpha(frameBuf, 140, 110, 1000, 500, 14, 19, 30, 0.85);
      drawBorderRect(frameBuf, 140, 110, 1000, 500, 2, 255, 255, 255, 0.16);

      // 4 Language Cards
      const hindiSelected = t >= 1.3;
      const cards = [
        { x: 165, active: !hindiSelected },
        { x: 415, active: hindiSelected },
        { x: 665, active: false },
        { x: 915, active: false }
      ];
      for (const c of cards) {
        if (c.active) {
          fillRectAlpha(frameBuf, c.x, 170, 200, 115, 34, 224, 107, 0.22);
          drawBorderRect(frameBuf, c.x, 170, 200, 115, 3, 34, 224, 107, 0.95);
        } else {
          fillRectAlpha(frameBuf, c.x, 170, 200, 115, 255, 255, 255, 0.05);
          drawBorderRect(frameBuf, c.x, 170, 200, 115, 1, 255, 255, 255, 0.15);
        }
      }

      // Era & Mode Pills
      fillRectAlpha(frameBuf, 165, 365, 450, 80, 245, 158, 11, 0.14);
      drawBorderRect(frameBuf, 165, 365, 450, 80, 2, 245, 158, 11, 0.7);

      fillRectAlpha(frameBuf, 665, 365, 450, 80, 34, 224, 107, 0.14);
      drawBorderRect(frameBuf, 665, 365, 450, 80, 2, 34, 224, 107, 0.7);

      // Primary "Start a round" green button
      const btnClickBoost = (t >= 4.0 && t <= 4.6) ? 0.98 : 0.85;
      fillRectAlpha(frameBuf, 260, 510, 300, 68, 34, 224, 107, btnClickBoost);
      drawBorderRect(frameBuf, 260, 510, 300, 68, 2, 255, 255, 255, 0.7);
    } else if (t < 22.4) {
      // ================= SCENE 2-4: GAMEPLAY MODAL UI =================
      fillRectAlpha(frameBuf, 140, 105, 1000, 525, 12, 17, 27, 0.92);
      drawBorderRect(frameBuf, 140, 105, 1000, 525, 2, 34, 224, 107, 0.35);

      // 5 Guess Slots
      const isStage2 = t >= 10.15;
      for (let s = 0; s < 5; s++) {
        const sy = 165 + s * 42;
        const isCurrent = (!isStage2 && s === 0) || (isStage2 && s === 1);
        const isSkipped = isStage2 && s === 0;
        if (isCurrent) {
          fillRectAlpha(frameBuf, 175, sy, 930, 34, 34, 224, 107, 0.14);
          drawBorderRect(frameBuf, 175, sy, 930, 34, 2, 34, 224, 107, 0.75);
        } else if (isSkipped) {
          fillRectAlpha(frameBuf, 175, sy, 930, 34, 255, 255, 255, 0.07);
          drawBorderRect(frameBuf, 175, sy, 930, 34, 1, 255, 255, 255, 0.2);
        } else {
          fillRectAlpha(frameBuf, 175, sy, 930, 34, 255, 255, 255, 0.03);
          drawBorderRect(frameBuf, 175, sy, 930, 34, 1, 255, 255, 255, 0.08);
        }
      }

      // Audio Progress Bar (x: 175 -> 1105, width: 930)
      fillRectAlpha(frameBuf, 175, 395, 930, 18, 255, 255, 255, 0.08);
      // Unlocked region indicator (1s = width 65, 2s = width 205)
      const unlockedW = isStage2 ? 205 : 65;
      fillRectAlpha(frameBuf, 175, 395, unlockedW, 18, 34, 224, 107, 0.22);

      // Active playback fill during Stage 1 play (6.2s - 7.4s) or Stage 2 play (11.4s - 13.7s)
      if (t >= 6.2 && t <= 7.4) {
        const p = Math.min(1, (t - 6.2) / 1.1);
        fillRectAlpha(frameBuf, 175, 395, Math.floor(65 * p), 18, 34, 224, 107, 0.95);
      } else if (t >= 11.4 && t <= 13.7) {
        const p = Math.min(1, (t - 11.4) / 2.2);
        fillRectAlpha(frameBuf, 175, 395, Math.floor(205 * p), 18, 34, 224, 107, 0.95);
      }

      // Stage divider ticks on progress bar
      const tickXs = [240, 380, 540, 720, 910, 1090];
      for (const tx of tickXs) {
        fillRectAlpha(frameBuf, tx, 392, 2, 24, 255, 255, 255, 0.35);
      }

      // Play Button & Skip Button
      fillRectAlpha(frameBuf, 475, 468, 200, 52, 34, 224, 107, 0.9);
      fillRectAlpha(frameBuf, 715, 468, 200, 52, 245, 158, 11, 0.18);
      drawBorderRect(frameBuf, 715, 468, 200, 52, 2, 245, 158, 11, 0.65);

      // Search Input Box + Submit Button
      fillRectAlpha(frameBuf, 175, 546, 760, 56, 8, 12, 20, 0.95);
      drawBorderRect(frameBuf, 175, 546, 760, 56, 2, 34, 211, 238, t >= 16.5 ? 0.85 : 0.3);

      fillRectAlpha(frameBuf, 950, 546, 155, 56, 34, 224, 107, t >= 20.3 ? 0.95 : 0.45);

      // Autocomplete Dropdown Box (18.0s - 20.5s)
      if (t >= 18.0 && t <= 20.5) {
        fillRectAlpha(frameBuf, 175, 610, 760, 82, 14, 22, 34, 0.98);
        drawBorderRect(frameBuf, 175, 610, 760, 82, 2, 34, 224, 107, 0.75);
        // Highlight first row
        fillRectAlpha(frameBuf, 178, 613, 754, 40, 34, 224, 107, 0.22);
      }
    } else {
      // ================= SCENE 5: VICTORY REVEAL CARD =================
      fillRectAlpha(frameBuf, 160, 125, 960, 420, 12, 28, 20, 0.92);
      drawBorderRect(frameBuf, 160, 125, 960, 420, 3, 34, 224, 107, 0.9);

      // Play Next Song & Share Buttons
      fillRectAlpha(frameBuf, 360, 430, 260, 58, 34, 224, 107, 0.92);
      fillRectAlpha(frameBuf, 660, 430, 260, 58, 255, 255, 255, 0.1);
      drawBorderRect(frameBuf, 660, 430, 260, 58, 2, 255, 255, 255, 0.35);
    }

    // Audio Equalizer bars along bottom when music is actively playing
    const isAudioActive =
      (t >= 6.2 && t <= 7.45) ||
      (t >= 11.4 && t <= 13.75) ||
      t >= 22.4;

    const numBars = 36;
    const startX = 200;
    const barW = 16;
    const gap = 8;
    const baseY = 695;

    for (let b = 0; b < numBars; b++) {
      const amp = isAudioActive ? 1.0 : 0.18;
      const w1 = Math.sin(t * 9.5 + b * 0.45) * 0.5 + 0.5;
      const w2 = Math.cos(t * 13.0 - b * 0.3) * 0.5 + 0.5;
      const barH = Math.max(6, Math.floor((8 + (w1 * 48 + w2 * 30) * amp)));
      const bx = startX + b * (barW + gap);
      const by = baseY - barH;
      fillRectAlpha(frameBuf, bx, by, barW, barH, 34, 224, 107, isAudioActive ? 0.85 : 0.3);
    }

    // Draw simulated player cursor on top of UI
    const { cx, cy, isClicking, clickProg } = getCursorState(t);
    drawCursor(frameBuf, cx, cy, isClicking, clickProg);

    // Bottom overall video timeline bar
    const progressW = Math.floor((f / TOTAL_FRAMES) * WIDTH);
    fillRectAlpha(frameBuf, 0, HEIGHT - 5, progressW, 5, 34, 224, 107, 0.95);

    const canContinue = ff.stdin.write(frameBuf);
    if (!canContinue) {
      await new Promise(resolve => ff.stdin.once('drain', resolve));
    }
  }

  ff.stdin.end();

  await new Promise((resolve, reject) => {
    ff.on('close', code => {
      if (code === 0) resolve();
      else reject(new Error(`FFmpeg exited with code ${code}: ${stderrLog.slice(-500)}`));
    });
  });

  if (fs.existsSync(assPath)) fs.unlinkSync(assPath);

  const stat = fs.statSync(outputMp4);
  console.log(`✅ Successfully generated Gameplay Walkthrough Video: ${outputMp4} (${(stat.size / (1024 * 1024)).toFixed(2)} MB)`);
}

generateGameplayVideo().catch(err => {
  console.error(err);
  process.exit(1);
});
