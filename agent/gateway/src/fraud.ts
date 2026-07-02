import { randomBytes } from "node:crypto";
import { computeSeal, type ProvenanceArtifact } from "../../sealer/dist/src/sealer.js";
import type { Catalog, CatalogAsset } from "./types.js";

/**
 * Spot-the-Fraud game logic.
 *
 * Honesty contract: the deterministic SHA-256 seal is the ONLY source of truth
 * for the verdict. The game builds a genuine artifact for a fictional lot and a
 * tampered copy with exactly one changed field, then computes BOTH seals with
 * the real sealer. A card is "Valid" only when its seal equals the genuine
 * (reference) seal; otherwise it is "Invalid". Nothing here invents an on-chain
 * verdict — anchoring stays behind the existing SANDBOX-only protections.
 */

export type FraudDifficulty = "easy" | "hard";
export type FraudSide = "A" | "B";

export interface FraudSealCard {
  seal: string;
  measurement: ProvenanceArtifact;
}

export interface FraudChallengeResponse {
  assetId: string;
  challengeId: string;
  difficulty: FraudDifficulty;
  sealA: FraudSealCard;
  sealB: FraudSealCard;
  correctFraud: FraudSide;
  difference: string;
  disclaimer: string;
}

export interface FraudGuessResult {
  correct: boolean;
  verdictA: "Valid" | "Invalid";
  verdictB: "Valid" | "Invalid";
  computedSeals: { A: string; B: string };
  currentStreak: number;
  score: number;
  difference: string;
  tamperedSide: FraudSide;
  assetId: string;
}

interface FraudChallengeRecord {
  assetId: string;
  difficulty: FraudDifficulty;
  genuineSeal: string;
  tamperedSeal: string;
  sealA: FraudSealCard;
  sealB: FraudSealCard;
  correctFraud: FraudSide;
  difference: string;
  used: boolean;
  createdAt: number;
}

export const FRAUD_DISCLAIMER = "DEMONSTRATION — simulated assets, no investment offered";

const CHALLENGE_TTL_MS = 30 * 60 * 1000;
const MAX_CHALLENGES = 500;

export interface FraudGameOptions {
  loadCatalog(): Promise<Catalog>;
  computeSeal?: (artifact: ProvenanceArtifact) => string;
  randomSide?: () => FraudSide;
  now?: () => number;
}

export type FraudChallengeError = "asset_not_in_catalog" | "empty_catalog";
export type FraudGuessError = "challenge_not_found" | "invalid_choice" | "already_played";

export class FraudGame {
  private readonly challenges = new Map<string, FraudChallengeRecord>();
  private readonly loadCatalog: () => Promise<Catalog>;
  private readonly seal: (artifact: ProvenanceArtifact) => string;
  private readonly randomSide: () => FraudSide;
  private readonly now: () => number;

  constructor(options: FraudGameOptions) {
    this.loadCatalog = options.loadCatalog;
    this.seal = options.computeSeal ?? computeSeal;
    this.randomSide = options.randomSide ?? (() => (randomBytes(1)[0] % 2 === 0 ? "A" : "B"));
    this.now = options.now ?? (() => Date.now());
  }

  async createChallenge(
    assetId: string | undefined,
    difficulty: FraudDifficulty,
  ): Promise<{ ok: true; value: FraudChallengeResponse } | { ok: false; error: FraudChallengeError }> {
    const catalog = await this.loadCatalog();
    const assets = catalog.assets ?? [];
    if (assets.length === 0) {
      return { ok: false, error: "empty_catalog" };
    }

    let asset: CatalogAsset | undefined;
    if (assetId) {
      asset = assets.find((candidate) => candidate.assetId === assetId);
      if (!asset) {
        return { ok: false, error: "asset_not_in_catalog" };
      }
    } else {
      asset = assets.find((candidate) => candidate.referenceRegistered === true) ?? assets[0];
    }

    const genuine = buildGenuineArtifact(asset);
    const { tampered, difference } = applyTamper(genuine, difficulty, asset, catalog);

    const genuineSeal = this.seal(genuine);
    const tamperedSeal = this.seal(tampered);

    const fraudSide = this.randomSide();
    const genuineCard: FraudSealCard = { seal: genuineSeal, measurement: genuine };
    const tamperedCard: FraudSealCard = { seal: tamperedSeal, measurement: tampered };
    const sealA = fraudSide === "A" ? tamperedCard : genuineCard;
    const sealB = fraudSide === "A" ? genuineCard : tamperedCard;

    const challengeId = `ch_${randomBytes(9).toString("hex")}`;
    this.pruneExpired();
    this.challenges.set(challengeId, {
      assetId: asset.assetId,
      difficulty,
      genuineSeal,
      tamperedSeal,
      sealA,
      sealB,
      correctFraud: fraudSide,
      difference,
      used: false,
      createdAt: this.now(),
    });

    return {
      ok: true,
      value: {
        assetId: asset.assetId,
        challengeId,
        difficulty,
        sealA,
        sealB,
        correctFraud: fraudSide,
        difference,
        disclaimer: FRAUD_DISCLAIMER,
      },
    };
  }

