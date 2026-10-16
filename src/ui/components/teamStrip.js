import { $$ } from '../dom.js';
import { HERO_BY_ID } from '../../data/heroes.js';
import { RARITY } from '../../data/rarity.js';
import { getOwned } from '../../core/roster.js';
import { heroArt } from '../art.js';

/** HTML strip 5 slot tim. Klik slot ditangani layar pemanggil via data-ts. */
export function teamStripHtml(state) {
  const slots = [0, 1, 2, 3, 4].map((slot) => {
    const id = state.team[slot];
    if (!id) {
      return `<button class="slot" data-ts="${slot}" style="display:flex;align-items:center;justify-content:center;color:var(--cy);font-size:36px;border-style:dashed">+</button>`;
    }
    const hero = HERO_BY_ID[id];
    return `<button class="slot" data-ts="${slot}" style="border-color:${RARITY[hero.rarity].color};--bc:${RARITY[hero.rarity].color}">${heroArt(hero)}<em>Lv${getOwned(state, id).lv}</em></button>`;
  });
  return `<div class="strip">${slots.join('')}</div>`;
}

/** Perbarui semua strip yang sedang tampil (beranda, sheet persiapan battle). */
export function refreshStrips(state) {
  $$('.strip').forEach((el) => {
    el.outerHTML = teamStripHtml(state);
  });
}
