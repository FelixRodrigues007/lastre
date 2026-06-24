import { createHash } from "node:crypto";

/**
 * Versão do formato do passaporte gerado pelo sealer.
 *
 * Esta versão entra no Passport (metadados), mas o seal é calculado somente a
 * partir do ProvenanceArtifact recebido. Assim, a mesma captura sempre gera o
 * mesmo selo, sem estado externo.
 */
export const PASSPORT_VERSION = "1.0.0" as const;
export const SEAL_ALGO = "SHA-256" as const;

/** Captura fictícia de procedência na origem do lote. */
export type ProvenanceArtifact = {
  /** Identificador do ativo/lote usado também no contrato. */
  assetId: string;
  /** Geolocalização e nome humano do ponto de origem. */
  origin: {
    lat: number;
    lng: number;
    site: string;
  };
  /** Hash do frame de câmera. No demo é simulado, mas preserva a arquitetura futura. */
  frameHash: string;
  /** Massa do lote em gramas. */
  massGrams: number;
  /** Timestamp da captura como dado de entrada; nunca é gerado automaticamente aqui. */
  capturedAtISO: string;
  /** Operador responsável pela captura na origem. */
  operator: string;
};

/** Passaporte offline que pode alimentar o contrato e um audit log. */
export type Passport = {
  artifact: ProvenanceArtifact;
  seal: string;
  sealAlgo: typeof SEAL_ALGO;
  version: typeof PASSPORT_VERSION;
};

type CanonicalValue =
  | null
  | string
  | number
  | boolean
  | CanonicalValue[]
  | { [key: string]: CanonicalValue };

/**
 * Hash de um frame bruto de câmera.
 *
 * Hoje os samples usam um buffer fictício; no futuro, a mesma função pode
 * receber bytes reais de uma câmera sem mudar a arquitetura do sealer.
 */
export function hashFrame(buffer: Buffer): string {
  return createHash("sha256").update(buffer).digest("hex");
}

/**
 * Produz uma string canônica determinística para o artefato.
 *
 * A função ordena as chaves de todos os objetos recursivamente antes de
 * serializar. Isso evita que a ordem das propriedades no JSON/objeto JavaScript
 * mude o hash final. Não há aleatoriedade, timestamp gerado em runtime, rede ou
 * dependência externa.
 *
 * A ordenação usa comparação por unidade de código (UTF-16), e NÃO
 * `localeCompare`. Isso é proposital: `localeCompare` depende de locale/ICU do
 * ambiente e poderia ordenar chaves de forma diferente em outra máquina,
 * quebrando o determinismo ("o mesmo input produz SEMPRE o mesmo hash").
 * A ordenação por code unit é estável e independente de ambiente — a mesma
 * regra usada pelo JSON Canonicalization Scheme (RFC 8785).
 */
export function canonicalize(artifact: ProvenanceArtifact): string {
  return canonicalizeValue(artifact as unknown as CanonicalValue);
}

/** Retorna o SHA-256 hexadecimal da representação canônica do artefato. */
export function computeSeal(artifact: ProvenanceArtifact): string {
  return createHash("sha256").update(canonicalize(artifact)).digest("hex");
}

/** Monta o passaporte do lote com o artefato original, selo, algoritmo e versão. */
export function buildPassport(artifact: ProvenanceArtifact): Passport {
  return {
    artifact,
    seal: computeSeal(artifact),
    sealAlgo: SEAL_ALGO,
    version: PASSPORT_VERSION,
  };
}

/** Recalcula o selo e compara com o valor esperado, espelhando a checagem on-chain. */
export function verifySeal(artifact: ProvenanceArtifact, expectedSeal: string): boolean {
  return computeSeal(artifact) === expectedSeal;
}

function canonicalizeValue(value: CanonicalValue): string {
  if (value === null || typeof value !== "object") {
    return serializePrimitive(value);
  }

  if (Array.isArray(value)) {
    return `[${value.map((item) => canonicalizeValue(item)).join(",")}]`;
  }

  const entries = Object.entries(value).sort(([leftKey], [rightKey]) =>
    compareCodeUnits(leftKey, rightKey),
  );

  return `{${entries
    .map(([key, entryValue]) => `${JSON.stringify(key)}:${canonicalizeValue(entryValue)}`)
    .join(",")}}`;
}

/**
 * Comparação determinística por unidade de código (UTF-16), independente de
 * locale. Retorna -1, 0 ou 1 para uso em `Array.prototype.sort`.
 */
function compareCodeUnits(left: string, right: string): number {
  if (left < right) {
    return -1;
  }
  if (left > right) {
    return 1;
  }
  return 0;
}

function serializePrimitive(value: null | string | number | boolean): string {
  if (typeof value === "number" && !Number.isFinite(value)) {
    throw new Error("Cannot canonicalize non-finite numbers");
  }

  return JSON.stringify(value);
}
