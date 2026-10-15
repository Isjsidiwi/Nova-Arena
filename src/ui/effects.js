import { $ } from './dom.js';
import { burst } from './particles.js';
import { sfx } from '../core/audio.js';

/** Efek naik level: cincin + teks melayang di atas elemen, plus burst partikel. */
export function levelUpFx(box, text, color = '#ffd76a') {
  const rect = box.getBoundingClientRect();
  const stageRect = $('#st').getBoundingClientRect();
  const x = rect.left + rect.width / 2;
  const y = rect.top + rect.height / 2;

  const fx = document.createElement('div');
  fx.className = 'lvf';
  fx.style.cssText = `left:${x - stageRect.left}px;top:${y - stageRect.top}px;--c:${color}`;
  fx.innerHTML = `<i></i><i></i><b>${text}</b>`;
  $('#st').appendChild(fx);
  setTimeout(() => fx.remove(), 1400);

  box.animate(
    [
      { filter: 'brightness(3) saturate(0)', transform: 'scale(1.1)' },
      { filter: 'none', transform: 'none' },
    ],
    { duration: 600 },
  );
  burst(x, y, color, 60, 9);
  sfx('win');
}
