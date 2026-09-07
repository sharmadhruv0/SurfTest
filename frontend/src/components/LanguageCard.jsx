import React from 'react';

/**
 * Reusable LanguageCard component for selecting catalog language
 * @param {Object} props
 * @param {string} props.id - Language id ('hindi' | 'punjabi' | 'haryanvi')
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
  isSelected,
  onSelect
}) {
  return (
    <button
      type="button"
      onClick={() => onSelect(id)}
      className={`relative w-full text-left p-5 rounded-xl transition-all duration-200 cursor-pointer flex flex-col justify-between group outline-none focus-visible:ring-2 focus-visible:ring-[#22E06B] ${
        isSelected
          ? 'bg-[#131B16] border-2 border-[#22E06B] shadow-[0_0_24px_-4px_rgba(34,224,107,0.22)]'
          : 'bg-[#121314] border border-white/8 hover:border-white/20 hover:bg-[#161819]'
      }`}
    >
      {/* Script-native title */}
      <div className="text-2xl sm:text-3xl font-bold text-[#F5F5F5] tracking-wide mb-3 transition-colors">
        {nativeTitle}
      </div>

      <div>
        {/* English Name in Accent Green */}
        <div className="text-sm font-semibold text-[#22E06B] mb-1">
          {englishName}
        </div>

        {/* Descriptor */}
        <div className="text-xs text-[#8B8F8C] leading-snug">
          {descriptor}
        </div>
      </div>

      {/* Subtle active indicator dot in top-right */}
      {isSelected && (
        <span className="absolute top-3.5 right-3.5 w-2 h-2 rounded-full bg-[#22E06B] shadow-[0_0_8px_#22E06B]" />
      )}
    </button>
  );
}
