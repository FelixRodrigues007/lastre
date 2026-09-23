import { useState } from "react";
import { Icon } from "../ui/Icon";
import { LastreWordmark } from "../ui/LastreWordmark";
import { Surface } from "../ui/Surface";
import { Button } from "../ui/Button";

export function DepthShowcase() {
  const [expanded, setExpanded] = useState(false);
  return (
    <div className="ds-depth-showcase" data-expanded={expanded}>
      <div className="ds-depth-showcase__grid" aria-hidden="true" />
      <div className="ds-depth-showcase__caption">
        <span className="ds-label">ANATOMIA DE UMA INTERFACE</span>
        <span className="ds-depth-coordinate">X / Y / Z</span>
      </div>
      <div className="ds-depth-stack" aria-hidden="true">
        <div className="ds-depth-plane ds-depth-plane--base">
          <span>01 — FUNDAÇÃO</span>
          <i />
          <i />
          <i />
        </div>
        <Surface elevation={3} className="ds-depth-plane ds-depth-plane--card">
          <div className="ds-depth-card__head">
            <LastreWordmark />
            <Icon name="external" size={15} />
          </div>
          <span className="ds-depth-card__label">
            Cada origem tem uma história.
          </span>
          <strong>A prova permanece.</strong>
          <div className="ds-depth-card__rule" />
          <div className="ds-depth-card__bottom">
            <span>
              <i /> Origem verificada
            </span>
            <code>LST / 024</code>
          </div>
        </Surface>
        <Surface
          elevation={4}
          material="glass"
          className="ds-depth-plane ds-depth-plane--glass"
        >
          <span className="ds-depth-seal">
            <Icon name="check" size={22} />
          </span>
          <div>
            <strong>Evidência conectada</strong>
            <span>Da origem ao registro.</span>
          </div>
          <Icon name="chain" size={22} />
        </Surface>
        <div className="ds-depth-marker ds-depth-marker--a">
          Superfície / 02
        </div>
        <div className="ds-depth-marker ds-depth-marker--b">Vidro / 04</div>
      </div>
      <div className="ds-depth-showcase__foot">
        <span>Luz. Matéria. Hierarquia.</span>
        <Button
          size="sm"
          variant="secondary"
          aria-pressed={expanded}
          onClick={() => setExpanded(!expanded)}
        >
          {expanded ? "Reunir camadas" : "Separar camadas"}
          <span aria-hidden="true">↗</span>
        </Button>
      </div>
    </div>
  );
}
