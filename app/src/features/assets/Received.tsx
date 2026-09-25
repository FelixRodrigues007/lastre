import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Icon } from "../../components/ui/Icon";
import { Button, buttonClassName } from "../../components/ui/Button";
import { api, downloadEvidence, type Share, type Snapshot } from "./api";
import { dateLabel } from "./model";
import { DocumentRow, FieldsSummary } from "./Share";
import {
  Avatar,
  Badge,
  Feedback,
  Glyph,
  Loading,
  Notice,
  PageHead,
  Panel,
  useAction,
} from "./ui";

export function AssetsReceived() {
  const { shareId = "" } = useParams();
  const [value, setValue] = useState<{
    share: Share;
    version: Snapshot;
    sender: string;
  } | null>(null);
  const action = useAction();
  const download = useAction();
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [shareId]);
  const daysLeft = value
    ? Math.ceil(
        (new Date(value.share.expiresAt).getTime() - Date.now()) / 86400000,
      )
    : 0;
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
        icon={value ? <Glyph icon="inbox" tone="info" size="lg" /> : undefined}
        meta={
          value && (
            <>
              <Badge tone="info">Somente leitura</Badge>
              <span className="assets-received-meta">
                <Icon name="clock" size={14} /> Acesso até{" "}
                {dateLabel(value.share.expiresAt)}
              </span>
              <span className="assets-received-meta">
                <Icon name={value.share.allowDownload ? "download" : "eye"} size={14} />
                {value.share.allowDownload ? "Download permitido" : "Somente consulta"}
              </span>
            </>
          )
        }
      />
      <Feedback error={action.error} />
      {!value && !action.error && <Loading label="Carregando versão compartilhada…" />}
      {action.error && (
        <div className="assets-actions assets-received-retry">
          <Button
            variant="secondary"
            startIcon={<Icon name="refresh" size={16} />}
            onClick={() =>
              void action.run(async () => setValue(await api.received(shareId)))
            }
          >
            Tentar novamente
          </Button>
          <Link className={buttonClassName({ variant: "ghost" })} to="/assets">
            Voltar ao início
          </Link>
        </div>
      )}
      {value && (
        <div className="assets-split assets-received">
          <div className="assets-stack assets-stack--lg">
            <Notice
              tone={daysLeft <= 3 ? "warning" : "info"}
              title={`Acesso à versão ${value.version.number} até ${dateLabel(value.share.expiresAt)}`}
            >
              Finalidade: {value.share.purpose}.{" "}
              {value.share.allowDownload
                ? "Download permitido."
                : "O remetente não autorizou download dos arquivos."}
            </Notice>
            <Panel eyebrow="Dados declarados" title="Informações desta versão">
              <FieldsSummary
                fields={value.version.fields}
                kind={value.version.fields.category === "lot" ? "lot" : "asset"}
              />
            </Panel>
            <Panel
              eyebrow="Arquivos"
              title="Documentos compartilhados"
              description={`${value.version.evidence.length} documento(s) nesta versão.`}
            >
              <Feedback error={download.error} />
              {value.version.evidence.length ? (
                <ul className="assets-doc-list">
                  {value.version.evidence.map((e) => (
                    <DocumentRow
                      key={e.id}
                      evidence={e}
                      aside={
                        value.share.allowDownload ? (
                          <button
                            type="button"
                            className="assets-icon-button assets-doc-row__download"
                            disabled={download.busy}
                            aria-label={`Baixar ${e.name}`}
                            onClick={() =>
                              void download.run(() =>
                                downloadEvidence(e.id, e.name, shareId),
                              )
                            }
                          >
                            <Icon name="download" size={17} />
                          </button>
                        ) : (
                          <span className="assets-doc-row__locked" title="Download não autorizado pelo remetente">
                            <Icon name="lock" size={15} />
                            <span className="assets-sr-only">Download não autorizado</span>
                          </span>
                        )
                      }
                    />
                  ))}
                </ul>
              ) : (
                <p className="assets-muted">Nenhum documento incluído nesta versão.</p>
              )}
            </Panel>
            {value.version.request && (
              <Panel
                eyebrow="Solicitação"
                title="Requisitos e respostas desta versão"
                description={value.version.request.title}
              >
                <ul className="assets-received-answers">
                  {value.version.request.requirements.map((q) => {
                    const justification = value.version.request!.justifications[q.id];
                    const hasDoc = value.version.evidence.some(
                      (e) => e.requirementId === q.id,
                    );
                    return (
                      <li key={q.id}>
                        <span
                          className="assets-received-answers__mark"
                          data-ok={hasDoc || Boolean(justification) || undefined}
                          aria-hidden="true"
                        >
                          <Icon name={hasDoc ? "file" : justification ? "info" : "close"} size={14} />
                        </span>
                        <div>
                          <h3>{q.label}</h3>
                          <p>
                            {justification ||
                              (hasDoc
                                ? "Documento incluído nesta versão."
                                : "Sem documento ou justificativa.")}
                          </p>
                        </div>
                      </li>
                    );
                  })}
                  {value.version.request.clarifications.map((c) => (
                    <li key={c.id}>
                      <span className="assets-received-answers__mark" aria-hidden="true">
                        <Icon name="send" size={14} />
                      </span>
                      <div>
                        <h3>{c.question}</h3>
                        <p>{c.response || "Sem resposta nesta versão."}</p>
                      </div>
                    </li>
                  ))}
                </ul>
              </Panel>
            )}
          </div>
          <aside className="assets-stack">
            <Panel eyebrow="Remetente" title="Quem compartilhou" elevation={2}>
              <div className="assets-received-sender">
                <Avatar name={value.sender} size="lg" square />
                <div>
                  <strong>{value.sender}</strong>
                  <span>
                    Versão {value.version.number} · {dateLabel(value.version.createdAt, true)}
                  </span>
                </div>
              </div>
            </Panel>
            <Panel
              eyebrow="Integridade"
              title="Verificações disponíveis"
              description={`Resultados sobre a versão ${value.version.number}, enviada em ${dateLabel(value.version.createdAt)}.`}
            >
              <ul className="assets-verifications">
                {value.version.verifications.map((check) => {
                  const tone =
                    check.status === "unavailable"
                      ? "neutral"
                      : check.result === "consistent"
                        ? "good"
                        : "warning";
                  return (
                    <li key={check.id}>
                      <div className="assets-row">
                        <strong>{check.method}</strong>
                        <Badge tone={tone}>
                          {check.status === "unavailable"
                            ? "Indisponível"
                            : check.result === "consistent"
                              ? "Conferência concluída"
                              : "Divergência encontrada"}
                        </Badge>
                      </div>
                      <p>{check.scope}</p>
                      <p className="assets-caption">{check.limitation}</p>
                      {check.status === "completed" && (
                        <p className="assets-caption">
                          Executada em {dateLabel(check.checkedAt, true)} · Método{" "}
                          {check.methodVersion}
                        </p>
                      )}
                    </li>
                  );
                })}
              </ul>
            </Panel>
          </aside>
        </div>
      )}
    </>
  );
}
