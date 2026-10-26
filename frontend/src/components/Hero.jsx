import React from 'react';
import { Sparkles, Music } from 'lucide-react';

/**
 * Hero section styled with Liquid Glass aesthetic
 */
export default function Hero() {
  return (
    <section className="mb-10 sm:mb-12 relative select-none">
      {/* Glass Eyebrow Pill */}
      <div className="inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-full liquid-pill mb-5 group cursor-default">
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
