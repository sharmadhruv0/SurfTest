// Real-Time Web Audio API (AnalyserNode) Ambient Glow & Beat-Kick Engine
// Zero React re-renders: updates GPU-composited CSS custom properties at 60fps via requestAnimationFrame

let sharedAudioCtx = null;
let sharedAnalyser = null;
let silentSinkGain = null;
let freqDataArray = null;
let timeDataArray = null;

// Cache decoded AudioBuffers by URL so multi-stage replays (1s -> 2s -> 4s -> 7s -> 11s -> 16s) are instant (0ms)
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
    timeDataArray = new Uint8Array(sharedAnalyser.fftSize);
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

function setRootGlowVars(scale, opacity, spreadPx, beatFlash, barHeights = null) {
  if (typeof document === 'undefined') return;
  const root = document.documentElement;
  root.setAttribute('data-audio-playing', 'true');
  root.style.setProperty('--audio-kick-scale', scale.toFixed(3));
  root.style.setProperty('--audio-kick-opacity', opacity.toFixed(3));
  root.style.setProperty('--audio-glow-spread', `${spreadPx.toFixed(1)}px`);
  root.style.setProperty('--audio-beat-flash', beatFlash.toFixed(3));

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
  root.style.setProperty('--audio-kick-scale', '0.94');
  root.style.setProperty('--audio-kick-opacity', '0.18');
  root.style.setProperty('--audio-glow-spread', '0px');
  root.style.setProperty('--audio-beat-flash', '0');

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
    // ~124 BPM four-on-the-floor kick + syncopated dhol/desi off-beat
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

  // Ambient breathing baseline + punchy radial expansion on every kick/beat
  const scale = 1.08 + smoothedBass * 0.26 + beatPulse * 0.34 + smoothedMid * 0.1; // ~1.08 -> 1.68 on kicks
  const opacity = Math.min(0.98, 0.44 + smoothedBass * 0.3 + beatPulse * 0.32 + smoothedMid * 0.1);
  const spreadPx = 22 + smoothedBass * 28 + beatPulse * 42;
  const beatFlash = Math.min(1, beatPulse * 1.15);

  setRootGlowVars(scale, opacity, spreadPx, beatFlash, barValues);
  rafId = requestAnimationFrame(tickAudioReactive);
}

/**
 * Connect an HTMLAudioElement to the Web Audio API AnalyserNode and start the 60fps ambient glow loop.
 */
export function startAudioReactiveGlow(audioEl) {
  if (!audioEl) return;
  activeAudioEl = audioEl;

  const graph = getOrCreateAudioGraph();
  if (graph && graph.audioCtx.state === 'suspended') {
    graph.audioCtx.resume().catch(() => {});
  }

  const src = audioEl.currentSrc || audioEl.src;
  if (src) {
    activeBufferUrl = src;
    loadAndSyncAudioBuffer(src, audioEl);
  }

  if (rafId) cancelAnimationFrame(rafId);
  rafId = requestAnimationFrame(tickAudioReactive);
}

/**
 * Stop the ambient glow loop and smoothly return the backlight to resting state.
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
