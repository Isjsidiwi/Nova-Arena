import { $ } from '../dom.js';
import { S } from '../../store.js';
import { HERO_BY_ID } from '../../data/heroes.js';
import { pull } from '../../core/gacha.js';
import { heroArt, itemArt } from '../art.js';
import { showReveal } from '../reveal.js';
import { refreshHud } from '../hud.js';
import { toast } from '../toast.js';
import { fmt } from '../../core/format.js';
import { sfx } from '../../core/audio.js';

export function initGachaScreen() {
  $('#gacha').addEventListener('click', (event) => {
    const button = event.target.closest('button');
    if (!button) return;

    if (button.dataset.gm != null) {
      S.gm = +button.dataset.gm;
      sfx('tap');
      renderGachaScreen();
      return;
    }

    if (button.dataset.pull) doPull(+button.dataset.pull);
  });
}

export function renderGachaScreen() {
  const itemMode = S.gm == 1;
  const pity = itemMode ? S.pi : S.ps;

  $('#gacha').innerHTML = `
    <div class="ttl">SUMMON<small>Gems ${fmt(S.g)}</small></div>
    <div class="tabs" style="--c:#52e0ff">${['HERO', 'ITEM']
      .map((label, index) => `<button data-gm="${index}" class="${index === (itemMode ? 1 : 0) ? 'on' : ''}">${label}</button>`)
      .join('')}</div>
    <div class="ban" style="--c:#ffd76a">
      <div class="tx"><b>${itemMode ? 'BANNER<br>PERLENGKAPAN' : 'BANNER<br>BINTANG<br>NOVA'}</b><span class="dm">SSR 3% · SR 17% · R 80%</span></div>
      ${itemMode
        ? `<div class="iban">${[0, 1, 2, 3, 4].map((slot) => itemArt({ s: slot, r: slot % 2 ? 'SR' : 'SSR' })).join('')}</div>`
        : heroArt(HERO_BY_ID.raka)}
      <div class="pt">Pity SSR ${pity}/50</div>
    </div>
    <div class="pulls">
      <button class="btn cy" data-pull="1">SUMMON ×1<small>300 Gems</small></button>
      <button class="btn pk" data-pull="10">SUMMON ×10<small>2.700 Gems · min. 1 SR</small></button>
    </div>
  `;
}

async function doPull(count) {
  const itemMode = S.gm == 1;
  const result = pull(S, count, itemMode);
  if (!result.ok) {
    toast('Gems tidak cukup');
    return;
  }
  refreshHud();
  sfx('pull');
  await showReveal(result.results);
  refreshHud();
  renderGachaScreen();
}
