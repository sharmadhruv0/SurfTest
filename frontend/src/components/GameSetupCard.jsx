import React from 'react';
import LanguageCard from './LanguageCard';
import EraCard from './EraCard';
import ModeCard from './ModeCard';
import DifficultyPill from './DifficultyPill';
import { ERAS } from '../constants/eras.js';
import { GAME_MODES } from '../constants/modes.js';
import { TRACK_CATALOG } from '../data/tracks.js';
import { Calendar, AlertTriangle, RefreshCw, Sparkles } from 'lucide-react';

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
  selectedMode = 'normal',
  onSelectMode,
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

  // Lookup total track count per language
  const getCountForLanguage = (langId) => {
    if (langId === 'all') return TRACK_CATALOG.length;
    return TRACK_CATALOG.filter((t) => t.language.toLowerCase() === langId.toLowerCase()).length;
  };

  return (
    <div className="liquid-panel rounded-3xl p-6 sm:p-9 relative overflow-hidden transition-all duration-300">
      {/* Top Specular Rim Glare */}
      <div className="liquid-specular-rim" />

      {/* STEP 1: CHOOSE YOUR SOUND (LANGUAGE) */}
      <div className="mb-8 sm:mb-10">
        <div className="text-[11px] font-bold text-slate-400 uppercase tracking-widest-plus mb-4 flex items-center justify-between">
          <span className="flex items-center gap-2">
            <span className="text-[#22E06B]">01</span>
            <span>CHOOSE YOUR SOUND</span>
          </span>
          <span className="text-[10px] font-mono font-bold text-[#22E06B] liquid-pill px-3 py-1 rounded-full border-[#22E06B]/30">
            {selectedLanguage === 'all' ? 'MIXED LANGUAGES' : selectedLanguage.toUpperCase()}
          </span>
        </div>

        {/* 4 Language Cards Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
          {LANGUAGES.map((lang) => (
            <LanguageCard
              key={lang.id}
              id={lang.id}
              nativeTitle={lang.nativeTitle}
              englishName={lang.englishName}
              descriptor={lang.descriptor}
              count={getCountForLanguage(lang.id)}
              isSelected={selectedLanguage === lang.id}
              onSelect={onSelectLanguage}
            />
          ))}
        </div>
      </div>

      {/* STEP 2: CHOOSE YOUR ERA (TIME PERIOD) */}
      <div className="mb-8 sm:mb-10 pt-7 border-t border-white/[0.08]">
        <div className="text-[11px] font-bold text-slate-400 uppercase tracking-widest-plus mb-4 flex items-center justify-between">
          <span className="flex items-center gap-2">
            <span className="text-amber-400">02</span>
            <span>CHOOSE YOUR ERA</span>
          </span>
          <span className="text-[10px] font-mono font-bold text-amber-300 liquid-pill px-3 py-1 rounded-full border-amber-500/30">
            {ERAS.find(e => e.id === selectedEra)?.label?.toUpperCase() || 'ALL ERAS'}
          </span>
        </div>

        {/* 5 Era Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-3.5">
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
        <div className="mb-6 p-4 rounded-2xl border border-amber-400/40 bg-gradient-to-r from-amber-500/15 via-amber-950/20 to-orange-950/20 backdrop-blur-xl text-amber-200 animate-in fade-in duration-200 shadow-[0_10px_25px_rgba(245,158,11,0.15)]">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-start gap-2.5">
              <AlertTriangle className="w-4 h-4 shrink-0 text-amber-400 mt-0.5" />
              <div className="text-xs">
                <span className="font-bold text-amber-300">
                  {isZeroPool ? 'No songs found' : `Thin catalog (${tracksCount} songs)`} in this combo:
                </span>{' '}
                <span className="text-amber-200/90">
                  {selectedLanguage.toUpperCase()} + {ERAS.find(e => e.id === selectedEra)?.label}. Not enough songs in this combo yet, try Mixed for the best experience!
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => onSelectEra('all')}
              className="self-start sm:self-center px-3.5 py-1.5 rounded-xl bg-amber-500/25 hover:bg-amber-500/35 border border-amber-400/50 text-xs font-bold text-amber-300 transition-all cursor-pointer flex items-center gap-1.5 shrink-0 shadow-sm"
            >
              <RefreshCw className="w-3 h-3" />
              <span>Switch to All Eras</span>
            </button>
          </div>
        </div>
      )}

      {/* STEP 3: CHOOSE PLAY MODE (NORMAL, REVERSE & ANTAKSHARI) */}
      <div className="mb-8 sm:mb-10 pt-7 border-t border-white/[0.08]">
        <div className="text-[11px] font-bold text-slate-400 uppercase tracking-widest-plus mb-4 flex items-center justify-between">
          <span className="flex items-center gap-2">
            <span className="text-purple-400">03</span>
            <span>CHOOSE PLAY MODE</span>
          </span>
          <span
            className={`text-[10px] font-mono font-bold px-3 py-1 rounded-full border backdrop-blur-md ${
              selectedMode === 'antakshari'
                ? 'text-amber-300 bg-amber-500/15 border-amber-500/35 shadow-[0_0_12px_rgba(245,158,11,0.2)]'
                : selectedMode === 'reverse'
                ? 'text-purple-300 bg-purple-500/15 border-purple-500/35 shadow-[0_0_12px_rgba(168,85,247,0.2)]'
                : 'text-[#22E06B] bg-[#22E06B]/10 border-[#22E06B]/30 shadow-[0_0_12px_rgba(34,224,107,0.2)]'
            }`}
          >
            {selectedMode === 'antakshari'
              ? 'ANTAKSHARI MODE 🔗'
              : selectedMode === 'reverse'
              ? 'REVERSED MODE 🔄'
              : 'NORMAL MODE ▶'}
          </span>
        </div>

        {/* 3 Game Mode Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 sm:gap-4">
          {GAME_MODES.map((mode) => (
            <ModeCard
              key={mode.id}
              id={mode.id}
              label={mode.label}
              shortLabel={mode.shortLabel}
              tagline={mode.tagline}
              badge={mode.badge}
              copy={mode.copy}
              isSelected={selectedMode === mode.id}
              onSelect={onSelectMode}
            />
          ))}
        </div>

        {/* Reverse Mode Callout Banner when selected */}
        {selectedMode === 'reverse' && (
          <div className="mt-4 p-4 rounded-2xl border border-purple-400/40 bg-gradient-to-r from-purple-900/30 via-indigo-950/25 to-purple-950/20 backdrop-blur-xl text-purple-200 text-xs flex items-start gap-3 animate-in fade-in duration-200 shadow-[0_10px_25px_rgba(168,85,247,0.15)]">
            <span className="text-lg leading-none mt-0.5">🔄</span>
            <div>
              <span className="font-bold text-purple-300">Reverse Mode Active: </span>
              <span className="text-purple-200/90">
                Audio is played completely backwards! Test your ear on reversed melodies, inverted beats, and upside-down vocals.
              </span>
            </div>
          </div>
        )}

        {/* Antakshari Mode Callout Banner when selected */}
        {selectedMode === 'antakshari' && (
          <div className="mt-4 p-4 rounded-2xl border border-amber-400/40 bg-gradient-to-r from-amber-900/30 via-orange-950/25 to-amber-950/20 backdrop-blur-xl text-amber-200 text-xs flex items-start gap-3 animate-in fade-in duration-200 shadow-[0_10px_25px_rgba(245,158,11,0.15)]">
            <span className="text-lg leading-none mt-0.5">🔗</span>
            <div>
              <span className="font-bold text-amber-300">Antakshari Mode Active: </span>
              <span className="text-amber-200/90">
                Classic Desi Antakshari! Every song you guess connects to the next song on its ending sound syllable (...Ho → H → Hawayein). Chain as many songs as you can!
              </span>
            </div>
          </div>
        )}
      </div>

      {/* STEP 4: SET THE VIBE (DIFFICULTY & HOOK) */}
      <div className="mb-8 sm:mb-10 pt-7 border-t border-white/[0.08]">
        <div className="text-[11px] font-bold text-slate-400 uppercase tracking-widest-plus mb-4 flex items-center justify-between">
          <span className="flex items-center gap-2">
            <span className="text-cyan-400">04</span>
            <span>SET THE VIBE</span>
          </span>
          <span className="text-[10px] font-mono text-slate-400">Escalation Difficulty</span>
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
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 py-2 px-3 rounded-2xl bg-white/[0.02] border border-white/[0.06] backdrop-blur-md">
          {/* Hook Toggle */}
          <div
            className="flex items-center gap-3.5 cursor-pointer select-none group"
            onClick={onToggleHook}
          >
            {/* Liquid Switch Track */}
            <div
              className={`w-12 h-6.5 rounded-full transition-all duration-300 relative p-0.5 border shadow-[inset_0_2px_4px_rgba(0,0,0,0.5)] ${
                startFromHook
                  ? 'bg-gradient-to-r from-[#22E06B] to-[#1cb857] border-[#22E06B]/50 shadow-[0_0_12px_rgba(34,224,107,0.4)]'
                  : 'bg-black/50 border-white/10'
              }`}
            >
              <div
                className={`w-5.5 h-5.5 rounded-full transition-all duration-300 shadow-[0_2px_4px_rgba(0,0,0,0.4),inset_0_1px_1px_rgba(255,255,255,0.7)] ${
                  startFromHook
                    ? 'translate-x-5.5 bg-white'
                    : 'translate-x-0 bg-slate-400'
                }`}
              />
            </div>

            <div className="flex flex-col">
              <span className="text-sm font-bold text-white group-hover:text-[#22E06B] transition-colors">
                Start from hook
              </span>
              <span className="text-xs text-slate-400">
                Jump straight into the chorus
              </span>
            </div>
          </div>

          {/* Right Track Count Helper */}
          <div className="text-xs text-slate-300 font-mono tracking-wide flex items-center gap-2 self-start sm:self-center px-3 py-1.5 rounded-xl liquid-pill">
            <span className="w-2 h-2 rounded-full bg-[#22E06B] shadow-[0_0_8px_#22E06B] animate-pulse" />
            <span className="text-white font-extrabold">{tracksCount}</span>
            <span className="text-slate-400">tracks available</span>
          </div>
        </div>
      </div>

      {/* ACTION ROW */}
      <div className="pt-7 border-t border-white/[0.08] flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5">
        {/* Primary Liquid Button */}
        <button
          type="button"
          onClick={onStartRound}
          className={`${
            selectedMode === 'antakshari'
              ? 'liquid-btn-amber'
              : selectedMode === 'reverse'
              ? 'liquid-btn-purple'
              : 'liquid-btn-brand'
          } font-black text-sm sm:text-base px-8 py-4 rounded-2xl cursor-pointer flex items-center justify-center gap-2.5 group`}
        >
          <span>
            {selectedMode === 'antakshari'
              ? 'Start Antakshari Chain 🔗'
              : selectedMode === 'reverse'
              ? 'Start Reverse Round 🔄'
              : 'Start a round'}
          </span>
          <span className="font-mono text-lg font-black transition-transform group-hover:translate-x-1">
            →
          </span>
        </button>

        {/* Secondary Liquid Button: Daily challenge */}
        <button
          type="button"
          onClick={onStartDaily}
          className="liquid-btn-ghost text-slate-200 font-bold px-6 py-4 rounded-2xl cursor-pointer flex items-center justify-center gap-2.5 text-sm"
        >
          <Calendar className="w-4 h-4 text-slate-400 group-hover:text-white" />
          <span>Daily challenge</span>
        </button>
      </div>
    </div>
  );
}
