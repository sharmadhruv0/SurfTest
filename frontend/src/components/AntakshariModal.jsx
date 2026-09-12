import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Play, Pause, Volume2, VolumeX, Check, X, Award, Share2, Link2, Sparkles,
  Trophy, ArrowRight, Music2, RefreshCw, Users, Clock, Flame, AlertCircle,
  Copy, LogIn, Plus, Send, Radio
} from 'lucide-react';
import { TRACK_CATALOG } from '../data/tracks.js';
import {
  validateAntakshariSubmission,
  computeSongSounds,
  ANTAKSHARI_BUCKETS,
  normalizeSongTitle
} from '../../../shared/antakshari.js';

export default function AntakshariModal({
  isOpen,
  onClose,
  initialData,
  selectedLanguage = 'all',
  onRecordChain
}) {
  if (!isOpen) return null;

  // View state: 'lobby' | 'waiting_room' | 'playing' | 'game_over'
  const [screen, setScreen] = useState('lobby');
  const [gameMode, setGameMode] = useState('pass_and_play'); // 'pass_and_play' | 'online'
  const [onlineSubTab, setOnlineSubTab] = useState('create'); // 'create' | 'join'

  // Match configuration
  const [teamAName, setTeamAName] = useState('Team Sur');
  const [teamBName, setTeamBName] = useState('Team Taal');
  const [hostPlayerName, setHostPlayerName] = useState('Host Player');
  const [joinPlayerName, setJoinPlayerName] = useState('Challenger');
  const [joinRoomCodeInput, setJoinRoomCodeInput] = useState('');
  const [targetScore, setTargetScore] = useState(5); // First to 5 points
  const [turnDuration, setTurnDuration] = useState(30); // 30 seconds per turn

  // Online Room State
  const [roomCode, setRoomCode] = useState('');
  const [myTeam, setMyTeam] = useState('A'); // 'A' | 'B' | 'both'
  const [myPlayerId, setMyPlayerId] = useState('');
  const [onlineRoom, setOnlineRoom] = useState(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);

  // Active Match State (used by both Pass & Play and Online Mode)
  const [matchState, setMatchState] = useState({
    teams: {
      A: { id: 'A', name: 'Team Sur', score: 0 },
      B: { id: 'B', name: 'Team Taal', score: 0 }
    },
    currentTurn: 'A',
    turnNumber: 1,
    targetScore: 5,
    turnDuration: 30,
    currentRequiredSound: null, // null on Turn 1 (any song!)
    previousSong: null,
    usedSongs: [],
    chainHistory: [],
    winner: null,
    lastMessage: 'Round 1: Team Sur kicks off with any song of choice!'
  });

  // Turn Timer State
  const [secondsLeft, setSecondsLeft] = useState(30);
  const timerRef = useRef(null);

  // Input & Autocomplete State
  const [songInput, setSongInput] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [validationError, setValidationError] = useState(null);
  const [turnSuccessMessage, setTurnSuccessMessage] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Audio Playback State (for singing along to catalog clips)
  const [currentAudioUrl, setCurrentAudioUrl] = useState(null);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [copiedShare, setCopiedShare] = useState(false);
  const audioRef = useRef(null);
  const pollIntervalRef = useRef(null);

  // --------------------------------------------------------------------------
  // AUDIO CONTROLLER
  // --------------------------------------------------------------------------
  const playClip = (url) => {
    if (!url || !audioRef.current) return;
    setCurrentAudioUrl(url);
    audioRef.current.currentTime = 0;
    audioRef.current.play().then(() => {
      setIsPlayingAudio(true);
    }).catch(() => {
      setIsPlayingAudio(false);
    });
  };

  const toggleAudio = () => {
    if (!audioRef.current) return;
    if (isPlayingAudio) {
      audioRef.current.pause();
      setIsPlayingAudio(false);
    } else {
      audioRef.current.play().then(() => {
        setIsPlayingAudio(true);
      }).catch(() => {});
    }
  };

  // Stop audio and timers on unmount or screen changes
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
      if (audioRef.current) audioRef.current.pause();
    };
  }, []);

  // --------------------------------------------------------------------------
  // PASS & PLAY MATCH ENGINE (Local turn-based state)
  // --------------------------------------------------------------------------
  const startPassAndPlayMatch = () => {
    const freshMatch = {
      teams: {
        A: { id: 'A', name: (teamAName || 'Team Sur').trim(), score: 0 },
        B: { id: 'B', name: (teamBName || 'Team Taal').trim(), score: 0 }
      },
      currentTurn: 'A',
      turnNumber: 1,
      targetScore: Number(targetScore) || 5,
      turnDuration: Number(turnDuration) || 30,
      currentRequiredSound: null,
      previousSong: null,
      usedSongs: [],
      chainHistory: [],
      winner: null,
      lastMessage: `🎤 Turn 1: ${(teamAName || 'Team Sur')} starts the match! Sing any song of your choice.`
    };

    setMatchState(freshMatch);
    setMyTeam('both');
    setSecondsLeft(Number(turnDuration) || 30);
    setSongInput('');
    setValidationError(null);
    setTurnSuccessMessage(null);
    setScreen('playing');
  };

  // Local Pass & Play Turn Timeout Handler
  const handleLocalTimeout = useCallback(() => {
    setMatchState((prev) => {
      if (prev.winner) return prev;

      const timedOutTeam = prev.currentTurn;
      const opposingTeam = timedOutTeam === 'A' ? 'B' : 'A';
      const updatedOpposingScore = prev.teams[opposingTeam].score + 1;

      // Check win
      if (updatedOpposingScore >= prev.targetScore) {
        if (onRecordChain) onRecordChain(prev.chainHistory.length, true);
        return {
          ...prev,
          teams: {
            ...prev.teams,
            [opposingTeam]: { ...prev.teams[opposingTeam], score: updatedOpposingScore }
          },
          winner: opposingTeam,
          lastMessage: `⏰ Time expired for ${prev.teams[timedOutTeam].name}! 🏆 ${prev.teams[opposingTeam].name} wins the match!`
        };
      }

      return {
        ...prev,
        teams: {
          ...prev.teams,
          [opposingTeam]: { ...prev.teams[opposingTeam], score: updatedOpposingScore }
        },
        currentTurn: opposingTeam,
        turnNumber: prev.turnNumber + 1,
        lastMessage: `⏰ 30s timer expired for ${prev.teams[timedOutTeam].name}! +1 point awarded to ${prev.teams[opposingTeam].name}. Turn passes to ${prev.teams[opposingTeam].name}!`
      };
    });

    setSecondsLeft(matchState.turnDuration || 30);
    setValidationError(null);
    setSongInput('');
  }, [matchState.turnDuration, onRecordChain]);

  // Local Timer tick effect
  useEffect(() => {
    if (screen !== 'playing' || gameMode !== 'pass_and_play' || matchState.winner) {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }

    timerRef.current = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          handleLocalTimeout();
          return matchState.turnDuration || 30;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timerRef.current);
  }, [screen, gameMode, matchState.winner, matchState.turnDuration, handleLocalTimeout]);

  // Local Song Submission Handler
  const handleLocalSubmit = (titleToSubmit) => {
    const rawTitle = titleToSubmit || songInput;
    if (!rawTitle || !rawTitle.trim()) {
      setValidationError('Please enter or pick a song title!');
      return;
    }

    const validation = validateAntakshariSubmission(
      rawTitle,
      matchState.currentRequiredSound,
      matchState.usedSongs,
      TRACK_CATALOG
    );

    if (!validation.valid) {
      setValidationError(validation.error);
      return;
    }

    const song = validation.song;
    const activeTeam = matchState.currentTurn;
    const opposingTeam = activeTeam === 'A' ? 'B' : 'A';
    const newScore = matchState.teams[activeTeam].score + 1;
    const isWin = newScore >= matchState.targetScore;

    const turnHistoryItem = {
      turnNumber: matchState.turnNumber,
      team: activeTeam,
      teamName: matchState.teams[activeTeam].name,
      songTitle: song.title,
      artist: song.artist,
      previewUrl: song.previewUrl,
      startWord: song.startWord,
      startSound: song.startSound,
      startSoundLabel: song.startSoundLabel,
      endWord: song.endWord,
      endSound: song.endSound,
      endSoundLabel: song.endSoundLabel,
      transitionText: matchState.currentRequiredSound
        ? `…${matchState.currentRequiredSound.sound} ➔ "${song.startWord}" [${song.startSound}] … "${song.endWord}" [${song.endSound}]`
        : `Opening: "${song.title}" […${song.endSound}]`,
      timestamp: Date.now()
    };

    const nextSoundBucket = ANTAKSHARI_BUCKETS[song.endSound] || {
      label: `${song.endSound} (${song.endSound})`,
      devanagari: song.endSound
    };

    setMatchState((prev) => ({
      ...prev,
      teams: {
        ...prev.teams,
        [activeTeam]: { ...prev.teams[activeTeam], score: newScore }
      },
      currentTurn: isWin ? activeTeam : opposingTeam,
      turnNumber: prev.turnNumber + 1,
      currentRequiredSound: {
        sound: song.endSound,
        label: song.endSoundLabel || nextSoundBucket.label,
        devanagari: song.endDevanagari || nextSoundBucket.devanagari,
        fromWord: song.endWord,
        fromTitle: song.title
      },
      previousSong: {
        title: song.title,
        artist: song.artist,
        previewUrl: song.previewUrl,
        startWord: song.startWord,
        endWord: song.endWord,
        startSound: song.startSound,
        endSound: song.endSound,
        startSoundLabel: song.startSoundLabel,
        endSoundLabel: song.endSoundLabel,
        submittedByTeam: activeTeam,
        submittedByTeamName: prev.teams[activeTeam].name
      },
      usedSongs: [
        ...prev.usedSongs,
        {
          title: song.title,
          normalized: normalizeSongTitle(song.title),
          artist: song.artist,
          team: activeTeam
        }
      ],
      chainHistory: [...prev.chainHistory, turnHistoryItem],
      winner: isWin ? activeTeam : null,
      lastMessage: isWin
        ? `🏆 ${prev.teams[activeTeam].name} wins the match with ${newScore} points!`
        : `🎵 ${prev.teams[activeTeam].name} sang "${song.title}" (ended in ${song.endSoundLabel}). Next: ${prev.teams[opposingTeam].name} on sound ${song.endSoundLabel}!`
    }));

    // Reset input, error, and play audio if available
    setSongInput('');
    setShowSuggestions(false);
    setValidationError(null);
    setSecondsLeft(matchState.turnDuration || 30);
    setTurnSuccessMessage(`+1 Point! "${song.title}" ends in sound ${song.endSoundLabel}`);
    setTimeout(() => setTurnSuccessMessage(null), 3500);

    if (song.previewUrl) {
      playClip(song.previewUrl);
    }

    if (isWin) {
      if (onRecordChain) onRecordChain(matchState.chainHistory.length + 1, true);
      setScreen('game_over');
    }
  };

  // --------------------------------------------------------------------------
  // ONLINE ROOM MULTIPLAYER ENGINE (HTTP Polling sync)
  // --------------------------------------------------------------------------
  const createOnlineRoom = async () => {
    setIsConnecting(true);
    setValidationError(null);

    try {
      const res = await fetch('/api/antakshari/rooms/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          hostName: hostPlayerName || 'Host',
          teamAName: teamAName || 'Team Sur',
          teamBName: teamBName || 'Team Taal',
          turnDuration: Number(turnDuration) || 30,
          targetScore: Number(targetScore) || 5,
          startImmediately: false
        })
      });

      if (res.ok) {
        const data = await res.json();
        setRoomCode(data.roomCode);
        setMyTeam('A');
        setMyPlayerId(data.playerId);
        setOnlineRoom(data.room);
        setMatchState(data.room);
        setScreen('waiting_room');
        startRoomPolling(data.roomCode);
        setIsConnecting(false);
        return;
      }
    } catch {
      // Backend error fallback
    }

    setIsConnecting(false);
    setValidationError('Could not connect to online server. You can play Pass & Play mode on this device!');
  };

  const joinOnlineRoom = async () => {
    const code = joinRoomCodeInput.trim().toUpperCase();
    if (!code) {
      setValidationError('Please enter a 5-character Room Code!');
      return;
    }

    setIsConnecting(true);
    setValidationError(null);

    try {
      const res = await fetch('/api/antakshari/rooms/join', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          roomCode: code,
          playerName: joinPlayerName || 'Player 2',
          teamName: teamBName || 'Team Taal'
        })
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setRoomCode(code);
        setMyTeam('B');
        setMyPlayerId(data.playerId);
        setOnlineRoom(data.room);
        setMatchState(data.room);
        setScreen('playing');
        startRoomPolling(code);
        setIsConnecting(false);
        return;
      } else {
        setValidationError(data.error || 'Failed to join room. Please check the code.');
      }
    } catch {
      setValidationError('Server connection failed. Please check your internet or try again.');
    }

    setIsConnecting(false);
  };

  // Poll online room state every 1.2s
  const startRoomPolling = (code) => {
    if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);

    pollIntervalRef.current = setInterval(async () => {
      try {
        const res = await fetch(`/api/antakshari/rooms/${code}`);
        if (res.ok) {
          const { room, serverTime } = await res.json();
          setOnlineRoom(room);
          setMatchState(room);

          // If was waiting and opponent joined, transition to playing
          if (room.status === 'active' && screen === 'waiting_room') {
            setScreen('playing');
          }

          // If game over, transition to game_over screen
          if (room.status === 'game_over') {
            setScreen('game_over');
          }

          // Compute remaining seconds from server expires timestamp
          if (room.turnExpiresAt) {
            const rem = Math.max(0, Math.ceil((room.turnExpiresAt - (serverTime || Date.now())) / 1000));
            setSecondsLeft(rem);
          }
        }
      } catch {
        // Polling failure silent catch
      }
    }, 1200);
  };

  // Submit song to online room
  const handleOnlineSubmit = async (titleToSubmit) => {
    const rawTitle = titleToSubmit || songInput;
    if (!rawTitle || !rawTitle.trim()) {
      setValidationError('Please enter or pick a song title!');
      return;
    }

    setIsSubmitting(true);
    setValidationError(null);

    try {
      const res = await fetch(`/api/antakshari/rooms/${roomCode}/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          team: myTeam,
          songTitle: rawTitle
        })
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setOnlineRoom(data.room);
        setMatchState(data.room);
        setSongInput('');
        setShowSuggestions(false);
        setValidationError(null);
        setTurnSuccessMessage(`+1 Point! "${data.song.title}" ends in sound ${data.song.endSoundLabel}`);
        setTimeout(() => setTurnSuccessMessage(null), 3500);

        if (data.song.previewUrl) {
          playClip(data.song.previewUrl);
        }

        if (data.room.status === 'game_over') {
          setScreen('game_over');
        }
      } else {
        setValidationError(data.error || 'Invalid song submission!');
      }
    } catch {
      setValidationError('Connection issue while submitting song. Please retry!');
    }

    setIsSubmitting(false);
  };

  // General Submit Router (Calls local or online depending on game mode)
  const handleFormSubmit = (titleToSubmit) => {
    if (gameMode === 'pass_and_play') {
      handleLocalSubmit(titleToSubmit);
    } else {
      handleOnlineSubmit(titleToSubmit);
    }
  };

  // Rematch Handler
  const handleRematch = async () => {
    if (gameMode === 'pass_and_play') {
      startPassAndPlayMatch();
      return;
    }

    if (roomCode) {
      try {
        const res = await fetch(`/api/antakshari/rooms/${roomCode}/rematch`, { method: 'POST' });
        if (res.ok) {
          const data = await res.json();
          setMatchState(data.room);
          setScreen('playing');
          setSongInput('');
          setValidationError(null);
        }
      } catch {}
    }
  };

  // Share Match Results
  const handleShareMatch = () => {
    const winningTeam = matchState.teams[matchState.winner || 'A'];
    const losingTeam = matchState.teams[(matchState.winner === 'A' ? 'B' : 'A')];
    const chainLinks = matchState.chainHistory.map(h => `${h.songTitle} [${h.endSound}]`).join(' ➔ ');

    const shareText = [
      `Surftest 🔗 MULTIPLAYER ANTAKSHARI`,
      `🏆 ${winningTeam.name} won (${winningTeam.score} - ${losingTeam.score})!`,
      `🎵 Sound Pathway (${matchState.chainHistory.length} songs):`,
      chainLinks || 'Epic Indian Music Battle!',
      `Play traditional Antakshari now on Surftest:`,
      `https://surftest.vercel.app`
    ].join('\n');

    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(shareText).then(() => {
        setCopiedShare(true);
        setTimeout(() => setCopiedShare(false), 2500);
      });
    }
  };

  // Autocomplete filtering from 172-song catalog
  const filteredCatalog = songInput.trim()
    ? TRACK_CATALOG.filter((t) => {
        const query = songInput.toLowerCase();
        return (
          t.title.toLowerCase().includes(query) ||
          t.artist.toLowerCase().includes(query)
        );
      }).slice(0, 6)
    : [];

  const isMyTurn =
    gameMode === 'pass_and_play' ||
    (gameMode === 'online' && matchState.currentTurn === myTeam);

  const activeTeamObj = matchState.teams[matchState.currentTurn] || matchState.teams.A;

  // Timer urgency color
  const timerColor =
    secondsLeft <= 5
      ? 'text-rose-400 bg-rose-950/40 border-rose-500 animate-pulse'
      : secondsLeft <= 12
      ? 'text-amber-400 bg-amber-950/40 border-amber-500'
      : 'text-emerald-400 bg-emerald-950/40 border-emerald-500/50';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/90 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-[#120e09] border border-amber-500/30 rounded-2xl max-w-2xl w-full p-5 sm:p-7 shadow-[0_30px_80px_rgba(245,158,11,0.2)] relative flex flex-col max-h-[94vh] overflow-y-auto">
        {/* Hidden HTML5 Audio Element for sing-along previews */}
        <audio ref={audioRef} src={currentAudioUrl} preload="auto" />

        {/* ------------------------------------------------------------------ */}
        {/* TOP BAR                                                            */}
        {/* ------------------------------------------------------------------ */}
        <div className="flex items-center justify-between pb-4 border-b border-amber-500/20 mb-5">
          <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400 shadow-[0_0_10px_#F59E0B]" />
            <span className="text-xs font-mono font-bold text-amber-400 uppercase tracking-widest flex items-center gap-1.5">
              <span>ANTTAKSHARI BATTLE</span>
              <Users className="w-3.5 h-3.5" />
            </span>

            {screen === 'playing' && (
              <span className="bg-amber-500/20 text-amber-300 border border-amber-500/40 px-2.5 py-0.5 rounded-full text-[11px] font-mono font-bold flex items-center gap-1">
                {gameMode === 'online' ? `ROOM: ${roomCode}` : 'PASS & PLAY'}
              </span>
            )}
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close modal"
            className="p-1.5 rounded-full text-[#8B8F8C] hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* ------------------------------------------------------------------ */}
        {/* SCREEN 1: LOBBY & SETUP                                            */}
        {/* ------------------------------------------------------------------ */}
        {screen === 'lobby' && (
          <div className="space-y-6">
            <div className="text-center">
              <div className="inline-flex p-3 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400 mb-2">
                <Music2 className="w-8 h-8" />
              </div>
              <h2 className="text-2xl font-black text-white tracking-tight">
                Traditional Indian Antakshari
              </h2>
              <p className="text-xs text-[#A3A8A5] max-w-md mx-auto mt-1">
                Turn-based team competition! Sing or identify songs based on the last letter of the previous song with a 30-second countdown timer.
              </p>
            </div>

            {/* Mode Switcher Tabs: Pass & Play vs Online Room */}
            <div className="grid grid-cols-2 gap-2 p-1 bg-black/40 rounded-xl border border-white/10">
              <button
                type="button"
                onClick={() => { setGameMode('pass_and_play'); setValidationError(null); }}
                className={`py-2.5 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                  gameMode === 'pass_and_play'
                    ? 'bg-amber-500 text-black shadow-md'
                    : 'text-[#A3A8A5] hover:text-white hover:bg-white/5'
                }`}
              >
                <Users className="w-4 h-4" />
                <span>Pass & Play (Same Device)</span>
              </button>

              <button
                type="button"
                onClick={() => { setGameMode('online'); setValidationError(null); }}
                className={`py-2.5 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                  gameMode === 'online'
                    ? 'bg-amber-500 text-black shadow-md'
                    : 'text-[#A3A8A5] hover:text-white hover:bg-white/5'
                }`}
              >
                <Radio className="w-4 h-4" />
                <span>Online Room (2 Devices)</span>
              </button>
            </div>

            {/* PASS & PLAY FORM */}
            {gameMode === 'pass_and_play' && (
              <div className="space-y-4 p-4 rounded-xl bg-[#18130c] border border-amber-900/40">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] font-mono text-[#8B8F8C] uppercase block mb-1">
                      Team 1 Name
                    </label>
                    <input
                      type="text"
                      value={teamAName}
                      onChange={(e) => setTeamAName(e.target.value)}
                      placeholder="Team Sur"
                      className="w-full bg-black/40 border border-amber-500/30 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-400"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-mono text-[#8B8F8C] uppercase block mb-1">
                      Team 2 Name
                    </label>
                    <input
                      type="text"
                      value={teamBName}
                      onChange={(e) => setTeamBName(e.target.value)}
                      placeholder="Team Taal"
                      className="w-full bg-black/40 border border-amber-500/30 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-400"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-2">
                  <div>
                    <label className="text-[11px] font-mono text-[#8B8F8C] uppercase block mb-1">
                      Target Score
                    </label>
                    <select
                      value={targetScore}
                      onChange={(e) => setTargetScore(Number(e.target.value))}
                      className="w-full bg-black/40 border border-amber-500/30 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-400"
                    >
                      <option value={3}>First to 3 Points (Quick)</option>
                      <option value={5}>First to 5 Points (Standard)</option>
                      <option value={7}>First to 7 Points (Championship)</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-[11px] font-mono text-[#8B8F8C] uppercase block mb-1">
                      Turn Timer
                    </label>
                    <select
                      value={turnDuration}
                      onChange={(e) => setTurnDuration(Number(e.target.value))}
                      className="w-full bg-black/40 border border-amber-500/30 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-400"
                    >
                      <option value={20}>20 Seconds (Fast & Intense)</option>
                      <option value={30}>30 Seconds (Classic Indian Rule)</option>
                      <option value={45}>45 Seconds (Relaxed / Party)</option>
                    </select>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={startPassAndPlayMatch}
                  className="w-full mt-2 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-black font-black py-3 rounded-xl text-sm transition-all flex items-center justify-center gap-2 cursor-pointer shadow-[0_0_20px_rgba(245,158,11,0.35)] active:scale-[0.98]"
                >
                  <Flame className="w-4 h-4 fill-current" />
                  <span>START LOCAL MATCH</span>
                </button>
              </div>
            )}

            {/* ONLINE ROOM FORM */}
            {gameMode === 'online' && (
              <div className="space-y-4 p-4 rounded-xl bg-[#18130c] border border-amber-900/40">
                {/* Create or Join toggle */}
                <div className="flex border-b border-white/10 pb-3 gap-4">
                  <button
                    type="button"
                    onClick={() => { setOnlineSubTab('create'); setValidationError(null); }}
                    className={`text-xs font-bold pb-1 cursor-pointer transition-colors ${
                      onlineSubTab === 'create'
                        ? 'text-amber-400 border-b-2 border-amber-400'
                        : 'text-[#8B8F8C] hover:text-white'
                    }`}
                  >
                    Create a New Room
                  </button>
                  <button
                    type="button"
                    onClick={() => { setOnlineSubTab('join'); setValidationError(null); }}
                    className={`text-xs font-bold pb-1 cursor-pointer transition-colors ${
                      onlineSubTab === 'join'
                        ? 'text-amber-400 border-b-2 border-amber-400'
                        : 'text-[#8B8F8C] hover:text-white'
                    }`}
                  >
                    Join with Code
                  </button>
                </div>

                {onlineSubTab === 'create' ? (
                  <div className="space-y-3">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="text-[11px] font-mono text-[#8B8F8C] uppercase block mb-1">
                          Your Name
                        </label>
                        <input
                          type="text"
                          value={hostPlayerName}
                          onChange={(e) => setHostPlayerName(e.target.value)}
                          placeholder="Aarav"
                          className="w-full bg-black/40 border border-amber-500/30 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-400"
                        />
                      </div>
                      <div>
                        <label className="text-[11px] font-mono text-[#8B8F8C] uppercase block mb-1">
                          Your Team Name
                        </label>
                        <input
                          type="text"
                          value={teamAName}
                          onChange={(e) => setTeamAName(e.target.value)}
                          placeholder="Team Sur"
                          className="w-full bg-black/40 border border-amber-500/30 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-400"
                        />
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={createOnlineRoom}
                      disabled={isConnecting}
                      className="w-full mt-3 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-black font-black py-3 rounded-xl text-sm transition-all flex items-center justify-center gap-2 cursor-pointer shadow-[0_0_20px_rgba(245,158,11,0.35)] disabled:opacity-50"
                    >
                      <Plus className="w-4 h-4" />
                      <span>{isConnecting ? 'Generating Room...' : 'CREATE ROOM & GET CODE'}</span>
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div>
                      <label className="text-[11px] font-mono text-amber-300 uppercase block mb-1">
                        5-Character Room Code
                      </label>
                      <input
                        type="text"
                        value={joinRoomCodeInput}
                        onChange={(e) => setJoinRoomCodeInput(e.target.value.toUpperCase())}
                        placeholder="e.g. SURF42"
                        maxLength={8}
                        className="w-full bg-black/50 border border-amber-400/60 rounded-lg px-3 py-2.5 text-base font-mono font-bold text-center tracking-widest text-amber-300 focus:outline-none focus:ring-1 focus:ring-amber-400"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-[11px] font-mono text-[#8B8F8C] uppercase block mb-1">
                          Your Name
                        </label>
                        <input
                          type="text"
                          value={joinPlayerName}
                          onChange={(e) => setJoinPlayerName(e.target.value)}
                          placeholder="Diya"
                          className="w-full bg-black/40 border border-amber-500/30 rounded-lg px-3 py-2 text-xs text-white focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="text-[11px] font-mono text-[#8B8F8C] uppercase block mb-1">
                          Team Name
                        </label>
                        <input
                          type="text"
                          value={teamBName}
                          onChange={(e) => setTeamBName(e.target.value)}
                          placeholder="Team Taal"
                          className="w-full bg-black/40 border border-amber-500/30 rounded-lg px-3 py-2 text-xs text-white focus:outline-none"
                        />
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={joinOnlineRoom}
                      disabled={isConnecting || !joinRoomCodeInput.trim()}
                      className="w-full mt-2 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-black font-black py-3 rounded-xl text-sm transition-all flex items-center justify-center gap-2 cursor-pointer shadow-[0_0_20px_rgba(245,158,11,0.35)] disabled:opacity-50"
                    >
                      <LogIn className="w-4 h-4" />
                      <span>{isConnecting ? 'Joining...' : 'JOIN ROOM'}</span>
                    </button>
                  </div>
                )}
              </div>
            )}

            {validationError && (
              <div className="p-3 rounded-xl bg-rose-950/40 border border-rose-500/40 text-rose-300 text-xs flex items-center gap-2 animate-in fade-in">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                <span>{validationError}</span>
              </div>
            )}
          </div>
        )}

        {/* ------------------------------------------------------------------ */}
        {/* SCREEN 2: WAITING FOR OPPONENT (ONLINE ROOM)                       */}
        {/* ------------------------------------------------------------------ */}
        {screen === 'waiting_room' && (
          <div className="text-center py-6 space-y-6">
            <div className="inline-flex p-4 rounded-3xl bg-amber-500/10 border border-amber-500/30 text-amber-400 animate-pulse">
              <Radio className="w-10 h-10" />
            </div>

            <div>
              <span className="text-xs font-mono font-semibold text-[#8B8F8C] uppercase tracking-widest block mb-1">
                SHARE THIS ROOM CODE WITH TEAM B
              </span>
              <div className="inline-flex items-center gap-3 bg-black/60 border-2 border-amber-400 px-6 py-3 rounded-2xl shadow-[0_0_30px_rgba(245,158,11,0.3)]">
                <span className="text-3xl font-mono font-black text-amber-300 tracking-widest">
                  {roomCode}
                </span>
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText(roomCode);
                    setCopiedCode(true);
                    setTimeout(() => setCopiedCode(false), 2000);
                  }}
                  className="p-2 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 transition-colors cursor-pointer"
                  title="Copy code"
                >
                  {copiedCode ? <Check className="w-5 h-5 text-emerald-400" /> : <Copy className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <p className="text-xs text-[#8B8F8C] max-w-sm mx-auto">
              Waiting for player on second phone/browser to join. The match will automatically start the instant they enter the code!
            </p>

            <div className="pt-4 flex justify-center gap-3">
              <button
                type="button"
                onClick={() => {
                  if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
                  setScreen('lobby');
                }}
                className="px-5 py-2.5 rounded-full border border-white/10 text-xs font-semibold text-[#8B8F8C] hover:text-white transition-colors cursor-pointer"
              >
                Back to Lobby
              </button>
            </div>
          </div>
        )}

        {/* ------------------------------------------------------------------ */}
        {/* SCREEN 3: ACTIVE PLAYING ARENA                                     */}
        {/* ------------------------------------------------------------------ */}
        {screen === 'playing' && (
          <div className="space-y-5">
            {/* LIVE SCOREBOARD */}
            <div className="grid grid-cols-2 gap-3">
              {/* TEAM A CARD */}
              <div
                className={`p-3.5 rounded-xl border transition-all ${
                  matchState.currentTurn === 'A'
                    ? 'bg-gradient-to-r from-amber-950/60 to-orange-950/40 border-amber-400 shadow-[0_0_20px_rgba(245,158,11,0.25)]'
                    : 'bg-black/30 border-white/10 opacity-70'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-bold text-white truncate max-w-[120px]">
                    {matchState.teams.A.name}
                  </span>
                  {matchState.currentTurn === 'A' && (
                    <span className="text-[9px] font-mono font-extrabold bg-amber-400 text-black px-1.5 py-0.5 rounded-full uppercase animate-pulse">
                      SINGING NOW
                    </span>
                  )}
                </div>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-3xl font-black text-amber-300">
                    {matchState.teams.A.score}
                  </span>
                  <span className="text-xs font-mono text-[#8B8F8C]">
                    / {matchState.targetScore} pts
                  </span>
                </div>
              </div>

              {/* TEAM B CARD */}
              <div
                className={`p-3.5 rounded-xl border transition-all ${
                  matchState.currentTurn === 'B'
                    ? 'bg-gradient-to-r from-cyan-950/60 to-blue-950/40 border-cyan-400 shadow-[0_0_20px_rgba(6,182,212,0.25)]'
                    : 'bg-black/30 border-white/10 opacity-70'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-bold text-white truncate max-w-[120px]">
                    {matchState.teams.B.name}
                  </span>
                  {matchState.currentTurn === 'B' && (
                    <span className="text-[9px] font-mono font-extrabold bg-cyan-400 text-black px-1.5 py-0.5 rounded-full uppercase animate-pulse">
                      SINGING NOW
                    </span>
                  )}
                </div>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-3xl font-black text-cyan-300">
                    {matchState.teams.B.score}
                  </span>
                  <span className="text-xs font-mono text-[#8B8F8C]">
                    / {matchState.targetScore} pts
                  </span>
                </div>
              </div>
            </div>

            {/* COUNTDOWN TIMER & TURN INDICATOR */}
            <div className="flex items-center justify-between gap-3 p-3 rounded-xl bg-black/40 border border-white/10">
              <div className="flex items-center gap-2">
                <span className="text-xs text-[#A3A8A5]">Round {matchState.turnNumber} Turn:</span>
                <span className="text-xs font-bold text-white flex items-center gap-1.5">
                  <span className={`w-2 h-2 rounded-full ${matchState.currentTurn === 'A' ? 'bg-amber-400' : 'bg-cyan-400'}`} />
                  <span>{activeTeamObj.name}</span>
                </span>
              </div>

              {/* Countdown badge */}
              <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full border text-xs font-mono font-black ${timerColor}`}>
                <Clock className="w-3.5 h-3.5" />
                <span>0:{secondsLeft < 10 ? `0${secondsLeft}` : secondsLeft}</span>
              </div>
            </div>

            {/* ------------------------------------------------------------------ */}
            {/* HERO ANTAKSHARI SOUND REQUIREMENT CARD                             */}
            {/* ------------------------------------------------------------------ */}
            {matchState.currentRequiredSound ? (
              <div className="p-4 rounded-xl border border-amber-500/50 bg-gradient-to-br from-amber-950/70 via-[#201509] to-black text-amber-200 text-center shadow-[0_0_25px_rgba(245,158,11,0.15)] animate-in zoom-in-95 duration-200">
                <span className="text-[10px] font-mono font-bold tracking-widest text-amber-400/80 uppercase block mb-1">
                  TARGET STARTING SOUND
                </span>

                <div className="text-3xl sm:text-4xl font-black text-white tracking-wide my-1 flex items-center justify-center gap-2">
                  <span className="text-amber-400">LETTER:</span>
                  <span className="font-mono bg-amber-500/20 px-3 py-0.5 rounded-lg border border-amber-400 text-amber-300">
                    {matchState.currentRequiredSound.sound}
                  </span>
                  <span className="text-lg text-amber-200/70 font-normal">
                    ({matchState.currentRequiredSound.label})
                  </span>
                </div>

                <div className="text-xs text-[#A3A8A5] mt-2 flex items-center justify-center gap-1.5 flex-wrap">
                  <span>Linked from</span>
                  <strong className="text-white font-semibold">
                    "{matchState.currentRequiredSound.fromTitle}"
                  </strong>
                  <span>which ended in</span>
                  <span className="text-amber-300 font-mono font-bold">
                    "{matchState.currentRequiredSound.fromWord}" […{matchState.currentRequiredSound.sound}]
                  </span>
                </div>
              </div>
            ) : (
              <div className="p-4 rounded-xl border border-amber-500/30 bg-amber-950/20 text-center animate-in fade-in duration-200">
                <span className="text-[10px] font-mono font-bold tracking-widest text-amber-400 uppercase block mb-1">
                  ROUND 1 — OPENING SONG
                </span>
                <div className="text-lg font-bold text-white">
                  Sing any Indian song of your choice!
                </div>
                <p className="text-xs text-[#8B8F8C] mt-1">
                  The last letter/sound of your chosen song will dictate what {matchState.teams.B.name} must start with!
                </p>
              </div>
            )}

            {/* Sing-Along Audio player (when a catalog song was just accepted) */}
            {matchState.previousSong?.previewUrl && (
              <div className="p-3 rounded-lg bg-white/[0.03] border border-white/10 flex items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-2.5 min-w-0">
                  <button
                    type="button"
                    onClick={toggleAudio}
                    className="w-8 h-8 rounded-full bg-amber-500 hover:bg-amber-400 text-black flex items-center justify-center shrink-0 cursor-pointer shadow-sm"
                  >
                    {isPlayingAudio ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current translate-x-0.5" />}
                  </button>
                  <div className="truncate">
                    <div className="text-white font-bold truncate">
                      {matchState.previousSong.title}
                    </div>
                    <div className="text-[10px] text-[#8B8F8C] truncate">
                      Sing along clip · {matchState.previousSong.artist}
                    </div>
                  </div>
                </div>
                <span className="text-[10px] font-mono text-amber-400 shrink-0">
                  CLIP PLAYING 🎵
                </span>
              </div>
            )}

            {/* Validation Error Banner */}
            {validationError && (
              <div className="p-3 rounded-xl bg-rose-950/40 border border-rose-500/50 text-rose-300 text-xs flex items-center gap-2 animate-in fade-in">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                <span className="font-medium">{validationError}</span>
              </div>
            )}

            {/* Success Pill */}
            {turnSuccessMessage && (
              <div className="p-3 rounded-xl bg-emerald-950/40 border border-[#22E06B]/50 text-[#22E06B] text-xs flex items-center gap-2 animate-in zoom-in-95">
                <Sparkles className="w-4 h-4 shrink-0 text-[#22E06B]" />
                <span className="font-bold">{turnSuccessMessage}</span>
              </div>
            )}

            {/* ------------------------------------------------------------------ */}
            {/* SONG SUBMISSION INPUT & AUTOCOMPLETE                               */}
            {/* ------------------------------------------------------------------ */}
            <div className="space-y-2 relative">
              <div className="text-[11px] font-mono text-[#8B8F8C] flex items-center justify-between">
                <span>
                  {isMyTurn ? `Enter song for ${activeTeamObj.name}:` : `Waiting for ${activeTeamObj.name} to submit...`}
                </span>
                <span className="text-[10px] text-amber-400">
                  Pick from catalog or type any Indian song!
                </span>
              </div>

              <div className="relative">
                <input
                  type="text"
                  disabled={!isMyTurn || isSubmitting}
                  placeholder={
                    isMyTurn
                      ? matchState.currentRequiredSound
                        ? `Type a song starting with "${matchState.currentRequiredSound.sound}"...`
                        : 'Type your opening song of choice...'
                      : `Opponent's turn (${secondsLeft}s remaining)...`
                  }
                  value={songInput}
                  onChange={(e) => {
                    setSongInput(e.target.value);
                    setShowSuggestions(true);
                    setValidationError(null);
                  }}
                  onFocus={() => setShowSuggestions(true)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && songInput.trim() && isMyTurn) {
                      handleFormSubmit(songInput.trim());
                    }
                  }}
                  className="w-full bg-[#18130c] border border-amber-900/50 focus:border-amber-400 rounded-xl px-4 py-3.5 text-sm text-white placeholder-[#8B8F8C] focus:outline-none transition-colors disabled:opacity-40"
                />

                {/* Suggestions Dropdown from Catalog */}
                {showSuggestions && songInput.trim() && isMyTurn && (
                  <div className="absolute left-0 right-0 bottom-full mb-2 bg-[#1b140b] border border-amber-500/40 rounded-xl shadow-2xl max-h-56 overflow-y-auto z-20 divide-y divide-white/5">
                    {/* Catalog matches */}
                    {filteredCatalog.map((track, i) => {
                      const soundMatch =
                        !matchState.currentRequiredSound ||
                        track.startSound === matchState.currentRequiredSound.sound;

                      return (
                        <button
                          key={i}
                          type="button"
                          onClick={() => handleFormSubmit(track.title)}
                          className="w-full text-left px-4 py-2.5 text-xs text-white hover:bg-amber-500/20 hover:text-amber-300 transition-colors flex items-center justify-between gap-2"
                        >
                          <div className="truncate">
                            <span className="font-bold">{track.title}</span>
                            <span className="text-[11px] text-[#8B8F8C] ml-1.5 truncate">
                              · {track.artist}
                            </span>
                          </div>
                          <div className="flex items-center gap-1.5 shrink-0 text-[10px] font-mono">
                            <span
                              className={`px-1.5 py-0.5 rounded border ${
                                soundMatch
                                  ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300'
                                  : 'bg-white/5 border-white/10 text-[#8B8F8C]'
                              }`}
                            >
                              Starts: {track.startSound}
                            </span>
                            <span className="text-[#8B8F8C]">Ends: {track.endSound}</span>
                          </div>
                        </button>
                      );
                    })}

                    {/* Freeform Custom Submission Button */}
                    <button
                      type="button"
                      onClick={() => handleFormSubmit(songInput.trim())}
                      className="w-full text-left px-4 py-2.5 text-xs font-bold text-amber-300 bg-amber-500/10 hover:bg-amber-500/20 transition-colors flex items-center gap-2"
                    >
                      <Plus className="w-3.5 h-3.5 text-amber-400" />
                      <span>Submit Custom Song: "{songInput.trim()}"</span>
                    </button>
                  </div>
                )}
              </div>

              {/* Bottom Action Row */}
              <div className="flex items-center justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => handleFormSubmit(songInput.trim())}
                  disabled={!isMyTurn || !songInput.trim() || isSubmitting}
                  className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-black font-extrabold px-6 py-2.5 rounded-full text-xs transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed shadow-[0_0_15px_rgba(245,158,11,0.3)] flex items-center gap-1.5"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Submit Song</span>
                </button>
              </div>
            </div>

            {/* ------------------------------------------------------------------ */}
            {/* CHAIN PROGRESSION & USED SONGS DRAWER                              */}
            {/* ------------------------------------------------------------------ */}
            {matchState.chainHistory.length > 0 && (
              <div className="pt-2">
                <div className="text-[11px] font-semibold text-[#8B8F8C] uppercase tracking-wider mb-2 flex items-center justify-between">
                  <span>Antakshari Chain ({matchState.chainHistory.length} Songs):</span>
                  <span className="text-[10px] text-amber-400 font-mono">Word & Sound Links</span>
                </div>

                <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                  {matchState.chainHistory.map((item, idx) => (
                    <div
                      key={idx}
                      className="px-3 py-1.5 rounded-lg bg-white/[0.03] border border-white/5 text-xs flex items-center justify-between gap-2"
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <span className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded ${item.team === 'A' ? 'bg-amber-500/20 text-amber-300' : 'bg-cyan-500/20 text-cyan-300'}`}>
                          {item.teamName}
                        </span>
                        <span className="text-white font-medium truncate">{item.songTitle}</span>
                      </div>
                      <div className="text-[11px] font-mono text-amber-300 shrink-0">
                        <span className="text-[#8B8F8C]">ended in</span> "{item.endWord}" […{item.endSound}]
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ------------------------------------------------------------------ */}
        {/* SCREEN 4: GAME OVER / WINNER CELEBRATION                           */}
        {/* ------------------------------------------------------------------ */}
        {screen === 'game_over' && (
          <div className="p-6 rounded-2xl border border-amber-400 bg-gradient-to-b from-amber-950/40 via-[#18120b] to-black text-center space-y-5 animate-in zoom-in-95 duration-200 shadow-[0_0_50px_rgba(245,158,11,0.3)]">
            <div className="inline-flex p-4 rounded-3xl bg-amber-500/20 text-amber-400 border border-amber-500/40">
              <Trophy className="w-10 h-10" />
            </div>

            <div>
              <span className="text-xs font-mono font-bold tracking-widest text-amber-400 uppercase block mb-1">
                ANTAKSHARI CHAMPIONS!
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-white">
                {matchState.teams[matchState.winner || 'A'].name} Wins! 🏆
              </h2>
              <div className="text-sm font-mono font-bold text-amber-300 mt-1">
                Final Score: {matchState.teams.A.name} ({matchState.teams.A.score}) vs {matchState.teams.B.name} ({matchState.teams.B.score})
              </div>
            </div>

            {/* Pathway Breakdown */}
            {matchState.chainHistory.length > 0 && (
              <div className="text-left mt-4">
                <div className="text-[11px] font-semibold text-amber-300 uppercase tracking-wider mb-2">
                  Match Song Chain ({matchState.chainHistory.length}):
                </div>
                <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
                  {matchState.chainHistory.map((item, idx) => (
                    <div
                      key={idx}
                      className="px-3 py-1.5 rounded bg-amber-500/10 border border-amber-500/20 text-xs flex items-center justify-between"
                    >
                      <span className="text-white font-medium truncate">
                        {idx + 1}. [{item.teamName}] {item.songTitle}
                      </span>
                      <span className="text-amber-400 font-mono text-[10px] shrink-0 ml-2">
                        "{item.endWord}" ➔ [{item.endSound}]
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="pt-3 flex justify-center gap-3 flex-wrap">
              <button
                type="button"
                onClick={handleShareMatch}
                className="bg-white/10 hover:bg-white/15 border border-white/15 text-white font-bold px-5 py-2.5 rounded-full text-xs transition-all flex items-center gap-2 cursor-pointer active:scale-95 shadow-sm"
              >
                {copiedShare ? (
                  <Check className="w-3.5 h-3.5 text-[#22E06B]" />
                ) : (
                  <Share2 className="w-3.5 h-3.5" />
                )}
                <span>{copiedShare ? 'Copied Match Result! 📋' : 'Share Result 🔗'}</span>
              </button>

              <button
                type="button"
                onClick={handleRematch}
                className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-black font-extrabold px-6 py-2.5 rounded-full text-xs transition-all flex items-center gap-2 cursor-pointer active:scale-95 shadow-[0_0_20px_rgba(245,158,11,0.4)]"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Play Rematch</span>
              </button>

              <button
                type="button"
                onClick={() => setScreen('lobby')}
                className="px-5 py-2.5 rounded-full border border-white/10 text-xs font-semibold text-[#8B8F8C] hover:text-white transition-colors cursor-pointer"
              >
                Back to Lobby
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
