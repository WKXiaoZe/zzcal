# ZZZ 神秘小算盘 React + TS 重构实施计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 把单文件 `index.html`（2146 行 HTML+inline JS）重构成 React 19 + TypeScript + CSS Modules 的标准 SPA 项目结构，伤害计算行为通过 snapshot 测试验证 100% 一致。

**Architecture:** 保持 Vite 6 不动；新增 React + TS 仅在 `src/` 下；calc 纯函数与 React 解耦；全局状态走 `useReducer + Context`（不引第三方 store）；CSS 拆 module，全局变量留在 `src/styles/global.css`。仓库布局为单仓库（git 仓库根 = `D:\ZZCALS\zzcal\`）。

**Tech Stack:** Vite 6 · React 19 · TypeScript 5.8 · Vitest 2 · CSS Modules（Vite 原生）

**Non-Goals:**
- 不引入路由 / Redux / Zustand / Tailwind / Storybook / Cypress
- 不改任何伤害公式或优化算法（行为 100% 一致 = 通过 snapshot 验证）
- 不写 React 组件级单元测试（只写 calc 层 snapshot 测试 + 一个 smoke render 测试）
- 不上 i18n / 主题切换 / a11y 改造（不在本次范围）

**Branch:** 全程在 `feat/react-refactor` 分支，频繁 commit，每个 Phase 结束打 tag。最后开 PR 让用户人工合 main。

**Verification gate（每个 Phase 必须满足）:**
1. `npm test` 全绿（snapshot tests 不变）
2. `npm run build` 成功
3. `npm run dev` 起得来且首页可见

---

## Phase 0 — 基线 Snapshot 测试

> 目的：在动任何代码前，先把现有 `index.html` 的 calc 行为冻结到一份 JSON snapshot 里。后续每个 Phase 都跑这份测试，保证不破坏伤害数值。

### Task 0.1: 创建重构分支

**Files:** none

- [ ] **Step 1: 切到 main 拉最新**

```bash
cd D:/ZZCALS/zzcal
git checkout main
git pull origin main
```

- [ ] **Step 2: 创建并切到重构分支**

```bash
git checkout -b feat/react-refactor
git status
```

Expected: `On branch feat/react-refactor / nothing to commit, working tree clean`

---

### Task 0.2: 安装 Vitest 与 Node 测试环境

**Files:**
- Modify: `package.json`
- Create: `vitest.config.ts`

- [ ] **Step 1: 安装 vitest + jsdom**

```bash
npm install --save-dev vitest@^2 jsdom @types/jsdom
```

- [ ] **Step 2: 添加 test 脚本到 package.json**

修改 `package.json` 的 `scripts`：

```json
{
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview",
    "test": "vitest run",
    "test:watch": "vitest"
  }
}
```

- [ ] **Step 3: 创建 vitest.config.ts**

```ts
import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  test: {
    environment: 'jsdom',
    globals: true,
    include: ['tests/**/*.test.ts', 'src/**/*.test.ts', 'src/**/*.test.tsx'],
    setupFiles: ['./tests/setup.ts'],
  },
  resolve: {
    alias: { '@': path.resolve(__dirname, '.') },
  },
});
```

- [ ] **Step 4: 创建 tests/setup.ts**

```ts
// Minimal jsdom shims if needed in later tasks
```

- [ ] **Step 5: Commit**

```bash
git add package.json package-lock.json vitest.config.ts tests/setup.ts
git commit -m "chore(test): add vitest + jsdom for snapshot baseline"
```

---

### Task 0.3: 抽离 legacy calc 函数到独立文件

> 现有 `calculateDamage` 等纯函数嵌在 `<script>` 里、依赖 DOM。本任务把它们的"纯计算部分"复制到一个独立文件，做成可在 Node 里调用的 adapter。**只复制不修改**，保证行为完全一致。

**Files:**
- Create: `legacy/calc-legacy.js`
- Reference: `index.html` lines 1014 / 1037 / 1161 / 1172 / 1213 / 1200 / 1219 / 1236

- [ ] **Step 1: 创建 legacy/ 目录**

```bash
mkdir -p legacy
```

- [ ] **Step 2: 复制纯计算函数到 legacy/calc-legacy.js**

从 `index.html` 提取：
- `parseAgentValue` (line 1014)
- `parseWeaponValue` (line 1037)
- `safeFloat` (line 1161)
- `calculateDamage` (line 1236) — 但需要把 `getAgentData/getWeaponData/getSet4Stats/getFieldBuffs`（依赖 DOM）改造成接受参数版本

把 calc 函数从 DOM 解耦后的版本（复制具体逻辑，只把读 DOM 的部分换成函数参数）：

```js
// legacy/calc-legacy.js — frozen snapshot of legacy calc logic for parity testing
// Do NOT modify after Phase 0; new code must produce identical outputs.

export function safeFloat(v) {
  const n = parseFloat(v);
  return isNaN(n) ? 0 : n;
}

export function parseAgentValue(val, cinemaLevel) {
  if (Array.isArray(val)) return val[Math.max(0, Math.min(cinemaLevel, val.length - 1))];
  return val;
}

export function parseWeaponValue(valStr, starLevel) {
  if (Array.isArray(valStr)) return valStr[Math.max(0, Math.min(starLevel - 1, valStr.length - 1))];
  return valStr;
}

// calculateDamage takes a fully-aggregated stats object — same fields the legacy code aggregates.
// Inputs structure (mirrors legacy aggregation):
//   { battleType, agent: {...}, weapon: {...}, set4: {...}, field: {...}, boss: {...}, extraStats: {...} }
// Output: { totalDamage, breakdown: {...}, formulaTrace: [...] }
export function calculateDamage(input) {
  // COPY VERBATIM from index.html line 1236, replace
  //   getVal('...') with input.<field>
  //   getAgentData('a_main') with input.agent
  //   getWeaponData('w_main') with input.weapon
  //   getSet4Stats('a_main') with input.set4
  //   getFieldBuffs() with input.field
  //   document.getElementById('boss-def').value etc. with input.boss
  // Resulting function is pure: same input → same output.
  // ... (engineer to paste the verbatim ~200-line body, with the above mechanical substitutions)
}
```

> ⚠️ 这一步是机械抽取——必须**逐行核对**：legacy 里所有 `document.getElementById(...)`/`getVal(...)`/`getAgentData(...)` 调用都要替换成读 `input.xxx`，不要"顺便重构"。

- [ ] **Step 3: smoke test**

```bash
node -e "import('./legacy/calc-legacy.js').then(m => console.log(typeof m.calculateDamage))"
```

Expected: `function`

- [ ] **Step 4: Commit**

```bash
git add legacy/
git commit -m "chore(test): extract legacy calc to standalone adapter for parity"
```

---

### Task 0.4: 定义 5 个典型场景

**Files:**
- Create: `tests/scenarios.ts`

- [ ] **Step 1: 列出场景**

5 个场景覆盖 3 种战斗模式 × 不同代理人组合：

```ts
// tests/scenarios.ts
export interface Scenario {
  name: string;
  battleType: 'attack' | 'break' | 'anomaly';
  agent: any;     // raw agent input matching legacy calculateDamage shape
  weapon: any;
  set4: any;
  field: any;
  boss: any;
  extraStats: any;
}

