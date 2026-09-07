import React from 'react';
import LanguageCard from './LanguageCard';
import DifficultyPill from './DifficultyPill';
import { Play, Calendar, AlertCircle } from 'lucide-react';

const LANGUAGES = [
  {
    id: 'hindi',
    nativeTitle: 'हिंदी',
    englishName: 'Hindi',
    descriptor: 'Bollywood + pop'
  },
  {
    id: 'punjabi',
    nativeTitle: 'ਪੰਜਾਬੀ',
    englishName: 'Punjabi',
    descriptor: 'bhangra + Punjabi pop'
  },
  {
    id: 'haryanvi',
    nativeTitle: 'हरियाणवी',
    englishName: 'Haryanvi',
    descriptor: 'desi anthems'
  }
];

const DIFFICULTIES = [
  { id: 'easy', number: '01', label: 'Easy' },
  { id: 'medium', number: '02', label: 'Medium' },
  { id: 'hard', number: '03', label: 'Hard' },
  { id: 'expert', number: '04', label: 'Expert' },
  { id: 'impossible', number: '05', label: 'Impossible' }
];

/**
 * GameSetupCard containing Step 1, Step 2, Action Row, and Status line
 */
export default function GameSetupCard({
  selectedLanguage,
  onSelectLanguage,
  selectedDifficulty,
  onSelectDifficulty,
  startFromHook,
  onToggleHook,
  tracksCount = 3,
  isBackendOffline = false,
  onStartRound,
  onStartDaily
}) {
  return (
    <div className="bg-[#101111] border border-white/8 rounded-2xl p-6 sm:p-8 shadow-[0_20px_40px_rgba(0,0,0,0.6)] relative">
      {/* STEP 1: CHOOSE YOUR SOUND */}
      <div className="mb-8">
        <div className="text-[11px] font-semibold text-[#8B8F8C] uppercase tracking-widest-plus mb-4 flex items-center gap-2">
          <span>01 / CHOOSE YOUR SOUND</span>
        </div>

        {/* 3 Language Cards Row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
          {LANGUAGES.map((lang) => (
            <LanguageCard
              key={lang.id}
              id={lang.id}
              nativeTitle={lang.nativeTitle}
              englishName={lang.englishName}
              descriptor={lang.descriptor}
              isSelected={selectedLanguage === lang.id}
              onSelect={onSelectLanguage}
            />
          ))}
        </div>
      </div>

      {/* STEP 2: SET THE VIBE */}
      <div className="mb-8 pt-6 border-t border-white/5">
        <div className="text-[11px] font-semibold text-[#8B8F8C] uppercase tracking-widest-plus mb-4">
          02 / SET THE VIBE
        </div>

        {/* Difficulty Pills */}
        <div className="flex flex-wrap sm:flex-nowrap gap-2 sm:gap-2.5 mb-6 overflow-x-auto pb-1 scrollbar-none">
          {DIFFICULTIES.map((diff) => (
            <DifficultyPill
              key={diff.id}
              id={diff.id}
              number={diff.number}
              label={diff.label}
              isSelected={selectedDifficulty === diff.id}
              onSelect={onSelectDifficulty}
            />
          ))}
        </div>

        {/* Toggle Switch + Track Count Row */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 py-2">
          {/* Hook Toggle */}
          <div
            className="flex items-center gap-3.5 cursor-pointer select-none group"
            onClick={onToggleHook}
          >
            {/* Custom Switch Track */}
            <div
              className={`w-11 h-6 rounded-full transition-colors duration-200 relative p-0.5 ${
                startFromHook ? 'bg-[#22E06B]' : 'bg-[#1E2022]'
              }`}
            >
              <div
                className={`w-5 h-5 rounded-full transition-transform duration-200 shadow-sm ${
                  startFromHook
                    ? 'translate-x-5 bg-[#0A0A0B]'
                    : 'translate-x-0 bg-[#8B8F8C]'
                }`}
              />
            </div>

            <div className="flex flex-col">
              <span className="text-sm font-semibold text-white group-hover:text-[#F5F5F5] transition-colors">
                Start from hook
              </span>
              <span className="text-xs text-[#8B8F8C]">
                Jump into the chorus
              </span>
            </div>
          </div>

          {/* Right Track Count Helper */}
          <div className="text-xs text-[#8B8F8C] font-mono tracking-wide flex items-center gap-1.5 self-start sm:self-center">
            <span className="w-1.5 h-1.5 rounded-full bg-[#22E06B]/70" />
            <span>{tracksCount} tracks loaded</span>
          </div>
        </div>
      </div>

      {/* ACTION ROW */}
      <div className="pt-6 border-t border-white/5 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        {/* Primary Button */}
        <button
          type="button"
          onClick={onStartRound}
          disabled={isBackendOffline}
          className="bg-[#22E06B] hover:bg-[#2ECC71] text-[#0A0A0B] font-extrabold px-7 py-3.5 rounded-full transition-all duration-200 shadow-[0_0_20px_rgba(34,224,107,0.35)] flex items-center justify-center gap-2 cursor-pointer active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none group"
        >
          <span>Start a round</span>
          <span className="font-mono text-base font-bold transition-transform group-hover:translate-x-0.5">
            &gt;
          </span>
        </button>

        {/* Secondary Button */}
        <button
          type="button"
          onClick={onStartDaily}
          className="bg-transparent hover:bg-white/5 text-[#F5F5F5] font-semibold px-6 py-3.5 rounded-full border border-white/12 hover:border-white/30 transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer active:scale-95 text-sm"
        >
          <Calendar className="w-4 h-4 text-[#8B8F8C]" />
          <span>Daily challenge</span>
        </button>
      </div>

      {/* STATUS / ERROR LINE (conditionally rendered) */}
      {isBackendOffline && (
        <div className="mt-4 pt-3 flex items-center gap-2 text-xs text-rose-400 animate-in fade-in duration-200">
          <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
          <span>
            Catalog connection is offline. The shell is ready; reconnect to load previews.
          </span>
        </div>
      )}
    </div>
  );
}
