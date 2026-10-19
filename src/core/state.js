// State permainan + save/load localStorage. Bentuk data dipertahankan sama
// dengan versi lama (key novaArenaV2) agar save lama tetap terbaca.
export const SAVE_KEY = 'novaArenaV2';

export function createDefaultState() {
  return {
    k: 5000,
    g: 3000,
    heroes: [
      { id: 'sylva', lv: 1, st: 1, dp: 0 },
      { id: 'arka', lv: 1, st: 1, dp: 0 },
      { id: 'mira', lv: 1, st: 1, dp: 0 },
    ],
    team: ['sylva', 'arka', 'mira'],
    cl: 0,
    stars: {},
    pi: 0,
    ps: 0,
    eq: [],
    lo: {},
    uid: 1,
  };
}

/** Migrasi save lama: pastikan field baru ada, beri 5 item awal sekali saja. */
export function migrateState(state) {
  for (const owned of state.heroes || []) {
    if (owned.st == null) owned.st = 1;
    if (owned.dp == null) owned.dp = 0;
  }
  // Konversi sekali dari sistem bintang otomatis (dp = total duplikat
  // terserap) ke sistem manual (dp = saldo): saldo = total - biaya terbakar.
  if (!state.sv) {
    state.sv = 1;
    for (const owned of state.heroes || []) {
      const burned = [0, 0, 1, 4, 9, 16, 25][owned.st] || 0;
      owned.dp = Math.max(0, owned.dp - burned);
    }
  }
  state.eq = state.eq || [];
  state.lo = state.lo || {};
  state.uid = state.uid || 1;
  if (!state.gv) {
    state.gv = 1;
    const starterElements = ['a', 'w', 't', 'g', 'l'];
    for (let i = 0; i < 5; i++)
      state.eq.push({ u: state.uid++, s: i, r: 'R', lv: 1, e: starterElements[i], ...(i === 0 ? { w: 'pedang' } : {}) });
  }
  return state;
}

const defaultStorage = () => globalThis.localStorage;

export function loadState(storage = defaultStorage()) {
  let parsed = null;
  try {
    parsed = JSON.parse(storage.getItem(SAVE_KEY));
  } catch {
    parsed = null;
  }
  const state = parsed && parsed.heroes ? parsed : createDefaultState();
  return migrateState(state);
}

export function saveState(state, storage = defaultStorage()) {
  try {
    storage.setItem(SAVE_KEY, JSON.stringify(state));
  } catch {
    /* storage penuh / private mode: abaikan */
  }
}
