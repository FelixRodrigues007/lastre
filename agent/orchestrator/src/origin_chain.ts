import type { ProvenanceArtifact } from "../../sealer/dist/src/sealer.js";
import { computeSeal } from "../../sealer/dist/src/sealer.js";
import type { OriginChain, VerificationVerdict } from "./types.js";

/** In-memory mock of the ProofOfOrigin contract. */
export class MockOriginChain implements OriginChain {
  private readonly references = new Map<string, string>();
  private readonly attestations = new Map<string, VerificationVerdict>();
  private accepted = 0;
  private rejected = 0;

  registerReference(assetId: string, seal: string): void {
    this.references.set(assetId, seal);
  }

  attest(assetId: string, providedSeal: string): { verdict: VerificationVerdict } {
    const referenceSeal = this.references.get(assetId);
    if (!referenceSeal) {
      throw new Error(`UnknownAsset: reference não registrada para ${assetId}`);
    }

    const verdict: VerificationVerdict = providedSeal === referenceSeal ? "Valid" : "Invalid";
    this.attestations.set(assetId, verdict);

    if (verdict === "Valid") {
      this.accepted += 1;
    } else {
      this.rejected += 1;
    }

    return { verdict };
  }

  acceptedCount(): number {
    return this.accepted;
  }

  rejectedCount(): number {
    return this.rejected;
  }

  isAttested(assetId: string): boolean {
    return this.attestations.has(assetId);
  }
}

/** Convenience for demos/tests: registers known referenceSeals before processing lots. */
export function createOriginChainWithReferences(referenceArtifacts: ProvenanceArtifact[]): MockOriginChain {
  const originChain = new MockOriginChain();

  for (const artifact of referenceArtifacts) {
    originChain.registerReference(artifact.assetId, computeSeal(artifact));
  }

  return originChain;
}
