/**
 * Persistent demo-collateral locks for Sealed Market Rail step 5.
 *
 * Survives API restarts (Render free-tier restarts wipe in-memory Maps).
 * File path: LASTRE_COLLATERAL_PATH or LASTRE_DATA_DIR/collateral-locks.json
 * or /tmp/lastre-collateral-locks.json (writable in Docker).
 *
 * DEMONSTRATION ONLY — not a lending market; no liquidation / yield.
 */

import { existsSync, mkdirSync, readFileSync, renameSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { tmpdir } from "node:os";

export type CollateralLockRecord = {
  owner: string;
  lockedAt: string;
};

export type CollateralStoreSnapshot = {
  version: 1;
  updatedAt: string;
  locks: Record<string, CollateralLockRecord>;
};

function resolveStorePath(env: NodeJS.ProcessEnv = process.env): string {
  if (env.LASTRE_COLLATERAL_PATH?.trim()) return env.LASTRE_COLLATERAL_PATH.trim();
  if (env.LASTRE_DATA_DIR?.trim()) {
    return join(env.LASTRE_DATA_DIR.trim(), "collateral-locks.json");
  }
  // Prefer /data if mounted (Render disk); else tmp
  if (existsSync("/data") || env.RENDER === "true") {
    try {
      mkdirSync("/data/lastre", { recursive: true });
      return "/data/lastre/collateral-locks.json";
    } catch {
      /* fall through */
    }
  }
  return join(tmpdir(), "lastre-collateral-locks.json");
}

export class CollateralStore {
  private readonly path: string;
  private locks = new Map<string, CollateralLockRecord>();

  constructor(path = resolveStorePath()) {
    this.path = path;
    this.load();
  }

  get filePath(): string {
    return this.path;
  }

  private load(): void {
    try {
      if (!existsSync(this.path)) return;
      const raw = readFileSync(this.path, "utf8");
      const parsed = JSON.parse(raw) as Partial<CollateralStoreSnapshot>;
      if (!parsed.locks || typeof parsed.locks !== "object") return;
      this.locks = new Map(
        Object.entries(parsed.locks).filter(
          ([, v]) => v && typeof v.owner === "string" && typeof v.lockedAt === "string",
        ),
      );
    } catch (error) {
      console.warn(
        "[lastre-collateral] load failed, starting empty:",
        error instanceof Error ? error.message : error,
      );
      this.locks = new Map();
    }
  }

  private persist(): void {
    try {
      const dir = dirname(this.path);
      if (dir && dir !== ".") {
        mkdirSync(dir, { recursive: true });
      }
      const snapshot: CollateralStoreSnapshot = {
        version: 1,
        updatedAt: new Date().toISOString(),
        locks: Object.fromEntries(this.locks.entries()),
      };
      const tmp = `${this.path}.${process.pid}.tmp`;
      writeFileSync(tmp, `${JSON.stringify(snapshot, null, 2)}\n`, { mode: 0o600 });
      renameSync(tmp, this.path);
    } catch (error) {
      console.warn(
        "[lastre-collateral] persist failed:",
        error instanceof Error ? error.message : error,
      );
    }
  }

  get(assetId: string): CollateralLockRecord | null {
    return this.locks.get(assetId) ?? null;
  }

  has(assetId: string): boolean {
    return this.locks.has(assetId);
  }

  set(assetId: string, owner: string, lockedAt = new Date().toISOString()): void {
    this.locks.set(assetId, { owner, lockedAt });
    this.persist();
  }

  delete(assetId: string): boolean {
    const ok = this.locks.delete(assetId);
    if (ok) this.persist();
    return ok;
  }

  listByOwner(owner: string): Array<{ assetId: string; owner: string; lockedAt: string }> {
    return Array.from(this.locks.entries())
      .filter(([, lock]) => lock.owner === owner)
      .map(([assetId, lock]) => ({ assetId, ...lock }));
  }

  size(): number {
    return this.locks.size;
  }

  /** Test helper: clear all locks and wipe file. */
  clear(): void {
    this.locks.clear();
    this.persist();
  }
}
