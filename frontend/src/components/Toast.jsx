import React from 'react';
import { X, Sparkles, Loader2 } from 'lucide-react';

/**
 * Reusable Toast / Global Banner component styled with Liquid Glass aesthetic
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
      className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-[92%] max-w-xl animate-in fade-in slide-in-from-bottom-5 duration-300 pointer-events-auto"
    >
      <div className="liquid-panel rounded-full px-4 py-3 sm:px-6 sm:py-3.5 flex items-center justify-between gap-3.5 text-xs shadow-[0_16px_45px_rgba(0,0,0,0.75)]">
        {/* Specular Rim */}
        <div className="liquid-specular-rim" />

        {/* Left message with faint indicator */}
        <div className="flex items-center gap-3 min-w-0">
          <span className="relative flex h-2.5 w-2.5 shrink-0">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-400 shadow-[0_0_8px_#F59E0B]" />
          </span>
          <p className="text-slate-200 truncate sm:whitespace-normal font-medium leading-tight">
            {message}
          </p>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={onWake}
            disabled={isWaking}
            className="liquid-btn-brand text-[#04160a] font-black px-4 py-2 rounded-full text-xs flex items-center gap-1.5 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed whitespace-nowrap active:scale-95"
          >
            {isWaking ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Waking...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-3.5 h-3.5 fill-current" />
                <span>Wake up servers</span>
              </>
            )}
          </button>

          {onDismiss && (
            <button
              type="button"
              onClick={onDismiss}
              aria-label="Dismiss banner"
              className="liquid-btn-ghost p-1.5 rounded-full text-slate-400 hover:text-white cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>
    </aside>
  );
}
