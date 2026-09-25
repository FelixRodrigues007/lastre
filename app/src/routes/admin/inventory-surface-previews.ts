import type { adminSurfaceDefinitions } from "../../lib/inventory/admin";
import type { ActionContext, ActionKey } from "./AdminActions";

export type SurfaceId = (typeof adminSurfaceDefinitions)[number]["id"];
type SurfaceExample = { href: string } & (
  | { action: ActionKey; context: ActionContext }
  | { action?: never; context?: never }
);
const organization = "Horizonte Agro";
const caseContext = { target: "OC-104", organization, version: "V-002" };

/** Concrete demo destinations; forms share their implementation with the Admin. */
export const surfaceExamples: Record<SurfaceId, SurfaceExample> = {
  "AD-S01": { href: "/admin/fila?ocorrencia=OC-104" },
  "AD-S02": {
    href: "/admin/fila",
    action: "createCase",
    context: { target: "Nova ocorrência" },
  },
  "AD-S03": {
    href: "/admin/fila/OC-104",
    action: "assign",
    context: caseContext,
  },
  "AD-S04": {
    href: "/admin/fila/OC-104",
    action: "resolve",
    context: caseContext,
  },
  "AD-S05": {
    href: "/admin/fila/OC-104",
    action: "message",
    context: caseContext,
  },
  "AD-S06": {
    href: "/admin/organizacoes",
    action: "organization",
    context: { target: "Nova organização" },
  },
  "AD-S07": {
    href: "/admin/acessos",
    action: "invite",
    context: { target: "Novo participante", organization },
  },
  "AD-S08": {
    href: "/admin/acessos/pessoas/PES-002",
    action: "membership",
    context: { target: "PES-002", organization },
  },
  "AD-S09": {
    href: "/admin/acessos/pessoas/PES-002?tab=sessoes",
    action: "revokeSession",
    context: {
      target: "SES-002",
      organization,
      details: "Camila Nunes · somente esta sessão",
    },
  },
  "AD-S10": {
    href: "/admin/evidencias/EVD-015?versao=V-002",
    action: "support",
    context: { target: "EVD-015", organization, version: "V-002" },
  },
  "AD-S11": {
    href: "/admin/acessos?tab=concessoes-temporarias",
    action: "approveAccess",
    context: { target: "Pedido de acesso temporário", organization },
  },
  "AD-S12": {
    href: "/admin/organizacoes/ORG-014?tab=acesso-e-dados",
    action: "suspend",
    context: { target: "ORG-014", organization },
  },
  "AD-S13": {
    href: "/admin/verificacoes/EX-204",
    action: "retry",
    context: { target: "EX-204", organization, version: "V-002" },
  },
  "AD-S14": {
    href: "/admin/verificacoes/EX-203?tab=entradas-e-resultado",
    action: "revokeResult",
    context: { target: "EX-203", organization, version: "V-002" },
  },
  "AD-S15": {
    href: "/admin/modelos",
    action: "model",
    context: { target: "Novo modelo" },
  },
  "AD-S16": { href: "/admin/modelos/MOD-001/editar?tab=revisao" },
  "AD-S17": {
    href: "/admin/integracoes",
    action: "connection",
    context: { target: "Nova conexão" },
  },
  "AD-S18": {
    href: "/admin/integracoes/INTG-003?tab=configuracao",
    action: "credential",
    context: { target: "INTG-003" },
  },
  "AD-S19": {
    href: "/admin/integracoes/INTG-003?tab=entregas&entrega=ENT-104",
  },
  "AD-S20": { href: "/admin/auditoria?evento=EVT-504" },
  "AD-S21": {
    href: "/admin/auditoria",
    action: "export",
    context: {
      target: "EVT-504",
      organization,
      details: "Seleção demonstrativa de um evento de auditoria.",
    },
  },
  "AD-S22": { href: "/admin" },
  "AD-S23": { href: "/admin" },
  "AD-S24": { href: "/admin/fila" },
  "AD-S25": { href: "/admin" },
  "AD-S26": { href: "/admin/inventario?view=catalogo&screen=AD-001" },
  "AD-S27": { href: "/admin/busca" },
};
