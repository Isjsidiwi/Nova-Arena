import { $, $$, sleep } from '../dom.js';
import { S } from '../../store.js';
import { CHAPTERS, STAGES_PER_CHAPTER, chapterIndexForStage, missionTitle, enemySummary } from '../../data/chapters.js';
import { ELEMENTS } from '../../data/elements.js';
import { ASSETS } from '../../config/assets.js';
import { teamPower } from '../../core/roster.js';
import { battleRewards, battleStars } from '../../core/economy.js';
import { createBattle, ENERGY_MAX } from '../../core/battle/engine.js';
import { makePlayerUnits, makeEnemyUnits } from '../../core/battle/units.js';
import { heroArt, monsterArt, elementBadge } from '../art.js';
import { teamStripHtml } from '../components/teamStrip.js';
import { openTeamPick } from '../sheets/teamPick.js';
import { openSheet } from '../sheet.js';
import { refresh } from '../router.js';
import { refreshHud } from '../hud.js';
import { toast } from '../toast.js';
import { fmt } from '../../core/format.js';
import { sfx } from '../../core/audio.js';

const DELAYS = {
  turnStart: 90,
  lunge: 210,
  bigLunge: 300,
  damage: 330,
  crit: 520,
  heal: 320,
  buff: 320,
  death: 380,
  cutin: 950,
  shake: 260,
  round: 380,
  turnEnd: 60,
};

let battle = null;
let currentStage = 0;
let running = false;
let speed = 1;
let paused = false;
let fightSeq = 0; // token: loop battle lama tidak boleh lanjut setelah restart

/**
 * Muat gambar cut-in seluruh tim di latar sejak sheet persiapan dibuka.
 * Cut-in hanya tampil 950ms saat ult; tanpa preload, browser baru mulai
 * mengunduh file-nya di momen itu juga (dan aset tidak di-cache: no-store)
 * sehingga banner ult muncul kosong.
 */
const preloadedCutins = new Set();
const preloadedCutinImages = []; // referensi ditahan: tanpa ini hasil preload dibuang GC
function preloadCutins() {
  for (const id of S.team) {
    const url = ASSETS.cutin[id];
    if (url && !preloadedCutins.has(url)) {
      preloadedCutins.add(url);
      const img = new Image();
      img.src = url;
      preloadedCutinImages.push(img);
      if (img.decode) img.decode().catch(() => {});
    }
  }
}

/** Sheet persiapan sebelum bertarung: info stage, hadiah, dan tim. */
export function openBattlePrep(stage) {
  preloadCutins();
  const chapterIndex = chapterIndexForStage(stage);
  const chapter = CHAPTERS[chapterIndex];
  const step = ((stage - 1) % STAGES_PER_CHAPTER) + 1;
  const firstClear = stage > S.cl;
  const rewards = battleRewards(stage, true, firstClear);

  const overlay = openSheet(`
    <div class="ttl">MISI ${chapterIndex + 1}-${step}<small>Kekuatan ${fmt(teamPower(S))}</small></div>
    <div class="dm" style="margin-bottom:6px">${missionTitle(stage)} · ${chapter.name}</div>
    <div class="bar">Musuh<b>${enemySummary(stage)}</b></div>
    <div class="bar">Hadiah<b>+${fmt(rewards.coins)} Koin${firstClear ? ` · +${fmt(rewards.gems)} Gems` : ''}</b></div>
    <div class="dm" style="margin-top:10px">Ketuk slot untuk ubah susunan tim:</div>
    ${teamStripHtml(S)}
    <div class="row"><button class="btn pk" id="fightBtn">BERTARUNG</button></div>
  `);

  overlay.querySelector('.sh').addEventListener('click', (event) => {
    const button = event.target.closest('button');
    if (!button) return;

    if (button.dataset.ts != null) {
      sfx('tap');
      openTeamPick(+button.dataset.ts);
      return;
    }

    if (button.id === 'fightBtn') {
      if (!S.team.length) {
        toast('Tim minimal 1 hero');
        return;
      }
      overlay.remove();
      startFight(stage);
    }
  });
}

