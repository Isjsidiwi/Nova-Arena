import { $ } from './dom.js';
import { S, save } from '../store.js';
import { teamPower } from '../core/roster.js';
import { fmt } from '../core/format.js';

export function refreshHud() {
  $('#rk').textContent = 'TIM ' + fmt(teamPower(S));
  $('#cK span').textContent = fmt(S.k);
  $('#cG span').textContent = fmt(S.g);
  save();
}
