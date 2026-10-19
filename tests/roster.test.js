import { describe, expect, it } from 'vitest';
import {
  getOwned,
  isInTeam,
  heroStats,
  teamPower,
  tryLevelUp,
  toggleTeam,
  autoTeam,
  sortedOwned,
  teamFirst,
  teamFirst,
} from '../src/core/roster.js';
import { heroLevelCost } from '../src/core/economy.js';
import { HERO_BY_ID } from '../src/data/heroes.js';
import { createDefaultState, migrateState } from '../src/core/state.js';

const freshState = () => migrateState(createDefaultState());

describe('level up', () => {
  it('biaya naik level mengikuti rumus', () => {
    expect(heroLevelCost(HERO_BY_ID.sylva, 1)).toBe(Math.round(1 * 80 * 1.5));
    expect(heroLevelCost(HERO_BY_ID.raka, 1)).toBe(Math.round(1 * 80 * 2.2));
  });

  it('berhasil saat koin cukup', () => {
    const state = freshState();
    const result = tryLevelUp(state, 'sylva');
    expect(result.ok).toBe(true);
    expect(getOwned(state, 'sylva').lv).toBe(2);
    expect(state.k).toBe(5000 - 120);
  });

  it('gagal saat koin kurang', () => {
    const state = freshState();
    state.k = 0;
    expect(tryLevelUp(state, 'sylva').reason).toBe('coins');
  });

  it('gagal saat level maksimum', () => {
    const state = freshState();
    getOwned(state, 'sylva').lv = 50; // cap SR
    expect(tryLevelUp(state, 'sylva').reason).toBe('max');
  });
});

describe('tim', () => {
  it('toggle keluar/masuk tim', () => {
    const state = freshState();
    expect(isInTeam(state, 'sylva')).toBe(true);
    expect(toggleTeam(state, 'sylva').ok).toBe(true);
    expect(isInTeam(state, 'sylva')).toBe(false);
    expect(toggleTeam(state, 'sylva').ok).toBe(true);
    expect(isInTeam(state, 'sylva')).toBe(true);
  });

  it('tidak bisa mengeluarkan hero terakhir', () => {
    const state = freshState();
    state.team = ['sylva'];
    expect(toggleTeam(state, 'sylva')).toEqual({ ok: false, reason: 'min' });
  });

  it('tidak bisa menambah lebih dari 5', () => {
    const state = freshState();
    state.team = ['sylva', 'arka', 'mira', 'raka', 'naya'];
    expect(toggleTeam(state, 'volta')).toEqual({ ok: false, reason: 'max' });
  });

  it('autoTeam memilih 5 hero terkuat', () => {
    const state = freshState();
    state.heroes.push({ id: 'raka', lv: 30 }, { id: 'naya', lv: 30 }, { id: 'volta', lv: 30 });
    autoTeam(state);
    expect(state.team.length).toBe(5);
    expect(state.team).toContain('raka');
  });
});

describe('power', () => {
  it('heroStats & teamPower berjalan', () => {
    const state = freshState();
    const stats = heroStats(state, 'sylva');
    expect(stats.hp).toBeGreaterThan(0);
    expect(teamPower(state)).toBeGreaterThan(0);
  });

  it('teamFirst menaruh anggota tim di depan sesuai urutan slot', () => {
    const owned = [{ id: 'mira' }, { id: 'volta' }, { id: 'arka' }, { id: 'raka' }, { id: 'sylva' }];
    const team = ['sylva', 'arka', 'volta']; // TIM 1, 2, 3
    const list = teamFirst(owned, team);
    expect(list.map((o) => o.id)).toEqual(['sylva', 'arka', 'volta', 'mira', 'raka']);
    // Array asal tidak berubah & non-tim mempertahankan urutan masuk (stabil).
    expect(owned.map((o) => o.id)).toEqual(['mira', 'volta', 'arka', 'raka', 'sylva']);
    expect(teamFirst(owned, []).map((o) => o.id)).toEqual(owned.map((o) => o.id));
  });

  it('sortedOwned mengurutkan SSR lebih dulu', () => {
    const state = freshState();
    state.heroes.push({ id: 'raka', lv: 1 });
    const list = sortedOwned(state);
    expect(list[0].id).toBe('raka');
  });
});
