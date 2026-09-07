import React from 'react';

/**
 * Reusable HowItWorksStep component
 * @param {Object} props
 * @param {string} props.number - e.g. "01", "02", "03"
 * @param {string} props.title - Step title e.g. "Press play"
 * @param {string} props.description - Step explanation e.g. "Hear a tiny clip"
 */
export default function HowItWorksStep({ number, title, description }) {
  return (
    <div className="flex items-start gap-3.5 group">
      {/* Bold Green Two-Digit Number */}
      <span className="text-sm font-bold text-[#22E06B] font-mono tabular-nums tracking-wider pt-0.5 select-none">
        {number}
      </span>

      {/* Title & Description */}
      <div className="flex flex-col">
        <span className="text-sm font-bold text-[#F5F5F5] group-hover:text-white transition-colors">
          {title}
        </span>
        <span className="text-xs text-[#8B8F8C] mt-0.5 leading-relaxed">
          {description}
        </span>
      </div>
    </div>
  );
}
