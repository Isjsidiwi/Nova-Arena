import { SLOT_BASE_VALUES, SLOT_STATS, RARITY_ITEM_MULTIPLIER, ITEM_LEVEL_CAP } from '../data/items.js';
import { RARITY } from '../data/rarity.js';
import { itemUpgradeCost } from './economy.js';

/** Nilai stat satu item sesuai slot, rarity, dan level. */
export const itemValue = (item) =>
  SLOT_BASE_VALUES[item.s] * RARITY_ITEM_MULTIPLIER[item.r] * (1 + .08 * (item.lv - 1));

/** Teks bonus item, mis. "+64 ATK" atau "+12% ATK". */
export function itemText(item) {
  if (item.s === 4) return `+${Math.round(itemValue(item) * 100)}% ATK`;
  return `+${Math.round(itemValue(item))} ${['ATK', 'HP', 'DEF', 'SPD'][item.s]}`;
}

export const findItem = (state, uid) => state.eq.find((item) => item.u === uid) || null;

/** Item yang terpasang di 5 slot hero (null jika kosong). */
export function equippedFor(state, heroId) {
  const slots = state.lo[heroId] || [];
  return Array.from({ length: 5 }, (_, index) => {
    const uid = slots[index];
    return uid == null ? null : findItem(state, uid);
  });
}

/** Total bonus stat dari seluruh item hero. */
export function bonusFor(state, heroId) {
  const bonus = { atk: 0, hp: 0, def: 0, spd: 0, ap: 0 };
  (state.lo[heroId] || []).forEach((uid) => {
    const item = state.eq.find((x) => x.u === uid);
    if (item) bonus[SLOT_STATS[item.s]] += itemValue(item);
  });
  return bonus;
}

/** Hero lain yang sedang memakai item uid (selain heroId). */
export function ownerOf(state, uid, exceptHeroId) {
  return Object.keys(state.lo).find(
    (heroId) => heroId !== exceptHeroId && (state.lo[heroId] || []).includes(uid),
  );
}

/** Pasang item ke slot hero; otomatis melepas dari hero/slot lain. */
export function equip(state, heroId, slot, uid) {
  for (const other of Object.keys(state.lo)) {
    state.lo[other] = (state.lo[other] || []).map((x) => (x === uid ? null : x));
  }
  const slots = (state.lo[heroId] = state.lo[heroId] || [null, null, null, null, null]);
  while (slots.length < 5) slots.push(null);
  slots[slot] = uid;
}

export function unequip(state, heroId, slot) {
  const slots = state.lo[heroId];
  if (slots) slots[slot] = null;
}

/** Upgrade item +1 level. Mengembalikan { ok, reason }. */
export function tryUpgradeItem(state, uid) {
  const item = findItem(state, uid);
  if (!item) return { ok: false, reason: 'missing' };
  if (item.lv >= ITEM_LEVEL_CAP) return { ok: false, reason: 'max' };
  const cost = itemUpgradeCost(item);
  if (state.k < cost) return { ok: false, reason: 'coins' };
  state.k -= cost;
  item.lv += 1;
  return { ok: true, cost };
}

/** Daftar item untuk slot tertentu: item bebas dulu, lalu rarity & level tertinggi. */
export function itemsForSlot(state, slot, { heroId, excludeUid } = {}) {
  return state.eq
    .filter((item) => item.s === slot && item.u !== excludeUid)
    .sort(
      (a, b) =>
        (ownerOf(state, a.u, heroId) ? 1 : 0) - (ownerOf(state, b.u, heroId) ? 1 : 0) ||
        RARITY[b.r].multiplier - RARITY[a.r].multiplier ||
        b.lv - a.lv,
    );
}

/** Daftar item untuk layar koleksi: rarity lalu level. */
export function sortedItems(state) {
  return [...state.eq].sort(
    (a, b) =>
      RARITY[b.r].multiplier - RARITY[a.r].multiplier ||
      b.lv - a.lv ||
      a.s - b.s,
  );
}
