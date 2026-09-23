import { useState } from "react";
import tokens from "@design-system/tokens/lastre.tokens.json";
import { Button } from "../ui/Button";
import { Icon } from "../ui/Icon";
import { StatusBadge } from "../ui/StatusBadge";
import { ChoiceGroup } from "./ChoiceGroup";

const groups = {
  surfaces: [
    ["bg-canvas", "Fundo da aplicação"],
    ["bg-surface", "Cards e painéis"],
    ["bg-elevated", "Camadas sobrepostas"],
    ["text-primary", "Títulos e conteúdo"],
    ["text-secondary", "Informação de apoio"],
    ["border-control", "Contorno de controles"],
  ],
  actions: [
    ["action-primary", "Ação principal"],
    ["action-hover", "Interação por ponteiro"],
    ["action-pressed", "Durante o clique"],
    ["action-text", "Texto sobre a ação"],
    ["link", "Links e navegação"],
    ["focus", "Foco de teclado"],
  ],
  status: [
    ["success", "Origem verificada"],
    ["warning", "Precisa de atenção"],
    ["danger", "Erro ou invalidade"],
    ["info", "Informação e registro"],
  ],
} as const;

export function TokenInspector({
  theme,
  onCopy,
}: {
  theme: "dark" | "light";
  onCopy: (value: string, label?: string) => void;
}) {
  const [group, setGroup] = useState<keyof typeof groups>("surfaces");
  const primitives: Record<string, { $value: string }> = tokens.primitive;
  return (
    <div className="ds-inspector">
      <div className="ds-tool-heading">
        <ChoiceGroup
          label="Inspecionar por intenção"
          value={group}
          onChange={setGroup}
          options={[
            { value: "surfaces", label: "Superfícies" },
            { value: "actions", label: "Ações" },
            { value: "status", label: "Estados" },
          ]}
        />
        <span className="ds-tool-meta">
          Tema {theme === "dark" ? "escuro" : "claro"}
        </span>
      </div>
      <div className="ds-inspector__body">
        <div className="ds-token-list">
          {groups[group].map(([key, description]) => {
            const alias = tokens.semantic[theme][key].$value
              .replace(/[{}]/g, "")
              .replace("primitive.", "");
            return (
              <button
                className="ds-token-row"
                key={key}
                type="button"
                onClick={() => onCopy(`var(--lastre-${key})`, "Token")}
                aria-label={`Copiar token ${key}`}
              >
                <span
                  className="ds-token-dot"
                  style={{ background: `var(--lastre-${key})` }}
                  aria-hidden="true"
                />
                <span>
                  <code>--lastre-{key}</code>
                  <small>{description}</small>
                </span>
                <span className="ds-token-value">
                  <code>{primitives[alias].$value}</code>
                  <small>{alias.replace("color-", "")}</small>
                </span>
                <Icon name="capture" size={16} />
              </button>
            );
          })}
        </div>
        <div className="ds-token-preview">
          <span className="ds-label">APLICAÇÃO DOS PAPÉIS</span>
          <div className="ds-token-preview__card">
            <div className="ds-token-preview__icon">
              <Icon name="shield" size={22} />
            </div>
            <h3>
              Uma evidência.
              <br />O mesmo significado.
            </h3>
            <p>
              As cores se adaptam ao tema. A intenção de cada elemento
              permanece.
            </p>
            <StatusBadge
              tone="success"
              label="Origem verificada"
              circle="filled"
            />
            <Button
              variant="secondary"
              endIcon={<Icon name="chevron-right" size={16} />}
              onClick={() =>
                onCopy("var(--lastre-button-bg)", "Token do botão")
              }
            >
              Copiar token de ação
            </Button>
          </div>
          <p className="ds-caption">
            Primitivo → papel semântico → componente.
            <br />
            Troque o tema para comparar os valores.
          </p>
        </div>
      </div>
    </div>
  );
}
