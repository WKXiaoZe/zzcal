/// <reference lib="webworker" />
import { loadBundle, runDaSim, type RunOptions } from './runner';
import type { TeamSlot } from './types';

export interface WorkerRequest {
  base: string; // absolute URL of public/da-sim/
  /** Period/boss template scenario file (presets supply one; free pick uses matching period+boss file). */
  scenarioFile: string;
  /** Free composition: exactly 3 agent ids (or TeamSlot[]). Omit to use scenario file's baked team. */
  team?: string[] | TeamSlot[];
  options: Omit<RunOptions, 'onProgress'>;
}

self.onmessage = async (ev: MessageEvent<WorkerRequest>) => {
  const { base, scenarioFile, team, options } = ev.data;
  try {
    const read = async (p: string) => {
      const r = await fetch(new URL(p, base).toString());
      if (!r.ok) throw new Error(`加载失败 ${p}: HTTP ${r.status}`);
      return r.json();
    };
    const bundle = await loadBundle(read, scenarioFile, team ? { team } : undefined);
    let last = 0;
    const result = runDaSim(bundle, {
      ...options,
      onProgress: (step, max, best) => {
        const now = Date.now();
        if (now - last > 150 || step === max) {
          last = now;
          self.postMessage({ type: 'progress', step, max, best });
        }
      },
    });
    self.postMessage({ type: 'done', result });
  } catch (e) {
    self.postMessage({ type: 'error', message: e instanceof Error ? e.message : String(e) });
  }
};
