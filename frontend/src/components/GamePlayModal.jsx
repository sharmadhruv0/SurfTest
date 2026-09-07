import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, FastForward, Check, X, Volume2, RotateCcw, Award } from 'lucide-react';

const STAGE_DURATIONS = [1, 2, 4, 7, 11, 16]; // seconds unlocked at each stage
const TOTAL_DURATION = 16; // 16s total

export default function GamePlayModal({
  isOpen,
  onClose,
  roundData,
  onRecordResult,
  onPlayNext
}) {
  if (!isOpen || !roundData || !roundData.track) return null;

  const { track, options = [] } = roundData;
  const [currentStage, setCurrentStage] = useState(0); // 0 to 5
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [guessInput, setGuessInput] = useState('');
  const [guesses, setGuesses] = useState([]); // Array of { text, status: 'skipped' | 'wrong' | 'correct' }
  const [gameState, setGameState] = useState('playing'); // 'playing' | 'won' | 'lost'
  const [showSuggestions, setShowSuggestions] = useState(false);

  const audioRef = useRef(null);
  const maxAllowedTime = gameState !== 'playing' ? 30 : (STAGE_DURATIONS[currentStage] || 1);

  // Synthesize realistic sound beat if external audio preview fails to load
  const audioContextRef = useRef(null);

  useEffect(() => {
    // Reset state for new round
    setCurrentStage(0);
    setIsPlaying(false);
    setCurrentTime(0);
    setGuessInput('');
    setGuesses([]);
    setGameState('playing');
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
  }, [roundData]);

  // Pause audio whenever modal is closed
  useEffect(() => {
    if (!isOpen && audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      setIsPlaying(false);
      setCurrentTime(0);
    }
  }, [isOpen]);

  // Handle audio progress
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
      // Game over - lost
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

  const filteredOptions = options.filter((opt) =>
    opt.toLowerCase().includes(guessInput.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-[#101111] border border-white/10 rounded-2xl max-w-2xl w-full p-5 sm:p-7 shadow-[0_30px_70px_rgba(0,0,0,0.9)] relative flex flex-col max-h-[92vh] overflow-y-auto">
        {/* Hidden HTML5 Audio */}
        <audio
          ref={audioRef}
          src={track.previewUrl}
          preload="auto"
          onEnded={() => {
            setIsPlaying(false);
            setCurrentTime(0);
          }}
        />

        {/* Modal Top Bar */}
        <div className="flex items-center justify-between pb-4 border-b border-white/8 mb-6">
          <div className="flex items-center gap-2.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#22E06B] shadow-[0_0_8px_#22E06B]" />
            <span className="text-xs font-mono font-bold text-[#8B8F8C] uppercase tracking-widest">
              {roundData.roundId || 'ROUND ACTIVE'} · {track.language.toUpperCase()}
            </span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-full text-[#8B8F8C] hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 6-Stage Progress Indicator Bar */}
        <div className="mb-6">
          <div className="flex items-center justify-between text-[11px] font-mono text-[#8B8F8C] uppercase mb-2">
            <span>Stage 0{currentStage + 1} / 06</span>
            <span className="text-[#22E06B] font-bold">
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
                        ? 'bg-[#22E06B]/60 shadow-[0_0_8px_rgba(34,224,107,0.3)]'
                        : 'bg-[#22E06B]'
                      : 'bg-white/10'
                  }`}
                >
                  {isCurrent && (
                    <div
                      className="h-full bg-[#22E06B] transition-all duration-100"
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
        <div className="bg-[#121314] border border-white/8 rounded-xl p-5 mb-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4 w-full sm:w-auto">
            {/* Play/Pause Button */}
            <button
              type="button"
              onClick={togglePlay}
              className="w-14 h-14 rounded-full bg-[#22E06B] hover:bg-[#2ECC71] text-[#0A0A0B] flex items-center justify-center shadow-[0_0_20px_rgba(34,224,107,0.4)] transition-transform active:scale-95 cursor-pointer shrink-0"
            >
              {isPlaying ? (
                <Pause className="w-6 h-6 fill-current" />
              ) : (
                <Play className="w-6 h-6 fill-current translate-x-0.5" />
              )}
            </button>

            <div>
              <div className="text-sm font-bold text-white">
                {isPlaying
                  ? (gameState !== 'playing' ? 'Playing full track...' : 'Playing intro clip...')
                  : (gameState !== 'playing' ? 'Listen to full revealed track' : 'Listen to preview')}
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
                  isPlaying ? 'bg-[#22E06B]' : 'bg-white/15'
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

        {/* Win / Loss Result Card */}
        {gameState !== 'playing' && (
          <div
            className={`p-5 rounded-xl border mb-6 text-center animate-in zoom-in-95 duration-200 ${
              gameState === 'won'
                ? 'bg-emerald-950/40 border-[#22E06B] shadow-[0_0_30px_rgba(34,224,107,0.2)]'
                : 'bg-rose-950/30 border-rose-500/40'
            }`}
          >
            <div className="inline-flex items-center gap-1.5 text-xs font-bold font-mono tracking-widest uppercase mb-1">
              {gameState === 'won' ? (
                <span className="text-[#22E06B] flex items-center gap-1">
                  <Award className="w-4 h-4" /> Solved in {currentStage + 1} / 6 tries!
                </span>
              ) : (
                <span className="text-rose-400">Better luck next round!</span>
              )}
            </div>

            <div className="text-xl sm:text-2xl font-black text-white mt-1">
              {track.title}
            </div>
            <div className="text-sm text-[#8B8F8C] mt-0.5">
              {track.artist} · {track.album} ({track.year})
            </div>

            <div className="mt-4 flex justify-center gap-3">
              <button
                type="button"
                onClick={onPlayNext}
                className="bg-[#22E06B] hover:bg-[#2ECC71] text-[#0A0A0B] font-bold px-6 py-2.5 rounded-full text-xs transition-all shadow-[0_0_15px_rgba(34,224,107,0.3)] flex items-center gap-2 cursor-pointer"
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
                placeholder="Know the song? Search title or artist..."
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
                className="w-full bg-[#121314] border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-[#8B8F8C] focus:outline-none focus:border-[#22E06B] transition-colors"
              />

              {/* Suggestions Dropdown */}
              {showSuggestions && guessInput && filteredOptions.length > 0 && (
                <div className="absolute left-0 right-0 bottom-full mb-2 bg-[#17181a] border border-white/15 rounded-xl shadow-2xl max-h-48 overflow-y-auto z-20">
                  {filteredOptions.map((opt, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => handleGuess(opt)}
                      className="w-full text-left px-4 py-2.5 text-xs text-white hover:bg-[#22E06B]/15 hover:text-[#22E06B] transition-colors border-b border-white/5 last:border-0"
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
                className="bg-[#22E06B] hover:bg-[#2ECC71] disabled:opacity-40 disabled:cursor-not-allowed text-[#0A0A0B] font-bold px-6 py-2.5 rounded-full text-xs transition-all shadow-[0_0_15px_rgba(34,224,107,0.3)] cursor-pointer"
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
