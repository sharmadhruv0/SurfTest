import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Play, Pause, FastForward, Check, X, Award, Share2, Link2, Sparkles, Trophy, ArrowRight, Music2, RefreshCw } from 'lucide-react';
import { getEraMeta, getEraFromYear } from '../constants/eras.js';
import { getNextLocalAntakshariTrack, startLocalAntakshariSession } from '../data/tracks.js';

const STAGE_DURATIONS = [1, 2, 4, 7, 11, 16]; // seconds unlocked at each stage

export default function AntakshariModal({
  isOpen,
  onClose,
  initialData,
  selectedLanguage = 'all',
  onRecordChain
}) {
  if (!isOpen) return null;

  // Session state
  const [sessionId, setSessionId] = useState(initialData?.sessionId || null);
  const [chainLength, setChainLength] = useState(initialData?.chainLength || 1);
  const [currentTrack, setCurrentTrack] = useState(initialData?.track || null);
  const [options, setOptions] = useState(initialData?.options || []);
  const [connectingSound, setConnectingSound] = useState(initialData?.connectingSound || null);
  const [chainHistory, setChainHistory] = useState([]);

  // Gameplay state
  const [currentStage, setCurrentStage] = useState(0); // 0 to 5
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [guessInput, setGuessInput] = useState('');
  const [guesses, setGuesses] = useState([]); // Array of { text, status: 'skipped' | 'wrong' | 'correct' }
  const [gameState, setGameState] = useState('playing'); // 'playing' | 'transitioning' | 'broken' | 'beat_chain'
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [copiedShare, setCopiedShare] = useState(false);
  const [isLoadingNext, setIsLoadingNext] = useState(false);
  const [transitionBanner, setTransitionBanner] = useState(null);

  const audioRef = useRef(null);
  const maxAllowedTime = (gameState === 'broken' || gameState === 'beat_chain') ? 30 : (STAGE_DURATIONS[currentStage] || 1);

  // Initialize or reset session when initialData changes
  useEffect(() => {
    if (initialData) {
      setSessionId(initialData.sessionId);
      setChainLength(initialData.chainLength || 1);
      setCurrentTrack(initialData.track);
      setOptions(initialData.options || []);
      setConnectingSound(initialData.connectingSound || null);
      setChainHistory([]);
      setCurrentStage(0);
      setIsPlaying(false);
      setCurrentTime(0);
      setGuessInput('');
      setGuesses([]);
      setGameState('playing');
      setCopiedShare(false);
      setTransitionBanner(null);
    }
  }, [initialData]);

  // Audio time update watcher
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleTimeUpdate = () => {
      const cur = audio.currentTime;
      setCurrentTime(cur);

      if (cur >= maxAllowedTime) {
        audio.pause();
        audio.currentTime = 0;
        setIsPlaying(false);
      }
    };

    const handleEnded = () => {
      setIsPlaying(false);
      setCurrentTime(0);
    };

    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('ended', handleEnded);

    return () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('ended', handleEnded);
    };
  }, [maxAllowedTime]);

  // Toggle audio playback
  const togglePlay = () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
    } else {
      audio.currentTime = 0;
      audio.play().then(() => {
        setIsPlaying(true);
      }).catch((err) => {
        console.warn('Audio play prevented:', err);
        setIsPlaying(false);
      });
    }
  };

  // Start a fresh new chain immediately without leaving Antakshari screen
  const handleStartNewChain = useCallback(async () => {
    setIsLoadingNext(true);
    setGameState('playing');
    setGuesses([]);
    setGuessInput('');
    setCurrentStage(0);
    setCurrentTime(0);
    setIsPlaying(false);
    setTransitionBanner(null);

    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }

    try {
      const res = await fetch(`/api/antakshari/start?language=${selectedLanguage}`);
      if (res.ok) {
        const data = await res.json();
        setSessionId(data.sessionId);
        setChainLength(data.chainLength || 1);
        setCurrentTrack(data.track);
        setOptions(data.options || []);
        setConnectingSound(null);
        setChainHistory([]);
        setIsLoadingNext(false);
        return;
      }
    } catch {
      // Backend unavailable; client-side fallback
    }

    const localData = startLocalAntakshariSession(selectedLanguage);
    setSessionId(localData.sessionId);
    setChainLength(localData.chainLength || 1);
    setCurrentTrack(localData.track);
    setOptions(localData.options || []);
    setConnectingSound(null);
    setChainHistory([]);
    setIsLoadingNext(false);
  }, [selectedLanguage]);

  // Advance to next song in chain after correct guess
  const advanceToNextSong = async (solvedTrack) => {
    setGameState('transitioning');
    setIsLoadingNext(true);

    // Save to chain history with complete sound transition metadata
    const historyItem = {
      step: chainLength,
      track: solvedTrack,
      connectingSound: solvedTrack.endSound,
      connectingWord: solvedTrack.endWord || solvedTrack.endSyllable,
      connectingSyllable: solvedTrack.endWord || solvedTrack.endSyllable,
      connectingLabel: solvedTrack.endSoundLabel,
      startWord: solvedTrack.startWord || solvedTrack.startSyllable,
      endWord: solvedTrack.endWord || solvedTrack.endSyllable,
      startSound: solvedTrack.startSound,
      endSound: solvedTrack.endSound,
      startSoundLabel: solvedTrack.startSoundLabel,
      endSoundLabel: solvedTrack.endSoundLabel,
      startDevanagari: solvedTrack.startDevanagari,
      endDevanagari: solvedTrack.endDevanagari
    };
    const updatedHistory = [...chainHistory, historyItem];
    setChainHistory(updatedHistory);

    // Display connecting sound banner
    setTransitionBanner({
      sound: solvedTrack.endSound,
      label: solvedTrack.endSoundLabel,
      devanagari: solvedTrack.endDevanagari,
      fromWord: solvedTrack.endWord || solvedTrack.endSyllable,
      fromSyllable: solvedTrack.endWord || solvedTrack.endSyllable,
      fromTitle: solvedTrack.title
    });

    try {
      const res = await fetch(
        `/api/antakshari/next?sessionId=${sessionId}&previousSongId=${solvedTrack.id}`
      );
      if (res.ok) {
        const nextData = await res.json();

        if (nextData.chainComplete) {
          // You beat the chain!
          setGameState('beat_chain');
          setIsLoadingNext(false);
          if (onRecordChain) onRecordChain(nextData.chainLength, true);
          return;
        }

        // Successfully found next song
        setTimeout(() => {
          setCurrentTrack(nextData.track);
          setChainLength(nextData.chainLength);
          setConnectingSound(nextData.connectingSound);
          setCurrentStage(0);
          setGuesses([]);
          setGuessInput('');
          setCurrentTime(0);
          setIsPlaying(false);
          setGameState('playing');
          setIsLoadingNext(false);

          if (audioRef.current) {
            audioRef.current.pause();
            audioRef.current.currentTime = 0;
          }
        }, 1100);
        return;
      }
    } catch {
      // Backend fallback
    }

    // Local client-side fallback
    const usedIds = updatedHistory.map((h) => h.track.id);
    const localNext = getNextLocalAntakshariTrack(solvedTrack.id, usedIds, chainLength, selectedLanguage);

    if (localNext.chainComplete) {
      setGameState('beat_chain');
      setIsLoadingNext(false);
      if (onRecordChain) onRecordChain(chainLength, true);
      return;
    }

    setTimeout(() => {
      setCurrentTrack(localNext.track);
      setChainLength(localNext.chainLength);
      setConnectingSound(localNext.connectingSound);
      setCurrentStage(0);
      setGuesses([]);
      setGuessInput('');
      setCurrentTime(0);
      setIsPlaying(false);
      setGameState('playing');
      setIsLoadingNext(false);

      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }
    }, 1100);
  };

  // Handle Skip Action
  const handleSkip = () => {
    if (gameState !== 'playing' || !currentTrack) return;

    const newGuesses = [...guesses, { text: 'Skipped', status: 'skipped' }];
    setGuesses(newGuesses);

    if (currentStage >= 5) {
      // Chain breaks!
      setGameState('broken');
      setIsPlaying(false);
      if (onRecordChain) onRecordChain(chainLength, false);
    } else {
      setCurrentStage((prev) => prev + 1);
      setCurrentTime(0);
      setIsPlaying(false);
    }
  };

  // Handle Guess Submission
  const handleGuess = (guessText) => {
    if (gameState !== 'playing' || !currentTrack || !guessText.trim()) return;

    const cleanInput = guessText.toLowerCase().trim();
    const targetTitle = currentTrack.title.toLowerCase().trim();
    const songFull = `${currentTrack.title} - ${currentTrack.artist}`.toLowerCase();

    // Check if guess matches title or "Title - Artist"
    const isCorrect =
      cleanInput === targetTitle ||
      cleanInput === songFull ||
      cleanInput.startsWith(targetTitle) ||
      targetTitle.startsWith(cleanInput);

    if (isCorrect) {
      const newGuesses = [...guesses, { text: currentTrack.title, status: 'correct' }];
      setGuesses(newGuesses);
      setIsPlaying(false);
      advanceToNextSong(currentTrack);
    } else {
      const newGuesses = [...guesses, { text: guessText, status: 'wrong' }];
      setGuesses(newGuesses);

      if (currentStage >= 5) {
        // Chain breaks!
        setGameState('broken');
        setIsPlaying(false);
        if (onRecordChain) onRecordChain(chainLength, false);
      } else {
        setCurrentStage((prev) => prev + 1);
        setCurrentTime(0);
        setIsPlaying(false);
      }
    }

    setGuessInput('');
    setShowSuggestions(false);
  };

  // Dedicated Antakshari Share handler
  const handleShare = () => {
    const chainScore = gameState === 'beat_chain' ? `${chainLength} 🏆 (BEAT THE CHAIN!)` : `${chainLength} songs`;
    const chainLinksPreview = chainHistory.length > 0
      ? chainHistory.map(h => `${h.track.title} […${h.track.endSound}]`).join(' ➔ ')
      : (currentTrack ? `${currentTrack.title} […${currentTrack.endSound}]` : '');

    const textLines = [
      `Surftest 🔗 ANTAKSHARI MODE`,
      `I built a sound chain of ${chainScore}! 🎵🔗`,
      `🔗 Pathway: ${chainLinksPreview}`,
      `Can you beat my sound chain?`,
      `https://surftest.vercel.app`
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

  const trackEra = currentTrack ? (currentTrack.era || getEraFromYear(currentTrack.year)) : '2010s';
  const trackEraMeta = getEraMeta(trackEra);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-[#110e0a] border border-amber-500/30 rounded-2xl max-w-2xl w-full p-5 sm:p-7 shadow-[0_30px_70px_rgba(245,158,11,0.15)] relative flex flex-col max-h-[92vh] overflow-y-auto">
        {/* Hidden HTML5 Audio */}
        <audio
          ref={audioRef}
          src={currentTrack?.previewUrl}
          preload="auto"
        />

        {/* Modal Top Bar with Antakshari & Chain Length Hero Badge */}
        <div className="flex items-center justify-between pb-4 border-b border-amber-500/20 mb-5">
          <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400 shadow-[0_0_8px_#F59E0B]" />
            <span className="text-xs font-mono font-bold text-amber-400 uppercase tracking-widest flex items-center gap-1.5">
              <span>ANTTAKSHARI</span>
              <Link2 className="w-3.5 h-3.5" />
            </span>

            {/* Chain Length Hero Badge */}
            <div className="bg-amber-500/20 text-amber-300 border border-amber-500/40 px-3 py-0.5 rounded-full text-xs font-mono font-black flex items-center gap-1.5 shadow-[0_0_12px_rgba(245,158,11,0.2)]">
              <span>CHAIN LENGTH:</span>
              <span className="text-white text-sm">{chainLength}</span>
              <span className="text-amber-400 text-xs">🔗</span>
            </div>

            {/* Language badge */}
            <span className="bg-white/10 text-[#F5F5F5] px-2 py-0.5 rounded border border-white/10 text-[10px] font-mono font-bold uppercase">
              {currentTrack?.language?.toUpperCase() || 'DESI'}
            </span>
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

        {/* Connecting Sound Transition Alert (shows why this song was picked!) */}
        {connectingSound && (
          <div className="mb-5 p-3.5 rounded-xl border border-amber-500/50 bg-gradient-to-r from-amber-950/60 via-[#22180d] to-orange-950/50 text-amber-200 text-xs shadow-[0_0_20px_rgba(245,158,11,0.15)] animate-in fade-in slide-in-from-top-2 duration-300">
            <div className="flex items-center justify-between gap-2 mb-2">
              <div className="flex items-center gap-2">
                <span className="text-amber-400 text-base leading-none">🔗</span>
                <span className="font-mono font-bold text-amber-300 uppercase tracking-wider text-[11px]">
                  ANTAKSHARI SOUND LINK
                </span>
              </div>
              <span className="text-[10px] font-mono font-black px-2.5 py-0.5 rounded-full bg-amber-500/25 text-amber-300 border border-amber-500/40 uppercase">
                SOUND: {connectingSound.label || connectingSound.sound}
              </span>
            </div>
            <div className="flex items-center gap-2 flex-wrap text-xs">
              <span className="text-[#A3A8A5]">Previous Song Ended:</span>
              <span className="font-mono text-white font-bold bg-white/10 px-2 py-0.5 rounded">
                "{connectingSound.fromWord || connectingSound.fromSyllable}" […{connectingSound.sound}]
              </span>
              <span className="text-amber-400 font-black text-sm">➔</span>
              <span className="text-[#A3A8A5]">This Song Must Start With:</span>
              <span className="font-mono text-amber-300 font-bold bg-amber-500/20 px-2 py-0.5 rounded border border-amber-500/30">
                [{connectingSound.sound}…]
              </span>
            </div>
            {connectingSound.explanation && (
              <div className="text-[11px] text-amber-300/80 mt-2 italic font-sans flex items-center gap-1.5">
                <span>💡</span>
                <span>{connectingSound.explanation}</span>
              </div>
            )}
          </div>
        )}

        {/* Round 1 Intro Banner (when starting a fresh chain) */}
        {!connectingSound && currentTrack && (
          <div className="mb-5 p-3.5 rounded-xl border border-amber-500/30 bg-amber-950/25 text-amber-200 text-xs flex items-center justify-between gap-3 animate-in fade-in duration-200">
            <div className="flex items-center gap-2.5">
              <span className="text-base leading-none">🎤</span>
              <div>
                <span className="font-bold text-amber-300">Round 1 (Chain Starter): </span>
                <span className="text-[#C4C9C6]">Title starts with sound </span>
                <span className="font-mono font-bold text-white bg-white/10 px-2 py-0.5 rounded ml-1">
                  {currentTrack.startSoundLabel} ({currentTrack.startWord || currentTrack.startSyllable})
                </span>
              </div>
            </div>
            <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40 uppercase shrink-0">
              STARTING SONG
            </span>
          </div>
        )}

        {/* Transitioning Overlay Animation Banner */}
        {gameState === 'transitioning' && (
          <div className="mb-5 p-4 rounded-xl border border-emerald-500/50 bg-emerald-950/40 text-emerald-200 text-xs flex items-center justify-between gap-3 animate-in zoom-in-95 duration-200 shadow-[0_0_25px_rgba(34,224,107,0.2)]">
            <div className="flex items-center gap-2.5">
              <Sparkles className="w-5 h-5 text-emerald-400 animate-spin shrink-0" />
              <div>
                <div className="font-bold text-emerald-300 text-sm">Correct Guess! Chain +1 🔗</div>
                <div className="mt-0.5 text-emerald-200/90">
                  Ended with "<strong className="text-white">{transitionBanner?.fromWord || transitionBanner?.fromSyllable}</strong>" […{transitionBanner?.sound}] ➔ Next song starts with sound <strong className="text-amber-300">[{transitionBanner?.sound}…] ({transitionBanner?.label})</strong>
                </div>
              </div>
            </div>
            <span className="text-xs font-mono font-black text-emerald-400 bg-emerald-900/50 border border-emerald-500/40 px-3 py-1 rounded-full flex items-center gap-1 shrink-0">
              <span>Next Link ➔</span>
            </span>
          </div>
        )}

        {/* 6-Stage Progress Indicator Bar */}
        <div className="mb-6">
          <div className="flex items-center justify-between text-[11px] font-mono text-[#8B8F8C] uppercase mb-2">
            <span>Stage 0{currentStage + 1} / 06</span>
            <span className="text-amber-400 font-bold">
              {STAGE_DURATIONS[currentStage]}s unlocked
            </span>
          </div>

          <div className="grid grid-cols-6 gap-1.5 h-3 bg-black/50 p-1 rounded-full border border-amber-500/20">
            {STAGE_DURATIONS.map((dur, idx) => {
              const isUnlocked = idx <= currentStage;
              const isCurrent = idx === currentStage;
              return (
                <div
                  key={idx}
                  className={`h-full rounded-full transition-all duration-300 relative overflow-hidden ${
                    isUnlocked
                      ? isCurrent
                        ? 'bg-amber-500/60 shadow-[0_0_8px_rgba(245,158,11,0.4)]'
                        : 'bg-amber-500'
                      : 'bg-white/10'
                  }`}
                >
                  {isCurrent && (
                    <div
                      className="h-full transition-all duration-100 bg-amber-400"
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
        <div className="border rounded-xl p-5 mb-6 flex flex-col sm:flex-row items-center justify-between gap-4 transition-colors bg-[#18130c] border-amber-900/30">
          <div className="flex items-center gap-4 w-full sm:w-auto">
            {/* Play/Pause Button */}
            <button
              type="button"
              onClick={togglePlay}
              disabled={isLoadingNext}
              aria-label={isPlaying ? 'Pause' : 'Play'}
              className="w-14 h-14 rounded-full flex items-center justify-center transition-transform active:scale-95 cursor-pointer shrink-0 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-black shadow-[0_0_20px_rgba(245,158,11,0.4)] disabled:opacity-50"
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
                  (gameState === 'broken' || gameState === 'beat_chain')
                    ? 'Playing full track (forward)...'
                    : 'Playing snippet...'
                ) : (
                  (gameState === 'broken' || gameState === 'beat_chain')
                    ? 'Listen to revealed track'
                    : `Listen to snippet (Stage ${currentStage + 1})`
                )}
              </div>
              <div className="text-xs text-[#8B8F8C] font-mono mt-0.5">
                0:{currentTime < 10 ? `0${Math.floor(currentTime)}` : Math.floor(currentTime)} / 0:{maxAllowedTime < 10 ? `0${maxAllowedTime}` : maxAllowedTime}
              </div>
            </div>
          </div>

          {/* Dynamic Amber Visualizer Bars */}
          <div className="flex items-end gap-1 h-8 px-3">
            {[45, 80, 35, 95, 60, 100, 50, 85, 40, 70].map((val, i) => (
              <div
                key={i}
                className={`w-1 rounded-full transition-all duration-150 ${
                  isPlaying ? 'bg-amber-400' : 'bg-white/15'
                }`}
                style={{
                  height: isPlaying ? `${Math.max(15, (val * Math.random()).toFixed(0))}%` : '20%'
                }}
              />
            ))}
          </div>
        </div>

        {/* Previous Guesses List (only during active play or chain break) */}
        {gameState !== 'beat_chain' && (
          <div className="space-y-2 mb-6 min-h-[140px]">
            <div className="text-[11px] font-semibold text-[#8B8F8C] uppercase tracking-widest mb-1 flex items-center justify-between">
              <span>Attempts on Song #{chainLength} ({guesses.length}/6)</span>
              {currentTrack && (
                <span className="text-[10px] font-mono text-amber-400">
                  Starts with: <strong>{currentTrack.startSoundLabel}</strong>
                </span>
              )}
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
                    {guess ? `${slotIdx + 1}. ${guess.text}` : `${slotIdx + 1}. —`}
                  </span>
                  {guess && (
                    <span className="text-[11px] font-bold">
                      {guess.status === 'correct' && <Check className="w-3.5 h-3.5 text-[#22E06B]" />}
                      {guess.status === 'wrong' && <X className="w-3.5 h-3.5 text-rose-400" />}
                      {guess.status === 'skipped' && 'SKIPPED'}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* CHAIN BREAK SUMMARY CARD (when attempts exhausted) */}
        {gameState === 'broken' && (
          <div className="p-6 rounded-xl border border-amber-500/40 bg-[#1a1309] text-center mb-6 animate-in zoom-in-95 duration-200 shadow-[0_0_35px_rgba(245,158,11,0.2)]">
            <div className="inline-flex items-center gap-1.5 text-xs font-mono font-bold tracking-widest text-amber-400 uppercase mb-2">
              <Link2 className="w-4 h-4" />
              <span>CHAIN BROKEN!</span>
            </div>

            <div className="text-2xl sm:text-3xl font-black text-white mt-1">
              Chain of {chainLength}! 🔗
            </div>

            <p className="text-xs text-[#8B8F8C] mt-1">
              The chain broke on song #{chainLength}. The secret song was:
            </p>

            <div className="mt-3 p-3.5 rounded-xl bg-black/50 border border-amber-500/30 text-left flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <div className="text-sm font-bold text-white flex items-center gap-2">
                  <span>{currentTrack?.title}</span>
                  <span className="text-[11px] font-mono text-amber-400 bg-amber-500/20 px-2 py-0.5 rounded border border-amber-500/30">
                    {currentTrack?.startSoundLabel}
                  </span>
                </div>
                <div className="text-xs text-[#8B8F8C] mt-0.5">{currentTrack?.artist} · {currentTrack?.year}</div>
              </div>
              <div className="flex items-center gap-2.5 text-xs font-mono">
                <div className="bg-white/5 px-2.5 py-1 rounded border border-white/10">
                  <span className="text-[#8B8F8C] text-[10px] block uppercase">Starts On</span>
                  <span className="text-white font-bold">{currentTrack?.startWord} [{currentTrack?.startSound}]</span>
                </div>
                <div className="bg-amber-500/15 px-2.5 py-1 rounded border border-amber-500/30">
                  <span className="text-amber-400/80 text-[10px] block uppercase">Ends On</span>
                  <span className="text-amber-300 font-bold">{currentTrack?.endWord} [{currentTrack?.endSound}]</span>
                </div>
              </div>
            </div>

            {/* List of songs chained in this session */}
            {chainHistory.length > 0 && (
              <div className="mt-4 text-left">
                <div className="text-[11px] font-semibold text-[#8B8F8C] uppercase tracking-wider mb-2 flex items-center justify-between">
                  <span>Chained in this session ({chainHistory.length}):</span>
                  <span className="text-[10px] text-amber-400 font-mono">Word & Sound Links</span>
                </div>
                <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                  {chainHistory.map((item, idx) => (
                    <div
                      key={idx}
                      className="px-3.5 py-2 rounded-lg bg-white/[0.04] border border-white/10 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-1"
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="font-mono text-amber-400 font-bold shrink-0">{idx + 1}.</span>
                        <span className="text-white font-semibold truncate">{item.track.title}</span>
                      </div>
                      <div className="text-[11px] font-mono text-amber-300/90 flex items-center gap-1.5 shrink-0">
                        <span className="text-[#8B8F8C]">ended on:</span>
                        <span className="text-white font-semibold">"{item.endWord || item.connectingWord || item.connectingSyllable}"</span>
                        <span className="bg-amber-500/20 text-amber-300 px-1.5 py-0.5 rounded border border-amber-500/30 font-bold">
                          …{item.track.endSound} ({item.track.endSoundLabel})
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Action Buttons: Share Chain + Start New Chain */}
            <div className="mt-6 flex justify-center gap-3 flex-wrap">
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
                <span>{copiedShare ? 'Copied Chain! 📋' : 'Share Chain 🔗'}</span>
              </button>

              <button
                type="button"
                onClick={handleStartNewChain}
                className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-black font-extrabold px-6 py-2.5 rounded-full text-xs transition-all flex items-center gap-2 cursor-pointer active:scale-95 shadow-[0_0_20px_rgba(245,158,11,0.4)]"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Start New Chain</span>
              </button>
            </div>
          </div>
        )}

        {/* BEAT THE CHAIN / WIN SCREEN (when catalog runs out of next songs) */}
        {gameState === 'beat_chain' && (
          <div className="p-6 rounded-xl border border-amber-400 bg-gradient-to-b from-amber-950/40 to-black text-center mb-6 animate-in zoom-in-95 duration-200 shadow-[0_0_40px_rgba(245,158,11,0.3)]">
            <div className="inline-flex items-center gap-1.5 text-xs font-mono font-bold tracking-widest text-amber-400 uppercase mb-2">
              <Trophy className="w-5 h-5 text-amber-400" />
              <span>UNSTOPPABLE MASTER!</span>
            </div>

            <div className="text-2xl sm:text-3xl font-black text-white mt-1">
              You beat the chain! 🏆
            </div>

            <p className="text-xs text-[#8B8F8C] mt-2 max-w-md mx-auto">
              Incredible! You chained <strong>{chainLength} songs</strong> and successfully completed all available connecting tracks in the catalog!
            </p>

            {/* List of songs chained in this session */}
            {chainHistory.length > 0 && (
              <div className="mt-4 text-left">
                <div className="text-[11px] font-semibold text-amber-300 uppercase tracking-wider mb-2 flex items-center justify-between">
                  <span>Master Chain Pathway ({chainHistory.length}):</span>
                  <span className="text-[10px] text-amber-400 font-mono">Sound Progression</span>
                </div>
                <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                  {chainHistory.map((item, idx) => (
                    <div
                      key={idx}
                      className="px-3.5 py-2 rounded-lg bg-amber-500/10 border border-amber-500/20 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-1"
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="font-mono text-amber-400 font-bold shrink-0">{idx + 1}.</span>
                        <span className="text-white font-semibold truncate">{item.track.title}</span>
                      </div>
                      <div className="text-[11px] font-mono text-amber-300 flex items-center gap-1.5 shrink-0">
                        <span className="text-white">"{item.endWord || item.connectingWord || item.connectingSyllable}"</span>
                        <span className="bg-amber-500/20 text-amber-300 px-1.5 py-0.5 rounded border border-amber-500/30 font-bold">
                          ➔ [{item.track.endSound}]
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="mt-6 flex justify-center gap-3 flex-wrap">
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
                <span>{copiedShare ? 'Copied Chain! 📋' : 'Share Chain 🔗'}</span>
              </button>

              <button
                type="button"
                onClick={handleStartNewChain}
                className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-black font-extrabold px-6 py-2.5 rounded-full text-xs transition-all flex items-center gap-2 cursor-pointer active:scale-95 shadow-[0_0_20px_rgba(245,158,11,0.4)]"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Start New Chain</span>
              </button>
            </div>
          </div>
        )}

        {/* Input & Action Controls (only when playing) */}
        {gameState === 'playing' && (
          <div className="space-y-3 relative">
            {/* Antakshari Rule Clue Pill */}
            <div className="p-2.5 rounded-xl bg-[#191209] border border-amber-500/30 flex items-center justify-between gap-2 text-xs">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-amber-400 font-bold flex items-center gap-1">
                  <span>🔗</span>
                  <span>Antakshari Clue:</span>
                </span>
                <span className="text-[#C4C9C6]">Song #{chainLength} title starts with sound:</span>
                <span className="font-mono font-black text-amber-300 bg-amber-500/25 border border-amber-500/50 px-2 py-0.5 rounded text-xs shadow-sm">
                  {currentTrack?.startSoundLabel}
                </span>
              </div>
              {connectingSound && (
                <span className="text-[11px] font-mono text-amber-300/80 hidden sm:inline">
                  (linked from "{connectingSound.fromWord || connectingSound.fromSyllable}" […{connectingSound.sound}])
                </span>
              )}
            </div>

            {/* Search / Input with Autocomplete */}
            <div className="relative">
              <input
                type="text"
                placeholder={`Know song #${chainLength}? Starts with sound: ${currentTrack?.startSoundLabel || ''}...`}
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
                className="w-full bg-[#18130c] border border-amber-900/40 focus:border-amber-400 rounded-xl px-4 py-3 text-sm text-white placeholder-[#8B8F8C] focus:outline-none transition-colors"
              />

              {/* Suggestions Dropdown */}
              {showSuggestions && guessInput && filteredOptions.length > 0 && (
                <div className="absolute left-0 right-0 bottom-full mb-2 bg-[#1c140b] border border-amber-500/30 rounded-xl shadow-2xl max-h-48 overflow-y-auto z-20">
                  {filteredOptions.map((opt, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => handleGuess(opt)}
                      className="w-full text-left px-4 py-2.5 text-xs text-white hover:bg-amber-500/20 hover:text-amber-300 transition-colors border-b border-white/5 last:border-0"
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
                className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-black font-extrabold px-6 py-2.5 rounded-full text-xs transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed shadow-[0_0_15px_rgba(245,158,11,0.3)]"
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
