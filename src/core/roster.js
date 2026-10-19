import { HERO_BY_ID } from '../data/heroes.js';
import { RARITY } from '../data/rarity.js';
import { computeStats, powerOf } from './stats.js';
import { bonusFor } from './equipment.js';
import { heroLevelCost } from './economy.js';

export const getOwned = (state, id) => state.heroes.find((h) => h.id === id);

export const isInTeam = (state, id) => state.team.includes(id);

export function heroStats(state, id) {
  const owned = getOwned(state, id);
  return computeStats(HERO_BY_ID[id], owned.lv, bonusFor(state, id), owned.st || 1);
}

export const heroPower = (state, id) => powerOf(heroStats(state, id));

export const teamPower = (state) => state.team.reduce((sum, id) => sum + heroPower(state, id), 0);

/** Naik level hero. Mengembalikan { ok, reason }. */
export function tryLevelUp(state, id) {
  const hero = HERO_BY_ID[id];
  const owned = getOwned(state, id);
  if (owned.lv >= RARITY[hero.rarity].levelCap) return { ok: false, reason: 'max' };
  const cost = heroLevelCost(hero, owned.lv);
  if (state.k < cost) return { ok: false, reason: 'coins' };
  state.k -= cost;
  owned.lv += 1;
  return { ok: true };
}

/** Masuk/keluar tim. Mengembalikan { ok, reason }. */
export function toggleTeam(state, id) {
  const index = state.team.indexOf(id);
  if (index >= 0) {
    if (state.team.length < 2) return { ok: false, reason: 'min' };
    state.team.splice(index, 1);
  } else {
    if (state.team.length >= 5) return { ok: false, reason: 'max' };
    state.team.push(id);
  }
  return { ok: true };
}

/** Susun 5 hero terkuat secara otomatis. */
export function autoTeam(state) {
  state.team = [...state.heroes]
    .sort((a, b) => heroPower(state, b.id) - heroPower(state, a.id))
    .slice(0, 5)
    .map((h) => h.id);
  return state.team;
}

/** Daftar hero dimiliki urut rarity lalu power untuk ditampilkan. */
export function sortedOwned(state) {
  return [...state.heroes].sort(
    (a, b) =>
      RARITY[HERO_BY_ID[b.id].rarity].multiplier - RARITY[HERO_BY_ID[a.id].rarity].multiplier ||
      heroPower(state, b.id) - heroPower(state, a.id),
  );
}

/**
 * Anggota tim di depan, mengikuti urutan slot tim (TIM 1..5); sisanya
 * mempertahankan urutan masuk (sort stabil). Dipakai tampilan Koleksi
 * saat tidak ada filter aktif (permintaan user 18 Okt).
 */
export function teamFirst(owned, team) {
  return [...owned].sort((a, b) => {
    const ta = team.indexOf(a.id);
    const tb = team.indexOf(b.id);
    if (ta === -1 && tb === -1) return 0;
    if (ta === -1) return 1;
    if (tb === -1) return -1;
    return ta - tb;
  });
}
