import { surfaceExamples, type SurfaceId } from "./inventory-surface-previews";

export const scenarioLabels = {
  initial: "Estado inicial",
  filled: "Campos preenchidos",
  validation: "Erro de validação",
  review: "Revisão",
  saved: "Confirmação local",
  "save-error": "Falha ao salvar",
  long: "Conteúdo extenso",
  missing: "Não encontrado",
  filtered: "Filtros aplicados",
  empty: "Sem resultados",
  contract: "Contrato",
} as const;
export type SurfaceScenario = keyof typeof scenarioLabels;
export function scenariosFor(id: SurfaceId): SurfaceScenario[] {
  if (surfaceExamples[id].action)
    return [
      "initial",
      "filled",
      "validation",
      "review",
      "saved",
      "save-error",
      "long",
    ];
  if (["AD-S01", "AD-S19", "AD-S20"].includes(id))
    return ["initial", "missing"];
  if (id === "AD-S16") return ["initial", "long"];
  if (id === "AD-S24") return ["initial", "filtered"];
  if (id === "AD-S26") return ["initial", "contract"];
  if (id === "AD-S27") return ["initial", "filled", "empty"];
  return ["initial"];
}
export function validScenario(
  id: SurfaceId,
  value: string | null,
): SurfaceScenario {
  return scenariosFor(id).find((item) => item === value) ?? "initial";
}
export const surfaceGroups: { name: string; ids: SurfaceId[] }[] = [
  {
    name: "Atendimento",
    ids: ["AD-S01", "AD-S02", "AD-S03", "AD-S04", "AD-S05", "AD-S24"],
  },
  {
    name: "Organizações e acesso",
    ids: ["AD-S06", "AD-S07", "AD-S08", "AD-S09", "AD-S10", "AD-S11", "AD-S12"],
  },
  {
    name: "Plataforma",
    ids: ["AD-S13", "AD-S14", "AD-S15", "AD-S16", "AD-S17", "AD-S18", "AD-S19"],
  },
  { name: "Auditoria e exportação", ids: ["AD-S20", "AD-S21", "AD-S22"] },
  { name: "Navegação e conta", ids: ["AD-S23", "AD-S25", "AD-S26", "AD-S27"] },
];

export function surfaceFrameUrl(
  id: SurfaceId,
  scenario: SurfaceScenario,
  instance: string,
) {
  const url = new URL(surfaceExamples[id].href, window.location.origin);
  if (id === "AD-S27" && scenario === "empty")
    url.searchParams.set("q", "Registro inexistente");
  if (scenario === "missing") {
    const key =
      id === "AD-S01" ? "ocorrencia" : id === "AD-S19" ? "entrega" : "evento";
    url.searchParams.set(key, "exemplo-ausente");
  }
  if (id === "AD-S26" && scenario === "contract")
    url.searchParams.set("tab", "contrato");
  if (id === "AD-S24" && scenario === "filtered")
    url.searchParams.set("responsavel", "Rafael Lima");
  url.searchParams.set("surfaceLab", id);
  url.searchParams.set("labScenario", scenario);
  url.searchParams.set("labInstance", instance);
  return url.pathname + url.search;
}
