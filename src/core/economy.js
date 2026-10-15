import { RARITY } from '../data/rarity.js';
import { RARITY_ITEM_MULTIPLIER } from '../data/items.js';

export const GACHA_COST = { 1: 300, 10: 2700 };

export const DUPLICATE_COINS = { R: 200, SR: 800, SSR: 3000 };

/** Biaya naik level hero (dari level saat ini). */
export const heroLevelCost = (hero, level) => Math.round(level * 80 * RARITY[hero.rarity].costFactor);

/** Biaya upgrade item (dari level item saat ini). */
export const itemUpgradeCost = (item) => Math.round(item.lv * 70 * RARITY_ITEM_MULTIPLIER[item.r]);

/** Hadiah battle. firstClear hanya bernilai saat menang pertama kali di stage itu. */
export function battleRewards(stage, win, firstClear) {
  return {
    coins: Math.round((200 + stage * 60) * (win ? 1 : .3)),
    gems: firstClear ? 60 + stage * 10 : 0,
  };
}

/** Bintang hasil battle: 3 tanpa korban, 2 jika korban <= 2, selain itu 1. */
export const battleStars = (win, deadCount) => (win ? (deadCount === 0 ? 3 : deadCount <= 2 ? 2 : 1) : 0);
