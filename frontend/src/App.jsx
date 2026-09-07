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

export default function App() {
  // State for selections
  const [selectedLanguage, setSelectedLanguage] = useState('hindi'); // 'hindi' | 'punjabi' | 'haryanvi'
  const [selectedDifficulty, setSelectedDifficulty] = useState('easy'); // 'easy' | 'medium' | 'hard' | 'expert' | 'impossible'
  const [startFromHook, setStartFromHook] = useState(false);

  // Backend status and data
  const [isBackendOffline, setIsBackendOffline] = useState(false);
  const [tracksCount, setTracksCount] = useState(52);
  const [isWaking, setIsWaking] = useState(false);
  const [showToast, setShowToast] = useState(false);

  // Stats state
  const [stats, setStats] = useState({
    played: 0,
    wins: 0,
    winRate: 0,
    streak: 0,
    bestStreak: 0
  });

  // Modal states
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const [isGameModalOpen, setIsGameModalOpen] = useState(false);
  const [activeRoundData, setActiveRoundData] = useState(null);

  // Check backend health & sync stats
  const checkHealth = useCallback(async () => {
    try {
      const res = await fetch('/api/health');
      if (res.ok) {
        setIsBackendOffline(false);
        setShowToast(false);
      }
    } catch {
      // Backend unavailable; client catalog remains fully active
    }
  }, []);

  // Fetch track count for selected filters
  const fetchTrackCount = useCallback(async () => {
    const localTracks = getFilteredTracks(selectedLanguage, selectedDifficulty);
    try {
      const res = await fetch(
        `/api/tracks?language=${selectedLanguage}&difficulty=${selectedDifficulty}`
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
  }, [selectedLanguage, selectedDifficulty]);

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

  // Initial load
  useEffect(() => {
    checkHealth();
    fetchTrackCount();
    fetchStats();
  }, [checkHealth, fetchTrackCount, fetchStats]);

  // Wake up servers button action
  const handleWakeServers = async () => {
    setIsWaking(true);
    try {
      const res = await fetch('/api/wake', { method: 'POST' });
      if (res.ok) {
        setIsBackendOffline(false);
        setShowToast(false);
        fetchTrackCount();
        fetchStats();
      } else {
        throw new Error('Server wake failed');
      }
    } catch {
      // If server could not be awakened directly, recheck after brief delay
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
    try {
      const res = await fetch(
        `/api/round?language=${selectedLanguage}&difficulty=${selectedDifficulty}&hook=${startFromHook}`
      );
      if (res.ok) {
        const data = await res.json();
        if (isDaily) {
          data.roundId = 'DAILY · ' + new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' }).toUpperCase();
        }
        setActiveRoundData(data);
        setIsGameModalOpen(true);
        return;
      }
    } catch {
      // Backend request failed or timed out; fall through to instant local generator
    }

    launchLocalMockRound(isDaily);
  };

  const launchLocalMockRound = (isDaily) => {
    const localData = generateRoundData(selectedLanguage, selectedDifficulty, startFromHook);
    if (isDaily) {
      localData.roundId = 'DAILY · ' + new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' }).toUpperCase();
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
        body: JSON.stringify({ won, stage })
      });
      if (res.ok) {
        const updated = await res.json();
        setStats(updated);
        return;
      }
    } catch {
      // Fallback local state update
    }

    // Local state fallback
    setStats((prev) => {
      const played = prev.played + 1;
      const wins = won ? prev.wins + 1 : prev.wins;
      const streak = won ? prev.streak + 1 : 0;
      const bestStreak = Math.max(prev.bestStreak, streak);
      const winRate = Math.round((wins / played) * 100);
      return { played, wins, winRate, streak, bestStreak };
    });
  };

  return (
    <div className="min-h-screen bg-[#0A0A0B] text-[#F5F5F5] relative selection:bg-[#22E06B] selection:text-[#0A0A0B] overflow-x-hidden">
      {/* Subtle warm maroon/rust-brown stage glow behind top-left hero */}
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
      <main className="relative z-10 max-w-7xl mx-auto px-6 sm:px-8 py-8 sm:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          {/* Left Column (~60-65% width: 7/12 or 8/12 on large screens) */}
          <div className="lg:col-span-7 xl:col-span-8 flex flex-col">
            {/* Hero Section */}
            <Hero />

            {/* Game Setup Card */}
            <GameSetupCard
              selectedLanguage={selectedLanguage}
              onSelectLanguage={setSelectedLanguage}
              selectedDifficulty={selectedDifficulty}
              onSelectDifficulty={setSelectedDifficulty}
              startFromHook={startFromHook}
              onToggleHook={() => setStartFromHook((prev) => !prev)}
              tracksCount={tracksCount}
              isBackendOffline={isBackendOffline}
              onStartRound={() => handleStartRound(false)}
              onStartDaily={() => handleStartRound(true)}
            />
          </div>

          {/* Right Column (~35-40% width: 5/12 or 4/12 on large screens) */}
          <div className="lg:col-span-5 xl:col-span-4">
            <SidebarPanel
              stats={stats}
              onOpenSettings={() => setIsHelpOpen(true)}
            />
          </div>
        </div>
      </main>

      {/* Full-width Footer */}
      <Footer />

      {/* Global Toast / Banner fixed to bottom */}
      <Toast
        visible={showToast}
        isWaking={isWaking}
        onWake={handleWakeServers}
        onDismiss={() => setShowToast(false)}
      />

      {/* Help / Rules Modal */}
      <HelpModal isOpen={isHelpOpen} onClose={() => setIsHelpOpen(false)} />

      {/* Heardle Interactive Gameplay Modal */}
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
