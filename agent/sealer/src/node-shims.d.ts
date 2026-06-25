// SPDX-License-Identifier: BUSL-1.1
// Minimal Node type declarations for this small offline demo.
// This keeps the project dependency-free: no @types/node package is required.
declare class Buffer extends Uint8Array {
  static from(input: string | ArrayBuffer | Uint8Array, encoding?: string): Buffer;
}

declare module "node:crypto" {
  export function createHash(algorithm: string): {
    update(data: string | Buffer | Uint8Array): { digest(encoding: "hex"): string };
    digest(encoding: "hex"): string;
  };
}

declare module "node:fs" {
  export function readFileSync(path: string | URL, encoding: "utf8"): string;
}

declare module "node:test" {
  export default function test(name: string, fn: () => void | Promise<void>): void;
}

declare module "node:assert/strict" {
  export function equal<T>(actual: T, expected: T, message?: string): void;
  export function notEqual<T>(actual: T, expected: T, message?: string): void;
  export function deepEqual<T>(actual: T, expected: T, message?: string): void;
}