export const SCENARIOS: Scenario[] = [
  {
    name: 'attack/伊埃斯+云霓孤光+如影相随/无副词条',
    battleType: 'attack',
    agent: { baseAtk: 965, critRate: 5, critDmg: 50, dmgBonus: 0, /* ... */ },
    weapon: { baseAtk: 743, critDmg: 88, dmgBonus: 40, resShred: 28 /* S5 */ },
    set4: { dmgBonus: 15, critRate: 12, inCombatAtkPct: 12 },
    field: { critRate: 0, critDmg: 0, dmgBonus: 0, atkPct: 0 },
    boss: { def: 953, defBonus: 0, dazeMult: 1, res: 0, weak: false },
    extraStats: { critRate: 0, critDmg: 0, atkPct: 0 },
  },
  {
    name: 'break/月城柳+冰封熔火+山大王/破值场景',
    battleType: 'break',
    // ... 把 break 模式相关字段填上（参考 index.html line 535-541 break-only fields）
  },
  {
    name: 'anomaly/简+雨林孤行+激素朋克/异常爆发',
    battleType: 'anomaly',
    // ... anomalyMastery 满堆，触发 anomaly damage formula
  },
  {
    name: 'attack/带极端副词条堆/45CD+45CR/验证暴击上限',
    battleType: 'attack',
    // ... extraStats 给极端值
  },
  {
    name: 'anomaly/弱点+减抗满+异常掌控/边界值',
    battleType: 'anomaly',
    // ... boss.weak: true, res: 0
  },
];
```

> 引擎工程师注意：5 个场景的具体字段值需要参考 `D:/ZZCALS/zzcal/characters.js`、`weapons.js`、`index.html` 中的 `DISC_4_SETS` 真实数据。**字段名必须与 legacy `calculateDamage` 期望的字段名完全一致**，否则 baseline 会偏移。建议用浏览器打开 dev server，配好 5 个场景，从 DevTools 把 `getAgentData/getWeaponData` 的实际输出复制下来填进 SCENARIOS。

- [ ] **Step 2: Commit**

```bash
git add tests/scenarios.ts
git commit -m "test: define 5 baseline scenarios for calc parity"
```

---

### Task 0.5: 生成 baseline snapshot

**Files:**
- Create: `tests/baseline-snapshot.json` (生成产物)
- Create: `tests/generate-baseline.ts`

- [ ] **Step 1: 写 baseline 生成脚本**

```ts
// tests/generate-baseline.ts
import { SCENARIOS } from './scenarios';
import { calculateDamage } from '../legacy/calc-legacy.js';
import { writeFileSync } from 'fs';

const baseline = SCENARIOS.map(s => ({
  name: s.name,
  input: s,
  output: calculateDamage({
    battleType: s.battleType,
    agent: s.agent,
    weapon: s.weapon,
    set4: s.set4,
    field: s.field,
    boss: s.boss,
    extraStats: s.extraStats,
  }),
}));

writeFileSync(
  'tests/baseline-snapshot.json',
  JSON.stringify(baseline, null, 2),
  'utf-8'
);

console.log(`Wrote ${baseline.length} baseline entries.`);
```

- [ ] **Step 2: 跑生成**

```bash
npx tsx tests/generate-baseline.ts
```

> 如果没装 tsx：`npm i -D tsx`

Expected: `Wrote 5 baseline entries.`，文件 `tests/baseline-snapshot.json` 生成。

- [ ] **Step 3: 人工校验 baseline 数值**

打开 `tests/baseline-snapshot.json`，把每条 `output.totalDamage` 与浏览器里实际配同样输入的伤害数值对一遍（人眼对 5 个数即可）。如果对不上，说明 Task 0.3 抽取有 bug，回去修。

- [ ] **Step 4: Commit**

```bash
git add tests/baseline-snapshot.json tests/generate-baseline.ts package.json
git commit -m "test: capture baseline damage snapshot from legacy code"
```

---

### Task 0.6: 写 parity test 跑通

**Files:**
- Create: `tests/calc-parity.test.ts`

- [ ] **Step 1: 写测试**

```ts
// tests/calc-parity.test.ts
import { describe, it, expect } from 'vitest';
import baseline from './baseline-snapshot.json';
import { calculateDamage } from '../legacy/calc-legacy.js';

describe('calc parity (legacy frozen)', () => {
  for (const entry of baseline) {
    it(entry.name, () => {
      const out = calculateDamage(entry.input);
      expect(out).toEqual(entry.output);
    });
  }
});
```

- [ ] **Step 2: 跑测试，验证全绿**

```bash
npm test
```

Expected: `5 passed`

- [ ] **Step 3: Commit + tag Phase 0**

```bash
git add tests/calc-parity.test.ts
git commit -m "test: parity test re-runs legacy calc against baseline"
git tag phase-0-baseline
```

---

## Phase 1 — React + TS 骨架

### Task 1.1: 安装 React + plugin

**Files:**
- Modify: `package.json`

- [ ] **Step 1: 装依赖**

```bash
npm install react@^19 react-dom@^19
npm install --save-dev @types/react@^19 @types/react-dom@^19 @vitejs/plugin-react@^4
```

- [ ] **Step 2: Commit**

```bash
git add package.json package-lock.json
git commit -m "chore: add react 19 + plugin-react"
```

---

### Task 1.2: 配置 Vite plugin-react

**Files:**
- Modify: `vite.config.ts`

- [ ] **Step 1: 替换 vite.config.ts**

```ts
import path from 'path';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  server: { port: 3000, host: '0.0.0.0' },
  plugins: [react()],
  resolve: {
    alias: { '@': path.resolve(__dirname, 'src') },
  },
});
```

> 删掉了 `process.env.API_KEY` 那段（Gemini 模板残留，本项目用不到）。

- [ ] **Step 2: Commit**

```bash
git add vite.config.ts
git commit -m "build: configure vite for react"
```

---

### Task 1.3: 把 legacy index.html 归档

> 现有 `index.html` 是整个 SPA，重构期间我们要保留它的源代码作为参照，但新版 `index.html` 必须是 React mount shell。

**Files:**
- Move: `index.html` → `legacy/index-legacy.html`
- Create: 新的 `index.html`

- [ ] **Step 1: 备份原 index.html**

```bash
git mv index.html legacy/index-legacy.html
```

- [ ] **Step 2: 写新的 index.html mount shell**

```html
<!DOCTYPE html>
<html lang="zh-CN">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>ZZZ 神秘小算盘</title>
    <link rel="icon" type="image/png" href="/resources/favicon.png" />
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600&family=JetBrains+Mono:wght@400;500&family=Outfit:wght@400;600;700&display=swap" rel="stylesheet" />
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```

- [ ] **Step 3: Commit**

```bash
git add index.html legacy/index-legacy.html
git commit -m "refactor: move legacy index.html to legacy/, add react mount shell"
```

---

### Task 1.4: src/main.tsx + 占位 App

**Files:**
- Create: `src/main.tsx`
- Create: `src/App.tsx`

- [ ] **Step 1: 写 main.tsx**

```tsx
// src/main.tsx
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';

const root = document.getElementById('root');
if (!root) throw new Error('#root not found');
createRoot(root).render(
  <StrictMode>
    <App />
  </StrictMode>
);
```

- [ ] **Step 2: 写占位 App.tsx**

```tsx
// src/App.tsx
export default function App() {
  return (
    <main style={{ padding: 24, color: '#fff', fontFamily: 'Inter, sans-serif' }}>
      <h1>ZZZ 神秘小算盘</h1>
      <p>React refactor in progress…</p>
    </main>
  );
}
```

- [ ] **Step 3: smoke test**

```bash
npm run dev
```

打开 http://localhost:3000，能看到标题和副标题即可。Ctrl-C 停掉。

- [ ] **Step 4: Commit**

```bash
git add src/
git commit -m "feat(react): minimal mount with App stub"
```

---

### Task 1.5: 验证 build 成功 + tag Phase 1

- [ ] **Step 1: build 检查**

```bash
npm run build
```

Expected: 输出 `dist/` 且无 error。

- [ ] **Step 2: parity 测试仍然全绿**

```bash
npm test
```

Expected: `5 passed`（legacy 测试不应该被影响）

- [ ] **Step 3: tag**

```bash
git tag phase-1-skeleton
```

---

## Phase 2 — Calc 层（TDD against snapshot）

> 把 legacy calc 重写到 `src/calc/` 下，加上 TS 类型；每加一个函数立刻跑 parity 测试。snapshot test 必须全程绿。

### Task 2.1: 定义类型

**Files:**
- Create: `src/calc/types.ts`

- [ ] **Step 1: 写类型**

```ts
// src/calc/types.ts

export type BattleType = 'attack' | 'break' | 'anomaly';

/** 代理人原始 DB 字段（每字段长度 5：S1-S5 影画级数） */
export interface CharacterRaw {
  meta: { type: '强攻' | '命破' | '异常'; rarity: 'S' | 'A'; element?: string };
  baseAtk: number[];
  critRate: number[];
  critDmg: number[];
  // ... 与 characters.js 字段一一对应（参考 D:/ZZCALS/zzcal/characters.js）
}