async function startFight(stage) {
  preloadCutins();
  currentStage = stage;
  speed = 1;
  paused = false;
  running = true;
  const seq = ++fightSeq;
  battle = createBattle({ players: makePlayerUnits(S), enemies: makeEnemyUnits(stage) });

  renderBattleField();
  bindBtClicks();

  for (const event of battle.run()) {
    if (!running || seq !== fightSeq) return;
    await handleEvent(event);
    if (!running || seq !== fightSeq) return;
  }
}

function renderBattleField() {
  const unitHtml = (unit, delay) => {
    const isPlayer = unit.side === 'p';
    return `
      <div class="u ${unit.side} ${unit.boss ? 'bs' : ''}" id="u-${unit.side}-${unit.index}" style="--d:${delay}ms">
        ${elementBadge(unit.element)}
        <div class="a">${isPlayer ? heroArt(unit.hero) : monsterArt(unit.element, unit.boss)}</div>
        <div class="un">${unit.boss ? '👑 ' : ''}${unit.name}</div>
        <div class="b h"><i class="gh" style="width:100%"></i><i class="mn" style="width:100%"></i></div>
        ${isPlayer ? '<div class="b n"><i style="width:0%"></i></div>' : ''}
        ${isPlayer || unit.boss ? `<div class="hpnum">${fmt(unit.hp)}/${fmt(unit.maxHp)}</div>` : ''}
      </div>`;
  };

  const enemyRow = battle.units
    .filter((unit) => unit.side === 'e')
    .map((unit, i) => unitHtml(unit, i * 110))
    .join('');

  const playerRow = battle.units
    .filter((unit) => unit.side === 'p')
    .map((unit, i) => unitHtml(unit, 200 + i * 110))
    .join('');

  const ultBar = battle.units
    .filter((unit) => unit.side === 'p')
    .map((unit) => `<div class="uw"><button class="ult" data-u="${unit.index}" style="--p:${unit.energy}"><div>${heroArt(unit.hero, 'icon')}</div></button><span>${unit.name}</span></div>`)
    .join('');

  const chapterIndex = chapterIndexForStage(currentStage);
  const step = ((currentStage - 1) % STAGES_PER_CHAPTER) + 1;

  const bt = $('#bt');
  bt.style.setProperty('--bc', CHAPTERS[chapterIndex].color + '33');
  bt.classList.add('on');
  bt.innerHTML = `
    <div class="top">
      <div class="rd">RONDE 1<small>MISI ${chapterIndex + 1}-${step}</small></div>
      <div class="spdgrp">
        <button class="sp on" data-spd="1">1x</button>
        <button class="sp" data-spd="2">2x</button>
        <button class="sp" data-spd="4">4x</button>
      </div>
      <button class="sp" id="pauseBtn" style="width:auto;padding:5px 12px">❚❚</button>
      <button class="sp" id="surrender" style="width:auto;padding:5px 12px">SERAH</button>
    </div>
    <div class="tord" id="tord"></div>
    <div class="fld">
      <div class="rw">${enemyRow}</div>
      <div class="rw">${playerRow}</div>
    </div>
    <div class="ub">${ultBar}</div>
    <div id="cut"></div>
    <div class="vs"><b>MISI ${chapterIndex + 1}-${step}</b><small>${missionTitle(currentStage)}</small></div>
    <div aria-hidden="true" style="position:absolute;left:0;bottom:0;width:100%;height:30%;opacity:0;pointer-events:none;overflow:hidden">${battle.units
      .filter((unit) => unit.side === 'p' && ASSETS.cutin[unit.hero.id])
      .map((unit) => heroArt(unit.hero, 'cutin'))
      .join('')}</div>
  `;
  renderTurnOrder(null);
}

