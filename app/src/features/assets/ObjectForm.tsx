import { useEffect, useState, type FormEvent, type ReactNode } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { Button, buttonClassName } from "../../components/ui/Button";
import { Icon, type IconName } from "../../components/ui/Icon";
import { Select } from "../../components/ui/Select";
import { api, type DossierObject, type Fields } from "./api";
import { useWorkspace } from "./context";
import {
  canCreate,
  categoryLabels,
  emptyFields,
  objectPath,
  sectorLabels,
} from "./model";
import {
  Feedback,
  Field,
  Notice,
  PageHead,
  Progress,
  useAction,
  useUnsaved,
} from "./ui";

const sectorHints: Record<Fields["sector"], string> = {
  mineral: "Unidades: t, kg ou m³.",
  energy: "Unidades: MWh ou kWh.",
  environment: "Unidades: t, m³ ou ha.",
  recycling: "Unidades: t, kg ou m³.",
};

type SectionId = "identificacao" | "local" | "detalhes" | "descricao";

const categoryInfo: Record<
  Exclude<Fields["category"], "lot">,
  { icon: IconName; hint: string }
> = {
  area: { icon: "globe", hint: "Terreno, mina ou unidade" },
  right: { icon: "shield", hint: "Título, licença ou concessão" },
  project: { icon: "chain", hint: "Empreendimento ou iniciativa" },
  equipment: { icon: "settings", hint: "Máquina ou instalação" },
};

/** Which sections have their required information, per kind and category. */
export function sectionStatus(fields: Fields, kind: "asset" | "lot") {
  return {
    identificacao: Boolean(fields.name.trim()),
    local: Boolean(fields.location.trim() && fields.responsible.trim()),
    detalhes:
      kind === "lot"
        ? Boolean(
            fields.material.trim() &&
              Number(fields.quantity) > 0 &&
              fields.periodStart &&
              fields.periodEnd,
          )
        : fields.category === "right"
          ? Boolean(fields.registration.trim())
          : true,
    descricao: Boolean(fields.description.trim()),
  } satisfies Record<SectionId, boolean>;
}

export function sectionTitles(kind: "asset" | "lot"): Record<SectionId, string> {
  return {
    identificacao: "Identificação",
    local: "Localização e responsável",
    detalhes: kind === "lot" ? "Produção e origem" : "Características",
    descricao: "Descrição",
  };
}

function Section({
  id,
  index,
  title,
  description,
  panel,
  children,
}: {
  id: string;
  index: number;
  title: string;
  description: string;
  panel: boolean;
  children: ReactNode;
}) {
  return (
    <section
      id={id}
      aria-labelledby={`${id}-title`}
      className={`assets-form-section${panel ? " lastre-surface assets-panel" : ""}`}
      data-elevation={panel ? 1 : undefined}
      data-material={panel ? "matte" : undefined}
    >
      <header className="assets-form-section__head">
        <span className="assets-form-section__index" aria-hidden="true">
          {String(index).padStart(2, "0")}
        </span>
        <div>
          <h2 id={`${id}-title`}>{title}</h2>
          <p>{description}</p>
        </div>
      </header>
      <div className="assets-fields">{children}</div>
    </section>
  );
}