  resolveGuess(
    challengeId: string,
    userChoice: unknown,
    clientStreak: unknown,
  ): { ok: true; value: FraudGuessResult } | { ok: false; error: FraudGuessError } {
    if (userChoice !== "A" && userChoice !== "B") {
      return { ok: false, error: "invalid_choice" };
    }

    const record = this.challenges.get(challengeId);
    if (!record) {
      return { ok: false, error: "challenge_not_found" };
    }
    if (record.used) {
      return { ok: false, error: "already_played" };
    }
    record.used = true;

    const correct = userChoice === record.correctFraud;
    const previousStreak = normalizeStreak(clientStreak);
    const currentStreak = correct ? previousStreak + 1 : 0;
    const score = computeScore(correct, currentStreak, record.difficulty);

    return {
      ok: true,
      value: {
        correct,
        // The seal alone decides each verdict: a card is Valid only if its seal
        // equals the genuine/reference seal.
        verdictA: record.sealA.seal === record.genuineSeal ? "Valid" : "Invalid",
        verdictB: record.sealB.seal === record.genuineSeal ? "Valid" : "Invalid",
        computedSeals: { A: record.sealA.seal, B: record.sealB.seal },
        currentStreak,
        score,
        difference: record.difference,
        tamperedSide: record.correctFraud,
        assetId: record.assetId,
      },
    };
  }

  getTampered(challengeId: string): { assetId: string; tamperedSeal: string } | null {
    const record = this.challenges.get(challengeId);
    if (!record) {
      return null;
    }
    return { assetId: record.assetId, tamperedSeal: record.tamperedSeal };
  }

  private pruneExpired(): void {
    const cutoff = this.now() - CHALLENGE_TTL_MS;
    for (const [id, record] of this.challenges) {
      if (record.createdAt < cutoff) {
        this.challenges.delete(id);
      }
    }
    if (this.challenges.size > MAX_CHALLENGES) {
      const overflow = this.challenges.size - MAX_CHALLENGES;
      let removed = 0;
      for (const id of this.challenges.keys()) {
        if (removed >= overflow) {
          break;
        }
        this.challenges.delete(id);
        removed += 1;
      }
    }
  }
}

export function normalizeDifficulty(value: unknown): FraudDifficulty {
  return value === "hard" ? "hard" : "easy";
}

function buildGenuineArtifact(asset: CatalogAsset): ProvenanceArtifact {
  const origin = asset.origin ?? { lat: -30.05, lng: -53.2, label: "Fictional demo sector" };
  return {
    assetId: asset.assetId,
    category: "mineral",
    origin: {
      lat: origin.lat,
      lng: origin.lng,
      site: origin.label ?? "Fictional demo sector",
    },
    frameHash: "0000000000000000000000000000000000000000000000000000000000000000",
    massGrams: 125_000,
    capturedAtISO: "2026-06-23T18:30:00.000Z",
    operator: asset.operator ?? "Fictional Demo Operator",
  };
}

function applyTamper(
  genuine: ProvenanceArtifact,
  difficulty: FraudDifficulty,
  asset: CatalogAsset,
  catalog: Catalog,
): { tampered: ProvenanceArtifact; difference: string } {
  const tampered: ProvenanceArtifact = {
    ...genuine,
    origin: { ...genuine.origin },
  };
  const massGrams = genuine.massGrams ?? 125_000;

  if (difficulty === "easy") {
    tampered.massGrams = massGrams + 1;
    return {
      tampered,
      difference: `massGrams changed by +1 (${massGrams}g → ${tampered.massGrams}g)`,
    };
  }

  // Hard mode: a subtle, realistic, single-field change that still breaks the seal.
  const variant = randomBytes(1)[0] % 2;
  if (variant === 0) {
    const bumped = Math.round(massGrams * 1.001);
    tampered.massGrams = bumped === massGrams ? massGrams + 1 : bumped;
    return {
      tampered,
      difference: `massGrams changed by +0.1% (${massGrams}g → ${tampered.massGrams}g)`,
    };
  }

  const nudged = nudgeOutsidePerimeter(genuine.origin.lat, catalog);
  tampered.origin.lat = nudged;
  return {
    tampered,
    difference: `origin latitude shifted outside the fictional perimeter (${genuine.origin.lat} → ${tampered.origin.lat})`,
  };
}

function nudgeOutsidePerimeter(lat: number, catalog: Catalog): number {
  const polygon = (catalog.perimeter as { polygon?: Array<{ lat: number; lng: number }> } | undefined)?.polygon;
  if (Array.isArray(polygon) && polygon.length > 0) {
    const lats = polygon.map((point) => point.lat);
    const maxLat = Math.max(...lats);
    const minLat = Math.min(...lats);
    const outside = lat >= 0 ? maxLat + 0.05 : minLat - 0.05;
    return Number(outside.toFixed(4));
  }
  return Number((lat + 0.05).toFixed(4));
}

function normalizeStreak(value: unknown): number {
  if (typeof value === "number" && Number.isFinite(value) && value >= 0) {
    return Math.floor(value);
  }
  return 0;
}

function computeScore(correct: boolean, currentStreak: number, difficulty: FraudDifficulty): number {
  if (!correct) {
    return 0;
  }
  const base = 40;
  const streakBonus = Math.min(48, currentStreak * 8);
  const difficultyBonus = difficulty === "hard" ? 12 : 0;
  return Math.max(1, Math.min(100, base + streakBonus + difficultyBonus));
}
