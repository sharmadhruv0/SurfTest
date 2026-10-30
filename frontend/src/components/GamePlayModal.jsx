import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Play, Pause, FastForward, Check, X, Volume2, RotateCcw, Award, Share2, Copy } from 'lucide-react';
import { getEraMeta, getEraFromYear } from '../constants/eras.js';
import { startAudioReactiveGlow, stopAudioReactiveGlow, cycleAmbientPalette } from '../utils/audioReactive.js';

const STAGE_DURATIONS = [1, 2, 4, 7, 11, 16]; // seconds unlocked at each stage
const TOTAL_DURATION = 16; // 16s total

/**
 * Helper: Encodes an AudioBuffer into an uncompressed 16-bit PCM WAV Blob
 */
function audioBufferToWav(buffer) {
  const numOfChan = buffer.numberOfChannels;
  const length = buffer.length * numOfChan * 2 + 44;
  const out = new DataView(new ArrayBuffer(length));
  const channels = [];
  const sampleRate = buffer.sampleRate;
  let offset = 0;
  let pos = 0;

  const setUint16 = (data) => {
    out.setUint16(pos, data, true);
    pos += 2;
  };
  const setUint32 = (data) => {
    out.setUint32(pos, data, true);
    pos += 4;
  };

  setUint32(0x46464952); // "RIFF"
  setUint32(length - 8); // file length - 8
  setUint32(0x45564157); // "WAVE"

  setUint32(0x20746d66); // "fmt " chunk
  setUint32(16); // length = 16
  setUint16(1); // PCM
  setUint16(numOfChan);
  setUint32(sampleRate);
  setUint32(sampleRate * 2 * numOfChan);
  setUint16(numOfChan * 2);
  setUint16(16);

  setUint32(0x61746164); // "data" chunk
  setUint32(length - pos - 4);

  for (let i = 0; i < numOfChan; i++) {
    channels.push(buffer.getChannelData(i));
  }

  while (offset < buffer.length) {
    for (let i = 0; i < numOfChan; i++) {
      let sample = Math.max(-1, Math.min(1, channels[i][offset]));
      sample = (0.5 + sample < 0 ? sample * 32768 : sample * 32767) | 0;
      out.setInt16(pos, sample, true);
      pos += 2;
    }
    offset++;
  }

  return new Blob([out.buffer], { type: 'audio/wav' });
}

