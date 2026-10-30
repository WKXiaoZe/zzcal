---
name: ZZZ 神秘小算盘
description: 暗色赛博街头风的绝区零配装与危局排轴工具界面
colors:
  primary: "#FDB2C8"
  primary-dim: "rgba(253, 178, 200, 0.2)"
  primary-glow: "rgba(253, 178, 200, 0.5)"
  pink: "#FDB2C8"
  pink-light: "#FFD4E2"
  pink-glow: "rgba(253, 178, 200, 0.6)"
  pink-dim: "rgba(253, 178, 200, 0.15)"
  accent: "#E48534"
  accent-dim: "rgba(228, 133, 52, 0.2)"
  bg: "#050505"
  bg-secondary: "#0a0a0a"
  panel-bg: "rgba(20, 20, 20, 0.88)"
  panel-border: "rgba(255, 255, 255, 0.1)"
  text-main: "#ffffff"
  text-muted: "#999999"
  text-dark: "#000000"
  alert: "#ff3355"
  border-subtle: "#333333"
  text-soft: "#eeeeee"
  text-dim: "#cccccc"
  hover-border: "#777777"
  header-glass: "rgba(20, 20, 28, 0.38)"
  scrollbar-thumb: "#333333"
  scrollbar-thumb-hover: "#444444"
typography:
  display:
    fontFamily: "Outfit, sans-serif"
    fontSize: "2rem"
    fontWeight: 900
    lineHeight: 1.1
    letterSpacing: "-0.01em"
  title:
    fontFamily: "Outfit, sans-serif"
    fontSize: "1.5rem"
    fontWeight: 700
    letterSpacing: "0.05em"
  body:
    fontFamily: "Inter, sans-serif"
    fontSize: "16px"
    fontWeight: 400
    lineHeight: 1.45
  label:
    fontFamily: "Inter, sans-serif"
    fontSize: "0.9rem"
    fontWeight: 500
  mono:
    fontFamily: "JetBrains Mono, ui-monospace, monospace"
    fontSize: "0.85rem"
    fontWeight: 400
  label-sm:
    fontFamily: "Inter, sans-serif"
    fontSize: "0.8rem"
    fontWeight: 600
  caption:
    fontFamily: "Inter, sans-serif"
    fontSize: "0.75rem"
    fontWeight: 400
  micro:
    fontFamily: "Inter, sans-serif"
    fontSize: "0.7rem"
    fontWeight: 400
  score:
    fontFamily: "JetBrains Mono, ui-monospace, monospace"
    fontSize: "1.05rem"
    fontWeight: 600
  score-lg:
    fontFamily: "JetBrains Mono, ui-monospace, monospace"
    fontSize: "1.25rem"
    fontWeight: 600
  table:
    fontFamily: "JetBrains Mono, ui-monospace, monospace"
    fontSize: "12px"
    fontWeight: 400
  table-head:
    fontFamily: "JetBrains Mono, ui-monospace, monospace"
    fontSize: "11px"
    fontWeight: 600
  display-md:
    fontFamily: "Outfit, sans-serif"
    fontSize: "2.5rem"
    fontWeight: 900
  display-lg:
    fontFamily: "Outfit, sans-serif"
    fontSize: "3rem"
    fontWeight: 900
rounded:
  xs: "4px"
  sm: "6px"
  control: "10px"
  title: "12px"
  md: "16px"
  lg: "32px"
  pill: "20px"
spacing:
  xs: "8px"
  sm: "12px"
  md: "20px"
  lg: "30px"
  panel-pad: "25px 40px"
components:
  module:
    backgroundColor: "{colors.panel-bg}"
    textColor: "{colors.text-main}"
    rounded: "{rounded.lg}"
    padding: "{spacing.panel-pad}"
  module-title:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.text-dark}"
    rounded: "12px"
    padding: "10px 30px"
    typography: "{typography.title}"
  button-active:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.text-dark}"
    rounded: "{rounded.md}"
    padding: "8px 20px"
  button-ghost:
    backgroundColor: "rgba(255, 255, 255, 0.05)"
    textColor: "{colors.text-muted}"
    rounded: "{rounded.md}"
    padding: "8px 20px"
  input:
    backgroundColor: "rgba(0, 0, 0, 0.4)"
    textColor: "{colors.text-main}"
    rounded: "{rounded.sm}"
    padding: "10px 14px"
