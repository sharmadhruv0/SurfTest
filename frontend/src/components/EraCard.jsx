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
 * EraCard component with distinct Liquid Glass visual styling
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

  // Custom visual theme per era using Liquid Glass properties
  const getThemeStyles = () => {
    switch (id) {
      case 'old-is-gold':
        return {
          cardBg: isSelected ? 'liquid-card-active-amber' : 'liquid-card',
          iconColor: isSelected ? 'text-amber-300' : 'text-amber-400/80 group-hover:text-amber-300',
          iconBg: isSelected ? 'bg-amber-400/25 border-amber-400/50 shadow-[0_0_15px_rgba(245,158,11,0.3)]' : 'bg-amber-500/10 border-amber-500/20',
          badgeStyle: 'bg-amber-500/20 text-amber-300 border-amber-500/35 shadow-[inset_0_1px_0_rgba(255,255,255,0.2)]',
          accentText: 'text-amber-400',
          dotColor: 'bg-amber-400 shadow-[0_0_10px_#F59E0B]'
        };
      case '2000s':
        return {
          cardBg: isSelected ? 'liquid-card-active-indigo' : 'liquid-card',
          iconColor: isSelected ? 'text-indigo-300' : 'text-indigo-400/80 group-hover:text-indigo-300',
          iconBg: isSelected ? 'bg-indigo-400/25 border-indigo-400/50 shadow-[0_0_15px_rgba(99,102,241,0.3)]' : 'bg-indigo-500/10 border-indigo-500/20',
          badgeStyle: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/35 shadow-[inset_0_1px_0_rgba(255,255,255,0.2)]',
          accentText: 'text-indigo-400',
          dotColor: 'bg-indigo-400 shadow-[0_0_10px_#818CF8]'
        };
      case '2010s':
        return {
          cardBg: isSelected ? 'liquid-card-active-pink' : 'liquid-card',
          iconColor: isSelected ? 'text-pink-300' : 'text-pink-400/80 group-hover:text-pink-300',
          iconBg: isSelected ? 'bg-pink-400/25 border-pink-400/50 shadow-[0_0_15px_rgba(236,72,153,0.3)]' : 'bg-pink-500/10 border-pink-500/20',
          badgeStyle: 'bg-pink-500/20 text-pink-300 border-pink-500/35 shadow-[inset_0_1px_0_rgba(255,255,255,0.2)]',
          accentText: 'text-pink-400',
          dotColor: 'bg-pink-400 shadow-[0_0_10px_#EC4899]'
        };
      case 'new':
        return {
          cardBg: isSelected ? 'liquid-card-active-brand' : 'liquid-card',
          iconColor: isSelected ? 'text-[#22E06B]' : 'text-emerald-400/80 group-hover:text-[#22E06B]',
          iconBg: isSelected ? 'bg-[#22E06B]/25 border-[#22E06B]/50 shadow-[0_0_15px_rgba(34,224,107,0.3)]' : 'bg-emerald-500/10 border-emerald-500/20',
          badgeStyle: 'bg-[#22E06B]/20 text-[#22E06B] border-[#22E06B]/35 shadow-[inset_0_1px_0_rgba(255,255,255,0.2)]',
          accentText: 'text-[#22E06B]',
          dotColor: 'bg-[#22E06B] shadow-[0_0_10px_#22E06B]'
        };
      default: // 'all'
        return {
          cardBg: isSelected ? 'liquid-card-active-brand' : 'liquid-card',
          iconColor: isSelected ? 'text-[#22E06B]' : 'text-slate-300 group-hover:text-white',
          iconBg: isSelected ? 'bg-[#22E06B]/25 border-[#22E06B]/50 shadow-[0_0_15px_rgba(34,224,107,0.3)]' : 'bg-white/10 border-white/15',
          badgeStyle: 'bg-white/15 text-slate-200 border-white/20 shadow-[inset_0_1px_0_rgba(255,255,255,0.25)]',
          accentText: 'text-[#22E06B]',
          dotColor: 'bg-[#22E06B] shadow-[0_0_10px_#22E06B]'
        };
    }
  };

  const theme = getThemeStyles();

  return (
    <button
      type="button"
      onClick={() => onSelect(id)}
      className={`relative w-full text-left p-4 sm:p-4.5 rounded-2xl cursor-pointer flex flex-col justify-between group outline-none overflow-hidden transition-all duration-300 ${theme.cardBg}`}
    >
      {/* Specular Highlight Rim */}
      <div className="liquid-specular-rim" />

      {/* Top row: Glass Icon + Era Range Badge */}
      <div className="flex items-center justify-between gap-2 mb-3">
        <div className={`w-8 h-8 rounded-xl border flex items-center justify-center transition-all ${theme.iconBg} ${theme.iconColor}`}>
          <IconComponent className="w-4 h-4" />
        </div>
        <span className={`text-[10px] font-mono font-bold tracking-wider px-2.5 py-0.5 rounded-full border backdrop-blur-md ${theme.badgeStyle}`}>
          {range}
        </span>
      </div>

      {/* Main label + period */}
      <div className="mb-2">
        <div className="text-base sm:text-lg font-extrabold text-white group-hover:text-white leading-tight drop-shadow-sm">
          {label}
        </div>
        <div className={`text-[11px] font-semibold ${theme.accentText} mt-0.5`}>
          {period}
        </div>
      </div>

      {/* Tagline */}
      <div className="text-[11px] text-slate-300/80 leading-snug line-clamp-2 mb-3">
        {tagline}
      </div>

      {/* Bottom Track Count */}
      <div className="pt-2.5 border-t border-white/10 flex items-center justify-between text-[11px] font-mono text-slate-400">
        <span>Pool:</span>
        <span className={count > 0 ? 'text-white font-bold' : 'text-rose-400 font-bold'}>
          {count} {count === 1 ? 'song' : 'songs'}
        </span>
      </div>

      {/* Active selection glowing dot indicator */}
      {isSelected && (
        <span className="absolute top-3 right-3 flex h-2 w-2">
          <span className={`relative inline-flex rounded-full h-2 w-2 ${theme.dotColor}`} />
        </span>
      )}
    </button>
  );
}
