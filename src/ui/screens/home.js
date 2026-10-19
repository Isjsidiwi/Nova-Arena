import { $, $$ } from '../dom.js';
import { S } from '../../store.js';
import { HERO_BY_ID } from '../../data/heroes.js';
import { ASSETS } from '../../config/assets.js';
import { ELEMENTS } from '../../data/elements.js';
import { RARITY } from '../../data/rarity.js';
import {
  CHAPTERS,
  STAGES_PER_CHAPTER,
  ELITE_STEP,
  TOTAL_STAGES,
  chapterIndexForStage,
  missionTitle,
} from '../../data/chapters.js';
import { GREETING_LINES } from '../../data/lines.js';
import { teamStripHtml } from '../components/teamStrip.js';
import { openTeamPick } from '../sheets/teamPick.js';
import { openBattlePrep } from './battle.js';
import { heroArt, elementBadge } from '../art.js';
import { burst } from '../particles.js';
import { pick } from '../../core/rng.js';
import { sfx } from '../../core/audio.js';

/* --- Rotasi portrait Beranda: hero yang tampil bergantian mengikuti slot
   tim yang terisi, tiap 5 detik, dengan transisi geser + fade. --- */
const LEAD_ROTATE_MS = 5000;
const SWAP_MS = 400;
const EMBER_COUNT = 14;

let leadTimer = null;
let leadIdx = 0;
let leadHeroId = null;
let swapTimer = null;
// Animasi masuk hanya diputar saat layar Beranda baru dibuka, bukan setiap
// kali state berubah (naik level, tutup sheet, dst.).
let needsEnter = true;

const teamHeroes = () => S.team.filter(Boolean).map((id) => HERO_BY_ID[id]);

const kjHtml = (hero) =>
  ASSETS.element && ASSETS.element[hero.element]
    ? `<img src="${ASSETS.element[hero.element]}" alt="">`
    : `<span style="color:${ELEMENTS[hero.element].color}">${ELEMENTS[hero.element].glyph}</span>`;

const plateHtml = (hero) => {
  const rarity = RARITY[hero.rarity];
  return `
    <div class="pl-top">${elementBadge(hero.element)}<span class="pl-role">${hero.role.toUpperCase()}</span><em class="pl-rar" style="--rc:${rarity.color}">${hero.rarity}</em></div>
    <b class="pl-name">${hero.name}</b>
    <span class="pl-title">${hero.title}</span>`;
};

const dotsHtml = (heroes, active) =>
  heroes.length < 2
    ? ''
    : heroes
        .map((hero, index) => `<button class="dot${index === active ? ' on' : ''}" data-lead="${index}" aria-label="Tampilkan ${hero.name}"></button>`)
        .join('');

const embersHtml = () =>
  Array.from({ length: EMBER_COUNT }, () => {
    const x = Math.round(Math.random() * 100);
    const size = (1.5 + Math.random() * 3).toFixed(1);
    const dur = (6 + Math.random() * 7).toFixed(1);
    const delay = (-Math.random() * 12).toFixed(1);
    const drift = Math.round(-24 + Math.random() * 48);
    return `<i style="--x:${x}%;--s:${size}px;--d:${dur}s;--dl:${delay}s;--dx:${drift}px"></i>`;
  }).join('');

function missionHtml(nextStage) {
  const chapterIndex = chapterIndexForStage(nextStage);
  const chapter = CHAPTERS[chapterIndex];
  const step = ((nextStage - 1) % STAGES_PER_CHAPTER) + 1;
  const cleared = S.cl >= nextStage;
  const done = cleared ? STAGES_PER_CHAPTER : step - 1;

  const segments = Array.from({ length: STAGES_PER_CHAPTER }, (_, index) => {
    const n = index + 1;
    const kind = n === STAGES_PER_CHAPTER ? ' boss' : n === ELITE_STEP ? ' elite' : '';
    const state = index < done ? ' done' : index === done ? ' cur' : '';
    return `<i class="seg${kind}${state}"></i>`;
  }).join('');

  return `
    <div class="mis" style="--cc:${chapter.color}">
      <div class="mi">
        <small>MISI BERIKUT · BAB ${chapterIndex + 1}</small>
        <b>${chapter.name} ${chapterIndex + 1}-${step}</b>
        <span>${cleared ? 'Semua misi selesai · ulangi' : missionTitle(nextStage)}</span>
      </div>
      <div class="pg">
        <div class="segs">${segments}</div>
        <span>${done}/${STAGES_PER_CHAPTER}</span>
      </div>
    </div>`;
}

/** Tandai slot tim milik hero yang sedang tampil. */
function markLeadSlot() {
  const slot = S.team.indexOf(leadHeroId);
  $$('#home .strip .slot').forEach((el) => el.classList.toggle('lead', +el.dataset.ts === slot));
  $$('#home .dot').forEach((el, index) => el.classList.toggle('on', teamHeroes()[index]?.id === leadHeroId));
}

