import { useState, type FormEvent } from "react";
import { Icon } from "../../components/ui/Icon";
import { Button } from "../../components/ui/Button";
import { Select } from "../../components/ui/Select";
import {
  api,
  downloadEvidence,
  type DossierObject,
  type Evidence,
} from "./api";
import { useWorkspace } from "./context";
import { canEdit, dateLabel } from "./model";
import { Dialog, Dropzone, toast } from "./overlay";
import {
  Empty,
  Feedback,
  Field,
  Glyph,
  Notice,
  Panel,
  formatBytes,
  useAction,
  useUnsaved,
} from "./ui";

function base64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result).split(",")[1]);
    reader.onerror = () =>
      reject(
        new Error("Não foi possível ler o arquivo. Selecione-o novamente."),
      );
    reader.readAsDataURL(file);
  });
}

const kindOf = (e: Evidence) => {
  const ext = e.name.split(".").pop()?.toUpperCase() ?? "";
  return ext.length <= 4 ? ext : "ARQ";
};

/** SHA-256 in recessed material with a copy action. */
function Digest({ value }: { value: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <span className="assets-digest">
      <span className="assets-hash" title={value}>
        SHA-256 · {value.slice(0, 12)}…{value.slice(-6)}
      </span>
      <button
        type="button"
        className="assets-icon-button assets-digest__copy"
        aria-label={copied ? "Referência copiada" : "Copiar referência SHA-256"}
        onClick={() => {
          void navigator.clipboard
            ?.writeText(value)
            .then(() => {
              setCopied(true);
              window.setTimeout(() => setCopied(false), 1800);
            })
            .catch(() => {});
        }}
      >
        <Icon name={copied ? "check" : "copy"} size={14} />
      </button>
    </span>
  );
}

