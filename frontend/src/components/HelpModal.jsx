import React from 'react';
import { X, Volume2, FastForward, CheckCircle2, Trophy, Sparkles } from 'lucide-react';

/**
 * HelpModal component styled with Liquid Glass aesthetic
 */
export default function HelpModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xl animate-in fade-in duration-250">
      <div className="liquid-modal-window rounded-3xl max-w-lg w-full p-6 sm:p-8 relative overflow-hidden">
        {/* Specular Highlight Rim */}
        <div className="liquid-specular-rim" />

        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/[0.08] mb-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-[#22E06B]/20 border border-[#22E06B]/40 flex items-center justify-center text-[#22E06B] shadow-[0_0_12px_rgba(34,224,107,0.3)]">
              <Sparkles className="w-4 h-4" />
            </div>
            <h3 className="text-lg font-black text-white tracking-wide">
              How to Play SurTest
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="liquid-btn-ghost p-1.5 rounded-full text-slate-400 hover:text-white cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Steps List */}
        <div className="space-y-4 text-sm text-slate-300">
          <div className="flex items-start gap-3.5 p-3 rounded-2xl liquid-pill border-white/[0.06]">
            <div className="w-9 h-9 rounded-xl bg-[#22E06B]/20 border border-[#22E06B]/35 flex items-center justify-center text-[#22E06B] shrink-0 mt-0.5 shadow-[0_0_10px_rgba(34,224,107,0.2)]">
              <Volume2 className="w-4 h-4" />
            </div>
            <div>
              <p className="font-bold text-white text-sm">1. Listen to the intro</p>
              <p className="text-xs text-slate-400 mt-0.5 leading-relaxed">
                Press play to hear the first 1-second snippet of an iconic Indian song.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3.5 p-3 rounded-2xl liquid-pill border-white/[0.06]">
            <div className="w-9 h-9 rounded-xl bg-cyan-500/20 border border-cyan-500/35 flex items-center justify-center text-cyan-400 shrink-0 mt-0.5 shadow-[0_0_10px_rgba(6,182,212,0.2)]">
              <FastForward className="w-4 h-4" />
            </div>
            <div>
              <p className="font-bold text-white text-sm">2. Skip or guess</p>
              <p className="text-xs text-slate-400 mt-0.5 leading-relaxed">
                Incorrect guesses or skips unlock progressively longer clips (1s, 2s, 4s, 7s, 11s, up to 16s/30s).
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3.5 p-3 rounded-2xl liquid-pill border-white/[0.06]">
            <div className="w-9 h-9 rounded-xl bg-purple-500/20 border border-purple-500/35 flex items-center justify-center text-purple-300 shrink-0 mt-0.5 shadow-[0_0_10px_rgba(168,85,247,0.2)]">
              <CheckCircle2 className="w-4 h-4" />
            </div>
            <div>
              <p className="font-bold text-white text-sm">3. Solve in as few stages as possible</p>
              <p className="text-xs text-slate-400 mt-0.5 leading-relaxed">
                Type the song title or artist to select your guess. Guess in 6 tries to keep your streak alive!
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3.5 p-3 rounded-2xl liquid-pill border-white/[0.06]">
            <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-500/35 flex items-center justify-center text-amber-300 shrink-0 mt-0.5 shadow-[0_0_10px_rgba(245,158,11,0.2)]">
              <Trophy className="w-4 h-4" />
            </div>
            <div>
              <p className="font-bold text-white text-sm">4. Regional Catalogs & Modes</p>
              <p className="text-xs text-slate-400 mt-0.5 leading-relaxed">
                Switch seamlessly between Hindi (Bollywood), Punjabi, and Haryanvi anthems, or test your ear on Reverse and Antakshari modes.
              </p>
            </div>
          </div>
        </div>

        {/* Footer Button */}
        <div className="mt-7 pt-5 border-t border-white/[0.08] flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="liquid-btn-brand text-black font-extrabold px-6 py-3 rounded-full text-xs cursor-pointer shadow-lg active:scale-95"
          >
            Got it, let's play!
          </button>
        </div>
      </div>
    </div>
  );
}
