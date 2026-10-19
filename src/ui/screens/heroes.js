import { $ } from '../dom.js';
import { S } from '../../store.js';
import { HEROES, HERO_BY_ID } from '../../data/heroes.js';
import { ELEMENTS } from '../../data/elements.js';
import { RARITY, RARITY_ORDER } from '../../data/rarity.js';
import { ASSETS } from '../../config/assets.js';
import { getOwned, sortedOwned, teamFirst, autoTeam } from '../../core/roster.js';
import { sortedItems } from '../../core/equipment.js';
import { heroCard, itemCard } from '../components/cards.js';
import { openHeroSheet } from '../sheets/heroSheet.js';
import { openItemSheet } from '../sheets/itemSheet.js';
import { refreshHud } from '../hud.js';
import { openSheet, closeSheet } from '../sheet.js';
import { toast } from '../toast.js';
import { sfx } from '../../core/audio.js';

/* Filter koleksi via popup sheet: rarity + elemen + status kepemilikan.
   Bar ringkas di layar hanya menampilkan tombol FILTER + chip filter aktif. */
const heroFilter = { rarity: 'ALL', element: 'ALL', status: 'ALL' };
let itemRarityFilter = 'ALL';
const STATUS_LABEL = { OWNED: 'Dimiliki', LOCKED: 'Terkunci' };

const matchHeroFilter = (hero) =>
  (heroFilter.rarity === 'ALL' || hero.rarity === heroFilter.rarity) &&
  (heroFilter.element === 'ALL' || hero.element === heroFilter.element);

function activeChips(itemTab) {
  const chips = [];
  if (!itemTab) {
    if (heroFilter.rarity !== 'ALL')
      chips.push(`<button class="fchip2" data-clear="rarity"><span class="rt ${heroFilter.rarity}"><i>${heroFilter.rarity}</i></span>✕</button>`);
    if (heroFilter.element !== 'ALL')
      chips.push(`<button class="fchip2" data-clear="element"><img class="med" src="${ASSETS.element[heroFilter.element]}" alt="">${ELEMENTS[heroFilter.element].name} ✕</button>`);
    if (heroFilter.status !== 'ALL')
      chips.push(`<button class="fchip2" data-clear="status">${STATUS_LABEL[heroFilter.status]} ✕</button>`);
  } else if (itemRarityFilter !== 'ALL') {
    chips.push(`<button class="fchip2" data-clear="itemrarity"><span class="rt ${itemRarityFilter}"><i>${itemRarityFilter}</i></span>✕</button>`);
  }
  return chips;
}

function filterButtonHtml(count) {
  return `<button class="fbtn ${count ? 'on' : ''}" id="openFilter">⚙ FILTER${count ? `<em>${count}</em>` : ''}</button>`;
}

function openFilterSheet(itemTab) {
  const temp = itemTab ? { rarity: itemRarityFilter } : { ...heroFilter };

  const bodyHtml = () => `
    <div class="ttl">FILTER<small>${itemTab ? 'Item' : 'Hero'}</small></div>
    <div class="fsh-lab">RARITY</div>
    <div class="fsh-row">
      <button class="fsh-all ${temp.rarity === 'ALL' ? 'on' : ''}" data-k="rarity" data-v="ALL">SEMUA</button>
      ${RARITY_ORDER.map(
        (r) =>
          `<button class="fsh-plq ${temp.rarity === r ? 'on' : ''}" data-k="rarity" data-v="${r}" style="--fc:${RARITY[r].color}" title="${r}"><span class="rt ${r}"><i>${r}</i></span></button>`,
      ).join('')}
    </div>
    ${
      itemTab
        ? ''
        : `<div class="fsh-lab">ELEMEN</div>
    <div class="fsh-row">
      <button class="fsh-med all ${temp.element === 'ALL' ? 'on' : ''}" data-k="element" data-v="ALL" title="Semua elemen">✦</button>
      ${Object.keys(ELEMENTS)
        .map(
          (key) =>
            `<button class="fsh-med ${temp.element === key ? 'on' : ''}" data-k="element" data-v="${key}" title="${ELEMENTS[key].name}"><img src="${ASSETS.element[key]}" alt="${ELEMENTS[key].name}"></button>`,
        )
        .join('')}
    </div>
    <div class="fsh-lab">STATUS</div>
    <div class="fsh-row">
      ${[
        ['ALL', 'Semua'],
        ['OWNED', 'Dimiliki'],
        ['LOCKED', 'Terkunci'],
      ]
        .map(
          ([v, label]) =>
            `<button class="fsh-seg ${temp.status === v ? 'on' : ''}" data-k="status" data-v="${v}">${label}</button>`,
        )
        .join('')}
    </div>`
    }
    <div class="row" style="margin-top:16px;gap:8px">
      <button class="btn gh" id="fshReset">RESET</button>
      <button class="btn cy" id="fshApply">TERAPKAN</button>
    </div>`;

  const overlay = openSheet(bodyHtml());
  const sh = overlay.querySelector('.sh');
  sh.addEventListener('click', (event) => {
    const button = event.target.closest('button');
    if (!button) return;
    if (button.dataset.k) {
      temp[button.dataset.k] = button.dataset.v;
      sfx('tap');
      sh.innerHTML = bodyHtml();
      return;
    }
    if (button.id === 'fshReset') {
      Object.assign(temp, itemTab ? { rarity: 'ALL' } : { rarity: 'ALL', element: 'ALL', status: 'ALL' });
      sfx('tap');
      sh.innerHTML = bodyHtml();
      return;
    }
    if (button.id === 'fshApply') {
      if (itemTab) itemRarityFilter = temp.rarity;
      else Object.assign(heroFilter, temp);
      sfx('tap');
      closeSheet(overlay);
      renderHeroScreen();
    }
  });
}

