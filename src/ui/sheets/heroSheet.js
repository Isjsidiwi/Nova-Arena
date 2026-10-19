import { S } from '../../store.js';
import { HERO_BY_ID, describeAction } from '../../data/heroes.js';
import { RARITY } from '../../data/rarity.js';
import { ELEMENTS } from '../../data/elements.js';
import { SLOT_NAMES, RARITY_PREFIX, WEAPON_TYPES } from '../../data/items.js';
import { getOwned, isInTeam, heroStats, toggleTeam, tryLevelUp } from '../../core/roster.js';
import { starProgress, tryStarUp, MAX_STAR } from '../../core/stars.js';
import { heroLevelCost, itemUpgradeCost } from '../../core/economy.js';
import {
  equippedFor,
  itemTextFor,
  itemName,
  affinityNotes,
  itemsForSlot,
  equip,
  ownerOf,
  findItem,
  tryUpgradeItem,
} from '../../core/equipment.js';
import { openSheet } from '../sheet.js';
import { disableSheetAnimation, $ } from '../dom.js';
import { levelUpFx } from '../effects.js';
import { heroArt, elementBadge, itemArt } from '../art.js';
import { itemCard } from '../components/cards.js';
import { refreshStrips } from '../components/teamStrip.js';
import { refresh } from '../router.js';
import { refreshHud } from '../hud.js';
import { toast } from '../toast.js';
import { fmt } from '../../core/format.js';
import { sfx } from '../../core/audio.js';

/**
 * Sheet detail hero: statistik, equipment, skill, naik level, tim.
 * previousStats menampilkan selisih stat setelah naik level.
 * noAnim mematikan animasi sheet (saat dibuka ulang).
 */
