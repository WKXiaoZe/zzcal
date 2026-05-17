// src/components/ExportButton.tsx
// Snapshot the entire scrollable page to PNG via html2canvas.
// Ports legacy `exportSnapshot()` (legacy/index-legacy.html:2061-2140).
import { useState } from 'react';
import html2canvas from 'html2canvas';
import styles from './ExportButton.module.css';

export function ExportButton() {
  const [busy, setBusy] = useState(false);

  async function handleExport() {
    if (busy) return;
    const btn = document.getElementById('export-btn') as HTMLButtonElement | null;

    // Hide the decorative background image during capture (legacy parity:
    // html2canvas struggles with the fixed `<img>`, and the snapshot reads
    // cleaner on the flat dark color).
    const videoBackground = document.querySelector<HTMLElement>('.video-background');
    const videoWasVisible =
      videoBackground !== null && videoBackground.style.display !== 'none';
    if (videoBackground) videoBackground.style.display = 'none';

    // Hide the export button itself so it doesn't appear in the exported PNG.
    const btnPrevVisibility = btn?.style.visibility ?? '';
    if (btn) btn.style.visibility = 'hidden';

    setBusy(true);

    // Give the UI a tick + chart canvases time to repaint before snapshot.
    // Legacy used 300ms; same here.
    await new Promise<void>((resolve) => setTimeout(resolve, 300));

    try {
      const canvas = await html2canvas(document.body, {
        useCORS: true,
        allowTaint: true,
        // These four are what make scrolled-page capture work correctly —
        // without them html2canvas only grabs the current viewport.
        scrollY: -window.scrollY,
        scrollX: -window.scrollX,
        windowWidth: document.documentElement.scrollWidth,
        windowHeight: document.documentElement.scrollHeight,
        backgroundColor: '#050505',
        scale: 2,
        logging: false,
        imageTimeout: 15000,
        onclone: (clonedDoc) => {
          // Charts in cloned doc sometimes default to display:none.
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
      alert(
        `导出失败：${msg}\n\n建议使用浏览器自带截图功能（如 Windows: Win+Shift+S）。`,
      );
    } finally {
      if (videoBackground && videoWasVisible) videoBackground.style.display = '';
      if (btn) btn.style.visibility = btnPrevVisibility;
      setBusy(false);
    }
  }

  return (
    <button
      type="button"
      className={`zzz-btn ${styles.exportBtn}`}
      id="export-btn"
      onClick={handleExport}
      disabled={busy}
    >
      {busy ? '📸 生成中...' : '📸 导出配置长图'}
    </button>
  );
}
