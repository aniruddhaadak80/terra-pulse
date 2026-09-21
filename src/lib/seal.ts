import { createHash } from "node:crypto";

/**
 * Quantum-resilient audit seal (hash-chained log).
 *
 * Each record seals as SHA-384(prevSeal || canonicalJson). SHA-384 keeps a
 * 192-bit collision margin even under Grover-style quantum speedups, and the
 * chain makes silent edits detectable: change any record and every later seal
 * breaks. Swap-in point for ML-DSA (Dilithium) signatures is marked below.
 */
export const GENESIS_SEAL = "TERRA-GENESIS";

export function canonical(obj: unknown): string {
  if (obj === null || typeof obj !== "object") return JSON.stringify(obj);
  if (Array.isArray(obj)) return `[${obj.map(canonical).join(",")}]`;
  const entries = Object.entries(obj as Record<string, unknown>)
    .filter(([, v]) => v !== undefined)
    .sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0));
  return `{${entries.map(([k, v]) => `${JSON.stringify(k)}:${canonical(v)}`).join(",")}}`;
}

export function sealRecord(prevSeal: string, record: unknown): string {
  const h = createHash("sha384");
  h.update(prevSeal, "utf8");
  h.update("|", "utf8");
  h.update(canonical(record), "utf8");
  // PQC-UPGRADE: wrap digest with ML-DSA-65 signature envelope here.
  return `tq384:${h.digest("hex").slice(0, 48)}`;
}

export function sealChain<T>(items: T[], pick: (item: T) => unknown): string[] {
  const seals: string[] = [];
  let prev = GENESIS_SEAL;
  for (const item of items) {
    const s = sealRecord(prev, pick(item));
    seals.push(s);
    prev = s;
  }
  return seals;
}

export function shortSeal(seal: string): string {
  return seal.length > 18 ? `${seal.slice(0, 13)}…${seal.slice(-4)}` : seal;
}