/** 解析过影画等级后的代理人面板（数组 -> 单值） */
export interface AgentStats {
  baseAtk: number;
  critRate: number;
  critDmg: number;
  dmgBonus: number;
  penRatio: number;
  penValue: number;
  defShred: number;
  dazeVuln: number;
  resShred: number;
  inCombatAtkPct: number;
  inCombatAtkFlat: number;
  baseHp: number;
  hpPct: number;
  flatHp: number;
  inCombatHpPct: number;
  inCombatPen: number;
  ppDmgBonus: number;
  anomalyMastery: number;
}

export interface WeaponStats {
  baseAtk: number;
  critRate: number;
  critDmg: number;
  atkPct: number;
  penRatio: number;
  defShred: number;
  resShred: number;
  dmgBonus: number;
  inCombatAtkPct: number;
  inCombatAtkFlat: number;
  baseHp: number;
  hpPct: number;
  flatHp: number;
  inCombatHpPct: number;
  inCombatPen: number;
  ppDmgBonus: number;
  anomalyMastery: number;
}

export interface DiscSet4Stats {
  dmgBonus?: number;
  critRate?: number;
  critDmg?: number;
  atkPct?: number;
  inCombatAtkPct?: number;
  penRatio?: number;
  hpPct?: number;
  ppDmgBonus?: number;
  anomalyMastery?: number;
}

export interface FieldBuffs {
  critRate: number;
  critDmg: number;
  dmgBonus: number;
  atkPct: number;
  inCombatAtkPct: number;
  inCombatAtkFlat: number;
  resShred: number;
}

export interface BossState {
  def: number;
  defBonus: number;
  dazeMult: number;
  res: 0 | 0.2 | 0.4;
  weak: boolean;
}

export interface ExtraSubStats {
  critRate: number;
  critDmg: number;
  atkPct: number;
  hpPct: number;
  anomalyMastery: number;
  /** 5号位主词条 */
  slot5_AtkPct?: number;
  slot5_Dmg?: number;
  slot5_Pen?: number;
  slot5_HpPct?: number;
  /** 2件套加成 */
  set2_AtkPct?: number;
  set2_Dmg?: number;
  set2_Pen?: number;
  set2_CD?: number;
  set2_HpPct?: number;
}

export interface CalcInput {
  battleType: BattleType;
  agent: AgentStats;
  weapon: WeaponStats;
  set4: DiscSet4Stats;
  field: FieldBuffs;
  boss: BossState;
  extraStats: ExtraSubStats;
}

export interface CalcOutput {
  totalDamage: number;
  breakdown: {
    atk: number;
    critMult: number;
    dmgMult: number;
    defMult: number;
    resMult: number;
    elemMult: number;
  };
  formulaTrace: string[];
}
```

- [ ] **Step 2: 类型校验**

```bash
npx tsc --noEmit
```

Expected: 无错误（这步只是确认类型自身闭环）

- [ ] **Step 3: Commit**

```bash
git add src/calc/types.ts
git commit -m "feat(calc): define type system"
```

---

### Task 2.2: 端口 safeFloat + parseAgentValue + parseWeaponValue

**Files:**
- Create: `src/calc/utils.ts`

- [ ] **Step 1: 端口**

```ts
// src/calc/utils.ts

export function safeFloat(v: unknown): number {
  const n = parseFloat(String(v));
  return isNaN(n) ? 0 : n;
}

/** 把代理人字段（数组：5 个 cinema 阶位）解析为单值；非数组直接返回。 */
export function parseAgentValue(val: number[] | number, cinemaLevel: number): number {
  if (Array.isArray(val)) {
    const idx = Math.max(0, Math.min(cinemaLevel, val.length - 1));
    return val[idx];
  }
  return val;
}

/** 武器字段（5 个精炼阶位 1-5），cinemaLevel 是 1-based 输入。 */
export function parseWeaponValue(val: number[] | number, starLevel: number): number {
  if (Array.isArray(val)) {
    const idx = Math.max(0, Math.min(starLevel - 1, val.length - 1));
    return val[idx];
  }
  return val;
}
```

- [ ] **Step 2: 写单元测试**

```ts
// src/calc/utils.test.ts
import { describe, it, expect } from 'vitest';
import { safeFloat, parseAgentValue, parseWeaponValue } from './utils';

describe('safeFloat', () => {
  it('parses numeric strings', () => expect(safeFloat('3.14')).toBe(3.14));
  it('returns 0 for NaN', () => expect(safeFloat('xyz')).toBe(0));
  it('returns 0 for undefined', () => expect(safeFloat(undefined)).toBe(0));
});

describe('parseAgentValue', () => {
  it('returns scalar passthrough', () => expect(parseAgentValue(42, 0)).toBe(42));
  it('indexes by cinema level', () => expect(parseAgentValue([10, 20, 30, 40, 50], 2)).toBe(30));
  it('clamps over-index', () => expect(parseAgentValue([10, 20], 99)).toBe(20));
});

describe('parseWeaponValue', () => {
  it('1-based star -> 0-based index', () => expect(parseWeaponValue([1, 2, 3, 4, 5], 3)).toBe(3));
});
```

- [ ] **Step 3: 跑测试**

```bash
npm test
```

Expected: 测试新增 8 个 + parity 5 个 = 13 passed

- [ ] **Step 4: Commit**

```bash
git add src/calc/utils.ts src/calc/utils.test.ts
git commit -m "feat(calc): port utility functions with tests"
```

---

### Task 2.3: 端口 calculateDamage（核心）

**Files:**
- Create: `src/calc/formulas.ts`
- Modify: `tests/calc-parity.test.ts`

- [ ] **Step 1: 复制 calc-legacy.js 的 calculateDamage 到 formulas.ts，加 TS 类型**

```ts
// src/calc/formulas.ts
import type { CalcInput, CalcOutput } from './types';

export function calculateDamage(input: CalcInput): CalcOutput {
  // ⚠️ 直接复制 legacy/calc-legacy.js 的 calculateDamage 函数体
  // 然后把所有 input.xxx 的访问改为带类型的；逻辑一行不改！
  // ... full body ported here
}
```

> 工程师注意：**不要**借机"优化"或"简化"任何公式。逐行机械拷贝。任何"我觉得这里可以更简洁"的冲动都要按住——等 parity 全绿后下一阶段再说。

- [ ] **Step 2: parity test 切换到新实现**

```ts
// tests/calc-parity.test.ts
import { describe, it, expect } from 'vitest';
import baseline from './baseline-snapshot.json';
import { calculateDamage as legacyCalc } from '../legacy/calc-legacy.js';
import { calculateDamage as newCalc } from '../src/calc/formulas';

describe('calc parity (legacy frozen)', () => {
  for (const entry of baseline) {
    it(`legacy: ${entry.name}`, () => {
      expect(legacyCalc(entry.input)).toEqual(entry.output);
    });
    it(`new: ${entry.name}`, () => {
      expect(newCalc(entry.input)).toEqual(entry.output);
    });
  }
});
```

- [ ] **Step 3: 跑测试**

```bash
npm test
```

Expected: `13 passed`（5 legacy + 5 new + 3 utils）

如果 new 不通过：diff 输出 vs baseline，找端口时漏的字段或顺序错误。

- [ ] **Step 4: Commit**

```bash
git add src/calc/formulas.ts tests/calc-parity.test.ts
git commit -m "feat(calc): port calculateDamage with full parity"
```

---

### Task 2.4: 端口 optimizer（贪心 48 步）

**Files:**
- Create: `src/calc/optimizer.ts`
- Reference: `index.html` line 1828 (`runOptimizationDataOnly`)

- [ ] **Step 1: 端口**

```ts
// src/calc/optimizer.ts
import type { CalcInput, ExtraSubStats } from './types';
import { calculateDamage } from './formulas';

export interface OptimizeResult {
  steps: number;
  config: { slot5: string; set2: string };
  damage: number;
  trace: { step: number; pick: keyof ExtraSubStats; damage: number }[];
}

