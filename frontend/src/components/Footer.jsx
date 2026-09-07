import React from 'react';

/**
 * Footer component with brand homage and regional catalog credits
 */
export default function Footer() {
  return (
    <footer className="w-full border-t border-white/8 py-8 mt-16 select-none">
      <div className="max-w-7xl mx-auto px-6 sm:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] font-semibold text-[#8B8F8C] uppercase tracking-widest-plus text-center sm:text-left">
        <div>
          BUILT FOR THE SONGS THAT RAISED US
        </div>
        <div className="font-mono text-[#8B8F8C]/80">
          HINDI · PUNJABI · HARYANVI
        </div>
      </div>
    </footer>
  );
}
