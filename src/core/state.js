// State permainan + save/load localStorage. Bentuk data dipertahankan sama
// dengan versi lama (key novaArenaV2) agar save lama tetap terbaca.
export const SAVE_KEY = 'novaArenaV2';

export function createDefaultState() {
  return {
    k: 5000,
    g: 3000,
    heroes: [
      { id: 'sylva', lv: 1 },
      { id: 'arka', lv: 1 },
      { id: 'mira', lv: 1 },
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
  state.eq = state.eq || [];
  state.lo = state.lo || {};
  state.uid = state.uid || 1;
  if (!state.gv) {
    state.gv = 1;
    for (let i = 0; i < 5; i++) state.eq.push({ u: state.uid++, s: i, r: 'R', lv: 1 });
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
