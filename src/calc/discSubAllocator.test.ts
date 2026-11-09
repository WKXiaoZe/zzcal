// src/calc/discSubAllocator.test.ts
import { describe, it, expect } from 'vitest';
import {
  validateAndAllocateSubStats,
  DEFAULT_ALL_SUB_COUNTS,
  SUB_STAT_DEFS,
  type AllSubCounts,
  type SlotNum,
} from './discSubAllocator';

function verifyAllocationInvariants(
  counts: Partial<AllSubCounts>,
  slot4Stat: 'critRate' | 'critDmg' | 'atkPct' | 'anomalyMastery',
) {
  const res = validateAndAllocateSubStats(counts, slot4Stat);
  expect(res.valid).toBe(true);
  expect(res.discs).toBeDefined();
  const discs = res.discs!;

  const summed: AllSubCounts = { ...DEFAULT_ALL_SUB_COUNTS };
  for (const slot of [1, 2, 3, 4, 5, 6] as SlotNum[]) {
    const d = discs[slot];
    // Rule 1: <= 4 distinct sub-stats and <= 5 upgrades (<= 9 total rolls) per disc
    expect(d.subStats.length).toBeLessThanOrEqual(4);
    expect(d.lineCount).toBe(d.subStats.length);
    expect(d.upgradeCount).toBeLessThanOrEqual(5);
    expect(d.totalRolls).toBeLessThanOrEqual(9);
    expect(d.totalRolls).toBe(d.lineCount + d.upgradeCount);

    // No duplicate sub-stat keys on the same disc
    const seen = new Set<string>();
    for (const st of d.subStats) {
      expect(seen.has(st.key)).toBe(false);
      seen.add(st.key);
      // Rule 2: main stat and sub-stat cannot duplicate
      expect(st.key).not.toBe(d.conflictSubKey);
      expect(st.totalRolls).toBe(1 + st.upgrades);
      expect(st.upgrades).toBeGreaterThanOrEqual(0);
      expect(st.upgrades).toBeLessThanOrEqual(5);
      summed[st.key] += st.totalRolls;
    }
  }

  for (const def of SUB_STAT_DEFS) {
    expect(summed[def.key]).toBe(counts[def.key] ?? 0);
  }
}

describe('discSubAllocator', () => {
  it('allocates all-zero counts cleanly', () => {
    verifyAllocationInvariants({}, 'critRate');
  });

  it('allocates typical DPS sub-stats obeying Rule 1 & Rule 2', () => {
    verifyAllocationInvariants(
      {
        CR: 15,
        CD: 16,
        ATK: 8,
        FLAT_ATK: 3,
        FLAT_HP: 2,
      },
      'critRate',
    );
  });

  it('allocates full 54-roll max-capacity 6-disc configuration', () => {
    // 6 discs * 9 rolls = 54 rolls (24 initial lines + 30 upgrades)
    verifyAllocationInvariants(
      {
        CR: 14,       // 5 discs (not slot 4)
        CD: 16,       // 6 discs
        ATK: 12,      // 6 discs
        FLAT_ATK: 6,  // 5 discs (not slot 2)
        HP: 6,        // 6 discs
      },
      'critRate',
    );
  });

  it('rejects when a single stat exceeds 30 rolls due to Slot 4 main-stat conflict', () => {
    // Slot 4 = critRate -> CR can only appear on 5 discs (max 5*6 = 30)
    const res = validateAndAllocateSubStats({ CR: 31 }, 'critRate');
    expect(res.valid).toBe(false);
    expect(res.excessStats?.some((e) => e.key === 'CR' && e.excess === 1)).toBe(true);
  });

  it('allows 31 rolls of CR when Slot 4 is critDmg (no main-stat conflict for CR, up to 36)', () => {
    // Wait: 31 rolls of CR on 6 discs requires 6 initial lines + 25 upgrades (<= 30 upgrades!)
    verifyAllocationInvariants({ CR: 31 }, 'critDmg');
  });

  it('rejects when Slot 1/2/3 fixed main stats conflict with >30 flat sub-stats', () => {
    // Slot 2 = FLAT_ATK -> FLAT_ATK can only appear on 5 discs (max 30)
    const res = validateAndAllocateSubStats({ FLAT_ATK: 32 }, 'critRate');
    expect(res.valid).toBe(false);
    expect(res.excessStats?.some((e) => e.key === 'FLAT_ATK' && e.excess === 2)).toBe(true);
  });

  it('rejects and identifies offending stats when upgrade count exceeds 30 across 6 discs', () => {
    // Slot 4 = critRate: CR=24 needs at least 24-5=19 upgrades; CD=24 needs at least 24-6=18 upgrades -> 37 > 30
    const res = validateAndAllocateSubStats({ CR: 24, CD: 24 }, 'critRate');
    expect(res.valid).toBe(false);
    expect(res.excessStats && res.excessStats.length).toBeGreaterThan(0);
    const keys = res.excessStats!.map((e) => e.key);
    expect(keys).toContain('CR');
    expect(keys).toContain('CD');
  });
});
