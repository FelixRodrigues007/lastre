import {
  createBrowserRouter,
  createRoutesFromElements,
  Route,
  RouterProvider,
} from "react-router-dom";
import { Inventory } from "./Inventory";
import { AdminLayout } from "./AdminLayout";
import { Missing } from "./AdminUI";
import {
  AdminCase,
  AdminOrganization,
  AdminOrganizations,
  AdminOverview,
  AdminQueue,
} from "./AdminOperations";
import {
  AdminAnalysis,
  AdminComparison,
  AdminDossier,
  AdminEvidence,
  AdminObject,
  AdminRecords,
} from "./AdminRecords";
import {
  AdminExecution,
  AdminIntegration,
  AdminIntegrations,
  AdminModel,
  AdminModelEditor,
  AdminModels,
  AdminVerifications,
} from "./AdminPlatform";
import {
  AdminAccess,
  AdminAudit,
  AdminEntry,
  AdminIntervention,
  AdminPerson,
  AdminPolicies,
  AdminSearch,
  AdminSettings,
} from "./AdminGovernance";

/** Imported only in Vite development; this is not an authorization mechanism. */
const router = createBrowserRouter(
  createRoutesFromElements(
    <Route element={<AdminLayout />}>
      <Route path="/admin" element={<AdminOverview />} />
      <Route path="/admin/inventario" element={<Inventory />} />
      <Route path="/admin/fila" element={<AdminQueue />} />
      <Route path="/admin/fila/:ocorrenciaId" element={<AdminCase />} />
      <Route path="/admin/organizacoes" element={<AdminOrganizations />} />
      <Route
        path="/admin/organizacoes/:organizacaoId"
        element={<AdminOrganization />}
      />
      <Route path="/admin/registros" element={<AdminRecords />} />
      <Route path="/admin/objetos/:objetoId" element={<AdminObject />} />
      <Route path="/admin/dossies/:dossieId" element={<AdminDossier />} />
      <Route path="/admin/analises/:analiseId" element={<AdminAnalysis />} />
      <Route
        path="/admin/evidencias/:evidenciaId"
        element={<AdminEvidence />}
      />
      <Route path="/admin/comparacoes" element={<AdminComparison />} />
      <Route path="/admin/verificacoes" element={<AdminVerifications />} />
      <Route
        path="/admin/verificacoes/:execucaoId"
        element={<AdminExecution />}
      />
      <Route path="/admin/modelos" element={<AdminModels />} />
      <Route path="/admin/modelos/:modeloId" element={<AdminModel />} />
      <Route
        path="/admin/modelos/:modeloId/editar"
        element={<AdminModelEditor />}
      />
      <Route path="/admin/integracoes" element={<AdminIntegrations />} />
      <Route
        path="/admin/integracoes/:integracaoId"
        element={<AdminIntegration />}
      />
      <Route path="/admin/acessos" element={<AdminAccess />} />
      <Route
        path="/admin/acessos/pessoas/:pessoaId"
        element={<AdminPerson />}
      />
      <Route path="/admin/acessos/politicas" element={<AdminPolicies />} />
      <Route path="/admin/auditoria" element={<AdminAudit />} />
      <Route path="/admin/configuracoes" element={<AdminSettings />} />
      <Route path="/admin/entrar" element={<AdminEntry />} />
      <Route
        path="/admin/intervencoes/:intervencaoId"
        element={<AdminIntervention />}
      />
      <Route path="/admin/busca" element={<AdminSearch />} />
      <Route path="*" element={<Missing title="Página não encontrada" />} />
    </Route>,
  ),
);
export function AdminPreview() {
  return <RouterProvider router={router} />;
}