export function openHeroSheet(id, previousStats = null, noAnim = false, fxText = null) {
  const hero = HERO_BY_ID[id];
  const owned = getOwned(S, id);
  if (!owned) return toast('Belum dimiliki. Dapatkan lewat Summon!');

  const stats = heroStats(S, id);
  const cost = heroLevelCost(hero, owned.lv);
  const inTeam = isInTeam(S, id);
  const levelCap = RARITY[hero.rarity].levelCap;
  const color = RARITY[hero.rarity].color;
  const items = equippedFor(S, id);

  const statBar = (label, key) => {
    const delta = previousStats && stats[key] > previousStats[key]
      ? ` <span style="color:#3dff9a">+${fmt(stats[key] - previousStats[key])}</span>`
      : '';
    return `<div class="bar">${label}<b>${fmt(stats[key])}${delta}</b></div>`;
  };

  const overlay = openSheet(`
    <div class="hd">
      <div class="pt ${hero.rarity} ${inTeam ? 'in' : ''}" style="--r:${color};--c:${ELEMENTS[hero.element].color}">${heroArt(hero)}</div>
      <div style="flex:1">
        <div class="dm">${hero.title}</div>
        <h2>${hero.name}</h2>
        <div style="margin:6px 0;display:flex;align-items:center;gap:6px">${elementBadge(hero.element)}<span>${ELEMENTS[hero.element].name} · ${hero.role} · ${WEAPON_TYPES[hero.weapon] || ''} · <span style="color:${color}">${hero.rarity}</span></span></div>
        <div class="bar">Level<b>${owned.lv}/${levelCap}</b></div>
        <div class="bar">Bintang<b style="color:#ffd76a">${'★'.repeat(starProgress(owned).stars)}<span style="color:#3a4170">${'★'.repeat(MAX_STAR - starProgress(owned).stars)}</span></b></div>
        <div class="bar">Duplikat<b>${starProgress(owned).dupes} tersimpan</b></div>
        ${statBar('HP', 'hp')}${statBar('ATK', 'atk')}${statBar('DEF', 'def')}${statBar('SPD', 'spd')}
        <div class="bar">Koin<b>${fmt(S.k)}</b></div>
      </div>
    </div>
    <div class="eqs">${[0, 1, 2, 3, 4]
      .map((slot) => {
        const item = items[slot];
        const effNegative = item && affinityNotes(item, hero).some((n) => n.kind === 'bad');
        return `<button class="es" data-sl="${slot}" style="--r:${item ? RARITY[item.r].color : '#2a3470'}">${item ? itemArt(item) : '+'}<em>${item ? `<span style="color:${effNegative ? '#ff8a8a' : '#7dffb0'}">${itemTextFor(item, hero)}</span>` : SLOT_NAMES[slot]}</em></button>`;
      })
      .join('')}</div>
    <div class="sk"><b>${hero.skill.name}</b><br>${describeAction(hero.skill.type, hero.skill.mult, false)}</div>
    <div class="sk ul"><b>ULT · ${hero.ult.name}</b><br>${describeAction(hero.ult.type, hero.ult.mult, true)}</div>
    <div class="row">
      <button class="btn cy" id="levelUp" ${owned.lv >= levelCap ? 'disabled' : ''}>NAIK LEVEL · ${fmt(cost)}</button>
      <button class="btn ${inTeam ? 'gh' : 'pk'}" id="teamToggle">${inTeam ? 'KELUARKAN' : 'MASUK TIM'}</button>
    </div>
    <div class="row" style="margin-top:8px">
      <button class="btn" id="starUp" ${starProgress(owned).canUpgrade ? '' : 'disabled'}>${starProgress(owned).maxed ? '★ BINTANG MAKSIMUM' : starProgress(owned).canUpgrade ? `NAIK BINTANG KE ★${starProgress(owned).stars + 1} · ${starProgress(owned).nextCost} DUPLIKAT` : `NAIK BINTANG · DUPLIKAT ${starProgress(owned).dupes}/${starProgress(owned).nextCost}`}</button>
    </div>
  `);

  if (noAnim) disableSheetAnimation(overlay);
  if (previousStats) levelUpFx(overlay.querySelector('.pt'), fxText || 'LEVEL UP! Lv' + owned.lv, '#ffd76a');

  overlay.querySelectorAll('.es').forEach((button) => {
    button.addEventListener('click', () => {
      sfx('tap');
      openSlotPicker(id, +button.dataset.sl, overlay);
    });
  });

  overlay.querySelector('#levelUp').addEventListener('click', () => {
    const result = tryLevelUp(S, id);
    if (!result.ok) {
      toast(result.reason === 'max' ? 'Level maksimum' : `Koin tidak cukup · butuh ${fmt(cost)}`);
      return;
    }
    overlay.remove();
    openHeroSheet(id, stats, true);
    refresh();
  });

  overlay.querySelector('#starUp').addEventListener('click', () => {
    const result = tryStarUp(owned);
    if (!result.ok) {
      toast(result.reason === 'max' ? 'Bintang sudah maksimum' : 'Duplikat belum cukup');
      return;
    }
    overlay.remove();
    openHeroSheet(id, stats, true, `BINTANG ★${result.stars}!`);
    refresh();
    refreshHud();
  });

  overlay.querySelector('#teamToggle').addEventListener('click', () => {
    const result = toggleTeam(S, id);
    if (!result.ok) {
      toast(result.reason === 'min' ? 'Tim minimal 1 hero' : 'Tim penuh (5). Keluarkan hero lain dulu');
      return;
    }
    sfx('tap');
    overlay.remove();
    refresh();
    refreshStrips(S);
  });
}

