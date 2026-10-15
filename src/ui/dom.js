export const $ = (selector, root = document) => root.querySelector(selector);
export const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];

export const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export function makeElement(html) {
  const template = document.createElement('template');
  template.innerHTML = html.trim();
  return template.content.firstElementChild;
}

/** Nonaktifkan animasi masuk sheet (dipakai saat sheet dibuka ulang setelah upgrade). */
export function disableSheetAnimation(overlay) {
  overlay.style.animation = 'none';
  overlay.firstElementChild.style.animation = 'none';
}
