import { useSite } from "../../context/SiteContext";

function CheckGlyph() {
  return (
    <svg width="12" height="12" viewBox="0 0 14 14" aria-hidden="true">
      <path
        d="M2.5 7.5L5.5 10.5L11.5 3.5"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function CrossGlyph() {
  return (
    <svg width="11" height="11" viewBox="0 0 14 14" aria-hidden="true">
      <path
        d="M4 4L10 10M10 4L4 10"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function BoundaryVisual() {
  const { content } = useSite();
  const c = content.boundary;

  return (
    <div className="bound__stage" aria-hidden="true">
      <div className="bound">
        <header className="bound__head">
          <span className="mono-label">{c.title}</span>
          <span className="bound__chip">{c.chip}</span>
        </header>

        <div className="bound__cols">
          <div className="bound__col">
            <p className="bound__col-label">{c.inScopeLabel}</p>
            <ul className="bound__list">
              {c.inScope.map((item) => (
                <li key={item} className="bound__item bound__item--in">
                  <span className="bound__mark">
                    <CheckGlyph />
                  </span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="bound__col">
            <p className="bound__col-label">{c.outScopeLabel}</p>
            <ul className="bound__list">
              {c.outScope.map((item) => (
                <li key={item} className="bound__item bound__item--out">
                  <span className="bound__mark">
                    <CrossGlyph />
                  </span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <footer className="bound__foot">
          <span className="bound__foot-rule" aria-hidden="true" />
          <p className="bound__foot-text">{c.foot}</p>
        </footer>
      </div>
    </div>
  );
}
