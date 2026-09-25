import { lazy, Suspense } from "react";
import { useLocation } from "react-router-dom";
const AssetsApp = lazy(() =>
  import("./features/assets/AssetsApp").then((m) => ({ default: m.AssetsApp })),
);
const LegacyApp = lazy(() =>
  import("./LegacyApp").then((m) => ({ default: m.LegacyApp })),
);

/** Product entry is independent from the technical demonstration and its data. */
export function App() {
  const { pathname } = useLocation();
  const assets = pathname === "/" || /^\/assets(?:\/|$)/.test(pathname);
  return (
    <Suspense
      fallback={
        <p role="status">
          Carregando {assets ? "Lastre Assets" : "console técnico"}…
        </p>
      }
    >
      {assets ? <AssetsApp /> : <LegacyApp />}
    </Suspense>
  );
}