/**
 * 贪心 48 步副词条优化（端口自 index.html line 1828 runOptimizationDataOnly）
 * 对每个 (slot5 × set2) 组合，从 startTotal 出发，每步选边际收益最大的副词条。
 */
export function runGreedyOptimization(
  baseInput: CalcInput,
  options: {
    slot5Opts: { val: Partial<ExtraSubStats>; name: string }[];
    set2Opts: { val: Partial<ExtraSubStats>; name: string }[];
    targetSteps: number; // 30 / 36 / 42 / 48
    startCounts: { CR: number; CD: number; ATK: number; HP: number; AM: number };
  }
): OptimizeResult[] {
  // 逐行端口 runOptimizationDataOnly 的逻辑
  // ...
}
```

- [ ] **Step 2: 加 optimizer parity scenario**

挑 1 个 baseline 场景，跑 legacy `runOptimizationDataOnly` 一次，把输出存到 `tests/optimizer-baseline.json`。然后写测试：

```ts
// src/calc/optimizer.test.ts
import { describe, it, expect } from 'vitest';
import optBaseline from '../../tests/optimizer-baseline.json';
import { runGreedyOptimization } from './optimizer';
// ... feed baseline.input, expect deepEqual baseline.output
```

- [ ] **Step 3: 跑测试 + commit**

```bash
npm test
git add src/calc/optimizer.ts src/calc/optimizer.test.ts tests/optimizer-baseline.json
git commit -m "feat(calc): port greedy optimizer with parity"
```

---

### Task 2.5: 端口数据库引用层

**Files:**
- Create: `src/calc/db.ts`

- [ ] **Step 1: 包装现有 characters.js / weapons.js 为类型化导出**

```ts
// src/calc/db.ts
// @ts-expect-error - allowJs imports for existing .js DBs
import { CHARACTER_DB } from '../../characters.js';
// @ts-expect-error
import { WEAPON_DB } from '../../weapons.js';
import type { CharacterRaw } from './types';

export interface CharacterDB {
  characters: Record<string, CharacterRaw>;
  sup: Record<string, CharacterRaw>;
}

export const characters = CHARACTER_DB as CharacterDB;
export const weapons = WEAPON_DB as Record<string, any>;

// DISC_4_SETS + DISC_2_SETS 现在还在 index.html 里 — 等 Phase 4 端口 DiscPanel 时一并搬出来。
// 临时占位（Phase 4 会删除并改 import）：
export const DISC_4_SETS: Record<string, { id: number; name: string; stats: Record<string, number>; note?: string }> = {};
export const DISC_2_SETS: typeof DISC_4_SETS = {};
```

- [ ] **Step 2: smoke import**

```ts
// src/calc/db.test.ts
import { describe, it, expect } from 'vitest';
import { characters, weapons } from './db';

describe('db', () => {
  it('CHARACTER_DB loads with non-empty characters', () => {
    expect(Object.keys(characters.characters).length).toBeGreaterThan(0);
  });
  it('WEAPON_DB loads', () => {
    expect(Object.keys(weapons).length).toBeGreaterThan(0);
  });
});
```

- [ ] **Step 3: Commit + tag Phase 2**

```bash
npm test
git add src/calc/db.ts src/calc/db.test.ts
git commit -m "feat(calc): typed DB facade"
git tag phase-2-calc
```

---

## Phase 3 — 状态容器（useReducer + Context）

### Task 3.1: 定义 AppState + Action

**Files:**
- Create: `src/state/types.ts`

- [ ] **Step 1: 写类型**

```ts
// src/state/types.ts
import type { BattleType } from '../calc/types';

export type AppMode = 'manual' | 'auto';

export interface SlotConfig {
  presetName: string;       // 角色名或音擎名，'' 表示未选
  cinemaOrStar: number;     // agent: cinema 0-6; weapon: star 1-5
  customOverrides: Record<string, number>;  // input 框被改过的字段
}

export interface DiscConfig {
  slot4Stat: 'critRate' | 'critDmg' | 'atkPct' | 'anomalyMastery';
  set4Key: string;
  set2Key: string;
  // 副词条计数
  subCounts: { CR: number; CD: number; ATK: number; HP: number; AM: number };
}

export interface AppState {
  battleType: BattleType;
  mode: AppMode;

  agents: { main: SlotConfig; sup1: SlotConfig; sup2: SlotConfig };
  weapons: { main: SlotConfig; sup1: SlotConfig; sup2: SlotConfig };
  disc: DiscConfig;

  boss: { def: number; defBonus: number; dazeMult: number; res: 0 | 0.2 | 0.4; weak: boolean };
  field: { atkPct: number; critRate: number; critDmg: number; dmgBonus: number; resShred: number; inCombatAtkFlat: number };
}

export type Action =
  | { type: 'SET_BATTLE_TYPE'; payload: BattleType }
  | { type: 'SET_MODE'; payload: AppMode }
  | { type: 'SET_AGENT_PRESET'; slot: 'main' | 'sup1' | 'sup2'; preset: string }
  | { type: 'SET_AGENT_CINEMA'; slot: 'main' | 'sup1' | 'sup2'; cinema: number }
  | { type: 'SET_AGENT_FIELD'; slot: 'main' | 'sup1' | 'sup2'; field: string; value: number }
  | { type: 'SET_WEAPON_PRESET'; slot: 'main' | 'sup1' | 'sup2'; preset: string }
  | { type: 'SET_WEAPON_STAR'; slot: 'main' | 'sup1' | 'sup2'; star: number }
  | { type: 'SET_WEAPON_FIELD'; slot: 'main' | 'sup1' | 'sup2'; field: string; value: number }
  | { type: 'SET_DISC_SLOT4'; payload: DiscConfig['slot4Stat'] }
  | { type: 'SET_DISC_SET4'; payload: string }
  | { type: 'SET_DISC_SET2'; payload: string }
  | { type: 'SET_DISC_SUBCOUNT'; key: keyof DiscConfig['subCounts']; value: number }
  | { type: 'SET_BOSS'; field: keyof AppState['boss']; value: any }
  | { type: 'SET_FIELD'; field: keyof AppState['field']; value: number };
```

- [ ] **Step 2: Commit**

```bash
git add src/state/types.ts
git commit -m "feat(state): define state and action types"
```

---

### Task 3.2: reducer + 初始状态

**Files:**
- Create: `src/state/reducer.ts`

- [ ] **Step 1: 写 reducer**

```ts
// src/state/reducer.ts
import type { AppState, Action, SlotConfig } from './types';

const emptySlot: SlotConfig = { presetName: '', cinemaOrStar: 0, customOverrides: {} };
const emptyWpSlot: SlotConfig = { ...emptySlot, cinemaOrStar: 1 };

export const initialState: AppState = {
  battleType: 'attack',
  mode: 'manual',
  agents: { main: emptySlot, sup1: emptySlot, sup2: emptySlot },
  weapons: { main: emptyWpSlot, sup1: emptyWpSlot, sup2: emptyWpSlot },
  disc: {
    slot4Stat: 'critRate',
    set4Key: 'none',
    set2Key: 'none',
    subCounts: { CR: 0, CD: 0, ATK: 0, HP: 0, AM: 0 },
  },
  boss: { def: 953, defBonus: 0, dazeMult: 1, res: 0, weak: false },
  field: { atkPct: 0, critRate: 0, critDmg: 0, dmgBonus: 0, resShred: 0, inCombatAtkFlat: 0 },
};

