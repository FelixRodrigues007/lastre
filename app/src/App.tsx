import { lazy, Suspense } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import { AppShell } from "./components/layout/AppShell";
import { RequireAuth } from "./components/onboarding/RequireAuth";
import { SkeletonDashboard } from "./components/ui/Skeleton";
import { Audit } from "./routes/Audit";
import { Login } from "./routes/Login";
import { Lots } from "./routes/Lots";
import { Overview } from "./routes/Overview";
import { Process } from "./routes/Process";
import { Settings } from "./routes/Settings";
import { Welcome } from "./routes/Welcome";

const AuditDetail = lazy(() =>
  import("./routes/AuditDetail").then((m) => ({ default: m.AuditDetail })),
);
const Escalations = lazy(() =>
  import("./routes/Escalations").then((m) => ({ default: m.Escalations })),
);
const LotDetailRedirect = lazy(() =>
  import("./routes/LotDetail").then((m) => ({ default: m.LotDetailRedirect })),
);
const Capture = lazy(() =>
  import("./routes/Capture").then((m) => ({ default: m.Capture })),
);
const Marketplace = lazy(() =>
  import("./routes/Marketplace").then((m) => ({ default: m.Marketplace })),
);
const MarketplaceAssetDetail = lazy(() =>
  import("./routes/MarketplaceAssetDetail").then((m) => ({
    default: m.MarketplaceAssetDetail,
  })),
);
const MyAssetDetail = lazy(() =>
  import("./routes/MyAssetDetail").then((m) => ({ default: m.MyAssetDetail })),
);
const MyAssets = lazy(() =>
  import("./routes/MyAssets").then((m) => ({ default: m.MyAssets })),
);
const Agents = lazy(() =>
  import("./routes/Agents").then((m) => ({ default: m.Agents })),
);

function RouteFallback() {
  return (
    <div className="page">
      <SkeletonDashboard />
    </div>
  );
}

function AppRoutes() {
  return (
    <AppShell>
      <Suspense fallback={<RouteFallback />}>
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
      </Suspense>
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
