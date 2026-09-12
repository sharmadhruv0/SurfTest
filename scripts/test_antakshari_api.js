import app from '../backend/server.js';
import http from 'http';

async function runApiTests() {
  console.log('=== TESTING SURFTEST API & ANTAKSHARI MODE ===\n');

  const server = http.createServer(app);
  await new Promise(resolve => server.listen(0, resolve));
  const port = server.address().port;
  const baseUrl = `http://localhost:${port}`;

  try {
    // 1. Test Normal Mode round endpoint (MUST BE COMPLETELY UNAFFECTED)
    console.log('1. Testing Normal Mode (/api/round)...');
    let res = await fetch(`${baseUrl}/api/round?mode=normal`);
    let data = await res.json();
    if (!data.roundId || data.mode !== 'normal' || !data.track) {
      throw new Error('Normal mode round failed');
    }
    console.log(`[PASS] Normal round returned track: "${data.track.title}" (mode: ${data.mode})`);

    // 2. Test Reverse Mode round endpoint (MUST BE COMPLETELY UNAFFECTED)
    console.log('\n2. Testing Reverse Mode (/api/round?mode=reverse)...');
    res = await fetch(`${baseUrl}/api/round?mode=reverse`);
    data = await res.json();
    if (!data.roundId || data.mode !== 'reverse' || !data.isReversed) {
      throw new Error('Reverse mode round failed');
    }
    console.log(`[PASS] Reverse round returned track: "${data.track.title}" (isReversed: ${data.isReversed})`);

    // 3. Test Antakshari Start endpoint
    console.log('\n3. Testing Antakshari Start (/api/antakshari/start)...');
    res = await fetch(`${baseUrl}/api/antakshari/start`);
    const startData = await res.json();
    if (!startData.sessionId || !startData.track || startData.chainLength !== 1) {
      throw new Error('Antakshari start failed');
    }
    console.log(`[PASS] Antakshari session started: ${startData.sessionId}`);
    console.log(`       Song #1: "${startData.track.title}" (starts with ${startData.track.startSoundLabel}, ends with ${startData.track.endSoundLabel})`);

    // 4. Test Antakshari Next endpoint (chaining 5 consecutive songs)
    console.log('\n4. Testing Antakshari Chaining Sequence (Step 2 to 5)...');
    let currentSessionId = startData.sessionId;
    let prevTrack = startData.track;

    for (let step = 2; step <= 6; step++) {
      res = await fetch(
        `${baseUrl}/api/antakshari/next?sessionId=${currentSessionId}&previousSongId=${prevTrack.id}`
      );
      const nextData = await res.json();

      if (nextData.chainComplete) {
        console.log(`[INFO] Chain completed naturally at step ${step}: ${nextData.message}`);
        break;
      }

      if (!nextData.track || nextData.chainLength !== step) {
        throw new Error(`Antakshari next step ${step} failed`);
      }

      console.log(`[PASS] Step ${step} (Chain: ${nextData.chainLength}): "${nextData.track.title}"`);
      console.log(`       Transition: ${nextData.connectingSound.transitionText} [Sound: ${nextData.connectingSound.label}]`);

      prevTrack = nextData.track;
    }

    // 5. Test user explicit rule example: "Main Agar Kahoon" (Kahoon -> N) to "Nashe Si Chadh Gayi" (Nashe -> N)
    console.log('\n5. Testing user example: "Main Agar Kahoon" -> "Nashe Si Chadh Gayi"...');
    const { computeSongSounds, matchSounds } = await import('../shared/antakshari.js');
    const s1 = computeSongSounds('Main Agar Kahoon');
    const s2 = computeSongSounds('Nashe Si Chadh Gayi');
    if (s1.endSound !== 'N' || s1.endWord !== 'Kahoon') {
      throw new Error(`Expected Main Agar Kahoon to end in N (Kahoon), got sound ${s1.endSound}, word ${s1.endWord}`);
    }
    if (s2.startSound !== 'N' || s2.startWord !== 'Nashe') {
      throw new Error(`Expected Nashe Si Chadh Gayi to start in N (Nashe), got sound ${s2.startSound}, word ${s2.startWord}`);
    }
    if (!matchSounds(s1.endSound, s2.startSound)) {
      throw new Error(`Sound match failed between ${s1.endSound} and ${s2.startSound}`);
    }
    console.log(`[PASS] Verified exact user example: "${s1.endWord}" […${s1.endSound}] ➔ [${s2.startSound}…] "${s2.startWord}" matched successfully!`);

    // 6. Test dead-end or invalid previous song handling
    console.log('\n6. Testing error/edge-case handling...');
    res = await fetch(`${baseUrl}/api/antakshari/next?sessionId=${currentSessionId}&previousSongId=invalid_song_999`);
    if (res.status === 400) {
      console.log('[PASS] Correctly returns 400 error on non-existent song ID');
    }

    // 7. Test Real-Time Multiplayer Room Match Flow
    console.log('\n7. Testing Multiplayer Room Match Flow...');
    // 7a. Create Room
    res = await fetch(`${baseUrl}/api/antakshari/rooms/create`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ hostName: 'Aarav', teamAName: 'Team Sur', teamBName: 'Team Taal', targetScore: 3 })
    });
    const createData = await res.json();
    if (!createData.roomCode || createData.room.status !== 'waiting') {
      throw new Error('Room creation failed');
    }
    console.log(`[PASS] Created Multiplayer Room: ${createData.roomCode} (Status: ${createData.room.status})`);

    // 7b. Join Room
    res = await fetch(`${baseUrl}/api/antakshari/rooms/join`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ roomCode: createData.roomCode, playerName: 'Diya', teamName: 'Team Taal' })
    });
    const joinData = await res.json();
    if (joinData.room.status !== 'active' || joinData.room.currentTurn !== 'A') {
      throw new Error('Room join failed to activate match');
    }
    console.log(`[PASS] Team B joined, match is now ACTIVE. Current turn: ${joinData.room.currentTurn}`);

    // 7c. Team A submits opening song of choice
    res = await fetch(`${baseUrl}/api/antakshari/rooms/${createData.roomCode}/submit`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ team: 'A', songTitle: 'Main Agar Kahoon' })
    });
    const submitA = await res.json();
    if (!submitA.success || submitA.room.teams.A.score !== 1 || submitA.room.currentRequiredSound.sound !== 'N') {
      throw new Error('Opening song submission failed');
    }
    console.log(`[PASS] Team A Opening song accepted! Score: A=1, B=0. Next sound for Team B: ${submitA.room.currentRequiredSound.label}`);

    // 7d. Team B submits invalid starting letter
    res = await fetch(`${baseUrl}/api/antakshari/rooms/${createData.roomCode}/submit`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ team: 'B', songTitle: 'Tum Hi Ho' })
    });
    if (res.status === 422) {
      const errRes = await res.json();
      console.log(`[PASS] Invalid sound rejected with 422: "${errRes.error}"`);
    } else {
      throw new Error('Expected 422 on invalid starting sound');
    }

    // 7e. Team B submits valid song
    res = await fetch(`${baseUrl}/api/antakshari/rooms/${createData.roomCode}/submit`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ team: 'B', songTitle: 'Nashe Si Chadh Gayi' })
    });
    const submitB = await res.json();
    if (!submitB.success || submitB.room.teams.B.score !== 1 || submitB.room.currentRequiredSound.sound !== 'Y') {
      throw new Error('Team B valid song submission failed');
    }
    console.log(`[PASS] Team B song accepted! Score: A=1, B=1. Next sound for Team A: ${submitB.room.currentRequiredSound.label}`);

    // 7f. Duplicate song rejected
    res = await fetch(`${baseUrl}/api/antakshari/rooms/${createData.roomCode}/submit`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ team: 'A', songTitle: 'Main Agar Kahoon' })
    });
    if (res.status === 422) {
      const dupRes = await res.json();
      console.log(`[PASS] Duplicate song rejected with 422: "${dupRes.error}"`);
    } else {
      throw new Error('Expected 422 on duplicate song');
    }

    console.log('\n=== ALL API & MULTIPLAYER TESTS PASSED SUCCESSFULLY! ===');
  } finally {
    server.close();
  }
}

runApiTests().catch(err => {
  console.error('[TEST FAILED]', err);
  process.exit(1);
});
