import { Navigate, Route, Routes } from "react-router-dom";
import { AppShell } from "./components/layout/AppShell";
import { Audit } from "./routes/Audit";
import { AuditDetail } from "./routes/AuditDetail";
import { Escalations } from "./routes/Escalations";
import { LotDetail } from "./routes/LotDetail";
import { Lots } from "./routes/Lots";
import { Overview } from "./routes/Overview";
import { Process } from "./routes/Process";
import { Settings } from "./routes/Settings";

export function App() {
  return (
    <AppShell>
      <Routes>
        <Route path="/" element={<Overview />} />
        <Route path="/lots" element={<Lots />} />
        <Route path="/lots/:assetId" element={<LotDetail />} />
        <Route path="/process" element={<Process />} />
        <Route path="/audit" element={<Audit />} />
        <Route path="/audit/:assetId" element={<AuditDetail />} />
        <Route path="/escalations" element={<Escalations />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AppShell>
  );
}
