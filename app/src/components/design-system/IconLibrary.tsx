import { useState } from "react";
import { Icon, type IconName } from "../ui/Icon";
import { ChoiceGroup } from "./ChoiceGroup";

const icons: { name: IconName; label: string }[] = [
  { name: "overview", label: "Visão geral" },
  { name: "capture", label: "Captura" },
  { name: "chain", label: "Cadeia" },
  { name: "lots", label: "Registros" },
  { name: "process", label: "Processamento" },
  { name: "audit", label: "Auditoria" },
  { name: "globe", label: "Origem" },
  { name: "network", label: "Rede" },
  { name: "lock", label: "Acesso" },
  { name: "settings", label: "Ajustes" },
  { name: "search", label: "Busca" },
  { name: "check", label: "Confirmação" },
  { name: "plus", label: "Adicionar" },
  { name: "close", label: "Fechar" },
  { name: "bell", label: "Notificações" },
  { name: "share", label: "Compartilhar" },
  { name: "upload", label: "Enviar arquivo" },
  { name: "download", label: "Baixar" },
  { name: "file", label: "Documento" },
  { name: "copy", label: "Copiar" },
  { name: "users", label: "Equipe" },
  { name: "user", label: "Pessoa" },
  { name: "clock", label: "Prazo" },
  { name: "calendar", label: "Data" },
  { name: "history", label: "Histórico" },
  { name: "compare", label: "Comparar" },
  { name: "archive", label: "Arquivar" },
  { name: "trash", label: "Remover" },
  { name: "eye", label: "Visualizar" },
  { name: "link", label: "Vínculo" },
  { name: "pin", label: "Local" },
  { name: "send", label: "Enviar" },
  { name: "inbox", label: "Recebidos" },
  { name: "filter", label: "Filtrar" },
  { name: "grid", label: "Grade" },
  { name: "list", label: "Lista" },
  { name: "more", label: "Mais ações" },
  { name: "info", label: "Informação" },
  { name: "sun", label: "Tema claro" },
  { name: "moon", label: "Tema escuro" },
  { name: "logout", label: "Sair" },
  { name: "arrow-right", label: "Avançar" },
  { name: "arrow-up", label: "Crescente" },
  { name: "arrow-down", label: "Decrescente" },
  { name: "sort", label: "Ordenar" },
  { name: "columns", label: "Colunas" },
  { name: "rows", label: "Densidade" },
  { name: "panel-right", label: "Pré-visualizar" },
  { name: "minus", label: "Seleção parcial" },
];

export function IconLibrary({
  onCopy,
}: {
  onCopy: (value: string, label?: string) => void;
}) {
  const [size, setSize] = useState<"16" | "20" | "24">("20");
  return (
    <>
      <div className="ds-tool-heading">
        <ChoiceGroup
          label="Tamanho óptico"
          value={size}
          onChange={setSize}
          options={[
            { value: "16", label: "16px" },
            { value: "20", label: "20px" },
            { value: "24", label: "24px" },
          ]}
        />
        <span className="ds-tool-meta">Traço 1.65 · grade 20 × 20</span>
      </div>
      <div className="ds-icon-grid">
        {icons.map((icon) => (
          <button
            key={icon.name}
            type="button"
            onClick={() =>
              onCopy(
                `<Icon name="${icon.name}" size={${size}} />`,
                `Ícone ${icon.label}`,
              )
            }
            aria-label={`Copiar ícone ${icon.label}`}
          >
            <span>
              <Icon name={icon.name} size={Number(size)} />
            </span>
            <strong>{icon.label}</strong>
            <code>{icon.name}</code>
          </button>
        ))}
      </div>
      <p className="ds-caption ds-icon-caption">
        Ícones do próprio produto. Use rótulos para ações e um nome acessível em
        botões que exibem apenas o ícone.
      </p>
    </>
  );
}
