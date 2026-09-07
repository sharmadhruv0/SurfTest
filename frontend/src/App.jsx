import React, { useState, useEffect, useCallback } from 'react';
import TopBar from './components/TopBar';
import Hero from './components/Hero';
import GameSetupCard from './components/GameSetupCard';
import SidebarPanel from './components/SidebarPanel';
import Footer from './components/Footer';
import Toast from './components/Toast';
import HelpModal from './components/HelpModal';
import GamePlayModal from './components/GamePlayModal';
import { TRACK_CATALOG, generateRoundData, getFilteredTracks } from './data/tracks';
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
    return localStorage.getItem('surftest_mode') || 'normal'; // 'normal' | 'reverse'
  });
  const [selectedDifficulty, setSelectedDifficulty] = useState('easy'); // 'easy' | 'medium' | 'hard' | 'expert' | 'impossible'
  const [startFromHook, setStartFromHook] = useState(false);

  // Backend status, era statistics and track pool
  const [isBackendOffline, setIsBackendOffline] = useState(false);
  const [tracksCount, setTracksCount] = useState(52);
  const [eraStats, setEraStats] = useState([]);
  const [isWaking, setIsWaking] = useState(false);
  const [showToast, setShowToast] = useState(false);

  // Stats state
  const [stats, setStats] = useState({
    played: 0,
    wins: 0,
    winRate: 0,
    streak: 0,
    bestStreak: 0,
    normal: { played: 0, wins: 0, winRate: 0, streak: 0, bestStreak: 0 },
    reverse: { played: 0, wins: 0, winRate: 0, streak: 0, bestStreak: 0 }
  });

  // Modal states
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const [isGameModalOpen, setIsGameModalOpen] = useState(false);
  const [activeRoundData, setActiveRoundData] = useState(null);

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
    try {
      const res = await fetch(`/api/eras?language=${selectedLanguage}`);
      if (res.ok) {
        const data = await res.json();
        setEraStats(data.eras || []);
        return;
      }
    } catch {
      // Compute fallback era stats locally from TRACK_CATALOG
    }

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
    setEraStats(localEras);
  }, [selectedLanguage]);

  // Fetch track count for selected language + era + difficulty
  const fetchTrackCount = useCallback(async () => {
    const localTracks = getFilteredTracks(selectedLanguage, selectedEra, selectedDifficulty);
    try {
      const res = await fetch(
        `/api/tracks?language=${selectedLanguage}&era=${selectedEra}&difficulty=${selectedDifficulty}`
      );
      if (res.ok) {
        const data = await res.json();
        setTracksCount(data.total > 0 ? data.total : localTracks.length);
        setIsBackendOffline(false);
        return;
      }
    } catch {
      // Use local catalog count
    }
    setTracksCount(localTracks.length);
  }, [selectedLanguage, selectedEra, selectedDifficulty]);

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

  return (
    <div className="min-h-screen bg-[#0A0A0B] text-[#F5F5F5] relative selection:bg-[#22E06B] selection:text-[#0A0A0B] overflow-x-hidden">
      {/* Subtle warm stage glow behind top-left hero */}
      <div
        className="pointer-events-none fixed inset-0 z-0 opacity-100"
        style={{
          background:
            'radial-gradient(ellipse 70% 55% at 8% 12%, rgba(120,40,30,0.22) 0%, rgba(60,20,15,0.08) 45%, transparent 75%)'
        }}
      />

      {/* Top Bar Navigation */}
      <TopBar streak={stats.streak} onOpenHelp={() => setIsHelpOpen(true)} />

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

      <GamePlayModal
        isOpen={isGameModalOpen}
        onClose={() => setIsGameModalOpen(false)}
        roundData={activeRoundData}
        onRecordResult={handleRecordResult}
        onPlayNext={() => handleStartRound(false)}
      />
    </div>
  );
}
