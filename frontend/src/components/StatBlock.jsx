import React from 'react';

/**
 * Reusable StatBlock component
 * @param {Object} props
 * @param {string} props.label - e.g. "PLAYED", "WIN RATE", "BEST STREAK"
 * @param {string|number} props.value - stat value e.g. 0, "0%", etc.
 * @param {string} [props.sublabel] - optional subtle subtitle
 */
export default function StatBlock({ label, value, sublabel }) {
  return (
    <div className="flex flex-col items-start">
      <span className="text-[11px] font-semibold text-[#8B8F8C] uppercase tracking-widest mb-1.5">
        {label}
      </span>
      <span className="text-2xl sm:text-3xl font-extrabold text-[#F5F5F5] tracking-tight tabular-nums font-mono">
        {value}
      </span>
      {sublabel && (
        <span className="text-[10px] text-[#8B8F8C] mt-0.5">{sublabel}</span>
      )}
    </div>
  );
}