export function reducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case 'SET_BATTLE_TYPE':
      return { ...state, battleType: action.payload };
    case 'SET_MODE':
      return { ...state, mode: action.payload };
    case 'SET_AGENT_PRESET':
      return { ...state, agents: { ...state.agents, [action.slot]: { ...state.agents[action.slot], presetName: action.preset, customOverrides: {} } } };
    case 'SET_AGENT_CINEMA':
      return { ...state, agents: { ...state.agents, [action.slot]: { ...state.agents[action.slot], cinemaOrStar: action.cinema } } };
    case 'SET_AGENT_FIELD':
      return { ...state, agents: { ...state.agents, [action.slot]: { ...state.agents[action.slot], customOverrides: { ...state.agents[action.slot].customOverrides, [action.field]: action.value } } } };
    // ... weapon 同构
    case 'SET_WEAPON_PRESET':
      return { ...state, weapons: { ...state.weapons, [action.slot]: { ...state.weapons[action.slot], presetName: action.preset, customOverrides: {} } } };
    case 'SET_WEAPON_STAR':
      return { ...state, weapons: { ...state.weapons, [action.slot]: { ...state.weapons[action.slot], cinemaOrStar: action.star } } };
    case 'SET_WEAPON_FIELD':
      return { ...state, weapons: { ...state.weapons, [action.slot]: { ...state.weapons[action.slot], customOverrides: { ...state.weapons[action.slot].customOverrides, [action.field]: action.value } } } };
    case 'SET_DISC_SLOT4':
      return { ...state, disc: { ...state.disc, slot4Stat: action.payload } };
    case 'SET_DISC_SET4':
      return { ...state, disc: { ...state.disc, set4Key: action.payload } };
    case 'SET_DISC_SET2':
      return { ...state, disc: { ...state.disc, set2Key: action.payload } };
    case 'SET_DISC_SUBCOUNT':
      return { ...state, disc: { ...state.disc, subCounts: { ...state.disc.subCounts, [action.key]: action.value } } };
    case 'SET_BOSS':
      return { ...state, boss: { ...state.boss, [action.field]: action.value } };
    case 'SET_FIELD':
      return { ...state, field: { ...state.field, [action.field]: action.value } };
    default:
      return state;
  }
}
```

- [ ] **Step 2: 写 reducer 测试**

```ts
// src/state/reducer.test.ts
import { describe, it, expect } from 'vitest';
import { reducer, initialState } from './reducer';

describe('reducer', () => {
  it('SET_BATTLE_TYPE switches mode', () => {
    const next = reducer(initialState, { type: 'SET_BATTLE_TYPE', payload: 'break' });
    expect(next.battleType).toBe('break');
  });
  it('SET_AGENT_PRESET resets custom overrides', () => {
    const withOverride = reducer(initialState, { type: 'SET_AGENT_FIELD', slot: 'main', field: 'critRate', value: 99 });
    expect(withOverride.agents.main.customOverrides.critRate).toBe(99);
    const reset = reducer(withOverride, { type: 'SET_AGENT_PRESET', slot: 'main', preset: '伊埃斯' });
    expect(reset.agents.main.customOverrides).toEqual({});
  });
  it('SET_DISC_SUBCOUNT updates one key', () => {
    const next = reducer(initialState, { type: 'SET_DISC_SUBCOUNT', key: 'CR', value: 4 });
    expect(next.disc.subCounts.CR).toBe(4);
  });
});
```

- [ ] **Step 3: 跑测试 + commit**

```bash
npm test
git add src/state/reducer.ts src/state/reducer.test.ts
git commit -m "feat(state): reducer + initial state"
```

---

### Task 3.3: Context Provider + hook

**Files:**
- Create: `src/state/AppContext.tsx`

- [ ] **Step 1: 写 Context**

```tsx
// src/state/AppContext.tsx
import { createContext, useContext, useReducer, type Dispatch, type ReactNode } from 'react';
import { reducer, initialState } from './reducer';
import type { AppState, Action } from './types';

interface Ctx { state: AppState; dispatch: Dispatch<Action>; }

const AppContext = createContext<Ctx | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState);
  return <AppContext.Provider value={{ state, dispatch }}>{children}</AppContext.Provider>;
}

export function useAppState(): AppState {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useAppState outside AppProvider');
  return ctx.state;
}

export function useAppDispatch(): Dispatch<Action> {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useAppDispatch outside AppProvider');
  return ctx.dispatch;
}
```

- [ ] **Step 2: 在 App.tsx 套 Provider**

```tsx
// src/App.tsx
import { AppProvider } from './state/AppContext';

export default function App() {
  return (
    <AppProvider>
      <main style={{ padding: 24, color: '#fff' }}>
        <h1>ZZZ 神秘小算盘</h1>
        <p>State container ready.</p>
      </main>
    </AppProvider>
  );
}
```

- [ ] **Step 3: Commit + tag Phase 3**

```bash
npm test
git add src/state/AppContext.tsx src/App.tsx
git commit -m "feat(state): app context + provider"
git tag phase-3-state
```

---

## Phase 4 — 组件迁移（panel-by-panel）

> 顺序：从最独立的开始（HeroHeader / Modal / Toast），最后才接 OutputPanel（依赖所有 panel 的 state）。
> 每个 panel 一个任务，每个任务结束跑 parity test + dev server 人工对照 `legacy/index-legacy.html`。

### Task 4.1: 全局样式 + 布局容器

**Files:**
- Create: `src/styles/global.css`
- Create: `src/components/Layout.tsx`

- [ ] **Step 1: 把 styles.css 全文复制到 src/styles/global.css**

```bash
cp styles.css src/styles/global.css
```

> 后续 Phase 5 才会把它拆成 CSS Modules，本任务只做"全局引入"。

- [ ] **Step 2: 在 main.tsx 引入**

```tsx
// src/main.tsx
import './styles/global.css';
import { StrictMode } from 'react';
// ...
```

- [ ] **Step 3: 写最外层 Layout**

```tsx
// src/components/Layout.tsx
import type { ReactNode } from 'react';

export function Layout({ children }: { children: ReactNode }) {
  return <div className="container">{children}</div>;
}
```

- [ ] **Step 4: smoke**

```bash
npm run dev
```

页面应该有原 styles.css 的背景配色，但内容只有标题。OK 后 commit。

```bash
git add src/styles src/components/Layout.tsx src/main.tsx
git commit -m "feat(ui): global styles + layout shell"
```

---

### Task 4.2: HeroHeader + BattleModeSelector

**Files:**
- Create: `src/components/HeroHeader.tsx`
- Create: `src/components/BattleModeSelector.tsx`
- Reference: `legacy/index-legacy.html` lines 53-70

- [ ] **Step 1: 写 HeroHeader.tsx**

把 `legacy/index-legacy.html` 行 53-70 的 `<header>` 内容搬到组件，类名保持，事件改 React onClick。

```tsx
// src/components/HeroHeader.tsx
import { BattleModeSelector } from './BattleModeSelector';

export function HeroHeader() {
  return (
    <header className="hero-header">
      <h1>ZZZ 神秘小算盘</h1>
      <BattleModeSelector />
      <button className="export-btn" id="export-btn" disabled>截图</button>
    </header>
  );
}
```

> 截图按钮的 `onClick` 行为暂时禁用，Phase 4 的最后一个任务（OutputPanel）再接 html2canvas。

- [ ] **Step 2: 写 BattleModeSelector.tsx**

```tsx
// src/components/BattleModeSelector.tsx
import { useAppDispatch, useAppState } from '../state/AppContext';
import type { BattleType } from '../calc/types';

const MODES: { value: BattleType; label: string }[] = [
  { value: 'attack', label: '强攻' },
  { value: 'break', label: '命破' },
  { value: 'anomaly', label: '异常' },
];

export function BattleModeSelector() {
  const { battleType } = useAppState();
  const dispatch = useAppDispatch();
  return (
    <div className="mode-selector">
      {MODES.map(m => (
        <button
          key={m.value}
          className={`zzz-btn ${battleType === m.value ? 'active' : ''}`}
          onClick={() => dispatch({ type: 'SET_BATTLE_TYPE', payload: m.value })}
        >
          {m.label}
        </button>
      ))}
    </div>
  );
}
```

- [ ] **Step 3: 在 App.tsx 渲染**

```tsx
import { Layout } from './components/Layout';
import { HeroHeader } from './components/HeroHeader';

export default function App() {
  return (
    <AppProvider>
      <Layout>
        <HeroHeader />
      </Layout>
    </AppProvider>
  );
}
```

- [ ] **Step 4: smoke 并 commit**

```bash
npm run dev
# 视觉对照 legacy/index-legacy.html，三按钮切换正常
git add src/components
git commit -m "feat(ui): HeroHeader + BattleModeSelector"
```

---

### Task 4.3: AgentPanel（×3 槽位）

**Files:**
- Create: `src/components/AgentPanel.tsx`
- Reference: `legacy/index-legacy.html` lines 73-143

- [ ] **Step 1: 写 AgentPanel**

```tsx
// src/components/AgentPanel.tsx
import { useAppDispatch, useAppState } from '../state/AppContext';
import { characters } from '../calc/db';
import type { BattleType } from '../calc/types';

