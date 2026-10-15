import { elementMultiplier } from '../../data/elements.js';

export const CRIT_CHANCE = .15;
export const CRIT_MULTIPLIER = 1.5;
export const DEF_FACTOR = .8;
export const ATK_UP_MULTIPLIER = 1.3;

/**
 * Damage satu serangan. Murni: hanya bergantung unit + rng.
 * Urutan pemakaian rng: roll crit, lalu variasi damage.
 */
export function computeDamage(attacker, defender, mult, rng) {
  const crit = rng() < CRIT_CHANCE;
  const variance = .92 + rng() * .16;
  const multiplier = elementMultiplier(attacker.element, defender.element);
  const attackUp = attacker.atkUp > 0 ? ATK_UP_MULTIPLIER : 1;

  const raw =
    attacker.atk *
    attackUp *
    mult *
    100 /
    (100 + defender.def * DEF_FACTOR) *
    multiplier *
    variance *
    (crit ? CRIT_MULTIPLIER : 1);

  return { amount: Math.max(1, Math.round(raw)), crit, multiplier };
}
