import React, { useState, useEffect } from 'react';
import {
  Shield,
  X,
  RefreshCw,
  Users,
  Play,
  Trophy,
  Instagram,
  Smartphone,
  Monitor,
  Lock,
  Unlock,
  Activity,
  Zap,
  RotateCcw,
  Link2,
  Bell
} from 'lucide-react';

const DEFAULT_ADMIN_PIN = '2026';

function formatTimeAgo(ts) {
  if (!ts) return 'Just now';
  const diffSec = Math.max(0, Math.floor((Date.now() - ts) / 1000));
  if (diffSec < 15) return 'Just now';
  if (diffSec < 60) return `${diffSec}s ago`;
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24) return `${diffHr}h ago`;
  return `${Math.floor(diffHr / 24)}d ago`;
}

export default function AdminDashboardModal({
  isOpen,
  onClose,
  isAdminUnlocked,
  onUnlockAdmin,
  onLockAdmin,
  telemetry,
  onRefreshTelemetry
}) {
  const [pinInput, setPinInput] = useState('');
  const [pinError, setPinError] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    if (!isOpen || !isAdminUnlocked) return;
    onRefreshTelemetry();
    const interval = setInterval(() => {
      onRefreshTelemetry();
    }, 10000);
    return () => clearInterval(interval);
  }, [isOpen, isAdminUnlocked, onRefreshTelemetry]);

  if (!isOpen) return null;

  const handlePinSubmit = (e) => {
    e.preventDefault();
    if (pinInput.trim() === DEFAULT_ADMIN_PIN) {
      setPinError(false);
      setPinInput('');
      onUnlockAdmin();
    } else {
      setPinError(true);
    }
  };

  const handleManualRefresh = async () => {
    setIsRefreshing(true);
    await onRefreshTelemetry();
    setTimeout(() => setIsRefreshing(false), 400);
  };

  // PIN Lock Screen if not unlocked yet on this device
  if (!isAdminUnlocked) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-2xl animate-in fade-in duration-200">
        <div className="relative w-full max-w-md rounded-3xl p-6 sm:p-8 liquid-modal-window border-[#22E06B]/35 shadow-[0_30px_90px_rgba(34,224,107,0.25)]">
          <div className="liquid-specular-rim" />

          <div className="flex items-center justify-between pb-4 border-b border-white/10">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-[#22E06B]/20 border border-[#22E06B]/40 flex items-center justify-center text-[#22E06B]">
                <Lock className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-base font-black text-white">Secret Owner Access</h3>
                <p className="text-[11px] text-slate-400">Only visible on your device once unlocked</p>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-white/5 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handlePinSubmit} className="mt-6 space-y-4">
            <div>
              <label className="block text-xs font-mono uppercase tracking-wider text-slate-300 mb-2">
                Enter Owner PIN
              </label>
              <input
                type="password"
                inputMode="numeric"
                value={pinInput}
                onChange={(e) => {
                  setPinInput(e.target.value);
                  setPinError(false);
                }}
                placeholder="Enter 4-digit PIN (2026)"
                autoFocus
                className="w-full px-4 py-3 rounded-xl bg-black/50 border border-white/15 text-white font-mono text-center text-lg tracking-widest focus:outline-none focus:border-[#22E06B]"
              />
              {pinError && (
                <p className="text-xs text-rose-400 mt-2 font-medium">
                  Incorrect PIN. Default owner PIN is 2026.
                </p>
              )}
            </div>

            <button
              type="submit"
              className="w-full py-3 rounded-xl liquid-btn-brand font-bold text-sm flex items-center justify-center gap-2 cursor-pointer"
            >
              <Unlock className="w-4 h-4" />
              <span>Unlock Secret Admin Dashboard</span>
            </button>
          </form>
        </div>
      </div>
    );
  }

  const data = telemetry || {
    publicTotalPlays: 148,
    publicTotalVisits: 215,
    totalVisits: 0,
    instagramVisits: 0,
    directVisits: 0,
    gamesStarted: 0,
    roundsCompleted: 0,
    songsGuessed: 0,
    winRate: 0,
    byMode: { normal: 0, reverse: 0, antakshari: 0, blitz: 0 },
    byLanguage: { hindi: 0, punjabi: 0, haryanvi: 0, all: 0 },
    recentEvents: [],
    cloudTopic: 'surftest_live_stream_2026_st'
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/85 backdrop-blur-2xl animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl rounded-3xl p-5 sm:p-7 overflow-hidden liquid-modal-window border-[#22E06B]/40 shadow-[0_30px_90px_rgba(34,224,107,0.22)] max-h-[92vh] flex flex-col">
        <div className="liquid-specular-rim" />

        {/* Top Header */}
        <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-white/10 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#22E06B]/20 border border-[#22E06B]/50 flex items-center justify-center text-[#22E06B] shadow-[0_0_20px_rgba(34,224,107,0.3)]">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg sm:text-xl font-black text-white tracking-tight">
                  SurTest Owner Live Dashboard
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase bg-[#22E06B]/20 text-[#22E06B] border border-[#22E06B]/40 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#22E06B] animate-ping" />
                  LIVE
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Private to your browser • Invisible to regular players
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleManualRefresh}
              className="px-3 py-1.5 rounded-xl liquid-btn-ghost text-xs font-bold text-[#22E06B] hover:text-white flex items-center gap-1.5 cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </button>

            <button
              type="button"
              onClick={() => {
                onLockAdmin();
                onClose();
              }}
              title="Hide Admin badge from this browser"
              className="px-3 py-1.5 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 hover:bg-rose-500/25 text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-all"
            >
              <Lock className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Lock Admin</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-white/5 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="pt-5 space-y-5 overflow-y-auto pr-1">
          {/* 4 Primary KPI Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
            <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10">
              <div className="flex items-center justify-between text-xs text-slate-400 font-mono uppercase">
                <span>Total Plays</span>
                <Play className="w-4 h-4 text-[#22E06B]" />
              </div>
              <div className="text-2xl sm:text-3xl font-black text-white font-mono mt-1.5">
                {data.publicTotalPlays.toLocaleString()}
              </div>
              <div className="text-[11px] text-[#22E06B] mt-1 font-medium">
                +{data.gamesStarted} new rounds started
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10">
              <div className="flex items-center justify-between text-xs text-slate-400 font-mono uppercase">
                <span>Instagram Visits</span>
                <Instagram className="w-4 h-4 text-pink-400" />
              </div>
              <div className="text-2xl sm:text-3xl font-black text-pink-400 font-mono mt-1.5">
                {data.instagramVisits}
              </div>
              <div className="text-[11px] text-slate-400 mt-1">
                Out of {data.totalVisits} recent visits ({data.publicTotalVisits} all-time)
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10">
              <div className="flex items-center justify-between text-xs text-slate-400 font-mono uppercase">
                <span>Songs Guessed</span>
                <Trophy className="w-4 h-4 text-amber-400" />
              </div>
              <div className="text-2xl sm:text-3xl font-black text-amber-300 font-mono mt-1.5">
                {data.songsGuessed}
              </div>
              <div className="text-[11px] text-slate-400 mt-1">
                {data.roundsCompleted} finished • {data.winRate}% win rate
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10">
              <div className="flex items-center justify-between text-xs text-slate-400 font-mono uppercase">
                <span>Live Events</span>
                <Activity className="w-4 h-4 text-cyan-400" />
              </div>
              <div className="text-2xl sm:text-3xl font-black text-cyan-300 font-mono mt-1.5">
                {data.recentEvents.length}
              </div>
              <div className="text-[11px] text-slate-400 mt-1">
                Synced across all devices
              </div>
            </div>
          </div>

          {/* Breakdown Row: Game Modes & Languages */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Mode Breakdown */}
            <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 space-y-3">
              <div className="text-xs font-mono font-bold uppercase tracking-wider text-slate-300">
                Plays by Game Mode
              </div>
              <div className="grid grid-cols-2 gap-2.5">
                <div className="p-2.5 rounded-xl bg-black/40 border border-white/5 flex items-center justify-between">
                  <span className="text-xs text-slate-300 flex items-center gap-1.5">
                    <Play className="w-3.5 h-3.5 text-[#22E06B]" /> Normal
                  </span>
                  <span className="text-sm font-mono font-bold text-white">
                    {data.byMode?.normal || 0}
                  </span>
                </div>
                <div className="p-2.5 rounded-xl bg-black/40 border border-white/5 flex items-center justify-between">
                  <span className="text-xs text-slate-300 flex items-center gap-1.5">
                    <RotateCcw className="w-3.5 h-3.5 text-purple-400" /> Reverse
                  </span>
                  <span className="text-sm font-mono font-bold text-white">
                    {data.byMode?.reverse || 0}
                  </span>
                </div>
                <div className="p-2.5 rounded-xl bg-black/40 border border-white/5 flex items-center justify-between">
                  <span className="text-xs text-slate-300 flex items-center gap-1.5">
                    <Link2 className="w-3.5 h-3.5 text-amber-400" /> Antakshari
                  </span>
                  <span className="text-sm font-mono font-bold text-white">
                    {data.byMode?.antakshari || 0}
                  </span>
                </div>
                <div className="p-2.5 rounded-xl bg-black/40 border border-white/5 flex items-center justify-between">
                  <span className="text-xs text-slate-300 flex items-center gap-1.5">
                    <Zap className="w-3.5 h-3.5 text-cyan-400" /> 60s Blitz
                  </span>
                  <span className="text-sm font-mono font-bold text-white">
                    {data.byMode?.blitz || 0}
                  </span>
                </div>
              </div>
            </div>

            {/* Language Breakdown */}
            <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 space-y-3">
              <div className="text-xs font-mono font-bold uppercase tracking-wider text-slate-300">
                Plays by Language
              </div>
              <div className="grid grid-cols-2 gap-2.5">
                <div className="p-2.5 rounded-xl bg-black/40 border border-white/5 flex items-center justify-between">
                  <span className="text-xs text-slate-300">🇮🇳 Hindi</span>
                  <span className="text-sm font-mono font-bold text-[#22E06B]">
                    {data.byLanguage?.hindi || 0}
                  </span>
                </div>
                <div className="p-2.5 rounded-xl bg-black/40 border border-white/5 flex items-center justify-between">
                  <span className="text-xs text-slate-300">🥁 Punjabi</span>
                  <span className="text-sm font-mono font-bold text-amber-300">
                    {data.byLanguage?.punjabi || 0}
                  </span>
                </div>
                <div className="p-2.5 rounded-xl bg-black/40 border border-white/5 flex items-center justify-between">
                  <span className="text-xs text-slate-300">🔥 Haryanvi</span>
                  <span className="text-sm font-mono font-bold text-cyan-300">
                    {data.byLanguage?.haryanvi || 0}
                  </span>
                </div>
                <div className="p-2.5 rounded-xl bg-black/40 border border-white/5 flex items-center justify-between">
                  <span className="text-xs text-slate-300">✨ Mixed / All</span>
                  <span className="text-sm font-mono font-bold text-purple-300">
                    {data.byLanguage?.all || 0}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Live Player Activity Stream */}
          <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 space-y-3">
            <div className="flex items-center justify-between">
              <div className="text-xs font-mono font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
                <Users className="w-4 h-4 text-[#22E06B]" />
                <span>Real-Time Visitor & Gameplay Feed</span>
              </div>
              <span className="text-[11px] font-mono text-slate-400">
                Auto-updates every 10s
              </span>
            </div>

            {data.recentEvents.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-400">
                Waiting for first live visitor or round event...
              </div>
            ) : (
              <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                {data.recentEvents.map((evt) => {
                  const isVisit = evt.type === 'visit';
                  const isEnd = evt.type === 'round_end';
                  const isIG = String(evt.source || '').toLowerCase().includes('instagram');

                  return (
                    <div
                      key={evt.id}
                      className="p-2.5 rounded-xl bg-black/45 border border-white/[0.07] flex items-center justify-between gap-3 text-xs"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <span
                          className={`w-2 h-2 rounded-full shrink-0 ${
                            isVisit
                              ? 'bg-pink-400'
                              : isEnd
                              ? evt.won
                                ? 'bg-[#22E06B]'
                                : 'bg-amber-400'
                              : 'bg-cyan-400'
                          }`}
                        />

                        <div className="truncate text-slate-200">
                          {isVisit ? (
                            <span>
                              New visitor opened website via{' '}
                              <strong className={isIG ? 'text-pink-400' : 'text-white'}>
                                {evt.source || 'Direct'}
                              </strong>
                            </span>
                          ) : isEnd ? (
                            <span>
                              Player{' '}
                              <strong className={evt.won ? 'text-[#22E06B]' : 'text-amber-300'}>
                                {evt.won ? 'guessed' : 'finished'}
                              </strong>{' '}
                              {evt.songTitle ? `"${evt.songTitle}"` : 'a round'} ({evt.mode?.toUpperCase()})
                            </span>
                          ) : (
                            <span>
                              Player started{' '}
                              <strong className="text-cyan-300">
                                {String(evt.language || 'hindi').toUpperCase()} •{' '}
                                {String(evt.mode || 'normal').toUpperCase()}
                              </strong>
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0 text-[11px] font-mono text-slate-400">
                        <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded bg-white/5 text-slate-300">
                          {evt.device === 'Desktop' ? (
                            <Monitor className="w-3 h-3" />
                          ) : (
                            <Smartphone className="w-3 h-3" />
                          )}
                          {evt.device || 'Mobile'}
                        </span>
                        <span>{formatTimeAgo(evt.timestamp)}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Optional Phone Notification Tip */}
          <div className="p-3.5 rounded-2xl bg-[#22E06B]/10 border border-[#22E06B]/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2.5 text-slate-200">
              <Bell className="w-4 h-4 text-[#22E06B] shrink-0" />
              <span>
                <strong>Want instant phone alerts too?</strong> Install the free{' '}
                <span className="font-mono text-[#22E06B]">ntfy</span> app on your phone and subscribe to topic:{' '}
                <code className="px-1.5 py-0.5 rounded bg-black/50 text-[#22E06B] font-mono">
                  {data.cloudTopic}
                </code>
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
