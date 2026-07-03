import { useLocaleContext } from "../../context/LocaleContext";
import { checkGeoPerimeter } from "../../lib/escalations";
import type { KnownLimits, ProvenanceArtifact } from "../../lib/types";
import "./escalation-geo-evidence.css";

type EscalationGeoEvidenceProps = {
  artifact: ProvenanceArtifact;
  limits: KnownLimits;
};

function formatCoord(value: number): string {
  return value.toFixed(6);
}

function formatRange(min: number, max: number): string {
  return `${formatCoord(min)} – ${formatCoord(max)}`;
}

export function EscalationGeoEvidence({ artifact, limits }: EscalationGeoEvidenceProps) {
  const { t } = useLocaleContext();
  const check = checkGeoPerimeter(artifact, limits);
  const { perimeter } = check;

  const metrics = [
    {
      id: "lat",
      label: t("escalations.geo.latitude"),
      declared: formatCoord(check.lat),
      expected: formatRange(perimeter.minLat, perimeter.maxLat),
      inRange: check.latInRange,
    },
    {
      id: "lng",
      label: t("escalations.geo.longitude"),
      declared: formatCoord(check.lng),
      expected: formatRange(perimeter.minLng, perimeter.maxLng),
      inRange: check.lngInRange,
    },
  ] as const;

  return (
    <section className="escalation-geo" aria-labelledby="escalation-geo-title">
      <header className="escalation-geo__head">
        <div className="escalation-geo__intro">
          <p className="escalation-geo__title mono-label" id="escalation-geo-title">
            {t("escalations.geo.title")}
          </p>
          <p className="escalation-geo__lead">{t("escalations.geo.lead")}</p>
        </div>
        <span
          className={`escalation-geo__stamp${check.inPerimeter ? " escalation-geo__stamp--in" : " escalation-geo__stamp--out"}`}
          aria-label={check.inPerimeter ? t("escalations.geo.inPerimeter") : t("escalations.geo.outPerimeter")}
        >
          {check.inPerimeter ? t("escalations.geo.inPerimeter") : t("escalations.geo.outPerimeter")}
        </span>
      </header>

      <div className="escalation-geo__compare">
        <div className="escalation-geo__compare-head" aria-hidden="true">
          <span className="escalation-geo__compare-col escalation-geo__compare-col--field">
            {t("escalations.geo.field")}
          </span>
          <span className="escalation-geo__compare-col">{t("escalations.geo.declaredCol")}</span>
          <span className="escalation-geo__compare-col">{t("escalations.geo.expectedCol")}</span>
        </div>

        <dl className="escalation-geo__compare-body">
          {metrics.map((metric) => (
            <div
              key={metric.id}
              className={`escalation-geo__compare-row${metric.inRange ? "" : " escalation-geo__compare-row--flag"}`}
            >
              <dt className="escalation-geo__compare-field">{metric.label}</dt>
              <dd className="escalation-geo__compare-declared" data-label={t("escalations.geo.declaredCol")}>
                <span className="escalation-geo__mono">{metric.declared}</span>
              </dd>
              <dd className="escalation-geo__compare-expected" data-label={t("escalations.geo.expectedCol")}>
                <span className="escalation-geo__mono escalation-geo__mono--muted">{metric.expected}</span>
              </dd>
            </div>
          ))}
        </dl>

        <div className="escalation-geo__site">
          <span className="escalation-geo__site-label">{t("escalations.geo.site")}</span>
          <span className="escalation-geo__site-value">{artifact.origin.site}</span>
        </div>
      </div>
    </section>
  );
}
