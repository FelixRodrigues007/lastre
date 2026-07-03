import type { LotDetail } from "./types";
import type { VerdictHeroTone } from "../components/lots/VerdictHero";

export function resolveVerdictTone(lot: LotDetail): VerdictHeroTone {
  if (lot.sealMatchesReference === false || lot.latestVerdict === "Invalid") {
    return "invalid";
  }
  if (lot.latestVerdict === "Valid" || lot.sealMatchesReference === true) {
    return "valid";
  }
  return "pending";
}

export function drawerStatusLine(lot: LotDetail, tone: VerdictHeroTone): string {
  const hasCasper = Boolean(lot.testnetAttestation ?? lot.auditRecord?.onChain);
  if (tone === "valid" && hasCasper) {
    return "Seal matches reference · recorded on Casper testnet";
  }
  if (tone === "valid") return "Seal matches reference";
  if (tone === "invalid") return "Seal diverges from reference — tamper detected";
  return "Awaiting proof batch";
}
