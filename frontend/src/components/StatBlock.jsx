import React from 'react';

/**
 * Reusable StatBlock component styled with Liquid Glass aesthetic
 * @param {Object} props
 * @param {string} props.label - e.g. "PLAYED", "WIN RATE", "BEST STREAK"
 * @param {string|number} props.value - stat value e.g. 0, "0%", etc.
 * @param {string} [props.sublabel] - optional subtle subtitle
 */
export default function StatBlock({ label, value, sublabel }) {
  return (
    <div className="flex flex-col items-start p-3 sm:p-3.5 rounded-2xl liquid-pill hover:border-white/20 transition-all">
      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">
        {label}
      </span>
      <span className="text-2xl sm:text-3xl font-black text-white tracking-tight tabular-nums font-mono drop-shadow-[0_2px_10px_rgba(0,0,0,0.5)]">
        {value}
      </span>
      {sublabel && (
        <span className="text-[10px] text-slate-400 mt-0.5 font-medium">{sublabel}</span>
      )}
    </div>
  );
}
