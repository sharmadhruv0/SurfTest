import React, { useRef, useState } from 'react';
import { Film, X, Download, Play, Sparkles, Zap, RotateCcw, Link2, Image as ImageIcon, Gamepad2 } from 'lucide-react';

const INTRO_CHAPTERS = [
  { label: '01 · Hero Hook', time: 0, badge: '1s → 16s Intro' },
  { label: '02 · 847 Desi Songs', time: 4.1, badge: 'Hindi · Punjabi · Haryanvi' },
  { label: '03 · 4 Music Eras', time: 8.3, badge: 'Pre-2000 → 2020s' },
  { label: '04 · 4 Game Modes', time: 12.3, badge: 'Normal · Reverse · Chain · Blitz' },
  { label: '05 · Play Now', time: 16.7, badge: 'Finale CTA' }
];

const GAMEPLAY_CHAPTERS = [
  { label: '01 · Pick Hindi', time: 0, badge: 'Choose Sound & Mode' },
  { label: '02 · 1s Audio Clip', time: 5.2, badge: 'Listen & Skip (+1s)' },
  { label: '03 · Unlock 2s Clip', time: 11.2, badge: 'Hear the Melody' },
  { label: '04 · Type & Select', time: 16.5, badge: 'Kesariya - Arijit Singh' },
  { label: '05 · Win & Share', time: 22.4, badge: 'Full Song & Streak +1' }
];

const INSTAGRAM_SLIDES = [
  {
    id: 'logo-01',
    title: 'Profile Pic 1 · Official ST Badge',
    url: '/social/ig-logo-01-emerald-badge.png',
    filename: 'SurfTest-IG-Logo-01-Emerald-Badge.png',
    isCirclePreview: true
  },
  {
    id: 'logo-02',
    title: 'Profile Pic 2 · Soundwave Crest',
    url: '/social/ig-logo-02-soundwave-crest.png',
    filename: 'SurfTest-IG-Logo-02-Soundwave-Crest.png',
    isCirclePreview: true
  },
  {
    id: '01',
    title: 'Slide 1 · Hero Cover',
    url: '/social/ig-01-hero-cover.png',
    filename: 'SurfTest-IG-01-Hero-Cover.png'
  },
  {
    id: '02',
    title: 'Slide 2 · How to Play',
    url: '/social/ig-02-how-to-play.png',
    filename: 'SurfTest-IG-02-How-To-Play.png'
  },
  {
    id: '03',
    title: 'Slide 3 · 847 Songs & Eras',
    url: '/social/ig-03-847-songs-eras.png',
    filename: 'SurfTest-IG-03-847-Songs-Eras.png'
  },
  {
    id: '04',
    title: 'Slide 4 · 4 Game Modes',
    url: '/social/ig-04-four-game-modes.png',
    filename: 'SurfTest-IG-04-Four-Game-Modes.png'
  },
  {
    id: '05',
    title: 'Slide 5 · Multiplayer & CTA',
    url: '/social/ig-05-play-now-cta.png',
    filename: 'SurfTest-IG-05-Multiplayer-CTA.png'
  }
];

