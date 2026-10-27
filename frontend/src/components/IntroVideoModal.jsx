import React, { useRef, useState } from 'react';
import { Film, X, Download, Play, Sparkles, Zap, RotateCcw, Link2, Music } from 'lucide-react';

const CHAPTERS = [
  { label: '01 · Intro Hook', time: 0, badge: '1s → 16s' },
  { label: '02 · 847 Desi Songs', time: 4.1, badge: 'Hindi · Punjabi · Haryanvi' },
  { label: '03 · 4 Music Eras', time: 8.3, badge: 'Pre-2000 → 2020s' },
  { label: '04 · 4 Game Modes', time: 12.3, badge: 'Normal · Reverse · Chain · Blitz' },
  { label: '05 · Play Now', time: 16.7, badge: 'Finale' }
];

export default function IntroVideoModal({ isOpen, onClose, onSelectModeAndStart }) {
  const videoRef = useRef(null);
  const [activeChapter, setActiveChapter] = useState(0);

  if (!isOpen) return null;

  const handleSeekChapter = (index, seconds) => {
    setActiveChapter(index);
    if (videoRef.current) {
      videoRef.current.currentTime = seconds;
      videoRef.current.play().catch(() => {});
    }
  };

  const handleTimeUpdate = () => {
    if (!videoRef.current) return;
    const t = videoRef.current.currentTime;
    if (t >= 16.6) setActiveChapter(4);
    else if (t >= 12.2) setActiveChapter(3);
    else if (t >= 8.2) setActiveChapter(2);
    else if (t >= 4.0) setActiveChapter(1);
    else setActiveChapter(0);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/85 backdrop-blur-2xl animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl rounded-3xl p-5 sm:p-7 overflow-hidden liquid-modal-window border-[#22E06B]/35 shadow-[0_30px_90px_rgba(34,224,107,0.22)] max-h-[94vh] flex flex-col">
        {/* Specular Top Rim */}
        <div className="liquid-specular-rim" />

        {/* Header Row */}
        <div className="flex items-center justify-between gap-3 pb-4 border-b border-white/[0.08] shrink-0">
          <div className="flex items-center gap-2.5 flex-wrap">
            <span className="text-[10px] font-mono font-extrabold uppercase tracking-wider px-2.5 py-1 rounded-md border bg-[#22E06B]/20 text-[#22E06B] border-[#22E06B]/40 flex items-center gap-1.5">
              <Film className="w-3.5 h-3.5" />
              <span>OFFICIAL FEATURE TRAILER</span>
            </span>
            <span className="text-xs text-slate-300 font-semibold hidden sm:inline">
              SurfTest · 847 Songs · 4 Game Modes · 3 Languages
            </span>
          </div>

          <div className="flex items-center gap-2">
            <a
              href="/video/surftest-intro.mp4"
              download="SurfTest-Intro-Trailer.mp4"
              className="px-3 py-1.5 rounded-xl liquid-btn-ghost text-xs font-bold text-[#22E06B] hover:text-white flex items-center gap-1.5 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download MP4</span>
            </a>

            <button
              type="button"
              onClick={onClose}
              className="text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-white/5 transition-colors cursor-pointer"
              aria-label="Close trailer modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Main Video Player + Interactive Scene Chapters */}
        <div className="pt-4 space-y-4 overflow-y-auto pr-1">
          <div className="relative rounded-2xl overflow-hidden border border-white/15 bg-black shadow-2xl aspect-video">
            <video
              ref={videoRef}
              src="/video/surftest-intro.mp4"
              controls
              autoPlay
              playsInline
              onTimeUpdate={handleTimeUpdate}
              className="w-full h-full object-contain bg-[#06070B]"
            />
          </div>

          {/* Interactive Scene Chapters */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
            {CHAPTERS.map((chap, idx) => (
              <button
                key={chap.label}
                type="button"
                onClick={() => handleSeekChapter(idx, chap.time)}
                className={`p-2.5 rounded-xl text-left border transition-all cursor-pointer ${
                  activeChapter === idx
                    ? 'bg-[#22E06B]/15 border-[#22E06B]/60 text-white shadow-[0_0_15px_rgba(34,224,107,0.2)]'
                    : 'bg-white/[0.03] border-white/10 text-slate-400 hover:text-white hover:bg-white/[0.06]'
                }`}
              >
                <div className="text-[11px] font-bold truncate">{chap.label}</div>
                <div className="text-[10px] font-mono text-[#22E06B] truncate mt-0.5">{chap.badge}</div>
              </button>
            ))}
          </div>

          {/* Quick-Launch Mode Strip */}
          <div className="pt-2 border-t border-white/[0.08] flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <div className="text-xs text-slate-300 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#22E06B] shrink-0" />
              <span>Jump straight into any feature from the video:</span>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => onSelectModeAndStart('normal')}
                className="px-3 py-2 rounded-xl text-xs font-bold liquid-btn-brand flex items-center gap-1.5 cursor-pointer"
              >
                <Play className="w-3 h-3 fill-current" />
                <span>Normal</span>
              </button>

              <button
                type="button"
                onClick={() => onSelectModeAndStart('reverse')}
                className="px-3 py-2 rounded-xl text-xs font-bold liquid-btn-purple flex items-center gap-1.5 cursor-pointer"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Reverse 🔄</span>
              </button>

              <button
                type="button"
                onClick={() => onSelectModeAndStart('antakshari')}
                className="px-3 py-2 rounded-xl text-xs font-bold liquid-btn-amber flex items-center gap-1.5 cursor-pointer"
              >
                <Link2 className="w-3 h-3" />
                <span>Antakshari 🔗</span>
              </button>

              <button
                type="button"
                onClick={() => onSelectModeAndStart('blitz')}
                className="px-3 py-2 rounded-xl text-xs font-bold liquid-btn-cyan flex items-center gap-1.5 cursor-pointer"
              >
                <Zap className="w-3 h-3 fill-current" />
                <span>60s Blitz ⚡</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
