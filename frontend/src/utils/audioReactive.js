// Real-Time Web Audio API (AnalyserNode) Multi-Color Ambient Glow & Beat-Kick Engine
// Rotates through vibrant multi-color aurora palettes on every round, turn, and track

const MULTICOLOR_PALETTES = [
  // 0: Cyber Sunset (Hot Rose, Electric Violet, Solar Amber, Cyber Cyan)
  {
    name: 'Cyber Sunset',
    c1: '244, 63, 94',
    c2: '168, 85, 247',
    c3: '245, 158, 11',
    c4: '6, 182, 212'
  },
  // 1: Tropical Aurora (Neon Emerald, Deep Cyan, Electric Indigo, Hot Pink)
  {
    name: 'Tropical Aurora',
    c1: '34, 224, 107',
    c2: '6, 182, 212',
    c3: '99, 102, 241',
    c4: '236, 72, 153'
  },
  // 2: Bollywood Festival (Marigold Gold, Crimson Berry, Royal Purple, Turquoise)
  {
    name: 'Bollywood Festival',
    c1: '251, 191, 36',
    c2: '225, 29, 72',
    c3: '147, 51, 234',
    c4: '20, 184, 166'
  },
  // 3: Cosmic Supernova (Hyper Blue, Neon Fuchsia, Sunset Coral, Lime Glow)
  {
    name: 'Cosmic Supernova',
    c1: '59, 130, 246',
    c2: '217, 70, 239',
    c3: '249, 115, 22',
    c4: '132, 204, 22'
  },
  // 4: Desi Synthwave (Neon Pink, Tangerine Flame, Electric Cyan, Ultraviolet)
  {
    name: 'Desi Synthwave',
    c1: '236, 72, 153',
    c2: '249, 115, 22',
    c3: '34, 211, 238',
    c4: '124, 58, 237'
  },
  // 5: Peacock Iridescence (Peacock Teal, Royal Sapphire, Magenta Orchid, Gold Spark)
  {
    name: 'Peacock Iridescence',
    c1: '6, 182, 212',
    c2: '79, 70, 229',
    c3: '232, 121, 249',
    c4: '234, 179, 8'
  },
  // 6: Midnight Prism (Ruby Red, Amber Flame, Emerald Mint, Violet Glow)
  {
    name: 'Midnight Prism',
    c1: '239, 68, 68',
    c2: '245, 158, 11',
    c3: '16, 185, 129',
    c4: '139, 92, 246'
  },
  // 7: Volcano & Glacier (Fiery Orange, Rose Pink, Glacial Sky, Neon Green)
  {
    name: 'Volcano & Glacier',
    c1: '251, 146, 60',
    c2: '244, 114, 182',
    c3: '56, 189, 248',
    c4: '74, 222, 128'
  }
];

let currentPaletteIndex = -1;
let lastTrackSrcForPalette = null;

/**
 * Cycles to a new multi-color ambient palette (guaranteed different from the previous one)
 * and applies its 4 RGB color stops to :root CSS custom properties.
 */
export function cycleAmbientPalette() {
  if (typeof document === 'undefined') return null;

  let nextIdx = Math.floor(Math.random() * MULTICOLOR_PALETTES.length);
  if ( nextIdx === currentPaletteIndex ) {
    nextIdx = (currentPaletteIndex + 1 + Math.floor(Math.random() * (MULTICOLOR_PALETTES.length - 1))) % MULTICOLOR_PALETTES.length;
  }
  currentPaletteIndex = nextIdx;

  const palette = MULTICOLOR_PALETTES[currentPaletteIndex];
  const root = document.documentElement;
  root.style.setProperty('--glow-c1', palette.c1);
  root.style.setProperty('--glow-c2', palette.c2);
  root.style.setProperty('--glow-c3', palette.c3);
  root.style.setProperty('--glow-c4', palette.c4);
  return palette;
}

// Initialize a random multi-color palette on module load
if (typeof document !== 'undefined') {
  cycleAmbientPalette();
}

let sharedAudioCtx = null;
let sharedAnalyser = null;
let silentSinkGain = null;
let freqDataArray = null;

// Cache decoded AudioBuffers by URL so multi-stage replays are instant (0ms)
const decodedBufferCache = new Map();
const pendingDecodes = new Map();