export default function IntroVideoModal({ isOpen, onClose, onSelectModeAndStart }) {
  const videoRef = useRef(null);
  const [activeChapter, setActiveChapter] = useState(0);
  const [activeTab, setActiveTab] = useState('intro'); // 'intro' (20s) | 'gameplay' (28s) | 'instagram'

  if (!isOpen) return null;

  const isIntroVideo = activeTab === 'intro';
  const activeVideoSrc = isIntroVideo ? '/video/surftest-intro.mp4' : '/video/surftest-gameplay.mp4';
  const activeDownloadName = isIntroVideo
    ? 'SurfTest-Intro-Trailer-20s.mp4'
    : 'SurfTest-Gameplay-Walkthrough-28s.mp4';
  const currentChapters = isIntroVideo ? INTRO_CHAPTERS : GAMEPLAY_CHAPTERS;

  const handleDownloadAllSlides = () => {
    INSTAGRAM_SLIDES.forEach((slide, idx) => {
      setTimeout(() => {
        const a = document.createElement('a');
        a.href = slide.url;
        a.download = slide.filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
      }, idx * 250);
    });
  };

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
    if (isIntroVideo) {
      if (t >= 16.6) setActiveChapter(4);
      else if (t >= 12.2) setActiveChapter(3);
      else if (t >= 8.2) setActiveChapter(2);
      else if (t >= 4.0) setActiveChapter(1);
      else setActiveChapter(0);
    } else {
      if (t >= 22.4) setActiveChapter(4);
      else if (t >= 16.5) setActiveChapter(3);
      else if (t >= 11.2) setActiveChapter(2);
      else if (t >= 5.2) setActiveChapter(1);
      else setActiveChapter(0);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/85 backdrop-blur-2xl animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl rounded-3xl p-5 sm:p-7 overflow-hidden liquid-modal-window border-[#22E06B]/35 shadow-[0_30px_90px_rgba(34,224,107,0.22)] max-h-[94vh] flex flex-col">
        {/* Specular Top Rim */}
        <div className="liquid-specular-rim" />

        {/* Header Row with 3 Switchable Tabs */}
        <div className="flex items-center justify-between gap-3 pb-4 border-b border-white/[0.08] shrink-0">
          <div className="flex items-center gap-2 flex-wrap">
            <button
              type="button"
              onClick={() => {
                setActiveTab('intro');
                setActiveChapter(0);
              }}
              className={`text-xs font-mono font-bold uppercase tracking-wider px-3 py-1.5 rounded-xl border flex items-center gap-1.5 cursor-pointer transition-all ${
                activeTab === 'intro'
                  ? 'bg-[#22E06B]/20 text-[#22E06B] border-[#22E06B]/50 shadow-[0_0_12px_rgba(34,224,107,0.25)]'
                  : 'bg-white/[0.04] text-slate-400 border-white/10 hover:text-white'
              }`}
            >
              <Film className="w-3.5 h-3.5" />
              <span>1. Intro Video (20s)</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setActiveTab('gameplay');
                setActiveChapter(0);
              }}
              className={`text-xs font-mono font-bold uppercase tracking-wider px-3 py-1.5 rounded-xl border flex items-center gap-1.5 cursor-pointer transition-all ${
                activeTab === 'gameplay'
                  ? 'bg-amber-500/20 text-amber-300 border-amber-400/50 shadow-[0_0_12px_rgba(245,158,11,0.25)]'
                  : 'bg-white/[0.04] text-slate-400 border-white/10 hover:text-white'
              }`}
            >
              <Gamepad2 className="w-3.5 h-3.5" />
              <span>2. Gameplay Video (28s)</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('instagram')}
              className={`text-xs font-mono font-bold uppercase tracking-wider px-3 py-1.5 rounded-xl border flex items-center gap-1.5 cursor-pointer transition-all ${
                activeTab === 'instagram'
                  ? 'bg-cyan-500/20 text-cyan-300 border-cyan-400/50 shadow-[0_0_12px_rgba(6,182,212,0.25)]'
                  : 'bg-white/[0.04] text-slate-400 border-white/10 hover:text-white'
              }`}
            >
              <ImageIcon className="w-3.5 h-3.5" />
              <span>3. Instagram Kit (Logos + 5 Posts)</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            {activeTab !== 'instagram' ? (
              <a
                href={activeVideoSrc}
                download={activeDownloadName}
                className="px-3 py-1.5 rounded-xl liquid-btn-ghost text-xs font-bold text-[#22E06B] hover:text-white flex items-center gap-1.5 cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download {isIntroVideo ? '20s' : '28s'} MP4</span>
              </a>
            ) : (
              <button
                type="button"
                onClick={handleDownloadAllSlides}
                className="px-3.5 py-1.5 rounded-xl liquid-btn-cyan text-xs font-bold flex items-center gap-1.5 cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download All 7 PNGs</span>
              </button>
            )}

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

        {/* Main Body: Video Player (20s or 28s) OR Instagram 5-Slide Pack */}
        {activeTab !== 'instagram' ? (
          <div className="pt-4 space-y-4 overflow-y-auto pr-1">
            <div className="relative rounded-2xl overflow-hidden border border-white/15 bg-black shadow-2xl aspect-video">
              <video
                key={activeVideoSrc}
                ref={videoRef}
                src={activeVideoSrc}
                controls
                autoPlay
                playsInline
                onTimeUpdate={handleTimeUpdate}
                className="w-full h-full object-contain bg-[#06070B]"
              />
            </div>

            {/* Interactive Scene Chapters */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
              {currentChapters.map((chap, idx) => (
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
        ) : (
          <div className="pt-4 space-y-4 overflow-y-auto pr-1">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {INSTAGRAM_SLIDES.map((slide) => (
                <div
                  key={slide.id}
                  className="rounded-2xl overflow-hidden border border-white/15 bg-white/[0.03] flex flex-col justify-between p-3 space-y-3"
                >
                  <div className="rounded-xl overflow-hidden border border-white/10 aspect-square bg-black">
                    <img
                      src={slide.url}
                      alt={slide.title}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-bold text-white truncate">{slide.title}</span>
                    <a
                      href={slide.url}
                      download={slide.filename}
                      className="px-3 py-1.5 rounded-lg liquid-btn-brand text-[11px] font-bold flex items-center gap-1.5 shrink-0 cursor-pointer"
                    >
                      <Download className="w-3 h-3" />
                      <span>Download</span>
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
