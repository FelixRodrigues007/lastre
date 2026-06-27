import { useEffect, useState } from "react";
import { ON_CHAIN_ACCEPTED, ON_CHAIN_REJECTED } from "../site-links";

type Stats = { accepted: number; rejected: number; live: boolean };

const FALLBACK: Stats = {
  accepted: ON_CHAIN_ACCEPTED,
  rejected: ON_CHAIN_REJECTED,
  live: false,
};

/** Poll-friendly hook — falls back to README counts when no API is available. */
export function useOnChainStats(): Stats {
  const [stats, setStats] = useState<Stats>(FALLBACK);

  useEffect(() => {
    let cancelled = false;

    const refresh = async () => {
      try {
        const res = await fetch("/api/on-chain-stats", { signal: AbortSignal.timeout(4000) });
        if (!res.ok) return;
        const data = (await res.json()) as { accepted?: number; rejected?: number };
        if (!cancelled && typeof data.accepted === "number" && typeof data.rejected === "number") {
          setStats({ accepted: data.accepted, rejected: data.rejected, live: true });
        }
      } catch {
        /* static fallback */
      }
    };

    refresh();
    const id = window.setInterval(refresh, 60_000);
    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, []);

  return stats;
}
