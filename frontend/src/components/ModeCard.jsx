import React from 'react';
import { Play, RotateCcw, Link2 } from 'lucide-react';

/**
 * ModeCard component for selecting Normal, Reverse, or Antakshari game modes styled with Liquid Glass
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
  const isAntakshari = id === 'antakshari';

  const getCardClasses = () => {
    if (isSelected) {
      if (isAntakshari) return 'liquid-card-active-amber';
      if (isReverse) return 'liquid-card-active-purple';
      return 'liquid-card-active-brand';
    }
    return 'liquid-card';
  };

  return (
    <button
      type="button"
      onClick={() => onSelect(id)}
      className={`relative w-full text-left p-4 sm:p-5 rounded-2xl cursor-pointer flex flex-col justify-between group outline-none overflow-hidden transition-all duration-300 ${getCardClasses()}`}
    >
      {/* Specular Top Rim */}
      <div className="liquid-specular-rim" />

      {/* Top row: Glass Icon + Mode badge */}
      <div className="flex items-center justify-between gap-2 mb-3">
        <div
          className={`w-9 h-9 rounded-xl border flex items-center justify-center transition-all group-hover:scale-105 ${
            isSelected
              ? isAntakshari
                ? 'bg-amber-400/25 border-amber-400/50 text-amber-300 shadow-[0_0_15px_rgba(245,158,11,0.35)]'
                : isReverse
                ? 'bg-purple-500/25 border-purple-400/50 text-purple-200 shadow-[0_0_15px_rgba(168,85,247,0.35)]'
                : 'bg-[#22E06B]/25 border-[#22E06B]/50 text-[#22E06B] shadow-[0_0_15px_rgba(34,224,107,0.35)]'
              : isAntakshari
                ? 'bg-amber-500/10 border-amber-500/20 text-amber-400'
                : isReverse
                ? 'bg-purple-500/10 border-purple-500/20 text-purple-400'
                : 'bg-white/10 border-white/15 text-slate-300 group-hover:text-white'
          }`}
        >
          {isAntakshari ? (
            <Link2 className="w-5 h-5 transition-transform group-hover:rotate-12" />
          ) : isReverse ? (
            <RotateCcw className="w-5 h-5 transition-transform group-hover:-rotate-45" />
          ) : (
            <Play className="w-5 h-5 fill-current translate-x-0.5" />
          )}
        </div>

        <span
          className={`text-[10px] font-mono font-bold tracking-wider px-2.5 py-0.5 rounded-full border backdrop-blur-md ${
            isAntakshari
              ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 shadow-[inset_0_1px_0_rgba(255,255,255,0.2)]'
              : isReverse
              ? 'bg-purple-500/20 text-purple-300 border-purple-500/40 shadow-[inset_0_1px_0_rgba(255,255,255,0.2)]'
              : 'bg-[#22E06B]/20 text-[#22E06B] border-[#22E06B]/35 shadow-[inset_0_1px_0_rgba(255,255,255,0.2)]'
          }`}
        >
          {badge}
        </span>
      </div>

      {/* Mode Title + Tagline */}
      <div className="mb-2">
        <div className="flex items-center gap-2">
          <div className="text-base sm:text-lg font-extrabold text-white group-hover:text-white leading-tight flex items-center gap-1.5 drop-shadow-sm">
            {isReverse && (
              <span className="inline-block transform -scale-x-100 text-purple-400">
                ↺
              </span>
            )}
            {isAntakshari && (
              <span className="text-amber-400">🔗</span>
            )}
            <span>{label}</span>
          </div>
          {isAntakshari && (
            <span className="text-[9px] font-mono font-black uppercase tracking-wider px-1.5 py-0.5 rounded-full bg-amber-400/90 text-black shadow-sm">
              NEW
            </span>
          )}
          {isReverse && (
            <span className="text-[9px] font-mono font-black uppercase tracking-wider px-1.5 py-0.5 rounded-full bg-purple-500/90 text-white shadow-sm">
              HOT
            </span>
          )}
        </div>

        <div
          className={`text-xs font-semibold mt-1 ${
            isAntakshari
              ? 'text-amber-300'
              : isReverse
              ? 'text-purple-300'
              : 'text-[#22E06B]'
          }`}
        >
          {tagline}
        </div>
      </div>

      {/* Copy / Explainer in readable frosted slate */}
      <div className="text-xs text-slate-300/80 leading-snug line-clamp-2 mt-1">
        {copy}
      </div>

      {/* Active selection glowing jewel indicator */}
      {isSelected && (
        <span className="absolute top-3.5 right-3.5 flex h-2.5 w-2.5">
          <span
            className={`relative inline-flex rounded-full h-2.5 w-2.5 ${
              isAntakshari
                ? 'bg-amber-400 shadow-[0_0_10px_#F59E0B]'
                : isReverse
                ? 'bg-purple-400 shadow-[0_0_10px_#C084FC]'
                : 'bg-[#22E06B] shadow-[0_0_10px_#22E06B]'
            }`}
          />
        </span>
      )}
    </button>
  );
}
