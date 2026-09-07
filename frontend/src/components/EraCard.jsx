import React from 'react';
import { Radio, Disc, Flame, Zap, Globe } from 'lucide-react';

const ICON_MAP = {
  Radio: Radio,
  Disc: Disc,
  Flame: Flame,
  Zap: Zap,
  Globe: Globe
};

/**
 * EraCard component with distinct era visual styling
 * @param {Object} props
 * @param {string} props.id - Era ID ('all' | 'old-is-gold' | '2000s' | '2010s' | 'new')
 * @param {string} props.label - Era label (e.g. 'Old is Gold')
 * @param {string} props.range - Year span (e.g. 'Pre-2000')
 * @param {string} props.period - Period name (e.g. 'Classic & 90s')
 * @param {string} props.tagline - Short description
 * @param {string} props.iconName - Name of Lucide icon
 * @param {number} props.count - Number of tracks matching this era + selected language
 * @param {boolean} props.isSelected - Whether this era is selected
 * @param {Function} props.onSelect - Callback on click
 */
export default function EraCard({
  id,
  label,
  range,
  period,
  tagline,
  iconName,
  count = 0,
  isSelected,
  onSelect
}) {
  const IconComponent = ICON_MAP[iconName] || Globe;

  // Custom visual theme per era
  const getThemeStyles = () => {
    switch (id) {
      case 'old-is-gold':
        return {
          cardBg: isSelected
            ? 'bg-gradient-to-br from-[#2a1b0d] via-[#1a1208] to-[#100d09] border-amber-500 shadow-[0_0_24px_-4px_rgba(245,158,11,0.35)]'
            : 'bg-[#12100e] border-amber-900/30 hover:border-amber-700/50 hover:bg-[#181310]',
          iconColor: isSelected ? 'text-amber-400' : 'text-amber-500/70 group-hover:text-amber-400',
          iconBg: isSelected ? 'bg-amber-500/20' : 'bg-amber-500/10',
          badgeStyle: 'bg-amber-500/15 text-amber-300 border-amber-500/30',
          accentText: 'text-amber-400',
          dotColor: 'bg-amber-400 shadow-[0_0_8px_#F59E0B]'
        };
      case '2000s':
        return {
          cardBg: isSelected
            ? 'bg-gradient-to-br from-[#1a1738] via-[#120f26] to-[#0c0a18] border-indigo-400 shadow-[0_0_24px_-4px_rgba(129,140,248,0.35)]'
            : 'bg-[#10101c] border-indigo-900/30 hover:border-indigo-700/50 hover:bg-[#151526]',
          iconColor: isSelected ? 'text-indigo-400' : 'text-indigo-400/70 group-hover:text-indigo-300',
          iconBg: isSelected ? 'bg-indigo-500/20' : 'bg-indigo-500/10',
          badgeStyle: 'bg-indigo-500/15 text-indigo-300 border-indigo-500/30',
          accentText: 'text-indigo-400',
          dotColor: 'bg-indigo-400 shadow-[0_0_8px_#818CF8]'
        };
      case '2010s':
        return {
          cardBg: isSelected
            ? 'bg-gradient-to-br from-[#2c0f20] via-[#1b0813] to-[#11050c] border-pink-500 shadow-[0_0_24px_-4px_rgba(236,72,153,0.35)]'
            : 'bg-[#130b11] border-pink-900/30 hover:border-pink-700/50 hover:bg-[#1b0d17]',
          iconColor: isSelected ? 'text-pink-400' : 'text-pink-400/70 group-hover:text-pink-300',
          iconBg: isSelected ? 'bg-pink-500/20' : 'bg-pink-500/10',
          badgeStyle: 'bg-pink-500/15 text-pink-300 border-pink-500/30',
          accentText: 'text-pink-400',
          dotColor: 'bg-pink-400 shadow-[0_0_8px_#EC4899]'
        };
      case 'new':
        return {
          cardBg: isSelected
            ? 'bg-gradient-to-br from-[#0c2417] via-[#08170e] to-[#050e09] border-[#22E06B] shadow-[0_0_24px_-4px_rgba(34,224,107,0.35)]'
            : 'bg-[#0e1411] border-emerald-900/30 hover:border-emerald-700/50 hover:bg-[#121c16]',
          iconColor: isSelected ? 'text-[#22E06B]' : 'text-emerald-400/70 group-hover:text-[#22E06B]',
          iconBg: isSelected ? 'bg-[#22E06B]/20' : 'bg-[#22E06B]/10',
          badgeStyle: 'bg-[#22E06B]/15 text-[#22E06B] border-[#22E06B]/30',
          accentText: 'text-[#22E06B]',
          dotColor: 'bg-[#22E06B] shadow-[0_0_8px_#22E06B]'
        };
      default: // 'all'
        return {
          cardBg: isSelected
            ? 'bg-gradient-to-br from-[#1b1c1e] via-[#131415] to-[#0b0c0d] border-[#22E06B] shadow-[0_0_24px_-4px_rgba(34,224,107,0.25)]'
            : 'bg-[#121314] border-white/8 hover:border-white/20 hover:bg-[#18191b]',
          iconColor: isSelected ? 'text-[#22E06B]' : 'text-[#8B8F8C] group-hover:text-white',
          iconBg: isSelected ? 'bg-[#22E06B]/15' : 'bg-white/5',
          badgeStyle: 'bg-white/10 text-[#F5F5F5] border-white/15',
          accentText: 'text-[#22E06B]',
          dotColor: 'bg-[#22E06B] shadow-[0_0_8px_#22E06B]'
        };
    }
  };

  const theme = getThemeStyles();

  return (
    <button
      type="button"
      onClick={() => onSelect(id)}
      className={`relative w-full text-left p-4 sm:p-4.5 rounded-xl transition-all duration-200 cursor-pointer flex flex-col justify-between group outline-none focus-visible:ring-2 focus-visible:ring-[#22E06B] border ${theme.cardBg}`}
    >
      {/* Top row: Icon + Era range pill */}
      <div className="flex items-center justify-between gap-2 mb-3">
        <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${theme.iconBg} ${theme.iconColor}`}>
          <IconComponent className="w-4 h-4" />
        </div>
        <span className={`text-[10px] font-mono font-bold tracking-wider px-2 py-0.5 rounded-full border ${theme.badgeStyle}`}>
          {range}
        </span>
      </div>

      {/* Main label + period */}
      <div className="mb-2">
        <div className="text-base sm:text-lg font-bold text-white group-hover:text-[#F5F5F5] leading-tight">
          {label}
        </div>
        <div className={`text-[11px] font-medium ${theme.accentText} mt-0.5`}>
          {period}
        </div>
      </div>

      {/* Tagline */}
      <div className="text-[11px] text-[#8B8F8C] leading-snug line-clamp-2 mb-3">
        {tagline}
      </div>

      {/* Bottom Track Count */}
      <div className="pt-2 border-t border-white/5 flex items-center justify-between text-[11px] font-mono text-[#8B8F8C]">
        <span>Pool:</span>
        <span className={count > 0 ? 'text-white font-semibold' : 'text-rose-400 font-semibold'}>
          {count} {count === 1 ? 'song' : 'songs'}
        </span>
      </div>

      {/* Active selection indicator */}
      {isSelected && (
        <span className={`absolute top-3 right-3 w-2 h-2 rounded-full ${theme.dotColor}`} />
      )}
    </button>
  );
}
