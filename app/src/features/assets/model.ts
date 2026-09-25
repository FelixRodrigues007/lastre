import type {
  DossierObject,
  Fields,
  InformationRequest,
  Role,
  Workspace,
} from "./api";
export const roleLabels: Record<Role, string> = {
  admin: "Administrador",
  editor: "Responsável pelo cadastro",
  sender: "Responsável pelo envio",
  reader: "Leitor",
  contributor: "Colaborador externo",
};
export const categoryLabels = {
  area: "Área",
  right: "Direito",
  project: "Projeto",
  equipment: "Equipamento",
  lot: "Lote de produção",
};
export const sectorLabels = {
  mineral: "Mineral",
  energy: "Energia",
  environment: "Ambiental",
  recycling: "Reciclagem",
};
export const statusLabels = {
  draft: "Rascunho",
  ready: "Pronto para revisão",
  archived: "Arquivado",
};
export const emptyFields: Fields = {
  name: "",
  category: "lot",
  sector: "mineral",
  material: "",
  quantity: "",
  unit: "t",
  location: "",
  responsible: "",
  periodStart: "",
  periodEnd: "",
  originId: "",
  description: "",
  registration: "",
  area: "",
};
export const objectPath = (object: Pick<DossierObject, "id" | "kind">) =>
  `/assets/${object.kind === "lot" ? "lotes" : "ativos"}/${object.id}`;
export const canEdit = (role: Role) =>
  ["admin", "editor", "sender", "contributor"].includes(role);
export const canCreate = (role: Role) =>
  ["admin", "editor", "sender"].includes(role);
export const canSend = (role: Role) => ["admin", "sender"].includes(role);
export const dateLabel = (value: string, time = false) =>
  value
    ? new Intl.DateTimeFormat("pt-BR", {
        dateStyle: "short",
        ...(time ? { timeStyle: "short" as const } : {}),
        ...(!time && value.length === 10 ? { timeZone: "UTC" } : {}),
      }).format(new Date(value.length === 10 ? `${value}T12:00:00Z` : value))
    : "Não informado";
export const quantityLabel = (object: Pick<DossierObject, "fields">) =>
  object.fields.quantity
    ? `${Number(object.fields.quantity).toLocaleString("pt-BR", { maximumFractionDigits: 4 })} ${object.fields.unit}`
    : "Quantidade a informar";
export function missingFields(object: DossierObject) {
  const f = object.fields;
  return [
    !f.name && "Identificação",
    !f.responsible && "Responsável",
    !f.location && "Localização",
    object.kind === "lot" && !f.material && "Material ou produção",
    object.kind === "lot" && !(Number(f.quantity) > 0) && "Quantidade",
    object.kind === "lot" &&
      (!f.periodStart || !f.periodEnd) &&
      "Período da produção",
    f.category === "right" && !f.registration && "Referência do direito",
  ].filter(Boolean) as string[];
}
export function requirementDone(
  request: InformationRequest,
  id: string,
  workspace: Workspace,
) {
  const object = workspace.objects.find((o) => o.id === request.objectId);
  const requirement = request.requirements.find((q) => q.id === id);
  return (
    workspace.evidence.some(
      (e) => object?.evidenceIds.includes(e.id) && e.requirementId === id,
    ) ||
    Boolean(
      requirement?.allowJustification && request.justifications[id]?.trim(),
    )
  );
}
