// RNG yang bisa di-seed agar logika game (battle, gacha) dapat di-test secara deterministik.

/** PRNG mulberry32. Mengembalikan fungsi () => number di [0, 1). */
export function mulberry32(seed) {
  let a = seed >>> 0;
  return function next() {
    a = (a + 0x6D2B79F5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export const randomBetween = (rng, min, max) => min + rng() * (max - min);

export const randomInt = (rng, maxExclusive) => Math.floor(rng() * maxExclusive);

export const pick = (rng, arr) => arr[Math.floor(rng() * arr.length)];
