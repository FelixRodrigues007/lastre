import { useRef } from "react";
import { Link } from "react-router-dom";
import { buttonClassName } from "../../components/ui/Button";
import { Drawer } from "../../components/ui/Drawer";
import { Icon } from "../../components/ui/Icon";
import { Tooltip } from "../../components/ui/Tooltip";
import type { DossierObject } from "./api";
import { useWorkspace } from "./context";
import {
  canSend,
  categoryLabels,
  dateLabel,
  missingFields,
  objectPath,
  quantityLabel,
  sectorLabels,
  statusLabels,
} from "./model";
import {
  Badge,
  Glyph,
  Progress,
  Properties,
  formatBytes,
  relativeTime,
} from "./ui";
import { objectTone, statusTone } from "./listing";

/**
 * Quick look at a record from a list: properties, readiness, documents and
 * related requests, without leaving the list. Full editing stays on the page.
 */
export function ObjectPeek({
  object,
  onClose,
}: {
  object: DossierObject | null;
  onClose: () => void;
}) {
  const { data } = useWorkspace();
  // Keep the last record while the drawer plays its exit motion.
  const last = useRef(object);
  if (object) last.current = object;
  const o = last.current;
  const kind = o?.kind ?? "asset";
  const missing = o ? missingFields(o) : [];
  const required = kind === "lot" ? 6 : 3;
  const documents = o
    ? data.evidence.filter((e) => o.evidenceIds.includes(e.id))
    : [];
  const versions = o ? data.versions.filter((v) => v.objectId === o.id) : [];
  const requests = o ? data.requests.filter((r) => r.objectId === o.id) : [];
  const origin = o?.fields.originId
    ? data.objects.find((x) => x.id === o.fields.originId)
    : undefined;
  const path = o ? objectPath(o) : "";

  return (
    <Drawer
      open={Boolean(object)}
      onClose={onClose}
      eyebrow={
        o &&
        `${kind === "lot" ? "Lote de produção" : categoryLabels[o.fields.category]} · ${sectorLabels[o.fields.sector]}`
      }
      title={o?.fields.name || "Cadastro sem identificação"}
      leading={
        o && (
          <Glyph icon={kind === "lot" ? "lots" : "globe"} tone={objectTone(o)} />
        )
      }
      headerActions={
        o && (
          <Tooltip content="Abrir página completa">
            <Link className="lastre-menu-trigger" to={path} aria-label="Abrir página completa">
              <Icon name="external" size={16} />
            </Link>
          </Tooltip>
        )
      }
      footer={
        o && (
          <>
            {o.status !== "archived" && canSend(data.membership.role) && (
              <Link
                className={buttonClassName({ variant: "secondary" })}
                to={`${path}/compartilhar`}
              >
                <Icon name="share" size={16} /> Compartilhar
              </Link>
            )}
            <Link className={buttonClassName({})} to={path}>
              Abrir dossiê <Icon name="arrow-right" size={16} />
            </Link>
          </>
        )
      }
    >
      {o && (
        <>
          <div className="assets-peek__status">
            <Badge tone={statusTone(o.status)}>{statusLabels[o.status]}</Badge>
            <span className="assets-mono">rev. {o.revision}</span>
            <span>atualizado {relativeTime(o.updatedAt)}</span>
          </div>

          {o.status !== "archived" && (
            <section className="lastre-drawer-section">
              <h3>Prontidão</h3>
              <Progress
                value={Math.max(0, required - missing.length)}
                max={required}
                label={missing.length ? "Dados obrigatórios" : "Dados obrigatórios completos"}
                tone={missing.length ? "warning" : "success"}
              />
              {missing.length > 0 && (
                <p className="assets-peek__missing">
                  Falta: {missing.join(", ")}.
                </p>
              )}
            </section>
          )}

          <section className="lastre-drawer-section">
            <h3>Propriedades</h3>
            <Properties
              items={[
                { label: "Responsável", icon: "user", value: o.fields.responsible || "A informar" },
                { label: "Local", icon: "pin", value: o.fields.location || "A informar" },
                ...(kind === "lot"
                  ? [
                      { label: "Material", icon: "lots" as const, value: o.fields.material || "A informar" },
                      { label: "Quantidade", icon: "process" as const, value: quantityLabel(o), mono: Boolean(o.fields.quantity) },
                      {
                        label: "Período",
                        icon: "calendar" as const,
                        value:
                          o.fields.periodStart && o.fields.periodEnd
                            ? `${dateLabel(o.fields.periodStart)} a ${dateLabel(o.fields.periodEnd)}`
                            : "A informar",
                      },
                    ]
                  : [
                      { label: "Tipo", icon: "globe" as const, value: categoryLabels[o.fields.category] },
                      ...(o.fields.registration
                        ? [{ label: "Referência", icon: "link" as const, value: o.fields.registration, mono: true }]
                        : []),
                    ]),
                { label: "Versões", icon: "history", value: versions.length ? `${versions.length} enviada(s)` : "Nenhuma enviada" },
                { label: "Criado", icon: "calendar", value: dateLabel(o.createdAt) },
              ]}
            />
            {origin && (
              <Link className="assets-origin assets-peek__origin" to={objectPath(origin)}>
                <Glyph icon="chain" size="sm" />
                <span>
                  <small>Ativo de origem</small>
                  <strong>{origin.fields.name}</strong>
                </span>
                <Icon name="chevron-right" size={16} />
              </Link>
            )}
          </section>

          <section className="lastre-drawer-section">
            <h3>Documentos · {documents.length}</h3>
            {documents.length ? (
              <ul className="assets-peek__list">
                {documents.map((d) => (
                  <li key={d.id}>
                    <Icon name="file" size={16} />
                    <span>
                      <strong>{d.name}</strong>
                      <small>
                        {d.source || "Fonte a informar"} · {formatBytes(d.size)}
                      </small>
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="assets-caption">Nenhum documento anexado.</p>
            )}
          </section>

          {requests.length > 0 && (
            <section className="lastre-drawer-section">
              <h3>Solicitações · {requests.length}</h3>
              <ul className="assets-peek__list">
                {requests.map((r) => (
                  <li key={r.id}>
                    <Icon name="inbox" size={16} />
                    <Link to={`/assets/solicitacoes/${r.id}`}>
                      <strong>{r.title}</strong>
                      <small>{r.requesterName}</small>
                    </Link>
                    <Badge tone={r.status === "open" ? "warning" : "info"}>
                      {r.status === "open" ? "Sua resposta" : "Enviada"}
                    </Badge>
                  </li>
                ))}
              </ul>
            </section>
          )}
        </>
      )}
    </Drawer>
  );
}
