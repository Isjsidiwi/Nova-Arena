import { describe, expect, it } from 'vitest';
import {
  CHAPTERS,
  ELITE_STEP,
  MISSION_NAMES,
  STAGES_PER_CHAPTER,
  TOTAL_STAGES,
  chapterIndexForStage,
  enemyCount,
  enemySummary,
  isBossStage,
  isEliteStage,
  missionTitle,
} from '../src/data/chapters.js';
import { makeEnemyUnits } from '../src/core/battle/units.js';

describe('data misi per bab', () => {
  it('setiap bab punya nama misi untuk tiap langkah non-boss', () => {
    expect(MISSION_NAMES).toHaveLength(CHAPTERS.length);
    for (const names of MISSION_NAMES) {
      expect(names).toHaveLength(STAGES_PER_CHAPTER - 1);
    }
  });

  it('stage terakhir tiap bab adalah boss dan stage tengah adalah elite', () => {
    expect(TOTAL_STAGES).toBe(CHAPTERS.length * STAGES_PER_CHAPTER);
    for (let chapter = 0; chapter < CHAPTERS.length; chapter++) {
      const first = chapter * STAGES_PER_CHAPTER + 1;
      const last = first + STAGES_PER_CHAPTER - 1;
      expect(chapterIndexForStage(first)).toBe(chapter);
      expect(chapterIndexForStage(last)).toBe(chapter);
      expect(isBossStage(last)).toBe(true);
      expect(isBossStage(first)).toBe(false);
      expect(isEliteStage(first + ELITE_STEP - 1)).toBe(true);
      expect(isEliteStage(first + ELITE_STEP)).toBe(false);
    }
  });

  it('tiap stage punya judul misi dan ringkasan musuh', () => {
    for (let stage = 1; stage <= TOTAL_STAGES; stage++) {
      expect(missionTitle(stage)).toBeTruthy();
      expect(enemySummary(stage)).toBeTruthy();
    }
    expect(missionTitle(1)).toBe(MISSION_NAMES[0][0]);
    expect(missionTitle(STAGES_PER_CHAPTER)).toContain('Boss: ' + CHAPTERS[0].boss);
    expect(missionTitle(ELITE_STEP)).toContain('Elite: ');
  });

  it('jumlah musuh selalu 3-5 dan boss menyesuaikan bab', () => {
    for (let stage = 1; stage <= TOTAL_STAGES; stage++) {
      const count = enemyCount(stage);
      expect(count).toBeGreaterThanOrEqual(3);
      expect(count).toBeLessThanOrEqual(5);
    }
    for (let chapter = 0; chapter < CHAPTERS.length; chapter++) {
      expect(enemyCount((chapter + 1) * STAGES_PER_CHAPTER)).toBe(3 + chapter);
    }
  });

  it('susunan musuh punya satu boss di stage boss dan satu elite di stage elite', () => {
    const bossUnits = makeEnemyUnits(STAGES_PER_CHAPTER);
    expect(bossUnits.filter((unit) => unit.boss)).toHaveLength(1);
    expect(bossUnits.some((unit) => unit.elite)).toBe(false);

    const eliteUnits = makeEnemyUnits(ELITE_STEP);
    const elites = eliteUnits.filter((unit) => unit.elite);
    expect(elites).toHaveLength(1);
    expect(elites[0].boss).toBe(true);
    expect(elites[0].name).toMatch(/^Elit /);

    expect(makeEnemyUnits(1).some((unit) => unit.boss || unit.elite)).toBe(false);
  });
});
