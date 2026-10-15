import { $ } from '../dom.js';
import { S } from '../../store.js';
import { HEROES, HERO_BY_ID } from '../../data/heroes.js';
import { getOwned, sortedOwned, autoTeam } from '../../core/roster.js';
import { sortedItems } from '../../core/equipment.js';
import { heroCard, itemCard } from '../components/cards.js';
import { openHeroSheet } from '../sheets/heroSheet.js';
import { openItemSheet } from '../sheets/itemSheet.js';
import { refreshHud } from '../hud.js';
import { toast } from '../toast.js';
import { sfx } from '../../core/audio.js';

export function initHeroScreen() {
  $('#hero').addEventListener('click', (event) => {
    const button = event.target.closest('button');
    if (!button) return;

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
  if (!itemTab) {
    const owned = sortedOwned(S);
    content = `<div class="hg">${owned
      .map((o) => heroCard(HERO_BY_ID[o.id], o, S.team.includes(o.id) ? 'in' : ''))
      .join('')}${HEROES.filter((hero) => !getOwned(S, hero.id))
      .map((hero) => heroCard(hero, null, 'lk'))
      .join('')}</div>`;
  } else {
    const items = sortedItems(S);
    content = items.length
      ? `<div class="hg">${items.map(itemCard).join('')}</div>`
      : '<div class="dm" style="text-align:center;margin-top:40px">Belum ada item.<br>Dapatkan lewat Summon Item!</div>';
  }

  $('#hero').innerHTML = `
    <div class="ttl">KOLEKSI<small>${itemTab ? S.eq.length + ' item' : S.heroes.length + '/' + HEROES.length}</small></div>
    <div class="tabs" style="--c:#52e0ff">${['HERO', 'ITEM']
      .map((label, index) => `<button data-ht="${index}" class="${index === (itemTab ? 1 : 0) ? 'on' : ''}">${label}</button>`)
      .join('')}</div>
    <div class="scr">${content}</div>
    ${itemTab ? '' : '<div class="row" style="margin-top:8px"><button class="btn cy" id="autoTeam">TIM OTOMATIS</button></div>'}
  `;
}
