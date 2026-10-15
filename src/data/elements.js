// Elemen & tabel keunggulan.
// Api > Angin > Petir > Air > Api, Cahaya <-> Gelap.
export const ELEMENTS = {
  a: { glyph: '炎', color: '#ff6a45', name: 'Api' },
  w: { glyph: '水', color: '#3fb0ff', name: 'Air' },
  t: { glyph: '雷', color: '#ffd23f', name: 'Petir' },
  g: { glyph: '風', color: '#4fe08a', name: 'Angin' },
  l: { glyph: '光', color: '#ffe9a3', name: 'Cahaya' },
  d: { glyph: '闇', color: '#b07bff', name: 'Gelap' },
};

export const ADVANTAGE = { a: 'g', g: 't', t: 'w', w: 'a', l: 'd', d: 'l' };

/** Pengali damage: 1.35 jika menang elemen, 0.75 jika kalah, selain itu 1. */
export const elementMultiplier = (attacker, defender) =>
  ADVANTAGE[attacker] === defender ? 1.35 : ADVANTAGE[defender] === attacker ? 0.75 : 1;
