import { S } from '../../store.js';
import { HERO_BY_ID } from '../../data/heroes.js';
import { RARITY } from '../../data/rarity.js';
import { SLOT_NAMES, ITEM_LEVEL_CAP, WEAPON_TYPES } from '../../data/items.js';
import { ELEMENTS } from '../../data/elements.js';
import { findItem, itemText, itemTextFor, itemName, affinityNotes, tryUpgradeItem } from '../../core/equipment.js';
import { itemUpgradeCost } from '../../core/economy.js';
import { openSheet } from '../sheet.js';
import { disableSheetAnimation } from '../dom.js';
import { levelUpFx } from '../effects.js';
import { itemArt } from '../art.js';
import { refresh } from '../router.js';
import { toast } from '../toast.js';
import { fmt } from '../../core/format.js';
import { sfx } from '../../core/audio.js';

/** Sheet detail item + tombol upgrade. withFx menampilkan efek naik level. */
export function openItemSheet(uid, withFx = false) {
  const item = findItem(S, uid);
  if (!item) return;

  const ownerId = Object.keys(S.lo).find((heroId) => (S.lo[heroId] || []).includes(uid));
  const color = RARITY[item.r].color;
  const maxed = item.lv >= ITEM_LEVEL_CAP;

  const ownerHero = ownerId ? HERO_BY_ID[ownerId] : null;
  const effectiveHtml = ownerHero
    ? `<div class="bar">Efektif di ${ownerHero.name}<b style="color:${affinityNotes(item, ownerHero).some((n) => n.kind === 'bad') ? '#ff8a8a' : '#7dffb0'}">${itemTextFor(item, ownerHero)}</b></div>` +
      affinityNotes(item, ownerHero)
        .map((n) => `<div class="anote ${n.kind}">${n.label}</div>`)
        .join('')
    : '';

  const overlay = openSheet(`
    <div class="hd">
      <div class="pt" style="--r:${color};--c:${color}">${itemArt(item)}</div>
      <div style="flex:1">
        <div class="dm">${SLOT_NAMES[item.s]}</div>
        <h2>${itemName(item)}</h2>
        <div style="margin:6px 0;color:${color}">${item.r}</div>
        <div class="bar">Level<b>${item.lv}/${ITEM_LEVEL_CAP}</b></div>
        ${item.e ? `<div class="bar">Elemen<b>${ELEMENTS[item.e].name}</b></div>` : ''}
        ${item.s === 0 && item.w ? `<div class="bar">Tipe Senjata<b>${WEAPON_TYPES[item.w]}</b></div>` : ''}
        <div class="bar">Bonus<b>${itemText(item)}</b></div>
        ${ownerId ? effectiveHtml : ''}
        <div class="bar">Dipakai<b>${ownerId ? HERO_BY_ID[ownerId].name : '-'}</b></div>
        <div class="bar">Koin<b>${fmt(S.k)}</b></div>
      </div>
    </div>
    <div class="row"><button class="btn cy" id="upgradeItem" ${maxed ? 'disabled' : ''}>UPGRADE · ${fmt(itemUpgradeCost(item))}</button></div>
  `);

  if (withFx) {
    disableSheetAnimation(overlay);
    levelUpFx(overlay.querySelector('.pt'), 'UPGRADE! Lv' + item.lv, color);
  }

  overlay.querySelector('#upgradeItem').addEventListener('click', () => {
    const result = tryUpgradeItem(S, uid);
    if (!result.ok) {
      toast(result.reason === 'max' ? 'Level maksimum' : `Koin tidak cukup · butuh ${fmt(itemUpgradeCost(item))}`);
      return;
    }
    sfx('tap');
    overlay.remove();
    openItemSheet(uid, true);
    refresh();
  });
}
