// src/components/HeroHeader.tsx
// Top hero banner: title + BattleModeSelector + ExportButton.
// Markup mirrors legacy index-legacy.html lines 53-70.
import { BattleModeSelector } from './BattleModeSelector';
import { ExportButton } from './ExportButton';

export function HeroHeader() {
  return (
    <header>
      <h1>ʚ ZZZ神秘小算盘 ɞ</h1>
      <BattleModeSelector />
      <div className="credits">bY 奥伯勒斯的千早爱音本人 with Dr.Gemini</div>
      <div className="version">2026v0224</div>
      <ExportButton />
    </header>
  );
}
