// Art bawaan berupa SVG prosedural. Jika ASSETS menyediakan gambar (portrait/icon),
// gambar itu yang dipakai; jika tidak, avatar/monster digambar dari bentuk vektor.
import { ASSETS } from '../config/assets.js';
import { ELEMENTS } from '../data/elements.js';
import { RARITY } from '../data/rarity.js';
import { SLOT_ICON_PATHS } from '../data/items.js';

const BODY_SHAPES = [
  'M16 60Q14 14 50 12Q86 14 84 60L84 104Q76 112 70 92L30 92Q24 112 16 104Z',
  'M18 58Q16 14 50 12Q84 14 82 58L82 72L18 72Z',
  'M18 60Q14 12 50 10Q86 12 82 60L92 98L74 78L26 78L8 98Z',
];

const HAIR_SHAPES = [
  'M22 54Q24 20 50 20Q76 20 78 54Q66 38 50 44Q34 38 22 54Z',
  'M20 58Q20 18 50 18Q80 18 80 58L68 38L58 50L46 36L34 50Z',
  'M22 56Q30 18 50 18Q70 18 78 56Q62 34 50 46Q38 34 22 56Z',
];

/**
 * Art hero. mode 'icon' memakai aset ikon (kalau ada) untuk tombol ult.
 * Tanpa aset, semua memakai avatar prosedural.
 */
export function heroArt(hero, mode = '') {
  if (mode === 'icon' && ASSETS.icon[hero.id]) {
    return `<svg class="ic" viewBox="0 0 1 1" preserveAspectRatio="xMidYMid slice"><image href="${ASSETS.icon[hero.id]}" width="1" height="1"/></svg>`;
  }
  if (mode === 'cutin' && ASSETS.cutin[hero.id]) {
    return `<svg class="ci" viewBox="0 0 1 1" preserveAspectRatio="xMidYMid slice"><image href="${ASSETS.cutin[hero.id]}" width="1" height="1"/></svg>`;
  }
  if (ASSETS.portrait[hero.id]) {
    return `<svg viewBox="0 0 3 4" preserveAspectRatio="xMidYMin slice"><image href="${ASSETS.portrait[hero.id]}" width="3" height="4"/></svg>`;
  }

  const elementColor = ELEMENTS[hero.element].color;
  const variant = hero.k % 3;
  const skin = '#ffe3cc';
  const body = BODY_SHAPES[variant];
  const hair = HAIR_SHAPES[variant];

  return `<svg viewBox="0 0 100 130"><circle cx="50" cy="60" r="44" fill="${elementColor}" opacity=".25"/><path d="${body}" fill="${hero.color}"/><path d="M16 130Q18 94 50 92Q82 94 84 130Z" fill="${elementColor}"/><path d="M38 92L50 110L62 92Z" fill="#fff"/><rect x="44" y="78" width="12" height="16" fill="${skin}"/><ellipse cx="50" cy="60" rx="22" ry="24" fill="${skin}"/><ellipse cx="39" cy="64" rx="4.5" ry="6.5" fill="${elementColor}"/><ellipse cx="61" cy="64" rx="4.5" ry="6.5" fill="${elementColor}"/><circle cx="37.5" cy="61.5" r="1.8" fill="#fff"/><circle cx="59.5" cy="61.5" r="1.8" fill="#fff"/><ellipse cx="33" cy="73" rx="4" ry="2" fill="#ff8fa8" opacity=".5"/><ellipse cx="67" cy="73" rx="4" ry="2" fill="#ff8fa8" opacity=".5"/><path d="M45 77Q50 80 55 77" stroke="#a0524a" stroke-width="1.5" fill="none"/><path d="${hair}" fill="${hero.color}"/><path d="M70 28l10 4-4 10z" fill="${elementColor}"/></svg>`;
}

/** Art monster musuh. */
export function monsterArt(element, boss = false) {
  const color = ELEMENTS[element].color;
  return `<svg viewBox="0 0 100 100"><ellipse cx="50" cy="94" rx="34" ry="5" fill="#0006"/>${boss ? `<path d="M22 34L14 8L38 26ZM78 34L86 8L62 26Z" fill="${color}"/>` : ''}<path d="M16 88Q8 40 50 30Q92 40 84 88Z" fill="${color}"/><path d="M26 80Q22 50 50 42" stroke="#fff6" stroke-width="5" fill="none" stroke-linecap="round"/><ellipse cx="38" cy="62" rx="7" ry="9" fill="#fff"/><ellipse cx="62" cy="62" rx="7" ry="9" fill="#fff"/><circle cx="39" cy="64" r="4" fill="#1a0a2a"/><circle cx="61" cy="64" r="4" fill="#1a0a2a"/><path d="M40 78Q50 84 60 78" stroke="#1a0a2a" stroke-width="3" fill="none"/></svg>`;
}

/** Ikon item per slot dengan warna rarity. */
export function itemArt(item) {
  const color = RARITY[item.r].color;
  return `<svg viewBox="0 0 100 100"><circle cx="50" cy="50" r="44" fill="${color}" opacity=".2"/><g fill="${color}" stroke="#fff" stroke-width="2.5" stroke-linejoin="round">${SLOT_ICON_PATHS[item.s]}</g></svg>`;
}

/** Badge elemen berbentuk belah ketupat. */
export const elementBadge = (element) =>
  `<span class="eb" style="background:${ELEMENTS[element].color}">${ELEMENTS[element].glyph}</span>`;
