import assert from "node:assert/strict";
import test, { beforeEach } from "node:test";

import * as locale from "../src/lib/locale";

/** Minimal in-memory localStorage double we can also make throw on demand. */
class MemoryStorage {
  private store = new Map<string, string>();
  throwOnSet = false;
  throwOnGet = false;

  getItem(key: string): string | null {
    if (this.throwOnGet) throw new Error("blocked");
    return this.store.has(key) ? (this.store.get(key) as string) : null;
  }

  setItem(key: string, value: string): void {
    if (this.throwOnSet) throw new Error("blocked");
    this.store.set(key, String(value));
  }

  removeItem(key: string): void {
    this.store.delete(key);
  }

  clear(): void {
    this.store.clear();
  }
}

function installStorage(): MemoryStorage {
  const mem = new MemoryStorage();
  (globalThis as { localStorage?: unknown }).localStorage = mem;
  return mem;
}

beforeEach(() => {
  installStorage();
});

test("normalizeLocale only accepts 'pt', everything else is 'en'", () => {
  assert.equal(typeof locale.normalizeLocale, "function");
  assert.equal(locale.normalizeLocale("pt"), "pt");
  assert.equal(locale.normalizeLocale("en"), "en");
  assert.equal(locale.normalizeLocale("PT"), "en");
  assert.equal(locale.normalizeLocale("pt-BR"), "en");
  assert.equal(locale.normalizeLocale(""), "en");
  assert.equal(locale.normalizeLocale(null), "en");
  assert.equal(locale.normalizeLocale(undefined), "en");
  assert.equal(locale.normalizeLocale("garbage"), "en");
});

test("fresh browser with no stored preference resolves to 'en'", () => {
  assert.equal(locale.getStoredLocale(), "en");
});

test("a stale 'pt' left over from earlier testing reopens in 'en' (one-time reset)", () => {
  const mem = installStorage();
  // Simulate a browser toggled to PT before the EN-default fix that has
  // never seen the reset marker.
  mem.setItem("lastro-locale", "pt");

  assert.equal(locale.getStoredLocale(), "en");
  // The stale value must be cleared so it cannot win again.
  assert.equal(mem.getItem("lastro-locale"), null);
});

test("after the one-time reset, an explicit 'pt' choice persists across reloads", () => {
  const mem = installStorage();
  // First load performs the reset and records the marker.
  locale.getStoredLocale();
  // User explicitly switches to PT.
  locale.applyLocale("pt");
  assert.equal(mem.getItem("lastro-locale"), "pt");
  // Next reload must respect the explicit choice, not reset again.
  assert.equal(locale.getStoredLocale(), "pt");
});

test("getStoredLocale never throws when localStorage access is blocked", () => {
  const mem = installStorage();
  mem.throwOnGet = true;
  assert.equal(locale.getStoredLocale(), "en");
});

test("applyLocale does not throw when setItem is blocked", () => {
  const mem = installStorage();
  mem.throwOnSet = true;
  assert.doesNotThrow(() => locale.applyLocale("en"));
});
