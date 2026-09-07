import React from 'react';
import { X, Sparkles, Loader2 } from 'lucide-react';

/**
 * Reusable Toast / Global Banner component
 * @param {Object} props
 * @param {boolean} props.visible - whether banner is shown
 * @param {boolean} props.isWaking - loading state for wake servers button
 * @param {Function} props.onWake - callback when "Wake up servers" clicked
 * @param {Function} props.onDismiss - callback when dismissed
 * @param {string} [props.message] - custom text if needed
 */
export default function Toast({
  visible,
  isWaking,
  onWake,
  onDismiss,
  message = "Frontend Preview Only. Please wake servers to enable backend functionality."
}) {
  if (!visible) return null;

  return (
    <aside
      aria-label="Server status alert"
      className="fixed bottom-5 left-1/2 -translate-x-1/2 z-50 w-[92%] max-w-xl animate-in fade-in slide-in-from-bottom-5 duration-300 pointer-events-auto"
    >
      <div className="bg-[#121314]/95 backdrop-blur-md border border-white/10 shadow-[0_12px_32px_rgba(0,0,0,0.75)] rounded-full px-4 py-2.5 sm:px-5 sm:py-3 flex items-center justify-between gap-3 text-xs">
        {/* Left message with faint indicator */}
        <div className="flex items-center gap-2.5 min-w-0">
          <span className="w-2 h-2 rounded-full bg-amber-400/80 animate-pulse shrink-0" />
          <p className="text-[#9CA3AF] truncate sm:whitespace-normal leading-tight">
            {message}
          </p>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={onWake}
            disabled={isWaking}
            className="bg-[#22E06B] hover:bg-[#2ECC71] text-[#0A0A0B] font-bold px-3.5 py-1.5 rounded-full text-xs transition-all shadow-[0_0_12px_rgba(34,224,107,0.3)] flex items-center gap-1.5 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed whitespace-nowrap active:scale-95"
          >
            {isWaking ? (
              <>
                <Loader2 className="w-3 h-3 animate-spin" />
                <span>Waking...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-3 h-3 fill-current" />
                <span>Wake up servers</span>
              </>
            )}
          </button>

          {onDismiss && (
            <button
              type="button"
              onClick={onDismiss}
              aria-label="Dismiss banner"
              className="p-1 rounded-full text-[#8B8F8C] hover:text-white hover:bg-white/10 transition-colors"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>
    </aside>
  );
}
