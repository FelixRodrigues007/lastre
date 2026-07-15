// Minimal Node types to keep this package free of external dependencies.
declare const Buffer: {
  from(input: string, encoding?: string): Uint8Array & { toString(encoding?: string): string };
};

declare const process: {
  env: Record<string, string | undefined>;
};

declare namespace NodeJS {
  type ProcessEnv = Record<string, string | undefined>;
}

declare module "node:crypto" {
  export function createHash(algorithm: string): {
    update(data: string | Uint8Array, encoding?: string): {
      update(data: string | Uint8Array, encoding?: string): { digest(encoding: "hex"): string };
      digest(encoding: "hex"): string;
    };
    digest(encoding: "hex"): string;
  };
  export function randomUUID(): string;
}

declare module "node:fs" {
  export function readFileSync(path: string | URL, encoding?: "utf8" | string): string;
  export function writeFileSync(
    path: string | URL,
    data: string | Uint8Array,
    options?: { mode?: number } | string,
  ): void;
  export function mkdirSync(path: string | URL, options?: { recursive?: boolean }): void;
  export function existsSync(path: string | URL): boolean;
}

declare module "node:os" {
  export function tmpdir(): string;
}

declare module "node:path" {
  export function join(...parts: string[]): string;
}

declare module "node:util" {
  export function promisify<T extends (...args: never[]) => unknown>(fn: T): (...args: Parameters<T>) => Promise<unknown>;
}

declare module "node:child_process" {
  export type ExecFileOptions = {
    encoding?: string;
    timeout?: number;
    maxBuffer?: number;
    cwd?: string;
    env?: Record<string, string | undefined>;
  };
  export function execFile(
    command: string,
    args: string[],
    options: ExecFileOptions,
    callback: (error: Error | null, stdout: string, stderr: string) => void,
  ): void;
}

declare module "node:http" {
  export type IncomingMessage = {
    method?: string;
    url?: string;
    headers: Record<string, string | string[] | undefined>;
  };
  export type ServerResponse = {
    statusCode: number;
    setHeader(name: string, value: string): void;
    end(data?: string): void;
  };
  export type Server = {
    listen(port: number, callback?: () => void): Server;
    close(callback?: (err?: Error) => void): void;
    address(): { port: number } | string | null;
  };
  export function createServer(
    handler: (req: IncomingMessage, res: ServerResponse) => void | Promise<void>,
  ): Server;
}
