import { Navigate, Route, Routes, useLocation } from "react-router-dom";
import { AssetsProvider, useAssets } from "./context";
import { ProductError } from "./api";
import { AssetsShell } from "./AssetsShell";
import { AssetsHome } from "./Home";
import { AssetsLogin, AssetsInvite } from "./Auth";
import { AssetsObjectList } from "./ObjectList";
import { AssetsObjectForm } from "./ObjectForm";
import { AssetsObjectDetail } from "./ObjectDetail";
import { AssetsRequests, AssetsRequestDetail } from "./Requests";
import { AssetsShare } from "./Share";
import { AssetsOrganization } from "./Organization";
import { AssetsReceived } from "./Received";
import { Empty, Loading, Notice } from "./ui";
import "./assets.css";
function AssetsRoutes() {
  const { data, loading, error, reload } = useAssets();
  const location = useLocation();
  if (location.pathname === "/")
    return (
      <Routes>
        <Route path="/" element={<Navigate to="/assets" replace />} />
      </Routes>
    );
  const isEntry =
    location.pathname === "/assets/entrar" ||
    location.pathname.startsWith("/assets/convites/");
  if (isEntry)
    return (
      <Routes>
        <Route path="/assets/entrar" element={<AssetsLogin />} />
        <Route path="/assets/convites/:token" element={<AssetsInvite />} />
      </Routes>
    );
  if (loading)
    return (
      <div className="assets-standalone">
        <Loading />
      </div>
    );
  if (
    !data &&
    (!error || (error instanceof ProductError && error.status === 401))
  )
    return (
      <Navigate
        to={`/assets/entrar?next=${encodeURIComponent(location.pathname + location.search)}`}
        replace
      />
    );
  if (!data)
    return (
      <div className="assets-standalone">
        <Notice error>
          {error?.message ?? "Não foi possível carregar a organização."}
        </Notice>
        <button
          className="assets-button"
          onClick={() => void reload().catch(() => {})}
        >
          Tentar novamente
        </button>
      </div>
    );
  return (
    <AssetsShell>
      {error && (
        <Notice error>
          Não foi possível atualizar os dados. Exibindo a última consulta
          confirmada.{" "}
          <button
            className="assets-text-link"
            onClick={() => void reload().catch(() => {})}
          >
            Atualizar
          </button>
        </Notice>
      )}
      <Routes>
        <Route path="/assets" element={<AssetsHome />} />
        <Route
          path="/assets/ativos"
          element={<AssetsObjectList kind="asset" />}
        />
        <Route
          path="/assets/ativos/novo"
          element={<AssetsObjectForm kind="asset" />}
        />
        <Route
          path="/assets/ativos/:ativoId"
          element={<AssetsObjectDetail kind="asset" />}
        />
        <Route
          path="/assets/ativos/:ativoId/compartilhar"
          element={<AssetsShare />}
        />
        <Route path="/assets/lotes" element={<AssetsObjectList kind="lot" />} />
        <Route
          path="/assets/lotes/novo"
          element={<AssetsObjectForm kind="lot" />}
        />
        <Route
          path="/assets/lotes/:loteId"
          element={<AssetsObjectDetail kind="lot" />}
        />
        <Route
          path="/assets/lotes/:loteId/compartilhar"
          element={<AssetsShare />}
        />
        <Route path="/assets/solicitacoes" element={<AssetsRequests />} />
        <Route
          path="/assets/solicitacoes/:solicitacaoId"
          element={<AssetsRequestDetail />}
        />
        <Route
          path="/assets/organizacao"
          element={<AssetsOrganization key={data.organization.id} />}
        />
        <Route path="/assets/recebidos/:shareId" element={<AssetsReceived />} />
        <Route
          path="*"
          element={
            <Empty
              title="Esta página não foi encontrada"
              description="Use a navegação para voltar aos seus cadastros."
            />
          }
        />
      </Routes>
    </AssetsShell>
  );
}
export function AssetsApp() {
  return (
    <AssetsProvider>
      <AssetsRoutes />
    </AssetsProvider>
  );
}