let activeAudioEl = null;
let activeBufferSource = null;
let activeBufferUrl = null;
let activeBuffer = null;
let bufferStartCtxTime = 0;
let bufferStartOffset = 0;
let analyserHasSignal = false;

let rafId = null;
let smoothedBass = 0;
let smoothedMid = 0;
let rollingBassAvg = 0.22;
let beatPulse = 0;
let hueShiftDeg = 0;

function getOrCreateAudioGraph() {
  if (typeof window === 'undefined') return null;
  if (!sharedAudioCtx) {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return null;
    sharedAudioCtx = new AudioCtx();
    sharedAnalyser = sharedAudioCtx.createAnalyser();
    // fftSize 1024 gives ~43Hz resolution per bin to isolate sub-bass & kick drums (40-170Hz)
    sharedAnalyser.fftSize = 1024;
    sharedAnalyser.smoothingTimeConstant = 0.68;

    // Zero-gain sink ensures WebKit/Blink/Gecko always pull real-time frames through AnalyserNode
    // without hijacking or muting the native HTMLAudioElement output
    silentSinkGain = sharedAudioCtx.createGain();
    silentSinkGain.gain.value = 0;
    sharedAnalyser.connect(silentSinkGain);
    silentSinkGain.connect(sharedAudioCtx.destination);

    freqDataArray = new Uint8Array(sharedAnalyser.frequencyBinCount);
  }
  return { audioCtx: sharedAudioCtx, analyser: sharedAnalyser };
}

function stopActiveBufferSource() {
  if (activeBufferSource) {
    try {
      activeBufferSource.stop();
    } catch {}
    try {
      activeBufferSource.disconnect();
    } catch {}
    activeBufferSource = null;
  }
  analyserHasSignal = false;
}

function startSyncedBufferSource(audioBuffer, offsetSec = 0) {
  const graph = getOrCreateAudioGraph();
  if (!graph || !audioBuffer) return;
  const { audioCtx, analyser } = graph;

  stopActiveBufferSource();

  try {
    const source = audioCtx.createBufferSource();
    source.buffer = audioBuffer;
    const safeOffset = Math.max(0, Math.min(offsetSec || 0, Math.max(0, audioBuffer.duration - 0.05)));
    source.connect(analyser);
    source.start(0, safeOffset);

    activeBufferSource = source;
    activeBuffer = audioBuffer;
    bufferStartCtxTime = audioCtx.currentTime;
    bufferStartOffset = safeOffset;
    analyserHasSignal = true;
  } catch {
    analyserHasSignal = false;
  }
}

async function loadAndSyncAudioBuffer(url, audioEl) {
  if (!url) return;
  const graph = getOrCreateAudioGraph();
  if (!graph) return;
  const { audioCtx } = graph;

  if (decodedBufferCache.has(url)) {
    const cached = decodedBufferCache.get(url);
    if (activeAudioEl === audioEl && !audioEl.paused) {
      activeBufferUrl = url;
      startSyncedBufferSource(cached, audioEl.currentTime || 0);
    }
    return;
  }

  if (pendingDecodes.has(url)) {
    try {
      const buf = await pendingDecodes.get(url);
      if (buf && activeAudioEl === audioEl && !audioEl.paused) {
        activeBufferUrl = url;
        startSyncedBufferSource(buf, audioEl.currentTime || 0);
      }
    } catch {}
    return;
  }

  const decodePromise = (async () => {
    try {
      const res = await fetch(url);
      if (!res.ok) return null;
      const arr = await res.arrayBuffer();
      const decoded = await audioCtx.decodeAudioData(arr);
      if (decodedBufferCache.size > 24) {
        const firstKey = decodedBufferCache.keys().next().value;
        decodedBufferCache.delete(firstKey);
      }
      decodedBufferCache.set(url, decoded);
      return decoded;
    } catch {
      return null;
    } finally {
      pendingDecodes.delete(url);
    }
  })();

  pendingDecodes.set(url, decodePromise);
  const buffer = await decodePromise;
  if (buffer && activeAudioEl === audioEl && !audioEl.paused) {
    activeBufferUrl = url;
    startSyncedBufferSource(buffer, audioEl.currentTime || 0);
  }
}