function applyLead(hero) {
  const home = $('#home');
  if (!$('#home .stage')) return;
  home.style.setProperty('--c', ELEMENTS[hero.element].color);
  $('#home .kj').innerHTML = kjHtml(hero);
  $('#lead').innerHTML = heroArt(hero);
  $('#home .plate').innerHTML = plateHtml(hero);
  leadHeroId = hero.id;
  markLeadSlot();
}

function swapLead(hero) {
  const home = $('#home');
  if (!$('#home .stage')) return;
  clearTimeout(swapTimer);
  home.classList.add('out');
  swapTimer = setTimeout(() => {
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
    home.classList.remove('out');
  }, SWAP_MS);
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

/** Tim berubah (dari sheet pilih slot): sinkronkan hero utama, titik, dan slot. */
function syncTeamChange() {
  const heroes = teamHeroes();
  if (!heroes.length) return;
  $('#home .dots').innerHTML = dotsHtml(heroes, Math.max(0, heroes.findIndex((h) => h.id === leadHeroId)));
  if (!heroes.some((h) => h.id === leadHeroId)) {
    leadIdx = 0;
    swapLead(heroes[0]);
  } else {
    leadIdx = heroes.findIndex((h) => h.id === leadHeroId);
  }
  markLeadSlot();
  startLeadRotation();
}

/** Paralaks halus mengikuti jari/kursor. Dilewati bila user minta kurangi gerak. */
function initParallax(home) {
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  let frame = 0;
  home.addEventListener('pointermove', (event) => {
    if (frame) return;
    frame = requestAnimationFrame(() => {
      frame = 0;
      const rect = home.getBoundingClientRect();
      const x = ((event.clientX - rect.left) / rect.width - 0.5) * 2;
      const y = ((event.clientY - rect.top) / rect.height - 0.5) * 2;
      home.style.setProperty('--px', x.toFixed(3));
      home.style.setProperty('--py', y.toFixed(3));
    });
  });
  home.addEventListener('pointerleave', () => {
    home.style.setProperty('--px', 0);
    home.style.setProperty('--py', 0);
  });
}

export function initHomeScreen() {
  const home = $('#home');

  new MutationObserver(() => {
    if (!home.classList.contains('on')) needsEnter = true;
  }).observe(home, { attributes: true, attributeFilter: ['class'] });

  // refreshStrips() mengganti elemen .strip; amati agar hero utama ikut sinkron.
  new MutationObserver((mutations) => {
    if (mutations.some((m) => [...m.addedNodes].some((n) => n.classList?.contains('strip')))) syncTeamChange();
  }).observe(home, { childList: true, subtree: true });

  initParallax(home);

  home.addEventListener('click', (event) => {
    const lead = event.target.closest('#lead');
    if (lead) {
      sfx('tap');
      const say = $('#say');
      say.textContent = pick(Math.random, GREETING_LINES);
      say.classList.remove('on');
      void say.offsetWidth;
      say.classList.add('on');
      clearTimeout(say._t);
      say._t = setTimeout(() => say.classList.remove('on'), 1900);
      burst(event.clientX, event.clientY, ELEMENTS[HERO_BY_ID[leadHeroId || S.team[0]].element].color, 18);
      return;
    }

    const button = event.target.closest('button');
    if (!button) return;
    if (button.dataset.lead != null) {
      const heroes = teamHeroes();
      const target = heroes[+button.dataset.lead];
      if (!target || target.id === leadHeroId) return;
      sfx('tap');
      leadIdx = +button.dataset.lead;
      swapLead(target);
      startLeadRotation();
    } else if (button.dataset.pre != null) {
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
  clearTimeout(swapTimer);
  leadIdx = 0;

  const heroes = teamHeroes();
  const hero = heroes[0] || HERO_BY_ID[S.team[0]];
  leadHeroId = hero.id;
  const home = $('#home');
  home.style.setProperty('--c', ELEMENTS[hero.element].color);
  home.classList.toggle('enter', needsEnter);
  needsEnter = false;

  const nextStage = Math.min(S.cl + 1, TOTAL_STAGES);

  home.innerHTML = `
    <div class="bg" aria-hidden="true">
      <div class="aura"></div>
      <div class="rays"></div>
      <div class="kj">${kjHtml(hero)}</div>
      <div class="ring"></div>
      <div class="ring b"></div>
      <div class="embers">${embersHtml()}</div>
    </div>
    <div class="stage">
      <div id="lead">${heroArt(hero)}</div>
      <div class="mist" aria-hidden="true"></div>
      <div class="plate">${plateHtml(hero)}</div>
      <div class="dots">${dotsHtml(heroes, 0)}</div>
      <div class="say" id="say"></div>
    </div>
    <div class="dock">
      ${missionHtml(nextStage)}
      ${teamStripHtml(S)}
      <div class="go">
        <button class="btn pk cta" data-pre="${nextStage}">
          <span class="ct">BERTARUNG</span>
          <span class="chev" aria-hidden="true"><i></i><i></i><i></i></span>
        </button>
      </div>
    </div>
  `;
  markLeadSlot();
  startLeadRotation();
}
