import React, { useState, useEffect } from 'react';
import StatBlock from './StatBlock';
import HowItWorksStep from './HowItWorksStep';
import { SlidersHorizontal, Headphones, RotateCcw, Play, Link2, Zap } from 'lucide-react';

/**
 * Listening Log Sidebar Panel styled with Liquid Glass aesthetic
 * Supports separate stats tracking for Normal, Reverse, Antakshari, and 60s Blitz modes.
 */
export default function SidebarPanel({ stats, selectedMode = 'normal', onSelectMode, onOpenSettings }) {
  const [activeTab, setActiveTab] = useState(selectedMode);

  useEffect(() => {
    setActiveTab(selectedMode);
  }, [selectedMode]);

  const handleTabChange = (mode) => {
    setActiveTab(mode);
    if (onSelectMode) {
      onSelectMode(mode);
    }
  };

  // Extract stats for the active mode tab
  const modeStats = stats?.[activeTab] || (activeTab === 'normal' ? stats : { played: 0, winRate: 0, bestStreak: 0, bestChain: 0, bestScore: 0 });
  const played = modeStats.played ?? 0;
  const winRate = modeStats.winRate ?? 0;
  const bestStreak = modeStats.bestStreak ?? 0;
  const bestChain = modeStats.bestChain ?? modeStats.bestStreak ?? 0;
  const bestBlitzScore = modeStats.bestScore ?? 0;

  const isReverse = activeTab === 'reverse';
  const isAntakshari = activeTab === 'antakshari';
  const isBlitz = activeTab === 'blitz';

  return (
    <aside className="lg:sticky lg:top-28 space-y-4">
      <div className="liquid-panel rounded-3xl p-6 sm:p-7 relative overflow-hidden transition-all duration-300">
        {/* Top Specular Rim Glare */}
        <div className="liquid-specular-rim" />

        {/* Header Row */}
        <div className="flex items-center justify-between pb-4 border-b border-white/[0.08]">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest-plus flex items-center gap-2">
            <span>YOUR LISTENING LOG</span>
            <span className="w-1.5 h-1.5 rounded-full bg-[#22E06B] animate-pulse" />
          </span>
          <button
            type="button"
            onClick={onOpenSettings}
            aria-label="Filter or stats settings"
            className="liquid-btn-ghost p-2 rounded-xl text-slate-400 hover:text-white cursor-pointer"
          >
            <SlidersHorizontal className="w-4 h-4" />
          </button>
        </div>

        {/* Liquid Glass Mode Switcher Tabs */}
        <div className="pt-4 pb-3">
          <div className="grid grid-cols-4 gap-1 p-1.5 rounded-2xl liquid-pill border-white/[0.08]">
            <button
              type="button"
              onClick={() => handleTabChange('normal')}
              className={`py-2 px-1 rounded-xl text-[10px] font-bold transition-all flex items-center justify-center gap-1 cursor-pointer ${
                activeTab === 'normal'
                  ? 'liquid-btn-brand text-black'
                  : 'text-slate-400 hover:text-white hover:bg-white/[0.06]'
              }`}
            >
              <Play className="w-3 h-3 fill-current" />
              <span>Normal</span>
            </button>

            <button
              type="button"
              onClick={() => handleTabChange('reverse')}
              className={`py-2 px-1 rounded-xl text-[10px] font-bold transition-all flex items-center justify-center gap-1 cursor-pointer ${
                activeTab === 'reverse'
                  ? 'liquid-btn-purple text-white'
                  : 'text-slate-400 hover:text-purple-300 hover:bg-white/[0.06]'
              }`}
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reverse</span>
            </button>

            <button
              type="button"
              onClick={() => handleTabChange('antakshari')}
              className={`py-2 px-1 rounded-xl text-[10px] font-bold transition-all flex items-center justify-center gap-1 cursor-pointer ${
                activeTab === 'antakshari'
                  ? 'liquid-btn-amber text-black'
                  : 'text-slate-400 hover:text-amber-300 hover:bg-white/[0.06]'
              }`}
            >
              <Link2 className="w-3 h-3" />
              <span>Chain</span>
            </button>

            <button
              type="button"
              onClick={() => handleTabChange('blitz')}
              className={`py-2 px-1 rounded-xl text-[10px] font-bold transition-all flex items-center justify-center gap-1 cursor-pointer ${
                activeTab === 'blitz'
                  ? 'liquid-btn-cyan text-black'
                  : 'text-slate-400 hover:text-cyan-300 hover:bg-white/[0.06]'
              }`}
            >
              <Zap className="w-3 h-3 fill-current" />
              <span>Blitz</span>
            </button>
          </div>
        </div>

        {/* Stats Row (Three equal columns) */}
        <div className="grid grid-cols-3 gap-2.5 py-4 border-b border-white/[0.08]">
          {isBlitz ? (
            <>
              <StatBlock label="RUNS" value={played} />
              <StatBlock label="BEST RUN" value={`${bestBlitzScore} ⚡`} />
              <StatBlock label="BEST COMBO" value={bestStreak} />
            </>
          ) : isAntakshari ? (
            <>
              <StatBlock label="CHAINS" value={played} />
              <StatBlock label="BEST CHAIN" value={`${bestChain} 🔗`} />
              <StatBlock label="SONGS" value={modeStats.totalChained || played * 3} />
            </>
          ) : (
            <>
              <StatBlock label="PLAYED" value={played} />
              <StatBlock label="WIN RATE" value={`${winRate}%`} />
              <StatBlock label="STREAK" value={bestStreak} />
            </>
          )}
        </div>

        {/* Quote Block with Liquid Glass Capsule */}
        <div className="py-5 border-b border-white/[0.08] flex items-start gap-3.5">
          <div
            className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 mt-0.5 border backdrop-blur-md shadow-sm ${
              isBlitz
                ? 'bg-cyan-500/20 border-cyan-500/40 text-cyan-300 shadow-[0_0_12px_rgba(6,182,212,0.25)]'
                : isAntakshari
                ? 'bg-amber-500/20 border-amber-500/40 text-amber-300 shadow-[0_0_12px_rgba(245,158,11,0.25)]'
                : isReverse
                ? 'bg-purple-500/20 border-purple-500/40 text-purple-300 shadow-[0_0_12px_rgba(168,85,247,0.25)]'
                : 'bg-[#22E06B]/20 border-[#22E06B]/40 text-[#22E06B] shadow-[0_0_12px_rgba(34,224,107,0.25)]'
            }`}
          >
            {isBlitz ? (
              <Zap className="w-4 h-4 fill-current" />
            ) : isAntakshari ? (
              <Link2 className="w-4 h-4" />
            ) : isReverse ? (
              <RotateCcw className="w-4 h-4" />
            ) : (
              <Headphones className="w-4 h-4" />
            )}
          </div>
          <div>
            <p className="text-sm font-medium italic text-white leading-snug">
              {isBlitz
                ? '“60 seconds on the clock. Every hit buys you +3 seconds!”'
                : isAntakshari
                ? '“Baithe baithe kya karein, karna hai kuch kaam, shuru karo Antakshari!”'
                : isReverse
                ? '“Listen backwards, guess forwards. Can you un-hear this?”'
                : '“The first note is all you need.”'}
            </p>
            <span className="text-xs text-slate-400 block mt-1.5 font-normal">
              {isBlitz
                ? '— Surftest 60s Speedrun Blitz'
                : isAntakshari
                ? '— the timeless Desi Antakshari tradition'
                : isReverse
                ? '— Surftest Reverse Challenge'
                : '— every Indian music lover'}
            </span>
          </div>
        </div>

        {/* How It Works List */}
        <div className="pt-5 pb-5">
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-widest-plus mb-3 flex items-center justify-between">
            <span>HOW IT WORKS</span>
            <span
              className={`text-[9px] font-mono font-bold px-2 py-0.5 rounded-full border backdrop-blur-md ${
                isBlitz
                  ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/35'
                  : isAntakshari
                  ? 'bg-amber-500/20 text-amber-300 border-amber-500/35'
                  : isReverse
                  ? 'bg-purple-500/20 text-purple-300 border-purple-500/35'
                  : 'bg-white/10 text-slate-300 border-white/15'
              }`}
            >
              {isBlitz ? '60s BLITZ ⚡' : isAntakshari ? 'CHAIN RULES 🔗' : isReverse ? 'REVERSED RULES' : 'STANDARD'}
            </span>
          </div>

          <div className="space-y-2">
            <HowItWorksStep
              number="01"
              title={isBlitz ? '60s Countdown' : isAntakshari ? 'Guess the song' : 'Press play'}
              description={
                isBlitz
                  ? 'Songs play back-to-back automatically as soon as the clock starts'
                  : isAntakshari
                  ? 'Identify the track using standard audio escalation (1s → 16s)'
                  : isReverse
                  ? 'Hear a backwards audio snippet'
                  : 'Hear a tiny forward clip'
              }
            />
            <HowItWorksStep
              number="02"
              title={isBlitz ? '+3s Bonus Per Hit' : isAntakshari ? 'Connect on sound' : 'Skip to unlock'}
              description={
                isBlitz
                  ? 'Every correct guess adds +3 seconds to your timer & boosts your combo'
                  : isAntakshari
                  ? 'Next song starts with the sound this song ended on (...Ho → H)'
                  : 'Every stage gives more context'
              }
            />
            <HowItWorksStep
              number="03"
              title={isBlitz ? 'Pass Anytime' : isAntakshari ? 'Build your chain' : 'Guess forwards'}
              description={
                isBlitz
                  ? 'Stuck on a track? Hit Pass to jump straight to the next hook!'
                  : isAntakshari
                  ? 'Keep the chain alive! Chain break displays your total score'
                  : isReverse
                  ? 'Identify the song from backwards audio'
                  : 'Before the 30s mark'
              }
            />
          </div>
        </div>

        {/* Small Glass Badge at Bottom */}
        <div className="pt-2 flex justify-start">
          <div className="liquid-pill px-3.5 py-1.5 rounded-full text-[10px] font-mono tracking-widest text-slate-400 uppercase flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-[#22E06B]" />
            <span>
              {isBlitz
                ? '60S BLITZ MODE ACTIVE'
                : isAntakshari
                ? 'ANTTAKSHARI MODE ACTIVE'
                : isReverse
                ? 'REVERSE MODE ACTIVE'
                : 'CURATED INDIA POOL'}
            </span>
          </div>
        </div>
      </div>
    </aside>
  );
}
