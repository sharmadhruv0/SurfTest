import React from 'react';
import LanguageCard from './LanguageCard';
import EraCard from './EraCard';
import DifficultyPill from './DifficultyPill';
import { ERAS } from '../constants/eras';
import { Calendar, AlertTriangle, RefreshCw } from 'lucide-react';

const LANGUAGES = [
  {
    id: 'all',
    nativeTitle: 'देसी',
    englishName: 'All Languages',
    descriptor: 'Hindi, Punjabi & Haryanvi mix'
  },
  {
    id: 'hindi',
    nativeTitle: 'हिंदी',
    englishName: 'Hindi',
    descriptor: 'Bollywood classics & pop'
  },
  {
    id: 'punjabi',
    nativeTitle: 'ਪੰਜਾਬੀ',
    englishName: 'Punjabi',
    descriptor: 'Bhangra, hip-hop & pop'
  },
  {
    id: 'haryanvi',
    nativeTitle: 'हरियाणवी',
    englishName: 'Haryanvi',
    descriptor: 'Desi anthems & folk beats'
  }
];

const DIFFICULTIES = [
  { id: 'easy', number: '01', label: 'Easy' },
  { id: 'medium', number: '02', label: 'Medium' },
  { id: 'hard', number: '03', label: 'Hard' },
  { id: 'expert', number: '04', label: 'Expert' },
  { id: 'impossible', number: '05', label: 'Impossible' }
];

export default function GameSetupCard({
  selectedLanguage,
  onSelectLanguage,
  selectedEra = 'all',
  onSelectEra,
  eraStats = [],
  selectedDifficulty,
  onSelectDifficulty,
  startFromHook,
  onToggleHook,
  tracksCount = 0,
  onStartRound,
  onStartDaily
}) {
  const isThinPool = tracksCount > 0 && tracksCount < 10;
  const isZeroPool = tracksCount === 0;

  // Lookup track count per era for the currently selected language
  const getCountForEra = (eraId) => {
    const found = eraStats.find((e) => e.id === eraId);
    if (!found) return 0;
    return found.total !== undefined ? found.total : 0;
  };

  return (
    <div className="bg-[#101111] border border-white/8 rounded-2xl p-5 sm:p-8 shadow-[0_20px_40px_rgba(0,0,0,0.6)] relative">
      {/* STEP 1: CHOOSE YOUR SOUND (LANGUAGE) */}
      <div className="mb-8">
        <div className="text-[11px] font-semibold text-[#8B8F8C] uppercase tracking-widest-plus mb-4 flex items-center justify-between">
          <span>01 / CHOOSE YOUR SOUND</span>
          <span className="text-[10px] font-mono text-[#22E06B] bg-[#22E06B]/10 px-2 py-0.5 rounded-full">
            {selectedLanguage === 'all' ? 'MIXED LANGUAGES' : selectedLanguage.toUpperCase()}
          </span>
        </div>

        {/* 4 Language Cards Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
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

      {/* STEP 2: CHOOSE YOUR ERA (TIME PERIOD) */}
      <div className="mb-8 pt-6 border-t border-white/5">
        <div className="text-[11px] font-semibold text-[#8B8F8C] uppercase tracking-widest-plus mb-4 flex items-center justify-between">
          <span>02 / CHOOSE YOUR ERA</span>
          <span className="text-[10px] font-mono text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded-full">
            {ERAS.find(e => e.id === selectedEra)?.label?.toUpperCase() || 'ALL ERAS'}
          </span>
        </div>

        {/* 5 Era Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {ERAS.map((era) => (
            <EraCard
              key={era.id}
              id={era.id}
              label={era.label}
              range={era.range}
              period={era.period}
              tagline={era.tagline}
              iconName={era.iconName}
              count={getCountForEra(era.id)}
              isSelected={selectedEra === era.id}
              onSelect={onSelectEra}
            />
          ))}
        </div>
      </div>

      {/* THIN POOL WARNING BANNER (if < 10 songs in combo) */}
      {(isThinPool || isZeroPool) && (
        <div className="mb-6 p-4 rounded-xl border border-amber-500/30 bg-amber-950/20 text-amber-200 animate-in fade-in duration-200">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-start gap-2.5">
              <AlertTriangle className="w-4 h-4 shrink-0 text-amber-400 mt-0.5" />
              <div className="text-xs">
                <span className="font-semibold text-amber-300">
                  {isZeroPool ? 'No songs found' : `Thin catalog (${tracksCount} songs)`} in this combo:
                </span>{' '}
                <span className="text-amber-200/80">
                  {selectedLanguage.toUpperCase()} + {ERAS.find(e => e.id === selectedEra)?.label}. Not enough songs in this combo yet, try Mixed for the best experience!
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => onSelectEra('all')}
              className="self-start sm:self-center px-3.5 py-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-xs font-semibold text-amber-300 transition-colors cursor-pointer flex items-center gap-1.5 shrink-0"
            >
              <RefreshCw className="w-3 h-3" />
              <span>Switch to All Eras</span>
            </button>
          </div>
        </div>
      )}

      {/* STEP 3: SET THE VIBE (DIFFICULTY & HOOK) */}
      <div className="mb-8 pt-6 border-t border-white/5">
        <div className="text-[11px] font-semibold text-[#8B8F8C] uppercase tracking-widest-plus mb-4">
          03 / SET THE VIBE
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
                Jump straight into the chorus
              </span>
            </div>
          </div>

          {/* Right Track Count Helper */}
          <div className="text-xs text-[#8B8F8C] font-mono tracking-wide flex items-center gap-1.5 self-start sm:self-center">
            <span className="w-1.5 h-1.5 rounded-full bg-[#22E06B]" />
            <span className="text-white font-bold">{tracksCount}</span>
            <span>tracks available</span>
          </div>
        </div>
      </div>

      {/* ACTION ROW */}
      <div className="pt-6 border-t border-white/5 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        {/* Primary Button */}
        <button
          type="button"
          onClick={onStartRound}
          className="bg-[#22E06B] hover:bg-[#2ECC71] text-[#0A0A0B] font-extrabold px-7 py-3.5 rounded-full transition-all duration-200 shadow-[0_0_20px_rgba(34,224,107,0.35)] flex items-center justify-center gap-2 cursor-pointer active:scale-95 group"
        >
          <span>Start a round</span>
          <span className="font-mono text-base font-bold transition-transform group-hover:translate-x-0.5">
            &gt;
          </span>
        </button>

        {/* Secondary Button: Daily challenge per era/language */}
        <button
          type="button"
          onClick={onStartDaily}
          className="bg-transparent hover:bg-white/5 text-[#F5F5F5] font-semibold px-6 py-3.5 rounded-full border border-white/12 hover:border-white/30 transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer active:scale-95 text-sm"
        >
          <Calendar className="w-4 h-4 text-[#8B8F8C]" />
          <span>Daily challenge</span>
        </button>
      </div>
    </div>
  );
}