export function EvidenceList({
  documents,
  readOnly = false,
  object,
  shareId,
  allowDownload = true,
}: {
  documents: Evidence[];
  readOnly?: boolean;
  object?: DossierObject;
  shareId?: string;
  allowDownload?: boolean;
}) {
  const { reload } = useWorkspace();
  const action = useAction();
  const [removing, setRemoving] = useState<Evidence | null>(null);
  return (
    <>
      <Feedback error={action.error} success={action.success} />
      {documents.length ? (
        <ul className="assets-docs assets-stagger">
          {documents.map((e) => (
            <li key={e.id} className="assets-doc">
              <span className="assets-doc__type" aria-hidden="true">
                <Icon name="file" size={20} />
                <span>{kindOf(e)}</span>
              </span>
              <div className="assets-doc__main">
                <strong className="assets-doc__name">{e.name}</strong>
                <p className="assets-doc__meta">
                  <span>{e.source}</span>
                  <span aria-hidden="true">·</span>
                  <span>{e.author}</span>
                  <span aria-hidden="true">·</span>
                  <span>{formatBytes(e.size)}</span>
                </p>
                <p className="assets-doc__meta">
                  <span>
                    <Icon name="upload" size={13} /> Anexado em{" "}
                    {dateLabel(e.uploadedAt)}
                  </span>
                  {e.issuedAt && (
                    <span>
                      <Icon name="calendar" size={13} /> Emitido em{" "}
                      {dateLabel(e.issuedAt)}
                    </span>
                  )}
                </p>
                <Digest value={e.digest} />
              </div>
              <div className="assets-doc__actions">
                {allowDownload && (
                  <button
                    type="button"
                    className="assets-icon-button"
                    disabled={action.busy}
                    aria-label={`Baixar ${e.name}`}
                    title="Baixar"
                    onClick={() =>
                      void action.run(() =>
                        downloadEvidence(e.id, e.name, shareId),
                      )
                    }
                  >
                    <Icon name="download" size={17} />
                  </button>
                )}
                {!readOnly && object && (
                  <button
                    type="button"
                    className="assets-icon-button assets-doc__remove"
                    aria-label={`Remover ${e.name} do rascunho`}
                    title="Remover do rascunho"
                    onClick={() => setRemoving(e)}
                  >
                    <Icon name="trash" size={16} />
                  </button>
                )}
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <Empty
          compact
          title="Os documentos ficam aqui"
          description="Anexe evidências que ajudem a compreender este cadastro. Cada arquivo mantém sua fonte e autoria."
          icon="file"
        />
      )}
      {documents.length > 0 && (
        <p className="assets-doc-note">
          <Icon name="info" size={14} /> A referência SHA-256 identifica o
          arquivo armazenado. Não comprova o conteúdo declarado.
        </p>
      )}
      <Dialog
        open={Boolean(removing)}
        onClose={() => setRemoving(null)}
        tone="danger"
        icon="trash"
        size="sm"
        title="Remover do rascunho?"
        description={`${removing?.name ?? ""} sairá do rascunho. Versões enviadas manterão este documento.`}
        actions={
          <>
            <Button variant="ghost" onClick={() => setRemoving(null)}>
              Cancelar
            </Button>
            <Button
              variant="danger"
              loading={action.busy}
              onClick={() =>
                void action.run(async () => {
                  if (!removing || !object) return;
                  await api.removeEvidence(object.id, removing.id, object.revision);
                  await reload();
                  setRemoving(null);
                  toast("Documento removido do rascunho.");
                }, "Documento removido do rascunho.")
              }
            >
              Confirmar remoção
            </Button>
          </>
        }
      />
    </>
  );
}

export function Documents({
  object,
  requirementId = "",
}: {
  object: DossierObject;
  requirementId?: string;
}) {
  const { data, reload } = useWorkspace();
  const writable =
    canEdit(data.membership.role) && object.status !== "archived";
  const action = useAction();
  const [showUpload, setShowUpload] = useState(Boolean(requirementId));
  const [selected, setSelected] = useState<File | null>(null);
  const [requirement, setRequirement] = useState(requirementId);
  const [replacement, setReplacement] = useState("");
  const [inputKey, setInputKey] = useState(0);
  useUnsaved(Boolean(selected));
  const documents = data.evidence.filter((e) =>
    object.evidenceIds.includes(e.id),
  );
  const requirements = data.requests
    .filter((r) => r.objectId === object.id)
    .flatMap((r) =>
      r.requirements.map((q) => ({ ...q, requestTitle: r.title })),
    );
  const clearFile = () => {
    setSelected(null);
    setInputKey((k) => k + 1);
  };
  const submit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const values = Object.fromEntries(new FormData(e.currentTarget));
    void action.run(async () => {
      if (!selected) throw new Error("Selecione um arquivo para anexar.");
      if (selected.size === 0 || selected.size > 8 * 1024 * 1024)
        throw new Error("O arquivo deve ter conteúdo e no máximo 8 MB.");
      const content = await base64(selected);
      await api.upload(object.id, {
        revision: object.revision,
        name: selected.name,
        mime:
          selected.type || (selected.name.endsWith(".txt") ? "text/plain" : ""),
        content,
        source: values.source,
        issuedAt: values.issuedAt,
        requirementId: requirement,
        supersedes: replacement || undefined,
      });
      await reload();
      clearFile();
      setReplacement("");
      setShowUpload(false);
    }, "Documento salvo no dossiê. Ele ainda não foi compartilhado.");
  };
  const tooLarge = selected && selected.size > 8 * 1024 * 1024;
  return (
    <div className="assets-stack assets-stack--lg">
      <div className="assets-section-head">
        <div>
          <h2>Documentos do rascunho</h2>
          <p className="assets-panel__desc">
            {documents.length} arquivo(s) identificado(s), com fonte e
            responsável pelo envio.
          </p>
        </div>
        {writable && (
          <Button
            variant={showUpload ? "ghost" : "secondary"}
            size="sm"
            startIcon={<Icon name={showUpload ? "close" : "plus"} size={15} />}
            aria-expanded={showUpload}
            onClick={() => setShowUpload((v) => !v)}
          >
            {showUpload ? "Fechar anexação" : "Anexar documento"}
          </Button>
        )}
      </div>
      <Feedback error={action.error} success={action.success} />
      {showUpload && writable && (
        <Panel
          as="div"
          elevation={2}
          className="assets-upload"
          eyebrow="Novo documento"
          title="Anexar ao dossiê"
          description="O arquivo fica na sua organização até você revisar e confirmar uma versão."
        >
          <form className="assets-stack" onSubmit={submit}>
            <Dropzone
              key={inputKey}
              label="Arquivo"
              accept=".pdf,.jpg,.jpeg,.png,.txt"
              fileName={
                selected
                  ? `${selected.name} · ${formatBytes(selected.size)}`
                  : undefined
              }
              hint="PDF, JPG, PNG ou TXT. Até 8 MB. Fotografias não substituem laudos exigidos."
              onFile={setSelected}
              disabled={action.busy}
            />
            {selected && (
              <div className="assets-row assets-upload__selected">
                {tooLarge && (
                  <span className="lastre-field__error">
                    O arquivo tem mais de 8 MB.
                  </span>
                )}
                <button
                  type="button"
                  className="assets-text-link"
                  onClick={clearFile}
                >
                  Remover seleção
                </button>
              </div>
            )}
            <div className="assets-fields">
              <Field
                label="Fonte ou emissor"
                required
                hint="Quem produziu ou emitiu o documento."
              >
                <input
                  name="source"
                  required
                  maxLength={240}
                  placeholder="Ex.: laboratório ou organização emissora"
                  disabled={action.busy}
                />
              </Field>
              <Field label="Data de emissão (opcional)">
                <input name="issuedAt" type="date" disabled={action.busy} />
              </Field>
              {requirements.length > 0 && (
                <Field label="Atende a qual requisito?">
                  <Select
                    value={requirement}
                    onChange={setRequirement}
                    disabled={action.busy}
                    options={[
                      { value: "", label: "Documento complementar", icon: "file" as const },
                      ...requirements.map((q) => ({
                        value: q.id,
                        label: q.label,
                        description: q.requestTitle,
                        icon: "inbox" as const,
                      })),
                    ]}
                  />
                </Field>
              )}
              {documents.length > 0 && (
                <Field label="Substituir documento (opcional)">
                  <Select
                    value={replacement}
                    onChange={setReplacement}
                    disabled={action.busy}
                    options={[
                      { value: "", label: "Adicionar novo documento", icon: "plus" as const },
                      ...documents.map((doc) => ({
                        value: doc.id,
                        label: doc.name,
                        description: `${doc.source || "Fonte a informar"} · ${dateLabel(doc.uploadedAt)}`,
                        icon: "refresh" as const,
                      })),
                    ]}
                  />
                </Field>
              )}
            </div>
            <Notice tone="info" title="Ainda não compartilhado">
              O arquivo será salvo na sua organização. Compartilhar exige
              revisar e confirmar uma versão.
            </Notice>
            <div className="assets-upload__foot">
              <Glyph icon="shield" size="sm" tone="neutral" />
              <span className="assets-caption">
                Calculamos a referência SHA-256 no envio.
              </span>
              <Button
                type="submit"
                loading={action.busy}
                disabled={!selected}
                startIcon={<Icon name="upload" size={15} />}
              >
                Salvar documento no dossiê
              </Button>
            </div>
          </form>
        </Panel>
      )}
      <EvidenceList
        documents={documents}
        object={object}
        readOnly={!writable}
      />
    </div>
  );
}
