import { describe, expect, it } from 'vitest';
import { elementMultiplier } from '../src/data/elements.js';
import { computeDamage } from '../src/core/battle/damage.js';

const scripted = (values) => {
  let i = 0;
  return () => values[i++ % values.length];
};

describe('elementMultiplier', () => {
  it('1.35 saat menang elemen', () => {
    expect(elementMultiplier('a', 'g')).toBe(1.35);
    expect(elementMultiplier('l', 'd')).toBe(1.35);
  });

  it('0.75 saat kalah elemen', () => {
    expect(elementMultiplier('a', 'w')).toBe(.75);
    expect(elementMultiplier('g', 'a')).toBe(.75);
  });

  it('1 saat netral', () => {
    expect(elementMultiplier('a', 't')).toBe(1);
    expect(elementMultiplier('l', 'a')).toBe(1);
  });
});

describe('computeDamage', () => {
  const attacker = { atk: 100, atkUp: 0, element: 'a' };
  const defender = { def: 0, element: 't' };

  it('damage dasar tanpa crit dan variasi netral', () => {
    // rng: crit roll 0.5 (tidak crit), variance roll 0.5 -> 1.0
    const { amount, crit } = computeDamage(attacker, defender, 1, scripted([.5, .5]));
    expect(crit).toBe(false);
    expect(amount).toBe(100);
  });

  it('crit mengalikan 1.5', () => {
    // crit roll 0.1 (< .15)
    const { amount, crit } = computeDamage(attacker, defender, 1, scripted([.1, .5]));
    expect(crit).toBe(true);
    expect(amount).toBe(150);
  });

  it('buff ATK menaikkan damage 1.3x', () => {
    const buffed = { ...attacker, atkUp: 2 };
    const { amount } = computeDamage(buffed, defender, 1, scripted([.5, .5]));
    expect(amount).toBe(130);
  });

  it('DEF mengurangi damage sesuai formula', () => {
    const tank = { def: 100, element: 't' };
    const { amount } = computeDamage(attacker, tank, 1, scripted([.5, .5]));
    // 100 * 100/(100+80) = 55.55 -> 56
    expect(amount).toBe(56);
  });

  it('elemen unggul mengalikan 1.35', () => {
    const wind = { def: 0, element: 'g' };
    const { amount, multiplier } = computeDamage(attacker, wind, 1, scripted([.5, .5]));
    expect(multiplier).toBe(1.35);
    expect(amount).toBe(135);
  });

  it('damage minimum 1', () => {
    const weak = { atk: 1, atkUp: 0, element: 'a' };
    const wall = { def: 10000, element: 't' };
    const { amount } = computeDamage(weak, wall, 1, scripted([.5, .5]));
    expect(amount).toBe(1);
  });
});