export function ObjectFields({
  fields,
  setFields,
  kind,
  disabled = false,
  variant = "plain",
  idPrefix = "cadastro",
}: {
  fields: Fields;
  setFields: (value: Fields) => void;
  kind: "asset" | "lot";
  disabled?: boolean;
  variant?: "plain" | "panels";
  idPrefix?: string;
}) {
  const { data } = useWorkspace();
  const update = (key: keyof Fields, value: string) =>
    setFields({ ...fields, [key]: value });
  const units =
    fields.sector === "energy"
      ? ["MWh", "kWh"]
      : fields.sector === "environment"
        ? ["t", "m³", "ha"]
        : ["t", "kg", "m³"];
  const titles = sectionTitles(kind);
  const panel = variant === "panels";
  const hasDetails =
    kind === "lot" || fields.category === "area" || fields.category === "right";
  return (
    <fieldset className="assets-form-fields" disabled={disabled}>
      <legend className="assets-sr-only">Informações do cadastro</legend>
      <Section
        id={`${idPrefix}-identificacao`}
        index={1}
        title={titles.identificacao}
        description="Use um nome que sua equipe reconheça."
        panel={panel}
      >
        <Field
          label={kind === "lot" ? "Identificação do lote" : "Nome do ativo"}
          wide
          hint="Necessário para compartilhar. Você pode completar depois no rascunho."
        >
          <input
            value={fields.name}
            onChange={(e) => update("name", e.target.value)}
            maxLength={200}
            placeholder={
              kind === "lot"
                ? "Ex.: Concentrado de cobre · SC-026"
                : "Ex.: Unidade Serra Clara"
            }
          />
        </Field>
        {kind === "asset" && (
          <fieldset className="assets-choice assets-field--wide">
            <legend>Tipo de ativo</legend>
            <div className="assets-choice__grid">
              {(Object.keys(categoryInfo) as (keyof typeof categoryInfo)[]).map(
                (key) => (
                  <label
                    key={key}
                    className="assets-choice__card"
                    data-checked={fields.category === key || undefined}
                  >
                    <input
                      type="radio"
                      name={`${idPrefix}-category`}
                      value={key}
                      checked={fields.category === key}
                      onChange={() => update("category", key)}
                    />
                    <span className="assets-choice__icon" aria-hidden="true">
                      <Icon name={categoryInfo[key].icon} size={18} />
                    </span>
                    <span className="assets-choice__copy">
                      <strong>{categoryLabels[key]}</strong>
                      <small>{categoryInfo[key].hint}</small>
                    </span>
                    <span className="assets-choice__check" aria-hidden="true">
                      <Icon name="check" size={12} />
                    </span>
                  </label>
                ),
              )}
            </div>
          </fieldset>
        )}
        <Field label="Setor">
          <Select<Fields["sector"]>
            value={fields.sector}
            onChange={(sector) =>
              setFields({
                ...fields,
                sector,
                unit: sector === "energy" ? "MWh" : "t",
                quantity: "",
              })
            }
            options={(Object.entries(sectorLabels) as [Fields["sector"], string][]).map(
              ([value, label]) => ({
                value,
                label,
                description: sectorHints[value],
              }),
            )}
          />
        </Field>
      </Section>

      <Section
        id={`${idPrefix}-local`}
        index={2}
        title={titles.local}
        description="Onde está e quem organiza as informações."
        panel={panel}
      >
        <Field
          label="Localização"
          hint="Município, estado ou referência reconhecível."
        >
          <input
            value={fields.location}
            onChange={(e) => update("location", e.target.value)}
            maxLength={240}
            placeholder="Cidade, estado"
          />
        </Field>
        <Field
          label="Responsável"
          hint="Pessoa que organiza as informações deste cadastro."
        >
          <input
            value={fields.responsible}
            onChange={(e) => update("responsible", e.target.value)}
            maxLength={240}
          />
        </Field>
      </Section>

      <Section
        id={`${idPrefix}-detalhes`}
        index={3}
        title={titles.detalhes}
        description={
          kind === "lot"
            ? "Quantidade, unidade e período têm significados próprios."
            : "Dados declarados do objeto que você está cadastrando."
        }
        panel={panel}
      >
        {kind === "lot" ? (
          <>
            <Field
              label={fields.sector === "energy" ? "Produção" : "Material"}
              wide
            >
              <input
                value={fields.material}
                onChange={(e) => update("material", e.target.value)}
                maxLength={240}
                placeholder={
                  fields.sector === "energy"
                    ? "Ex.: Energia solar"
                    : "Ex.: Concentrado de cobre"
                }
              />
            </Field>
            <Field label="Quantidade">
              <input
                type="number"
                min="0.000001"
                step="any"
                inputMode="decimal"
                className="lastre-field__input assets-mono-input"
                value={fields.quantity}
                onChange={(e) => update("quantity", e.target.value)}
              />
            </Field>
            <Field
              label="Unidade"
              hint="Trocar a unidade mantém o valor informado; confira ambos antes de salvar."
            >
              <Select
                value={fields.unit}
                onChange={(unit) => update("unit", unit)}
                options={units.map((unit) => ({ value: unit, label: unit }))}
              />
            </Field>
            <Field label="Início da produção">
              <input
                type="date"
                value={fields.periodStart}
                onChange={(e) => update("periodStart", e.target.value)}
              />
            </Field>
            <Field label="Fim da produção">
              <input
                type="date"
                min={fields.periodStart || undefined}
                value={fields.periodEnd}
                onChange={(e) => update("periodEnd", e.target.value)}
              />
            </Field>
            <Field
              label="Ativo de origem (opcional)"
              wide
              hint="O vínculo é uma declaração da sua organização; não comprova a origem."
            >
              <Select
                value={fields.originId}
                onChange={(originId) => update("originId", originId)}
                options={[
                  { value: "", label: "Sem ativo associado", icon: "close" as const },
                  ...data.objects
                    .filter((o) => o.kind === "asset" && o.status !== "archived")
                    .map((o) => ({
                      value: o.id,
                      label: o.fields.name || "Sem identificação",
                      description: `${categoryLabels[o.fields.category]} · ${o.fields.location || "Local a informar"}`,
                      icon: "globe" as const,
                    })),
                ]}
              />
            </Field>
          </>
        ) : hasDetails ? (
          <>
            {fields.category === "area" && (
              <Field label="Área declarada (hectares)">
                <input
                  type="number"
                  min="0.000001"
                  step="any"
                  inputMode="decimal"
                  className="lastre-field__input assets-mono-input"
                  value={fields.area}
                  onChange={(e) => update("area", e.target.value)}
                />
              </Field>
            )}
            <Field
              label={
                fields.category === "right"
                  ? "Referência do direito"
                  : "Referência cadastral (opcional)"
              }
              hint="Informe a identificação declarada no documento de referência."
            >
              <input
                value={fields.registration}
                onChange={(e) => update("registration", e.target.value)}
                maxLength={240}
                className="lastre-field__input assets-mono-input"
              />
            </Field>
          </>
        ) : (
          <p className="assets-form-section__none assets-field--wide">
            <Icon name="info" size={15} /> Nenhum campo adicional para{" "}
            {categoryLabels[fields.category].toLocaleLowerCase("pt-BR")}. Use a
            descrição para dar contexto.
          </p>
        )}
      </Section>

      <Section
        id={`${idPrefix}-descricao`}
        index={4}
        title={titles.descricao}
        description="Contexto que ajuda outra pessoa a entender o cadastro."
        panel={panel}
      >
        <Field
          label="Descrição e contexto (opcional)"
          wide
          hint={`${fields.description.length.toLocaleString("pt-BR")} de 4.000 caracteres`}
        >
          <textarea
            rows={5}
            value={fields.description}
            onChange={(e) => update("description", e.target.value)}
            maxLength={4000}
            placeholder="Informações que ajudam outra pessoa a entender este cadastro."
          />
        </Field>
      </Section>
    </fieldset>
  );
}

