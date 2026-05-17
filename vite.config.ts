import path from 'path';
import fs from 'fs';
import { defineConfig, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';

/**
 * Copies the legacy on-disk preset folders (and the existing `resources/`
 * media folder) into the build output. Vite's dev server serves them straight
 * from the project root, but production builds only emit `assets/`, so the
 * `fetch('./<folder>/<name>.json')` calls in AgentPanel/WeaponPanel would
 * 404 without this. Kept inline so future deploys stay self-contained.
 */
function copyStaticFolders(folders: string[]): Plugin {
  return {
    name: 'zzcal:copy-static-folders',
    apply: 'build',
    closeBundle() {
      const outDir = path.resolve(__dirname, 'dist');
      for (const folder of folders) {
        const src = path.resolve(__dirname, folder);
        if (!fs.existsSync(src)) continue;
        const dest = path.join(outDir, folder);
        fs.cpSync(src, dest, { recursive: true });
      }
    },
  };
}

export default defineConfig({
  server: { port: 3000, host: '0.0.0.0' },
  plugins: [
    react(),
    copyStaticFolders(['dps', 'sup', 'wpDPS', 'wpSUP', 'resources']),
  ],
  resolve: {
    alias: { '@': path.resolve(__dirname, 'src') },
  },
});
