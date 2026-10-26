import React from 'react';

/**
 * Reusable DifficultyPill component styled with Liquid Glass aesthetic
 * @param {Object} props
 * @param {string} props.id - difficulty key ('easy' | 'medium' | 'hard' | 'expert' | 'impossible')
 * @param {string} props.number - step/difficulty numeral (e.g. '01')
 * @param {string} props.label - display label ('Easy', 'Medium', etc.)
 * @param {boolean} props.isSelected - active state
 * @param {Function} props.onSelect - callback
 */
export default function DifficultyPill({
  id,
  number,
  label,
  isSelected,
  onSelect
}) {
  return (
    <button
      type="button"
      onClick={() => onSelect(id)}
      className={`relative px-4 py-2 sm:px-4.5 sm:py-2 rounded-full text-xs font-bold tracking-wide transition-all duration-250 cursor-pointer flex items-center justify-center gap-1.5 whitespace-nowrap outline-none overflow-hidden ${
        isSelected
          ? 'liquid-btn-brand scale-[1.03]'
          : 'liquid-pill text-slate-300 hover:text-white hover:border-white/25 hover:bg-white/[0.08]'
      }`}
    >
      <span
        className={`text-[10px] font-mono ${
          isSelected ? 'text-black/80 font-black' : 'text-slate-400 font-semibold'
        }`}
      >
        {number}
      </span>
      <span>{label}</span>
    </button>
  );
}