---

## Overview

Operate-mode 工具界面：深色背景 + 半透明毛玻璃面板，粉（主）与橙（辅）点缀。身份来自绝区零玩家工具气质，不是通用 SaaS 仪表盘。英雄标题区保留粉紫渐变字与轻浮动作为既有品牌签名；任务面板（配装、敌人、优化、危局排轴）以扫读、对照数字为先，装饰退后。

Creative north star（记录自实现）：**Neon Arcade Bench** — 街机柜式暗色工作台，粉霓虹标牌，面板像可操作机台而非营销着陆页。

## Colors

- **Primary / Pink** `#FDB2C8`：标题色、激活控件、焦点环、强调点。
- **Accent / Orange** `#E48534`：次强调、与粉组成 module-title 渐变。
- **Neutrals**：背景 `#050505` / `#0a0a0a`；面板 `rgba(20,20,20,0.88)`；边框 `rgba(255,255,255,0.1)`；正文白；次要文案 `#999`（勿用更暗的 `#555` 做正文或未激活标签）。
- **Alert** `#ff3355`：错误与破坏性提示。
- 阴影以中性抬升为主（带 y 偏移）；避免零偏移粉光晕作为默认「酷」效果。激活态可用轻微粉 tint 阴影，但需有偏移。

## Typography

- **Display**：Outfit，标题/模块标牌；全大写或带编号前缀（`04 // 敌人数据`）是既有惯例。
- **UI**：Inter 16px 基线；标签与说明用 muted。
- **Mono**：JetBrains Mono 用于数字输入、日志、排轴表。
- 危局面板内层级：模块标 → 区块 h3 → 元信息 0.85rem → 表 12–13px mono。
- 正文字距与行高以可读为准；中文不强制 letter-spacing 拉宽。

## Layout

- 内容壳 `.container`：`max-width: 1440px`，首屏下方进入（`margin-top: 100vh` 配合固定英雄卡）。
- 网格：`.grid-3`（`minmax(380px, 1fr)`，≤768px 单列）；`.grid-2-split`（1 / 1.25，≤1024px 单列）。
- 面板间距：同级 `30px`；面板内控件行 `12–20px` gap。
- 危局面板：控件区用自适应表单网格；结果区分「得分摘要 / 配装表 / 排轴表」三段，避免卡套卡。

## Elevation & Depth

- 面板：`backdrop-filter: blur(24px)` + 中性 `box-shadow: 0 10px 40px -10px rgba(0,0,0,0.5)`。
- 固定英雄卡：更深毛玻璃 + `0 8px 32px rgba(0,0,0,0.35)`。
- 禁止默认使用 `box-shadow: 0 0 Npx` 彩色光晕；焦点环用 `0 0 0 2px` 的 dim 色即可（这是可访问性焦点，不是装饰光晕）。

## Shapes

- 半径阶梯：`6 / 16 / 32`（sm/md/lg）；模块标牌约 `12px`；版本胶囊 `20px`。
- 面板大圆角（lg）；表单控件小圆角（sm）。

## Components

- **module / sub-module**：毛玻璃卡片；标题用绝对定位 `.module-title` 骑在上沿。
- **zzz-btn / rank-btn**：未激活低对比边框；激活粉底黑字。
- **input / select**：深底、mono、右对齐数字；focus 粉边 + dim 环。
- **DeadlyAssaultPanel**：与其它 `sub-module` 对齐；主操作「开始模拟 / 停止」；加载、空数据、错误、进行中进度条；宽表横向滚动 + 粘性表头。

## Do's and Don'ts

**Do**

- 保持中文标签与游戏术语。
- 新面板复用 `sub-module` + `module-title`，而不是另起一套边框色。
- 数字与日志用 mono；状态文案说明下一步。
- 改视觉前跑 `npx impeccable detect`（源码 + 预览 URL）。

**Don't**

- 不要把中文改成英文「更专业」文案。
- 不要为了「去 AI 味」拆掉品牌粉紫标题渐变（已记录为 Brand Commitment）；可减弱无限浮动动画，但保留身份色。
- 不要嵌套多层卡片装结果；用间距、分隔线与表格。
- 不要用 `#555` 灰字落在 `#111` 近黑底上（对比不足）。
- 不要改动 calc / da-sim 数值逻辑来「美化」界面。
