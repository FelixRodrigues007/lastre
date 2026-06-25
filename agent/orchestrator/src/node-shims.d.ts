// Minimal types to keep this package free of external dependencies such as @types/node.
declare type Buffer = Uint8Array;

declare const process: {
  env: Record<string, string | undefined>;
};
