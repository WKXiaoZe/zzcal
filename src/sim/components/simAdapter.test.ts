import { describe, expect, it } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import {
  buildStepInspection,
  formatDamageCompact,
  normalizeSimResult,
} from './simAdapter';
import type { SearchResultData } from '../types';

const SAMPLE_SUN_RESULT: SearchResultData = {
  version: '3.4.5_r20699967',
  boss_name: '🔥 危局52期｜新生之结 (弱火 / 3.67亿29管血 / 专怪角力&裂核)',
  boss_mode: 'NascentKnotDA52',
  build: {
    sun_m: 1,
    sun_w: 1,
    roxy_m: 0,
    roxy_w: 1,
    robin_m: 1,
    robin_w: 1,
  },
  shorthand: '110111',
  limited_gold: 7,
  stage_buff_id: 69015201,
  total_frames: 10259,
  total_seconds: 170.9833,
  killed: true,
  kill_time_s: 170.9833,
  da_dmg_score: 60000,
  da_perf_score: 5000,
  da_total_score: 65000,
  stun_count: 4,
  total_direct_dmg: 245000000,
  total_detonated_dmg: 122220322,
  total_dmg: 367220322,
  dps: 2147696,
  ub_max_dmg: 550234552,
  ub_min_kill_s: 119.5333,
  field_occupancy: {
    overall_s: [126.8, 40.8, 3.38],
    overall_pct: [74.2, 23.9, 1.9],
    pre_stun_s: [70.0, 36.8, 3.38],
    in_stun_s: [56.8, 4.0, 0.0],
    sanity_ok: true,
  },
  macros: [
    'RobinUltQuickAssistSun',
    { SunExP1: { swap_cancel: true } },
    'SunUlt1',
    'SunUlt2Detonate',
    'SunUlt1',
    'SunUlt1',
    'SunUlt1',
  ],
  rows: [
    {
      sid: 1601106,
      action_key: '🔥挽昼｜P1林德薇恩·强化E [焚夜·曦生] (耗30锐能)',
      cancel_mode: '🤝 合轴脱手',
      n_count: 1,
      delta_f: 15,
      t_start: 2.0,
      t_end: 2.25,
      stun_str: '—打条',
      sun_str: '✔极昼+众愿',
      roxy_str: '✔专武+赤翼',
      wind_str: '✔风化+浸染(+18%)',
      robin_str: '✔重音强化',
      fua_stacks: 2,
      disc_stacks: 1,
      ep_after: 54.7,
      wish_fire_after: 120,
      wound_after: 0.65,
      direct_dmg: 355176,
      vb_added: 0,
      vb_detonated: 0,
      vb_pool_after: 0,
      step_total_dmg: 355176,
    },
    {
      sid: 1601112,
      action_key: '🔥挽昼｜终结技二段 [长暗终焉] (引爆全部烬痕)',
      cancel_mode: '⚡ 最早切招',
      n_count: 1,
      delta_f: 90,
      t_start: 42.0,
      t_end: 43.5,
      stun_str: '★失衡',
      sun_str: '✔极昼+众愿',
      roxy_str: '✔全开',
      wind_str: '✔风化+浸染(+18%)',
      robin_str: '✔重音强化',
      direct_dmg: 12000000,
      vb_added: 0,
      vb_detonated: 30000000,
      vb_pool_after: 0,
      step_total_dmg: 42000000,
    },
  ],
};

