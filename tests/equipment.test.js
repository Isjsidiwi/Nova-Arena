import { describe, expect, it } from 'vitest';
import {
  itemValue,
  itemText,
  bonusFor,
  ownerOf,
  equip,
  unequip,
  tryUpgradeItem,
  itemsForSlot,
} from '../src/core/equipment.js';
import { createDefaultState, migrateState } from '../src/core/state.js';

const freshState = () => migrateState(createDefaultState());

describe('nilai & teks item', () => {
  it('itemValue R lv1 = nilai dasar slot', () => {
    expect(itemValue({ s: 0, r: 'R', lv: 1 })).toBe(40);
    expect(itemValue({ s: 1, r: 'R', lv: 1 })).toBe(400);
  });

  it('itemValue naik dengan rarity dan level', () => {
    expect(itemValue({ s: 0, r: 'SR', lv: 1 })).toBe(64);
    expect(itemValue({ s: 0, r: 'R', lv: 2 })).toBeCloseTo(43.2);
  });

  it('itemText menampilkan persen untuk kalung', () => {
    expect(itemText({ s: 4, r: 'R', lv: 1 })).toBe('+8% ATK');
    expect(itemText({ s: 0, r: 'R', lv: 2 })).toBe('+43 ATK');
  });
});

describe('equip / unequip', () => {
  it('bonusFor menjumlahkan item terpasang', () => {
    const state = freshState();
    equip(state, 'sylva', 0, state.eq[0].u);
    equip(state, 'sylva', 1, state.eq[1].u);
    const bonus = bonusFor(state, 'sylva');
    expect(bonus.atk).toBe(40);
    expect(bonus.hp).toBe(400);
  });

  it('equip memindahkan item dari hero lain', () => {
    const state = freshState();
    equip(state, 'sylva', 0, state.eq[0].u);
    equip(state, 'arka', 0, state.eq[0].u);
    expect(ownerOf(state, state.eq[0].u, 'arka')).toBeUndefined();
    expect(state.lo.sylva[0]).toBeNull();
    expect(state.lo.arka[0]).toBe(state.eq[0].u);
  });

  it('ownerOf menemukan pemakai item', () => {
    const state = freshState();
    equip(state, 'sylva', 0, state.eq[0].u);
    expect(ownerOf(state, state.eq[0].u, 'arka')).toBe('sylva');
  });

  it('unequip mengosongkan slot', () => {
    const state = freshState();
    equip(state, 'sylva', 0, state.eq[0].u);
    unequip(state, 'sylva', 0);
    expect(state.lo.sylva[0]).toBeNull();
  });

  it('itemsForSlot mendahulukan item yang belum dipakai', () => {
    const state = freshState();
    equip(state, 'arka', 0, state.eq[0].u);
    state.eq.push({ u: 999, s: 0, r: 'SSR', lv: 1 });
    const list = itemsForSlot(state, 0, { heroId: 'sylva' });
    expect(list.length).toBe(2);
    expect(list.every((i) => i.s === 0)).toBe(true);
    expect(list[0].u).toBe(999);
  });
});

describe('upgrade item', () => {
  it('berhasil saat koin cukup', () => {
    const state = freshState();
    const item = state.eq[0];
    const result = tryUpgradeItem(state, item.u);
    expect(result.ok).toBe(true);
    expect(item.lv).toBe(2);
    expect(state.k).toBe(5000 - 70);
  });

  it('gagal saat koin kurang', () => {
    const state = freshState();
    state.k = 0;
    const result = tryUpgradeItem(state, state.eq[0].u);
    expect(result.ok).toBe(false);
    expect(result.reason).toBe('coins');
    expect(state.eq[0].lv).toBe(1);
  });

  it('gagal saat sudah level maksimum', () => {
    const state = freshState();
    const item = state.eq[0];
    item.lv = 15;
    const result = tryUpgradeItem(state, item.u);
    expect(result.ok).toBe(false);
    expect(result.reason).toBe('max');
  });
});
