import { $ } from '../dom.js';
import { S } from '../../store.js';
import { CHAPTERS, enemySummary } from '../../data/chapters.js';
import { teamPower } from '../../core/roster.js';
import { openBattlePrep } from './battle.js';
import { fmt } from '../../core/format.js';
import { sfx } from '../../core/audio.js';

export function initStageScreen() {
  $('#stage').addEventListener('click', (event) => {
    const button = event.target.closest('button');
    if (!button) return;

    if (button.dataset.tc != null) {
      S.tc = +button.dataset.tc;
      sfx('tap');
      renderStageScreen();
      return;
    }

    if (button.dataset.pre) {
      sfx('tap');
      openBattlePrep(+button.dataset.pre);
    }
  });
}

export function renderStageScreen() {
  const chapterIndex = S.tc ?? Math.min(Math.floor(S.cl / 5), 2);
  S.tc = chapterIndex;
  const chapter = CHAPTERS[chapterIndex];

  $('#stage').innerHTML = `
    <div class="ttl">MISI<small>Tim ${fmt(teamPower(S))}</small></div>
    <div class="tabs">${CHAPTERS
      .map((ch, index) => `<button data-tc="${index}" class="${index === chapterIndex ? 'on' : ''}" style="--c:${ch.color}">BAB ${index + 1}</button>`)
      .join('')}</div>
    <div class="scr" style="--c:${chapter.color}">
      <div class="dm" style="margin-bottom:8px">${chapter.name}</div>
      ${[1, 2, 3, 4, 5]
        .map((step) => {
          const stage = chapterIndex * 5 + step;
          const locked = stage > S.cl + 1;
          const stars = S.stars[stage] || 0;
          const title = step === 5 ? 'Boss: ' + chapter.boss : 'Patroli ' + chapter.name;
          return `<button class="stg ${locked ? 'lk' : ''}" data-pre="${stage}">
            <span class="n">${chapterIndex + 1}-${step}</span>
            <span class="t">${title}<small>${locked ? 'Terkunci' : 'Musuh: ' + enemySummary(stage)}</small></span>
            <span class="stars">${[1, 2, 3].map((j) => `<span class="${j <= stars ? 'f' : ''}">★</span>`).join('')}</span>
          </button>`;
        })
        .join('')}
    </div>
  `;
}
