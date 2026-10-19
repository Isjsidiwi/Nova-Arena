import { SLOT_BASE_VALUES, SLOT_STATS, SLOT_NAMES, RARITY_PREFIX, RARITY_ITEM_MULTIPLIER, ITEM_LEVEL_CAP, WEAPON_TYPES, AFFINITY } from '../data/items.js';
import { ADVANTAGE, ELEMENTS } from '../data/elements.js';
import { HERO_BY_ID } from '../data/heroes.js';
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

/** Nama lengkap item: prefix rarity + (tipe senjata | nama slot) + elemen. */
export function itemName(item) {
  const base = item.s === 0 && item.w ? WEAPON_TYPES[item.w] || 'Senjata' : SLOT_NAMES[item.s];
  const element = item.e ? ` ${ELEMENTS[item.e].name}` : '';
  return `${RARITY_PREFIX[item.r]} ${base}${element}`;
}

/** Faktor tipe senjata: hanya slot 0 & hanya bila item punya tipe (w). */
export function weaponFactor(item, hero) {
  if (!hero || item.s !== 0 || !item.w) return AFFINITY.neutral;
  return item.w === hero.weapon ? AFFINITY.weaponMatch : AFFINITY.weaponMismatch;
}

/** Faktor elemen item terhadap elemen hero. Item lama tanpa e = netral. */
export function elementFactor(item, hero) {
  if (!hero || !item.e) return AFFINITY.neutral;
  if (item.e === hero.element) return AFFINITY.elementSame;
  if (ADVANTAGE[hero.element] === item.e) return AFFINITY.elementClash;
  if (ADVANTAGE[item.e] === hero.element) return AFFINITY.elementBeaten;
  return AFFINITY.neutral;
}

/** Faktor gabungan kecocokan item untuk seorang hero (bisa negatif). */
export const affinityFactor = (item, hero) => weaponFactor(item, hero) * elementFactor(item, hero);

/** Nilai efektif item bila dipakai hero tertentu (bisa negatif). */
export const effectiveItemValue = (item, hero) => itemValue(item) * affinityFactor(item, hero);

/** Teks nilai efektif untuk hero, mis. "-12 ATK" / "+10% ATK". */
export function itemTextFor(item, hero) {
  const value = effectiveItemValue(item, hero);
  const sign = value < 0 ? '-' : '+';
  if (item.s === 4) return `${sign}${Math.abs(Math.round(value * 100))}% ATK`;
  return `${sign}${Math.abs(Math.round(value))} ${SLOT_STATS[item.s].toUpperCase()}`;
}

/** Penjelasan kecocokan untuk UI: [{ label, kind: 'good'|'bad'|'mid' }]. */
export function affinityNotes(item, hero) {
  if (!hero) return [];
  const notes = [];
  if (item.s === 0 && item.w) {
    notes.push(
      item.w === hero.weapon
        ? { label: `Senjata cocok: ${WEAPON_TYPES[item.w]}`, kind: 'good' }
        : { label: `Senjata tidak cocok: ${WEAPON_TYPES[item.w]} ≠ ${WEAPON_TYPES[hero.weapon]}`, kind: 'bad' },
    );
  }
  if (item.e) {
    const factor = elementFactor(item, hero);
    if (factor === AFFINITY.elementSame)
      notes.push({ label: `Resonansi ${ELEMENTS[item.e].name} ×1,25`, kind: 'good' });
    else if (factor === AFFINITY.elementClash)
      notes.push({ label: `Bentrok elemen: ${ELEMENTS[hero.element].name} mengalahkan ${ELEMENTS[item.e].name}`, kind: 'bad' });
    else if (factor === AFFINITY.elementBeaten)
      notes.push({ label: `Elemen kurang cocok ×0,5`, kind: 'mid' });
  }
  return notes;
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
  const hero = HERO_BY_ID[heroId] || null;
  (state.lo[heroId] || []).forEach((uid) => {
    const item = state.eq.find((x) => x.u === uid);
    if (item) bonus[SLOT_STATS[item.s]] += effectiveItemValue(item, hero);
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
