import React from 'react';
import { X, Volume2, FastForward, CheckCircle2, Trophy } from 'lucide-react';

export default function HelpModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-[#101111] border border-white/10 rounded-2xl max-w-lg w-full p-6 sm:p-7 shadow-[0_25px_60px_rgba(0,0,0,0.9)] relative">
        <div className="flex items-center justify-between pb-4 border-b border-white/8 mb-5">
          <div className="flex items-center gap-2.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#22E06B]" />
            <h3 className="text-base font-bold text-white tracking-wide">
              How to Play SurTest
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-full text-[#8B8F8C] hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4 text-sm text-[#8B8F8C]">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-[#22E06B]/10 flex items-center justify-center text-[#22E06B] shrink-0 mt-0.5">
              <Volume2 className="w-4 h-4" />
            </div>
            <div>
              <p className="font-semibold text-[#F5F5F5]">1. Listen to the intro</p>
              <p className="text-xs mt-0.5 leading-relaxed">
                Press play to hear the first 1-second snippet of an iconic Indian song.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-[#22E06B]/10 flex items-center justify-center text-[#22E06B] shrink-0 mt-0.5">
              <FastForward className="w-4 h-4" />
            </div>
            <div>
              <p className="font-semibold text-[#F5F5F5]">2. Skip or guess</p>
              <p className="text-xs mt-0.5 leading-relaxed">
                Incorrect guesses or skips unlock progressively longer clips (1s, 2s, 4s, 7s, 11s, up to 16s/30s).
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-[#22E06B]/10 flex items-center justify-center text-[#22E06B] shrink-0 mt-0.5">
              <CheckCircle2 className="w-4 h-4" />
            </div>
            <div>
              <p className="font-semibold text-[#F5F5F5]">3. Solve in as few stages as possible</p>
              <p className="text-xs mt-0.5 leading-relaxed">
                Type the song title or artist to select your guess. Guess in 6 tries to keep your streak alive!
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-[#22E06B]/10 flex items-center justify-center text-[#22E06B] shrink-0 mt-0.5">
              <Trophy className="w-4 h-4" />
            </div>
            <div>
              <p className="font-semibold text-[#F5F5F5]">4. Regional Catalogs</p>
              <p className="text-xs mt-0.5 leading-relaxed">
                Switch seamlessly between Hindi (Bollywood), Punjabi (Bhangra/Pop), and Haryanvi (Desi Anthems).
              </p>
            </div>
          </div>
        </div>

        <div className="mt-6 pt-5 border-t border-white/8 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="bg-[#22E06B] text-[#0A0A0B] font-bold px-5 py-2.5 rounded-full text-xs hover:bg-[#2ECC71] transition-all cursor-pointer"
          >
            Got it, let's play
          </button>
        </div>
      </div>
    </div>
  );
}
