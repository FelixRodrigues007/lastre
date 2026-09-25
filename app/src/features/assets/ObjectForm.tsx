import { useState, type FormEvent } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { api, type DossierObject, type Fields } from "./api";
import { useWorkspace } from "./context";
import {
  canCreate,
  categoryLabels,
  emptyFields,
  objectPath,
  sectorLabels,
} from "./model";
import { Feedback, Field, Notice, PageHead, useAction, useUnsaved } from "./ui";
export function ObjectFields({
  fields,
  setFields,
  kind,
  disabled = false,
}: {
  fields: Fields;
  setFields: (value: Fields) => void;
  kind: "asset" | "lot";
  disabled?: boolean;
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
  return (
    <fieldset className="assets-form-fields" disabled={disabled}>
      <legend className="assets-sr-only">Informações do cadastro</legend>
      <div className="assets-form-section">
        <div>
          <span className="assets-step-number">01</span>
          <h2>Identificação</h2>
          <p>Use um nome que sua equipe reconheça.</p>
        </div>
        <div className="assets-fields">
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
            <Field label="Tipo de ativo">
              <select
                value={fields.category}
                onChange={(e) => update("category", e.target.value)}
              >
                {Object.entries(categoryLabels)
                  .filter(([key]) => key !== "lot")
                  .map(([key, label]) => (
                    <option value={key} key={key}>
                      {label}
                    </option>
                  ))}
              </select>
            </Field>
          )}
          <Field label="Setor">
            <select
              value={fields.sector}
              onChange={(e) =>
                setFields({
                  ...fields,
                  sector: e.target.value as Fields["sector"],
                  unit: e.target.value === "energy" ? "MWh" : "t",
                  quantity: "",
                })
              }
            >
              {Object.entries(sectorLabels).map(([key, label]) => (
                <option key={key} value={key}>
                  {label}
                </option>
              ))}
            </select>
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
        </div>
      </div>
      <div className="assets-form-section">
        <div>
          <span className="assets-step-number">02</span>
          <h2>{kind === "lot" ? "Produção e origem" : "Características"}</h2>
          <p>
            {kind === "lot"
              ? "Quantidade, unidade e período têm significados próprios."
              : "Descreva o objeto que você está cadastrando."}
          </p>
        </div>
        <div className="assets-fields">
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
                  value={fields.quantity}
                  onChange={(e) => update("quantity", e.target.value)}
                />
              </Field>
              <Field
                label="Unidade"
                hint="Trocar a unidade mantém o valor informado; confira ambos antes de salvar."
              >
                <select
                  value={fields.unit}
                  onChange={(e) => update("unit", e.target.value)}
                >
                  {units.map((unit) => (
                    <option key={unit}>{unit}</option>
                  ))}
                </select>
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
                <select
                  value={fields.originId}
                  onChange={(e) => update("originId", e.target.value)}
                >
                  <option value="">Sem ativo associado</option>
                  {data.objects
                    .filter(
                      (o) => o.kind === "asset" && o.status !== "archived",
                    )
                    .map((o) => (
                      <option key={o.id} value={o.id}>
                        {o.fields.name || "Sem identificação"}
                      </option>
                    ))}
                </select>
              </Field>
            </>
          ) : (
            <>
              {fields.category === "area" && (
                <Field label="Área declarada (hectares)">
                  <input
                    type="number"
                    min="0.000001"
                    step="any"
                    value={fields.area}
                    onChange={(e) => update("area", e.target.value)}
                  />
                </Field>
              )}
              {(fields.category === "right" || fields.category === "area") && (
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
                  />
                </Field>
              )}
            </>
          )}
          <Field label="Descrição e contexto (opcional)" wide>
            <textarea
              rows={4}
              value={fields.description}
              onChange={(e) => update("description", e.target.value)}
              maxLength={4000}
              placeholder="Informações que ajudam outra pessoa a entender este cadastro."
            />
          </Field>
        </div>
      </div>
    </fieldset>
  );
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
        back={
          solicitation
            ? `/assets/solicitacoes/${solicitation.id}`
            : `/assets/${kind === "asset" ? "ativos" : "lotes"}`
        }
      />
      {solicitation && (
        <Notice>
          Este cadastro será associado a “{solicitation.title}”, solicitado por{" "}
          {solicitation.requesterName}.
        </Notice>
      )}
      <form onSubmit={submit} className="assets-panel">
        <ObjectFields
          kind={kind}
          fields={fields}
          setFields={(v) => {
            setFields(v);
            setDirty(true);
          }}
          disabled={action.busy}
        />
        <Feedback error={action.error} />
        <div className="assets-form-footer">
          <p>
            {dirty
              ? "Alterações ainda não salvas."
              : "O rascunho será salvo na sua organização."}
          </p>
          <div className="assets-actions">
            <Link
              className="assets-button"
              to={`/assets/${kind === "asset" ? "ativos" : "lotes"}`}
            >
              Cancelar
            </Link>
            <button
              className="assets-button assets-button--primary"
              disabled={action.busy}
            >
              {action.busy ? "Salvando…" : "Salvar rascunho"}
            </button>
          </div>
        </div>
      </form>
    </>
  );
}