function setRootGlowVars(scale, opacity, spreadPx, beatFlash, hueShift, barHeights = null) {
  if (typeof document === 'undefined') return;
  const root = document.documentElement;
  root.setAttribute('data-audio-playing', 'true');
  root.style.setProperty('--audio-kick-scale', scale.toFixed(3));
  root.style.setProperty('--audio-kick-opacity', opacity.toFixed(3));
  root.style.setProperty('--audio-glow-spread', `${spreadPx.toFixed(1)}px`);
  root.style.setProperty('--audio-beat-flash', beatFlash.toFixed(3));
  root.style.setProperty('--audio-hue-shift', `${hueShift.toFixed(1)}deg`);

  if (barHeights) {
    const bars = document.querySelectorAll('[data-audio-bar]');
    for (let i = 0; i < bars.length; i++) {
      const h = barHeights[i % barHeights.length] ?? 0.25;
      bars[i].style.transform = `scaleY(${h.toFixed(2)})`;
    }
  }
}

function resetRootGlowVars() {
  if (typeof document === 'undefined') return;
  const root = document.documentElement;
  root.removeAttribute('data-audio-playing');
  root.style.setProperty('--audio-kick-scale', '0.96');
  root.style.setProperty('--audio-kick-opacity', '0.32');
  root.style.setProperty('--audio-glow-spread', '0px');
  root.style.setProperty('--audio-beat-flash', '0');
  root.style.setProperty('--audio-hue-shift', '0deg');

  const bars = document.querySelectorAll('[data-audio-bar]');
  for (let i = 0; i < bars.length; i++) {
    bars[i].style.transform = 'scaleY(0.22)';
  }
}

