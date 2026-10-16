import { RARITY } from '../../data/rarity.js';
import { RARITY_PREFIX, SLOT_NAMES } from '../../data/items.js';
import { ELEMENTS } from '../../data/elements.js';
import { heroArt, itemArt, elementBadge, rarityBadge } from '../art.js';
import { itemText } from '../../core/equipment.js';

/** Kartu hero. owned = entri { id, lv } bila dimiliki; extraClass: 'in' | 'lk'; teamSlot = urutan di tim (1-5). */
export function heroCard(hero, owned = null, extraClass = '', teamSlot = 0) {
  const rarityColor = RARITY[hero.rarity].color;
  const teamBadge = extraClass.split(' ').includes('in')
    ? `<span class="tm">★ TIM${teamSlot ? ' ' + teamSlot : ''}</span>`
    : '';
  return `<button class="hc ${hero.rarity} ${extraClass}" data-id="${hero.id}" style="--r:${rarityColor};--c:${ELEMENTS[hero.element].color}">${elementBadge(hero.element)}${rarityBadge(hero.rarity)}${teamBadge}${heroArt(hero)}<span class="nm"><span>${hero.name}</span><span>${owned ? 'Lv' + owned.lv : ''}</span></span></button>`;
}

/** Kartu item. */
export function itemCard(item) {
  const color = RARITY[item.r].color;
  return `<button class="hc ic ${item.r}" data-iu="${item.u}" style="--r:${color};--c:${color}">${rarityBadge(item.r)}${itemArt(item)}<span class="nm"><span>${RARITY_PREFIX[item.r]} ${SLOT_NAMES[item.s]}<br><b style="color:#7dffb0">${itemText(item)}</b></span><span>Lv${item.lv}</span></span></button>`;
}
