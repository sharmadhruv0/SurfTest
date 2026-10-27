import React from 'react';

/**
 * Reusable LanguageCard component with Liquid Glass aesthetic
 * @param {Object} props
 * @param {string} props.id - Language id ('all' | 'hindi' | 'punjabi' | 'haryanvi')
 * @param {string} props.nativeTitle - Native script title (e.g. 'हिंदी')
 * @param {string} props.englishName - English display name (e.g. 'Hindi')
 * @param {string} props.descriptor - Short descriptor (e.g. 'Bollywood + pop')
 * @param {boolean} props.isSelected - Whether this card is currently active
 * @param {Function} props.onSelect - Callback when clicked
 */
export default function LanguageCard({
  id,
  nativeTitle,
  englishName,
  descriptor,
  count,
  isSelected,
  onSelect
}) {
  return (
    <button
      type="button"
      onClick={() => onSelect(id)}
      className={`relative w-full text-left p-4 sm:p-5 rounded-2xl cursor-pointer flex flex-col justify-between group outline-none overflow-hidden transition-all duration-300 ${
        isSelected
          ? 'liquid-card-active-brand'
          : 'liquid-card'
      }`}
    >
      {/* Specular Highlight Rim */}
      <div className="liquid-specular-rim" />

      <div className="flex items-start justify-between gap-2 mb-3">
        {/* Script-native title with subtle glassy shadow */}
        <div className="text-2xl sm:text-3xl font-extrabold text-white tracking-wide transition-colors drop-shadow-sm">
          {nativeTitle}
        </div>
        {count !== undefined && (
          <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-white/10 text-slate-300 border border-white/15 shrink-0">
            {count} songs
          </span>
        )}
      </div>

      <div>
        {/* English Name with Emerald Accent */}
        <div className="text-sm font-bold text-[#22E06B] mb-1 flex items-center gap-1.5 drop-shadow-[0_0_8px_rgba(34,224,107,0.3)]">
          <span>{englishName}</span>
        </div>

        {/* Descriptor in readable frosted slate */}
        <div className="text-xs text-slate-300/80 leading-snug">
          {descriptor}
        </div>
      </div>

      {/* Active Liquid Jewel Dot */}
      {isSelected && (
        <span className="absolute top-3.5 right-3.5 flex h-2.5 w-2.5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#22E06B] opacity-75" />
          <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#22E06B] shadow-[0_0_10px_#22E06B]" />
        </span>
      )}
    </button>
  );
}
