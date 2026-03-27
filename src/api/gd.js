const isDev = import.meta.env.DEV;
const GD_BROWSER = isDev ? '/gd-api' : 'https://gdbrowser.com/api';
const POINTERCRATE_V2 = 'https://pointercrate.com/api/v2';
const POINTERCRATE_V1 = 'https://pointercrate.com/api/v1';

// ──────────────── PLAYER ────────────────

export async function searchPlayer(query) {
  const res = await fetch(`${GD_BROWSER}/profile/${encodeURIComponent(query)}`);
  if (!res.ok) throw new Error('Player not found');
  return res.json();
}

export function getPlayerIconURL(username) {
  return `https://gdbrowser.com/icon/${encodeURIComponent(username)}`;
}

// ──────────────── LEADERBOARD ────────────────

export async function getTopPlayers(count = 100) {
  const res = await fetch(`${GD_BROWSER}/leaderboard?count=${count}`);
  if (!res.ok) throw new Error('Failed to fetch leaderboard');
  return res.json();
}

export async function getCreatorLeaderboard(count = 100) {
  const res = await fetch(`${GD_BROWSER}/leaderboard?creator&count=${count}`);
  if (!res.ok) throw new Error('Failed to fetch creator leaderboard');
  return res.json();
}

// ──────────────── LEVELS ────────────────

export async function getDailyLevel() {
  const res = await fetch(`${GD_BROWSER}/level/daily`);
  if (!res.ok) throw new Error('Failed to fetch daily level');
  return res.json();
}

export async function getWeeklyLevel() {
  const res = await fetch(`${GD_BROWSER}/level/weekly`);
  if (!res.ok) throw new Error('Failed to fetch weekly level');
  return res.json();
}

export async function searchLevels(query) {
  const res = await fetch(`${GD_BROWSER}/search/${encodeURIComponent(query)}`);
  if (!res.ok) throw new Error('Failed to search levels');
  return res.json();
}

export async function getLevel(id) {
  const res = await fetch(`${GD_BROWSER}/level/${id}`);
  if (!res.ok) throw new Error('Level not found');
  return res.json();
}

// ──────────────── SONGS ────────────────

export async function getSong(id) {
  const res = await fetch(`${GD_BROWSER}/song/${id}`);
  if (!res.ok) throw new Error('Song not found');
  return res.json();
}

// ──────────────── POINTERCRATE DEMONS ────────────────

export async function getTopDemons(limit = 50) {
  const capped = Math.min(limit, 100);
  const res = await fetch(`${POINTERCRATE_V2}/demons/listed/?limit=${capped}`, {
    headers: { 'Accept': 'application/json' },
  });
  if (!res.ok) throw new Error('Failed to fetch demon list');
  return res.json();
}

export async function getPointercrateRankings(limit = 50) {
  const capped = Math.min(limit, 100);
  // Rankings endpoint is v1, not v2
  const res = await fetch(`${POINTERCRATE_V1}/players/ranking/?limit=${capped}`, {
    headers: { 'Accept': 'application/json' },
  });
  if (!res.ok) throw new Error('Failed to fetch rankings');
  return res.json();
}

// ──────────────── AREDL (All Rated Extreme Demons List) ────────────────

const AREDL_RAW = 'https://raw.githubusercontent.com/All-Rated-Extreme-Demon-List/AREDL/main/data';

export async function getAREDLList() {
  const res = await fetch(`${AREDL_RAW}/_list.json`);
  if (!res.ok) throw new Error('Failed to fetch AREDL list');
  return res.json(); // returns array of slug strings
}

export async function getAREDLDemon(slug) {
  const res = await fetch(`${AREDL_RAW}/${slug}.json`);
  if (!res.ok) throw new Error('Demon not found');
  return res.json();
}

// ──────────────── UTILS ────────────────

export function getDifficultyColor(diff) {
  const str = String(diff || '').toLowerCase();
  if (str.includes('extreme')) return '#ff0044';
  if (str.includes('insane') && str.includes('demon')) return '#ff4400';
  if (str.includes('demon')) return '#ff4444';
  if (str.includes('insane')) return '#ff00ff';
  if (str.includes('harder')) return '#ff8800';
  if (str.includes('hard')) return '#ff6600';
  if (str.includes('normal')) return '#ffff00';
  if (str.includes('easy')) return '#00ff88';
  return '#9ca3af';
}
