import type { AppId } from "./types";

export const apps: {
  id: AppId;
  name: string;
  prefix: string;
  description: string;
  access: string;
}[] = [
  {
    id: "console",
    name: "Console demonstrativo",
    prefix: "LC",
    description: "Captura, processamento e inspeção técnica da demo atual.",
    access: "Sessão demonstrativa; sem autorização organizacional comprovada.",
  },
  {
    id: "assets",
    name: "Lastre Assets",
    prefix: "LA",
    description:
      "Organizar ativos, responder solicitações e compartilhar versões identificadas.",
    access: "Sessão do servidor + organização + papel e escopo do cadastro. Demonstração isolada e explícita.",
  },
  {
    id: "investors",
    name: "Lastre Investors",
    prefix: "LI",
    description:
      "Analisar evidências, pedir esclarecimentos e registrar decisões.",
    access: "Planejado: organização destinatária + versão compartilhada.",
  },
  {
    id: "admin",
    name: "Admin Lastre",
    prefix: "AD",
    description: "Acompanhar a construção e a confiabilidade do produto.",
    access:
      "Prévia apenas em desenvolvimento. RBAC interno ainda não implementado.",
  },
  {
    id: "web",
    name: "Site e apresentações",
    prefix: "LW",
    description: "Landing, apresentações e diagramas do site.",
    access: "Roteamento próprio. Noindex não equivale a controle de acesso.",
  },
  {
    id: "identity",
    name: "Entrada da demo",
    prefix: "ID",
    description: "Login e escolha de perfil do console atual.",
    access: "Perfil e autenticação demonstrativos no navegador.",
  },
  {
    id: "design",
    name: "Design system",
    prefix: "DS",
    description: "Referência visual e componentes compartilhados.",
    access: "Superfície independente do shell do console.",
  },
];
