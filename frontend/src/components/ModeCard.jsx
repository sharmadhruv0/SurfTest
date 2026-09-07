import React from 'react';
import { Play, RotateCcw } from 'lucide-react';

/**
 * ModeCard component for selecting Normal vs Reverse game modes.
 */
export default function ModeCard({
  id,
  label,
  shortLabel,
  tagline,
  badge,
  copy,
  isSelected,
  onSelect
}) {
  const isReverse = id === 'reverse';

  return (
    <button
      type="button"
      onClick={() => onSelect(id)}
      className={`relative w-full text-left p-4 sm:p-5 rounded-xl transition-all duration-200 cursor-pointer flex flex-col justify-between group outline-none focus-visible:ring-2 border ${
        isSelected
          ? isReverse
            ? 'bg-gradient-to-br from-[#2a1236] via-[#1c0d25] to-[#120718] border-purple-500 shadow-[0_0_24px_-4px_rgba(168,85,247,0.4)] focus-visible:ring-purple-400'
            : 'bg-gradient-to-br from-[#0d2217] via-[#091710] to-[#060e0a] border-[#22E06B] shadow-[0_0_24px_-4px_rgba(34,224,107,0.3)] focus-visible:ring-[#22E06B]'
          : isReverse
            ? 'bg-[#150f1a] border-purple-900/30 hover:border-purple-600/50 hover:bg-[#1a1222]'
            : 'bg-[#121314] border-white/8 hover:border-white/20 hover:bg-[#18191b]'
      }`}
    >
      {/* Top row: Icon + Mode badge */}
      <div className="flex items-center justify-between gap-2 mb-3">
        <div
          className={`w-9 h-9 rounded-lg flex items-center justify-center transition-transform group-hover:scale-105 ${
            isSelected
              ? isReverse
                ? 'bg-purple-500/25 text-purple-300'
                : 'bg-[#22E06B]/25 text-[#22E06B]'
              : isReverse
                ? 'bg-purple-900/30 text-purple-400'
                : 'bg-white/5 text-[#8B8F8C] group-hover:text-white'
          }`}
        >
          {isReverse ? (
            <RotateCcw className="w-5 h-5 transition-transform group-hover:-rotate-45" />
          ) : (
            <Play className="w-5 h-5 fill-current translate-x-0.5" />
          )}
        </div>

        <span
          className={`text-[10px] font-mono font-bold tracking-wider px-2.5 py-0.5 rounded-full border ${
            isReverse
              ? 'bg-purple-500/15 text-purple-300 border-purple-500/40'
              : 'bg-[#22E06B]/15 text-[#22E06B] border-[#22E06B]/30'
          }`}
        >
          {badge}
        </span>
      </div>

      {/* Mode Title + Tagline */}
      <div className="mb-2">
        <div className="flex items-center gap-2">
          <div className="text-base sm:text-lg font-bold text-white group-hover:text-[#F5F5F5] leading-tight flex items-center gap-1.5">
            {isReverse && (
              <span className="inline-block transform -scale-x-100 text-purple-400">
                ↺
              </span>
            )}
            <span>{label}</span>
          </div>
          {isReverse && (
            <span className="text-[9px] font-mono font-black uppercase tracking-wider px-1.5 py-0.5 rounded bg-purple-500 text-black">
              NEW
            </span>
          )}
        </div>

        <div
          className={`text-xs font-medium mt-1 ${
            isReverse ? 'text-purple-300 font-medium' : 'text-[#22E06B]'
          }`}
        >
          {tagline}
        </div>
      </div>

      {/* Copy / Explainer */}
      <div className="text-xs text-[#8B8F8C] leading-snug line-clamp-2 mt-1">
        {copy}
      </div>

      {/* Active selection glowing dot indicator */}
      {isSelected && (
        <span
          className={`absolute top-3.5 right-3.5 w-2 h-2 rounded-full ${
            isReverse
              ? 'bg-purple-400 shadow-[0_0_8px_#C084FC]'
              : 'bg-[#22E06B] shadow-[0_0_8px_#22E06B]'
          }`}
        />
      )}
    </button>
  );
}