/** Highlights the section currently in view. */
function useActiveSection(ids: string[]) {
  const [active, setActive] = useState(ids[0]);
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible[0]) setActive(visible[0].target.id);
      },
      { rootMargin: "-80px 0px -55% 0px" },
    );
    ids.forEach((id) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ids.join()]);
  return active;
}

export function AssetsObjectForm({ kind }: { kind: "asset" | "lot" }) {
  const { data, reload } = useWorkspace();
  const [params] = useSearchParams();
  const requestId = params.get("solicitacao") ?? "";
  const solicitation = data.requests.find((r) => r.id === requestId);
  const navigate = useNavigate();
  const action = useAction();
  const [fields, setFields] = useState<Fields>({
    ...emptyFields,
    category: kind === "asset" ? "area" : "lot",
    responsible: data.user.name,
  });
  const [dirty, setDirty] = useState(false);
  useUnsaved(dirty);
  const titles = sectionTitles(kind);
  const status = sectionStatus(fields, kind);
  const order: SectionId[] = ["identificacao", "local", "detalhes", "descricao"];
  const active = useActiveSection(order.map((id) => `cadastro-${id}`));
  const required = order.filter((id) => id !== "descricao");
  const completed = required.filter((id) => status[id]).length;
  const listPath = `/assets/${kind === "asset" ? "ativos" : "lotes"}`;

  if (!canCreate(data.membership.role))
    return (
      <Notice error>
        Seu papel permite consultar cadastros, mas não criar novos. Peça acesso
        ao administrador.
      </Notice>
    );
  const submit = (e: FormEvent) => {
    e.preventDefault();
    void action.run(async () => {
      const object: DossierObject = await api.saveObject(undefined, {
        kind,
        fields,
        requestId,
      });
      setDirty(false);
      await reload();
      navigate(
        solicitation
          ? `/assets/solicitacoes/${solicitation.id}`
          : objectPath(object),
      );
    });
  };
  return (
    <>
      <PageHead
        eyebrow={kind === "asset" ? "Novo ativo" : "Novo lote"}
        title={
          kind === "asset"
            ? "Dê contexto ao seu ativo."
            : "Identifique sua produção."
        }
        description="Comece com o que você já sabe. Salve um rascunho e acrescente os documentos na próxima etapa."
        back={solicitation ? `/assets/solicitacoes/${solicitation.id}` : listPath}
      />
      {solicitation && (
        <div className="assets-form-context">
          <Notice tone="info" title="Cadastro vinculado a uma solicitação">
            Este cadastro será associado a “{solicitation.title}”, solicitado
            por {solicitation.requesterName}.
          </Notice>
        </div>
      )}
      <form onSubmit={submit} className="assets-form-layout">
        <nav className="assets-form-nav" aria-label="Seções do cadastro">
          <Progress
            value={completed}
            max={required.length}
            label="Informações essenciais"
          />
          <ol>
            {order.map((id, i) => (
              <li key={id}>
                <a
                  href={`#cadastro-${id}`}
                  aria-current={active === `cadastro-${id}` ? "location" : undefined}
                  data-done={status[id] || undefined}
                  onClick={(e) => {
                    e.preventDefault();
                    document
                      .getElementById(`cadastro-${id}`)
                      ?.scrollIntoView({ behavior: "smooth", block: "start" });
                  }}
                >
                  <span className="assets-form-nav__mark" aria-hidden="true">
                    {status[id] ? <Icon name="check" size={12} /> : i + 1}
                  </span>
                  <span>{titles[id]}</span>
                  <span className="assets-sr-only">
                    {status[id] ? " — preenchida" : id === "descricao" ? " — opcional" : " — a completar"}
                  </span>
                </a>
              </li>
            ))}
          </ol>
          <div className="assets-form-nav__tip">
            <Icon name="info" size={15} />
            <p>
              O rascunho fica visível só para sua organização. Nada é
              compartilhado até você revisar e confirmar um envio.
            </p>
          </div>
        </nav>
        <div className="assets-form-main">
          <ObjectFields
            kind={kind}
            fields={fields}
            variant="panels"
            setFields={(v) => {
              setFields(v);
              setDirty(true);
            }}
            disabled={action.busy}
          />
          <Feedback error={action.error} />
          <div className="assets-form-savebar" role="group" aria-label="Salvar cadastro">
            <p className="assets-form-savebar__state" data-dirty={dirty || undefined}>
              <span aria-hidden="true" />
              {dirty ? "Alterações não salvas" : "Sem alterações pendentes"}
              <small>
                {dirty
                  ? "Salve o rascunho antes de sair."
                  : "O rascunho será salvo na sua organização."}
              </small>
            </p>
            <div className="assets-actions">
              <Link className={buttonClassName({ variant: "ghost" })} to={listPath}>
                Cancelar
              </Link>
              <Button
                type="submit"
                loading={action.busy}
                startIcon={<Icon name="check" size={16} />}
              >
                Salvar rascunho
              </Button>
            </div>
          </div>
        </div>
      </form>
    </>
  );
}