function tickAudioReactive() {
  if (!activeAudioEl || activeAudioEl.paused || activeAudioEl.ended) {
    stopAudioReactiveGlow();
    return;
  }

  // Keep decoded buffer source tightly synced with HTMLAudioElement across seeks and loops
  const currentSrc = activeAudioEl.currentSrc || activeAudioEl.src;
  if (currentSrc && currentSrc !== activeBufferUrl) {
    activeBufferUrl = currentSrc;
    loadAndSyncAudioBuffer(currentSrc, activeAudioEl);
  } else if (analyserHasSignal && activeBuffer && sharedAudioCtx) {
    const expectedTime = bufferStartOffset + (sharedAudioCtx.currentTime - bufferStartCtxTime);
    const actualTime = activeAudioEl.currentTime || 0;
    if (Math.abs(actualTime - expectedTime) > 0.18) {
      startSyncedBufferSource(activeBuffer, actualTime);
    }
  }

  let bassNorm = 0;
  let midNorm = 0;
  const barValues = new Array(10).fill(0.22);

  if (analyserHasSignal && sharedAnalyser && freqDataArray) {
    sharedAnalyser.getByteFrequencyData(freqDataArray);

    // Sub-bass & Kick drum fundamental energy (bins 1..5 -> ~43Hz to 215Hz)
    let subBassSum = 0;
    for (let i = 1; i <= 5; i++) {
      subBassSum += freqDataArray[i];
    }
    // Upper bass / snare body (bins 6..10 -> ~250Hz to 430Hz)
    let punchSum = 0;
    for (let i = 6; i <= 10; i++) {
      punchSum += freqDataArray[i];
    }
    bassNorm = (subBassSum / (5 * 255)) * 0.72 + (punchSum / (5 * 255)) * 0.28;

    // Midrange / Vocal / Synth presence (bins 11..65 -> ~470Hz to 2800Hz)
    let midSum = 0;
    for (let i = 11; i <= 65; i++) {
      midSum += freqDataArray[i];
    }
    midNorm = midSum / (55 * 255);

    // Compute 10 equalizer bar heights across logarithmic-like frequency bands
    const bandBins = [2, 4, 7, 11, 16, 23, 32, 44, 60, 82];
    for (let b = 0; b < 10; b++) {
      const binIdx = bandBins[b];
      const val = (freqDataArray[binIdx] + freqDataArray[binIdx + 1]) / (2 * 255);
      barValues[b] = Math.max(0.2, Math.min(1, 0.18 + val * 0.96));
    }
  }

  // Rhythmic beat-synced fallback while buffer decodes or if stream bytes are silent
  if (bassNorm < 0.015 && midNorm < 0.015) {
    const t = activeAudioEl.currentTime || performance.now() / 1000;
    const primaryKick = Math.pow(Math.max(0, Math.sin(t * Math.PI * 4.15)), 6);
    const syncopatedBeat = Math.pow(Math.max(0, Math.sin(t * Math.PI * 2.075 + 0.85)), 8) * 0.55;
    const kickEnv = Math.min(1, primaryKick + syncopatedBeat);
    const melodyWave = 0.5 + 0.5 * Math.sin(t * 2.6);

    bassNorm = 0.34 + kickEnv * 0.58;
    midNorm = 0.28 + melodyWave * 0.38;

    for (let b = 0; b < 10; b++) {
      const wave = 0.5 + 0.5 * Math.sin(t * 6.8 + b * 0.65);
      barValues[b] = Math.max(0.22, Math.min(1, 0.22 + kickEnv * 0.48 + wave * 0.38));
    }
  }

  // Dynamic Onset / Kick Detector: compare instantaneous bass against rolling average
  const onsetDelta = Math.max(0, bassNorm - rollingBassAvg * 1.06);
  rollingBassAvg = rollingBassAvg * 0.93 + bassNorm * 0.07;

  // Fast attack on drum hits, smooth exponential decay between beats
  const targetBeat = Math.min(1, onsetDelta * 3.2 + Math.pow(bassNorm, 1.6) * 0.65);
  beatPulse = targetBeat > beatPulse
    ? beatPulse * 0.25 + targetBeat * 0.75
    : beatPulse * 0.84 + targetBeat * 0.16;

  smoothedBass = bassNorm > smoothedBass
    ? smoothedBass * 0.32 + bassNorm * 0.68
    : smoothedBass * 0.82 + bassNorm * 0.18;

  smoothedMid = midNorm > smoothedMid
    ? smoothedMid * 0.4 + midNorm * 0.6
    : smoothedMid * 0.85 + midNorm * 0.15;

  // Continuous color-wheel drift accelerated by kicks & beats
  hueShiftDeg = (hueShiftDeg + 0.45 + beatPulse * 2.4 + smoothedMid * 0.6) % 360;

  // Ambient breathing baseline + punchy radial expansion on every kick/beat
  const scale = 1.08 + smoothedBass * 0.26 + beatPulse * 0.35 + smoothedMid * 0.1;
  const opacity = Math.min(0.98, 0.52 + smoothedBass * 0.26 + beatPulse * 0.28 + smoothedMid * 0.08);
  const spreadPx = 24 + smoothedBass * 30 + beatPulse * 44;
  const beatFlash = Math.min(1, beatPulse * 1.15);

  setRootGlowVars(scale, opacity, spreadPx, beatFlash, hueShiftDeg, barValues);
  rafId = requestAnimationFrame(tickAudioReactive);
}

/**
 * Connect an HTMLAudioElement to the Web Audio API AnalyserNode and start the 60fps multi-color ambient glow loop.
 */
export function startAudioReactiveGlow(audioEl) {
  if (!audioEl) return;
  activeAudioEl = audioEl;

  const src = audioEl.currentSrc || audioEl.src;
  // Whenever a different track plays, automatically switch to a fresh multi-color palette
  if (src && src !== lastTrackSrcForPalette) {
    lastTrackSrcForPalette = src;
    cycleAmbientPalette();
  }

  const graph = getOrCreateAudioGraph();
  if (graph && graph.audioCtx.state === 'suspended') {
    graph.audioCtx.resume().catch(() => {});
  }

  if (src) {
    activeBufferUrl = src;
    loadAndSyncAudioBuffer(src, audioEl);
  }

  if (rafId) cancelAnimationFrame(rafId);
  rafId = requestAnimationFrame(tickAudioReactive);
}

/**
 * Stop the ambient glow loop and smoothly return the backlight to resting ambient state.
 */
export function stopAudioReactiveGlow() {
  if (rafId) {
    cancelAnimationFrame(rafId);
    rafId = null;
  }
  stopActiveBufferSource();
  activeAudioEl = null;
  activeBufferUrl = null;
  activeBuffer = null;
  smoothedBass = 0;
  smoothedMid = 0;
  beatPulse = 0;
  resetRootGlowVars();
}
