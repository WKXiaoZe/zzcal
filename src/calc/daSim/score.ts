// Port of da-sim sim/score.py — nonlinear 29-bar boss_adjust damage curve + operation score.
import { pyRound } from './pyCompat';
import type { ScoreCurve } from './types';

export function damageToScore(damage: number, maxHp: number, cap: number, curve: ScoreCurve): number {
  if (maxHp <= 0 || damage <= 0) return 0;
  const bars = curve.bars.map((b) => [Number(b.hp_bp), Number(b.points)] as const);
  let sumW = 0;
  for (const [w] of bars) sumW += w;
  if (!sumW) sumW = 1;
  let remaining = damage;
  let score = 0;
  for (const [w, pts] of bars) {
    const barHp = maxHp * (w / sumW);
    if (barHp <= 0) continue;
    if (remaining >= barHp) {
      score += pts;
      remaining -= barHp;
    } else {
      score += pts * (remaining / barHp);
      remaining = 0;
      break;
    }
  }
  const hardCap = Number(curve.sum_points || cap);
  return Math.min(cap, hardCap, score);
}

export function rankFor(total: number, goals: Record<string, number>): string {
  if (total >= Number(goals.s ?? 20000)) return 'S';
  if (total >= Number(goals.a ?? 14000)) return 'A';
  if (total >= Number(goals.b ?? 6000)) return 'B';
  return 'none';
}

export interface DaScore {
  damage_score: number;
  operation_score: number;
  total_score: number;
  damage_score_cap: number;
  operation_score_cap: number;
  hp_max: number;
  hp_remaining: number;
  kill: boolean;
  part_breaks: number;
  rank: string;
  rank_goals: Record<string, number>;
  linear_damage_score_ref: number;
}

export function computeDaScore(args: {
  damage: number;
  maxHp: number;
  partBreaks: number;
  opPerBreak: number;
  damageCap: number;
  opCap: number;
  rankGoals: Record<string, number>;
  curve: ScoreCurve;
}): DaScore {
  const { damage, maxHp, partBreaks, opPerBreak, damageCap, opCap, rankGoals, curve } = args;
  const dmgScore = damageToScore(damage, maxHp, damageCap, curve);
  const linear = maxHp > 0 ? Math.min(damageCap, (damageCap * damage) / maxHp) : 0;
  const op = Math.min(opCap, partBreaks * opPerBreak);
  const total = dmgScore + op;
  const hpRem = Math.max(0, maxHp - damage);
  return {
    damage_score: pyRound(dmgScore, 1),
    operation_score: pyRound(op, 1),
    total_score: pyRound(total, 1),
    damage_score_cap: damageCap,
    operation_score_cap: opCap,
    hp_max: maxHp,
    hp_remaining: pyRound(hpRem, 1),
    kill: damage >= maxHp,
    part_breaks: partBreaks,
    rank: rankFor(total, rankGoals),
    rank_goals: rankGoals,
    linear_damage_score_ref: pyRound(linear, 1),
  };
}
