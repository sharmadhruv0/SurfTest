import React, { useState, useEffect } from 'react';
import StatBlock from './StatBlock';
import HowItWorksStep from './HowItWorksStep';
import { SlidersHorizontal, Headphones, RotateCcw, Play, Link2 } from 'lucide-react';

/**
 * Listening Log Sidebar Panel (sticky on desktop)
 * Supports separate stats tracking for Normal, Reverse, and Antakshari modes.
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
  const modeStats = stats?.[activeTab] || (activeTab === 'normal' ? stats : { played: 0, winRate: 0, bestStreak: 0, bestChain: 0 });
  const played = modeStats.played ?? 0;
  const winRate = modeStats.winRate ?? 0;
  const bestStreak = modeStats.bestStreak ?? 0;
  const bestChain = modeStats.bestChain ?? modeStats.bestStreak ?? 0;

  const isReverse = activeTab === 'reverse';
  const isAntakshari = activeTab === 'antakshari';

  return (
    <aside className="lg:sticky lg:top-28 space-y-4">
      <div className="bg-[#101111] border border-white/8 rounded-2xl p-6 sm:p-7 shadow-[0_20px_40px_rgba(0,0,0,0.6)]">
        {/* Header Row */}
        <div className="flex items-center justify-between pb-4 border-b border-white/8">
          <span className="text-[11px] font-bold text-[#8B8F8C] uppercase tracking-widest-plus">
            YOUR LISTENING LOG
          </span>
          <button
            type="button"
            onClick={onOpenSettings}
            aria-label="Filter or stats settings"
            className="p-1.5 rounded-lg text-[#8B8F8C] hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
          >
            <SlidersHorizontal className="w-4 h-4" />
          </button>
        </div>

        {/* Mode Switcher Tabs for Stats */}
        <div className="pt-4 pb-2">
          <div className="grid grid-cols-3 gap-1 p-1 bg-black/40 rounded-xl border border-white/8">
            <button
              type="button"
              onClick={() => handleTabChange('normal')}
              className={`py-1.5 px-1.5 rounded-lg text-[11px] font-semibold transition-all flex items-center justify-center gap-1 cursor-pointer ${
                activeTab === 'normal'
                  ? 'bg-[#22E06B] text-black shadow-sm font-bold'
                  : 'text-[#8B8F8C] hover:text-white hover:bg-white/5'
              }`}
            >
              <Play className="w-3 h-3 fill-current" />
              <span>Normal</span>
            </button>

            <button
              type="button"
              onClick={() => handleTabChange('reverse')}
              className={`py-1.5 px-1.5 rounded-lg text-[11px] font-semibold transition-all flex items-center justify-center gap-1 cursor-pointer ${
                activeTab === 'reverse'
                  ? 'bg-purple-600 text-white shadow-sm font-bold'
                  : 'text-[#8B8F8C] hover:text-purple-300 hover:bg-purple-950/20'
              }`}
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reverse</span>
            </button>

            <button
              type="button"
              onClick={() => handleTabChange('antakshari')}
              className={`py-1.5 px-1.5 rounded-lg text-[11px] font-semibold transition-all flex items-center justify-center gap-1 cursor-pointer ${
                activeTab === 'antakshari'
                  ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-black shadow-sm font-bold'
                  : 'text-[#8B8F8C] hover:text-amber-300 hover:bg-amber-950/20'
              }`}
            >
              <Link2 className="w-3 h-3" />
              <span>Antakshari</span>
            </button>
          </div>
        </div>

        {/* Stats Row (Three equal columns) */}
        <div className="grid grid-cols-3 gap-2 py-5 border-b border-white/8">
          {isAntakshari ? (
            <>
              <StatBlock label="CHAINS" value={played} />
              <StatBlock label="BEST CHAIN" value={`${bestChain} 🔗`} />
              <StatBlock label="TOTAL SONGS" value={modeStats.totalChained || played * 3} />
            </>
          ) : (
            <>
              <StatBlock label="PLAYED" value={played} />
              <StatBlock label="WIN RATE" value={`${winRate}%`} />
              <StatBlock label="BEST STREAK" value={bestStreak} />
            </>
          )}
        </div>

        {/* Quote Block */}
        <div className="py-6 border-b border-white/8 flex items-start gap-3.5">
          <div
            className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5 border ${
              isAntakshari
                ? 'bg-amber-900/20 border-amber-500/30 text-amber-300'
                : isReverse
                ? 'bg-purple-900/20 border-purple-500/30 text-purple-300'
                : 'bg-[#22E06B]/10 border-[#22E06B]/20 text-[#22E06B]'
            }`}
          >
            {isAntakshari ? (
              <Link2 className="w-4 h-4" />
            ) : isReverse ? (
              <RotateCcw className="w-4 h-4" />
            ) : (
              <Headphones className="w-4 h-4" />
            )}
          </div>
          <div>
            <p className="text-sm font-medium italic text-[#F5F5F5] leading-snug">
              {isAntakshari
                ? '“Baithe baithe kya karein, karna hai kuch kaam, shuru karo Antakshari!”'
                : isReverse
                ? '“Listen backwards, guess forwards. Can you un-hear this?”'
                : '“The first note is all you need.”'}
            </p>
            <span className="text-xs text-[#8B8F8C] block mt-1.5 font-normal">
              {isAntakshari
                ? '— the timeless Desi Antakshari tradition'
                : isReverse
                ? '— Surftest Reverse Challenge'
                : '— every Indian music lover'}
            </span>
          </div>
        </div>

        {/* How It Works List */}
        <div className="pt-6 pb-6">
          <div className="text-[11px] font-bold text-[#8B8F8C] uppercase tracking-widest-plus mb-4 flex items-center justify-between">
            <span>HOW IT WORKS</span>
            <span
              className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded ${
                isAntakshari
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                  : isReverse
                  ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                  : 'bg-white/10 text-[#8B8F8C]'
              }`}
            >
              {isAntakshari ? 'CHAIN RULES 🔗' : isReverse ? 'REVERSED RULES' : 'STANDARD'}
            </span>
          </div>

          <div className="space-y-4">
            <HowItWorksStep
              number="01"
              title={isAntakshari ? 'Guess the song' : 'Press play'}
              description={
                isAntakshari
                  ? 'Identify the track using standard audio escalation (1s → 16s)'
                  : isReverse
                  ? 'Hear a backwards audio snippet'
                  : 'Hear a tiny forward clip'
              }
            />
            <HowItWorksStep
              number="02"
              title={isAntakshari ? 'Connect on sound' : 'Skip to unlock'}
              description={
                isAntakshari
                  ? 'Next song starts with the sound this song ended on (...Ho → H)'
                  : 'Every stage gives more context'
              }
            />
            <HowItWorksStep
              number="03"
              title={isAntakshari ? 'Build your chain' : 'Guess forwards'}
              description={
                isAntakshari
                  ? 'Keep the chain alive! Chain break displays your total score'
                  : isReverse
                  ? 'Identify the song from backwards audio'
                  : 'Before the 30s mark'
              }
            />
          </div>
        </div>

        {/* Small Gray Pill/Badge at Bottom */}
        <div className="pt-2 flex justify-start">
          <div className="inline-flex items-center px-3 py-1 rounded-full border border-white/10 bg-white/[0.02] text-[10px] font-mono tracking-widest text-[#8B8F8C] uppercase">
            {isAntakshari
              ? '🔗 ANTAKSHARI MODE ACTIVE'
              : isReverse
              ? '🔄 REVERSE MODE ACTIVE'
              : 'BETA · CURATED INDIA POOL'}
          </div>
        </div>
      </div>
    </aside>
  );
}