export default function GamePlayModal({
  isOpen,
  onClose,
  roundData,
  onRecordResult,
  onPlayNext
}) {
  if (!isOpen || !roundData || !roundData.track) return null;

  const { track, options = [] } = roundData;
  const isReversedMode = Boolean(roundData.isReversed || roundData.mode === 'reverse');

  const [currentStage, setCurrentStage] = useState(0); // 0 to 5
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [guessInput, setGuessInput] = useState('');
  const [guesses, setGuesses] = useState([]); // Array of { text, status: 'skipped' | 'wrong' | 'correct' }
  const [gameState, setGameState] = useState('playing'); // 'playing' | 'won' | 'lost'
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [copiedShare, setCopiedShare] = useState(false);

  // Audio source handling: local pre-reversed file or Web Audio API reversal fallback
  const [activeAudioSrc, setActiveAudioSrc] = useState(track.previewUrl);
  const reversedBlobUrlRef = useRef(null);
  const audioRef = useRef(null);
  const progressBarRef = useRef(null);
  const startOffset = Number(track.hookStartSeconds ?? track.startOffset ?? 10) || 10;
  const maxAllowedTime = gameState !== 'playing' ? Math.max(16, 30 - startOffset) : (STAGE_DURATIONS[currentStage] || 1);

  const seekToStartOffset = (audioEl) => {
    const audio = audioEl || audioRef.current;
    if (!audio) return;
    try {
      if (Number.isFinite(audio.duration) && audio.duration > 0) {
        const safeOffset = Math.min(startOffset, Math.max(0, audio.duration - 16));
        audio.currentTime = safeOffset;
      } else {
        audio.currentTime = startOffset;
      }
    } catch {
      // Will be applied in onLoadedMetadata once stream metadata is ready
    }
  };

  // Switch to a fresh multi-color ambient palette on every new round AND every stage/turn
  useEffect(() => {
    if (isOpen) {
      cycleAmbientPalette();
    }
  }, [isOpen, roundData, currentStage]);

  // When round changes or opens, set up audio
  useEffect(() => {
    setCurrentStage(0);
    setIsPlaying(false);
    setCurrentTime(0);
    setGuessInput('');
    setGuesses([]);
    setGameState('playing');
    setCopiedShare(false);

    if (audioRef.current) {
      audioRef.current.pause();
      seekToStartOffset(audioRef.current);
    }

    // Clean up previous reversed blob URL
    if (reversedBlobUrlRef.current) {
      URL.revokeObjectURL(reversedBlobUrlRef.current);
      reversedBlobUrlRef.current = null;
    }

    const preview = track.previewUrl;

    // If Normal mode or already pre-reversed (e.g. /audio/reversed/...), use directly
    if (!isReversedMode || preview.includes('/audio/reversed/')) {
      setActiveAudioSrc(preview);
      return;
    }

    // If reverse mode and using a remote forward CDN preview, reverse audio in client buffer
    let isCancelled = false;
    const reverseClientAudio = async () => {
      try {
        const response = await fetch(preview);
        if (!response.ok) throw new Error('Remote audio fetch failed');
        const arrayBuf = await response.arrayBuffer();

        const AudioContextClass = window.AudioContext || window.webkitAudioContext;
        const ctx = new AudioContextClass();
        const decoded = await ctx.decodeAudioData(arrayBuf);

        // Reverse each channel
        for (let ch = 0; ch < decoded.numberOfChannels; ch++) {
          Array.prototype.reverse.call(decoded.getChannelData(ch));
        }

        const wavBlob = audioBufferToWav(decoded);
        const blobUrl = URL.createObjectURL(wavBlob);
        reversedBlobUrlRef.current = blobUrl;

        if (!isCancelled) {
          setActiveAudioSrc(blobUrl);
        }
      } catch (err) {
        console.warn('Web Audio reversal fallback error, using original preview:', err);
        if (!isCancelled) {
          setActiveAudioSrc(preview);
        }
      }
    };

    reverseClientAudio();

    return () => {
      isCancelled = true;
      stopAudioReactiveGlow();
      if (reversedBlobUrlRef.current) {
        URL.revokeObjectURL(reversedBlobUrlRef.current);
        reversedBlobUrlRef.current = null;
      }
    };
  }, [roundData, isReversedMode, track.previewUrl, startOffset]);

  // Pause audio whenever modal is closed
  useEffect(() => {
    if (!isOpen && audioRef.current) {
      audioRef.current.pause();
      stopAudioReactiveGlow();
      seekToStartOffset(audioRef.current);
      setIsPlaying(false);
      setCurrentTime(0);
    }
  }, [isOpen, startOffset]);

  // Handle audio playback progress synced with actual audio element currentTime from startOffset
  useEffect(() => {
    let timer;
    if (isPlaying) {
      timer = setInterval(() => {
        const audio = audioRef.current;
        if (!audio) return;
        if (audio.paused || audio.seeking || audio.readyState < 2) return;

        const effectiveStart =
          Number.isFinite(audio.duration) && audio.duration > 0
            ? Math.min(startOffset, Math.max(0, audio.duration - 16))
            : startOffset;

        // If browser started at 0 before metadata seek took effect, jump to effectiveStart now
        if (audio.currentTime < effectiveStart - 0.25) {
          audio.currentTime = effectiveStart;
          return;
        }

        const elapsed = Math.max(0, audio.currentTime - effectiveStart);
        if (elapsed >= maxAllowedTime) {
          audio.pause();
          seekToStartOffset(audio);
          if (progressBarRef.current) {
            progressBarRef.current.style.width = '0%';
          }
          setIsPlaying(false);
          setCurrentTime(0);
        } else {
          if (progressBarRef.current) {
            progressBarRef.current.style.width = `${Math.min((elapsed / maxAllowedTime) * 100, 100)}%`;
          }
          const wholeSec = Math.floor(elapsed);
          setCurrentTime((prev) => (prev === wholeSec ? prev : wholeSec));
        }
      }, 60);
    } else {
      if (progressBarRef.current) {
        progressBarRef.current.style.width = '0%';
      }
      clearInterval(timer);
    }
    return () => clearInterval(timer);
  }, [isPlaying, maxAllowedTime, startOffset]);

  const togglePlay = () => {
    if (isPlaying) {
      setIsPlaying(false);
      if (audioRef.current) audioRef.current.pause();
    } else {
      setCurrentTime(0);
      setIsPlaying(true);
      if (audioRef.current) {
        seekToStartOffset(audioRef.current);
        audioRef.current.play().catch((err) => {
          console.warn('Playback error:', err);
          setIsPlaying(false);
        });
      }
    }
  };

  const handleSkip = () => {
    if (gameState !== 'playing') return;

    if (audioRef.current) {
      audioRef.current.pause();
      seekToStartOffset(audioRef.current);
    }

    const newGuesses = [...guesses, { text: 'Skipped', status: 'skipped' }];
    setGuesses(newGuesses);

    if (currentStage >= 5) {
      setGameState('lost');
      setIsPlaying(false);
      onRecordResult(false, 6);
    } else {
      setCurrentStage((prev) => prev + 1);
      setCurrentTime(0);
      setIsPlaying(false);
    }
  };

  const handleGuess = (songTitle) => {
    if (gameState !== 'playing' || !songTitle.trim()) return;

    if (audioRef.current) {
      audioRef.current.pause();
      seekToStartOffset(audioRef.current);
    }

    const target = `${track.title} - ${track.artist}`.toLowerCase();
    const cleanGuess = songTitle.toLowerCase().trim();
    const isCorrect =
      cleanGuess.includes(track.title.toLowerCase()) ||
      target.includes(cleanGuess);

    if (isCorrect) {
      const newGuesses = [...guesses, { text: songTitle, status: 'correct' }];
      setGuesses(newGuesses);
      setGameState('won');
      setIsPlaying(false);
      onRecordResult(true, currentStage + 1);
    } else {
      const newGuesses = [...guesses, { text: songTitle, status: 'wrong' }];
      setGuesses(newGuesses);

      if (currentStage >= 5) {
        setGameState('lost');
        setIsPlaying(false);
        onRecordResult(false, 6);
      } else {
        setCurrentStage((prev) => prev + 1);
        setCurrentTime(0);
        setIsPlaying(false);
      }
    }

    setGuessInput('');
    setShowSuggestions(false);
  };

  // Mode-aware share button handler
  const handleShare = () => {
    const modeHeader = isReversedMode ? 'Surftest 🔄 REVERSED' : 'Surftest 🎵';
    const langLabel = track.language ? track.language.toUpperCase() : 'DESI';
    const eraLabel = trackEraMeta.label;
    const resultText = gameState === 'won' ? `Solved in ${currentStage + 1}/6 tries!` : 'X/6 tries';

    const stageBoxes = [0, 1, 2, 3, 4, 5].map((idx) => {
      const g = guesses[idx];
      if (!g) return '⬜';
      if (g.status === 'correct') return '🟩';
      if (g.status === 'wrong') return '🟥';
      return '⬛';
    }).join('');

    const textLines = [
      `${modeHeader} (${langLabel} · ${eraLabel})`,
      isReversedMode ? '“Can you un-hear this?” ⏪🧠' : '',
      resultText,
      stageBoxes,
      'https://surftest.vercel.app'
    ].filter(Boolean).join('\n');

    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(textLines).then(() => {
        setCopiedShare(true);
        setTimeout(() => setCopiedShare(false), 2500);
      }).catch(() => {});
    }
  };

  const filteredOptions = useMemo(() => {
    const q = guessInput.trim().toLowerCase();
    if (!q) return [];
    const matches = [];
    for (let i = 0; i < options.length; i++) {
      if (options[i].toLowerCase().includes(q)) {
        matches.push(options[i]);
        if (matches.length >= 8) break;
      }
    }
    return matches;
  }, [options, guessInput]);

  const trackEra = track.era || getEraFromYear(track.year);
  const trackEraMeta = getEraMeta(trackEra);
  const activeEraId = roundData.activeFilters?.era || trackEra;
  const activeEraMeta = getEraMeta(activeEraId);

  // When game is over in reverse mode, clicking play lets the user hear the real forward song!
  const audioPlaybackSrc = (gameState !== 'playing' && isReversedMode)
    ? (track.normalPreviewUrl || track.previewUrl)
    : activeAudioSrc;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-xl animate-in fade-in duration-200">
      {/* Centered Audio-Reactive Cyan/Green Ambient Backlight behind Modal */}
      <div
        className={`audio-reactive-backlight ${
          isReversedMode ? 'audio-reactive-backlight-reverse' : ''
        }`}
      />

      <div
        className={`liquid-modal-window rounded-3xl max-w-2xl w-full p-6 sm:p-8 relative z-10 flex flex-col max-h-[92vh] overflow-y-auto overflow-x-hidden transition-shadow duration-75 ${
          isReversedMode ? 'audio-reactive-surface-reverse' : 'audio-reactive-surface'
        }`}
      >
        {/* Specular Highlight Rim */}
        <div className="liquid-specular-rim" />

        {/* Hidden HTML5 Audio */}
        <audio
          ref={audioRef}
          src={audioPlaybackSrc}
          preload="auto"
          onPlay={(e) => startAudioReactiveGlow(e.currentTarget)}
          onPause={() => stopAudioReactiveGlow()}
          onLoadedMetadata={(e) => {
            seekToStartOffset(e.currentTarget);
          }}
          onEnded={() => {
            stopAudioReactiveGlow();
            setIsPlaying(false);
            setCurrentTime(0);
            seekToStartOffset(audioRef.current);
          }}
        />

        {/* Modal Top Bar with Active Mode, Era & Language Badges */}
        <div className="flex items-center justify-between pb-4 border-b border-white/[0.08] mb-5">
          <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
            <span
              className={`w-2.5 h-2.5 rounded-full ${
                isReversedMode
                  ? 'bg-purple-400 shadow-[0_0_10px_#C084FC]'
                  : 'bg-[#22E06B] shadow-[0_0_10px_#22E06B]'
              }`}
            />
            <span className="text-xs font-mono font-bold text-slate-300 uppercase tracking-widest">
              {roundData.roundId || 'ROUND ACTIVE'}
            </span>

            {/* Mode Badge */}
            {isReversedMode ? (
              <span className="liquid-pill bg-purple-500/20 text-purple-200 px-2.5 py-0.5 rounded-full border-purple-500/40 text-[10px] font-mono font-bold flex items-center gap-1 shadow-[0_0_10px_rgba(168,85,247,0.25)]">
                <span>REVERSED</span>
                <span>🔄</span>
              </span>
            ) : (
              <span className="liquid-pill bg-[#22E06B]/20 text-[#22E06B] px-2.5 py-0.5 rounded-full border-[#22E06B]/35 text-[10px] font-mono font-bold shadow-[0_0_10px_rgba(34,224,107,0.25)]">
                NORMAL ▶
              </span>
            )}

            {/* Active Era / Language badge */}
            <div className="flex items-center gap-1.5 text-[10px] font-mono font-bold">
              <span className="liquid-pill px-2.5 py-0.5 rounded-full text-white uppercase">
                {roundData.activeFilters?.language && roundData.activeFilters.language !== 'all'
                  ? roundData.activeFilters.language.toUpperCase()
                  : track.language?.toUpperCase() || 'MIXED'}
              </span>
              <span className="text-slate-400 font-normal">·</span>
              <span className={`px-2.5 py-0.5 rounded-full border backdrop-blur-md ${activeEraMeta.theme.badge} uppercase`}>
                {activeEraMeta.label}
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close modal"
            className="liquid-btn-ghost p-1.5 rounded-full text-slate-400 hover:text-white cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Reverse Mode Onboarding / Active Callout Banner */}
        {isReversedMode && (
          <div className="mb-5 p-3.5 rounded-2xl border border-purple-400/40 bg-gradient-to-r from-purple-900/30 via-indigo-950/20 to-purple-950/20 backdrop-blur-xl text-purple-200 text-xs flex items-center justify-between gap-3 animate-in fade-in duration-200 shadow-[0_8px_20px_rgba(168,85,247,0.18)]">
            <div className="flex items-center gap-2.5">
              <RotateCcw className="w-4 h-4 text-purple-300 shrink-0" />
              <div>
                <span className="font-bold text-purple-200">Reverse Mode Active: </span>
                <span className="text-purple-200/90">
                  Audio plays backwards! Uncover reversed vocals, backward beats & inverted intros.
                </span>
              </div>
            </div>
            <span className="text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full bg-purple-500/30 text-purple-200 border border-purple-400/50 uppercase shrink-0">
              1s → 16s
            </span>
          </div>
        )}

        {/* 6-Stage Progress Indicator Bar */}
        <div className="mb-6">
          <div className="flex items-center justify-between text-[11px] font-mono text-slate-300 uppercase mb-2">
            <span>Stage 0{currentStage + 1} / 06</span>
            <span className={isReversedMode ? 'text-purple-300 font-bold' : 'text-[#22E06B] font-bold'}>
              {STAGE_DURATIONS[currentStage]}s unlocked
            </span>
          </div>

          <div className="grid grid-cols-6 gap-1.5 h-3.5 p-1 rounded-full liquid-pill border-white/[0.08]">
            {STAGE_DURATIONS.map((dur, idx) => {
              const isUnlocked = idx <= currentStage;
              const isCurrent = idx === currentStage;
              return (
                <div
                  key={idx}
                  className={`h-full rounded-full transition-all duration-300 relative overflow-hidden ${
                    isUnlocked
                      ? isCurrent
                        ? isReversedMode
                          ? 'bg-purple-500/60 shadow-[0_0_10px_rgba(168,85,247,0.4)]'
                          : 'bg-[#22E06B]/60 shadow-[0_0_10px_rgba(34,224,107,0.4)]'
                        : isReversedMode
                          ? 'bg-gradient-to-r from-purple-500 to-indigo-500 shadow-sm'
                          : 'bg-gradient-to-r from-[#22E06B] to-[#1cb857] shadow-sm'
                      : 'bg-white/10'
                  }`}
                >
                  {isCurrent && (
                    <div
                      ref={progressBarRef}
                      className={`h-full transition-[width] duration-75 ${
                        isReversedMode ? 'bg-purple-300' : 'bg-[#3bf487]'
                      }`}
                      style={{ width: '0%' }}
                    />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Audio Player Card & Visualizer with Audio-Reactive Halo */}
        <div
          className={`liquid-card rounded-2xl p-5 mb-6 flex flex-col sm:flex-row items-center justify-between gap-4 transition-all ${
            isReversedMode
              ? `border-purple-500/40 ${isPlaying ? 'audio-reactive-card-halo-reverse' : ''}`
              : `border-[#22E06B]/35 ${isPlaying ? 'audio-reactive-card-halo' : ''}`
          }`}
        >
          <div className="flex items-center gap-4 w-full sm:w-auto">
            {/* Play/Pause Button */}
            <button
              type="button"
              onClick={togglePlay}
              aria-label={isPlaying ? 'Pause' : 'Play'}
              className={`w-14 h-14 rounded-full flex items-center justify-center transition-transform active:scale-95 cursor-pointer shrink-0 shadow-lg ${
                isReversedMode
                  ? 'liquid-btn-purple'
                  : 'liquid-btn-brand'
              }`}
            >
              {isPlaying ? (
                <Pause className="w-6 h-6 fill-current" />
              ) : (
                <Play className="w-6 h-6 fill-current translate-x-0.5" />
              )}
            </button>

            <div>
              <div className="text-sm font-bold text-white flex items-center gap-1.5">
                {isPlaying ? (
                  gameState !== 'playing' ? (
                    'Playing revealed track (forward)...'
                  ) : (
                    <span>
                      {isReversedMode ? 'Playing backwards clip... 🔄' : 'Playing intro clip...'}
                    </span>
                  )
                ) : (
                  gameState !== 'playing' ? (
                    'Listen to full revealed song (forward)'
                  ) : (
                    <span>
                      {isReversedMode ? 'Listen to reversed preview' : 'Listen to preview'}
                    </span>
                  )
                )}
              </div>
              <div className="text-xs text-slate-400 font-mono mt-0.5">
                0:{currentTime < 10 ? `0${Math.floor(currentTime)}` : Math.floor(currentTime)} / 0:{maxAllowedTime < 10 ? `0${maxAllowedTime}` : maxAllowedTime}
              </div>
            </div>
          </div>

          {/* Real-Time AnalyserNode Multi-Color Frequency Bars */}
          <div className="flex items-end gap-1.5 h-8 px-3">
            {[40, 70, 30, 90, 60, 100, 45, 80, 50, 65].map((val, i) => {
              const colorVar = `--glow-c${(i % 4) + 1}`;
              return (
                <div
                  key={i}
                  data-audio-bar
                  className="w-1.5 h-full rounded-full animate-eq-bar"
                  style={{
                    transform: 'scaleY(0.22)',
                    backgroundColor: isPlaying ? `rgb(var(${colorVar}))` : 'rgba(255,255,255,0.15)',
                    boxShadow: isPlaying ? `0 0 10px rgba(var(${colorVar}), 0.65)` : 'none'
                  }}
                />
              );
            })}
          </div>
        </div>

        {/* Previous Guesses List */}
        <div className="space-y-2 mb-6 min-h-[140px]">
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-1">
            Attempts ({guesses.length}/6)
          </div>

          {[0, 1, 2, 3, 4, 5].map((slotIdx) => {
            const guess = guesses[slotIdx];
            return (
              <div
                key={slotIdx}
                className={`w-full px-4 py-2.5 rounded-xl border text-xs font-mono flex items-center justify-between transition-all backdrop-blur-md ${
                  guess
                    ? guess.status === 'correct'
                      ? 'bg-emerald-950/40 border-[#22E06B]/80 text-[#22E06B] shadow-[0_0_15px_rgba(34,224,107,0.2)]'
                      : guess.status === 'skipped'
                      ? 'bg-white/[0.03] border-white/10 text-slate-400'
                      : 'bg-rose-950/40 border-rose-500/60 text-rose-300 shadow-[0_0_15px_rgba(244,63,94,0.15)]'
                    : 'bg-black/30 border-white/[0.06] text-slate-600'
                }`}
              >
                <span className="truncate">
                  {guess
                    ? `${slotIdx + 1}. ${guess.text}`
                    : `${slotIdx + 1}. —`}
                </span>
                {guess && (
                  <span className="text-[11px] font-bold">
                    {guess.status === 'correct' && <Check className="w-4 h-4 text-[#22E06B]" />}
                    {guess.status === 'wrong' && <X className="w-4 h-4 text-rose-400" />}
                    {guess.status === 'skipped' && 'SKIPPED'}
                  </span>
                )}
              </div>
            );
          })}
        </div>

        {/* Win / Loss Result Card with Mode-Aware Share Button */}
        {gameState !== 'playing' && (
          <div
            className={`p-6 sm:p-7 rounded-2xl border mb-6 text-center backdrop-blur-xl animate-in zoom-in-95 duration-200 ${
              gameState === 'won'
                ? isReversedMode
                  ? 'bg-gradient-to-b from-purple-950/60 to-purple-950/30 border-purple-400/60 shadow-[0_0_40px_rgba(168,85,247,0.35)]'
                  : 'bg-gradient-to-b from-emerald-950/60 to-emerald-950/30 border-[#22E06B]/60 shadow-[0_0_40px_rgba(34,224,107,0.3)]'
                : 'bg-gradient-to-b from-rose-950/50 to-rose-950/20 border-rose-500/50 shadow-[0_0_30px_rgba(244,63,94,0.2)]'
            }`}
          >
            <div className="inline-flex items-center gap-1.5 text-xs font-bold font-mono tracking-widest uppercase mb-1">
              {gameState === 'won' ? (
                <span className={isReversedMode ? 'text-purple-300 flex items-center gap-1.5' : 'text-[#22E06B] flex items-center gap-1.5'}>
                  <Award className="w-4 h-4" />
                  {isReversedMode ? 'Cracked backwards in ' : 'Solved in '}
                  {currentStage + 1} / 6 tries!
                </span>
              ) : (
                <span className="text-rose-400 font-bold">Better luck next round!</span>
              )}
            </div>

            <div className="text-2xl sm:text-3xl font-black text-white mt-1 drop-shadow-sm">
              {track.title}
            </div>
            <div className="text-sm text-slate-300 mt-1.5 flex items-center justify-center gap-2 flex-wrap">
              <span>{track.artist} · {track.album}</span>
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-mono font-semibold liquid-pill text-white">
                {track.year}
              </span>
              <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-mono font-bold border backdrop-blur-md ${trackEraMeta.theme.badge}`}>
                {trackEraMeta.label}
              </span>
            </div>

            {/* Action Buttons: Share Result + Play Next Round */}
            <div className="mt-6 flex justify-center gap-3.5 flex-wrap">
              <button
                type="button"
                onClick={handleShare}
                className="liquid-btn-ghost text-white font-bold px-6 py-3 rounded-full text-xs flex items-center gap-2 cursor-pointer active:scale-95 shadow-md"
              >
                {copiedShare ? (
                  <Check className="w-3.5 h-3.5 text-[#22E06B]" />
                ) : (
                  <Share2 className="w-3.5 h-3.5" />
                )}
                <span>{copiedShare ? 'Copied Result! 📋' : 'Share Result 🔗'}</span>
              </button>

              <button
                type="button"
                onClick={onPlayNext}
                className={`${
                  isReversedMode
                    ? 'liquid-btn-purple'
                    : 'liquid-btn-brand'
                } font-bold px-7 py-3 rounded-full text-xs flex items-center gap-2 cursor-pointer active:scale-95 shadow-md`}
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Play Next Round</span>
              </button>
            </div>
          </div>
        )}

        {/* Input & Action Controls (only when playing) */}
        {gameState === 'playing' && (
          <div className="space-y-3 relative">
            {/* Search / Input with Autocomplete */}
            <div className="relative">
              <input
                type="text"
                placeholder={isReversedMode ? "Guess backwards audio? Search title or artist..." : "Know the song? Search title or artist..."}
                value={guessInput}
                onChange={(e) => {
                  setGuessInput(e.target.value);
                  setShowSuggestions(true);
                }}
                onFocus={() => setShowSuggestions(true)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && guessInput) {
                    handleGuess(guessInput);
                  }
                }}
                className={`w-full liquid-glass-input rounded-2xl px-4 py-3.5 text-sm text-white placeholder-slate-400 focus:outline-none ${
                  isReversedMode
                    ? 'focus:border-purple-500 focus:shadow-[0_0_18px_rgba(168,85,247,0.35)]'
                    : ''
                }`}
              />

              {/* Suggestions Dropdown */}
              {showSuggestions && guessInput && filteredOptions.length > 0 && (
                <div className="absolute left-0 right-0 bottom-full mb-2 liquid-panel rounded-2xl shadow-2xl max-h-52 overflow-y-auto z-20 border border-white/20">
                  {filteredOptions.map((opt, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => handleGuess(opt)}
                      className={`w-full text-left px-4 py-3 text-xs text-white transition-colors border-b border-white/[0.06] last:border-0 ${
                        isReversedMode
                          ? 'hover:bg-purple-500/25 hover:text-purple-200'
                          : 'hover:bg-[#22E06B]/20 hover:text-[#22E06B]'
                      }`}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Bottom Controls Row: Skip + Guess Button */}
            <div className="flex items-center justify-between gap-3 pt-2">
              <button
                type="button"
                onClick={handleSkip}
                className="liquid-btn-ghost px-5 py-3 rounded-full text-xs font-bold text-slate-300 hover:text-white flex items-center gap-2 cursor-pointer"
              >
                <FastForward className="w-3.5 h-3.5 text-slate-400" />
                <span>
                  Skip (+{STAGE_DURATIONS[currentStage + 1] ? STAGE_DURATIONS[currentStage + 1] - STAGE_DURATIONS[currentStage] : 0}s)
                </span>
              </button>

              <button
                type="button"
                onClick={() => handleGuess(guessInput)}
                disabled={!guessInput.trim()}
                className={`${
                  isReversedMode
                    ? 'liquid-btn-purple'
                    : 'liquid-btn-brand'
                } disabled:opacity-40 disabled:cursor-not-allowed font-extrabold px-7 py-3 rounded-full text-xs cursor-pointer shadow-md`}
              >
                Submit Guess
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
