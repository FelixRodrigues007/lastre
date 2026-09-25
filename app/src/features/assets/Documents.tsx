import { useRef, useState, type FormEvent } from "react";
import { Icon } from "../../components/ui/Icon";
import {
  api,
  downloadEvidence,
  type DossierObject,
  type Evidence,
} from "./api";
import { useWorkspace } from "./context";
import { canEdit, dateLabel } from "./model";
import { Empty, Feedback, Field, Notice, useAction, useUnsaved } from "./ui";
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
  const [removing, setRemoving] = useState("");
  return (
    <>
      <Feedback error={action.error} success={action.success} />
      {documents.length ? (
        <div className="assets-documents">
          {documents.map((e) => (
            <article key={e.id} className="assets-document">
              <span className="assets-document__icon">
                <Icon name="audit" size={25} />
              </span>
              <div>
                <strong>{e.name}</strong>
                <p>
                  {e.source} · {e.author}
                </p>
                <small>
                  {(e.size / 1024).toLocaleString("pt-BR", {
                    maximumFractionDigits: 1,
                  })}{" "}
                  KB · Anexado em {dateLabel(e.uploadedAt)}
                  {e.issuedAt && ` · Emitido em ${dateLabel(e.issuedAt)}`}
                </small>
                <details className="assets-technical">
                  <summary>Referência do arquivo</summary>
                  <code>SHA-256: {e.digest}</code>
                  <p>
                    Referência de integridade. Não comprova o conteúdo
                    declarado.
                  </p>
                </details>
                {removing === e.id && (
                  <div className="assets-inline-confirm">
                    <p>
                      Remover do rascunho? Versões enviadas manterão este
                      documento.
                    </p>
                    <button
                      className="assets-button"
                      onClick={() => setRemoving("")}
                    >
                      Cancelar
                    </button>
                    <button
                      className="assets-button assets-button--danger"
                      disabled={action.busy}
                      onClick={() =>
                        void action.run(async () => {
                          await api.removeEvidence(
                            object!.id,
                            e.id,
                            object!.revision,
                          );
                          await reload();
                          setRemoving("");
                        }, "Documento removido do rascunho.")
                      }
                    >
                      Confirmar remoção
                    </button>
                  </div>
                )}
              </div>
              <div className="assets-document__actions">
                {allowDownload && (
                  <button
                    className="assets-icon-button"
                    disabled={action.busy}
                    aria-label={`Baixar ${e.name}`}
                    onClick={() =>
                      void action.run(() =>
                        downloadEvidence(e.id, e.name, shareId),
                      )
                    }
                  >
                    <Icon name="download" />
                  </button>
                )}
                {!readOnly && object && (
                  <button
                    className="assets-text-link"
                    onClick={() => setRemoving(e.id)}
                  >
                    Remover
                  </button>
                )}
              </div>
            </article>
          ))}
        </div>
      ) : (
        <Empty
          title="Os documentos ficam aqui"
          description="Anexe evidências que ajudem a compreender este cadastro. Cada arquivo mantém sua fonte e autoria."
          icon="audit"
        />
      )}
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
  const inputRef = useRef<HTMLInputElement>(null);
  useUnsaved(Boolean(selected));
  const documents = data.evidence.filter((e) =>
    object.evidenceIds.includes(e.id),
  );
  const requirements = data.requests
    .filter((r) => r.objectId === object.id)
    .flatMap((r) =>
      r.requirements.map((q) => ({ ...q, requestTitle: r.title })),
    );
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
      setSelected(null);
      setReplacement("");
      if (inputRef.current) inputRef.current.value = "";
      setShowUpload(false);
    }, "Documento salvo no dossiê. Ele ainda não foi compartilhado.");
  };
  return (
    <div className="assets-stack">
      <div className="assets-section-head">
        <div>
          <h2>Documentos do rascunho</h2>
          <p>Arquivos identificados, com fonte e responsável pelo envio.</p>
        </div>
        {writable && (
          <button
            className="assets-button"
            onClick={() => setShowUpload((v) => !v)}
          >
            {showUpload ? "Fechar anexação" : "＋ Anexar documento"}
          </button>
        )}
      </div>
      <Feedback error={action.error} success={action.success} />
      {showUpload && writable && (
        <form className="assets-upload" onSubmit={submit}>
          <div className="assets-fields">
            <Field
              label="Arquivo"
              wide
              hint="PDF, JPG, PNG ou TXT. Até 8 MB. Fotografias não substituem laudos exigidos."
            >
              <input
                ref={inputRef}
                type="file"
                accept=".pdf,.jpg,.jpeg,.png,.txt"
                onChange={(e) => setSelected(e.target.files?.[0] ?? null)}
                required
                disabled={action.busy}
              />
            </Field>
            {selected && (
              <div className="assets-field--wide assets-row">
                <span>
                  {selected.name} · {(selected.size / 1024 / 1024).toFixed(2)}{" "}
                  MB
                </span>
                <button
                  type="button"
                  className="assets-text-link"
                  onClick={() => {
                    setSelected(null);
                    if (inputRef.current) inputRef.current.value = "";
                  }}
                >
                  Remover seleção
                </button>
              </div>
            )}
            <Field
              label="Fonte ou emissor"
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
                <select
                  value={requirement}
                  onChange={(e) => setRequirement(e.target.value)}
                  disabled={action.busy}
                >
                  <option value="">Documento complementar</option>
                  {requirements.map((q) => (
                    <option key={q.id} value={q.id}>
                      {q.label} · {q.requestTitle}
                    </option>
                  ))}
                </select>
              </Field>
            )}
            {documents.length > 0 && (
              <Field label="Substituir documento (opcional)">
                <select
                  value={replacement}
                  onChange={(e) => setReplacement(e.target.value)}
                  disabled={action.busy}
                >
                  <option value="">Adicionar novo documento</option>
                  {documents.map((doc) => (
                    <option key={doc.id} value={doc.id}>
                      {doc.name}
                    </option>
                  ))}
                </select>
              </Field>
            )}
          </div>
          <Notice>
            O arquivo será salvo na sua organização. Compartilhar exige revisar
            e confirmar uma versão.
          </Notice>
          <button
            className="assets-button assets-button--primary"
            disabled={action.busy || !selected}
          >
            {action.busy ? "Salvando documento…" : "Salvar documento no dossiê"}
          </button>
        </form>
      )}
      <EvidenceList
        documents={documents}
        object={object}
        readOnly={!writable}
      />
    </div>
  );
}
