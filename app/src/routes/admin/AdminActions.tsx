import { Select } from "../../components/ui/Select";
import { createContext, useContext, useState, type ReactNode } from "react";
import { Link } from "react-router-dom";
import { surfaceLab, notifyLab } from "./surface-lab-runtime";
import { Button, Facts, Notice, Surface, useUnloadGuard } from "./AdminUI";

type Field = {
  label: string;
  options?: string[];
  type?: "email" | "textarea" | "datetime-local";
  optional?: boolean;
};
type Action = {
  title: string;
  kind: "drawer" | "modal";
  effect: string;
  fields: Field[];
  authority: string;
};
const reason: Field = { label: "Motivo", type: "textarea" };
const owner: Field = {
  label: "Responsável",
  options: ["Marina Costa", "Rafael Lima"],
};
const period: Field = {
  label: "Duração",
  options: ["30 minutos", "1 hora", "4 horas"],
};
export const actionDefinitions = {
  createCase: {
    title: "Criar ocorrência",
    kind: "drawer",
    effect:
      "Registrar uma tarefa operacional identificada, sem alterar o conteúdo do cliente.",
    fields: [
      { label: "Título" },
      {
        label: "Tipo",
        options: [
          "Atendimento de suporte",
          "Falha técnica",
          "Problema de acesso",
          "Aprovação administrativa",
        ],
      },
      { label: "Organização ou alcance" },
      { label: "Objeto ou referência" },
      { label: "Descrição", type: "textarea" },
      owner,
    ],
    authority: "Operação e suporte",
  },
  assign: {
    title: "Atribuir responsável",
    kind: "modal",
    effect:
      "A atribuição deve validar a revisão atual antes de registrar a mudança.",
    fields: [owner],
    authority: "Operação e suporte",
  },
  priority: {
    title: "Alterar prioridade",
    kind: "modal",
    effect:
      "Registrar impacto e urgência sem mudar a conclusão do atendimento.",
    fields: [
      { label: "Prioridade", options: ["Crítica", "Alta", "Normal", "Baixa"] },
      reason,
    ],
    authority: "Operação e suporte",
  },
  resolve: {
    title: "Resolver atendimento",
    kind: "modal",
    effect:
      "A resolução exige evidência de recuperação; a análise do cliente permanece inalterada.",
    fields: [
      { label: "Diagnóstico", type: "textarea" },
      { label: "Ação realizada", type: "textarea" },
      { label: "Evidência de recuperação" },
    ],
    authority: "Operador atribuído; revisão atual da ocorrência",
  },
  message: {
    title: "Comunicar organização",
    kind: "modal",
    effect:
      "Mensagem externa separada das notas internas. A prévia não envia comunicações.",
    fields: [
      { label: "Destinatário", type: "email" },
      { label: "Canal", options: ["E-mail — integração pendente"] },
      { label: "Mensagem para a organização", type: "textarea" },
    ],
    authority: "Operação com capacidade de comunicação",
  },
  organization: {
    title: "Cadastrar organização",
    kind: "drawer",
    effect:
      "Revisar duplicidade e produtos elegíveis antes de criar o convite de ativação.",
    fields: [
      { label: "Nome da organização" },
      { label: "Identificação da organização" },
      { label: "Contato administrativo", type: "email" },
      {
        label: "Produto",
        options: ["Assets", "Investors", "Assets e Investors"],
      },
      { label: "Finalidade do convite", type: "textarea" },
    ],
    authority: "Gestão de organizações",
  },
  invite: {
    title: "Convidar participante",
    kind: "drawer",
    effect:
      "O vínculo se limita ao contexto selecionado. Convites exigem identidade e prazo validados.",
    fields: [
      { label: "Destinatário", type: "email" },
      {
        label: "Papel",
        options: [
          "Responsável pelo envio",
          "Colaborador",
          "Analista",
          "Operação e suporte",
        ],
      },
      { label: "Escopo" },
      { label: "Validade do convite", options: ["24 horas", "7 dias"] },
      reason,
    ],
    authority: "Gestão de acesso no contexto escolhido",
  },
  membership: {
    title: "Alterar vínculo",
    kind: "drawer",
    effect:
      "Revisar capacidades acrescentadas e removidas. Vínculos em outras organizações permanecem independentes.",
    fields: [
      { label: "Capacidade atual" },
      { label: "Capacidade proposta" },
      { label: "Escopo" },
      reason,
    ],
    authority: "Gestão de acesso; sem autoaprovação da própria elevação",
  },
  revokeSession: {
    title: "Revogar esta sessão",
    kind: "modal",
    effect:
      "Interromper novas consultas desta sessão. A revogação não apaga a identidade nem seus outros vínculos.",
    fields: [reason],
    authority: "Gestão de acesso; reautenticação conforme política",
  },
  support: {
    title: "Solicitar acesso de suporte",
    kind: "drawer",
    effect:
      "Solicitação não concede acesso. A leitura depende de aprovação, objeto e vigência confirmados no servidor.",
    fields: [
      { label: "Finalidade", type: "textarea" },
      {
        label: "Capacidade",
        options: ["Leitura de conteúdo do objeto indicado"],
      },
      period,
    ],
    authority: "Aprovador distinto do solicitante; política da organização",
  },
  approveAccess: {
    title: "Revisar acesso temporário",
    kind: "modal",
    effect:
      "Concessão limitada ao beneficiário, objeto e duração revisados; nunca permite aprovar a própria elevação.",
    fields: [
      { label: "Beneficiário" },
      { label: "Escopo revisado" },
      period,
      reason,
    ],
    authority: "Gestão de acesso e autoridade da organização",
  },
  suspend: {
    title: "Suspender acesso da organização",
    kind: "modal",
    effect:
      "Suspensão exige política para leitura histórica, convites, compartilhamentos e tarefas em curso. Nenhuma restrição será aplicada nesta prévia.",
    fields: [{ label: "Produtos e ações afetados", type: "textarea" }, reason],
    authority: "Gestão de organizações; revisão independente conforme alcance",
  },
  reactivate: {
    title: "Reativar organização",
    kind: "modal",
    effect:
      "Avaliar cada restrição vigente. Não restaurar sessões, links ou concessões revogados.",
    fields: [{ label: "Evidência de recuperação" }, reason],
    authority: "Gestão de organizações",
  },
  retry: {
    title: "Repetir execução",
    kind: "modal",
    effect:
      "Manter a mesma entrada, versão e método. Consultar a tentativa anterior e usar a mesma referência idempotente antes de repetir.",
    fields: [reason],
    authority: "Responsável técnico ou operador autorizado",
  },
  revokeResult: {
    title: "Revogar validade do resultado",
    kind: "modal",
    effect:
      "Preservar o resultado histórico e identificar as análises afetadas. A decisão comercial do cliente não é revogada.",
    fields: [
      { label: "Fundamento e evidência", type: "textarea" },
      { label: "Análises afetadas" },
      owner,
    ],
    authority: "Responsável técnico e revisão independente",
  },
  model: {
    title: "Criar ou duplicar modelo",
    kind: "modal",
    effect:
      "Preparar um rascunho identificado; salvar não publica. A origem fica vinculada à nova versão.",
    fields: [
      { label: "Nome" },
      { label: "Tipo", options: ["Requisitos", "Tipos de objeto"] },
      { label: "Proprietário", options: ["Lastre"] },
      { label: "Referência de origem", optional: true },
    ],
    authority: "Produto e qualidade",
  },
  connection: {
    title: "Adicionar conexão",
    kind: "drawer",
    effect:
      "Revisar o conector suportado e testar sem efeito de negócio. Salvar não ativa a conexão.",
    fields: [
      {
        label: "Conector",
        options: [
          "Fonte de origem",
          "Armazenamento de evidências",
          "Entrega de comunicações",
        ],
      },
      owner,
      { label: "Ambiente", options: ["Demonstração"] },
      { label: "Finalidade", type: "textarea" },
    ],
    authority: "Responsável técnico",
  },
  credential: {
    title: "Revisar rotação de credencial",
    kind: "drawer",
    effect:
      "A credencial anterior precisa de transição delimitada. Segredos reais só podem ser criados pelo backend; não informe segredos neste formulário.",
    fields: [
      { label: "Escopo" },
      { label: "Expiração", type: "datetime-local" },
      owner,
      reason,
    ],
    authority: "Responsável técnico da integração",
  },
  delivery: {
    title: "Reenviar entrega elegível",
    kind: "modal",
    effect:
      "Reutilizar a identidade do evento original e registrar uma nova tentativa sem duplicar convite ou compartilhamento.",
    fields: [reason],
    authority: "Operação com capacidade de reenvio",
  },
  export: {
    title: "Revisar exportação",
    kind: "modal",
    effect:
      "Seleção fixada no momento da revisão. A geração e o download exigem autorização própria; a prévia não exporta dados restritos.",
    fields: [
      {
        label: "Campos",
        options: ["Metadados operacionais", "Eventos de auditoria minimizados"],
      },
      { label: "Finalidade", type: "textarea" },
      { label: "Disponibilidade do arquivo", options: ["1 hora", "24 horas"] },
    ],
    authority: "Capacidade de exportação separada da leitura",
  },
} satisfies Record<string, Action>;
export type ActionKey = keyof typeof actionDefinitions;
export type ActionContext = {
  target: string;
  organization?: string;
  version?: string;
  details?: string;
};
const Context = createContext<(key: ActionKey, context: ActionContext) => void>(
  () => {},
);
export function useAction() {
  return useContext(Context);
}
export function ActionButton({
  action,
  context,
  children,
  primary = false,
  disabled = false,
}: {
  action: ActionKey;
  context: ActionContext;
  children?: ReactNode;
  primary?: boolean;
  disabled?: boolean;
}) {
  const open = useAction();
  return (
    <Button
      disabled={disabled}
      primary={primary}
      onClick={() => open(action, context)}
    >
      {children ?? actionDefinitions[action].title}
    </Button>
  );
}
export function ActionForm({
  actionKey,
  context,
  onClose,
  storageScope = "preparation",
}: {
  actionKey: ActionKey;
  context: ActionContext;
  onClose: () => void;
  storageScope?: "preparation" | "gallery";
}) {
  const action: Action = actionDefinitions[actionKey];
  const [values, setValues] = useState<Record<string, string>>(() => {
    if (surfaceLab) {
      if (["initial", "validation"].includes(surfaceLab.scenario)) return {};
      const samples: Record<string, string> = {
        Título: "Revisar documentação de origem do lote HZ-014",
        Nome: "Documentação de origem agrícola",
        "Nome da organização": "Horizonte Agro",
        "Organização ou alcance": "Horizonte Agro · ORG-014",
        "Objeto ou referência": "HZ-014 · DOS-014 / V-002",
        Escopo: "Leitura do dossiê DOS-014, versão V-002",
      };
      return Object.fromEntries(
        action.fields.map((field) => [
          field.label,
          field.options?.[0] ??
            (field.type === "email"
              ? "marina@horizonte.example"
              : field.type === "datetime-local"
                ? "2026-09-25T18:00"
                : field.type === "textarea"
                  ? "A fonte de origem foi restabelecida. Conferir o lote HZ-014 e manter a versão V-002 como referência desta revisão."
                  : (samples[field.label] ??
                    "Revisão operacional de Horizonte Agro")),
        ]),
      );
    }
    try {
      const stored = JSON.parse(
        sessionStorage.getItem(
          `lastre-admin-${storageScope}:${actionKey}:${context.target}`,
        ) ?? "null",
      );
      if (
        stored?.context?.version !== context.version ||
        stored?.context?.organization !== context.organization ||
        !stored?.values ||
        typeof stored.values !== "object"
      )
        return {};
      return Object.fromEntries(
        action.fields
          .filter((f) => typeof stored.values[f.label] === "string")
          .map((f) => [f.label, stored.values[f.label]]),
      );
    } catch {
      return {};
    }
  });
  const [stage, setStage] = useState<"edit" | "review" | "saved">(() =>
    surfaceLab?.scenario === "saved"
      ? "saved"
      : surfaceLab &&
          ["review", "save-error", "long"].includes(surfaceLab.scenario)
        ? "review"
        : "edit",
  );
  const [savedValues, setSavedValues] = useState(() => JSON.stringify(values));
  const [discard, setDiscard] = useState(false);
  const [error, setError] = useState(() =>
    surfaceLab?.scenario === "validation"
      ? "Preencha os campos obrigatórios com uma informação válida."
      : surfaceLab?.scenario === "save-error"
        ? "Não foi possível salvar neste navegador. Mantenha esta revisão aberta e tente novamente."
        : "",
  );
  const dirty = JSON.stringify(values) !== savedValues;
  useUnloadGuard(dirty);
  const save = () => {
    try {
      if (!surfaceLab)
        sessionStorage.setItem(
          `lastre-admin-${storageScope}:${actionKey}:${context.target}`,
          JSON.stringify({
            action: actionKey,
            context,
            values,
            savedAt: new Date().toISOString(),
            status: "local-draft",
          }),
        );
      setSavedValues(JSON.stringify(values));
      setStage("saved");
      setError("");
    } catch {
      setError(
        "Não foi possível salvar neste navegador. Mantenha esta revisão aberta e tente novamente.",
      );
    }
  };
  return (
    <Surface
      title={action.title}
      description={context.target}
      kind={action.kind}
      onClose={() => (dirty ? setDiscard(true) : onClose())}
    >
      <Facts
        items={[
          ["Alvo", context.target],
          [
            "Organização / alcance",
            context.organization ?? "Lastre · plataforma",
          ],
          ["Versão", context.version ?? "Não se aplica"],
          ["Ambiente", "Demonstração local"],
        ]}
      />
      {context.details && <p className="ad-description">{context.details}</p>}
      {surfaceLab?.scenario === "long" && (
        <div className="ad-stack">
          <h3>Contexto completo da revisão</h3>
          {Array.from({ length: 8 }, (_, index) => (
            <p key={index}>
              Etapa {index + 1}. Conferência do material recebido de Horizonte
              Agro para o lote HZ-014. A documentação de origem, a versão
              compartilhada e o responsável precisam permanecer identificados
              durante toda a análise. Esta observação faz parte do exemplo de
              conteúdo extenso.
            </p>
          ))}
        </div>
      )}
      {discard ? (
        <div className="ad-stack">
          <Notice title="Há uma preparação não salva" tone="warning">
            Volte à revisão ou descarte os campos preenchidos.
          </Notice>
          <Button onClick={() => setDiscard(false)}>Continuar revisão</Button>
          <Button onClick={onClose}>Descartar e fechar</Button>
        </div>
      ) : stage === "edit" ? (
        <form
          className="ad-form"
          onSubmit={(e) => {
            e.preventDefault();
            if (
              action.fields.some(
                (field) => !field.optional && !values[field.label]?.trim(),
              )
            ) {
              setError(
                "Preencha os campos obrigatórios com uma informação válida.",
              );
              return;
            }
            setError("");
            setStage("review");
          }}
        >
          {action.fields.map((field) => (
            <label key={field.label}>
              {field.label}
              {field.optional && <small> Opcional</small>}
              {field.options ? (
                <Select
                  aria-label={field.label}
                  name={field.label}
                  required={!field.optional}
                  placeholder="Selecione"
                  value={values[field.label] ?? ""}
                  onChange={(next) =>
                    setValues({ ...values, [field.label]: next })
                  }
                  options={field.options.map((option) => ({
                    value: option,
                    label: option,
                  }))}
                />
              ) : field.type === "textarea" ? (
                <textarea
                  aria-label={field.label}
                  required={!field.optional}
                  minLength={8}
                  maxLength={2000}
                  value={values[field.label] ?? ""}
                  onChange={(e) =>
                    setValues({ ...values, [field.label]: e.target.value })
                  }
                />
              ) : (
                <input
                  aria-label={field.label}
                  required={!field.optional}
                  maxLength={200}
                  type={field.type ?? "text"}
                  value={values[field.label] ?? ""}
                  onChange={(e) =>
                    setValues({ ...values, [field.label]: e.target.value })
                  }
                />
              )}
            </label>
          ))}
          {error && (
            <p className="ad-error" role="alert">
              {error}
            </p>
          )}
          <Notice title="Preparação local">{action.effect}</Notice>
          <Button type="submit" primary>
            Revisar alcance
          </Button>
        </form>
      ) : (
        <div className="ad-stack">
          <h3>
            {stage === "saved"
              ? "Preparação salva neste navegador"
              : "Revise antes de solicitar"}
          </h3>
          <Facts items={Object.entries(values)} />
          <Notice title="Efeito previsto">{action.effect}</Notice>
          <Facts
            items={[
              ["Autoridade exigida", action.authority],
              [
                "Execução",
                "Indisponível — API administrativa ainda não conectada",
              ],
            ]}
          />
          {stage === "saved" && (
            <p role="status">
              {surfaceLab
                ? "Preparação mantida apenas nesta prévia."
                : "Rascunho local salvo nesta sessão."}{" "}
              Nenhum comando foi enviado e nenhum registro foi alterado.
            </p>
          )}
          {error && (
            <p className="ad-error" role="alert">
              {error}
            </p>
          )}
          <div className="ad-actions">
            <Button onClick={() => setStage("edit")}>Revisar campos</Button>
            <Button primary disabled>
              Enviar solicitação
            </Button>
            {stage !== "saved" && (
              <Button onClick={save}>Salvar preparação local</Button>
            )}
          </div>
          {stage === "saved" && actionKey === "model" && (
            <Link
              className="ad-link"
              to="/admin/modelos/MOD-001/editar"
              onClick={onClose}
            >
              Explorar editor do modelo de exemplo →
            </Link>
          )}
          {stage === "saved" && actionKey === "export" && (
            <Link
              className="ad-link"
              to="/admin/intervencoes/INT-105"
              onClick={onClose}
            >
              Abrir exemplo de revisão ampla →
            </Link>
          )}
        </div>
      )}
    </Surface>
  );
}
export function ActionProvider({ children }: { children: ReactNode }) {
  const [current, setCurrent] = useState<{
    key: ActionKey;
    context: ActionContext;
  } | null>(() =>
    surfaceLab?.example.action
      ? { key: surfaceLab.example.action, context: surfaceLab.example.context }
      : null,
  );
  return (
    <Context.Provider value={(key, context) => setCurrent({ key, context })}>
      {children}
      {current && (
        <ActionForm
          key={`${current.key}:${current.context.target}`}
          actionKey={current.key}
          context={current.context}
          onClose={() => {
            setCurrent(null);
            notifyLab("closed");
          }}
        />
      )}
    </Context.Provider>
  );
}
