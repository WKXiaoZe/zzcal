// src/components/HeroHeader.tsx
// Top hero banner: title + BattleModeSelector.
// Markup mirrors legacy index-legacy.html lines 53-70.
// ExportButton lives outside the hero card now — it's rendered once in
// App.tsx with position:fixed bottom:right so it follows the viewport
// instead of being tucked into the corner card.
import { BattleModeSelector } from './BattleModeSelector';

export function HeroHeader() {
  return (
    <header>
      <h1>ʚ ZZZ神秘小算盘 ɞ</h1>
      <BattleModeSelector />
      <div className="credits">bY 奥伯勒斯的千早爱音本人 with Dr.Gemini</div>
      <div className="version">2026v0224</div>
    </header>
  );
}
