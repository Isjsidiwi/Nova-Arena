import { $ } from '../dom.js';
import { S } from '../../store.js';
import { HERO_BY_ID } from '../../data/heroes.js';
import { ELEMENTS } from '../../data/elements.js';
import { CHAPTERS, STAGES_PER_CHAPTER, TOTAL_STAGES, chapterIndexForStage } from '../../data/chapters.js';
import { GREETING_LINES } from '../../data/lines.js';
import { teamStripHtml } from '../components/teamStrip.js';
import { openTeamPick } from '../sheets/teamPick.js';
import { openBattlePrep } from './battle.js';
import { heroArt, elementBadge } from '../art.js';
import { burst } from '../particles.js';
import { pick } from '../../core/rng.js';
import { sfx } from '../../core/audio.js';

export function initHomeScreen() {
  $('#home').addEventListener('click', (event) => {
    const lead = event.target.closest('#lead');
    if (lead) {
      sfx('tap');
      const say = $('#say');
      say.textContent = pick(Math.random, GREETING_LINES);
      say.classList.add('on');
      setTimeout(() => say.classList.remove('on'), 1800);
      burst(event.clientX, event.clientY, ELEMENTS[HERO_BY_ID[S.team[0]].element].color, 18);
      return;
    }

    const button = event.target.closest('button');
    if (!button) return;
    if (button.dataset.pre != null) {
      sfx('tap');
      openBattlePrep(+button.dataset.pre);
    } else if (button.dataset.ts != null) {
      sfx('tap');
      openTeamPick(+button.dataset.ts);
    }
  });
}

export function renderHomeScreen() {
  const hero = HERO_BY_ID[S.team[0]];
  const color = ELEMENTS[hero.element].color;
  const nextStage = Math.min(S.cl + 1, TOTAL_STAGES);
  const nextChapter = chapterIndexForStage(nextStage);
  const chapter = CHAPTERS[nextChapter];
  const nextStep = ((nextStage - 1) % STAGES_PER_CHAPTER) + 1;

  $('#home').innerHTML = `
    <div class="stage" style="--c:${color}">
      <div class="kj" style="color:${color}">${ELEMENTS[hero.element].glyph}</div>
      <div class="ring" style="border-color:${color}"></div>
      <div class="ring b" style="border-color:${color}"></div>
      <div id="lead">${heroArt(hero)}</div>
      <div class="plate">${elementBadge(hero.element)} <span>${hero.role.toUpperCase()}</span><b>${hero.name}</b><span>${hero.title}</span></div>
      <div class="say" id="say"></div>
    </div>
    ${teamStripHtml(S)}
    <div class="go">
      <div class="inf"><span class="dm">Misi berikut</span><b>${chapter.name} ${nextChapter + 1}-${nextStep}</b></div>
      <button class="btn pk" data-pre="${nextStage}">BERTARUNG</button>
    </div>
  `;
}
