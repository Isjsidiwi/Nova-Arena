import { HERO_BY_ID } from '../../data/heroes.js';
import {
  CHAPTERS,
  MOB_NAMES,
  chapterIndexForStage,
  isBossStage,
  isEliteStage,
  stageScaling,
  enemyCount,
} from '../../data/chapters.js';
import { computeStats } from '../stats.js';
import { bonusFor } from '../equipment.js';

/** Unit pemain dari tim aktif, lengkap dengan statistik + bonus item. */
export function makePlayerUnits(state) {
  return state.team.map((id, index) => {
    const hero = HERO_BY_ID[id];
    const owned = state.heroes.find((h) => h.id === id);
    const stats = computeStats(hero, owned.lv, bonusFor(state, id));
    return {
      side: 'p',
      index,
      id,
      hero,
      level: owned.lv,
      element: hero.element,
      name: hero.name,
      ...stats,
    };
  });
}

/** Susunan musuh untuk sebuah stage (boss di tengah pada stage boss, elite di stage elite). */
export function makeEnemyUnits(stage) {
  const chapter = CHAPTERS[chapterIndexForStage(stage)];
  const boss = isBossStage(stage);
  const elite = isEliteStage(stage);
  const scale = stageScaling(stage);
  const count = enemyCount(stage);
  const units = [];

  for (let i = 0; i < count; i++) {
    const isBoss = boss && i === Math.floor(count / 2);
    const isElite = elite && i === Math.floor(count / 2);
    const element = isBoss ? chapter.bossElement : chapter.elements[i % 3];
    const base = isBoss
      ? [2600, 170, 105, 100]
      : isElite
        ? [1400, 120, 72, 96 + i * 8]
        : [650, 85, 50, 90 + i * 8];
    units.push({
      side: 'e',
      index: i,
      element,
      boss: isBoss || isElite,
      elite: isElite,
      name: isBoss ? chapter.boss : isElite ? 'Elit ' + MOB_NAMES[element] : MOB_NAMES[element],
      hp: Math.round(base[0] * scale),
      atk: Math.round(base[1] * (1 + .14 * (stage - 1))),
      def: Math.round(base[2] * (1 + .1 * (stage - 1))),
      spd: base[3],
    });
  }

  return units;
}