/** Sheet pemilihan item untuk satu slot equipment hero. */
function openSlotPicker(heroId, slot, parentOverlay) {
  const hero = HERO_BY_ID[heroId];
  const slotList = (S.lo[heroId] = S.lo[heroId] || [null, null, null, null, null]);
  while (slotList.length < 5) slotList.push(null);

  const currentItem = slotList[slot] != null ? findItem(S, slotList[slot]) : null;
  const candidates = itemsForSlot(S, slot, { heroId, excludeUid: currentItem ? currentItem.u : -1 });

  const overlay = openSheet(`
    <div class="ttl">${SLOT_NAMES[slot].toUpperCase()}<small>${hero.name}</small></div>
    ${currentItem
      ? `<div class="sk">Terpasang: <b>${itemName(currentItem)} Lv${currentItem.lv}</b> <span style="color:${affinityNotes(currentItem, hero).some((n) => n.kind === 'bad') ? '#ff8a8a' : '#7dffb0'}">${itemTextFor(currentItem, hero)}</span>${affinityNotes(currentItem, hero).map((n) => `<div class="anote ${n.kind}">${n.label}</div>`).join('')}</div>
         <div class="row"><button class="btn cy" id="upgradeEquipped">UPGRADE · ${fmt(itemUpgradeCost(currentItem))}</button><button class="btn gh" id="unequipSlot">LEPAS</button></div>`
      : ''}
    <div class="hg" style="margin-top:12px">${candidates
      .map((item) => {
        const owner = ownerOf(S, item.u, heroId);
        const bad = affinityNotes(item, hero).some((n) => n.kind === 'bad');
        const tags =
          `<span class="tg" style="background:${bad ? '#5a1626' : '#14532d'}">Untuk ${hero.name}: ${itemTextFor(item, hero)}</span>` +
          (owner ? `<span class="tg">Dipakai ${HERO_BY_ID[owner].name}</span>` : '');
        return itemCard(item).replace('</button>', `${tags}</button>`);
      })
      .join('')}</div>
    ${candidates.length ? '' : `<div class="dm" style="margin-top:10px">Tidak ada item ${SLOT_NAMES[slot]} lain. Dapatkan lewat Summon Item.</div>`}
  `);

  const backToHero = () => {
    overlay.remove();
    parentOverlay.remove();
    openHeroSheet(heroId, null, true);
    refreshHud();
  };

  overlay.querySelector('.sh').addEventListener('click', (event) => {
    const button = event.target.closest('button');
    if (!button) return;

    if (button.id === 'unequipSlot') {
      slotList[slot] = null;
      sfx('tap');
      backToHero();
      return;
    }

    if (button.id === 'upgradeEquipped') {
      const result = tryUpgradeItem(S, currentItem.u);
      if (!result.ok) {
        toast(result.reason === 'max' ? 'Level maksimum' : `Koin tidak cukup · butuh ${fmt(itemUpgradeCost(currentItem))}`);
        return;
      }
      sfx('tap');
      overlay.remove();
      parentOverlay.remove();
      openHeroSheet(heroId, null, true);
      refresh();
      levelUpFx($(`#ovr .es:nth-child(${slot + 1})`), 'UPGRADE! Lv' + currentItem.lv, RARITY[currentItem.r].color);
      return;
    }

    const card = button.closest('.hc.ic');
    if (!card) return;
    const uid = Number(card.dataset.iu);
    const owner = ownerOf(S, uid, heroId);
    const item = findItem(S, uid);

    const applyEquip = () => {
      equip(S, heroId, slot, uid);
      sfx('tap');
      backToHero();
    };

    if (!owner) return applyEquip();

    const confirm = openSheet(`
      <div class="ttl">PINDAHKAN ITEM?</div>
      <div class="dm" style="font-size:15px;line-height:1.45"><b style="color:${RARITY[item.r].color}">${RARITY_PREFIX[item.r]} ${SLOT_NAMES[item.s]}</b> sedang dipakai <b style="color:var(--pk)">${HERO_BY_ID[owner].name}</b>. Jika dipindahkan ke <b style="color:var(--cy)">${hero.name}</b>, slot ${SLOT_NAMES[slot]} milik ${HERO_BY_ID[owner].name} akan menjadi kosong. Yakin ingin menggantinya?</div>
      <div class="row"><button class="btn gh" id="cancelMove">BATAL</button><button class="btn pk" id="confirmMove">YA, PINDAHKAN</button></div>
    `);
    confirm.querySelector('#cancelMove').addEventListener('click', () => confirm.remove());
    confirm.querySelector('#confirmMove').addEventListener('click', () => {
      confirm.remove();
      applyEquip();
    });
  });
}
