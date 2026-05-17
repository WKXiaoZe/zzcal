// src/calc/utils.test.ts
import { describe, it, expect } from 'vitest';
import { safeFloat, parseAgentValue, parseWeaponValue } from './utils';

describe('safeFloat', () => {
  it('returns 0 for nullish / empty', () => {
    expect(safeFloat(undefined)).toBe(0);
    expect(safeFloat(null)).toBe(0);
    expect(safeFloat('')).toBe(0);
  });

  it('parses numeric strings', () => {
    expect(safeFloat('12.5')).toBe(12.5);
    expect(safeFloat('0')).toBe(0);
  });

  it('returns 0 for NaN-producing input', () => {
    expect(safeFloat('not-a-number')).toBe(0);
  });

  it('passes through finite numbers', () => {
    expect(safeFloat(42)).toBe(42);
    expect(safeFloat(-3.14)).toBe(-3.14);
  });
});

describe('parseAgentValue', () => {
  it('passes through numbers', () => {
    expect(parseAgentValue(889, 0)).toBe(889);
    expect(parseAgentValue(889, 6)).toBe(889);
  });

  it('accumulates from arrays at cinema gates S1/S2/S4/S6', () => {
    // Base, +S1, +S2, +S4, +S6
    const arr = [100, 10, 20, 40, 60];
    expect(parseAgentValue(arr, 0)).toBe(100); // base only
    expect(parseAgentValue(arr, 1)).toBe(110);
    expect(parseAgentValue(arr, 2)).toBe(130);
    expect(parseAgentValue(arr, 3)).toBe(130); // S3 does NOT add (legacy parity)
    expect(parseAgentValue(arr, 4)).toBe(170);
    expect(parseAgentValue(arr, 5)).toBe(170); // S5 does NOT add (legacy parity)
    expect(parseAgentValue(arr, 6)).toBe(230);
  });

  it('parses slash-separated legacy strings', () => {
    expect(parseAgentValue('100/10/20/40/60', 6)).toBe(230);
    expect(parseAgentValue('100/10/20/40/60', 0)).toBe(100);
  });

  it('returns 0 for non-parseable input', () => {
    expect(parseAgentValue(undefined, 0)).toBe(0);
    expect(parseAgentValue({}, 0)).toBe(0);
  });
});

describe('parseWeaponValue', () => {
  it('passes through numbers regardless of star', () => {
    expect(parseWeaponValue(713, 1)).toBe(713);
    expect(parseWeaponValue(713, 5)).toBe(713);
  });

  it('indexes into [S1..S5] arrays', () => {
    const arr = [10, 20, 30, 40, 50];
    expect(parseWeaponValue(arr, 1)).toBe(10);
    expect(parseWeaponValue(arr, 3)).toBe(30);
    expect(parseWeaponValue(arr, 5)).toBe(50);
  });

  it('clamps star level to array bounds', () => {
    const arr = [10, 20, 30];
    expect(parseWeaponValue(arr, 0)).toBe(10); // below S1
    expect(parseWeaponValue(arr, 5)).toBe(30); // above S3 -> last
  });

  it('parses slash-separated legacy strings', () => {
    expect(parseWeaponValue('10/20/30/40/50', 5)).toBe(50);
    expect(parseWeaponValue('10/20/30/40/50', 1)).toBe(10);
  });
});