describe('simAdapter visualization normalization & 15-multiplier inspector', () => {
  it('computes rhythmTag (n失衡m大), MILP UB* efficiency, and swimlane phases', () => {
    const view = normalizeSimResult(SAMPLE_SUN_RESULT);
    expect(view.engine).toBe('sun344');
    expect(view.ultCount).toBe(4);
    expect(view.rhythmTag).toBe('4失衡4大');
    expect(view.killed).toBe(true);
    expect(view.daTotalScore).toBe(65000);
    expect(view.ubAchievedPct).toBeCloseTo((367220322 / 550234552) * 100, 2);
    expect(view.swapCancelCount).toBe(1);
    expect(view.bossPhases.some((p) => p.kind === 'stun')).toBe(true);
    expect(formatDamageCompact(367220322)).toBe('3.672亿');
  });

  it('builds 15-multiplier snapshot for any selected step', () => {
    const view = normalizeSimResult(SAMPLE_SUN_RESULT);
    const step0 = buildStepInspection(0, SAMPLE_SUN_RESULT, view, null);
    expect(step0.multipliers15).toHaveLength(15);
    expect(step0.actorName).toBe('挽昼');
    expect(step0.activeBuffPills.length).toBeGreaterThan(0);

    const step1 = buildStepInspection(1, SAMPLE_SUN_RESULT, view, null);
    expect(step1.multipliers15).toHaveLength(15);
    expect(step1.detonatedDmg).toBe(30000000);
    // M1 Sunbringer defaults to 3000 decibel cap
    expect(view.mainDecibelCap).toBe(3000);
    expect(step0.resources.find((r) => r.label.includes('喧响'))?.max).toBe(3000);
  });

  it('upgrades Sunbringer M2+ decibel cap to 4000 and reflects 3.4.5 weather 69015201/69015205', () => {
    const m2Result: SearchResultData = {
      ...SAMPLE_SUN_RESULT,
      build: {
        sun_m: 2,
        sun_w: 1,
        roxy_m: 0,
        roxy_w: 1,
        robin_m: 1,
        robin_w: 1,
      },
      stage_buff_id: 69015205,
      rows: [
        {
          ...SAMPLE_SUN_RESULT.rows[0],
          sun_dec_after: 3650,
          wish_fire_after: 160,
        },
      ],
    };
    const m2View = normalizeSimResult(m2Result);
    expect(m2View.mainDecibelCap).toBe(4000);
    const m2Step0 = buildStepInspection(0, m2Result, m2View, null);
    const decRes = m2Step0.resources.find((r) => r.label.includes('喧响'));
    expect(decRes?.val).toBe(3650);
    expect(decRes?.max).toBe(4000);
    const sharpMultCell = m2Step0.multipliers15.find((c) => c.idx === 8);
    expect(sharpMultCell?.formulaHint).toContain('凋蚀印记');
  });

  it('separates Bangboo (slot 3) from Stage/Boss Mechanism True Damage (slot 4) in both sun344 and uni344', () => {
    const sunWithKnotMech: SearchResultData = {
      ...SAMPLE_SUN_RESULT,
      total_direct_dmg: 245000000,
      total_detonated_dmg: 122256421,
      total_dmg: 367256421,
      rows: [
        ...SAMPLE_SUN_RESULT.rows,
        {
          sid: 5402401,
          action_key: '💤梦游布｜主动技 [破阵先锋] (0s后台三士兵12连击)',
          cancel_mode: '后台自动',
          n_count: 1,
          delta_f: 0,
          t_start: 18.0,
          t_end: 18.0,
          stun_str: '—打条',
          direct_dmg: 783582.17,
          vb_added: 0,
          vb_detonated: 0,
          vb_pool_after: 0,
          step_total_dmg: 783582.17,
        },
        {
          sid: 99031821,
          action_key: '💥场地机制｜新生之结 [完美反制/破分裂体/碎祭剑] (2.5%生命真伤)',
          cancel_mode: '机制结算',
          n_count: 6,
          delta_f: 0,
          t_start: 56.0,
          t_end: 56.0,
          stun_str: '—打条',
          direct_dmg: 55073378.4,
          vb_added: 0,
          vb_detonated: 0,
          vb_pool_after: 0,
          step_total_dmg: 55073378.4,
        },
      ],
    };

    const sunView = normalizeSimResult(sunWithKnotMech);
    const bangbooBar = sunView.actorDmgTotals.find((a) => a.name === '梦游布');
    const stageMechBar = sunView.actorDmgTotals.find((a) => a.name === '场地/机制真伤');
    expect(bangbooBar?.dmg).toBeCloseTo(783582.17, 1);
    expect(stageMechBar?.dmg).toBeCloseTo(55073378.4, 1);
    expect(sunView.stageMechDmg).toBeCloseTo(55073378.4, 1);
    expect(sunView.swimlaneItems[2].slotIndex).toBe(3);
    expect(sunView.swimlaneItems[3].slotIndex).toBe(4);

    const mechDetail = buildStepInspection(3, sunWithKnotMech, sunView, null);
    expect(mechDetail.slotIndex).toBe(4);
    expect(mechDetail.actorName).toBe('场地/机制真伤');
    expect(mechDetail.multipliers15[2].valueStr).toBe('场地/首领机制真伤');

    const uniWithMiasmaBreak: SearchResultData = {
      ...SAMPLE_SUN_RESULT,
      engine: 'uni344',
      team_id: 'mix_sun_fufu_astra',
      agent_names: ['挽昼', '橘福福', '耀嘉音'],
      bangboo_name: '格列佛探员',
      total_dmg: 100000000,
      rows: [
        {
          sid: 5401401,
          actor_slot: 3,
          actor: '格列佛探员',
          action_key: '格列佛探员_主动技:紧急行动',
          cancel_mode: '后台协战',
          n_count: 1,
          stream_kind: 'Direct',
          delta_f: 0,
          t_start: 12.0,
          t_end: 12.0,
          stun_str: '—打条',
          direct_dmg: 263702,
          vb_added: 0,
          vb_detonated: 0,
          vb_pool_after: 0,
          step_total_dmg: 263702,
        },
        {
          sid: 4900099,
          actor_slot: 4,
          actor: '危局场地',
          action_key: '场地机制_秽盾击破净除真伤',
          cancel_mode: '机制结算',
          n_count: 1,
          stream_kind: 'TrueDmg',
          live_base: 367155870,
          step_mv: 0.025,
          delta_f: 0,
          t_start: 48.0,
          t_end: 48.0,
          stun_str: '—打条',
          direct_dmg: 9178896.75,
          vb_added: 0,
          vb_detonated: 0,
          vb_pool_after: 0,
          step_total_dmg: 9178896.75,
        },
      ],
    };

    const uniView = normalizeSimResult(uniWithMiasmaBreak);
    expect(uniView.actorDmgTotals.find((a) => a.name === '格列佛探员')?.dmg).toBeCloseTo(263702, 1);
    expect(uniView.actorDmgTotals.find((a) => a.name === '场地/机制真伤')?.dmg).toBeCloseTo(9178896.75, 1);
    expect(uniView.swimlaneItems[0].slotIndex).toBe(3);
    expect(uniView.swimlaneItems[1].slotIndex).toBe(4);
  });

  it('clips bossPhases stun band at exact stun_end_s without tail animation overhang', () => {
    const overhangResult: SearchResultData = {
      ...SAMPLE_SUN_RESULT,
      rows: [
        {
          sid: 1601110,
          action_key: '🔥挽昼｜连携技',
          cancel_mode: '⚡ 最早切招',
          n_count: 1,
          delta_f: 150,
          t_start: 21.25,
          t_end: 36.3333,
          stun_end_s: 38.0333,
          stun_str: '★失衡',
          direct_dmg: 10000000,
          vb_added: 12000000,
          vb_pool_after: 12000000,
          step_total_dmg: 10000000,
        },
        {
          sid: 1601011,
          action_key: '🔥挽昼｜终结技2 [重塑万象]',
          cancel_mode: '⚡ 最早切招',
          n_count: 1,
          delta_f: 186,
          t_start: 36.3333,
          t_end: 39.4333,
          stun_end_s: 39.0333,
          stun_str: '★失衡',
          direct_dmg: 25000000,
          vb_added: 0,
          vb_detonated: 12000000,
          vb_pool_after: 0,
          step_total_dmg: 37000000,
        },
        {
          sid: 1601001,
          action_key: '🔥挽昼｜P2普攻1段',
          cancel_mode: '⚡ 最早切招',
          n_count: 1,
          delta_f: 36,
          t_start: 39.4333,
          t_end: 40.0333,
          stun_str: '🟣秽盾锁条',
          direct_dmg: 500000,
          vb_added: 0,
          vb_pool_after: 0,
          step_total_dmg: 500000,
        },
      ],
    };

    const view = normalizeSimResult(overhangResult);
    const stunSeg = view.bossPhases.find((p) => p.kind === 'stun');
    const miasmaSeg = view.bossPhases.find((p) => p.kind === 'miasma');
    expect(stunSeg).toBeDefined();
    expect(stunSeg!.tStart).toBeCloseTo(21.25, 3);
    expect(stunSeg!.tEnd).toBeCloseTo(39.0333, 3);
    expect(stunSeg!.durationS).toBeCloseTo(17.7833, 3);
    expect(stunSeg!.windowDmg).toBeCloseTo(47000000, 1);
    expect(miasmaSeg).toBeDefined();
    expect(miasmaSeg!.tStart).toBeCloseTo(39.0333, 3);
    expect(miasmaSeg!.tEnd).toBeCloseTo(40.0333, 3);
  });

  it('keeps a single stun window contiguous across >0.25s WaitFrames swap/busy micro-waits', () => {
    const microWaitInStun: SearchResultData = {
      ...SAMPLE_SUN_RESULT,
      stun_count: 1,
      total_seconds: 140.0,
      rows: [
        {
          sid: 1621023,
          action_key: '🌪️洛克茜｜强化E终结炮 [敬请安息]',
          cancel_mode: '⚡ 最早切招',
          n_count: 1,
          delta_f: 36,
          t_start: 115.72,
          t_end: 116.32,
          stun_end_s: 129.72,
          stun_str: '★失衡',
          direct_dmg: 2000000,
          vb_added: 0,
          vb_pool_after: 0,
          step_total_dmg: 2000000,
        },
        // 0.43s (26f) WaitFrames for off-field busy_until_f unlock — still the SAME stun window!
        {
          sid: 1601015,
          action_key: '🔥挽昼｜P2艾尔妲·聚锋蓄力斩',
          cancel_mode: '⚡ 最早切招',
          n_count: 1,
          delta_f: 90,
          t_start: 116.75,
          t_end: 135.10,
          stun_end_s: 133.50,
          stun_str: '★失衡',
          direct_dmg: 45000000,
          vb_added: 0,
          vb_pool_after: 0,
          step_total_dmg: 45000000,
        },
      ],
    };

    const view = normalizeSimResult(microWaitInStun);
    const stunSegs = view.bossPhases.filter((p) => p.kind === 'stun');
    expect(stunSegs).toHaveLength(1);
    expect(stunSegs[0].label).toBe('#1 ★失衡窗');
    expect(stunSegs[0].tStart).toBeCloseTo(115.72, 2);
    expect(stunSegs[0].tEnd).toBeCloseTo(133.50, 2);
    expect(stunSegs[0].durationS).toBeCloseTo(17.78, 2);
    expect(stunSegs[0].windowDmg).toBeCloseTo(47000000, 1);
  });

  it('matches rendered stun phase count to preset stunCount across all bundled presets', () => {
    const simDataDir = path.resolve(__dirname, '../../../public/sim-data');
    const manifestPath = path.join(simDataDir, 'manifest.json');
    if (!fs.existsSync(manifestPath)) return;
    const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
    for (const p of manifest.presets) {
      const raw = JSON.parse(fs.readFileSync(path.join(simDataDir, p.path), 'utf8'));
      const view = normalizeSimResult(raw, p);
      const renderedStuns = view.bossPhases.filter((seg) => seg.kind === 'stun');
      expect(renderedStuns.length, `preset ${p.id} stun segment count`).toBe(p.stunCount);
      for (const seg of renderedStuns) {
        expect(seg.durationS, `preset ${p.id} ${seg.label} positive duration`).toBeGreaterThan(0);
      }
    }
  });
});
