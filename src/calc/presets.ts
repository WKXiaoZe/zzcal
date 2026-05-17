// src/calc/presets.ts
// Async loader for legacy on-disk JSON presets (dps/sup/wpDPS/wpSUP folders).
//
// Most presets are already mirrored into CHARACTER_DB / WEAPON_DB and can be
// resolved synchronously. The wpSUP folder, however, is JSON-only in legacy
// (`REPO_FILES.wpSUP`, index-legacy.html L504-506) — the React refactor lost
// these until this helper restored them. dps / sup / wpDPS lists are exposed
// here too so future UI parity stays trivial; today they only contain entries
// also present in the in-memory DBs.
//
// Files in legacy use a `Base/C1/C2/C4/C6` (or `S1/S2/S3/S4/S5`) slash-string
// shape that `parseAgentValue` / `parseWeaponValue` already understand, so the
// caller just spreads the parsed JSON into a slot's customOverrides at the
// current cinema/star.

export type PresetFolder = 'dps' | 'sup' | 'wpDPS' | 'wpSUP';

/**
 * Filenames per folder, mirroring legacy REPO_FILES (and the on-disk dps/sup/
 * wpDPS dirs which legacy resolved through the in-memory DB rather than fetch).
 * Stored without the `.json` extension so the display name can be used directly
 * as a select option label, matching legacy `file.replace('.json', '')` (L833).
 */
export const PRESET_FILES: Record<PresetFolder, readonly string[]> = {
  // dps / sup / wpDPS: legacy populated these dropdowns from the in-memory DB.
  // Listed here for future UI overlays; today they all dedupe to DB entries.
  dps: [
    '11号Ⅵ',
    '仪玄',
    '伊芙琳',
    '叶瞬光',
    '奥菲斯',
    '悠真',
    '艾莲·乔Ⅵ',
    '零号安比Ⅵ',
  ],
  sup: [
    '千夏',
    '卢西娅',
    '奥菲斯-辅助',
    '扳机',
    '照',
    '琉音',
    '耀嘉音',
    '莱特',
    '青衣',
  ],
  wpDPS: [
    '云霓孤光',
    '嚣枪喧焰',
    '心弦夜响',
    '残心青囊',
    '深海访客',
    '牺牲洁纯',
    '硫磺石',
    '青溟笼舍',
  ],
  // wpSUP: copied verbatim from legacy REPO_FILES.wpSUP (L505).
  wpSUP: [
    '昨夜来电',
    '半糖雪兔',
    '好斗的阿炮',
    '玲珑妆匣',
    '焰心桂冠',
    '玉壶青冰',
    '思络成歌',
    '索魂影眸',
    '铸梦炉歌',
  ],
};

/**
 * Fetch a JSON preset from the matching folder. The dev server serves the
 * project root, and Vite's production build copies these folders verbatim, so
 * a relative `./<folder>/<name>.json` path works in both modes.
 *
 * Throws on HTTP failure or invalid JSON; the caller is expected to catch and
 * log without crashing the React tree.
 */
export async function loadPresetJson(
  folder: PresetFolder,
  name: string,
): Promise<Record<string, unknown>> {
  const path = `./${folder}/${name}.json`;
  const res = await fetch(path);
  if (!res.ok) {
    throw new Error(`Failed to load preset ${folder}/${name}.json: ${res.status}`);
  }
  return (await res.json()) as Record<string, unknown>;
}
