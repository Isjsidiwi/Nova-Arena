import { describe, expect, it } from 'vitest';
import { computeStats, powerOf } from '../src/core/stats.js';
import { HERO_BY_ID } from '../src/data/heroes.js';

const sylva = HERO_BY_ID.sylva;

describe('computeStats', () => {
  it('menghitung stat hero lv1 tanpa bonus', () => {
    const stats = computeStats(sylva, 1);
    expect(stats).toEqual({ hp: 1436, atk: 226, def: 111, spd: 100 });
  });

  it('menerapkan bonus item dan persen ATK (kalung)', () => {
    const stats = computeStats(sylva, 1, { hp: 0, atk: 8, def: 0, spd: 0, ap: .08 });
    // (130*1.2*1.45 + 8) * 1.08 = 252.936 -> 253
    expect(stats.atk).toBe(253);
    expect(stats.hp).toBe(1436);
  });

  it('naik sesuai level', () => {
    const low = computeStats(sylva, 1);
    const high = computeStats(sylva, 11);
    expect(high.hp).toBeGreaterThan(low.hp);
    expect(high.atk).toBeGreaterThan(low.atk);
    expect(high.spd).toBeGreaterThan(low.spd);
  });

  it('powerOf menjumlahkan bobot stat', () => {
    expect(powerOf({ hp: 1436, atk: 226, def: 111, spd: 100 })).toBe(3436);
  });
});
