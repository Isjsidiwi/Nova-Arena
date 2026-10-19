import { HERO_BY_ID, HEROES } from '../data/heroes.js';
import { DUPLICATE_COINS, GACHA_COST } from './economy.js';
import { pick } from './rng.js';
import { bankDuplicate, starProgress, MAX_STAR } from './stars.js';
import { ELEMENTS } from '../data/elements.js';
import { WEAPON_KEYS } from '../data/items.js';

const PITY_LIMIT = 49;
const SSR_RATE = 3;
const SR_RATE = 20;

/** Roll rarity memakai (dan memperbarui) counter pity milik state. */
export function rollRarity(state, pityKey, force, rng) {
  const roll = rng() * 100;
  let rarity;
  if (state[pityKey] >= PITY_LIMIT || roll < SSR_RATE) rarity = 'SSR';
  else if (force || roll < SR_RATE) rarity = 'SR';
  else rarity = 'R';
  state[pityKey] = rarity === 'SSR' ? 0 : state[pityKey] + 1;
  return rarity;
}

/**
 * Lakukan summon. Mengembalikan { ok, results } dan langsung memutasi state
 * (gems, pity, hero/item baru, koin duplikat).
 */
export function pull(state, count, itemMode = false, rng = Math.random) {
  const cost = GACHA_COST[count];
  if (state.g < cost) return { ok: false, reason: 'gems' };
  state.g -= cost;

  const pityKey = itemMode ? 'pi' : 'ps';
  const results = [];
  let gotAboveR = false;

  for (let i = 0; i < count; i++) {
    const forceSr = count === 10 && i === 9 && !gotAboveR;
    const rarity = rollRarity(state, pityKey, forceSr, rng);
    if (rarity !== 'R') gotAboveR = true;

    if (itemMode) {
      const slot = Math.floor(rng() * 5);
      const item = {
        u: state.uid++,
        s: slot,
        r: rarity,
        lv: 1,
        e: pick(rng, Object.keys(ELEMENTS)),
        ...(slot === 0 ? { w: pick(rng, WEAPON_KEYS) } : {}),
      };
      state.eq.push(item);
      results.push({ kind: 'item', rarity, item });
    } else {
      const candidates = HEROES.filter((h) => h.rarity === rarity);
      const hero = pick(rng, candidates);
      const owned = state.heroes.find((h) => h.id === hero.id);
      let coins = 0;
      let star = null;
      if (owned) {
        if ((owned.st || 1) >= MAX_STAR) {
          coins = DUPLICATE_COINS[rarity];
          state.k += coins;
        } else {
          bankDuplicate(owned);
          star = starProgress(owned);
        }
      } else {
        state.heroes.push({ id: hero.id, lv: 1, st: 1, dp: 0 });
      }
      results.push({ kind: 'hero', rarity, hero, duplicate: !!owned, coins, star });
    }
  }

  return { ok: true, results, cost };
}

export { HERO_BY_ID };
