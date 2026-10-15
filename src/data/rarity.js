// Rarity, basis statistik, dan pengali role.
export const RARITY = {
  R: { multiplier: 1, levelCap: 40, costFactor: 1, color: '#6fb4ff' },
  SR: { multiplier: 1.45, levelCap: 50, costFactor: 1.5, color: '#c28bff' },
  SSR: { multiplier: 2, levelCap: 60, costFactor: 2.2, color: '#ffd76a' },
};

// [HP, ATK, DEF, SPD] dasar per rarity.
export const BASE_STATS = {
  R: [800, 90, 60, 90],
  SR: [1100, 130, 85, 100],
  SSR: [1500, 180, 115, 112],
};

// Pengali per role: [HP, ATK, DEF, SPD].
export const ROLE_MODIFIERS = {
  Penyerang: [.9, 1.2, .9, 1],
  Tank: [1.3, .8, 1.3, .95],
  Pendukung: [1, .9, 1, 1.1],
  Penyembuh: [1.05, .9, 1, 1.05],
};

export const RARITY_ORDER = ['R', 'SR', 'SSR'];
