# ZZZ 神秘小算盘（zzcal）

> 绝区零（Zenless Zone Zero）伤害计算器与驱动盘配装优化工具，支持手动计算与最优词条模拟。

纯前端 Web 应用，在浏览器里搭配「主C + 两名辅助」的代理人、音擎、驱动盘，设定敌人与场地增益，即可计算伤害，并自动寻找最优副词条分配。

## 🔗 在线体验

- [zzzcalc.pages.dev](https://zzzcalc.pages.dev)

## 📸 截图

> TODO：添加主界面、自动优化曲线图、驱动盘六角卡片截图
>
> `![主界面](docs/screenshots/main.png)`

## ✨ 功能

- **三种战斗模式**：强攻 / 命破 / 异常（异常模式下 4 号位主词条自动切换为异常精通）
- **队伍配置**：主C + 副C 1 + 副C 2，各自选择代理人与音擎；内置 DPS / 辅助代理人预设与音擎预设（`dps/`、`sup/`、`wpDPS/`、`wpSUP/` 下的 JSON，异步加载）
- **音擎六角选择器**，带音擎图标
- **驱动盘配置**：六角驱动盘卡片，点击槽位从 26 套驱动盘中选择（按 DPS / 辅助分栏），悬停显示官方中文 2 件套 / 4 件套效果；支持多套 2 件套组合
- **敌人参数**：防御、防御加成、失衡倍率、抗性（0% / 20% / 40%）、弱点开关
- **场地增益**：作用于全队的 6 项数值增益
- **手动优化**：手动调整副词条条数、5 号位主词条与 2 件套，实时查看伤害
- **自动优化（贪心副词条分配）**：`src/calc/optimizer.ts` 中的 `runGreedyOptimization`——对每个「5 号位主词条 × 2 件套」组合，在默认 **48 条** 副词条预算内逐步分配；每一步试算暴击率 / 暴击伤害 / 攻击% / 生命% / 异常精通（视战斗模式而定）中哪一条带来的伤害最高，再写入该条（平局优先级：暴击率 > 爆伤 > 生命或精通 > 攻击）。单条收益沿用旧版：暴击率 +2.4、爆伤 +4.8、攻击%/生命% +3.0、异常精通 +9.0。强攻模式在暴击率/爆伤/攻击% 中选；命破模式在暴击率/爆伤/生命% 中选（不分配精通）；异常模式在攻击%/异常精通 中选（不分配暴击与生命）。返回完整步进历史，AutoOptPanel 用 Chart.js 绘制伤害–词条预算曲线并标出最佳配置
- **计算日志**：可折叠的计算明细
- **导出截图**：通过 html2canvas 将整页导出为 PNG

## 🛠 技术栈

React 19 · TypeScript 5.8 · Vite 6 · Tailwind CSS 3 + CSS Modules · shadcn/ui（Radix Select）· Chart.js（react-chartjs-2）· html2canvas · Vitest + jsdom

## 📁 目录结构

```
src/
  calc/        伤害公式、优化器、代理人/音擎/驱动盘数据库
  components/  各功能面板
  state/       全局状态（Context + reducer）
dps/ sup/      代理人预设 JSON
wpDPS/ wpSUP/  音擎预设 JSON
resources/     图片等静态资源
tests/         与旧版计算结果对齐的回归测试
legacy/        重构前的原始实现（对照参考）
```

## 🚀 本地开发

需要 Node.js 18+。

```bash
npm install
npm run dev        # 开发服务器 http://localhost:3000
npm run build      # 生产构建，输出到 dist/
npm run preview    # 预览构建产物
npm test           # 运行测试（Vitest）
npm run test:watch
```

## ☁️ 部署（Cloudflare Pages）

1. 在 Cloudflare Pages 连接本仓库
2. 构建命令：`npm run build`
3. 输出目录：`dist`

构建时 Vite 插件会把 `dps/ sup/ wpDPS/ wpSUP/ resources/` 复制到 `dist/`，无需额外配置。

## 🤝 参与贡献

欢迎 Issue 与 PR：新增代理人 / 音擎数据、修正公式、改进 UI 等。

1. Fork 并新建分支
2. 修改后运行 `npm test` 确保通过
3. 提交 PR 并说明改动

## 📄 许可证

本项目采用 [MIT 许可证](LICENSE)。

> 本项目为玩家自制工具，与米哈游 / HoYoverse 无关。游戏相关名称与素材版权归原权利人所有。

---

## English

**ZZZ Calculator (zzcal)** is a browser-based damage calculator and Drive Disc build optimizer for *Zenless Zone Zero*. Configure a main DPS plus two support agents with W-Engines and Drive Discs, set enemy stats and field buffs, and compute damage across Attack / Stun / Anomaly modes. A greedy optimizer (`runGreedyOptimization`) allocates a default 48-substat budget one roll at a time—picking the highest-damage channel among CR/CD/Atk%/HP%/AM per battle mode—and charts damage vs. budget for each slot-5 × 2-piece combo.

- **Stack:** React 19, TypeScript, Vite, Tailwind CSS, Chart.js, Vitest
- **Run:** `npm install && npm run dev` · build with `npm run build` (output `dist/`)
- **Deploy:** Cloudflare Pages (build `npm run build`, output `dist`)
- **Demo:** https://zzzcalc.pages.dev
- **License:** MIT (see [LICENSE](LICENSE))
