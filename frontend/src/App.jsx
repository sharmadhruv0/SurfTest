import React, { useState, useEffect, useCallback, useMemo } from 'react';
import TopBar from './components/TopBar';
import Hero from './components/Hero';
import GameSetupCard from './components/GameSetupCard';
import SidebarPanel from './components/SidebarPanel';
import Footer from './components/Footer';
import Toast from './components/Toast';
import HelpModal from './components/HelpModal';
import GamePlayModal from './components/GamePlayModal';
import AntakshariModal from './components/AntakshariModal';
import BlitzModal from './components/BlitzModal';
import AdminDashboardModal from './components/AdminDashboardModal';
import { TRACK_CATALOG, generateRoundData, getFilteredTracks, startLocalAntakshariSession } from './data/tracks';
import { ERAS, getEraFromYear, getEraMeta } from './constants/eras.js';
import { recordGlobalEvent, fetchGlobalTelemetry } from './utils/telemetry';

export default function App() {
  // State for selections with localStorage persistence
  const [selectedLanguage, setSelectedLanguage] = useState(() => {
    return localStorage.getItem('surftest_lang') || 'hindi'; // 'all' | 'hindi' | 'punjabi' | 'haryanvi'
  });
  const [selectedEra, setSelectedEra] = useState(() => {
    return localStorage.getItem('surftest_era') || 'all'; // 'all' | 'old-is-gold' | '2000s' | '2010s' | 'new'
  });
  const [selectedMode, setSelectedMode] = useState(() => {
    return localStorage.getItem('surftest_mode') || 'normal'; // 'normal' | 'reverse' | 'antakshari'
  });
  const [selectedDifficulty, setSelectedDifficulty] = useState('easy'); // 'easy' | 'medium' | 'hard' | 'expert' | 'impossible'
  const [startFromHook, setStartFromHook] = useState(true);

  // Backend status & instant memoized catalog counts (0ms filter changes)
  const [isBackendOffline, setIsBackendOffline] = useState(false);
  const [isWaking, setIsWaking] = useState(false);
  const [showToast, setShowToast] = useState(false);

  const eraStats = useMemo(() => {
    const langLower = selectedLanguage.toLowerCase();
    return ERAS.map((era) => {
      let count = 0;
      for (let i = 0; i < TRACK_CATALOG.length; i++) {
        const t = TRACK_CATALOG[i];
        const isLangMatch = selectedLanguage === 'all' || t.language.toLowerCase() === langLower;
        if (!isLangMatch) continue;
        const tEra = t.era || getEraFromYear(t.year);
        if (era.id === 'all' || tEra === era.id) {
          count++;
        }
      }
      return {
        id: era.id,
        label: era.label,
        shortLabel: era.shortLabel,
        range: era.range,
        period: era.period,
        tagline: era.tagline,
        total: count,
        theme: era.theme
      };
    });
  }, [selectedLanguage]);

  const tracksCount = useMemo(() => {
    return getFilteredTracks(selectedLanguage, selectedEra, 'all').length;
  }, [selectedLanguage, selectedEra]);

  // Stats state
  const [stats, setStats] = useState(() => {
    const saved = localStorage.getItem('surftest_stats');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {}
    }
    return {
      played: 0,
      wins: 0,
      winRate: 0,
      streak: 0,
      bestStreak: 0,
      normal: { played: 0, wins: 0, winRate: 0, streak: 0, bestStreak: 0 },
      reverse: { played: 0, wins: 0, winRate: 0, streak: 0, bestStreak: 0 },
      antakshari: { played: 0, bestChain: 0, totalChained: 0 },
      blitz: { played: 0, bestScore: 0, bestStreak: 0 }
    };
  });

  // Modal states
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const [isGameModalOpen, setIsGameModalOpen] = useState(false);
  const [activeRoundData, setActiveRoundData] = useState(null);

  // Standalone Antakshari modal state
  const [isAntakshariModalOpen, setIsAntakshariModalOpen] = useState(false);
  const [activeAntakshariData, setActiveAntakshariData] = useState(null);

  // 60s Blitz modal state
  const [isBlitzModalOpen, setIsBlitzModalOpen] = useState(false);

  // Global telemetry & Secret Owner Admin Dashboard state
  const [telemetry, setTelemetry] = useState(null);
  const [isAdminModalOpen, setIsAdminModalOpen] = useState(false);
  const [isAdminUnlocked, setIsAdminUnlocked] = useState(() => {
    return localStorage.getItem('surftest_admin_unlocked') === 'true';
  });

  const refreshTelemetry = useCallback(async () => {
    const data = await fetchGlobalTelemetry();
    if (data) setTelemetry(data);
  }, []);

  // Log visit once per browser session & check ?admin=1 URL shortcut
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const adminParam = params.get('admin');
    if (adminParam === '2026') {
      localStorage.setItem('surftest_admin_unlocked', 'true');
      setIsAdminUnlocked(true);
      setIsAdminModalOpen(true);
    } else if (adminParam === '1' || adminParam === 'true' || adminParam === 'surtest') {
      setIsAdminModalOpen(true);
    }

    if (!sessionStorage.getItem('surftest_visit_logged')) {
      sessionStorage.setItem('surftest_visit_logged', '1');
      recordGlobalEvent({ type: 'visit' }).then(() => {
        refreshTelemetry();
      });
    } else {
      refreshTelemetry();
    }
  }, [refreshTelemetry]);

  // Save language, era & mode preferences
  const handleSelectLanguage = (lang) => {
    setSelectedLanguage(lang);
    localStorage.setItem('surftest_lang', lang);
  };

  const handleSelectEra = (era) => {
    setSelectedEra(era);
    localStorage.setItem('surftest_era', era);
  };

  const handleSelectMode = (mode) => {
    setSelectedMode(mode);
    localStorage.setItem('surftest_mode', mode);
  };

  const bumpLocalPlays = useCallback(() => {
    setTelemetry((prev) =>
      prev ? { ...prev, publicTotalPlays: (prev.publicTotalPlays || 148) + 1 } : prev
    );
  }, []);

  // Check backend health & sync stats
  const checkHealth = useCallback(async () => {
    try {
      const res = await fetch('/api/health');
      if (res.ok) {
        setIsBackendOffline(false);
        setShowToast(false);
      }
    } catch {
      // Backend unavailable; client catalog remains active
    }
  }, []);

  // Sync on mount
  useEffect(() => {
    checkHealth();
  }, [checkHealth]);

  // Wake up servers button action
  const handleWakeServers = async () => {
    setIsWaking(true);
    try {
      const res = await fetch('/api/wake', { method: 'POST' });
      if (res.ok) {
        setIsBackendOffline(false);
        setShowToast(false);
      }
    } catch {
      // Ignore error
    }
    setIsWaking(false);
  };

  // Start a game round instantly (0ms client latency)
  const handleStartRound = (isDaily = false) => {
    bumpLocalPlays();
    recordGlobalEvent({
      type: 'play_start',
      mode: selectedMode,
      language: selectedLanguage
    });

    // 60s BLITZ MODE BRANCH
    if (selectedMode === 'blitz') {
      setIsBlitzModalOpen(true);
      return;
    }

    // STANDALONE ANTAKSHARI MODE BRANCH
    if (selectedMode === 'antakshari') {
      const localData = startLocalAntakshariSession(selectedLanguage);
      setActiveAntakshariData(localData);
      setIsAntakshariModalOpen(true);
      return;
    }

    const dailyLabel = `DAILY · ${selectedLanguage === 'all' ? 'MIXED' : selectedLanguage.toUpperCase()} · ${selectedEra === 'all' ? 'ALL ERAS' : selectedEra.toUpperCase()}${selectedMode === 'reverse' ? ' · REVERSED 🔄' : ''}`;
    launchLocalRound(isDaily, dailyLabel);
  };

  const launchLocalRound = (isDaily, dailyLabel) => {
    const localData = generateRoundData(
      selectedLanguage,
      selectedEra,
      selectedDifficulty,
      startFromHook,
      selectedMode
    );
    if (isDaily) {
      localData.roundId = dailyLabel || `DAILY · ${selectedLanguage.toUpperCase()} · ${selectedEra.toUpperCase()}${selectedMode === 'reverse' ? ' · REVERSED 🔄' : ''}`;
    }
    setActiveRoundData(localData);
    setIsGameModalOpen(true);
  };

  // Record game result
  const handleRecordResult = (won, stage) => {
    bumpLocalPlays();
    recordGlobalEvent({
      type: 'round_end',
      mode: selectedMode,
      language: selectedLanguage,
      won: Boolean(won),
      stage,
      songTitle: activeRoundData?.track?.title || null
    });

    fetch('/api/stats/record', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ won, stage, mode: selectedMode })
    }).catch(() => {});

    setStats((prev) => {
      const played = prev.played + 1;
      const wins = won ? prev.wins + 1 : prev.wins;
      const streak = won ? prev.streak + 1 : 0;
      const bestStreak = Math.max(prev.bestStreak, streak);
      const winRate = Math.round((wins / played) * 100);

      const modeStats = prev[selectedMode] || { played: 0, wins: 0, winRate: 0, streak: 0, bestStreak: 0 };
      const mPlayed = modeStats.played + 1;
      const mWins = won ? modeStats.wins + 1 : modeStats.wins;
      const mStreak = won ? modeStats.streak + 1 : 0;
      const mBestStreak = Math.max(modeStats.bestStreak, mStreak);
      const mWinRate = Math.round((mWins / mPlayed) * 100);

      const nextStats = {
        ...prev,
        played,
        wins,
        winRate,
        streak,
        bestStreak,
        [selectedMode]: {
          played: mPlayed,
          wins: mWins,
          winRate: mWinRate,
          streak: mStreak,
          bestStreak: mBestStreak
        }
      };
      localStorage.setItem('surftest_stats', JSON.stringify(nextStats));
      return nextStats;
    });
  };

  // Record Antakshari chain result
  const handleRecordAntakshariChain = (chainLength, beatChain) => {
    bumpLocalPlays();
    recordGlobalEvent({
      type: 'round_end',
      mode: 'antakshari',
      language: selectedLanguage,
      won: Boolean(beatChain || chainLength >= 2),
      score: chainLength,
      songTitle: `Chain of ${chainLength} songs`
    });

    setStats((prev) => {
      const ant = prev.antakshari || { played: 0, bestChain: 0, totalChained: 0 };
      const played = ant.played + 1;
      const bestChain = Math.max(ant.bestChain || 0, chainLength);
      const totalChained = (ant.totalChained || 0) + chainLength;

      const newStats = {
        ...prev,
        antakshari: {
          played,
          bestChain,
          totalChained
        }
      };
      localStorage.setItem('surftest_stats', JSON.stringify(newStats));
      return newStats;
    });
  };

  // Record 60s Blitz run result
  const handleRecordBlitzRun = (score, runBestCombo) => {
    bumpLocalPlays();
    recordGlobalEvent({
      type: 'round_end',
      mode: 'blitz',
      language: selectedLanguage,
      won: score > 0,
      score,
      songTitle: `Blitz Score: ${score} pts`
    });

    setStats((prev) => {
      const blz = prev.blitz || { played: 0, bestScore: 0, bestStreak: 0 };
      const played = blz.played + 1;
      const bestScore = Math.max(blz.bestScore || 0, score);
      const bestStreak = Math.max(blz.bestStreak || 0, runBestCombo);

      const newStats = {
        ...prev,
        blitz: {
          played,
          bestScore,
          bestStreak
        }
      };
      localStorage.setItem('surftest_stats', JSON.stringify(newStats));
      return newStats;
    });
  };

  return (
    <div className="min-h-screen bg-[#06070B] text-[#F8FAFC] relative selection:bg-[#22E06B] selection:text-[#06070B] overflow-x-hidden">
      {/* Lightweight Static Ambient Glow Background (Zero GPU Filter/Blur Repaints) */}
      <div
        className="pointer-events-none fixed inset-0 z-0"
        style={{
          backgroundImage: [
            'radial-gradient(circle at 12% 10%, rgba(34,224,107,0.14) 0%, rgba(6,182,212,0.06) 28%, transparent 52%)',
            'radial-gradient(circle at 88% 8%, rgba(168,85,247,0.12) 0%, rgba(99,102,241,0.05) 28%, transparent 50%)',
            'radial-gradient(circle at 42% 58%, rgba(245,158,11,0.07) 0%, transparent 45%)',
            'radial-gradient(circle at 85% 90%, rgba(236,72,153,0.08) 0%, transparent 45%)'
          ].join(', ')
        }}
      />

      {/* Top Bar Navigation */}
      <TopBar
        streak={stats.streak}
        globalPlays={telemetry?.publicTotalPlays || 148}
        isAdminUnlocked={isAdminUnlocked}
        onOpenAdmin={() => setIsAdminModalOpen(true)}
        onOpenHelp={() => setIsHelpOpen(true)}
      />

      {/* Main Two-Column Layout */}
      <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-8 py-8 sm:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          {/* Left Column (~60-65% width) */}
          <div className="lg:col-span-7 xl:col-span-8 flex flex-col">
            {/* Hero Section */}
            <Hero />

            {/* Game Setup Card with Language, Era, and Mode Selection */}
            <GameSetupCard
              selectedLanguage={selectedLanguage}
              onSelectLanguage={handleSelectLanguage}
              selectedEra={selectedEra}
              onSelectEra={handleSelectEra}
              eraStats={eraStats}
              selectedMode={selectedMode}
              onSelectMode={handleSelectMode}
              selectedDifficulty={selectedDifficulty}
              onSelectDifficulty={setSelectedDifficulty}
              startFromHook={startFromHook}
              onToggleHook={() => setStartFromHook((prev) => !prev)}
              tracksCount={tracksCount}
              onStartRound={() => handleStartRound(false)}
              onStartDaily={() => handleStartRound(true)}
            />
          </div>

          {/* Right Column (~35-40% width) */}
          <div className="lg:col-span-5 xl:col-span-4">
            <SidebarPanel
              stats={stats}
              selectedMode={selectedMode}
              onSelectMode={handleSelectMode}
              onOpenSettings={() => setIsHelpOpen(true)}
            />
          </div>
        </div>
      </main>

      {/* Full-width Footer */}
      <Footer />

      {/* Reusable Toast */}
      <Toast
        visible={showToast}
        isWaking={isWaking}
        onWake={handleWakeServers}
        onDismiss={() => setShowToast(false)}
      />

      {/* Modals */}
      <HelpModal isOpen={isHelpOpen} onClose={() => setIsHelpOpen(false)} />

      {/* Standard / Reverse Game Play Modal */}
      <GamePlayModal
        isOpen={isGameModalOpen}
        onClose={() => setIsGameModalOpen(false)}
        roundData={activeRoundData}
        onRecordResult={handleRecordResult}
        onPlayNext={() => handleStartRound(false)}
      />

      {/* Standalone Antakshari Game Modal */}
      <AntakshariModal
        isOpen={isAntakshariModalOpen}
        onClose={() => setIsAntakshariModalOpen(false)}
        initialData={activeAntakshariData}
        selectedLanguage={selectedLanguage}
        onRecordChain={handleRecordAntakshariChain}
      />

      {/* 60-Second Blitz Speedrun Modal */}
      <BlitzModal
        isOpen={isBlitzModalOpen}
        onClose={() => setIsBlitzModalOpen(false)}
        selectedLanguage={selectedLanguage}
        selectedEra={selectedEra}
        onRecordBlitzRun={handleRecordBlitzRun}
      />

      {/* Secret Owner Live Analytics Dashboard Modal */}
      <AdminDashboardModal
        isOpen={isAdminModalOpen}
        onClose={() => setIsAdminModalOpen(false)}
        isAdminUnlocked={isAdminUnlocked}
        onUnlockAdmin={() => {
          localStorage.setItem('surftest_admin_unlocked', 'true');
          setIsAdminUnlocked(true);
          refreshTelemetry();
        }}
        onLockAdmin={() => {
          localStorage.removeItem('surftest_admin_unlocked');
          setIsAdminUnlocked(false);
        }}
        telemetry={telemetry}
        onRefreshTelemetry={refreshTelemetry}
      />
    </div>
  );
}
