import React from 'react';
import { Heart } from 'lucide-react';

/**
 * Footer component styled with Liquid Glass aesthetic
 */
export default function Footer() {
  return (
    <footer className="w-full relative py-10 mt-20 select-none overflow-hidden">
      {/* Top Glass Refraction Hairline */}
      <div className="liquid-specular-rim" />
      <div className="absolute inset-0 bg-[#090d16]/50 backdrop-blur-xl border-t border-white/[0.08]" />

      <div className="relative max-w-7xl mx-auto px-6 sm:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] font-bold text-slate-400 uppercase tracking-widest-plus text-center sm:text-left">
        <div className="flex items-center gap-2">
          <span>BUILT FOR THE SONGS THAT RAISED US</span>
          <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" />
        </div>
        <div className="flex items-center gap-2">
          <span className="liquid-pill px-3 py-1 rounded-full text-[10px] font-mono text-slate-300">
            HINDI · PUNJABI · HARYANVI
          </span>
        </div>
      </div>
    </footer>
  );
}
