import { useId, useState } from "react";
import { Button, type ButtonProps } from "../ui/Button";
import { TextField } from "../ui/TextField";
import { Icon } from "../ui/Icon";
import "./ds-tools.css";

export function ButtonPlayground({
  onCopy,
  onAction,
}: {
  onCopy: (value: string, label?: string) => void;
  onAction: () => void;
}) {
  const id = useId();
  const [variant, setVariant] =
    useState<NonNullable<ButtonProps["variant"]>>("primary");
  const [size, setSize] = useState<NonNullable<ButtonProps["size"]>>("md");
  const [state, setState] = useState("default");
  const [label, setLabel] = useState("Verificar origem");
  const [icon, setIcon] = useState(true);
  const text = label.trim() || "Verificar origem";
  const code = `<Button\n  variant="${variant}"\n  size="${size}"${icon ? '\n  startIcon={<Icon name="shield" size={16} />}' : ""}${state === "loading" ? "\n  loading" : state === "disabled" ? "\n  disabled" : ""}\n>\n  {${JSON.stringify(text)}}\n</Button>`;
  return (
    <div className="ds-playground">
      <div className="ds-playground__controls">
        <div className="ds-select">
          <label htmlFor={`${id}-variant`}>Hierarquia</label>
          <select
            id={`${id}-variant`}
            value={variant}
            onChange={(e) => setVariant(e.target.value as typeof variant)}
          >
            <option value="primary">Primário</option>
            <option value="secondary">Secundário</option>
            <option value="ghost">Ghost</option>
            <option value="danger">Crítico</option>
          </select>
        </div>
        <div className="ds-select">
          <label htmlFor={`${id}-size`}>Tamanho</label>
          <select
            id={`${id}-size`}
            value={size}
            onChange={(e) => setSize(e.target.value as typeof size)}
          >
            <option value="sm">Compacto · 40px</option>
            <option value="md">Padrão · 44px</option>
            <option value="lg">Amplo · 52px</option>
          </select>
        </div>
        <div className="ds-select">
          <label htmlFor={`${id}-state`}>Estado do botão</label>
          <select
            id={`${id}-state`}
            value={state}
            onChange={(e) => setState(e.target.value)}
          >
            <option value="default">Disponível</option>
            <option value="loading">Carregando</option>
            <option value="disabled">Desabilitado</option>
          </select>
        </div>
        <TextField
          label="Rótulo do botão"
          value={label}
          onChange={(e) => setLabel(e.target.value)}
          maxLength={36}
        />
        <label className="ds-check">
          <input
            type="checkbox"
            checked={icon}
            onChange={(e) => setIcon(e.target.checked)}
          />{" "}
          Ícone de apoio
        </label>
      </div>
      <div className="ds-playground__stage" aria-label="Prévia do botão">
        <span className="ds-label">PRÉVIA INTERATIVA</span>
        <Button
          variant={variant}
          size={size}
          loading={state === "loading"}
          disabled={state === "disabled"}
          startIcon={icon ? <Icon name="shield" size={16} /> : undefined}
          onClick={onAction}
        >
          {text}
        </Button>
        <p className="ds-caption">
          Experimente Tab, hover e clique.
          <br />O carregamento preserva a largura do controle.
        </p>
      </div>
      <div className="ds-code">
        <div>
          <span>React / JSX</span>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onCopy(code, "Código do botão")}
          >
            Copiar código
          </Button>
        </div>
        <pre>
          <code>{code}</code>
        </pre>
      </div>
    </div>
  );
}
