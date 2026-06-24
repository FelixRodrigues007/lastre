// Tipos mínimos de Node para manter este pacote sem dependências externas.
declare const Buffer: {
  from(input: string, encoding?: string): Uint8Array & { toString(encoding?: string): string };
};

declare module "node:crypto" {
  export function createHash(algorithm: string): {
    update(data: string | Uint8Array): { digest(encoding: "hex"): string };
    digest(encoding: "hex"): string;
  };
  export function randomUUID(): string;
}

declare module "node:fs" {
  export function readFileSync(path: string | URL, encoding: "utf8"): string;
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
