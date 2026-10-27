import React from 'react';
import { Sparkles, Film, Play } from 'lucide-react';

/**
 * Hero section styled with Liquid Glass aesthetic
 */
export default function Hero({ onOpenTrailer }) {
  return (
    <section className="mb-10 sm:mb-12 relative select-none">
      {/* Top Row: Glass Eyebrow Pill + Watch Intro Video Button */}
      <div className="flex flex-wrap items-center gap-3 mb-5">
        <div className="inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-full liquid-pill group cursor-default">
          {/* Pulsing Liquid Glow Indicator */}
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#22E06B] opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-[#22E06B] shadow-[0_0_10px_#22E06B]" />
          </span>

          <span className="text-[10px] sm:text-[11px] font-bold text-slate-300 uppercase tracking-widest font-mono">
            ROUND 001 · INDIA'S SOUNDTRACK
          </span>

          <span className="w-1 h-1 rounded-full bg-white/20" />
          <span className="text-[10px] font-mono text-[#22E06B] font-semibold flex items-center gap-1">
            <Sparkles className="w-3 h-3 animate-pulse" />
            <span>LIVE</span>
          </span>
        </div>

        {onOpenTrailer && (
          <button
            type="button"
            onClick={onOpenTrailer}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full liquid-btn-ghost text-[11px] font-mono font-bold text-cyan-300 hover:text-white border-cyan-500/35 cursor-pointer group"
          >
            <Film className="w-3.5 h-3.5 text-[#22E06B] group-hover:scale-110 transition-transform" />
            <span>Watch How to Play (28s Video)</span>
            <Play className="w-2.5 h-2.5 fill-current text-cyan-300" />
          </button>
        )}
      </div>

      {/* Massive Headline with Liquid Iridescent Gradient */}
      <h1 className="text-[42px] sm:text-[68px] lg:text-[82px] font-black tracking-tight leading-[0.94] mb-5">
        <span className="block text-white drop-shadow-[0_4px_16px_rgba(0,0,0,0.5)]">
          Guess the song
        </span>
        <span className="block bg-gradient-to-r from-[#22E06B] via-[#3bf487] to-[#06b6d4] bg-clip-text text-transparent drop-shadow-[0_0_35px_rgba(34,224,107,0.35)]">
          before the beat gets loud.
        </span>
      </h1>

      {/* Paragraph in Liquid Frosted Styling */}
      <p className="text-slate-300/90 text-sm sm:text-base max-w-[520px] leading-relaxed font-normal">
        Every skip unlocks a longer moment. Six stages of escalating audio. One iconic Indian song you know by heart.
      </p>
    </section>
  );
}
