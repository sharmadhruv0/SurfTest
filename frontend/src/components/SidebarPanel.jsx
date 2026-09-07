import React from 'react';
import StatBlock from './StatBlock';
import HowItWorksStep from './HowItWorksStep';
import { SlidersHorizontal, Headphones } from 'lucide-react';

/**
 * Listening Log Sidebar Panel (sticky on desktop)
 */
export default function SidebarPanel({ stats, onOpenSettings }) {
  const { played = 0, winRate = 0, bestStreak = 0 } = stats || {};

  return (
    <aside className="lg:sticky lg:top-28 space-y-4">
      <div className="bg-[#101111] border border-white/8 rounded-2xl p-6 sm:p-7 shadow-[0_20px_40px_rgba(0,0,0,0.6)]">
        {/* Header Row */}
        <div className="flex items-center justify-between pb-5 border-b border-white/8">
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

        {/* Stats Row (Three equal columns) */}
        <div className="grid grid-cols-3 gap-2 py-6 border-b border-white/8">
          <StatBlock label="PLAYED" value={played} />
          <StatBlock label="WIN RATE" value={`${winRate}%`} />
          <StatBlock label="BEST STREAK" value={bestStreak} />
        </div>

        {/* Quote Block */}
        <div className="py-6 border-b border-white/8 flex items-start gap-3.5">
          <div className="w-8 h-8 rounded-lg bg-[#22E06B]/10 border border-[#22E06B]/20 flex items-center justify-center shrink-0 mt-0.5">
            <Headphones className="w-4 h-4 text-[#22E06B]" />
          </div>
          <div>
            <p className="text-sm font-medium italic text-[#F5F5F5] leading-snug">
              “The first note is all you need.”
            </p>
            <span className="text-xs text-[#8B8F8C] block mt-1.5 font-normal">
              — every Indian music lover
            </span>
          </div>
        </div>

        {/* How It Works List */}
        <div className="pt-6 pb-6">
          <div className="text-[11px] font-bold text-[#8B8F8C] uppercase tracking-widest-plus mb-4">
            HOW IT WORKS
          </div>

          <div className="space-y-4">
            <HowItWorksStep
              number="01"
              title="Press play"
              description="Hear a tiny clip"
            />
            <HowItWorksStep
              number="02"
              title="Skip to unlock"
              description="Every stage gets longer"
            />
            <HowItWorksStep
              number="03"
              title="Guess the song"
              description="Before the 30s mark"
            />
          </div>
        </div>

        {/* Small Gray Pill/Badge at Bottom */}
        <div className="pt-2 flex justify-start">
          <div className="inline-flex items-center px-3 py-1 rounded-full border border-white/10 bg-white/[0.02] text-[10px] font-mono tracking-widest text-[#8B8F8C] uppercase">
            BETA · CURATED INDIA POOL
          </div>
        </div>
      </div>
    </aside>
  );
}
