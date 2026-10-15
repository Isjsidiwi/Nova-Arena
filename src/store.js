// State permainan tunggal yang dibagi ke seluruh UI.
import { loadState, saveState } from './core/state.js';

export const S = loadState();

export const save = () => saveState(S);