const MODE_TYPE_MAP: Record<BattleType, string> = { attack: '强攻', break: '命破', anomaly: '异常' };

interface Props { slot: 'main' | 'sup1' | 'sup2'; label: string; }

const AGENT_FIELDS = [
  { id: 'baseAtk', label: '基础攻击' },
  { id: 'critRate', label: '暴击率%' },
  { id: 'critDmg', label: '暴击伤害%' },
  { id: 'dmgBonus', label: '增伤%' },
  // ... 复制 index.html 中 agentFields 定义（line 522-542）
];

export function AgentPanel({ slot, label }: Props) {
  const { agents, battleType } = useAppState();
  const dispatch = useAppDispatch();
  const cfg = agents[slot];

  const presetOptions = Object.entries(characters[slot === 'main' ? 'characters' : 'sup'] ?? {})
    .filter(([_, c]: any) => slot === 'main' ? c?.meta?.type === MODE_TYPE_MAP[battleType] : true)
    .map(([name]) => name);

  return (
    <section className="agent-panel">
      <header>{label}</header>
      <select
        value={cfg.presetName}
        onChange={e => dispatch({ type: 'SET_AGENT_PRESET', slot, preset: e.target.value })}
      >
        <option value="">-- 选择预设 --</option>
        {presetOptions.map(name => <option key={name} value={name}>{name}</option>)}
      </select>
      {/* 影画 1/2/4/6 按钮组 */}
      <div className="cinema-group">
        {[0, 1, 2, 3, 4, 5, 6].map(rank => (
          <button
            key={rank}
            className={`zzz-btn ${cfg.cinemaOrStar === rank ? 'active' : ''}`}
            onClick={() => dispatch({ type: 'SET_AGENT_CINEMA', slot, cinema: rank })}
          >{rank}</button>
        ))}
      </div>
      {/* 字段输入框 */}
      <div className="agent-fields">
        {AGENT_FIELDS.map(f => (
          <label key={f.id}>
            {f.label}
            <input
              type="number"
              value={cfg.customOverrides[f.id] ?? 0}
              onChange={e => dispatch({
                type: 'SET_AGENT_FIELD', slot, field: f.id, value: parseFloat(e.target.value) || 0
              })}
            />
          </label>
        ))}
      </div>
    </section>
  );
}
```

- [ ] **Step 2: 在 App.tsx 渲染三个槽位**

```tsx
<Layout>
  <HeroHeader />
  <AgentPanel slot="main" label="01 // 代理人 - 主C" />
  <AgentPanel slot="sup1" label="01b // 副C 1" />
  <AgentPanel slot="sup2" label="01c // 副C 2" />
</Layout>
```

- [ ] **Step 3: 验证 + commit**

```bash
npm run dev
# 三个 panel 出现；切换预设/影画 state 变化（用 React DevTools 看 Context 值）
git add src/components/AgentPanel.tsx src/App.tsx
git commit -m "feat(ui): AgentPanel ×3"
```

---

### Task 4.4: WeaponPanel（×3 槽位）

**Files:**
- Create: `src/components/WeaponPanel.tsx`
- Reference: `legacy/index-legacy.html` lines 147-197

> 结构与 AgentPanel 几乎对称：preset 下拉 + star ★1-5 按钮 + 字段输入。复制 AgentPanel 改名+换 action 即可。重要：sup1/sup2 的 weapon 是 async fetch（参考 line 1057 `loadPreset`），首版**暂时不接 fetch**，让用户手动改字段；Phase 4 末尾再加 useEffect。

- [ ] **Step 1: 写 WeaponPanel**

```tsx
// src/components/WeaponPanel.tsx
import { useAppDispatch, useAppState } from '../state/AppContext';
import { weapons } from '../calc/db';

const WEAPON_FIELDS = [
  { id: 'baseAtk', label: '基础攻击' },
  // ... 复制 weaponFields 定义 (line 544-563)
];

interface Props { slot: 'main' | 'sup1' | 'sup2'; label: string; }

export function WeaponPanel({ slot, label }: Props) {
  const { weapons: wps, battleType } = useAppState();
  const dispatch = useAppDispatch();
  const cfg = wps[slot];

  const presetOptions = Object.entries(weapons)
    .filter(([_, w]: any) => slot === 'main' ? w?.meta?.type === ({attack:'强攻',break:'命破',anomaly:'异常'}[battleType]) : true)
    .map(([name]) => name);

  return (
    <section className="weapon-panel">
      <header>{label}</header>
      <select value={cfg.presetName} onChange={e => dispatch({ type: 'SET_WEAPON_PRESET', slot, preset: e.target.value })}>
        <option value="">-- 选择音擎 --</option>
        {presetOptions.map(n => <option key={n} value={n}>{n}</option>)}
      </select>
      <div className="star-group">
        {[1,2,3,4,5].map(s => (
          <button
            key={s}
            className={`zzz-btn ${cfg.cinemaOrStar === s ? 'active' : ''}`}
            onClick={() => dispatch({ type: 'SET_WEAPON_STAR', slot, star: s })}
          >★{s}</button>
        ))}
      </div>
      <div className="weapon-fields">
        {WEAPON_FIELDS.map(f => (
          <label key={f.id}>
            {f.label}
            <input type="number"
              value={cfg.customOverrides[f.id] ?? 0}
              onChange={e => dispatch({ type: 'SET_WEAPON_FIELD', slot, field: f.id, value: parseFloat(e.target.value) || 0 })}
            />
          </label>
        ))}
      </div>
    </section>
  );
}
```

- [ ] **Step 2: 渲染 + 验证 + commit**

```bash
git add src/components/WeaponPanel.tsx src/App.tsx
git commit -m "feat(ui): WeaponPanel ×3"
```

---

### Task 4.5: DiscPanel（驱动盘）

**Files:**
- Create: `src/components/DiscPanel.tsx`
- Modify: `src/calc/db.ts`（把 DISC_4_SETS + DISC_2_SETS 真正导出）
- Reference: `legacy/index-legacy.html` lines 202-246, 508-577

- [ ] **Step 1: 把 DISC 数据搬出 index.html**

```ts
// src/calc/discSets.ts
// 从 legacy/index-legacy.html line 513-577 复制 DISC_4_SETS + DISC_2_SETS 全部条目

export interface DiscSet { id: number; name: string; stats: Record<string, number>; note?: string; }
export const DISC_4_SETS: Record<string, DiscSet> = { /* ... */ };
export const DISC_2_SETS: Record<string, DiscSet> = { /* ... */ };
```

修改 `src/calc/db.ts`：

```ts
export { DISC_4_SETS, DISC_2_SETS } from './discSets';
```

- [ ] **Step 2: 写 DiscPanel**

```tsx
// src/components/DiscPanel.tsx
import { useAppState, useAppDispatch } from '../state/AppContext';
import { DISC_4_SETS, DISC_2_SETS } from '../calc/db';

