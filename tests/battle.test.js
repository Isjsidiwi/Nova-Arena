import { describe, expect, it } from 'vitest';
import { createBattle, ENERGY_MAX, MAX_ROUNDS } from '../src/core/battle/engine.js';
import { makeEnemyUnits } from '../src/core/battle/units.js';
import { HERO_BY_ID } from '../src/data/heroes.js';
import { mulberry32 } from '../src/core/rng.js';

const playerUnit = (overrides = {}) => ({
  side: 'p',
  index: 0,
  id: 'raka',
  hero: HERO_BY_ID.raka,
  element: 'a',
  name: 'Raka',
  hp: 100000,
  atk: 50000,
  def: 9999,
  spd: 999,
  ...overrides,
});

const enemyUnit = (overrides = {}) => ({
  side: 'e',
  index: 0,
  element: 'g',
  boss: false,
  name: 'Dummy',
  hp: 500,
  atk: 40,
  def: 0,
  spd: 10,
  ...overrides,
});

function drive(battle) {
  const events = [];
  for (const event of battle.run()) events.push(event);
  return events;
}

const last = (events) => events[events.length - 1];

describe('battle engine', () => {
  it('menang saat semua musuh habis dan mencatat korban', () => {
    const rng = mulberry32(1);
    const battle = createBattle({
      players: [playerUnit()],
      enemies: makeEnemyUnits(1),
      rng,
    });
    const events = drive(battle);
    const end = last(events);
    expect(end.type).toBe('end');
    expect(end.win).toBe(true);
    expect(end.deadCount).toBe(0);
    expect(events.some((e) => e.type === 'death' && e.unit.side === 'e')).toBe(true);
  });

  it('kalah saat tim habis', () => {
    const rng = mulberry32(2);
    const battle = createBattle({
      players: [playerUnit({ hp: 10, def: 0, atk: 1 })],
      enemies: [enemyUnit({ atk: 500, spd: 100 })],
      rng,
    });
    const events = drive(battle);
    const end = last(events);
    expect(end.type).toBe('end');
    expect(end.win).toBe(false);
    expect(end.reason).toBe('Tim kalah. Naikkan level hero!');
  });

  it('berakhir seri (kalah) setelah melewati batas ronde', () => {
    const rng = mulberry32(3);
    const battle = createBattle({
      players: [playerUnit({ atk: 1, def: 10000, hp: 100000 })],
      enemies: [enemyUnit({ atk: 1, def: 10000, hp: 100000, spd: 5 })],
      rng,
    });
    const events = drive(battle);
    const end = last(events);
    expect(end.type).toBe('end');
    expect(end.win).toBe(false);
    expect(end.reason).toBe('Waktu habis!');
    expect(battle.round).toBe(MAX_ROUNDS + 1);
  });

  it('mengantre ult: energy habis, antrian reset, ada event ult', () => {
    const rng = mulberry32(4);
    const battle = createBattle({
      players: [playerUnit({ atk: 100 })],
      enemies: [enemyUnit({ hp: 50, def: 0, atk: 1, spd: 1 })],
      rng,
    });
    const unit = battle.units.find((u) => u.side === 'p');
    unit.energy = ENERGY_MAX;
    unit.queued = true;

    const events = drive(battle);
    expect(events.some((e) => e.type === 'ult' && e.unit === unit)).toBe(true);
    expect(unit.queued).toBe(false);
    // setelah aksi: energy 0 lalu +25 di akhir giliran
    expect(unit.energy).toBe(25);
    expect(last(events).win).toBe(true);
  });

  it('penyembuh memulihkan sekutu dengan HP terendah', () => {
    const rng = mulberry32(5);
    const battle = createBattle({
      players: [
        playerUnit({ index: 0, hp: 100000, atk: 1, def: 0, spd: 100 }),
        playerUnit({
          index: 1, id: 'naya', hero: HERO_BY_ID.naya, element: 'w', name: 'Naya',
          hp: 5000, atk: 200, def: 0, spd: 900,
        }),
      ],
      enemies: [enemyUnit({ hp: 1e6, atk: 1, spd: 5 })],
      rng,
    });
    const naya = battle.units.find((u) => u.name === 'Naya');
    const ally = battle.units.find((u) => u.side === 'p' && u !== naya);
    ally.hp = 100; // rusak dulu agar jadi target heal

    let heal = null;
    let allyHpAfterHeal = null;
    for (const event of battle.run()) {
      if (event.type === 'heal' && event.source === naya && !heal) {
        heal = event;
        allyHpAfterHeal = ally.hp;
      }
    }

    expect(heal).toBeTruthy();
    expect(heal.target).toBe(ally);
    expect(heal.amount).toBe(Math.round(200 * 1.8));
    expect(allyHpAfterHeal).toBe(100 + heal.amount);
  });

  it('pendukung memberi buff ATK ke semua sekutu', () => {
    const rng = mulberry32(6);
    const battle = createBattle({
      players: [
        playerUnit({
          index: 0, id: 'citra', hero: HERO_BY_ID.citra, element: 'l', name: 'Citra',
          hp: 5000, atk: 100, def: 0, spd: 900,
        }),
        playerUnit({ index: 1, hp: 100000, atk: 1, def: 0, spd: 100 }),
      ],
      enemies: [enemyUnit({ hp: 1e6, atk: 1, spd: 5 })],
      rng,
    });
    const citra = battle.units.find((u) => u.name === 'Citra');
    const ally = battle.units.find((u) => u.side === 'p' && u !== citra);

    const buffs = [];
    let allyAtkUpAfterBuff = null;
    for (const event of battle.run()) {
      if (event.type === 'buff' && event.source === citra) {
        buffs.push(event);
        if (event.target === ally) allyAtkUpAfterBuff = ally.atkUp;
      }
    }

    expect(buffs.length).toBeGreaterThanOrEqual(2);
    expect(buffs.slice(0, 2).map((e) => e.target)).toEqual([citra, ally]);
    expect(buffs.slice(0, 2).every((e) => e.turns === 2)).toBe(true);
    expect(allyAtkUpAfterBuff).toBe(2);
  });

  it('boss memakai skill area tiap ronde kelipatan 3', () => {
    const rng = mulberry32(7);
    const battle = createBattle({
      players: [
        playerUnit({ index: 0, hp: 1e6, atk: 1, def: 0, spd: 900 }),
        playerUnit({ index: 1, hp: 1e6, atk: 1, def: 0, spd: 800 }),
      ],
      enemies: [
        { side: 'e', index: 0, element: 'g', boss: true, name: 'Bos', hp: 1e6, atk: 100, def: 0, spd: 5 },
      ],
      rng,
    });
    const boss = battle.units.find((u) => u.boss);

    let round = 1;
    const hitsByRound = new Map();
    for (const event of battle.run()) {
      if (event.type === 'round') round = event.round;
      if (event.type === 'damage' && event.source === boss) {
        hitsByRound.set(round, (hitsByRound.get(round) || 0) + 1);
      }
    }
    // ronde 3 & 6: skill area (2 target), ronde lain: serangan tunggal
    expect(hitsByRound.get(3)).toBe(2);
    expect(hitsByRound.get(6)).toBe(2);
    expect(hitsByRound.get(1)).toBe(1);
    expect(hitsByRound.get(2)).toBe(1);
  });

  it('abort menghentikan battle', () => {
    const rng = mulberry32(8);
    const battle = createBattle({
      players: [playerUnit({ atk: 1, def: 10000, hp: 100000 })],
      enemies: [enemyUnit({ atk: 1, def: 10000, hp: 100000, spd: 5 })],
      rng,
    });
    const generator = battle.run();
    generator.next(); // mulai
    battle.abort();
    const events = [];
    for (const event of generator) events.push(event);
    expect(events.some((e) => e.type === 'end')).toBe(false);
    expect(battle.state.active).toBe(false);
  });
});