/** Strip urutan giliran (SPD tertinggi dulu); unit aktif bercincin emas. */
function renderTurnOrder(activeUnit) {
  const strip = $('#tord');
  if (!strip || !battle) return;
  const order = battle.units
    .filter((unit) => unit.alive)
    .sort((a, b) => b.spd - a.spd);
  strip.innerHTML = order
    .map((unit) => {
      const active = activeUnit && unit.side === activeUnit.side && unit.index === activeUnit.index;
      const face =
        unit.side === 'p'
          ? heroArt(unit.hero, 'icon')
          : `<span class="tglyph" style="color:${ELEMENTS[unit.element].color}">${ELEMENTS[unit.element].glyph}</span>`;
      return `<span class="ti ${unit.side} ${active ? 'act' : ''}" title="${unit.name}">${face}</span>`;
    })
    .join('');
}

function bindBtClicks() {
  const bt = $('#bt');
  bt.onclick = (event) => {
    const button = event.target.closest('button');
    if (!button) return;
    if (paused) return; // saat jeda, hanya tombol overlay jeda yang aktif

    if (button.id === 'pauseBtn') {
      pauseFight();
      return;
    }

    if (button.dataset.spd) {
      speed = +button.dataset.spd;
      $$('#bt .top [data-spd]').forEach((b) => b.classList.toggle('on', b === button));
      return;
    }
    if (button.id === 'surrender') {
      if (running) surrenderFight();
      return;
    }
    if (button.dataset.u != null && running) toggleUlt(+button.dataset.u);
  };
}

/**
 * Tunggu ms (diskalakan kecepatan) yang SADAR JEDA: selama paused, waktu
 * tidak berjalan. Polling per 30ms; berhenti total bila battle berakhir.
 */
async function rest(ms) {
  const target = ms / speed;
  let elapsed = 0;
  let last = performance.now();
  while (elapsed < target) {
    if (!running) return;
    await sleep(30);
    const now = performance.now();
    if (!paused) elapsed += now - last;
    last = now;
  }
}

const unitEl = (unit) => document.getElementById(`u-${unit.side}-${unit.index}`);

async function handleEvent(event) {
  switch (event.type) {
    case 'round': {
      const roundLabel = $('#bt .rd');
      if (roundLabel) roundLabel.innerHTML = `RONDE ${event.round}<small>MISI ${chapterIndexForStage(currentStage) + 1}-${((currentStage - 1) % STAGES_PER_CHAPTER) + 1}</small>`;
      renderTurnOrder(null);
      await rest(DELAYS.round);
      break;
    }
    case 'turnStart':
      unitEl(event.unit)?.classList.add('act');
      renderTurnOrder(event.unit);
      updateUnitBars();
      await rest(DELAYS.turnStart);
      break;
    case 'lunge':
      await lunge(event.unit, event.big);
      break;
    case 'ult':
      await playCutin(event.unit);
      break;
    case 'damage':
      showDamage(event);
      await rest(event.crit ? DELAYS.crit : DELAYS.damage);
      break;
    case 'heal':
      showPopup(event.target, `+${fmt(event.amount)}`, '#3dff9a');
      sfx('tap');
      updateUnitBars();
      await rest(DELAYS.heal);
      break;
    case 'buff':
      showPopup(event.target, 'ATK +30%', '#ffd76a');
      sfx('tap');
      await rest(DELAYS.buff);
      break;
    case 'death':
      unitEl(event.unit)?.classList.add('dead');
      renderTurnOrder(null);
      sfx('hit');
      updateUnitBars();
      await rest(DELAYS.death);
      break;
    case 'shake':
      shakeScreen();
      await rest(DELAYS.shake);
      break;
    case 'turnEnd':
      unitEl(event.unit)?.classList.remove('act');
      updateUnitBars();
      await rest(DELAYS.turnEnd);
      break;
    case 'end':
      await handleEnd(event);
      break;
  }
}

