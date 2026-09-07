import React from 'react';
import { HelpCircle } from 'lucide-react';

/**
 * TopBar component with brand badge, title, subtitle, streak counter, and help button
 * @param {Object} props
 * @param {number} props.streak - Current player streak
 * @param {Function} props.onOpenHelp - Open rules/help modal
 */
export default function TopBar({ streak = 0, onOpenHelp }) {
  return (
    <header className="w-full border-b border-white/8 bg-[#0A0A0B]/80 backdrop-blur-md sticky top-0 z-30">
      <div className="max-w-7xl mx-auto px-6 sm:px-8 h-20 flex items-center justify-between">
        {/* Left Branding */}
        <div className="flex items-center gap-3.5 select-none">
          {/* Logo Badge: ~40x40 rounded square with green fill & ST initials */}
          <div className="w-10 h-10 rounded-lg bg-[#22E06B] flex items-center justify-center shadow-[0_0_16px_rgba(34,224,107,0.3)] shrink-0">
            <span className="text-[#0A0A0B] font-black text-lg tracking-tight font-sans">
              ST
            </span>
          </div>

          <div className="flex flex-col justify-center">
            <div className="text-xl sm:text-2xl font-black text-white tracking-tight leading-none">
              SurTest
            </div>
            <div className="text-[10px] sm:text-[11px] font-semibold text-[#8B8F8C] uppercase tracking-widest-plus mt-1">
              INDIAN SONG GUESSING
            </div>
          </div>
        </div>

        {/* Right Streak & Help */}
        <div className="flex items-center gap-4 sm:gap-6">
          {/* Streak Counter */}
          <div className="flex items-center gap-2 bg-[#121314] px-3.5 py-1.5 rounded-full border border-white/8">
            <span className="text-[11px] font-bold text-[#8B8F8C] uppercase tracking-widest">
              STREAK
            </span>
            <span className="text-sm font-extrabold text-[#22E06B] font-mono tabular-nums">
              {streak}
            </span>
          </div>

          {/* Help Button: circular outline "?" */}
          <button
            type="button"
            onClick={onOpenHelp}
            aria-label="How to play"
            className="w-9 h-9 rounded-full border border-white/15 hover:border-white/40 flex items-center justify-center text-[#8B8F8C] hover:text-white hover:bg-white/5 transition-all duration-200 cursor-pointer group"
          >
            <span className="text-sm font-bold group-hover:scale-110 transition-transform">
              ?
            </span>
          </button>
        </div>
      </div>
    </header>
  );
}
