import { inferExpectedKind } from "./processLots";
import type { BatchSummary, LotListItem } from "./types";

export function countLotOutcomes(lots: LotListItem[]): BatchSummary {
  const counts = { tokenizable: 0, rejected: 0, skipped: 0, escalated: 0, onChainAccepted: 0, onChainRejected: 0 };

  for (const lot of lots) {
    const outcome = lot.auditRecord?.outcome;
    if (outcome === "tokenizable") counts.tokenizable += 1;
    else if (outcome === "rejected") counts.rejected += 1;
    else if (outcome === "skipped") counts.skipped += 1;
    else if (outcome === "escalated") counts.escalated += 1;
    else if (lot.latestVerdict === "Valid") counts.tokenizable += 1;
    else if (lot.latestVerdict === "Invalid" || lot.sealMatchesReference === false) counts.rejected += 1;
    else {
      const kind = inferExpectedKind(lot);
      if (kind === "escalate") counts.escalated += 1;
      else if (kind === "skip") counts.skipped += 1;
      else if (kind === "invalid") counts.rejected += 1;
      else counts.skipped += 1;
    }
  }

  return counts;
}
