import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  Zap,
  Play,
  Pause,
  SkipForward,
  Check,
  X,
  Volume2,
  Flame,
  Trophy,
  Share2,
  RotateCcw,
  Sparkles,
  Lightbulb,
  Clock
} from 'lucide-react';
import { TRACK_CATALOG, ALL_OPTIONS, getFilteredTracks } from '../data/tracks.js';
import { getEraMeta, getEraFromYear } from '../constants/eras.js';
import { startAudioReactiveGlow, stopAudioReactiveGlow } from '../utils/audioReactive.js';

const INITIAL_BLITZ_SECONDS = 60;
const BONUS_SECONDS_PER_HIT = 3;

export default function BlitzModal({
  isOpen,
  onClose,
  selectedLanguage = 'all',
  selectedEra = 'all',
  onRecordBlitzRun
}) {
  const [phase, setPhase] = useState('playing'); // 'playing' | 'finished'
  const [timeLeftMs, setTimeLeftMs] = useState(INITIAL_BLITZ_SECONDS * 1000);
  const [currentTrack, setCurrentTrack] = useState(null);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [guessInput, setGuessInput] = useState('');
  const [highlightedIndex, setHighlightedIndex] = useState(0);
  const [showHint, setShowHint] = useState(false);

  // Run stats & history
  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(0);
  const [bestCombo, setBestCombo] = useState(0);
  const [bonusSecondsTotal, setBonusSecondsTotal] = useState(0);
  const [runHistory, setRunHistory] = useState([]); // Array of { track, status: 'correct' | 'passed' }
  const [feedbackBanner, setFeedbackBanner] = useState(null); // { type: 'correct' | 'wrong' | 'passed', text: string }
  const [bonusPopKey, setBonusPopKey] = useState(0);
  const [copiedShare, setCopiedShare] = useState(false);
  const [previewingRecapId, setPreviewingRecapId] = useState(null);

  const usedIdsRef = useRef(new Set());
  const audioRef = useRef(null);
  const recapAudioRef = useRef(null);
  const inputRef = useRef(null);
  const lastTickRef = useRef(null);
  const hasRecordedRef = useRef(false);

  // Pool of songs matching selected language + era
  const trackPool = useMemo(() => {
    const filtered = getFilteredTracks(selectedLanguage, selectedEra, 'all');
    return filtered.length > 0 ? filtered : TRACK_CATALOG;
  }, [selectedLanguage, selectedEra]);

  // Options prioritized by current pool first, then full catalog
  const searchPool = useMemo(() => {
    const poolOptions = trackPool.map(t => `${t.title} - ${t.artist}`);
    const set = new Set(poolOptions);
    for (const opt of ALL_OPTIONS) {
      if (!set.has(opt)) set.add(opt);
    }
    return Array.from(set);
  }, [trackPool]);

  // Memoized filtered autocomplete suggestions (never recomputes on timer ticks)
  const filteredSuggestions = useMemo(() => {
    const q = guessInput.trim().toLowerCase();
    if (!q) return [];
    const matches = [];
    for (let i = 0; i < searchPool.length; i++) {
      if (searchPool[i].toLowerCase().includes(q)) {
        matches.push(searchPool[i]);
        if (matches.length >= 6) break;
      }
    }
    return matches;
  }, [searchPool, guessInput]);

  // Pick next random unused track from pool
  const pickNextTrack = () => {
    let available = trackPool.filter(t => !usedIdsRef.current.has(t.id));
    if (available.length === 0) {
      usedIdsRef.current.clear();
      available = trackPool;
    }
    const chosen = available[Math.floor(Math.random() * available.length)] || TRACK_CATALOG[0];
    usedIdsRef.current.add(chosen.id);
    return chosen;
  };

  // Start / reset a new Blitz run
  const startNewBlitzRun = () => {
    if (recapAudioRef.current) {
      recapAudioRef.current.pause();
    }
    setPreviewingRecapId(null);
    usedIdsRef.current.clear();
    hasRecordedRef.current = false;

    const firstTrack = pickNextTrack();
    setCurrentTrack(firstTrack);
    setPhase('playing');
    setTimeLeftMs(INITIAL_BLITZ_SECONDS * 1000);
    setScore(0);
    setCombo(0);
    setBestCombo(0);
    setBonusSecondsTotal(0);
    setRunHistory([]);
    setGuessInput('');
    setHighlightedIndex(0);
    setShowHint(false);
    setFeedbackBanner(null);
    setCopiedShare(false);
    lastTickRef.current = performance.now();

    setTimeout(() => {
      inputRef.current?.focus();
    }, 60);
  };

  // Initialize run when modal opens
  useEffect(() => {
    if (isOpen) {
      startNewBlitzRun();
    } else {
      stopAudioReactiveGlow();
      if (audioRef.current) audioRef.current.pause();
      if (recapAudioRef.current) recapAudioRef.current.pause();
    }
    return () => stopAudioReactiveGlow();
  }, [isOpen]);

  // Auto-play whenever currentTrack changes during 'playing' phase
  useEffect(() => {
    if (!isOpen || phase !== 'playing' || !currentTrack || !audioRef.current) return;
    const audio = audioRef.current;
    audio.pause();
    audio.src = currentTrack.previewUrl;
    const offset = Number(currentTrack.hookStartSeconds) || 10;
    try {
      audio.currentTime = offset;
    } catch {}
    audio.loop = true;

    const playPromise = audio.play();
    if (playPromise !== undefined) {
      playPromise
        .then(() => setIsPlayingAudio(true))
        .catch(() => setIsPlayingAudio(false));
    }
  }, [currentTrack, phase, isOpen]);

  // High-precision 60s countdown timer
  useEffect(() => {
    if (!isOpen || phase !== 'playing') return;

    lastTickRef.current = performance.now();
    const interval = setInterval(() => {
      const now = performance.now();
      const delta = now - (lastTickRef.current || now);
      lastTickRef.current = now;

      setTimeLeftMs(prev => {
        if (prev - delta <= 0) {
          return 0;
        }
        return prev - delta;
      });
    }, 80);

    return () => clearInterval(interval);
  }, [isOpen, phase]);

  // Detect timer reaching 0
  useEffect(() => {
    if (phase === 'playing' && timeLeftMs <= 0) {
      setPhase('finished');
      if (audioRef.current) {
        audioRef.current.pause();
      }
      setIsPlayingAudio(false);

      // Include current active song in history as time-expired if not already recorded
      if (currentTrack) {
        setRunHistory(prev => [
          ...prev,
          { track: currentTrack, status: 'passed' }
        ]);
      }

      if (!hasRecordedRef.current && onRecordBlitzRun) {
        hasRecordedRef.current = true;
        onRecordBlitzRun(score, bestCombo);
      }
    }
  }, [timeLeftMs, phase]);

  if (!isOpen || !currentTrack) return null;

  const handleTogglePlay = () => {
    if (!audioRef.current) return;
    if (isPlayingAudio) {
      audioRef.current.pause();
      setIsPlayingAudio(false);
    } else {
      audioRef.current
        .play()
        .then(() => setIsPlayingAudio(true))
        .catch(() => setIsPlayingAudio(false));
    }
  };

  // Evaluate a guess (either clicked from suggestions or submitted via Enter/Button)
  const submitGuess = (rawGuessText) => {
    if (phase !== 'playing' || !currentTrack) return;
    const text = (rawGuessText ?? guessInput).trim();
    if (!text) return;

    const normalizedGuess = text.toLowerCase();
    const normalizedTitle = currentTrack.title.toLowerCase();
    const fullExpected = `${currentTrack.title} - ${currentTrack.artist}`.toLowerCase();

    const isCorrect =
      normalizedGuess === fullExpected ||
      normalizedGuess === normalizedTitle ||
      normalizedGuess.startsWith(normalizedTitle + ' -');

    if (isCorrect) {
      const nextScore = score + 1;
      const nextCombo = combo + 1;
      const nextBestCombo = Math.max(bestCombo, nextCombo);

      setScore(nextScore);
      setCombo(nextCombo);
      setBestCombo(nextBestCombo);
      setBonusSecondsTotal(prev => prev + BONUS_SECONDS_PER_HIT);
      setTimeLeftMs(prev => prev + BONUS_SECONDS_PER_HIT * 1000);
      setBonusPopKey(prev => prev + 1);

      setRunHistory(prev => [
        ...prev,
        { track: currentTrack, status: 'correct' }
      ]);

      setFeedbackBanner({
        type: 'correct',
        text: `⚡ +${BONUS_SECONDS_PER_HIT}s! "${currentTrack.title}" (${currentTrack.artist})`
      });

      setGuessInput('');
      setHighlightedIndex(0);
      setShowHint(false);
      setCurrentTrack(pickNextTrack());
      inputRef.current?.focus();
    } else {
      setCombo(0);
      setFeedbackBanner({
        type: 'wrong',
        text: `❌ Not "${text.split(' - ')[0]}" — try again or hit Pass!`
      });
      setGuessInput('');
      setHighlightedIndex(0);
      inputRef.current?.focus();
    }
  };

  // Pass / Skip current track to immediately hear the next song
  const handlePassTrack = () => {
    if (phase !== 'playing' || !currentTrack) return;

    setCombo(0);
    setRunHistory(prev => [
      ...prev,
      { track: currentTrack, status: 'passed' }
    ]);

    setFeedbackBanner({
      type: 'passed',
      text: `⏭️ Passed: "${currentTrack.title}" — ${currentTrack.artist}`
    });

    setGuessInput('');
    setHighlightedIndex(0);
    setShowHint(false);
    setCurrentTrack(pickNextTrack());
    inputRef.current?.focus();
  };

  // Keyboard navigation in search box
  const handleKeyDown = (e) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (filteredSuggestions.length > 0) {
        setHighlightedIndex(prev => (prev + 1) % filteredSuggestions.length);
      }
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (filteredSuggestions.length > 0) {
        setHighlightedIndex(prev => (prev - 1 + filteredSuggestions.length) % filteredSuggestions.length);
      }
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (filteredSuggestions.length > 0) {
        submitGuess(filteredSuggestions[highlightedIndex] || filteredSuggestions[0]);
      } else {
        submitGuess(guessInput);
      }
    }
  };

  // Toggle preview in end-of-run recap
  const handleToggleRecapPreview = (track) => {
    if (!recapAudioRef.current) return;
    if (previewingRecapId === track.id) {
      recapAudioRef.current.pause();
      setPreviewingRecapId(null);
    } else {
      recapAudioRef.current.pause();
      recapAudioRef.current.src = track.previewUrl;
      try {
        recapAudioRef.current.currentTime = Number(track.hookStartSeconds) || 10;
      } catch {}
      recapAudioRef.current.play().catch(() => {});
      setPreviewingRecapId(track.id);
    }
  };

  const handleShareBlitz = () => {
    const langLabel = selectedLanguage === 'all' ? 'Mixed Desi' : selectedLanguage.toUpperCase();
    const icons = runHistory.map(item => (item.status === 'correct' ? '⚡' : '⏭️')).join('');
    const shareText = `⚡ Surftest 60s Blitz (${langLabel})\n🏆 Score: ${score} Songs Guessed\n🔥 Best Combo: ${bestCombo}x | ⏱️ +${bonusSecondsTotal}s Bonus Time\n${icons || '⚡'}\nCan you beat my speedrun?`;
    navigator.clipboard.writeText(shareText);
    setCopiedShare(true);
    setTimeout(() => setCopiedShare(false), 2500);
  };

  const secondsDisplay = (timeLeftMs / 1000).toFixed(1);
  const timerPercent = Math.min(100, Math.max(0, (timeLeftMs / (INITIAL_BLITZ_SECONDS * 1000)) * 100));
  const isLowTime = timeLeftMs <= 10000;
  const isWarningTime = timeLeftMs > 10000 && timeLeftMs <= 20000;
  const trackEraMeta = getEraMeta(currentTrack.era || getEraFromYear(currentTrack.year));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-2xl animate-in fade-in duration-200">
      {/* Centered Audio-Reactive Cyan/Green Ambient Backlight */}
      <div className="audio-reactive-backlight" />

      {/* Hidden Audio Elements */}
      <audio
        ref={audioRef}
        preload="auto"
        onPlay={(e) => startAudioReactiveGlow(e.currentTarget)}
        onPause={() => stopAudioReactiveGlow()}
        onLoadedMetadata={(e) => {
          const offset = Number(currentTrack?.hookStartSeconds) || 10;
          if (e.currentTarget.currentTime < offset - 0.5) {
            e.currentTarget.currentTime = offset;
          }
        }}
      />
      <audio
        ref={recapAudioRef}
        preload="none"
        onPlay={(e) => startAudioReactiveGlow(e.currentTarget)}
        onPause={() => stopAudioReactiveGlow()}
        onEnded={() => {
          stopAudioReactiveGlow();
          setPreviewingRecapId(null);
        }}
      />

      <div className="relative z-10 w-full max-w-2xl rounded-3xl p-5 sm:p-7 overflow-hidden transition-all liquid-modal-window audio-reactive-surface border-cyan-500/35 shadow-[0_30px_90px_rgba(6,182,212,0.28)] max-h-[92vh] flex flex-col">
        {/* Top Specular Rim */}
        <div className="liquid-specular-rim" />

        {/* Top Header Bar */}
        <div className="flex items-center justify-between gap-2 pb-4 border-b border-white/[0.08] shrink-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[10px] font-mono font-extrabold uppercase tracking-wider px-2.5 py-1 rounded-md border bg-cyan-500/20 text-cyan-300 border-cyan-500/40 flex items-center gap-1.5 shadow-[0_0_12px_rgba(6,182,212,0.25)]">
              <Zap className="w-3.5 h-3.5 fill-current" />
              <span>60s BLITZ MODE</span>
            </span>

            <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2.5 py-1 rounded-md bg-white/[0.06] text-slate-300 border border-white/10">
              {selectedLanguage === 'all' ? 'ALL LANGUAGES' : selectedLanguage.toUpperCase()}
            </span>

            <span className="text-[10px] font-mono font-semibold px-2.5 py-1 rounded-md border bg-white/[0.04] text-slate-300 border-white/10">
              {trackEraMeta.shortLabel}
            </span>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-white/5 transition-colors cursor-pointer"
            aria-label="Close Blitz modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {phase === 'playing' ? (
          <div className="pt-5 space-y-5 overflow-y-auto pr-1">
            {/* LIVE TIMER + SCORE + COMBO HUD */}
            <div className="grid grid-cols-3 gap-3">
              {/* Countdown Clock */}
              <div
                className={`relative rounded-2xl p-3.5 border backdrop-blur-xl flex flex-col items-center justify-center transition-all ${
                  isLowTime
                    ? 'bg-red-500/20 border-red-500/60 shadow-[0_0_25px_rgba(239,68,68,0.35)] animate-pulse'
                    : isWarningTime
                    ? 'bg-amber-500/15 border-amber-500/40'
                    : 'bg-cyan-500/12 border-cyan-400/35 shadow-[0_0_20px_rgba(6,182,212,0.15)]'
                }`}
              >
                <div className="text-[10px] font-mono uppercase tracking-widest text-slate-400 flex items-center gap-1 mb-0.5">
                  <Clock className="w-3 h-3 text-cyan-400" />
                  <span>TIME LEFT</span>
                </div>
                <div
                  className={`text-2xl sm:text-3xl font-mono font-black tabular-nums ${
                    isLowTime
                      ? 'text-red-400'
                      : isWarningTime
                      ? 'text-amber-300'
                      : 'text-cyan-300'
                  }`}
                >
                  {secondsDisplay}s
                </div>

                {/* Floating +3s Bonus Badge */}
                {bonusPopKey > 0 && (
                  <span
                    key={bonusPopKey}
                    className="absolute -top-2.5 right-2 px-2 py-0.5 rounded-full bg-[#22E06B] text-black font-mono font-black text-[10px] shadow-[0_0_12px_#22E06B] animate-bounce"
                  >
                    +{BONUS_SECONDS_PER_HIT}s ⚡
                  </span>
                )}
              </div>

              {/* Score Counter */}
              <div className="rounded-2xl p-3.5 border border-white/10 bg-white/[0.03] backdrop-blur-xl flex flex-col items-center justify-center">
                <div className="text-[10px] font-mono uppercase tracking-widest text-slate-400 flex items-center gap-1 mb-0.5">
                  <Trophy className="w-3 h-3 text-[#22E06B]" />
                  <span>GUESSED</span>
                </div>
                <div className="text-2xl sm:text-3xl font-mono font-black text-white tabular-nums">
                  {score}
                </div>
              </div>

              {/* Combo Streak */}
              <div
                className={`rounded-2xl p-3.5 border backdrop-blur-xl flex flex-col items-center justify-center transition-all ${
                  combo >= 3
                    ? 'bg-amber-500/15 border-amber-400/50 shadow-[0_0_20px_rgba(245,158,11,0.2)]'
                    : 'border-white/10 bg-white/[0.03]'
                }`}
              >
                <div className="text-[10px] font-mono uppercase tracking-widest text-slate-400 flex items-center gap-1 mb-0.5">
                  <Flame className={`w-3 h-3 ${combo >= 2 ? 'text-amber-400 fill-amber-400' : 'text-slate-500'}`} />
                  <span>COMBO</span>
                </div>
                <div className={`text-2xl sm:text-3xl font-mono font-black tabular-nums ${combo >= 2 ? 'text-amber-300' : 'text-slate-300'}`}>
                  {combo}x
                </div>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="w-full h-2 rounded-full bg-white/[0.06] overflow-hidden p-0.5 border border-white/10">
              <div
                className={`h-full rounded-full transition-all duration-100 ${
                  isLowTime
                    ? 'bg-gradient-to-r from-red-500 to-orange-500 shadow-[0_0_12px_#ef4444]'
                    : isWarningTime
                    ? 'bg-gradient-to-r from-amber-400 to-yellow-300'
                    : 'bg-gradient-to-r from-cyan-400 via-[#22E06B] to-cyan-300 shadow-[0_0_12px_#22d3ee]'
                }`}
                style={{ width: `${timerPercent}%` }}
              />
            </div>

            {/* Instant Feedback Toast Banner */}
            {feedbackBanner && (
              <div
                className={`px-4 py-2.5 rounded-xl border text-xs font-bold flex items-center justify-between animate-in fade-in duration-150 ${
                  feedbackBanner.type === 'correct'
                    ? 'bg-[#22E06B]/15 border-[#22E06B]/40 text-[#22E06B]'
                    : feedbackBanner.type === 'passed'
                    ? 'bg-slate-800/70 border-white/15 text-slate-300'
                    : 'bg-red-500/15 border-red-500/40 text-red-300'
                }`}
              >
                <span>{feedbackBanner.text}</span>
                {feedbackBanner.type === 'correct' && (
                  <span className="font-mono text-[11px] bg-[#22E06B]/20 px-2 py-0.5 rounded-md">
                    +3.0s
                  </span>
                )}
              </div>
            )}

            {/* ACTIVE HOOK PLAYER CARD */}
            <div className={`p-4 sm:p-5 rounded-2xl liquid-panel-subtle border-cyan-500/25 flex flex-col sm:flex-row items-center justify-between gap-4 ${isPlayingAudio ? 'audio-reactive-card-halo' : ''}`}>
              <div className="flex items-center gap-4 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={handleTogglePlay}
                  className="w-14 h-14 rounded-2xl liquid-btn-cyan flex items-center justify-center shrink-0 cursor-pointer"
                  aria-label={isPlayingAudio ? 'Pause hook' : 'Play hook'}
                >
                  {isPlayingAudio ? (
                    <Pause className="w-6 h-6 fill-current" />
                  ) : (
                    <Play className="w-6 h-6 fill-current translate-x-0.5" />
                  )}
                </button>

                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono uppercase tracking-wider font-bold text-cyan-300">
                      TRACK #{runHistory.length + 1}
                    </span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-white/10 text-slate-300 uppercase">
                      {currentTrack.language}
                    </span>
                  </div>
                  <div className="text-sm font-bold text-white mt-0.5 flex items-center gap-2">
                    <Volume2 className={`w-4 h-4 text-cyan-400 ${isPlayingAudio ? 'animate-bounce' : ''}`} />
                    <span>{isPlayingAudio ? 'Hook playing on loop...' : 'Audio paused — press play'}</span>
                  </div>
                  {showHint && (
                    <div className="text-xs text-amber-300 mt-1 font-medium">
                      💡 Hint: Released in {currentTrack.year} • Artist starts with "{currentTrack.artist.slice(0, 3)}..."
                    </div>
                  )}
                </div>
              </div>

              {/* Quick Actions: Hint & Pass */}
              <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                {!showHint && (
                  <button
                    type="button"
                    onClick={() => setShowHint(true)}
                    className="px-3 py-2.5 rounded-xl liquid-btn-ghost text-xs font-bold text-amber-300 hover:text-amber-200 flex items-center gap-1.5 cursor-pointer"
                  >
                    <Lightbulb className="w-3.5 h-3.5" />
                    <span>Hint</span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={handlePassTrack}
                  className="px-4 py-2.5 rounded-xl liquid-btn-ghost text-xs font-bold text-slate-200 hover:text-white flex items-center gap-1.5 cursor-pointer"
                >
                  <SkipForward className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Pass / Next Hook</span>
                </button>
              </div>
            </div>

            {/* SEARCH & AUTOCOMPLETE INPUT (ONE-CLICK SUBMIT) */}
            <div className="relative">
              <div className="flex gap-2">
                <input
                  ref={inputRef}
                  type="text"
                  value={guessInput}
                  onChange={(e) => {
                    setGuessInput(e.target.value);
                    setHighlightedIndex(0);
                  }}
                  onKeyDown={handleKeyDown}
                  placeholder="Type song title or artist (click any match to submit instantly)..."
                  className="w-full px-4 py-3.5 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none liquid-glass-input border-cyan-500/30"
                />

                <button
                  type="button"
                  onClick={() => submitGuess(guessInput)}
                  disabled={!guessInput.trim()}
                  className="px-5 py-3.5 rounded-xl font-bold text-sm transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1.5 shrink-0 liquid-btn-cyan"
                >
                  <Check className="w-4 h-4 stroke-[2.5]" />
                  <span>Guess</span>
                </button>
              </div>

              {/* Instant One-Click Suggestions List */}
              {filteredSuggestions.length > 0 && (
                <div className="mt-2 rounded-2xl overflow-hidden liquid-modal-window border border-cyan-500/30 divide-y divide-white/[0.06] shadow-2xl">
                  {filteredSuggestions.map((suggestion, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => submitGuess(suggestion)}
                      className={`w-full text-left px-4 py-2.5 text-xs sm:text-sm transition-colors cursor-pointer flex items-center justify-between ${
                        idx === highlightedIndex
                          ? 'bg-cyan-500/20 text-white font-semibold'
                          : 'text-slate-200 hover:bg-white/[0.06]'
                      }`}
                    >
                      <span className="truncate">{suggestion}</span>
                      <span className="text-[10px] font-mono text-cyan-300 shrink-0 ml-2">
                        Click or Enter ↵
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        ) : (
          /* FINISHED / BLITZ SUMMARY SCREEN */
          <div className="pt-5 space-y-5 overflow-y-auto pr-1">
            <div className="p-6 rounded-2xl border border-cyan-500/35 bg-gradient-to-b from-cyan-950/35 to-slate-950/70 text-center space-y-4">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-bold uppercase tracking-wider bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">
                <Sparkles className="w-3.5 h-3.5" />
                <span>TIME'S UP · 60s BLITZ COMPLETE!</span>
              </div>

              <div>
                <div className="text-4xl sm:text-5xl font-black text-white tracking-tight">
                  {score} {score === 1 ? 'Song' : 'Songs'}
                </div>
                <p className="text-xs sm:text-sm text-slate-300 mt-1">
                  Best Combo: <strong className="text-amber-300">{bestCombo}x</strong> · Bonus Time Earned:{' '}
                  <strong className="text-[#22E06B]">+{bonusSecondsTotal}s</strong> · Total Run Time:{' '}
                  <strong className="text-cyan-300">{INITIAL_BLITZ_SECONDS + bonusSecondsTotal}s</strong>
                </p>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
                <button
                  type="button"
                  onClick={handleShareBlitz}
                  className="px-4 py-2.5 rounded-xl bg-white/[0.07] hover:bg-white/[0.12] border border-white/15 text-xs font-bold text-slate-200 flex items-center gap-2 transition-all cursor-pointer"
                >
                  <Share2 className="w-3.5 h-3.5 text-cyan-400" />
                  <span>{copiedShare ? 'Copied Blitz Score!' : 'Share Blitz Score'}</span>
                </button>

                <button
                  type="button"
                  onClick={startNewBlitzRun}
                  className="px-6 py-2.5 rounded-xl font-black text-xs sm:text-sm transition-all cursor-pointer flex items-center gap-2 liquid-btn-cyan"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>Play Another Blitz ⚡</span>
                </button>
              </div>
            </div>

            {/* Run Recap List */}
            {runHistory.length > 0 && (
              <div className="space-y-2">
                <div className="text-[11px] font-mono uppercase tracking-widest text-slate-400 flex items-center justify-between px-1">
                  <span>SONGS IN YOUR BLITZ RUN ({runHistory.length})</span>
                  <span>TAP PLAY TO LISTEN</span>
                </div>

                <div className="max-h-60 overflow-y-auto space-y-2 pr-1">
                  {runHistory.map((item, idx) => {
                    const isPreviewing = previewingRecapId === item.track.id;
                    return (
                      <div
                        key={`${item.track.id}-${idx}`}
                        className={`p-3 rounded-xl border flex items-center justify-between gap-3 ${
                          item.status === 'correct'
                            ? 'bg-[#22E06B]/10 border-[#22E06B]/30'
                            : 'bg-white/[0.03] border-white/10'
                        }`}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <button
                            type="button"
                            onClick={() => handleToggleRecapPreview(item.track)}
                            className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center text-white shrink-0 cursor-pointer"
                            aria-label="Preview song"
                          >
                            {isPreviewing ? (
                              <Pause className="w-3.5 h-3.5 fill-current" />
                            ) : (
                              <Play className="w-3.5 h-3.5 fill-current translate-x-0.5" />
                            )}
                          </button>

                          <div className="min-w-0">
                            <div className="text-xs sm:text-sm font-bold text-white truncate">
                              {item.track.title}
                            </div>
                            <div className="text-[11px] text-slate-400 truncate">
                              {item.track.artist} • {item.track.year}
                            </div>
                          </div>
                        </div>

                        <span
                          className={`text-[10px] font-mono font-bold px-2.5 py-1 rounded-full shrink-0 ${
                            item.status === 'correct'
                              ? 'bg-[#22E06B]/20 text-[#22E06B] border border-[#22E06B]/40'
                              : 'bg-slate-800 text-slate-400 border border-white/10'
                          }`}
                        >
                          {item.status === 'correct' ? '+3s HIT ⚡' : 'PASSED'}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
