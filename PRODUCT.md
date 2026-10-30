# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

绝区零（Zenless Zone Zero）玩家与配装研究者：在浏览器里为「主 C + 两名辅助」配置代理人、音擎、驱动盘与敌人参数，比较伤害与副词条分配；近期也用危局强袭战（Deadly Assault）排轴模拟核对理论最优轴与实测分差。

（推断自 README 与仓库用途；init 访谈在无人值守子代理中跳过。）

## Product Purpose

纯前端伤害计算器与驱动盘配装优化器（zzcal / ZZZ 神秘小算盘）。支持手动计算、贪心副词条自动优化，以及危局强袭战束搜索排轴模拟（移植 nanoka-zzz/da-sim），帮助玩家在不离开浏览器的情况下得到可复现的配装与排轴结果。

成功标准：计算结果与既有回归/parity 测试一致；中文界面可读、可操作；DA 模拟可配置期数/首领/队伍/配装模式/束宽并输出得分与排轴日志。

## Positioning

浏览器内完成「配装优化 + 危局强袭束搜索排轴」一体工具；伤害公式与本站一致，DA 侧带 Python 参考分与玩家实测分对照。竞品或外部脚本通常只做其一。

## Operating Context

- 桌面浏览器为主（Cloudflare Pages 部署），偶发平板宽度。
- 无账号；数据为本地 JSON（代理人/音擎/驱动盘预设、`public/da-sim/` 场景）。
- DA 重计算跑在 Web Worker；用户可能长时间停留在同一面板调束宽/步数。
- UI 文案以简体中文为准，游戏术语保留官方习惯译法。

## Capabilities and Constraints

- 战斗模式：强攻 / 命破 / 异常；主 C + 副 C×2；驱动盘六角与多套 2 件套；敌人防御/抗性/弱点；场地增益。
- 手动优化与自动贪心优化（默认 48 条副词条预算），Chart.js 曲线。
- 危局强袭战：期数/首领/队伍、配装模式（自动/存档/不配装）、束宽/步数/种子；得分曲线 + 部位破坏；排轴日志。
- 技术栈：React 19 · TypeScript · Vite · Tailwind（主要给 shadcn）· CSS Modules · Cloudflare Pages。
- 约束：保持功能与 `npm test` / vitest da-sim parity 绿色；中文 copy 不得改成英文；不做全站换肤式重设计，优先打磨 DA 面板与共享 chrome。

## Brand Commitments

- 产品名：ZZZ 神秘小算盘 / zzcal。
- 视觉气质：暗色赛博街头、粉（`--zzz-pink`）与橙（`--zzz-accent`）点缀；标题区允许粉紫渐变字作为既有品牌签名（非通用 SaaS 默认）。
- 界面语言：简体中文。

## Evidence on Hand

- README、`src/calc/`、`src/components/DeadlyAssaultPanel.tsx`、`public/da-sim/`、`tests/` 回归。
- 预览：`https://feat-da-sim-beam-panel.zzzcalc.pages.dev/`；正式：`https://zzzcalc.pages.dev/`。
- 勿捏造官方背书、玩家评价或米哈游关联。

## Product Principles

1. 数字可信：任何 UI 打磨不得改变伤害/排轴公式与 parity 结果。
2. 中文优先：标签、错误、空态用玩家能懂的中文，术语与游戏内一致。
3. 任务面清晰：配装优化与危局排轴是操作工具（Operate），层次服务扫读与对照，不靠装饰抢注意力。
4. 可复现：束宽、步数、种子、配装模式可见且可复跑。
5. 克制打磨：去掉 AI 味噪点，保留既有粉橙暗色身份。

## Accessibility & Inclusion

目标 WCAG AA 对比度（正文 ≥4.5:1）；表单控件需可见焦点；长表（排轴日志）需可滚动且不撑破布局。无产品级强制无障碍认证要求。
