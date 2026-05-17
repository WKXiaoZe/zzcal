// src/components/ExportButton.tsx
// Snapshot the configured DOM region to PNG via html2canvas.
// Mirrors legacy `exportSnapshot()` (index-legacy.html:2061).
import { useState } from 'react';
import html2canvas from 'html2canvas';

export interface ExportButtonProps {
  /** CSS selector for the DOM node to capture. Default `.container`. */
  targetSelector?: string;
}

export function ExportButton({ targetSelector = '.container' }: ExportButtonProps) {
  const [busy, setBusy] = useState(false);

  async function handleExport() {
    if (busy) return;
    const target = document.querySelector<HTMLElement>(targetSelector);
    if (!target) {
      console.error(`ExportButton: target not found for selector "${targetSelector}"`);
      alert('导出失败：找不到目标元素。');
      return;
    }

    setBusy(true);

    // Hide decorative video background if present (legacy parity).
    const videoBackground = document.querySelector<HTMLElement>('.video-background');
    const videoWasVisible = videoBackground && videoBackground.style.display !== 'none';
    if (videoBackground) videoBackground.style.display = 'none';

    try {
      // Give the UI a tick to repaint the busy state before the heavy snapshot.
      await new Promise<void>((resolve) => setTimeout(resolve, 50));

      const canvas = await html2canvas(target, {
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#080512',
        scale: 2,
        logging: false,
        imageTimeout: 15000,
        onclone: (clonedDoc) => {
          // Make sure any chart canvases stay visible inside the clone.
          clonedDoc.querySelectorAll('canvas').forEach((c) => {
            (c as HTMLElement).style.display = 'block';
          });
        },
      });

      const link = document.createElement('a');
      const date = new Date().toISOString().slice(0, 10);
      const time = new Date()
        .toLocaleTimeString('zh-CN', { hour12: false })
        .replace(/:/g, '-');
      link.download = `ZZZ_配置_${date}_${time}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    } catch (err) {
      console.error('html2canvas error:', err);
      const msg = err instanceof Error ? err.message : '未知错误';
      alert(`导出失败：${msg}\n\n建议使用浏览器自带截图功能（如 Windows: Win+Shift+S）。`);
    } finally {
      if (videoBackground && videoWasVisible) videoBackground.style.display = '';
      setBusy(false);
    }
  }

  return (
    <button
      type="button"
      className="zzz-btn btn-large"
      id="export-btn"
      onClick={handleExport}
      disabled={busy}
    >
      {busy ? '📸 生成中...' : '📸 导出配置长图'}
    </button>
  );
}
