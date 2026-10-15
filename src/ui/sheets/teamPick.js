import { S } from '../../store.js';
import { HERO_BY_ID } from '../../data/heroes.js';
import { sortedOwned } from '../../core/roster.js';
import { openSheet } from '../sheet.js';
import { heroCard } from '../components/cards.js';
import { refreshStrips } from '../components/teamStrip.js';
import { refreshHud } from '../hud.js';
import { sfx } from '../../core/audio.js';

/** Sheet pemilihan hero untuk satu slot tim. */
export function openTeamPick(slotIndex) {
  const currentId = S.team[slotIndex];
  const heroes = sortedOwned(S);

  const overlay = openSheet(`
    <div class="ttl">SLOT ${slotIndex + 1}<small>${currentId ? HERO_BY_ID[currentId].name : 'Kosong'}</small></div>
    <div class="dm">Pilih hero untuk slot ini</div>
    ${currentId && S.team.length > 1 ? '<div class="row"><button class="btn gh" id="clearSlot">KOSONGKAN SLOT</button></div>' : ''}
    <div class="hg" style="margin-top:12px">${heroes
      .map((owned) => heroCard(HERO_BY_ID[owned.id], owned, S.team.includes(owned.id) ? 'in' : ''))
      .join('')}</div>
  `);

  overlay.querySelector('.sh').addEventListener('click', (event) => {
    const button = event.target.closest('button');
    if (!button) return;

    if (button.id === 'clearSlot') {
      S.team.splice(slotIndex, 1);
      sfx('tap');
      overlay.remove();
      refreshStrips(S);
      refreshHud();
      return;
    }

    const card = button.closest('.hc');
    if (!card || !card.dataset.id) return;

    const id = card.dataset.id;
    const existing = S.team.indexOf(id);
    if (existing !== slotIndex) {
      if (slotIndex < S.team.length) {
        if (existing >= 0) S.team[existing] = S.team[slotIndex];
        S.team[slotIndex] = id;
      } else {
        if (existing >= 0) S.team.splice(existing, 1);
        S.team.push(id);
      }
    }
    sfx('tap');
    overlay.remove();
    refreshStrips(S);
    refreshHud();
  });
}
