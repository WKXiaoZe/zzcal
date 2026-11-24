// Minimal Cloudflare Worker runtime & binding types compatible with both
// root `tsconfig.json` (DOM + ES2022) and Wrangler bundling.

interface SubtleCrypto {
  timingSafeEqual(a: BufferSource, b: BufferSource): boolean;
}

interface ExecutionContext {
  waitUntil(promise: Promise<unknown>): void;
  passThroughOnException(): void;
}

interface Fetcher {
  fetch(input: RequestInfo | URL, init?: RequestInit): Promise<Response>;
}

interface D1Meta {
  duration?: number;
  changes?: number;
  last_row_id?: number;
  rows_read?: number;
  rows_written?: number;
}

interface D1Result<T = Record<string, unknown>> {
  results: T[];
  success: boolean;
  meta: D1Meta;
}

interface D1PreparedStatement {
  bind(...values: unknown[]): D1PreparedStatement;
  first<T = Record<string, unknown>>(colName?: string): Promise<T | null>;
  run<T = Record<string, unknown>>(): Promise<D1Result<T>>;
  all<T = Record<string, unknown>>(): Promise<D1Result<T>>;
}

interface D1Database {
  prepare(query: string): D1PreparedStatement;
  batch<T = unknown>(statements: D1PreparedStatement[]): Promise<D1Result<T>[]>;
  exec(query: string): Promise<{ count: number; duration: number }>;
}

interface KVNamespacePutOptions {
  expiration?: number;
  expirationTtl?: number;
  metadata?: unknown;
}

interface KVNamespaceGetWithMetadataResult<Value, Metadata> {
  value: Value | null;
  metadata: Metadata | null;
}

interface KVNamespace {
  get(key: string, type?: 'text'): Promise<string | null>;
  get(key: string, type: 'stream'): Promise<ReadableStream<Uint8Array> | null>;
  get(key: string, type: 'arrayBuffer'): Promise<ArrayBuffer | null>;
  get<T = unknown>(key: string, type: 'json'): Promise<T | null>;
  getWithMetadata<Metadata = unknown>(
    key: string,
    type: 'stream',
  ): Promise<KVNamespaceGetWithMetadataResult<ReadableStream<Uint8Array>, Metadata>>;
  getWithMetadata<Metadata = unknown>(
    key: string,
    type?: 'text',
  ): Promise<KVNamespaceGetWithMetadataResult<string, Metadata>>;
  put(
    key: string,
    value: string | ArrayBuffer | ArrayBufferView | ReadableStream,
    options?: KVNamespacePutOptions,
  ): Promise<void>;
  delete(key: string): Promise<void>;
}

interface ExportedHandler<Env = unknown> {
  fetch(request: Request, env: Env, ctx: ExecutionContext): Response | Promise<Response>;
}
