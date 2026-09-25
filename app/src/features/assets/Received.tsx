import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { api, type Share, type Snapshot } from "./api";
import { dateLabel } from "./model";
import { EvidenceList } from "./Documents";
import { ObjectSummary, VerificationList } from "./ObjectDetail";
import { Feedback, Loading, Notice, PageHead, useAction } from "./ui";
export function AssetsReceived() {
  const { shareId = "" } = useParams();
  const [value, setValue] = useState<{
    share: Share;
    version: Snapshot;
    sender: string;
  } | null>(null);
  const action = useAction();
  useEffect(() => {
    setValue(null);
    let active = true;
    void action.run(async () => {
      const result = await api.received(shareId);
      if (active) setValue(result);
    });
    const refresh = () => {
      if (document.visibilityState === "visible") {
        setValue(null);
        void action.run(async () => {
          const result = await api.received(shareId);
          if (active) setValue(result);
        });
      }
    };
    document.addEventListener("visibilitychange", refresh);
    return () => {
      active = false;
      document.removeEventListener("visibilitychange", refresh);
    };
  }, [shareId]);
  return (
    <>
      <PageHead
        eyebrow="Compartilhado com sua organização"
        title={value?.version.fields.name ?? "Consultar dossiê"}
        description={
          value
            ? `Enviado por ${value.sender} · versão ${value.version.number}`
            : undefined
        }
        back="/assets"
      />
      <Feedback error={action.error} />
      {!value && !action.error && <Loading />}
      {action.error && (
        <button
          className="assets-button"
          onClick={() =>
            void action.run(async () => setValue(await api.received(shareId)))
          }
        >
          Tentar novamente
        </button>
      )}
      {value && (
        <div className="assets-stack">
          <Notice>
            Acesso à versão {value.version.number} até{" "}
            {dateLabel(value.share.expiresAt)}. Finalidade:{" "}
            {value.share.purpose}.{" "}
            {value.share.allowDownload
              ? "Download permitido."
              : "O remetente não autorizou download dos arquivos."}
          </Notice>
          <section className="assets-panel">
            <ObjectSummary
              fields={value.version.fields}
              kind={value.version.fields.category === "lot" ? "lot" : "asset"}
            />
          </section>
          <section className="assets-panel">
            <h2>Documentos compartilhados</h2>
            <EvidenceList
              documents={value.version.evidence}
              readOnly
              shareId={shareId}
              allowDownload={value.share.allowDownload}
            />
          </section>
          {value.version.request && (
            <section className="assets-panel assets-stack">
              <h2>Requisitos e respostas desta versão</h2>
              {value.version.request.requirements.map((q) => (
                <div key={q.id}>
                  <h3>{q.label}</h3>
                  <p>
                    {value.version.request!.justifications[q.id] ||
                      (value.version.evidence.some(
                        (e) => e.requirementId === q.id,
                      )
                        ? "Documento incluído nesta versão."
                        : "Sem documento ou justificativa.")}
                  </p>
                </div>
              ))}
              {value.version.request.clarifications.map((c) => (
                <div key={c.id}>
                  <h3>{c.question}</h3>
                  <p>{c.response || "Sem resposta nesta versão."}</p>
                </div>
              ))}
            </section>
          )}
          <section className="assets-panel">
            <VerificationList version={value.version} />
          </section>
        </div>
      )}
    </>
  );
}