async function lunge(unit, big) {
  const art = unitEl(unit)?.querySelector('.a');
  if (art) {
    const direction = unit.side === 'p' ? -1 : 1;
    art.animate(
      big
        ? [{ transform: `translateY(${direction * 42}px) scale(1.06)` }, {}]
        : [{ transform: `translateY(${direction * 22}px)` }, {}],
      { duration: (big ? DELAYS.bigLunge : DELAYS.lunge), easing: 'ease-out' },
    );
  }
  await rest(big ? DELAYS.bigLunge : DELAYS.lunge);
}

function showPopup(unit, text, color, big = false) {
  const el = unitEl(unit);
  if (!el) return;
  const popup = document.createElement('span');
  popup.className = 'pp';
  popup.style.color = color;
  if (big) popup.style.fontSize = '30px';
  popup.textContent = text;
  el.appendChild(popup);
  setTimeout(() => popup.remove(), 1000);
}

function showDamage(event) {
  const color = event.crit
    ? '#ffd76a'
    : event.elementMultiplier > 1
      ? '#7dffb0'
      : event.elementMultiplier < 1
        ? '#8f9bd4'
        : '#fff';
  const tag = event.crit ? 'KRITIS!' : event.elementMultiplier > 1 ? 'LEMAH!' : event.elementMultiplier < 1 ? 'DITAHAN' : '';
  const el = unitEl(event.target);
  if (el) {
    const popup = document.createElement('span');
    popup.className = 'pp';
    popup.style.color = color;
    if (event.crit) popup.style.fontSize = '32px';
    popup.innerHTML = `${tag ? `<small class="ptag">${tag}</small>` : ''}-${fmt(event.amount)}${event.crit ? '!' : ''}`;
    el.appendChild(popup);
    setTimeout(() => popup.remove(), 1000);
  }
  unitEl(event.target)?.animate(
    [{ filter: 'brightness(2.5) saturate(0)' }, {}],
    { duration: 220 },
  );
  sfx('hit');
  updateUnitBars();
}

async function playCutin(unit) {
  const cut = $('#cut');
  if (!cut) return;
  const hasAsset = !!ASSETS.cutin[unit.hero.id];
  cut.style.setProperty('--c', ELEMENTS[unit.element].color);
  cut.innerHTML = `${heroArt(unit.hero, 'cutin')}<b class="${hasAsset ? 'cb' : ''}">${unit.hero.name}<small>${unit.hero.ult.name}</small></b>`;
  cut.classList.add('on');
  sfx('ult');
  shakeScreen();
  await rest(DELAYS.cutin);
  if (!cut.isConnected) return;
  cut.classList.remove('on');
  cut.innerHTML = '';
}

function shakeScreen() {
  const bt = $('#bt');
  bt.classList.remove('shake');
  void bt.offsetWidth;
  bt.classList.add('shake');
}

function toggleUlt(index) {
  const unit = battle.units.find((u) => u.side === 'p' && u.index === index);
  if (!unit || !unit.alive || unit.energy < ENERGY_MAX) return;
  unit.queued = !unit.queued;
  sfx('tap');
  updateUltButtons();
}

function updateUnitBars() {
  for (const unit of battle.units) {
    const el = unitEl(unit);
    if (!el) continue;
    const pct = Math.max(0, (unit.hp / unit.maxHp) * 100);
    const main = el.querySelector('.b.h .mn');
    if (main) main.style.width = `${pct}%`;
    const ghost = el.querySelector('.b.h .gh');
    if (ghost) ghost.style.width = `${pct}%`;
    const num = el.querySelector('.hpnum');
    if (num) num.textContent = `${fmt(Math.max(0, unit.hp))}/${fmt(unit.maxHp)}`;
    el.classList.toggle('low', unit.alive && pct <= 30);
  }
  updateUltButtons();
}

function updateUltButtons() {
  for (const unit of battle.units) {
    if (unit.side !== 'p') continue;
    const button = $(`#bt .ult[data-u="${unit.index}"]`);
    if (!button) continue;
    const ready = unit.alive && unit.energy >= ENERGY_MAX;
    button.classList.toggle('dead', !unit.alive);
    button.classList.toggle('rdy', ready && !unit.queued);
    button.classList.toggle('qd', ready && unit.queued);
    button.style.setProperty('--p', Math.min(100, unit.energy));
  }
}

