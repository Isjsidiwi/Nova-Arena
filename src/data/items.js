// Item/equipment. Bentuk data item tersimpan: { u: uid, s: slot, r: rarity, lv }.
export const SLOT_NAMES = ['Senjata', 'Helm', 'Zirah', 'Sepatu', 'Kalung'];

// Stat per slot (index 4 = ap / persen ATK).
export const SLOT_STATS = ['atk', 'hp', 'def', 'spd', 'ap'];
export const SLOT_BASE_VALUES = [40, 400, 30, 8, .08];

export const RARITY_PREFIX = { R: 'Baja', SR: 'Mithril', SSR: 'Nova' };
export const RARITY_ITEM_MULTIPLIER = { R: 1, SR: 1.6, SSR: 2.5 };

export const ITEM_LEVEL_CAP = 15;

// Path SVG ikon item per slot.
export const SLOT_ICON_PATHS = [
  '<path d="M50 6L58 14V62H42V14Z"/><rect x="30" y="62" width="40" height="8"/><rect x="45" y="70" width="10" height="22"/>',
  '<path d="M20 62Q20 18 50 18Q80 18 80 62V80H62V62H38V80H20Z"/>',
  '<path d="M22 20L40 14Q50 24 60 14L78 20L84 44L70 50V86H30V50L16 44Z"/>',
  '<path d="M34 16H60V56L84 64V82H28Q30 60 34 56Z"/>',
  '<path d="M24 14Q50 70 76 14" fill="none" stroke-width="6"/><circle cx="50" cy="66" r="16"/><circle cx="50" cy="66" r="6" fill="#fff" stroke="none"/>',
];
