import { RARITY } from '../../data/rarity.js';
import { RARITY_PREFIX, SLOT_NAMES } from '../../data/items.js';
import { ELEMENTS } from '../../data/elements.js';
import { heroArt, itemArt, elementBadge, rarityBadge } from '../art.js';
import { itemText, itemName } from '../../core/equipment.js';
import { starsOf, MAX_STAR } from '../../core/stars.js';

/** Kartu hero. owned = entri { id, lv } bila dimiliki; extraClass: 'in' | 'lk'; teamSlot = urutan di tim (1-5). */
export function heroCard(hero, owned = null, extraClass = '', teamSlot = 0) {
  const rarityColor = RARITY[hero.rarity].color;
  const teamBadge = extraClass.split(' ').includes('in')
    ? `<span class="tm">★ TIM${teamSlot ? ' ' + teamSlot : ''}</span>`
    : '';
  // Deret bintang PENUH menempati bekas posisi pita TIM (tengah bawah
  // portrait); badge TIM pindah jadi tab di tepi kiri kartu (saran user).
  const stars = owned
    ? `<span class="hstars">${'★'.repeat(starsOf(owned))}<i>${'★'.repeat(MAX_STAR - starsOf(owned))}</i></span>`
    : '';
  return `<button class="hc ${hero.rarity} ${extraClass}" data-id="${hero.id}" style="--r:${rarityColor};--c:${ELEMENTS[hero.element].color}">${elementBadge(hero.element)}${rarityBadge(hero.rarity)}${teamBadge}${heroArt(hero)}${stars}<span class="nm hero"><span class="nmname">${hero.name}</span><span class="nmlv">${owned ? 'Lv' + owned.lv : ''}</span></span></button>`;
}

/** Kartu item. */
export function itemCard(item) {
  const color = RARITY[item.r].color;
  return `<button class="hc ic ${item.r}" data-iu="${item.u}" style="--r:${color};--c:${color}">${item.e ? elementBadge(item.e) : ''}${rarityBadge(item.r)}${itemArt(item)}<span class="nm"><span>${itemName(item)}<br><b style="color:#7dffb0">${itemText(item)}</b></span><span>Lv${item.lv}</span></span></button>`;
}
