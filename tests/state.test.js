import { describe, expect, it } from 'vitest';
import { createDefaultState, migrateState, loadState, saveState, SAVE_KEY } from '../src/core/state.js';

function memoryStorage(initial = {}) {
  const data = { ...initial };
  return {
    data,
    getItem: (key) => (key in data ? data[key] : null),
    setItem: (key, value) => {
      data[key] = String(value);
    },
  };
}

describe('state default & migrasi', () => {
  it('state default punya koin, gems, 3 hero, tim, dan 5 item', () => {
    const state = migrateState(createDefaultState());
    expect(state.k).toBe(5000);
    expect(state.g).toBe(3000);
    expect(state.heroes.length).toBe(3);
    expect(state.team.length).toBe(3);
    expect(state.eq.length).toBe(5);
    expect(state.gv).toBe(1);
    expect(state.uid).toBe(6);
  });

  it('migrasi tidak menggandakan item saat dipanggil ulang', () => {
    const state = migrateState(createDefaultState());
    migrateState(state);
    expect(state.eq.length).toBe(5);
    expect(state.uid).toBe(6);
  });

  it('migrasi bintang otomatis -> manual: dp menjadi saldo (total - biaya terbakar), idempotent', () => {
    // Era otomatis: hero bintang 3 berarti 4 duplikat terserap -> saldo 0.
    const old = { heroes: [{ id: 'sylva', lv: 5, st: 3, dp: 4 }, { id: 'arka', lv: 1, st: 1, dp: 2 }] };
    const state = migrateState(old);
    expect(state.heroes[0].dp).toBe(0);
    expect(state.heroes[1].dp).toBe(2); // bintang 1 belum membakar apa pun
    migrateState(state);
    expect(state.heroes[0].dp).toBe(0); // tidak terkonversi dua kali
    expect(state.heroes[1].dp).toBe(2);
  });

  it('save lama tanpa gv mendapat item awal', () => {
    const old = { k: 1, g: 2, heroes: [{ id: 'sylva', lv: 1 }], team: ['sylva'], cl: 0, stars: {}, pi: 0, ps: 0 };
    const state = migrateState(old);
    expect(state.eq.length).toBe(5);
    expect(state.lo).toEqual({});
  });
});

describe('load / save', () => {
  it('memuat state dari storage', () => {
    const storage = memoryStorage({
      [SAVE_KEY]: JSON.stringify({ k: 999, g: 100, heroes: [{ id: 'raka', lv: 5 }], team: ['raka'], cl: 2, stars: {}, pi: 3, ps: 4, eq: [], lo: {}, uid: 1, gv: 1 }),
    });
    const state = loadState(storage);
    expect(state.k).toBe(999);
    expect(state.heroes[0].id).toBe('raka');
  });

  it('data rusak menghasilkan state default', () => {
    const storage = memoryStorage({ [SAVE_KEY]: 'bukan-json{{' });
    const state = loadState(storage);
    expect(state.heroes.length).toBe(3);
    expect(state.eq.length).toBe(5);
  });

  it('save lalu load kembali menghasilkan state yang sama', () => {
    const storage = memoryStorage();
    const state = migrateState(createDefaultState());
    state.k = 1234;
    saveState(state, storage);
    const loaded = loadState(storage);
    expect(loaded.k).toBe(1234);
    expect(loaded.eq).toEqual(state.eq);
  });
});
