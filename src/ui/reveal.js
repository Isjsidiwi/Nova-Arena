// Urutan pembukaan hasil summon di overlay #rv.
import { $, sleep } from './dom.js';
import { RARITY } from '../data/rarity.js';
import { ELEMENTS } from '../data/elements.js';
import { RARITY_PREFIX, SLOT_NAMES } from '../data/items.js';
import { itemText, itemName } from '../core/equipment.js';
import { heroArt, itemArt, elementBadge, rarityBadge } from './art.js';
import { heroCard, itemCard } from './components/cards.js';
import { S } from '../store.js';
import { burst, spawnParticle } from './particles.js';
import { sfx } from '../core/audio.js';
import { fmt } from '../core/format.js';

const INTRO_DURATION = { R: .45, SR: 1.1, SSR: 2 };
const BURST_COUNT = { R: 20, SR: 50, SSR: 110 };
const BURST_SPREAD = { R: 4, SR: 7, SSR: 11 };
const GOLD_COLORS = ['#ffd76a', '#fff3b3', '#ffb347'];

/** Tampilkan seluruh hasil summon, lalu ringkasan. Selesai setelah pemain menutup. */
export async function showReveal(results) {
  const rv = $('#rv');
  rv.classList.add('on');
  let skip = false;

  for (const result of results) {
    if (skip) break;
    await playIntro(rv, result.rarity);
    sfx(result.rarity === 'R' ? 'tap' : 'win');
    renderResultCard(rv, result, results.length > 1);

    const rect = rv.getBoundingClientRect();
    burst(
      rect.left + rect.width / 2,
      rect.top + rect.height * .42,
      RARITY[result.rarity].color,
      BURST_COUNT[result.rarity],
      BURST_SPREAD[result.rarity],
    );

    const rain = result.rarity === 'SSR' ? startGoldenRain() : 0;
    await waitForAdvance(rv, () => { skip = true; });
    clearInterval(rain);
  }

  if (results.length > 1) await showSummary(rv, results);

  rv.classList.remove('on');
  rv.onclick = null;
  rv.innerHTML = '';
}

async function playIntro(rv, rarity) {
  const color = RARITY[rarity].color;
  const duration = INTRO_DURATION[rarity];
  rv.innerHTML =
    (rarity !== 'R' ? `<div class="ray ${rarity}" style="--c:${color}"></div>` : '') +
    `<div class="orb" style="--c:${color};--d:${duration}s"></div>`;

  if (rarity !== 'R') rv.classList.add('trem');
  if (rarity === 'SSR') {
    const rect = $('#st').getBoundingClientRect();
    for (let i = 1; i <= 4; i++) {
      setTimeout(() => burst(rect.left + rect.width / 2, rect.top + rect.height / 2, '#ffd76a', 14, 3 + i * 2), i * 400);
    }
  }
  await sleep(duration * 1000);
  rv.classList.remove('trem');
}

function renderResultCard(rv, result, allowSkip) {
  const isItem = result.kind === 'item';
  const color = RARITY[result.rarity].color;
  const name = isItem ? itemName(result.item) : result.hero.name;
  const accent = isItem ? color : ELEMENTS[result.hero.element].color;
  const subtitle = isItem ? itemText(result.item) : `${elementBadge(result.hero.element)} ${result.hero.title}`;
  const dupText = isItem
    ? 'ITEM BARU!'
    : result.duplicate
      ? result.star
        ? result.star.canUpgrade
          ? `Duplikat tersimpan · ${result.star.dupes} duplikat — cukup untuk NAIK BINTANG!`
          : `Duplikat tersimpan · saldo ${result.star.dupes}/${result.star.nextCost} ke ★${result.star.stars + 1}`
        : `Duplikat · Bintang maks · +${fmt(result.coins)} Koin`
      : 'HERO BARU!';

  rv.innerHTML = `
    <div class="flash" style="--c:${result.rarity === 'R' ? color : '#fff'}"></div>
    ${allowSkip ? '<button class="skp" id="revealSkip">LEWATI ▶▶</button>' : ''}
    <div class="ray ${result.rarity}" style="--c:${color}"></div>
    ${result.rarity !== 'R' ? `<div class="rg" style="--c:${color}"></div><div class="rg" style="--c:${color};animation-delay:.25s"></div>` : ''}
    ${result.rarity === 'SSR' ? '<div class="big">SSR</div>' : ''}
    <div class="rc ${result.rarity}" style="--r:${color};--c:${accent}">
      ${rarityBadge(result.rarity)}
      ${isItem ? itemArt(result.item) : heroArt(result.hero)}
      <div class="nm"><b>${name}</b>${subtitle}</div>
    </div>
    <p style="margin-top:22px;font-size:18px;color:${result.duplicate ? 'var(--dm)' : 'var(--au)'}">${dupText}</p>
    <p class="dm" style="margin-top:8px">Ketuk untuk lanjut</p>
  `;
}

function waitForAdvance(rv, onSkip) {
  return new Promise((resolve) => {
    rv.onclick = resolve;
    const skipButton = rv.querySelector('#revealSkip');
    if (skipButton) {
      skipButton.addEventListener('click', (event) => {
        event.stopPropagation();
        onSkip();
        resolve();
      });
    }
  });
}

function startGoldenRain() {
  const canvas = $('#fx');
  return setInterval(() => {
    for (let i = 0; i < 3; i++) {
      spawnParticle({
        x: Math.random() * canvas.width,
        y: -4,
        vx: -.4 + Math.random() * .8,
        vy: 1.5 + Math.random() * 2,
        life: 3,
        color: GOLD_COLORS[Math.floor(Math.random() * GOLD_COLORS.length)],
        size: 2 + Math.random() * 3,
      });
    }
  }, 50);
}

async function showSummary(rv, results) {
  rv.innerHTML = `
    <div class="mini">${results.map((result) => (result.kind === 'item' ? itemCard(result.item) : heroCard(result.hero, S.heroes.find((h) => h.id === result.hero.id) || null))).join('')}</div>
    <button class="btn" id="revealOk" style="margin-top:24px">OKE</button>
  `;
  await new Promise((resolve) => {
    rv.querySelector('#revealOk').onclick = resolve;
  });
}
