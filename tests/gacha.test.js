import { describe, expect, it } from 'vitest';
import { pull, rollRarity } from '../src/core/gacha.js';
import { createDefaultState, migrateState } from '../src/core/state.js';

const scripted = (values) => {
  let i = 0;
  return () => values[i++ % values.length];
};

const freshState = () => migrateState(createDefaultState());

describe('rollRarity', () => {
  it('roll < 3 = SSR dan mereset pity', () => {
    const state = freshState();
    state.ps = 17;
    expect(rollRarity(state, 'ps', false, scripted([.02]))).toBe('SSR');
    expect(state.ps).toBe(0);
  });

  it('pity 49 memaksa SSR', () => {
    const state = freshState();
    state.ps = 49;
    expect(rollRarity(state, 'ps', false, scripted([.99]))).toBe('SSR');
    expect(state.ps).toBe(0);
  });

  it('roll 3-20 = SR dan menambah pity', () => {
    const state = freshState();
    expect(rollRarity(state, 'ps', false, scripted([.1]))).toBe('SR');
    expect(state.ps).toBe(1);
  });

  it('force = SR walau roll besar', () => {
    const state = freshState();
    expect(rollRarity(state, 'ps', true, scripted([.99]))).toBe('SR');
  });

  it('selain itu R', () => {
    const state = freshState();
    expect(rollRarity(state, 'ps', false, scripted([.5]))).toBe('R');
  });
});

describe('pull', () => {
  it('x1 item mengurangi gems dan menambah 1 item', () => {
    const state = freshState();
    const before = state.eq.length;
    const result = pull(state, 1, true, scripted([.5, .3]));
    expect(result.ok).toBe(true);
    expect(state.g).toBe(3000 - 300);
    expect(state.eq.length).toBe(before + 1);
    expect(result.results[0].rarity).toBe('R');
    expect(state.pi).toBe(1);
  });

  it('x10 menjamin minimal 1 SR pada pull terakhir', () => {
    const state = freshState();
    // Setiap roll rarity = 0.5 (R), roll slot = 0.25
    const result = pull(state, 10, true, scripted([.5, .25]));
    expect(result.ok).toBe(true);
    expect(result.results.filter((r) => r.rarity !== 'R').length).toBeGreaterThanOrEqual(1);
    expect(result.results[9].rarity).toBe('SR');
    expect(state.g).toBe(3000 - 2700);
  });

  it('hero duplikat masuk saldo duplikat; bintang TIDAK naik otomatis', () => {
    const state = freshState();
    state.heroes = [{ id: 'arka', lv: 1, st: 1, dp: 0 }]; // kandidat R pertama
    state.k = 0;
    // roll rarity 0.5 (R), pick index 0 -> arka (duplikat)
    const result = pull(state, 1, false, scripted([.5, 0]));
    expect(result.results[0].duplicate).toBe(true);
    expect(result.results[0].coins).toBe(0);
    expect(state.heroes[0].st).toBe(1); // bintang tetap: upgrade itu manual
    expect(state.heroes[0].dp).toBe(1); // saldo duplikat bertambah
    expect(result.results[0].star.canUpgrade).toBe(true); // 1 duplikat cukup untuk bintang 2
    expect(state.k).toBe(0);
    expect(state.heroes.length).toBe(1);
  });

  it('duplikat pada hero bintang maksimum kembali menjadi koin', () => {
    const state = freshState();
    state.heroes = [{ id: 'arka', lv: 1, st: 6, dp: 25 }];
    state.k = 0;
    const result = pull(state, 1, false, scripted([.5, 0]));
    expect(result.results[0].duplicate).toBe(true);
    expect(result.results[0].star).toBeNull();
    expect(state.k).toBe(200); // DUPLICATE_COINS R
  });

  it('hero baru ditambahkan ke koleksi', () => {
    const state = freshState();
    state.heroes = [{ id: 'raka', lv: 1 }];
    // pick index 0 dari kandidat R (arka, mira, petra, sena, citra, raga)
    const result = pull(state, 1, false, scripted([.5, 0]));
    expect(result.results[0].duplicate).toBe(false);
    expect(state.heroes.map((h) => h.id)).toContain('arka');
  });

  it('gems tidak cukup', () => {
    const state = freshState();
    state.g = 100;
    const result = pull(state, 1, false, scripted([.5]));
    expect(result.ok).toBe(false);
    expect(state.g).toBe(100);
  });
});
