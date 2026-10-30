/// <reference lib="webworker" />
import { loadBundle, runDaSim, type RunOptions } from './runner';

export interface WorkerRequest {
  base: string; // absolute URL of public/da-sim/
  scenarioFile: string;
  options: Omit<RunOptions, 'onProgress'>;
}

self.onmessage = async (ev: MessageEvent<WorkerRequest>) => {
  const { base, scenarioFile, options } = ev.data;
  try {
    const read = async (p: string) => {
      const r = await fetch(new URL(p, base).toString());
      if (!r.ok) throw new Error(`加载失败 ${p}: HTTP ${r.status}`);
      return r.json();
    };
    const bundle = await loadBundle(read, scenarioFile);
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
