import { $, $$, sleep } from './dom.js';
import { sfx } from '../core/audio.js';
import { refreshHud } from './hud.js';

const NAV_ITEMS = [
  ['home', 'BERANDA', '<path d="M3 11 12 3l9 8v10h-6v-6H9v6H3z"/>'],
  ['hero', 'HERO', '<circle cx="12" cy="8" r="4"/><path d="M4 21c0-5 4-7 8-7s8 2 8 7z"/>'],
  ['gacha', 'SUMMON', '<path d="m12 2 3 7 7 .6-5.3 4.7 1.7 7.2L12 17.8 5.6 21.5l1.7-7.2L2 9.6 9 9z"/>'],
  ['stage', 'MISI', '<path d="M4 20 18 6l2 2L6 22zM14 4h6v6z"/>'],
];

const screens = {};
let current = 'home';

/** Daftarkan layar utama (punya elemen <section class="sc">). */
export function registerScreen(id, screen) {
  screens[id] = screen;
}

export function initNav() {
  $('#nav').innerHTML = NAV_ITEMS.map(
    ([id, label, icon]) => `<button data-s="${id}"><svg viewBox="0 0 24 24">${icon}</svg>${label}</button>`,
  ).join('');
  $('#nav').addEventListener('click', (event) => {
    const button = event.target.closest('button');
    if (button) go(button.dataset.s);
  });
}

/** Pindah layar dengan transisi wipe. */
export async function go(id) {
  if (id === current && $('#' + id).classList.contains('on')) return;
  sfx('tap');

  const wipe = $('#wp');
  wipe.animate(
    [
      { transform: 'translateX(-130%) skewX(-14deg)' },
      { transform: 'translateX(0) skewX(-14deg)' },
    ],
    { duration: 200, fill: 'forwards' },
  );
  await sleep(200);

  current = id;
  $$('.sc').forEach((section) => section.classList.toggle('on', section.id === id));
  $$('#nav button').forEach((button) => button.classList.toggle('on', button.dataset.s === id));
  screens[id].render();
  refreshHud();

  wipe.animate(
    [
      { transform: 'translateX(0) skewX(-14deg)' },
      { transform: 'translateX(130%) skewX(-14deg)' },
    ],
    { duration: 260, fill: 'forwards' },
  );
}

/** Render ulang layar yang sedang aktif (setelah state berubah dari sheet/battle). */
export function refresh() {
  screens[current].render();
  refreshHud();
}

export const currentScreen = () => current;
