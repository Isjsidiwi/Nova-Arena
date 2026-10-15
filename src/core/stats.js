import { BASE_STATS, RARITY, ROLE_MODIFIERS } from '../data/rarity.js';

const EMPTY_BONUS = { hp: 0, atk: 0, def: 0, spd: 0, ap: 0 };

/** Hitung statistik hero pada level tertentu dengan bonus item (ap = persen ATK). */
export function computeStats(hero, level, bonus = EMPTY_BONUS) {
  const base = BASE_STATS[hero.rarity];
  const role = ROLE_MODIFIERS[hero.role];
  const rarity = RARITY[hero.rarity].multiplier * (1 + .08 * (level - 1));
  return {
    hp: Math.round(base[0] * role[0] * rarity + bonus.hp),
    atk: Math.round((base[1] * role[1] * rarity + bonus.atk) * (1 + bonus.ap)),
    def: Math.round(base[2] * role[2] * rarity + bonus.def),
    spd: Math.round(base[3] * role[3] * (1 + .02 * (level - 1)) + bonus.spd),
  };
}

/** Skor kekuatan tim dari statistik. */
export const powerOf = (stats) => Math.round(stats.hp + stats.atk * 6 + stats.def * 4 + stats.spd * 2);
