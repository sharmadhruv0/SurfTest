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
const DURATION_SEC = 20;
const TOTAL_FRAMES = FPS * DURATION_SEC;

const videoDir = path.join(rootDir, 'frontend', 'public', 'video');
fs.mkdirSync(videoDir, { recursive: true });

const outputMp4 = path.join(videoDir, 'surftest-intro.mp4');
const assPath = path.join(videoDir, 'intro_overlay.ass');
const audioPath = path.join(rootDir, 'frontend', 'public', 'audio', 'ghungroo.m4a');

// Build Advanced SubStation Alpha (.ass) motion-graphics overlay
// Note: ASS colors use &HAABBGGRR format (BGR order!)
// Emerald #22E06B -> BGR: 6BE022
// Cyan    #22D3EE -> BGR: EED322
// Amber   #FBBF24 -> BGR: 24BFFB
// Purple  #C084FC -> BGR: FC84C0
// White   #F8FAFC -> BGR: FCFAF8
// Slate   #94A3B8 -> BGR: B8A394
// DarkBg  #0B0F18 -> BGR: 180F0B
const assContent = `[Script Info]
ScriptType: v4.00+
PlayResX: 1280
PlayResY: 720
WrapStyle: 0
ScaledBorderAndShadow: yes

[V4+ Styles]
Format: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding
Style: Pill,Segoe UI,18,&H006BE022,&H006BE022,&H00283818,&H8008140C,-1,0,0,0,100,100,3,0,3,10,0,8,20,20,20,1
Style: HeroTitle,Segoe UI,58,&H00FCFAF8,&H00FCFAF8,&H00182010,&H90000000,-1,0,0,0,100,100,0.5,0,1,3,4,5,20,20,20,1
Style: HeroSub,Segoe UI,54,&H006BE022,&H006BE022,&H00204010,&H90000000,-1,0,0,0,100,100,0.5,0,1,3,4,5,20,20,20,1
Style: BodySub,Segoe UI,24,&H00D8E2EC,&H00D8E2EC,&H0010141C,&H80000000,0,0,0,0,100,100,0.5,0,1,2,2,5,20,20,20,1
Style: CardBox,Segoe UI,28,&H00FFFFFF,&H00FFFFFF,&H0038281E,&H9018120C,-1,0,0,0,100,100,0.5,0,3,18,0,5,20,20,20,1
Style: BigNum,Segoe UI,52,&H006BE022,&H006BE022,&H00153510,&H80000000,-1,0,0,0,100,100,1,0,1,3,3,5,20,20,20,1
Style: ModeTitle,Segoe UI,32,&H00FCFAF8,&H00FCFAF8,&H00141822,&H90080C14,-1,0,0,0,100,100,0.5,0,1,2.5,3,5,20,20,20,1
Style: FooterTag,Consolas,18,&H00B8A394,&H00B8A394,&H00080C14,&H00000000,-1,0,0,0,100,100,2,0,1,1.5,0,2,20,20,24,1

[Events]
Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text
; Persistent Top Brand Bar
Dialogue: 2,0:00:00.00,0:00:20.00,FooterTag,,0,0,0,,{\\an7\\pos(56,36)\\fad(400,400)\\c&H006BE022&}● {\\c&H00FCFAF8&}SURFTEST {\\c&H00B8A394&}· INDIA'S LIQUID-GLASS MUSIC QUIZ

; ================= SCENE 1 (0.0s - 4.0s): HERO INTRO =================
Dialogue: 3,0:00:00.15,0:00:03.95,Pill,,0,0,0,,{\\an5\\move(640,185,640,170,0,400)\\fad(250,300)}ROUND 001 · INDIA'S SOUNDTRACK · LIVE
Dialogue: 3,0:00:00.30,0:00:03.95,HeroTitle,,0,0,0,,{\\an5\\move(640,285,640,265,0,450)\\fad(300,300)}Guess the song
Dialogue: 3,0:00:00.55,0:00:03.95,HeroSub,,0,0,0,,{\\an5\\move(640,355,640,335,0,450)\\fad(300,300)\\c&H006BE022&}before the beat gets loud.
Dialogue: 3,0:00:00.90,0:00:03.95,BodySub,,0,0,0,,{\\an5\\move(640,435,640,420,0,450)\\fad(350,300)}6 Escalating Audio Stages:  {\\c&H006BE022&\\b1}1s  ➔  2s  ➔  4s  ➔  7s  ➔  11s  ➔  16s

; ================= SCENE 2 (4.0s - 8.2s): 847 SONGS ACROSS 3 COLLECTIONS =================
Dialogue: 3,0:00:04.05,0:00:08.15,Pill,,0,0,0,,{\\an5\\pos(640,130)\\fad(250,250)\\c&H00EED322&}01 · MASSIVE CURATED DESI CATALOG
Dialogue: 3,0:00:04.15,0:00:08.15,HeroTitle,,0,0,0,,{\\an5\\move(640,210,640,195,0,350)\\fad(250,250)}847 Iconic Indian Tracks
Dialogue: 3,0:00:04.40,0:00:08.15,BigNum,,0,0,0,,{\\an5\\move(270,350,270,330,0,400)\\fad(250,250)\\c&H006BE022&}285
Dialogue: 3,0:00:04.40,0:00:08.15,ModeTitle,,0,0,0,,{\\an5\\move(270,405,270,385,0,400)\\fad(250,250)}HINDI COLLECTION
Dialogue: 3,0:00:04.40,0:00:08.15,BodySub,,0,0,0,,{\\an5\\move(270,445,270,425,0,400)\\fad(250,250)\\fs20\\c&H00B8A394&}Bollywood Classics & Pop

Dialogue: 3,0:00:04.65,0:00:08.15,BigNum,,0,0,0,,{\\an5\\move(640,350,640,330,0,400)\\fad(250,250)\\c&H00EED322&}283
Dialogue: 3,0:00:04.65,0:00:08.15,ModeTitle,,0,0,0,,{\\an5\\move(640,405,640,385,0,400)\\fad(250,250)}PUNJABI COLLECTION
Dialogue: 3,0:00:04.65,0:00:08.15,BodySub,,0,0,0,,{\\an5\\move(640,445,640,425,0,400)\\fad(250,250)\\fs20\\c&H00B8A394&}Bhangra, Hip-Hop & Beats

Dialogue: 3,0:00:04.90,0:00:08.15,BigNum,,0,0,0,,{\\an5\\move(1010,350,1010,330,0,400)\\fad(250,250)\\c&H0024BFFB&}279
Dialogue: 3,0:00:04.90,0:00:08.15,ModeTitle,,0,0,0,,{\\an5\\move(1010,405,1010,385,0,400)\\fad(250,250)}HARYANVI COLLECTION
Dialogue: 3,0:00:04.90,0:00:08.15,BodySub,,0,0,0,,{\\an5\\move(1010,445,1010,425,0,400)\\fad(250,250)\\fs20\\c&H00B8A394&}Desi Anthems & Folk Hits

; ================= SCENE 3 (8.2s - 12.2s): 4 ERAS OF MUSIC =================
Dialogue: 3,0:00:08.25,0:00:12.15,Pill,,0,0,0,,{\\an5\\pos(640,130)\\fad(250,250)\\c&H0024BFFB&}02 · TIME-TRAVEL ACROSS 4 DECADES
Dialogue: 3,0:00:08.35,0:00:12.15,HeroTitle,,0,0,0,,{\\an5\\move(640,210,640,195,0,350)\\fad(250,250)}Every Era of Desi Music
Dialogue: 3,0:00:08.60,0:00:12.15,ModeTitle,,0,0,0,,{\\an5\\move(340,320,340,305,0,350)\\fad(250,250)\\c&H0024BFFB&}★ Old is Gold (Pre-2000)
Dialogue: 3,0:00:08.60,0:00:12.15,BodySub,,0,0,0,,{\\an5\\move(340,360,340,345,0,350)\\fad(250,250)\\fs20}273 Retro 70s, 80s & 90s Legends
Dialogue: 3,0:00:08.85,0:00:12.15,ModeTitle,,0,0,0,,{\\an5\\move(940,320,940,305,0,350)\\fad(250,250)\\c&H00F88C81&}★ 2000s Nostalgia
Dialogue: 3,0:00:08.85,0:00:12.15,BodySub,,0,0,0,,{\\an5\\move(940,360,940,345,0,350)\\fad(250,250)\\fs20}126 Millennial Classics & Club Hits
Dialogue: 3,0:00:09.10,0:00:12.15,ModeTitle,,0,0,0,,{\\an5\\move(340,440,340,425,0,350)\\fad(250,250)\\c&H009948EC&}★ 2010s Streaming Era
Dialogue: 3,0:00:09.10,0:00:12.15,BodySub,,0,0,0,,{\\an5\\move(340,480,340,465,0,350)\\fad(250,250)\\fs20}149 Chartbusters & Romantic Ballads
Dialogue: 3,0:00:09.35,0:00:12.15,ModeTitle,,0,0,0,,{\\an5\\move(940,440,940,425,0,350)\\fad(250,250)\\c&H006BE022&}★ 2020s New Hits
Dialogue: 3,0:00:09.35,0:00:12.15,BodySub,,0,0,0,,{\\an5\\move(940,480,940,465,0,350)\\fad(250,250)\\fs20}299 Viral Reels & Fresh Drops

; ================= SCENE 4 (12.2s - 16.6s): 4 GAME MODES =================
Dialogue: 3,0:00:12.25,0:00:16.55,Pill,,0,0,0,,{\\an5\\pos(640,120)\\fad(250,250)\\c&H00FC84C0&}03 · FOUR ELECTRIFYING WAYS TO PLAY
Dialogue: 3,0:00:12.35,0:00:16.55,HeroTitle,,0,0,0,,{\\an5\\move(640,195,640,182,0,350)\\fad(250,250)\\fs50}4 Game Modes + Multiplayer

Dialogue: 3,0:00:12.55,0:00:16.55,ModeTitle,,0,0,0,,{\\an5\\move(340,305,340,292,0,350)\\fad(250,250)\\c&H006BE022&}▶ Normal Mode
Dialogue: 3,0:00:12.55,0:00:16.55,BodySub,,0,0,0,,{\\an5\\move(340,342,340,330,0,350)\\fad(250,250)\\fs20}Standard 1s → 16s Intro Escalation

Dialogue: 3,0:00:12.80,0:00:16.55,ModeTitle,,0,0,0,,{\\an5\\move(940,305,940,292,0,350)\\fad(250,250)\\c&H00FC84C0&}↺ Reverse Mode
Dialogue: 3,0:00:12.80,0:00:16.55,BodySub,,0,0,0,,{\\an5\\move(940,342,940,330,0,350)\\fad(250,250)\\fs20}Backwards Audio — Guess Forwards!

Dialogue: 3,0:00:13.05,0:00:16.55,ModeTitle,,0,0,0,,{\\an5\\move(340,435,340,422,0,350)\\fad(250,250)\\c&H0024BFFB&}🔗 Antakshari Chain
Dialogue: 3,0:00:13.05,0:00:16.55,BodySub,,0,0,0,,{\\an5\\move(340,472,340,460,0,350)\\fad(250,250)\\fs20}Sound-to-Sound Chain & Live Team Rooms

Dialogue: 3,0:00:13.30,0:00:16.55,ModeTitle,,0,0,0,,{\\an5\\move(940,435,940,422,0,350)\\fad(250,250)\\c&H00EED322&}⚡ 60s Blitz Speedrun
Dialogue: 3,0:00:13.30,0:00:16.55,BodySub,,0,0,0,,{\\an5\\move(940,472,940,460,0,350)\\fad(250,250)\\fs20}Back-to-Back Hooks · +3s Bonus Per Hit!

; ================= SCENE 5 (16.6s - 20.0s): FINALE CTA =================
Dialogue: 3,0:00:16.65,0:00:19.90,Pill,,0,0,0,,{\\an5\\pos(640,190)\\fad(300,400)\\c&H006BE022&}READY TO TEST YOUR DESI MUSIC IQ?
Dialogue: 3,0:00:16.80,0:00:19.90,HeroTitle,,0,0,0,,{\\an5\\move(640,285,640,270,0,400)\\fad(300,400)\\fs66}SURFTEST
Dialogue: 3,0:00:17.00,0:00:19.90,HeroSub,,0,0,0,,{\\an5\\move(640,355,640,340,0,400)\\fad(300,400)\\fs38\\c&H00EED322&}847 Songs · 4 Modes · 3 Languages
Dialogue: 3,0:00:17.20,0:00:19.90,BodySub,,0,0,0,,{\\an5\\move(640,425,640,412,0,400)\\fad(300,400)\\c&H006BE022&\\b1}Play Normal, Reverse, Antakshari & 60s Blitz Now!
`;

