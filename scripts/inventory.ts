import {
  existsSync,
  mkdirSync,
  readFileSync,
  readdirSync,
  writeFileSync,
} from "node:fs";
import { dirname, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { screens } from "../app/src/lib/inventory/screens";
import { operations } from "../app/src/lib/inventory/operations";
import { flows } from "../app/src/lib/inventory/flows";
import { apps } from "../app/src/lib/inventory/apps";
import { specifications } from "../app/src/lib/inventory/specifications";
import {
  fingerprintSources,
  isFrontendInventoryInput,
  validateSpecifications,
} from "./inventory-governance";
import {
  extractRoutes,
  reconcileRoutes,
  hasCallableSymbol,
} from "./inventory-core";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const read = (path: string) => readFileSync(resolve(root, path), "utf8");
function files(path: string): string[] {
  return readdirSync(resolve(root, path), { withFileTypes: true }).flatMap(
    (entry) => {
      const name = `${path}/${entry.name}`;
      if (["node_modules", "dist", ".git"].includes(entry.name)) return [];
      return entry.isDirectory() ? files(name) : [name];
    },
  );
}
const sourceFiles = files("app/src")
  .filter((path) => path.endsWith(".tsx"))
  .sort();
const routes = sourceFiles.flatMap((path) => extractRoutes(read(path), path));
const { uncovered, missing, duplicateRoutes } = reconcileRoutes(
  routes,
  screens,
);
const ids = screens.map((screen) => screen.id);
const errors: string[] = [
  ...validateSpecifications(specifications, screens),
  ...uncovered.map(
    (route) =>
      `G1: rota sem ficha: ${route.path} (${route.file}:${route.line})`,
  ),
  ...missing.map(
    (screen) => `G1: ficha sem rota: ${screen.id} ${screen.route.path}`,
  ),
  ...duplicateRoutes.map((route) => `G1: rota duplicada: ${route.path}`),
];
const unique = (values: string[], label: string) => {
  for (const value of new Set(
    values.filter((value, index) => values.indexOf(value) !== index),
  ))
    errors.push(`G2: ${label} duplicado: ${value}`);
};
unique(ids, "ID de tela");
unique(
  operations.map((op) => op.id),
  "ID de operação",
);
unique(
  flows.map((flow) => flow.id),
  "ID de fluxo",
);
for (const screen of screens) {
  if (!apps.some((app) => app.id === screen.app))
    errors.push(`G2: app desconhecido: ${screen.id}`);
  if (
    screen.lifecycle === "existing" &&
    (!screen.source || !existsSync(resolve(root, screen.source)))
  )
    errors.push(`G9: arquivo ausente: ${screen.id}`);
  for (const id of screen.operations)
    if (!operations.some((op) => op.id === id))
      errors.push(`G2: operação desconhecida: ${screen.id} → ${id}`);
}
for (const op of operations) {
  if (
    op.source &&
    (!existsSync(resolve(root, op.source)) ||
      !hasCallableSymbol(read(op.source), op.source, op.symbol ?? ""))
  )
    errors.push(`G9: função de API ausente: ${op.id}`);
}
for (const flow of flows)
  for (const step of flow.steps) {
    if (!ids.includes(step.screen))
      errors.push(`G2: passo sem ficha: ${flow.id} → ${step.screen}`);
  }
const fingerprintFiles = [
  ...new Set([
    ...["app/src", "web/src", "design-system"]
      .flatMap(files)
      .filter(isFrontendInventoryInput),
    ...files("app/src/lib/inventory").filter(
      (path) => !path.includes("/generated/"),
    ),
    ...screens.flatMap((screen) => (screen.source ? [screen.source] : [])),
    "app/src/lib/api.ts",
    "app/server/index.ts",
    ...(existsSync(resolve(root, "app/server/assets"))
      ? files("app/server/assets").filter((path) => path.endsWith(".ts"))
      : []),
    ...operations.flatMap((op) => (op.source ? [op.source] : [])),
    "scripts/inventory.ts",
    "scripts/inventory-core.ts",
    "scripts/inventory-governance.ts",
    "AGENTS.md",
    "docs/FRONTEND_INVENTORY.md",
    "app/vite.config.ts",
    "web/vite.config.ts",
    "app/index.html",
    "web/index.html",
    "app/package.json",
    "web/package.json",
  ]),
].sort();
const sourceHash = fingerprintSources(
  fingerprintFiles
    .filter((path) => existsSync(resolve(root, path)))
    .map((path) => ({ path, content: read(path) })),
);
const report = {
  schemaVersion: 1,
  sourceHash,
  sourceFiles: fingerprintFiles.length,
  freshnessScope:
    "Assinatura das fontes TS, JS, estilos, JSON, HTML e SVG de app/src, web/src e design-system, mais configurações selecionadas. Atualização não comprova revisão funcional. Assets binários e públicos dependem de revisão manual.",
  scope:
    "Rotas JSX de app/src + entrada /design-system em main.tsx. web/ possui fichas de leitura manual, fora da cobertura automática.",
  routes,
  totals: {
    appRoutes: routes.filter((route) => !route.excluded).length,
    covered:
      routes.filter((route) => !route.excluded).length - uncovered.length,
    existingScreens: screens.filter(
      (screen) => screen.lifecycle === "existing" && screen.kind !== "redirect",
    ).length,
    redirects: screens.filter((screen) => screen.kind === "redirect").length,
    planned: screens.filter((screen) => screen.lifecycle === "planned").length,
    observedOperations: operations.filter((op) => op.status === "observed")
      .length,
    proposedOperations: operations.filter((op) => op.status === "proposed")
      .length,
  },
  errors,
  checks: [
    {
      id: "G1",
      name: "Rotas do app reconciliadas",
      status:
        uncovered.length || missing.length || duplicateRoutes.length
          ? "falha"
          : "passou",
      detail:
        "Inclui redirecionamentos e prévia local. Site possui adaptador pendente. Não confere o componente montado em cada rota.",
    },
    {
      id: "G2",
      name: "Referências do catálogo",
      status: errors.some((error) => error.startsWith("G2"))
        ? "falha"
        : "passou",
      detail:
        "IDs únicos; operações, contratos funcionais e passos apontam para registros existentes. Contratos declarados têm os campos obrigatórios preenchidos.",
    },
    {
      id: "G9",
      name: "Arquivos e funções citados",
      status: errors.some((error) => error.startsWith("G9"))
        ? "falha"
        : "passou",
      detail:
        "Confere existência de arquivos e declarações de função. Não é selo de evidência nem teste de comportamento.",
    },
    {
      id: "G3–G5",
      name: "Contratos e estados de erro",
      status: "pendente",
      detail:
        "Mapeamento inicial é parcial e declarado. Ainda não cruza chamadas, handlers, schemas ou erros com a UI.",
    },
    {
      id: "G6",
      name: "Fluxos executáveis",
      status: "pendente",
      detail:
        "Jornadas propostas. Grafo, trocas de ator e testes ponta a ponta ainda não implementados.",
    },
    {
      id: "G7",
      name: "Autorização por papel e organização",
      status: "pendente",
      detail:
        "A sessão atual é demonstrativa. Prévia do admin não é publicada no build de produção.",
    },
    {
      id: "G8/G10/G11",
      name: "Dados pessoais, evidência e risco",
      status: "pendente",
      detail:
        "Sem classificação automática de risco. Falta de evidência nunca é exibida como baixo risco.",
    },
    {
      id: "G13–G15",
      name: "Eventos, linguagem e identidade histórica",
      status: "pendente",
      detail:
        "Não há registro completo de eventos, análise de copy ou comparação de lápides entre commits.",
    },
  ],
};
const output = resolve(root, "app/src/lib/inventory/generated/report.json");
const serialized = `${JSON.stringify(report, null, 2)}\n`;
if (process.argv.includes("--check")) {
  if (!existsSync(output) || readFileSync(output, "utf8") !== serialized)
    errors.push(
      "G12: relatório desatualizado; execute npm run inventory:sync.",
    );
} else {
  mkdirSync(dirname(output), { recursive: true });
  writeFileSync(output, serialized);
  console.log(`Gerado ${relative(root, output)}`);
}
console.log(
  `${report.totals.covered}/${report.totals.appRoutes} rotas do app cobertas; ${report.totals.planned} telas planejadas. Demais gates: ver escopo no relatório.`,
);
if (errors.length) {
  for (const error of errors) console.error(error);
  process.exitCode = 1;
}
