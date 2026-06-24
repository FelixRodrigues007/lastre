// Tipos mínimos para manter o pacote sem dependências externas como @types/node.
declare type Buffer = Uint8Array;

declare const process: {
  env: Record<string, string | undefined>;
};
