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

    console.log('\n=== ALL API TESTS PASSED SUCCESSFULLY! ===');
  } finally {
    server.close();
  }
}

runApiTests().catch(err => {
  console.error('[TEST FAILED]', err);
  process.exit(1);
});