export function initHeroScreen() {
  $('#hero').addEventListener('click', (event) => {
    const button = event.target.closest('button');
    if (!button) return;

    if (button.id === 'openFilter') {
      sfx('tap');
      openFilterSheet(!!S.ht);
      return;
    }

    if (button.dataset.clear) {
      const key = button.dataset.clear;
      if (key === 'rarity') heroFilter.rarity = 'ALL';
      if (key === 'element') heroFilter.element = 'ALL';
      if (key === 'status') heroFilter.status = 'ALL';
      if (key === 'itemrarity') itemRarityFilter = 'ALL';
      sfx('tap');
      renderHeroScreen();
      return;
    }

    if (button.dataset.ht != null) {
      S.ht = +button.dataset.ht;
      sfx('tap');
      renderHeroScreen();
      return;
    }

    if (button.id === 'autoTeam') {
      autoTeam(S);
      sfx('tap');
      renderHeroScreen();
      refreshHud();
      toast('Tim terkuat disusun');
      return;
    }

    if (button.dataset.iu != null && button.classList.contains('hc')) {
      sfx('tap');
      openItemSheet(+button.dataset.iu);
      return;
    }

    if (button.dataset.id != null && button.classList.contains('hc')) {
      sfx('tap');
      openHeroSheet(button.dataset.id);
    }
  });
}

export function renderHeroScreen() {
  const itemTab = !!S.ht;

  let content;
  let filterBar = '';
  if (!itemTab) {
    let owned = sortedOwned(S).filter((o) => matchHeroFilter(HERO_BY_ID[o.id]));
    // Tanpa filter aktif: anggota tim tampil paling atas mengikuti urutan
    // slot TIM 1..5; sisanya tetap urutan rarity/power dari sortedOwned.
    const noFilter = heroFilter.rarity === 'ALL' && heroFilter.element === 'ALL' && heroFilter.status === 'ALL';
    if (noFilter) owned = teamFirst(owned, S.team);
    let locked = HEROES.filter((hero) => !getOwned(S, hero.id) && matchHeroFilter(hero));
    if (heroFilter.status === 'OWNED') locked = [];
    if (heroFilter.status === 'LOCKED') owned = [];
    const heroChips = activeChips(false);
    filterBar = heroChips.length
      ? `<div class="fbar2">${heroChips.join('')}<span class="fcount">${owned.length + locked.length} hero tampil</span></div>`
      : '';
    var filterBtn = filterButtonHtml(heroChips.length);
    content =
      owned.length || locked.length
        ? `<div class="hg">${owned
            .map((o) => heroCard(HERO_BY_ID[o.id], o, S.team.includes(o.id) ? 'in' : '', S.team.indexOf(o.id) + 1))
            .join('')}${locked.map((hero) => heroCard(hero, null, 'lk')).join('')}</div>`
        : '<div class="dm" style="text-align:center;margin-top:40px">Tidak ada hero yang cocok<br>dengan filter ini.</div>';
  } else {
    const items = sortedItems(S).filter((item) => itemRarityFilter === 'ALL' || item.r === itemRarityFilter);
    const itemChips = activeChips(true);
    filterBar = `<div class="fbar2">${itemChips.join('')}<span class="fcount">${itemChips.length ? `${items.length} item tampil` : `${S.eq.length} item`}</span></div>`;
    var filterBtn = filterButtonHtml(itemChips.length);
    content = items.length
      ? `<div class="hg">${items.map(itemCard).join('')}</div>`
      : '<div class="dm" style="text-align:center;margin-top:40px">Tidak ada item yang cocok<br>dengan filter ini.</div>';
  }

  $('#hero').innerHTML = `
    <div class="ttl">KOLEKSI${filterBtn}</div>
    <div class="tabs" style="--c:#52e0ff">${['HERO', 'ITEM']
      .map((label, index) => `<button data-ht="${index}" class="${index === (itemTab ? 1 : 0) ? 'on' : ''}">${label}</button>`)
      .join('')}</div>
    ${filterBar}
    <div class="scr">${content}</div>
    ${itemTab ? '' : '<div class="row" style="margin-top:8px"><button class="btn cy" id="autoTeam">TIM OTOMATIS</button></div>'}
  `;
}