fs.writeFileSync(assPath, assContent, 'utf8');

// Helper to draw filled rectangle with alpha blend on RGB24 buffer
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

// Precompute base dark gradient + grid pattern buffer for fast frame rendering
const baseFrame = Buffer.alloc(WIDTH * HEIGHT * 3);
for (let y = 0; y < HEIGHT; y++) {
  const ny = y / HEIGHT;
  for (let x = 0; x < WIDTH; x++) {
    const nx = x / WIDTH;
    const idx = (y * WIDTH + x) * 3;
    const isGrid = (x % 64 === 0 || y % 64 === 0);
    const gridBoost = isGrid ? 7 : 0;
    baseFrame[idx] = Math.min(255, Math.floor(6 + ny * 6 + gridBoost));
    baseFrame[idx + 1] = Math.min(255, Math.floor(9 + (1 - ny) * 10 + gridBoost));
    baseFrame[idx + 2] = Math.min(255, Math.floor(16 + nx * 12 + gridBoost));
  }
}

async function generateVideo() {
  console.log('🎬 Rendering 1280x720 HD 30fps SurfTest Intro Video with FFmpeg...');

  // Escape Windows path for FFmpeg subtitles filter
  const escapedAssPath = assPath.replace(/\\/g, '/').replace(/:/g, '\\:');

  const ffmpegArgs = [
    '-y',
    '-f', 'rawvideo',
    '-pixel_format', 'rgb24',
    '-video_size', `${WIDTH}x${HEIGHT}`,
    '-framerate', `${FPS}`,
    '-i', 'pipe:0',
    '-i', audioPath,
    '-vf', `subtitles='${escapedAssPath}'`,
    '-af', `afade=t=in:st=0:d=1.2,afade=t=out:st=${DURATION_SEC - 2.2}:d=2.2`,
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

    // 1. Draw animated Liquid Glass glowing ambient bars / cards depending on scene
    if (t >= 4.0 && t < 8.2) {
      // 3 Language Glass Cards
      fillRectAlpha(frameBuf, 110, 260, 320, 220, 34, 224, 107, 0.14);
      fillRectAlpha(frameBuf, 110, 260, 320, 4, 34, 224, 107, 0.85);

      fillRectAlpha(frameBuf, 480, 260, 320, 220, 34, 211, 238, 0.14);
      fillRectAlpha(frameBuf, 480, 260, 320, 4, 34, 211, 238, 0.85);

      fillRectAlpha(frameBuf, 850, 260, 320, 220, 245, 158, 11, 0.14);
      fillRectAlpha(frameBuf, 850, 260, 320, 4, 245, 158, 11, 0.85);
    } else if (t >= 8.2 && t < 12.2) {
      // 4 Era Glass Cards (2x2 grid)
      fillRectAlpha(frameBuf, 120, 265, 440, 105, 245, 158, 11, 0.14);
      fillRectAlpha(frameBuf, 120, 265, 440, 3, 245, 158, 11, 0.85);

      fillRectAlpha(frameBuf, 720, 265, 440, 105, 129, 140, 248, 0.14);
      fillRectAlpha(frameBuf, 720, 265, 440, 3, 129, 140, 248, 0.85);

      fillRectAlpha(frameBuf, 120, 390, 440, 105, 236, 72, 153, 0.14);
      fillRectAlpha(frameBuf, 120, 390, 440, 3, 236, 72, 153, 0.85);

      fillRectAlpha(frameBuf, 720, 390, 440, 105, 34, 224, 107, 0.14);
      fillRectAlpha(frameBuf, 720, 390, 440, 3, 34, 224, 107, 0.85);
    } else if (t >= 12.2 && t < 16.6) {
      // 4 Game Mode Glass Cards (2x2 grid)
      fillRectAlpha(frameBuf, 120, 250, 440, 110, 34, 224, 107, 0.15);
      fillRectAlpha(frameBuf, 120, 250, 440, 4, 34, 224, 107, 0.9);

      fillRectAlpha(frameBuf, 720, 250, 440, 110, 168, 85, 247, 0.15);
      fillRectAlpha(frameBuf, 720, 250, 440, 4, 168, 85, 247, 0.9);

      fillRectAlpha(frameBuf, 120, 380, 440, 110, 245, 158, 11, 0.15);
      fillRectAlpha(frameBuf, 120, 380, 440, 4, 245, 158, 11, 0.9);

      fillRectAlpha(frameBuf, 720, 380, 440, 110, 6, 182, 212, 0.18);
      fillRectAlpha(frameBuf, 720, 380, 440, 4, 34, 211, 238, 0.95);
    } else {
      // Hero / Finale central glass card backdrop
      fillRectAlpha(frameBuf, 160, 140, 960, 330, 20, 32, 48, 0.38);
      fillRectAlpha(frameBuf, 160, 140, 960, 3, 34, 224, 107, 0.75);
    }

    // 2. Draw 40-bar animated audio equalizer waveform along the bottom
    const numBars = 40;
    const totalEqWidth = 960;
    const startX = (WIDTH - totalEqWidth) / 2;
    const barW = 16;
    const gap = 8;
    const baseY = 665;

    for (let b = 0; b < numBars; b++) {
      const wave1 = Math.sin(t * 7.5 + b * 0.45) * 0.5 + 0.5;
      const wave2 = Math.cos(t * 11.2 - b * 0.3) * 0.5 + 0.5;
      const centerWeight = 1 - Math.abs((b - numBars / 2) / (numBars / 2)) * 0.55;
      const barH = Math.max(10, Math.floor((18 + wave1 * 68 + wave2 * 42) * centerWeight));

      const bx = startX + b * (barW + gap);
      const by = baseY - barH;

      // Gradient from Emerald (#22E06B) to Cyan (#22D3EE) to Purple (#C084FC)
      const ratio = b / numBars;
      const r = Math.floor(34 * (1 - ratio) + 6 * ratio);
      const g = Math.floor(224 * (1 - ratio) + 211 * ratio);
      const bl = Math.floor(107 * (1 - ratio) + 238 * ratio);

      fillRectAlpha(frameBuf, bx, by, barW, barH, r, g, bl, 0.82);
      // Specular cap on top of each equalizer bar
      fillRectAlpha(frameBuf, bx, by, barW, 3, 255, 255, 255, 0.9);
    }

    // Bottom progress timeline bar
    const progressW = Math.floor((f / TOTAL_FRAMES) * WIDTH);
    fillRectAlpha(frameBuf, 0, HEIGHT - 6, progressW, 6, 34, 224, 107, 0.95);

    const canContinue = ff.stdin.write(frameBuf);
    if (!canContinue) {
      await new Promise(resolve => ff.stdin.once('drain', resolve));
    }
  }

  ff.stdin.end();

  await new Promise((resolve, reject) => {
    ff.on('close', code => {
      if (code === 0) resolve();
      else reject(new Error(`FFmpeg exited with code ${code}: ${stderrLog.slice(-400)}`));
    });
  });

  // Clean up temporary .ass file
  if (fs.existsSync(assPath)) fs.unlinkSync(assPath);

  const stat = fs.statSync(outputMp4);
  console.log(`✅ Successfully generated ${outputMp4} (${(stat.size / (1024 * 1024)).toFixed(2)} MB)`);
}

generateVideo().catch(err => {
  console.error(err);
  process.exit(1);
});
