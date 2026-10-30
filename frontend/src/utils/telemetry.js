// Real-time Global Telemetry & Cloud Event Sync for SurTest
const CLOUD_STREAM_TOPIC = 'surftest_live_stream_2026_st';
const CLOUD_STREAM_URL = `https://ntfy.sh/${CLOUD_STREAM_TOPIC}`;
const BASELINE_PLAYS = 148;
const BASELINE_VISITS = 215;

export function detectTrafficSource() {
  if (typeof window === 'undefined') return 'Direct';
  const ua = navigator.userAgent || '';
  const ref = document.referrer || '';
  const params = new URLSearchParams(window.location.search);
  const utm = (params.get('utm_source') || params.get('ref') || '').toLowerCase();

  if (
    ua.includes('Instagram') ||
    ref.toLowerCase().includes('instagram') ||
    utm.includes('ig') ||
    utm.includes('insta')
  ) {
    return 'Instagram';
  }
  if (ua.includes('FBAN') || ua.includes('FBAV') || ref.toLowerCase().includes('facebook')) {
    return 'Facebook';
  }
  if (ref.toLowerCase().includes('whatsapp') || utm.includes('wa')) {
    return 'WhatsApp';
  }
  if (ref && !ref.includes(window.location.hostname)) {
    try {
      return new URL(ref).hostname.replace('www.', '');
    } catch {
      return 'Referral';
    }
  }
  return 'Direct / Bio Link';
}

export function detectDeviceType() {
  if (typeof window === 'undefined') return 'Mobile';
  const ua = navigator.userAgent || '';
  if (/Mobi|Android|iPhone|iPad|iPod/i.test(ua)) {
    return 'Mobile';
  }
  return 'Desktop';
}

export async function recordGlobalEvent(payload = {}) {
  const evt = {
    id: 'evt_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
    type: payload.type || 'play_start',
    mode: payload.mode || 'normal',
    language: payload.language || 'hindi',
    won: Boolean(payload.won),
    stage: payload.stage ?? null,
    score: payload.score ?? null,
    songTitle: payload.songTitle ?? null,
    source: payload.source || detectTrafficSource(),
    device: payload.device || detectDeviceType(),
    timestamp: Date.now()
  };

  // Save locally as backup
  try {
    const localEvts = JSON.parse(localStorage.getItem('surftest_telemetry_events') || '[]');
    localEvts.unshift(evt);
    if (localEvts.length > 80) localEvts.length = 80;
    localStorage.setItem('surftest_telemetry_events', JSON.stringify(localEvts));
  } catch {}

  // 1. Send to backend API
  fetch('/api/telemetry/event', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(evt)
  }).catch(() => {});

  // 2. Send to persistent cloud event stream so all devices see live global activity
  fetch(CLOUD_STREAM_URL, {
    method: 'POST',
    body: JSON.stringify(evt)
  }).catch(() => {});

  return evt;
}

export async function fetchGlobalTelemetry() {
  const eventMap = new Map();

  // 1. Load local events
  try {
    const localEvts = JSON.parse(localStorage.getItem('surftest_telemetry_events') || '[]');
    for (const e of localEvts) {
      if (e && e.id) eventMap.set(e.id, e);
    }
  } catch {}

  // 2. Fetch backend API events & cloud stream in parallel with fast timeout
  const createSignal = () => {
    try {
      return AbortSignal.timeout ? AbortSignal.timeout(2500) : undefined;
    } catch {
      return undefined;
    }
  };

  await Promise.allSettled([
    (async () => {
      try {
        const res = await fetch('/api/telemetry', { signal: createSignal() });
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data.recentEvents)) {
            for (const e of data.recentEvents) {
              if (e && e.id) eventMap.set(e.id, e);
            }
          }
        }
      } catch {}
    })(),
    (async () => {
      try {
        const res = await fetch(`${CLOUD_STREAM_URL}/json?poll=1&since=24h`, { signal: createSignal() });
        if (res.ok) {
          const text = await res.text();
          const lines = text.split('\n').filter(Boolean);
          for (const line of lines) {
            try {
              const wrapper = JSON.parse(line);
              if (wrapper && wrapper.event === 'message' && wrapper.message) {
                const parsed = JSON.parse(wrapper.message);
                if (parsed && parsed.id && parsed.type) {
                  eventMap.set(parsed.id, parsed);
                }
              }
            } catch {}
          }
        }
      } catch {}
    })()
  ]);

  const allEvents = Array.from(eventMap.values()).sort(
    (a, b) => (b.timestamp || 0) - (a.timestamp || 0)
  );

  let totalVisits = 0;
  let instagramVisits = 0;
  let directVisits = 0;
  let gamesStarted = 0;
  let roundsCompleted = 0;
  let songsGuessed = 0;

  const byMode = {
    normal: 0,
    reverse: 0,
    antakshari: 0,
    blitz: 0
  };

  const byLanguage = {
    hindi: 0,
    punjabi: 0,
    haryanvi: 0,
    all: 0
  };

  for (const e of allEvents) {
    if (e.type === 'visit') {
      totalVisits += 1;
      if (String(e.source || '').toLowerCase().includes('instagram')) {
        instagramVisits += 1;
      } else {
        directVisits += 1;
      }
    } else if (e.type === 'play_start') {
      gamesStarted += 1;
      const m = String(e.mode || 'normal').toLowerCase();
      if (byMode[m] !== undefined) byMode[m] += 1;
      const l = String(e.language || 'hindi').toLowerCase();
      if (byLanguage[l] !== undefined) byLanguage[l] += 1;
    } else if (e.type === 'round_end') {
      roundsCompleted += 1;
      if (e.won) songsGuessed += 1;
    }
  }

  const publicTotalPlays = BASELINE_PLAYS + gamesStarted + roundsCompleted;
  const publicTotalVisits = BASELINE_VISITS + totalVisits;

  return {
    publicTotalPlays,
    publicTotalVisits,
    totalVisits,
    instagramVisits,
    directVisits,
    gamesStarted,
    roundsCompleted,
    songsGuessed,
    winRate: roundsCompleted > 0 ? Math.round((songsGuessed / roundsCompleted) * 100) : 0,
    byMode,
    byLanguage,
    recentEvents: allEvents.slice(0, 50),
    cloudTopic: CLOUD_STREAM_TOPIC
  };
}
