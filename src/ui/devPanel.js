// Panel cheat khusus DEVELOPMENT/testing (diminta user 17 Okt).
// Tombol "DEV" melayang di kanan bawah; panelnya berisi jalan pintas untuk
// menguji fitur tanpa grinding: tambah mata uang, unlock hero, duplikat,
// item acak, buka stage, sampai reset progres. Semua aksi langsung
// menyimpan state dan me-refresh layar aktif.
import { S, save } from '../store.js';
import { HEROES, HERO_BY_ID } from '../data/heroes.js';
import { RARITY } from '../data/rarity.js';
import { ELEMENTS } from '../data/elements.js';
import { WEAPON_KEYS } from '../data/items.js';
import { SAVE_KEY } from '../core/state.js';
import { refresh } from './router.js';
import { toast } from './toast.js';
import { fmt } from '../core/format.js';

function apply(message) {
  save();
  refresh();
  renderStatus();
  toast(message);
}

function randomItem() {
  const roll = Math.random() * 100;
  const rarity = roll < 68 ? 'R' : roll < 95 ? 'SR' : 'SSR';
  const slot = Math.floor(Math.random() * 5);
  const keys = Object.keys(ELEMENTS);
  return {
    u: S.uid++,
    s: slot,
    r: rarity,
    lv: 1,
    e: keys[Math.floor(Math.random() * keys.length)],
    ...(slot === 0 ? { w: WEAPON_KEYS[Math.floor(Math.random() * WEAPON_KEYS.length)] } : {}),
  };
}

const ACTIONS = {
  coins10k: () => { S.k += 10_000; apply('DEV: +10.000 Koin'); },
  coins100k: () => { S.k += 100_000; apply('DEV: +100.000 Koin'); },
  gems1k: () => { S.g += 1_000; apply('DEV: +1.000 Gems'); },
  gems10k: () => { S.g += 10_000; apply('DEV: +10.000 Gems'); },
  unlockHeroes: () => {
    let added = 0;
    for (const hero of HEROES) {
      if (!S.heroes.some((h) => h.id === hero.id)) {
        S.heroes.push({ id: hero.id, lv: 1, st: 1, dp: 0 });
        added++;
      }
    }
    apply(added ? `DEV: ${added} hero dibuka` : 'DEV: semua hero sudah dimiliki');
  },
  dupAll: () => {
    for (const owned of S.heroes) owned.dp = (owned.dp || 0) + 5;
    apply('DEV: +5 duplikat untuk semua hero');
  },
  maxHeroes: () => {
    for (const owned of S.heroes) {
      owned.lv = RARITY[HERO_BY_ID[owned.id].rarity].levelCap;
      owned.st = 6;
    }
    apply('DEV: semua hero Lv maks & ★6');
  },
  items10: () => {
    for (let i = 0; i < 10; i++) S.eq.push(randomItem());
    apply('DEV: +10 item acak');
  },
  unlockStages: () => {
    S.cl = 30;
    for (let i = 0; i < 30; i++) S.stars[i] = 3;
    apply('DEV: semua stage terbuka (bintang 3)');
  },
};

let statusEl = null;
function renderStatus() {
  if (statusEl) {
    statusEl.textContent = `Koin ${fmt(S.k)} · Gems ${fmt(S.g)} · Hero ${S.heroes.length}/${HEROES.length} · Item ${S.eq.length} · Stage ${Math.min(S.cl, 30)}/30`;
  }
}

export function initDevPanel() {
  const button = document.createElement('button');
  button.className = 'devbtn';
  button.textContent = 'DEV';
  document.body.appendChild(button);

  const wrap = document.createElement('div');
  wrap.className = 'devwrap';
  wrap.hidden = true;
  wrap.innerHTML = `
    <div class="devpanel">
      <div class="devhead">
        <b>DEV PANEL</b><span class="devsub">mode testing</span>
        <button class="devclose" aria-label="Tutup">✕</button>
      </div>
      <div class="devstatus"></div>
      <div class="devsec">MATA UANG</div>
      <div class="devgrid">
        <button data-act="coins10k">+10rb Koin</button>
        <button data-act="coins100k">+100rb Koin</button>
        <button data-act="gems1k">+1rb Gems</button>
        <button data-act="gems10k">+10rb Gems</button>
      </div>
      <div class="devsec">HERO</div>
      <div class="devgrid">
        <button data-act="unlockHeroes">Unlock Semua Hero</button>
        <button data-act="dupAll">+5 Duplikat Semua</button>
        <button data-act="maxHeroes" class="wide">Lv &amp; ★ Maks Semua Hero</button>
      </div>
      <div class="devsec">ITEM &amp; MISI</div>
      <div class="devgrid">
        <button data-act="items10">+10 Item Acak</button>
        <button data-act="unlockStages">Buka Semua Stage</button>
      </div>
      <div class="devsec">DATA</div>
      <div class="devgrid">
        <button class="danger wide" id="devReset">Reset Progres</button>
      </div>
    </div>`;
  document.body.appendChild(wrap);
  statusEl = wrap.querySelector('.devstatus');
  renderStatus();

  const toggle = (show) => { wrap.hidden = !show; if (show) renderStatus(); };
  button.addEventListener('click', () => toggle(wrap.hidden));
  wrap.querySelector('.devclose').addEventListener('click', () => toggle(false));
  wrap.addEventListener('click', (event) => { if (event.target === wrap) toggle(false); });

  wrap.querySelectorAll('[data-act]').forEach((el) => {
    el.addEventListener('click', () => ACTIONS[el.dataset.act]());
  });

  // Reset butuh dua tap (anti salah pencet): tap pertama menyiagakan tombol.
  const resetBtn = wrap.querySelector('#devReset');
  let armed = false;
  let armTimer = null;
  resetBtn.addEventListener('click', () => {
    if (!armed) {
      armed = true;
      resetBtn.textContent = 'YAKIN? TAP SEKALI LAGI';
      armTimer = setTimeout(() => { armed = false; resetBtn.textContent = 'Reset Progres'; }, 3000);
      return;
    }
    clearTimeout(armTimer);
    localStorage.removeItem(SAVE_KEY);
    location.reload();
  });
}
