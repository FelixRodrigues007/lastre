import { Navigate, Route, Routes } from "react-router-dom";
import { AppShell } from "./components/layout/AppShell";
import { RequireAuth } from "./components/onboarding/RequireAuth";
import { Audit } from "./routes/Audit";
import { AuditDetail } from "./routes/AuditDetail";
import { Escalations } from "./routes/Escalations";
import { Login } from "./routes/Login";
import { LotDetailRedirect } from "./routes/LotDetail";
import { Lots } from "./routes/Lots";
import { Overview } from "./routes/Overview";
import { Process } from "./routes/Process";
import { Settings } from "./routes/Settings";
import { Capture } from "./routes/Capture";
import { Marketplace } from "./routes/Marketplace";
import { MarketplaceAssetDetail } from "./routes/MarketplaceAssetDetail";
import { MyAssetDetail } from "./routes/MyAssetDetail";
import { MyAssets } from "./routes/MyAssets";
import { Agents } from "./routes/Agents";
import { Welcome } from "./routes/Welcome";

function AppRoutes() {
  return (
    <AppShell>
      <Routes>
        <Route path="/" element={<Overview />} />
        <Route path="/lots" element={<Lots />} />
        <Route path="/lots/:assetId" element={<LotDetailRedirect />} />
        <Route path="/process" element={<Process />} />
        <Route path="/audit" element={<Audit />} />
        <Route path="/audit/:assetId" element={<AuditDetail />} />
        <Route path="/chain" element={<Navigate to="/audit" replace />} />
        <Route path="/escalations" element={<Escalations />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/capture" element={<Capture />} />
        <Route path="/marketplace" element={<Marketplace />} />
        <Route path="/marketplace/:assetId" element={<MarketplaceAssetDetail />} />
        <Route path="/my-assets" element={<MyAssets />} />
        <Route path="/my-assets/:assetId" element={<MyAssetDetail />} />
        <Route path="/agents" element={<Agents />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AppShell>
  );
}

export function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/welcome" element={<Welcome />} />
      <Route
        path="/*"
        element={
          <RequireAuth>
            <AppRoutes />
          </RequireAuth>
        }
      />
    </Routes>
  );
}