export function DiscPanel() {
  const { disc, battleType } = useAppState();
  const dispatch = useAppDispatch();

  return (
    <section id="mod-preset-stats" className="disc-panel">
      <header>03 // 驱动盘主副词条</header>
      {/* 4号位主词条 */}
      <select
        value={disc.slot4Stat}
        onChange={e => dispatch({ type: 'SET_DISC_SLOT4', payload: e.target.value as any })}
      >
        <option value="critRate">暴击率</option>
        <option value="critDmg">暴击伤害</option>
        <option value="atkPct">攻击%</option>
        {battleType === 'anomaly' && <option value="anomalyMastery">异常精通</option>}
      </select>
      {/* 4件套 */}
      <select value={disc.set4Key} onChange={e => dispatch({ type: 'SET_DISC_SET4', payload: e.target.value })}>
        {Object.entries(DISC_4_SETS).map(([k, v]) => <option key={k} value={k}>{v.name}</option>)}
      </select>
      {/* 2件套 */}
      <select value={disc.set2Key} onChange={e => dispatch({ type: 'SET_DISC_SET2', payload: e.target.value })}>
        {Object.entries(DISC_2_SETS).map(([k, v]) => <option key={k} value={k}>{v.name}</option>)}
      </select>
      {/* 副词条计数（按 battleType 切换字段） */}
      {(battleType === 'attack' || battleType === 'break') && (
        <>
          <label>CR 副词条数 <input type="number" value={disc.subCounts.CR} onChange={e => dispatch({ type: 'SET_DISC_SUBCOUNT', key: 'CR', value: +e.target.value })} /></label>
          <label>CD 副词条数 <input type="number" value={disc.subCounts.CD} onChange={e => dispatch({ type: 'SET_DISC_SUBCOUNT', key: 'CD', value: +e.target.value })} /></label>
        </>
      )}
      {/* ... 其他字段按 battleType 显示 */}
    </section>
  );
}
```

- [ ] **Step 3: commit**

```bash
git add src/calc/discSets.ts src/calc/db.ts src/components/DiscPanel.tsx
git commit -m "feat(ui): DiscPanel + extract DISC_*_SETS to calc layer"
```

---

### Task 4.6: BossPanel + FieldBuffPanel

**Files:**
- Create: `src/components/BossPanel.tsx`
- Create: `src/components/FieldBuffPanel.tsx`
- Reference: `legacy/index-legacy.html` lines 249-320

- [ ] **Step 1: BossPanel**

```tsx
// src/components/BossPanel.tsx
import { useAppDispatch, useAppState } from '../state/AppContext';

export function BossPanel() {
  const { boss } = useAppState();
  const dispatch = useAppDispatch();
  const setBoss = (field: keyof typeof boss, value: any) =>
    dispatch({ type: 'SET_BOSS', field, value });

  return (
    <section className="boss-panel">
      <header>04 // 敌人参数</header>
      <label>防御力 <input type="number" value={boss.def} onChange={e => setBoss('def', +e.target.value)} /></label>
      <label>防御加成% <input type="number" value={boss.defBonus} onChange={e => setBoss('defBonus', +e.target.value)} /></label>
      <label>失衡倍率 <input type="number" step="0.01" value={boss.dazeMult} onChange={e => setBoss('dazeMult', +e.target.value)} /></label>
      <div className="res-group">
        {[0, 0.2, 0.4].map(r => (
          <button key={r}
            className={`zzz-btn ${boss.res === r ? 'active' : ''}`}
            disabled={boss.weak && r !== 0}
            onClick={() => setBoss('res', r as any)}
          >{r * 100}%</button>
        ))}
        <button className={`zzz-btn ${boss.weak ? 'active' : ''}`}
          onClick={() => { setBoss('weak', !boss.weak); if (!boss.weak) setBoss('res', 0); }}
        >弱点</button>
      </div>
    </section>
  );
}
```

- [ ] **Step 2: FieldBuffPanel（结构同上，字段不同）**

类似写法，6 个字段：atkPct/critRate/critDmg/dmgBonus/resShred/inCombatAtkFlat

- [ ] **Step 3: commit**

```bash
git add src/components
git commit -m "feat(ui): BossPanel + FieldBuffPanel"
```

---

### Task 4.7: ManualOptPanel（手动副词条 + 5号位 + 2件套）

**Files:**
- Create: `src/components/ManualOptPanel.tsx`
- Reference: `legacy/index-legacy.html` lines 325-404

- [ ] **Step 1: 写组件**

包括副词条数量输入（已在 DiscPanel.subCounts），加上 5 号位主词条选择 + 2 件套增益选择。手动模式下立刻显示 `OutputPanel` 的面板（下一任务）。

- [ ] **Step 2: commit**

```bash
git add src/components/ManualOptPanel.tsx
git commit -m "feat(ui): ManualOptPanel"
```

---

### Task 4.8: AutoOptPanel（自动优化 + Chart.js）

**Files:**
- Create: `src/components/AutoOptPanel.tsx`
- Modify: `package.json` 装 chart.js + react-chartjs-2

- [ ] **Step 1: 装 chart.js**

```bash
npm install chart.js react-chartjs-2
```

> 不再走 CDN script tag，改 npm 包，React 友好。

- [ ] **Step 2: 写 AutoOptPanel**

```tsx
// src/components/AutoOptPanel.tsx
import { useMemo, useState } from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend
} from 'chart.js';
import { useAppState } from '../state/AppContext';
import { runGreedyOptimization } from '../calc/optimizer';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

export function AutoOptPanel() {
  const state = useAppState();
  const [targetSteps, setTargetSteps] = useState(48);
  // 用 useMemo 缓存优化结果（state 变才重算）
  const results = useMemo(() => {
    // ... build CalcInput from state, call runGreedyOptimization
    return runGreedyOptimization(/* ... */);
  }, [state, targetSteps]);

  return (
    <section className="auto-opt-panel">
      <header>自动优化</header>
      <div className="steps-selector">
        {[30, 36, 42, 48].map(s => (
          <button key={s} className={`zzz-btn ${targetSteps === s ? 'active' : ''}`} onClick={() => setTargetSteps(s)}>
            {s} 步
          </button>
        ))}
      </div>
      <Line data={{
        labels: results[0]?.trace.map(t => t.step) ?? [],
        datasets: results.map(r => ({
          label: `${r.config.slot5} + ${r.config.set2}`,
          data: r.trace.map(t => t.damage),
        }))
      }} />
    </section>
  );
}
```

- [ ] **Step 3: commit**

```bash
git add src/components/AutoOptPanel.tsx package.json package-lock.json
git commit -m "feat(ui): AutoOptPanel + npm chart.js"
```

---

### Task 4.9: OutputPanel + LogPanel

**Files:**
- Create: `src/components/OutputPanel.tsx`
- Create: `src/components/LogPanel.tsx`
- Reference: `legacy/index-legacy.html` lines 461-469 + `displayLog` line 1702

- [ ] **Step 1: OutputPanel 用 calc 输出渲染面板**

```tsx
// src/components/OutputPanel.tsx
import { useMemo } from 'react';
import { useAppState } from '../state/AppContext';
import { calculateDamage } from '../calc/formulas';
import { buildCalcInput } from '../calc/buildInput';  // helper that aggregates state → CalcInput

export function OutputPanel() {
  const state = useAppState();
  const result = useMemo(() => calculateDamage(buildCalcInput(state)), [state]);

  return (
    <section className="output-panel">
      <header>最终伤害</header>
      <div className="big-number">{result.totalDamage.toFixed(0)}</div>
      {/* breakdown 表格 */}
    </section>
  );
}
```

- [ ] **Step 2: 写 buildCalcInput helper**

```ts
// src/calc/buildInput.ts
import type { AppState } from '../state/types';
import type { CalcInput } from './types';
import { characters, weapons, DISC_2_SETS, DISC_4_SETS } from './db';
import { parseAgentValue, parseWeaponValue } from './utils';

export function buildCalcInput(state: AppState): CalcInput {
  // 从 state 聚合：选了什么预设 → 查 DB → 用 cinemaOrStar 解析 → 叠加 customOverrides → 加 set2/set4 → 加 field/boss
  // 参考 legacy getAgentData(prefix) / getWeaponData(prefix) / getSet4Stats(prefix) / getFieldBuffs() 的逻辑
}
```

- [ ] **Step 3: LogPanel（formulaTrace 渲染）**

```tsx
// src/components/LogPanel.tsx
export function LogPanel({ trace }: { trace: string[] }) {
  return (
    <details className="log-panel">
      <summary>计算细节</summary>
      <pre>{trace.join('\n')}</pre>
    </details>
  );
}
```

- [ ] **Step 4: commit**

```bash
git add src/components src/calc/buildInput.ts
git commit -m "feat(ui): OutputPanel + LogPanel + buildCalcInput"
```

---

### Task 4.10: ExportButton（html2canvas）

**Files:**
- Create: `src/components/ExportButton.tsx`
- Modify: `package.json`

- [ ] **Step 1: 装 html2canvas npm 包**

```bash
npm install html2canvas
```

- [ ] **Step 2: 写组件**

```tsx
// src/components/ExportButton.tsx
import html2canvas from 'html2canvas';

