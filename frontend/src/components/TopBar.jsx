import React from 'react';
import { Sparkles, HelpCircle } from 'lucide-react';

/**
 * TopBar component styled with Liquid Glass aesthetic
 * @param {Object} props
 * @param {number} props.streak - Current player streak
 * @param {Function} props.onOpenHelp - Open rules/help modal
 */
export default function TopBar({ streak = 0, onOpenHelp }) {
  return (
    <header className="w-full sticky top-0 z-30 transition-all duration-300">
      {/* Liquid Frosted Glass Bar */}
      <div className="relative backdrop-blur-2xl bg-[#090d16]/65 border-b border-white/[0.12] shadow-[0_8px_32px_rgba(0,0,0,0.45)]">
        {/* Top Rim Specular Glare */}
        <div className="liquid-specular-rim" />

        <div className="max-w-7xl mx-auto px-5 sm:px-8 h-20 flex items-center justify-between">
          {/* Left Branding */}
          <div className="flex items-center gap-3.5 select-none group cursor-pointer">
            {/* Liquid Emerald Logo Icon with Glass Bevel */}
            <div className="relative w-11 h-11 rounded-xl bg-gradient-to-br from-[#3bf487] via-[#22E06B] to-[#12a348] flex items-center justify-center shadow-[0_0_24px_rgba(34,224,107,0.45),inset_0_1px_2px_rgba(255,255,255,0.8),inset_0_-1px_2px_rgba(0,0,0,0.3)] shrink-0 group-hover:scale-105 transition-all duration-300">
              {/* Internal Gloss Refraction */}
              <div className="absolute top-0 inset-x-0 h-1/2 bg-gradient-to-b from-white/45 to-transparent rounded-t-xl pointer-events-none" />
              <span className="text-[#04160a] font-black text-xl tracking-tight font-sans drop-shadow-sm">
                ST
              </span>
            </div>

            <div className="flex flex-col justify-center">
              <div className="text-xl sm:text-2xl font-black tracking-tight leading-none bg-gradient-to-r from-white via-white/95 to-white/70 bg-clip-text text-transparent group-hover:to-[#22E06B] transition-all">
                SurTest
              </div>
              <div className="text-[10px] sm:text-[11px] font-semibold text-slate-400 uppercase tracking-widest-plus mt-1 flex items-center gap-1.5">
                <span>INDIAN SONG GUESSING</span>
                <span className="inline-block w-1 h-1 rounded-full bg-[#22E06B]/80 animate-pulse" />
              </div>
            </div>
          </div>

          {/* Right Streak & Help */}
          <div className="flex items-center gap-3 sm:gap-5">
            {/* Liquid Glass Streak Capsule */}
            <div className="liquid-pill flex items-center gap-2 px-4 py-1.5 rounded-full hover:border-white/20 transition-all">
              <span className="text-[10px] sm:text-[11px] font-bold text-slate-400 uppercase tracking-widest">
                STREAK
              </span>
              <div className="flex items-center gap-1">
                <span className="text-sm sm:text-base font-extrabold text-[#22E06B] font-mono tabular-nums drop-shadow-[0_0_8px_rgba(34,224,107,0.45)]">
                  {streak}
                </span>
                <span className="text-xs">🔥</span>
              </div>
            </div>

            {/* Liquid Glass Help Button */}
            <button
              type="button"
              onClick={onOpenHelp}
              aria-label="How to play"
              className="liquid-btn-ghost w-10 h-10 rounded-full flex items-center justify-center text-slate-300 hover:text-white cursor-pointer group"
            >
              <span className="text-sm font-bold group-hover:scale-110 transition-transform">
                ?
              </span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