async function handleEnd(event) {
  running = false;
  const win = event.win;
  const firstClear = win && currentStage > S.cl;
  const stars = battleStars(win, event.deadCount);
  const rewards = battleRewards(currentStage, win, firstClear);

  S.k += rewards.coins;
  if (rewards.gems) S.g += rewards.gems;
  if (win) {
    S.stars[currentStage] = Math.max(S.stars[currentStage] || 0, stars);
    if (currentStage > S.cl) S.cl = currentStage;
  }
  refreshHud();
  sfx(win ? 'win' : 'lose');

  const starHtml = [1, 2, 3]
    .map((index) => `<span class="${index <= stars ? 'f' : ''}">★</span>`)
    .join('');

  const overlay = document.createElement('div');
  overlay.className = 'ov';
  overlay.style.zIndex = 80;
  overlay.innerHTML = `
    <div class="res" style="--c:${win ? '#3dff9a' : '#ff3d6e'};margin:auto">
      <h1>${win ? 'MENANG' : 'KALAH'}</h1>
      ${win ? `<div class="stars">${starHtml}</div>` : `<p class="dm">${event.reason || 'Coba lagi!'}</p>`}
      <p>+${fmt(rewards.coins)} Koin</p>
      ${rewards.gems ? `<p style="color:var(--cy)">+${fmt(rewards.gems)} Gems (first clear)</p>` : ''}
      <div class="row"><button class="btn pk" id="btNext">LANJUT</button></div>
    </div>`;
  $('#bt').appendChild(overlay);

  await new Promise((resolve) => {
    overlay.querySelector('#btNext').onclick = resolve;
  });

  hideBattle();
  refresh();
}

/* ================= JEDA BATTLE ================= */

function pauseFight() {
  if (!running || paused) return;
  paused = true;
  sfx('tap');
  // Bekukan animasi WAAPI yang sedang berjalan di arena.
  $('#bt').getAnimations({ subtree: true }).forEach((a) => a.pause());

  const overlay = document.createElement('div');
  overlay.className = 'ov pov';
  overlay.innerHTML = `
    <div class="pbox">
      <h2>JEDA</h2>
      <p class="dm">Misi ${chapterIndexForStage(currentStage) + 1}-${((currentStage - 1) % STAGES_PER_CHAPTER) + 1} · Ronde ${battle ? battle.round : 1}</p>
      <button class="btn cy" id="resumeBtn">LANJUTKAN</button>
      <button class="btn gh" id="restartBtn">ULANGI MISI</button>
      <button class="btn gh" id="quitBtn">SERAH & KELUAR</button>
    </div>`;
  $('#bt').appendChild(overlay);

  overlay.querySelector('#resumeBtn').onclick = () => resumeFight();
  overlay.querySelector('#restartBtn').onclick = () => {
    overlay.remove();
    paused = false;
    running = false;
    battle.abort();
    startFight(currentStage);
  };
  overlay.querySelector('#quitBtn').onclick = () => {
    overlay.remove();
    paused = false;
    surrenderFight();
  };
}

function resumeFight() {
  if (!paused) return;
  paused = false;
  sfx('tap');
  $('#bt').querySelector('.pov')?.remove();
  $('#bt').getAnimations({ subtree: true }).forEach((a) => a.play());
}

// Tab disembunyikan / aplikasi berpindah -> jeda otomatis.
document.addEventListener('visibilitychange', () => {
  if (document.hidden && running && !paused) pauseFight();
});

function surrenderFight() {
  battle.abort();
  running = false;
  paused = false;
  hideBattle();
  sfx('lose');
  toast('Kamu menyerah.');
  refresh();
}

function hideBattle() {
  paused = false;
  const bt = $('#bt');
  bt.classList.remove('on', 'shake');
  bt.innerHTML = '';
  bt.onclick = null;
}
