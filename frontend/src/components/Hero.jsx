import React from 'react';

/**
 * Hero section for the left column
 */
export default function Hero() {
  return (
    <section className="mb-10 sm:mb-12 relative select-none">
      {/* Eyebrow Row */}
      <div className="flex items-center gap-2.5 mb-4">
        {/* Pulsing/glowing green dot */}
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#22E06B] opacity-75" />
          <span className="relative inline-flex rounded-full h-2 w-2 bg-[#22E06B] shadow-[0_0_8px_#22E06B]" />
        </span>

        <span className="text-[11px] sm:text-xs font-semibold text-[#8B8F8C] uppercase tracking-widest font-mono">
          ROUND 001 · INDIA'S SOUNDTRACK
        </span>
      </div>

      {/* Massive Two-Line Headline */}
      <h1 className="text-[44px] sm:text-[68px] lg:text-[84px] font-black tracking-tight leading-[0.95] mb-5">
        <span className="block text-[#F5F5F5]">
          Guess the song
        </span>
        <span className="block text-[#22E06B] drop-shadow-[0_0_35px_rgba(34,224,107,0.2)]">
          before the beat gets loud.
        </span>
      </h1>

      {/* Paragraph in muted gray */}
      <p className="text-[#8B8F8C] text-sm sm:text-base max-w-[500px] leading-relaxed font-normal">
        Every skip unlocks a longer moment. Six stages. One song you know by heart.
      </p>
    </section>
  );
}
