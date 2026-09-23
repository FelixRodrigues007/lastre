import { useState } from "react";
import { Button } from "../ui/Button";
import { Icon } from "../ui/Icon";
import { Surface, type Elevation, type SurfaceMaterial } from "../ui/Surface";
import { ChoiceGroup } from "./ChoiceGroup";

const levels = [
  {
    name: "Base",
    use: "Conteúdo no plano da página",
    context: "Canvas e agrupamentos sem sobreposição.",
  },
  {
    name: "Repouso",
    use: "Cards e controles",
    context: "A menor separação necessária para reconhecer uma superfície.",
  },
  {
    name: "Destaque",
    use: "Painéis de informação",
    context: "Agrupa informações com uma sombra de contato e outra difusa.",
  },
  {
    name: "Suspenso",
    use: "Elementos em interação",
    context: "Destaca uma superfície que responde ou recebe atenção.",
  },
  {
    name: "Flutuante",
    use: "Menus e popovers",
    context: "Separa conteúdo temporário sem perder o contexto abaixo.",
  },
  {
    name: "Foco",
    use: "Diálogos e decisões",
    context:
      "O plano mais alto. Reserve para uma decisão que interrompe o fluxo.",
  },
] as const;

export function ElevationLab({
  onCopy,
}: {
  onCopy: (value: string, label?: string) => void;
}) {
  const [level, setLevel] = useState<Elevation>(3);
  const [material, setMaterial] = useState<"matte" | "glass">("matte");
  return (
    <div className="ds-elevation-lab">
      <div className="ds-elevation-lab__workbench">
        <div className="ds-lab-caption">
          <span className="ds-label">ESTÚDIO DE ELEVAÇÃO</span>
          <span>AO VIVO</span>
        </div>
        <div className="ds-elevation-stage" data-level={level}>
          <div className="ds-elevation-stage__ground" aria-hidden="true" />
          <Surface
            elevation={level}
            material={material}
            className="ds-elevation-object"
          >
            <span className="ds-elevation-object__icon">
              <Icon name="chain" size={28} />
            </span>
            <span className="ds-label">LASTRE / SUPERFÍCIE</span>
            <strong>{levels[level].name}</strong>
            <p>{levels[level].use}</p>
            <div>
              <span>Elevação</span>
              <code>0{level}</code>
            </div>
          </Surface>
        </div>
        <div className="ds-elevation-lab__scale">
          <span>CONTATO</span>
          <i />
          <span>DISTÂNCIA</span>
        </div>
      </div>
      <div className="ds-elevation-controls">
        <div>
          <span className="ds-label">EXPLORE A PROFUNDIDADE</span>
          <h3>O espaço também comunica.</h3>
          <p>
            Altere a altura e observe a sombra se abrir. No tema escuro, a luz
            de borda preserva o contorno.
          </p>
        </div>
        <div className="ds-elevation-range">
          <label htmlFor="ds-elevation">
            Nível de elevação{" "}
            <output htmlFor="ds-elevation">0{level} / 05</output>
          </label>
          <input
            id="ds-elevation"
            type="range"
            min="0"
            max="5"
            step="1"
            value={level}
            aria-valuetext={`${level}: ${levels[level].name}`}
            onChange={(e) => setLevel(Number(e.target.value) as Elevation)}
          />
          <div aria-hidden="true">
            {levels.map((_, i) => (
              <span key={i}>{i}</span>
            ))}
          </div>
        </div>
        <ChoiceGroup
          label="Material da superfície"
          value={material}
          onChange={setMaterial}
          options={[
            { value: "matte", label: "Fosco" },
            { value: "glass", label: "Vidro" },
          ]}
        />
        <div className="ds-elevation-recipe">
          <strong>{levels[level].name}</strong>
          <p>{levels[level].context}</p>
          <code>--lastre-elevation-{level}</code>
        </div>
        <Button
          variant="secondary"
          size="sm"
          onClick={() =>
            onCopy(
              `<Surface elevation={${level}} material="${material}">\n  {/* Conteúdo da superfície */}\n</Surface>`,
              "JSX da superfície",
            )
          }
        >
          Copiar composição <Icon name="chain" size={15} />
        </Button>
      </div>
      <div
        className="ds-elevation-steps"
        role="group"
        aria-label="Escolher nível de elevação"
      >
        {levels.map((item, index) => (
          <button
            type="button"
            key={item.name}
            aria-pressed={level === index}
            onClick={() => setLevel(index as Elevation)}
          >
            <span
              className="ds-elevation-mini"
              style={{
                boxShadow: `var(--lastre-surface-edge), var(--lastre-elevation-${index})`,
              }}
              aria-hidden="true"
            >
              <Icon name="overview" size={18} />
            </span>
            <span>
              <code>0{index}</code>
              <strong>{item.name}</strong>
            </span>
            <small>{item.use}</small>
          </button>
        ))}
      </div>
    </div>
  );
}

const materials: {
  key: SurfaceMaterial | "metal";
  name: string;
  subtitle: string;
  token: string;
  description: string;
}[] = [
  {
    key: "matte",
    name: "Fosco",
    subtitle: "A base que acolhe",
    token: "material-matte",
    description:
      "Luz difusa e contorno sutil para leitura prolongada, cards e painéis.",
  },
  {
    key: "glass",
    name: "Vidro",
    subtitle: "Contexto em camadas",
    token: "material-glass",
    description:
      "Transparência com desfoque para navegação e elementos flutuantes.",
  },
  {
    key: "metal",
    name: "Metal",
    subtitle: "A assinatura da marca",
    token: "material-metal",
    description:
      "Reflexos Gold em selos e detalhes de destaque. Um acento por composição.",
  },
  {
    key: "recessed",
    name: "Rebaixo",
    subtitle: "Um lugar para inserir",
    token: "shadow-inset",
    description:
      "Sombra interna para campos, trilhos e áreas que recebem informação.",
  },
];

export function MaterialGallery({
  onCopy,
}: {
  onCopy: (value: string, label?: string) => void;
}) {
  return (
    <div className="ds-material-grid">
      {materials.map((m, i) => (
        <article className="ds-material-card" key={m.key}>
          <div
            className={`ds-material-stage ds-material-stage--${m.key}`}
            aria-hidden="true"
          >
            <span className="ds-material-stage__number">0{i + 1}</span>
            <div className="ds-material-orbit" />
            {m.key === "metal" ? (
              <div className="ds-metal-seal">
                <Icon name="chain" size={40} />
                <span>LASTRE / ORIGIN</span>
              </div>
            ) : (
              <Surface
                material={m.key}
                elevation={m.key === "glass" ? 4 : 2}
                className="ds-material-object"
              >
                <Icon
                  name={m.key === "recessed" ? "capture" : "overview"}
                  size={32}
                />
                <span>{m.subtitle}</span>
              </Surface>
            )}
          </div>
          <div className="ds-material-info">
            <h3>{m.name}</h3>
            <p>{m.description}</p>
            <button
              type="button"
              onClick={() =>
                onCopy(`var(--lastre-${m.token})`, `Token ${m.name}`)
              }
            >
              <code>--lastre-{m.token}</code>
              <span aria-hidden="true">↗</span>
            </button>
          </div>
        </article>
      ))}
    </div>
  );
}