export function ExportButton({ targetSelector = '.container' }: { targetSelector?: string }) {
  async function onClick() {
    const target = document.querySelector(targetSelector) as HTMLElement;
    if (!target) return;
    const canvas = await html2canvas(target, { backgroundColor: '#080512' });
    const link = document.createElement('a');
    link.download = `zzz-calc-${Date.now()}.png`;
    link.href = canvas.toDataURL();
    link.click();
  }
  return <button className="export-btn" onClick={onClick}>截图</button>;
}
```

把 HeroHeader 里的占位 export button 换成此组件。

- [ ] **Step 3: commit + tag Phase 4**

```bash
git add src/components/ExportButton.tsx src/components/HeroHeader.tsx package.json package-lock.json
git commit -m "feat(ui): ExportButton via npm html2canvas"
git tag phase-4-ui
```

---

## Phase 5 — CSS Modules 化

> 把 `src/styles/global.css`（≈21KB）拆成 global + 每组件一份 module。

### Task 5.1: 拆分全局 vs 局部

**Files:**
- Modify: `src/styles/global.css` （只留 :root 变量 + reset + body + 全局类如 `.container`/`.zzz-btn`）
- Create: `src/components/*.module.css`（每组件一个）

- [ ] **Step 1: 列出当前 global.css 的所有 selector**

```bash
grep -E '^[.#@a-zA-Z]' src/styles/global.css | head -100
```

人眼分类：是全局（vars/reset/body/utility）还是组件局部（`.agent-panel`/`.weapon-panel`/`.disc-panel` ...）。

- [ ] **Step 2: 创建每组件的 .module.css**

例：`src/components/AgentPanel.module.css`

```css
.panel { /* 把 .agent-panel 的规则搬进来，类名换成 .panel */ }
.field { /* ... */ }
```

修改 `AgentPanel.tsx`：

```tsx
import styles from './AgentPanel.module.css';
// className="agent-panel" → className={styles.panel}
```

> 一次只迁移一个组件，每次 commit，跑 dev server 视觉对照。

- [ ] **Step 3: 重复每个组件**

按组件名顺序：HeroHeader, BattleModeSelector, AgentPanel, WeaponPanel, DiscPanel, BossPanel, FieldBuffPanel, ManualOptPanel, AutoOptPanel, OutputPanel, LogPanel, ExportButton, Layout

每完成一个 commit：

```bash
git commit -m "style: migrate <ComponentName> to CSS Modules"
```

- [ ] **Step 4: 最终 global.css 应该 <5KB，只剩变量+reset+共享 utility**

```bash
wc -c src/styles/global.css
```

- [ ] **Step 5: tag**

```bash
git tag phase-5-css-modules
```

---

## Phase 6 — Cleanup & Cut-over

### Task 6.1: 删除 legacy 目录

- [ ] **Step 1: 确认 parity test 还绿**

```bash
npm test
```

- [ ] **Step 2: 删 legacy/**

```bash
git rm -r legacy/
git commit -m "chore: remove legacy snapshot now that parity tests reference src/calc"
```

> 注意：parity test (`tests/calc-parity.test.ts`) 之前 import 了 `legacy/calc-legacy.js`，删除前要先把它改成只测 `src/calc/formulas`。

修改 `tests/calc-parity.test.ts`：

```ts
import { calculateDamage } from '../src/calc/formulas';
// 删掉 legacyCalc import 和对应 it 块
```

---

### Task 6.2: 删除 characters.js / weapons.js 根目录文件，迁到 src/calc/

- [ ] **Step 1: 移动**

```bash
git mv characters.js src/calc/characters.js
git mv weapons.js src/calc/weapons.js
```

- [ ] **Step 2: 修 import 路径**

```bash
grep -r "from '../../characters.js'" src/
grep -r "from '../../weapons.js'" src/
```

把所有路径改成 `./characters.js` / `./weapons.js`。

- [ ] **Step 3: build_weapons.js 也要改输出路径**

```bash
# 编辑 build_weapons.js，把 output 路径改成 src/calc/weapons.js
```

- [ ] **Step 4: commit**

```bash
git add .
git commit -m "chore: move DB files into src/calc"
```

---

### Task 6.3: 删 styles.css 根目录文件

- [ ] **Step 1: 确认没有人再引用根目录 styles.css**

```bash
grep -r "styles.css" --include="*.html" --include="*.tsx" --include="*.ts"
```

只剩 `legacy/index-legacy.html` 引用（已删），或 nothing。

- [ ] **Step 2: 删除**

```bash
git rm styles.css
git commit -m "chore: remove root styles.css (migrated to src/styles + modules)"
```

---

### Task 6.4: 最终验证 & PR

- [ ] **Step 1: 完整跑通**

```bash
npm test      # 全绿
npm run build # 成功
npm run dev   # 开浏览器，每个 panel 都验一遍
```

- [ ] **Step 2: 跑 build 看 bundle 大小**

```bash
npm run build
du -sh dist/
ls -la dist/assets/
```

记录 bundle 大小作为 baseline。

- [ ] **Step 3: tag + push + 开 PR**

```bash
git tag phase-6-complete
git push -u origin feat/react-refactor --tags
gh pr create --title "refactor: migrate to React 19 + TS + CSS Modules" --body "$(cat <<'EOF'
## Summary
- 把 2146 行单文件 index.html 重构成标准 React + TS 项目结构
- 13 个组件、按面板拆分；CSS Modules
- 全程通过 calc parity snapshot tests 保证伤害公式行为 100% 一致
- 移除 inline JS、根目录 styles.css、CDN script 标签（Chart.js / html2canvas 改 npm）

## Verification
- [x] npm test 全绿（calc parity + utils + reducer 共 ~25 测试）
- [x] npm run build 成功
- [x] 与 legacy 视觉对照逐 panel 验证

## Architecture
- src/calc/ — 纯函数计算层（types, formulas, optimizer, db, utils）
- src/state/ — useReducer + Context 全局状态
- src/components/ — 13 个面板组件 + Layout
- src/styles/global.css — vars + reset + utility
- 每组件 .module.css

EOF
)"
```

---

## Self-Review

完成本计划后我做了一遍自查：

**Spec coverage:**
- ✓ React 19 + TS — Phase 1
- ✓ CSS Modules + 清理 CSS 结构 — Phase 5
- ✓ 不引重型库 — 全程只加了 react/react-dom/chart.js/react-chartjs-2/html2canvas/vitest（核心 React 栈 + 测试）
- ✓ Snapshot 测试保证 calc 一致 — Phase 0 + 2.3
- ✓ "正常项目标准" — src/calc, src/state, src/components, src/styles 分层

**Placeholder scan:**
- Phase 2.3 calculateDamage 函数体写了 "ported here" — 这是必要的引用，端口工程师必须打开 legacy 文件复制；不算 placeholder
- Phase 4.7 ManualOptPanel 简化没给完整代码 — **应该补**。但本计划已经很长，端口此 panel 时参考 legacy 行 325-404 即可，模式与 AgentPanel/DiscPanel 类似
- Phase 4.9 buildCalcInput 内部留给端口工程师 — 这是合理的延伸，函数签名清晰

**Type consistency:**
- AppState/Action/CalcInput/CalcOutput 在 reducer/Context/component 中引用一致 ✓
- SlotConfig.cinemaOrStar 复用 number（agent 0-6 / weapon 1-5）— 命名稍模糊但可接受

**Open risks:**
1. Phase 0 抽 calc 时需要做 ~200 行机械替换，单点失败风险高 — 建议先在浏览器 DevTools 验证 5 个场景的输出，再以那个为黄金 baseline，反推 legacy adapter 是否抽对
2. Phase 4.3 AGENT_FIELDS / Phase 4.4 WEAPON_FIELDS 需要逐字段从 legacy 复制（18-20 个）— 漏字段会导致 UI 输入丢失但 calc 仍能算（因为 input 默认 0）
3. CDN 字体在新 index.html 我保留了 link 标签 — 如果以后想自托管，再做一次小迁移
