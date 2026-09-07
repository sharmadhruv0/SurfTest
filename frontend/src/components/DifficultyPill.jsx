import React from 'react';

/**
 * Reusable DifficultyPill component
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
      className={`px-3.5 py-2 sm:px-4 sm:py-2.5 rounded-full text-xs font-semibold tracking-wide transition-all duration-200 cursor-pointer flex items-center justify-center gap-1.5 whitespace-nowrap outline-none focus-visible:ring-2 focus-visible:ring-[#22E06B] ${
        isSelected
          ? 'bg-[#22E06B] text-[#0A0A0B] shadow-[0_0_18px_rgba(34,224,107,0.3)] font-bold scale-[1.02]'
          : 'bg-[#121314]/80 text-[#8B8F8C] border border-white/8 hover:text-[#F5F5F5] hover:border-white/20 hover:bg-[#161819]'
      }`}
    >
      <span className={`text-[10px] font-mono opacity-80 ${isSelected ? 'text-[#0A0A0B]/80 font-bold' : 'text-[#8B8F8C]'}`}>
        {number}
      </span>
      <span>{label}</span>
    </button>
  );
}
