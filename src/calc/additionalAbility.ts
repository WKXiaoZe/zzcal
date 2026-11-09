// src/calc/additionalAbility.ts
// Evaluates whether an Agent's Additional Ability (额外能力) is triggered
// by the current 3-agent squad composition (main / sup1 / sup2).

import { CHARACTER_DB } from './db';
import { AGENT_BUFFS, stripGameTags } from './buffs';

export type AgentSlotKey = 'main' | 'sup1' | 'sup2';

export interface AgentMetaInfo {
  id?: number;
  element?: string;
  baseElement?: string;
  type?: string;
  faction?: string;
}

export interface AdditionalAbilityEvalResult {
  /** Whether the Additional Ability condition is satisfied by current teammates */
  triggered: boolean;
  /** Extracted trigger condition sentence from the ability description */
  conditionLine: string;
  /** Human-readable list of teammates & reasons that satisfied the trigger */
  matchedReasons: string[];
}

const PROFESSIONS = ['强攻', '击破', '异常', '支援', '防护', '命破', '锋御'] as const;

// Agents whose Defensive Assist is Evasive Assist (回避支援) rather than Parry Assist (招架支援)
const EVASIVE_ASSIST_ONLY = new Set<string>([
  '比利',
  '朱鸢',
  '丽娜',
  '格莉丝',
  '格莉丝Ⅵ',
  '扳机',
  '耀嘉音',
]);

export function getAgentMeta(agentName: string): AgentMetaInfo | null {
  if (!agentName) return null;
  const entry =
    CHARACTER_DB.characters[agentName] ?? (CHARACTER_DB.sup ?? {})[agentName];
  if (!entry || !entry.meta) return null;
  return entry.meta as AgentMetaInfo;
}

/**
 * Extracts the first line containing the team trigger condition from an Additional Ability description.
 */
export function extractConditionLine(desc: string): string {
  const clean = stripGameTags(desc || '');
  const firstLine = clean.split('\n')[0]?.trim() ?? '';
  return firstLine.replace(/[：:]\s*$/, '');
}

/**
 * Evaluates whether the agent in `selfSlot` has their Additional Ability (额外能力)
 * triggered given the 3 selected agent names in `team`.
 */
export function evaluateAdditionalAbility(
  selfSlot: AgentSlotKey,
  team: Record<AgentSlotKey, string>,
  buffDesc?: string,
): AdditionalAbilityEvalResult {
  const selfName = team[selfSlot];
  if (!selfName) {
    return { triggered: false, conditionLine: '', matchedReasons: [] };
  }

  let descToUse = buffDesc;
  if (!descToUse) {
    const addBuff = (AGENT_BUFFS[selfName] ?? []).find((b) => b.subType === '额外能力');
    descToUse = addBuff?.desc ?? '';
  }

  const conditionLine = extractConditionLine(descToUse);
  if (!conditionLine) {
    return { triggered: false, conditionLine: '', matchedReasons: [] };
  }

  const selfMeta = getAgentMeta(selfName);
  if (!selfMeta) {
    return { triggered: false, conditionLine, matchedReasons: [] };
  }

  const allowSameElement = conditionLine.includes('属性');
  const allowSameFaction = conditionLine.includes('阵营');
  const allowParryAssist = conditionLine.includes('[招架支援]');
  const allowedProfessions = PROFESSIONS.filter((p) => conditionLine.includes(`[${p}]`));

  const matchedReasons: string[] = [];
  const otherSlots: AgentSlotKey[] = (['main', 'sup1', 'sup2'] as const).filter(
    (s) => s !== selfSlot,
  );

  for (const otherSlot of otherSlots) {
    const mateName = team[otherSlot];
    if (!mateName || mateName === selfName) continue;
    const mateMeta = getAgentMeta(mateName);
    if (!mateMeta) continue;
    if (selfMeta.id && mateMeta.id && selfMeta.id === mateMeta.id) continue;

    const reasonsForMate: string[] = [];

    if (allowSameElement) {
      const selfElem = selfMeta.baseElement || selfMeta.element;
      const mateElem = mateMeta.baseElement || mateMeta.element;
      if (
        (selfElem && mateElem && selfElem === mateElem) ||
        (selfMeta.element && mateMeta.element && selfMeta.element === mateMeta.element)
      ) {
        reasonsForMate.push(`同属性·${mateElem || mateMeta.element}`);
      }
    }

    if (allowSameFaction) {
      if (selfMeta.faction && mateMeta.faction && selfMeta.faction === mateMeta.faction) {
        reasonsForMate.push(`同阵营·${mateMeta.faction}`);
      }
    }

    for (const prof of allowedProfessions) {
      if (mateMeta.type === prof) {
        reasonsForMate.push(`${prof}角色`);
      }
    }

    if (allowParryAssist && !EVASIVE_ASSIST_ONLY.has(mateName)) {
      reasonsForMate.push('招架支援');
    }

    if (reasonsForMate.length > 0) {
      matchedReasons.push(`${mateName} (${reasonsForMate.join('/')})`);
    }
  }

  return {
    triggered: matchedReasons.length > 0,
    conditionLine,
    matchedReasons,
  };
}
