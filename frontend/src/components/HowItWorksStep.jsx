import React from 'react';

/**
 * Reusable HowItWorksStep component styled with Liquid Glass aesthetic
 * @param {Object} props
 * @param {string} props.number - e.g. "01", "02", "03"
 * @param {string} props.title - Step title e.g. "Press play"
 * @param {string} props.description - Step explanation e.g. "Hear a tiny clip"
 */
export default function HowItWorksStep({ number, title, description }) {
  return (
    <div className="flex items-start gap-3.5 group p-2.5 rounded-xl hover:bg-white/[0.04] transition-all">
      {/* Glassy Green Capsule Number */}
      <div className="w-8 h-8 rounded-lg liquid-pill border-[#22E06B]/30 flex items-center justify-center shrink-0 group-hover:border-[#22E06B]/60 transition-colors">
        <span className="text-xs font-black text-[#22E06B] font-mono tabular-nums tracking-wider select-none drop-shadow-[0_0_6px_rgba(34,224,107,0.4)]">
          {number}
        </span>
      </div>

      {/* Title & Description */}
      <div className="flex flex-col">
        <span className="text-sm font-bold text-white group-hover:text-[#22E06B] transition-colors leading-tight">
          {title}
        </span>
        <span className="text-xs text-slate-300/80 mt-1 leading-relaxed">
          {description}
        </span>
      </div>
    </div>
  );
}
