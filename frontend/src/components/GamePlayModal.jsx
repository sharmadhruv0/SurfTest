import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, FastForward, Check, X, Volume2, RotateCcw, Award, Share2, Copy } from 'lucide-react';
import { getEraMeta, getEraFromYear } from '../constants/eras.js';

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
  const maxAllowedTime = gameState !== 'playing' ? 30 : (STAGE_DURATIONS[currentStage] || 1);

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
      audioRef.current.currentTime = 0;
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
      if (reversedBlobUrlRef.current) {
        URL.revokeObjectURL(reversedBlobUrlRef.current);
        reversedBlobUrlRef.current = null;
      }
    };
  }, [roundData, isReversedMode, track.previewUrl]);

  // Pause audio whenever modal is closed
  useEffect(() => {
    if (!isOpen && audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      setIsPlaying(false);
      setCurrentTime(0);
    }
  }, [isOpen]);

  // Handle audio playback progress timer
  useEffect(() => {
    let timer;
    if (isPlaying) {
      timer = setInterval(() => {
        setCurrentTime((prev) => {
          if (prev >= maxAllowedTime) {
            setIsPlaying(false);
            if (audioRef.current) {
              audioRef.current.pause();
              audioRef.current.currentTime = 0;
            }
            return 0;
          }
          return Math.min(prev + 0.1, maxAllowedTime);
        });
      }, 100);
    } else {
      clearInterval(timer);
    }
    return () => clearInterval(timer);
  }, [isPlaying, maxAllowedTime]);

  const togglePlay = () => {
    if (isPlaying) {
      setIsPlaying(false);
      if (audioRef.current) audioRef.current.pause();
    } else {
      setCurrentTime(0);
      setIsPlaying(true);
      if (audioRef.current) {
        audioRef.current.currentTime = 0;
        audioRef.current.play().catch((err) => {
          console.warn('Playback error:', err);
        });
      }
    }
  };

  const handleSkip = () => {
    if (gameState !== 'playing') return;

    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
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
      audioRef.current.currentTime = 0;
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

  const filteredOptions = options.filter((opt) =>
    opt.toLowerCase().includes(guessInput.toLowerCase())
  );

  const trackEra = track.era || getEraFromYear(track.year);
  const trackEraMeta = getEraMeta(trackEra);
  const activeEraId = roundData.activeFilters?.era || trackEra;
  const activeEraMeta = getEraMeta(activeEraId);

  // When game is over in reverse mode, clicking play lets the user hear the real forward song!
  const audioPlaybackSrc = (gameState !== 'playing' && isReversedMode)
    ? (track.normalPreviewUrl || track.previewUrl)
    : activeAudioSrc;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-[#101111] border border-white/10 rounded-2xl max-w-2xl w-full p-5 sm:p-7 shadow-[0_30px_70px_rgba(0,0,0,0.9)] relative flex flex-col max-h-[92vh] overflow-y-auto">
        {/* Hidden HTML5 Audio */}
        <audio
          ref={audioRef}
          src={audioPlaybackSrc}
          preload="auto"
          onEnded={() => {
            setIsPlaying(false);
            setCurrentTime(0);
          }}
        />

        {/* Modal Top Bar with Active Mode, Era & Language Badges */}
        <div className="flex items-center justify-between pb-4 border-b border-white/8 mb-5">
          <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
            <span
              className={`w-2.5 h-2.5 rounded-full ${
                isReversedMode
                  ? 'bg-purple-400 shadow-[0_0_8px_#C084FC]'
                  : 'bg-[#22E06B] shadow-[0_0_8px_#22E06B]'
              }`}
            />
            <span className="text-xs font-mono font-bold text-[#8B8F8C] uppercase tracking-widest">
              {roundData.roundId || 'ROUND ACTIVE'}
            </span>

            {/* Mode Badge */}
            {isReversedMode ? (
              <span className="bg-purple-500/20 text-purple-300 px-2 py-0.5 rounded border border-purple-500/40 text-[10px] font-mono font-bold flex items-center gap-1">
                <span>REVERSED</span>
                <span>🔄</span>
              </span>
            ) : (
              <span className="bg-[#22E06B]/15 text-[#22E06B] px-2 py-0.5 rounded border border-[#22E06B]/30 text-[10px] font-mono font-bold">
                NORMAL ▶
              </span>
            )}

            {/* Active Era / Language badge */}
            <div className="flex items-center gap-1.5 text-[10px] font-mono font-bold">
              <span className="bg-white/10 text-[#F5F5F5] px-2 py-0.5 rounded border border-white/10 uppercase">
                {roundData.activeFilters?.language && roundData.activeFilters.language !== 'all'
                  ? roundData.activeFilters.language.toUpperCase()
                  : track.language?.toUpperCase() || 'MIXED'}
              </span>
              <span className="text-[#8B8F8C] font-normal">·</span>
              <span className={`px-2 py-0.5 rounded border ${activeEraMeta.theme.badge} uppercase`}>
                {activeEraMeta.label}
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close modal"
            className="p-1.5 rounded-full text-[#8B8F8C] hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Reverse Mode Onboarding / Active Callout Banner */}
        {isReversedMode && (
          <div className="mb-5 p-3 rounded-xl border border-purple-500/30 bg-purple-950/25 text-purple-200 text-xs flex items-center justify-between gap-3 animate-in fade-in duration-200">
            <div className="flex items-center gap-2.5">
              <RotateCcw className="w-4 h-4 text-purple-400 shrink-0" />
              <div>
                <span className="font-bold text-purple-300">Reverse Mode Active: </span>
                <span>
                  Audio plays backwards! Uncover reversed vocals, backward beats & inverted intros.
                </span>
              </div>
            </div>
            <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/40 uppercase shrink-0">
              1s → 16s
            </span>
          </div>
        )}

        {/* 6-Stage Progress Indicator Bar */}
        <div className="mb-6">
          <div className="flex items-center justify-between text-[11px] font-mono text-[#8B8F8C] uppercase mb-2">
            <span>Stage 0{currentStage + 1} / 06</span>
            <span className={isReversedMode ? 'text-purple-400 font-bold' : 'text-[#22E06B] font-bold'}>
              {STAGE_DURATIONS[currentStage]}s unlocked
            </span>
          </div>

          <div className="grid grid-cols-6 gap-1.5 h-3 bg-black/40 p-1 rounded-full border border-white/8">
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
                          ? 'bg-purple-500/60 shadow-[0_0_8px_rgba(168,85,247,0.3)]'
                          : 'bg-[#22E06B]/60 shadow-[0_0_8px_rgba(34,224,107,0.3)]'
                        : isReversedMode
                          ? 'bg-purple-500'
                          : 'bg-[#22E06B]'
                      : 'bg-white/10'
                  }`}
                >
                  {isCurrent && (
                    <div
                      className={`h-full transition-all duration-100 ${
                        isReversedMode ? 'bg-purple-400' : 'bg-[#22E06B]'
                      }`}
                      style={{
                        width: `${Math.min((currentTime / maxAllowedTime) * 100, 100)}%`
                      }}
                    />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Audio Player Card & Visualizer */}
        <div
          className={`border rounded-xl p-5 mb-6 flex flex-col sm:flex-row items-center justify-between gap-4 transition-colors ${
            isReversedMode
              ? 'bg-[#150f1a] border-purple-900/30'
              : 'bg-[#121314] border-white/8'
          }`}
        >
          <div className="flex items-center gap-4 w-full sm:w-auto">
            {/* Play/Pause Button */}
            <button
              type="button"
              onClick={togglePlay}
              aria-label={isPlaying ? 'Pause' : 'Play'}
              className={`w-14 h-14 rounded-full flex items-center justify-center transition-transform active:scale-95 cursor-pointer shrink-0 ${
                isReversedMode
                  ? 'bg-purple-600 hover:bg-purple-500 text-white shadow-[0_0_20px_rgba(168,85,247,0.4)]'
                  : 'bg-[#22E06B] hover:bg-[#2ECC71] text-[#0A0A0B] shadow-[0_0_20px_rgba(34,224,107,0.4)]'
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
              <div className="text-xs text-[#8B8F8C] font-mono mt-0.5">
                0:{currentTime < 10 ? `0${Math.floor(currentTime)}` : Math.floor(currentTime)} / 0:{maxAllowedTime < 10 ? `0${maxAllowedTime}` : maxAllowedTime}
              </div>
            </div>
          </div>

          {/* Dynamic Audio Bars Animation */}
          <div className="flex items-end gap-1 h-8 px-3">
            {[40, 70, 30, 90, 60, 100, 45, 80, 50, 65].map((val, i) => (
              <div
                key={i}
                className={`w-1 rounded-full transition-all duration-150 ${
                  isPlaying
                    ? isReversedMode ? 'bg-purple-400' : 'bg-[#22E06B]'
                    : 'bg-white/15'
                }`}
                style={{
                  height: isPlaying ? `${Math.max(15, (val * Math.random()).toFixed(0))}%` : '20%'
                }}
              />
            ))}
          </div>
        </div>

        {/* Previous Guesses List */}
        <div className="space-y-2 mb-6 min-h-[140px]">
          <div className="text-[11px] font-semibold text-[#8B8F8C] uppercase tracking-widest mb-1">
            Attempts ({guesses.length}/6)
          </div>

          {[0, 1, 2, 3, 4, 5].map((slotIdx) => {
            const guess = guesses[slotIdx];
            return (
              <div
                key={slotIdx}
                className={`w-full px-3.5 py-2 rounded-lg border text-xs font-mono flex items-center justify-between transition-all ${
                  guess
                    ? guess.status === 'correct'
                      ? 'bg-emerald-950/40 border-[#22E06B] text-[#22E06B]'
                      : guess.status === 'skipped'
                      ? 'bg-white/[0.02] border-white/10 text-[#8B8F8C]'
                      : 'bg-rose-950/30 border-rose-500/50 text-rose-300'
                    : 'bg-black/20 border-white/5 text-[#8B8F8C]/40'
                }`}
              >
                <span className="truncate">
                  {guess
                    ? `${slotIdx + 1}. ${guess.text}`
                    : `${slotIdx + 1}. —`}
                </span>
                {guess && (
                  <span className="text-[11px] font-bold">
                    {guess.status === 'correct' && <Check className="w-3.5 h-3.5" />}
                    {guess.status === 'wrong' && <X className="w-3.5 h-3.5" />}
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
            className={`p-5 sm:p-6 rounded-xl border mb-6 text-center animate-in zoom-in-95 duration-200 ${
              gameState === 'won'
                ? isReversedMode
                  ? 'bg-purple-950/40 border-purple-500 shadow-[0_0_35px_rgba(168,85,247,0.3)]'
                  : 'bg-emerald-950/40 border-[#22E06B] shadow-[0_0_30px_rgba(34,224,107,0.2)]'
                : 'bg-rose-950/30 border-rose-500/40'
            }`}
          >
            <div className="inline-flex items-center gap-1.5 text-xs font-bold font-mono tracking-widest uppercase mb-1">
              {gameState === 'won' ? (
                <span className={isReversedMode ? 'text-purple-300 flex items-center gap-1' : 'text-[#22E06B] flex items-center gap-1'}>
                  <Award className="w-4 h-4" />
                  {isReversedMode ? 'Cracked backwards in ' : 'Solved in '}
                  {currentStage + 1} / 6 tries!
                </span>
              ) : (
                <span className="text-rose-400">Better luck next round!</span>
              )}
            </div>

            <div className="text-xl sm:text-2xl font-black text-white mt-1">
              {track.title}
            </div>
            <div className="text-sm text-[#8B8F8C] mt-1 flex items-center justify-center gap-2 flex-wrap">
              <span>{track.artist} · {track.album}</span>
              <span className="px-2 py-0.5 rounded text-[11px] font-mono font-semibold bg-white/10 text-white">
                {track.year}
              </span>
              <span className={`px-2 py-0.5 rounded text-[11px] font-mono font-bold border ${trackEraMeta.theme.badge}`}>
                {trackEraMeta.label}
              </span>
            </div>

            {/* Action Buttons: Share Result + Play Next Round */}
            <div className="mt-5 flex justify-center gap-3 flex-wrap">
              <button
                type="button"
                onClick={handleShare}
                className="bg-white/10 hover:bg-white/15 border border-white/15 text-white font-bold px-5 py-2.5 rounded-full text-xs transition-all flex items-center gap-2 cursor-pointer active:scale-95 shadow-sm"
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
                    ? 'bg-purple-600 hover:bg-purple-500 shadow-[0_0_15px_rgba(168,85,247,0.4)] text-white'
                    : 'bg-[#22E06B] hover:bg-[#2ECC71] shadow-[0_0_15px_rgba(34,224,107,0.3)] text-[#0A0A0B]'
                } font-bold px-6 py-2.5 rounded-full text-xs transition-all flex items-center gap-2 cursor-pointer active:scale-95`}
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
                className={`w-full bg-[#121314] border rounded-xl px-4 py-3 text-sm text-white placeholder-[#8B8F8C] focus:outline-none transition-colors ${
                  isReversedMode
                    ? 'border-purple-900/40 focus:border-purple-500'
                    : 'border-white/10 focus:border-[#22E06B]'
                }`}
              />

              {/* Suggestions Dropdown */}
              {showSuggestions && guessInput && filteredOptions.length > 0 && (
                <div className="absolute left-0 right-0 bottom-full mb-2 bg-[#17181a] border border-white/15 rounded-xl shadow-2xl max-h-48 overflow-y-auto z-20">
                  {filteredOptions.map((opt, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => handleGuess(opt)}
                      className={`w-full text-left px-4 py-2.5 text-xs text-white transition-colors border-b border-white/5 last:border-0 ${
                        isReversedMode
                          ? 'hover:bg-purple-950/30 hover:text-purple-300'
                          : 'hover:bg-[#22E06B]/15 hover:text-[#22E06B]'
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
                className="px-5 py-2.5 rounded-full border border-white/12 hover:border-white/30 text-xs font-semibold text-[#8B8F8C] hover:text-white transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <FastForward className="w-3.5 h-3.5" />
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
                    ? 'bg-purple-600 hover:bg-purple-500 text-white shadow-[0_0_15px_rgba(168,85,247,0.3)]'
                    : 'bg-[#22E06B] hover:bg-[#2ECC71] text-[#0A0A0B] shadow-[0_0_15px_rgba(34,224,107,0.3)]'
                } disabled:opacity-40 disabled:cursor-not-allowed font-bold px-6 py-2.5 rounded-full text-xs transition-all cursor-pointer`}
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
