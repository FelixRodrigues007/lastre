import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";
import { getAuditSummary, getEscalations } from "../lib/api";

type NavCounts = {
  auditTotal: number;
  escalations: number;
  reload: () => void;
};

const NavCountsContext = createContext<NavCounts>({
  auditTotal: 0,
  escalations: 0,
  reload: () => {},
});

export function NavCountsProvider({ children }: { children: ReactNode }) {
  const [auditTotal, setAuditTotal] = useState(0);
  const [escalations, setEscalations] = useState(0);

  const reload = useCallback(async () => {
    try {
      const [audit, esc] = await Promise.all([getAuditSummary(), getEscalations()]);
      setAuditTotal(audit.total);
      setEscalations(esc.records.length);
    } catch {
      /* keep previous counts */
    }
  }, []);

  useEffect(() => {
    reload();
    const id = window.setInterval(reload, 15000);
    return () => window.clearInterval(id);
  }, [reload]);

  return (
    <NavCountsContext.Provider value={{ auditTotal, escalations, reload }}>
      {children}
    </NavCountsContext.Provider>
  );
}

export function useNavCounts() {
  return useContext(NavCountsContext);
}
