/**
 * Production chunk sanitizer (build-time only, never bundled into the app).
 *
 * The rolldown-based bundler intermittently emits invalid `__vite__mapDeps`
 * preload arguments in lazy chunks. Observed corrupt shapes (all are syntax
 * errors in any valid program, so these patterns cannot false-positive):
 *
 * - `__vite__mapDeps([...])<hex>` — content hash glued onto the call.
 * - `void <hex>` — hash where the dep-list operand should be.
 * - `[]<hex>` — hash glued onto an empty dep list.
 *
 * Repairs preserve the evident runtime intent: an empty dep list preloads
 * nothing (`__vitePreload(fn, [])`), and `void 0` keeps the `void` operand
 * shape while restoring a valid literal.
 */

export interface ChunkRepair {
  /** Short name of the repair rule that fired. */
  name: string;
  /** Pattern matching only provably-invalid code. */
  pattern: RegExp;
  /** Replacement restoring the intended valid code. */
  replacement: string;
}

export const CHUNK_REPAIRS: ChunkRepair[] = [
  {
    name: "glued-hash",
    pattern: /(__vite__mapDeps\(\[[^\]]*\]\))[0-9a-f]{16,64}/g,
    replacement: "$1",
  },
  {
    name: "void-hash",
    pattern: /void [0-9a-fA-F]{16,}(?![0-9a-fA-F])/g,
    replacement: "void 0",
  },
  {
    name: "empty-deps-hash",
    pattern: /\[\][0-9a-fA-F]{16,}(?![0-9a-fA-F])/g,
    replacement: "[]",
  },
];

export interface SanitizeResult {
  code: string;
  repaired: boolean;
  repairs: string[];
}

export function sanitizeChunkCode(code: string): SanitizeResult {
  let repaired = code;
  const repairs: string[] = [];
  for (const { name, pattern, replacement } of CHUNK_REPAIRS) {
    const next = repaired.replace(pattern, replacement);
    if (next !== repaired) {
      repairs.push(name);
    }
    repaired = next;
  }
  return { code: repaired, repaired: repairs.length > 0, repairs };
}
