import { $ } from '../dom.js';
import { S } from '../../store.js';
import { HERO_BY_ID } from '../../data/heroes.js';
import { ASSETS } from '../../config/assets.js';
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

/* --- Rotasi portrait Beranda: hero yang tampil bergantian mengikuti slot
   tim yang terisi, tiap 10 detik, dengan transisi geser + fade. --- */
const LEAD_ROTATE_MS = 10000;
let leadTimer = null;
let leadIdx = 0;
let leadHeroId = null;

const teamHeroes = () => S.team.filter(Boolean).map((id) => HERO_BY_ID[id]);

const kjHtml = (hero) =>
  ASSETS.element && ASSETS.element[hero.element]
    ? `<img src="${ASSETS.element[hero.element]}" alt="">`
    : `<span style="color:${ELEMENTS[hero.element].color}">${ELEMENTS[hero.element].glyph}</span>`;

const plateHtml = (hero) =>
  `${elementBadge(hero.element)} <span>${hero.role.toUpperCase()}</span><b>${hero.name}</b><span>${hero.title}</span>`;

function applyLead(hero) {
  const stage = $('#home .stage');
  if (!stage) return;
  const color = ELEMENTS[hero.element].color;
  stage.style.setProperty('--c', color);
  stage.querySelector('.kj').innerHTML = kjHtml(hero);
  stage.querySelectorAll('.ring').forEach((ring) => (ring.style.borderColor = color));
  $('#lead').innerHTML = heroArt(hero);
  stage.querySelector('.plate').innerHTML = plateHtml(hero);
  leadHeroId = hero.id;
}

function swapLead(hero) {
  const stage = $('#home .stage');
  if (!stage) return;
  stage.classList.add('out');
  setTimeout(() => {
    applyLead(hero);
    // Portrait masuk dari kanan: matikan transisi sesaat, geser, lalu lepas.
    const svg = $('#lead svg');
    if (svg) {
      svg.style.transition = 'none';
      svg.style.transform = 'translateX(34px)';
      void svg.offsetWidth;
      svg.style.transition = '';
      svg.style.transform = '';
    }
    stage.classList.remove('out');
  }, 400);
}

function stopLeadRotation() {
  if (leadTimer) clearInterval(leadTimer);
  leadTimer = null;
}

function startLeadRotation() {
  stopLeadRotation();
  if (teamHeroes().length < 2) return;
  leadTimer = setInterval(() => {
    if (!$('#home').classList.contains('on')) return stopLeadRotation();
    if (document.hidden) return;
    const heroes = teamHeroes();
    if (heroes.length < 2) return;
    leadIdx = (leadIdx + 1) % heroes.length;
    swapLead(heroes[leadIdx]);
  }, LEAD_ROTATE_MS);
}

export function initHomeScreen() {
  $('#home').addEventListener('click', (event) => {
    const lead = event.target.closest('#lead');
    if (lead) {
      sfx('tap');
      const say = $('#say');
      say.textContent = pick(Math.random, GREETING_LINES);
      say.classList.add('on');
      setTimeout(() => say.classList.remove('on'), 1800);
      burst(event.clientX, event.clientY, ELEMENTS[HERO_BY_ID[leadHeroId || S.team[0]].element].color, 18);
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
  stopLeadRotation();
  leadIdx = 0;
  const hero = teamHeroes()[0] || HERO_BY_ID[S.team[0]];
  leadHeroId = hero.id;
  const color = ELEMENTS[hero.element].color;
  const nextStage = Math.min(S.cl + 1, TOTAL_STAGES);
  const nextChapter = chapterIndexForStage(nextStage);
  const chapter = CHAPTERS[nextChapter];
  const nextStep = ((nextStage - 1) % STAGES_PER_CHAPTER) + 1;

  $('#home').innerHTML = `
    <div class="stage" style="--c:${color}">
      <div class="kj">${kjHtml(hero)}</div>
      <div class="ring" style="border-color:${color}"></div>
      <div class="ring b" style="border-color:${color}"></div>
      <div id="lead">${heroArt(hero)}</div>
      <div class="plate">${plateHtml(hero)}</div>
      <div class="say" id="say"></div>
    </div>
    ${teamStripHtml(S)}
    <div class="go">
      <div class="inf"><span class="dm">Misi berikut</span><b>${chapter.name} ${nextChapter + 1}-${nextStep}</b></div>
      <button class="btn pk" data-pre="${nextStage}">BERTARUNG</button>
    </div>
  `;
  startLeadRotation();
}
