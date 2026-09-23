import { useState, type CSSProperties } from "react";
import { Button } from "../ui/Button";
import { Icon } from "../ui/Icon";
import { ChoiceGroup } from "./ChoiceGroup";
import { usePrefersReducedMotion } from "../../hooks/usePrefersReducedMotion";

const motions = [
  {
    key: "standard",
    name: "Preciso",
    time: "180ms",
    duration: "normal",
    use: "Controles e mudanças de estado",
    path: "M0 100 C40 100 20 0 100 0",
  },
  {
    key: "emphasized",
    name: "Fluido",
    time: "320ms",
    duration: "slow",
    use: "Painéis e entrada de conteúdo",
    path: "M0 100 C16 0 30 0 100 0",
  },
  {
    key: "spring",
    name: "Expressivo",
    time: "560ms",
    duration: "expressive",
    use: "Pequenos detalhes de resposta",
    path: "M0 100 C34 -56 64 0 100 0",
  },
] as const;

export function MotionLab({
  onCopy,
}: {
  onCopy: (value: string, label?: string) => void;
}) {
  const [run, setRun] = useState(0);
  const [mode, setMode] = useState<"full" | "reduced">("full");
  const reduced = usePrefersReducedMotion();
  const minimal = reduced || mode === "reduced";
  return (
    <div className="ds-motion-lab" data-reduced={minimal}>
      <div className="ds-tool-heading">
        <ChoiceGroup
          label="Comportamento do movimento"
          value={mode}
          onChange={setMode}
          options={[
            { value: "full", label: "Completo" },
            { value: "reduced", label: "Reduzido" },
          ]}
        />
        <Button
          variant="secondary"
          size="sm"
          startIcon={<Icon name="refresh" size={16} />}
          onClick={() => setRun(run + 1)}
        >
          Reproduzir movimento
        </Button>
      </div>
      <div className="ds-motion-grid">
        {motions.map((m) => (
          <article className="ds-motion-card" key={m.key}>
            <div className="ds-motion-card__head">
              <h3>{m.name}</h3>
              <code>{minimal ? "0ms" : m.time}</code>
            </div>
            <div
              className="ds-motion-track"
              key={`${m.key}-${run}-${minimal}`}
              style={
                {
                  "--motion-ease": `var(--lastre-ease-${m.key})`,
                  "--motion-duration": `var(--lastre-duration-${m.duration})`,
                } as CSSProperties
              }
              data-running={run > 0}
            >
              <span className="ds-motion-origin" aria-hidden="true" />
              <span className="ds-motion-dot" aria-hidden="true">
                <Icon name="chevron-right" size={18} />
              </span>
            </div>
            <div className="ds-motion-curve">
              <svg viewBox="-5 -24 110 130" aria-hidden="true">
                <path className="ds-motion-curve__axis" d="M0 0 V100 H100" />
                <path d={m.path} />
              </svg>
              <div>
                <p>{m.use}</p>
                <button
                  type="button"
                  onClick={() =>
                    onCopy(
                      `transition: transform var(--lastre-duration-${m.duration}) var(--lastre-ease-${m.key});`,
                      "Transição CSS",
                    )
                  }
                >
                  <code>ease-{m.key}</code>
                  <span aria-hidden="true"> ↗</span>
                </button>
              </div>
            </div>
          </article>
        ))}
      </div>
      <p className="ds-caption" role="status">
        {reduced
          ? "A preferência de movimento reduzido do seu sistema está ativa e tem prioridade."
          : minimal
            ? "Movimento reduzido: a mudança de estado é imediata, sem deslocamento."
            : "Movimento sob demanda. Transformação e opacidade mantêm a interação leve; nada se repete em loop."}
      </p>
    </div>
  );
}
