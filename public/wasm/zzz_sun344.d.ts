/* tslint:disable */
/* eslint-disable */

/**
 * Pre-caches `sun_team_344_spec.json` inside this Web Worker's WASM memory so `< 2 ms` replays
 * do not need to re-transfer or re-parse the spec JSON on every call.
 */
export function sun344_cache_spec_json(spec_json: string): string;

/**
 * Multi-Worker Stage 2: runs LNS sliding-window exploration on `idx % shard_count == shard_idx`.
 */
export function sun344_lns_shard_json(req_json: string): string;

/**
 * Multi-Worker Stage 3: runs endgame tail polish + strict fixed-point convergence on shard finalists.
 */
export function sun344_polish_json(req_json: string): string;

/**
 * Deterministic `< 5 ms` replay of a `zzz-sun344` macro sequence with custom Mindscape / W-Engine /
 * Drive Disc 4+2 / Sub-stat overrides and 15-zone inspector output.
 */
export function sun344_replay_json(req_json: string): string;

/**
 * Full Two-Stage Cycle-Aware Beam Search + LNS Fixed-Point Refinement (`<= 256 MB` streaming memory).
 */
export function sun344_search_json(req_json: string): string;

/**
 * Multi-Worker Stage 1: runs Two-Stage Cycle Beam Search to emit diverse Top-K 180s seed trajectories.
 */
export function sun344_stage1_json(req_json: string): string;

export type InitInput = RequestInfo | URL | Response | BufferSource | WebAssembly.Module;

export interface InitOutput {
    readonly memory: WebAssembly.Memory;
    readonly sun344_cache_spec_json: (a: number, b: number) => [number, number, number, number];
    readonly sun344_lns_shard_json: (a: number, b: number) => [number, number, number, number];
    readonly sun344_polish_json: (a: number, b: number) => [number, number, number, number];
    readonly sun344_replay_json: (a: number, b: number) => [number, number, number, number];
    readonly sun344_search_json: (a: number, b: number) => [number, number, number, number];
    readonly sun344_stage1_json: (a: number, b: number) => [number, number, number, number];
    readonly __wbindgen_externrefs: WebAssembly.Table;
    readonly __wbindgen_malloc: (a: number, b: number) => number;
    readonly __wbindgen_realloc: (a: number, b: number, c: number, d: number) => number;
    readonly __wbindgen_free: (a: number, b: number, c: number) => void;
    readonly __externref_table_dealloc: (a: number) => void;
    readonly __wbindgen_start: () => void;
}

export type SyncInitInput = BufferSource | WebAssembly.Module;

/**
 * Instantiates the given `module`, which can either be bytes or
 * a precompiled `WebAssembly.Module`.
 *
 * @param {{ module: SyncInitInput }} module - Passing `SyncInitInput` directly is deprecated.
 *
 * @returns {InitOutput}
 */
export function initSync(module: { module: SyncInitInput } | SyncInitInput): InitOutput;

/**
 * If `module_or_path` is {RequestInfo} or {URL}, makes a request and
 * for everything else, calls `WebAssembly.instantiate` directly.
 *
 * @param {{ module_or_path: InitInput | Promise<InitInput> }} module_or_path - Passing `InitInput` directly is deprecated.
 *
 * @returns {Promise<InitOutput>}
 */
export default function __wbg_init (module_or_path?: { module_or_path: InitInput | Promise<InitInput> } | InitInput | Promise<InitInput>): Promise<InitOutput>;
