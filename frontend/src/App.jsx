import React, { useState, useEffect, useCallback } from 'react';
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
import IntroVideoModal from './components/IntroVideoModal';
import { TRACK_CATALOG, generateRoundData, getFilteredTracks, startLocalAntakshariSession } from './data/tracks';
import { ERAS, getEraFromYear, getEraMeta } from './constants/eras.js';

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
  const [startFromHook, setStartFromHook] = useState(false);

  // Backend status, era statistics and track pool
  const [isBackendOffline, setIsBackendOffline] = useState(false);
  const [tracksCount, setTracksCount] = useState(() => getFilteredTracks('hindi', 'all', 'all').length);
  const [eraStats, setEraStats] = useState([]);
  const [isWaking, setIsWaking] = useState(false);
  const [showToast, setShowToast] = useState(false);

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

  // Intro Video Trailer modal state
  const [isTrailerOpen, setIsTrailerOpen] = useState(false);

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

  // Fetch era breakdown for the current language
  const fetchEraStats = useCallback(async () => {
    const localEras = ERAS.map((era) => {
      let count = 0;
      for (const t of TRACK_CATALOG) {
        const tEra = t.era || getEraFromYear(t.year);
        const isEraMatch = era.id === 'all' || tEra === era.id;
        const isLangMatch = selectedLanguage === 'all' || t.language.toLowerCase() === selectedLanguage.toLowerCase();
        if (isEraMatch && isLangMatch) {
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

    try {
      const res = await fetch(`/api/eras?language=${selectedLanguage}`);
      if (res.ok) {
        const data = await res.json();
        if (data.eras && (data.total || 0) >= TRACK_CATALOG.length) {
          setEraStats(data.eras);
          return;
        }
      }
    } catch {
      // Compute fallback era stats locally from TRACK_CATALOG
    }

    setEraStats(localEras);
  }, [selectedLanguage]);

  // Fetch track count for selected language + era
  const fetchTrackCount = useCallback(async () => {
    const localTracks = getFilteredTracks(selectedLanguage, selectedEra, 'all');
    try {
      const res = await fetch(
        `/api/tracks?language=${selectedLanguage}&era=${selectedEra}`
      );
      if (res.ok) {
        const data = await res.json();
        setTracksCount(Math.max(data.total || 0, localTracks.length));
        setIsBackendOffline(false);
        return;
      }
    } catch {
      // Use local catalog count
    }
    setTracksCount(localTracks.length);
  }, [selectedLanguage, selectedEra]);

  // Fetch listening log stats
  const fetchStats = useCallback(async () => {
    try {
      const res = await fetch('/api/stats');
      if (res.ok) {
        const data = await res.json();
        setStats(data);
      }
    } catch {
      // Use local default stats
    }
  }, []);

  // Sync on mount and filter changes
  useEffect(() => {
    checkHealth();
    fetchStats();
  }, [checkHealth, fetchStats]);

  useEffect(() => {
    fetchEraStats();
    fetchTrackCount();
  }, [fetchEraStats, fetchTrackCount]);

  // Wake up servers button action
  const handleWakeServers = async () => {
    setIsWaking(true);
    try {
      const res = await fetch('/api/wake', { method: 'POST' });
      if (res.ok) {
        setIsBackendOffline(false);
        setShowToast(false);
        fetchEraStats();
        fetchTrackCount();
        fetchStats();
      } else {
        throw new Error('Server wake failed');
      }
    } catch {
      setTimeout(() => {
        checkHealth();
        setIsWaking(false);
      }, 1200);
      return;
    }
    setIsWaking(false);
  };

  // Start a game round
  const handleStartRound = async (isDaily = false) => {
    // 60s BLITZ MODE BRANCH
    if (selectedMode === 'blitz') {
      setIsBlitzModalOpen(true);
      return;
    }

    // STANDALONE ANTAKSHARI MODE BRANCH
    if (selectedMode === 'antakshari') {
      try {
        const res = await fetch(`/api/antakshari/start?language=${selectedLanguage}`);
        if (res.ok) {
          const data = await res.json();
          setActiveAntakshariData(data);
          setIsAntakshariModalOpen(true);
          return;
        }
      } catch {
        // Fallback to local Antakshari session generator
      }

      const localData = startLocalAntakshariSession(selectedLanguage);
      setActiveAntakshariData(localData);
      setIsAntakshariModalOpen(true);
      return;
    }

    const dailyLabel = `DAILY · ${selectedLanguage === 'all' ? 'MIXED' : selectedLanguage.toUpperCase()} · ${selectedEra === 'all' ? 'ALL ERAS' : selectedEra.toUpperCase()}${selectedMode === 'reverse' ? ' · REVERSED 🔄' : ''}`;

    try {
      const res = await fetch(
        `/api/round?language=${selectedLanguage}&era=${selectedEra}&difficulty=${selectedDifficulty}&hook=${startFromHook}&mode=${selectedMode}`
      );
      if (res.ok) {
        const data = await res.json();
        if (isDaily) {
          data.roundId = dailyLabel;
        }
        setActiveRoundData(data);
        setIsGameModalOpen(true);
        return;
      }
    } catch {
      // Backend request failed or timed out; fall through to instant local generator
    }

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
  const handleRecordResult = async (won, stage) => {
    try {
      const res = await fetch('/api/stats/record', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ won, stage, mode: selectedMode })
      });
      if (res.ok) {
        const updated = await res.json();
        setStats(updated);
        return;
      }
    } catch {
      // Fallback local state update
    }

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

      return {
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
    });
  };

  // Record Antakshari chain result
  const handleRecordAntakshariChain = (chainLength, beatChain) => {
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
      {/* Dynamic Liquid Glass Background Atmosphere & Glowing Orbs */}
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
        {/* Top-left Emerald / Cyan Liquid Orb */}
        <div
          className="absolute -top-[12%] -left-[10%] w-[550px] sm:w-[750px] h-[550px] sm:h-[750px] rounded-full opacity-40 blur-[90px] animate-fluid-1"
          style={{
            background: 'radial-gradient(circle, rgba(34,224,107,0.35) 0%, rgba(6,182,212,0.2) 45%, transparent 70%)'
          }}
        />

        {/* Top-right Purple / Indigo Liquid Orb */}
        <div
          className="absolute -top-[15%] -right-[10%] w-[500px] sm:w-[700px] h-[500px] sm:h-[700px] rounded-full opacity-35 blur-[95px] animate-fluid-2"
          style={{
            background: 'radial-gradient(circle, rgba(168,85,247,0.32) 0%, rgba(99,102,241,0.18) 45%, transparent 70%)'
          }}
        />

        {/* Mid-center Warm Amber / Orange Liquid Orb */}
        <div
          className="absolute top-[40%] left-[25%] w-[450px] sm:w-[600px] h-[450px] sm:h-[600px] rounded-full opacity-25 blur-[100px] animate-fluid-3"
          style={{
            background: 'radial-gradient(circle, rgba(245,158,11,0.25) 0%, rgba(239,68,68,0.12) 50%, transparent 70%)'
          }}
        />

        {/* Bottom-right Pink / Magenta Liquid Orb */}
        <div
          className="absolute -bottom-[10%] -right-[5%] w-[500px] sm:w-[650px] h-[500px] sm:h-[650px] rounded-full opacity-30 blur-[90px] animate-fluid-1"
          style={{
            background: 'radial-gradient(circle, rgba(236,72,153,0.25) 0%, rgba(139,92,246,0.15) 50%, transparent 70%)'
          }}
        />

        {/* Subtle Liquid Glass Caustic / Vignette Overlay */}
        <div
          className="absolute inset-0 opacity-60"
          style={{
            backgroundImage:
              'radial-gradient(ellipse at 50% 0%, rgba(255,255,255,0.03) 0%, transparent 70%), radial-gradient(ellipse at 50% 100%, rgba(0,0,0,0.6) 0%, transparent 70%)'
          }}
        />
      </div>

      {/* Top Bar Navigation */}
      <TopBar streak={stats.streak} onOpenHelp={() => setIsHelpOpen(true)} />

      {/* Main Two-Column Layout */}
      <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-8 py-8 sm:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          {/* Left Column (~60-65% width) */}
          <div className="lg:col-span-7 xl:col-span-8 flex flex-col">
            {/* Hero Section */}
            <Hero onOpenTrailer={() => setIsTrailerOpen(true)} />

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

      {/* Official Feature Intro Video Modal */}
      <IntroVideoModal
        isOpen={isTrailerOpen}
        onClose={() => setIsTrailerOpen(false)}
        onSelectModeAndStart={(mode) => {
          handleSelectMode(mode);
          setIsTrailerOpen(false);
          if (mode === 'blitz') {
            setIsBlitzModalOpen(true);
          }
        }}
      />
    </div>
  );
}
