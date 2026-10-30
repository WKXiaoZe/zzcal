// Port of da-sim sim/boss.py + scripts/boss_attack_select.py (pick/eligible).
import { PyRandom, pyRound, f0 } from './pyCompat';
import type { BossAttackEntry, BossEvent, BossModel } from './types';

/* eslint-disable @typescript-eslint/no-explicit-any */
type Win = Record<string, any>;

const FALLBACK_MID: Win = {
  telegraph_s: 0.7,
  active_s: 2.0,
  recover_s: 1.0,
  parryable: false,
  parry_active_s: 0.55,
  window_assumption: 'fallback_tier_mid',
};

export function parrySubwindow(win: Win): [number, number] | null {
  if (!win.parryable) return null;
  const tel = f0(win.telegraph_s);
  const act = f0(win.active_s);
  let parryLen: number;
  if ('parry_active_s' in win) parryLen = f0(win.parry_active_s);
  else {
    const tot = tel + act + f0(win.recover_s);
    parryLen = tot < 5 ? 0.4 : tot < 7 ? 0.55 : 0.7;
  }
  const openAt = Math.max(0, tel * 0.85);
  const closeAt = openAt + Math.min(parryLen, act > 0 ? Math.max(0.25, act * 0.25) : parryLen);
  return [openAt, closeAt];
}

export function resolveWindow(windows: Record<string, Win>, skill: string): Win {
  if (skill in windows) {
    const w = { ...windows[skill] };
    if (!('window_source' in w)) w.window_source = 'pass_a_animator_state_length';
    return w;
  }
  return { ...FALLBACK_MID, window_source: 'fallback_tier' };
}

export function eligible(
  model: BossModel,
  distance: number,
  cdState: Record<string, number>,
): BossAttackEntry[] {
  const out: BossAttackEntry[] = [];
  const hasGlobal = model.cd_variables.includes('AttackCD_Current');
  for (const e of model.attacks) {
    if (e.weight === null || e.weight === undefined) continue;
    if (Number(e.weight) <= 0) continue;
    if (e.distance_min !== null && e.distance_min !== undefined && distance < Number(e.distance_min)) continue;
    if (e.distance_max !== null && e.distance_max !== undefined && distance > Number(e.distance_max)) continue;
    if (e.cd_var) {
      if (f0(cdState[e.cd_var]) > 0) continue;
    }
    if (!e.cd_var && hasGlobal && f0(cdState['AttackCD_Current']) > 0) continue;
    out.push(e);
  }
  return out;
}

export function pick(
  model: BossModel,
  distance: number,
  cdState: Record<string, number>,
  rng: PyRandom,
): BossAttackEntry | null {
  const elig = eligible(model, distance, cdState);
  if (!elig.length) return null;
  const weights = elig.map((e) => Number(e.weight));
  let total = 0;
  for (const w of weights) total += w;
  if (total <= 0) return null;
  const r = rng.uniform(0, total);
  let acc = 0;
  for (let i = 0; i < elig.length; i++) {
    acc += weights[i];
    if (r <= acc) return elig[i];
  }
  return elig[elig.length - 1];
}

/**
 * Coarse boss timeline (Pass A behavior-tree weights + distance band).
 * Faithful quirk: Python discards apply_cd_after_pick / tick_cds return values,
 * so cd_state stays empty and attack CDs never gate selection. Kept as-is for parity.
 */
export function sampleTimeline(
  model: BossModel,
  windows: Record<string, Win>,
  durationS: number,
  distance: number,
  seed = 42,
): BossEvent[] {
  const rng = new PyRandom(seed);
  const cdState: Record<string, number> = {};
  let t = 0;
  const events: BossEvent[] = [];
  while (t < durationS) {
    const entry = pick(model, distance, cdState, rng);
    if (!entry) {
      t += 1.0;
      continue;
    }
    const skill = entry.skill || 'Attack_01';
    const win = resolveWindow(windows, skill);
    const total = Number(win.telegraph_s + win.active_s + win.recover_s);
    const sub = parrySubwindow(win);
    const parry: [number, number] | null = sub ? [pyRound(t + sub[0], 3), pyRound(t + sub[1], 3)] : null;
    events.push({
      t: pyRound(t, 3),
      skill,
      weight_var: entry.weight_var,
      parry_window: parry,
      duration: total,
      telegraph_s: win.telegraph_s,
      active_s: win.active_s,
      recover_s: win.recover_s,
      parryable: !!win.parryable,
      window_assumption: win.window_assumption ?? 'unknown',
      window_source: win.window_source ?? 'unknown',
    });
    t += total;
  }
  return events;
}
