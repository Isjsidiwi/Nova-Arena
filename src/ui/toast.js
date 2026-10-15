import { $ } from './dom.js';

let timer = null;

export function toast(message) {
  const el = $('#tt');
  el.textContent = message;
  el.classList.add('on');
  clearTimeout(timer);
  timer = setTimeout(() => el.classList.remove('on'), 1900);
}
