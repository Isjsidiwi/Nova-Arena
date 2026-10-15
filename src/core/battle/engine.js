// Engine battle: murni logika, tanpa DOM.
// Di-drive sebagai generator event; UI mengonsumsi event untuk animasi.
//
// Contoh pemakaian:
//   const battle = createBattle({ players, enemies, rng });
//   for (const event of battle.run()) { ...animate... }
import { pick } from '../rng.js';
import { computeDamage } from './damage.js';

export const MAX_ROUNDS = 30;
export const ENERGY_MAX = 100;
export const ENERGY_PER_TURN = 25;
export const ENERGY_PER_HIT = 12;
export const SKILL_COOLDOWN = 2;
export const BOSS_SKILL_EVERY = 3;

function createUnit(spec) {
  return {
    ...spec,
    maxHp: spec.hp,
    energy: 0,
    cooldown: 0,
    atkUp: 0,
    alive: true,
    queued: false,
  };
}

export function createBattle({ players, enemies, rng = Math.random }) {
  const units = [...players.map(createUnit), ...enemies.map(createUnit)];
  const state = { round: 1, active: true, units };

  const aliveUnits = (side) => units.filter((u) => u.side === side && u.alive);
  const deadPlayers = () => units.filter((u) => u.side === 'p' && !u.alive).length;

  function checkEnd() {
    if (!aliveUnits('e').length) {
      return { type: 'end', win: true, deadCount: deadPlayers() };
    }
    if (!aliveUnits('p').length) {
      return { type: 'end', win: false, reason: 'Tim kalah. Naikkan level hero!', deadCount: deadPlayers() };
    }
    return null;
  }

  /** Tentukan aksi unit pada gilirannya. */
  function decideAction(unit) {
    let actionType = 'normal';
    if (unit.side === 'p') {
      if (unit.queued && unit.energy >= ENERGY_MAX) actionType = 'ult';
      else if (unit.cooldown <= 0) actionType = 'skill';
    } else if (unit.boss && state.round % BOSS_SKILL_EVERY === 0) {
      actionType = 'skill';
    }

    let action;
    if (unit.side === 'p') {
      if (actionType === 'ult') action = unit.hero.ult;
      else if (actionType === 'skill') action = unit.hero.skill;
      else action = { type: 's', mult: 1 };
    } else {
      action = actionType === 'skill' ? { type: 'a', mult: .85 } : { type: 's', mult: 1 };
    }

    return { actionType, action };
  }

  function* healOrBuffTurn(unit, actionType, action) {
    yield { type: 'lunge', unit, big: false };
    const allies = aliveUnits(unit.side);
    const targets =
      action.type === 'b'
        ? allies
        : actionType === 'ult'
          ? allies
          : [allies.reduce((a, b) => (a.hp / a.maxHp < b.hp / b.maxHp ? a : b))];

    for (const target of targets) {
      if (action.type === 'b') {
        target.atkUp = actionType === 'ult' ? 3 : 2;
        yield { type: 'buff', source: unit, target, turns: target.atkUp };
      } else {
        const amount = Math.round(unit.atk * action.mult);
        target.hp = Math.min(target.maxHp, target.hp + amount);
        yield { type: 'heal', source: unit, target, amount };
      }
    }
  }

  function* attackTurn(unit, actionType, action) {
    const foes = aliveUnits(unit.side === 'p' ? 'e' : 'p');
    const targets =
      action.type === 'a'
        ? foes
        : [actionType === 'ult' ? foes.reduce((a, b) => (a.hp > b.hp ? a : b)) : pick(rng, foes)];

    yield { type: 'lunge', unit, big: actionType === 'ult' };

    for (const target of targets) {
      const { amount, crit, multiplier } = computeDamage(unit, target, action.mult, rng);
      target.hp = Math.max(0, target.hp - amount);
      if (target.side === 'p') target.energy = Math.min(ENERGY_MAX, target.energy + ENERGY_PER_HIT);
      if (target.hp <= 0) {
        target.alive = false;
        target.queued = false;
      }
      yield { type: 'damage', source: unit, target, amount, crit, elementMultiplier: multiplier };
      if (!target.alive) yield { type: 'death', unit: target };
    }

    if (actionType === 'ult') yield { type: 'shake' };
  }

  function* takeTurn(unit) {
    yield { type: 'turnStart', unit };

    const { actionType, action } = decideAction(unit);

    if (actionType === 'ult') {
      unit.energy = 0;
      unit.queued = false;
      yield { type: 'ult', unit };
    }

    if (action.type === 'h' || action.type === 'b') {
      yield* healOrBuffTurn(unit, actionType, action);
    } else {
      yield* attackTurn(unit, actionType, action);
    }

    if (unit.side === 'p') {
      unit.energy = Math.min(ENERGY_MAX, unit.energy + ENERGY_PER_TURN);
      if (actionType === 'skill') unit.cooldown = SKILL_COOLDOWN;
      else if (actionType === 'normal') unit.cooldown -= 1;
    }
    if (unit.atkUp > 0) unit.atkUp -= 1;

    yield { type: 'turnEnd', unit };
  }

  function* run() {
    while (state.active) {
      const order = units.filter((u) => u.alive).sort((a, b) => b.spd - a.spd);
      for (const unit of order) {
        if (!state.active) return;
        if (!unit.alive) continue;

        yield* takeTurn(unit);

        if (!state.active) return;
        const end = checkEnd();
        if (end) {
          state.active = false;
          yield end;
          return;
        }
      }

      state.round += 1;
      if (state.round > MAX_ROUNDS) {
        state.active = false;
        yield { type: 'end', win: false, reason: 'Waktu habis!', deadCount: deadPlayers() };
        return;
      }
      yield { type: 'round', round: state.round };
    }
  }

  return {
    state,
    units,
    run,
    get round() {
      return state.round;
    },
    /** Hentikan battle (mis. menyerah). Generator berhenti pada yield berikutnya. */
    abort() {
      state.active = false;
    },
    aliveUnits,
  };
}
