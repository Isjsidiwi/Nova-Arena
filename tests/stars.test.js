import { describe, expect, it } from 'vitest';
import {
  bankDuplicate,
  tryStarUp,
  starProgress,
  nextStarCost,
  starStatFactor,
  STAR_TOTALS,
  MAX_STAR,
} from '../src/core/stars.js';
import { computeStats } from '../src/core/stats.js';
import { HERO_BY_ID } from '../src/data/heroes.js';

describe('sistem bintang manual', () => {
  it('total biaya mencapai bintang n tetap (n-1)^2: b2=1, b3=4, b4=9, b5=16, b6=25', () => {
    expect(STAR_TOTALS.slice(2)).toEqual([1, 4, 9, 16, 25]);
  });

  it('biaya per langkah: 1, 3, 5, 7, 9', () => {
    expect(nextStarCost({ st: 1, dp: 0 })).toBe(1);
    expect(nextStarCost({ st: 2, dp: 0 })).toBe(3);
    expect(nextStarCost({ st: 3, dp: 0 })).toBe(5);
    expect(nextStarCost({ st: 4, dp: 0 })).toBe(7);
    expect(nextStarCost({ st: 5, dp: 0 })).toBe(9);
    expect(nextStarCost({ st: 6, dp: 0 })).toBeNull();
  });

  it('bankDuplicate hanya menambah saldo, bintang tidak berubah', () => {
    const owned = { id: 'x', lv: 1, st: 1, dp: 0 };
    bankDuplicate(owned);
    bankDuplicate(owned);
    expect(owned.dp).toBe(2);
    expect(owned.st).toBe(1);
  });

  it('tryStarUp membelanjakan saldo sesuai biaya langkah', () => {
    const owned = { id: 'x', lv: 1, st: 1, dp: 0 };
    expect(tryStarUp(owned)).toMatchObject({ ok: false, reason: 'dupes' });
    bankDuplicate(owned); // dp=1, cukup untuk bintang 2 (biaya 1)
    expect(tryStarUp(owned)).toMatchObject({ ok: true, cost: 1, stars: 2 });
    expect(owned.dp).toBe(0);
    // Ke bintang 3 biaya 3: dua duplikat belum cukup.
    bankDuplicate(owned);
    bankDuplicate(owned);
    expect(tryStarUp(owned)).toMatchObject({ ok: false, reason: 'dupes', cost: 3 });
    bankDuplicate(owned);
    expect(tryStarUp(owned)).toMatchObject({ ok: true, cost: 3, stars: 3 });
    expect(owned.dp).toBe(0);
  });

  it('tryStarUp menolak pada bintang maksimum', () => {
    const owned = { id: 'x', lv: 1, st: MAX_STAR, dp: 30 };
    expect(tryStarUp(owned)).toMatchObject({ ok: false, reason: 'max' });
    expect(owned.dp).toBe(30);
  });

  it('starProgress melaporkan kesiapan upgrade manual', () => {
    expect(starProgress({ st: 2, dp: 2 })).toMatchObject({ stars: 2, dupes: 2, nextCost: 3, canUpgrade: false, maxed: false });
    expect(starProgress({ st: 2, dp: 3 })).toMatchObject({ canUpgrade: true });
    expect(starProgress({ st: 6, dp: 5 })).toMatchObject({ maxed: true, nextCost: null, canUpgrade: false });
    expect(starProgress({})).toMatchObject({ stars: 1, dupes: 0, nextCost: 1, canUpgrade: false });
  });
});

describe('bonus statistik bintang', () => {
  it('+10% per bintang di atas 1', () => {
    expect(starStatFactor(1)).toBe(1);
    expect(starStatFactor(6)).toBeCloseTo(1.5);
    const hero = HERO_BY_ID.arka;
    const base = computeStats(hero, 1);
    const starred = computeStats(hero, 1, undefined, 3);
    expect(starred.hp).toBe(Math.round(base.hp * 1.2));
    expect(starred.atk).toBe(Math.round(base.atk * 1.2));
  });
});
