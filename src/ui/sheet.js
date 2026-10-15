import { $ } from './dom.js';

/**
 * Buka sheet bawah. Menerima string HTML.
 * Klik area gelap di luar sheet menutupnya.
 * Mengembalikan elemen overlay (punya .querySelector('.sh') untuk isi sheet).
 */
export function openSheet(html) {
  const overlay = document.createElement('div');
  overlay.className = 'ov';
  overlay.innerHTML = `<div class="sh">${html}</div>`;
  overlay.addEventListener('click', (event) => {
    if (event.target === overlay) overlay.remove();
  });
  $('#ovr').appendChild(overlay);
  return overlay;
}

export const closeSheet = (overlay) => overlay && overlay.remove();
