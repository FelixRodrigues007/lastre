import { Ring } from "../Ring";
import { tx, type Deck } from "../types";
import type { Locale } from "../../i18n/translations";
import { camada, type CamadaId } from "./publicos-data";

/* ─────────────────────────────────────────────────────────────────────────
 * 02 · Mapa de públicos — 6 telas, um anel
 *
 * A cadeia inteira vive num objeto só. O anel repete slide a slide, mudando
 * apenas quais setores estão acesos; o centro nunca apaga, porque é a tese.
 * ───────────────────────────────────────────────────────────────────────── */

function Chips({
  locale,
  items,
  accent,
}: {
  locale: Locale;
  items: { pt: string; en: string }[];
  accent?: string[];
}) {
  return (
    <ul className="dk-ring-chips__list" aria-label={locale === "pt" ? "Públicos" : "Audiences"}>
      {items.map((p) => {
        const label = locale === "pt" ? p.pt : p.en;
        const isAccent = accent?.includes(p.pt) ?? false;
        return (
          <li key={p.pt}>
            <span className={`dk-ring-chip${isAccent ? " dk-ring-chip--accent" : ""}`}>{label}</span>
          </li>
        );
      })}
    </ul>
  );
}

/** O que a camada faz na cadeia e o que ela quer da Lastre. Duas linhas, sempre. */
function Resumo({ locale, id }: { locale: Locale; id: CamadaId }) {
  const t = tx(locale);
  const c = camada(id);
  return (
    <dl className="dk-ring-resumo">
      <div className="dk-ring-resumo__row">
        <dt>{t("Faz", "Does")}</dt>
        <dd>{t(c.faz.pt, c.faz.en)}</dd>
      </div>
      <div className="dk-ring-resumo__row">
        <dt>{t("Quer", "Wants")}</dt>
        <dd>{t(c.quer.pt, c.quer.en)}</dd>
      </div>
    </dl>
  );
}

type Col = {
  label: { pt: string; en: string };
  id: CamadaId;
  accent?: string[];
};

function ChipCols({ locale, cols }: { locale: Locale; cols: Col[] }) {
  const t = tx(locale);
  return (
    <div className="dk-ring-chips dk-ring-chips--cols">
      {cols.map((col) => (
        <div className="dk-ring-chips__col" key={col.id}>
          <span className="dk-eyebrow">{t(col.label.pt, col.label.en)}</span>
          <Resumo locale={locale} id={col.id} />
          <Chips locale={locale} items={camada(col.id).publicos} accent={col.accent} />
        </div>
      ))}
    </div>
  );
}

export const publicos: Deck = {
  slug: "publicos",
  index: "02",
  title: { pt: "Mapa de públicos", en: "Map of audiences" },
  summary: {
    pt: "Sete camadas, cinquenta públicos, um centro. O mapa da cadeia de tokenização e a posição da Lastre dentro dela.",
    en: "Seven layers, fifty audiences, one centre. The map of the tokenisation chain and where Lastre sits inside it.",
  },
  audience: { pt: "Sócios e convidados", en: "Partners and guests" },
  updated: "02.09.2026",
  slides: [
    /* ── 01 · capa ────────────────────────────────────────────────────── */
    {
      id: "capa",
      title: { pt: "Capa", en: "Cover" },
      skin: "wave",
      render: (l) => {
        const t = tx(l);
        return (
          <>
            <div className="dk-top">
              <h1 className="dk-h1">{t("O mapa da cadeia.", "The map of the chain.")}</h1>
              <p className="dk-eyebrow">
                {t("Documento de trabalho · 02 setembro 2026", "Working document · 02 September 2026")}
              </p>
            </div>
            <div className="dk-bottom">
              <p className="dk-p dk-p--lead">
                {t(
                  "Sete camadas, cinquenta públicos, um centro. Mapeamos a cadeia inteira para mostrar onde a Lastre fica — e por que ninguém a contorna.",
                  "Seven layers, fifty audiences, one centre. We mapped the whole chain to show where Lastre sits — and why no one goes around it.",
                )}
              </p>
            </div>
          </>
        );
      },
    },

    /* ── 02 · anel ────────────────────────────────────────────────────── */
    {
      id: "anel",
      title: { pt: "01 · A cadeia", en: "01 · The chain" },
      render: (l) => {
        const t = tx(l);
        return (
          <>
            <div className="dk-top">
              <p className="dk-eyebrow">{t("01 — A cadeia", "01 — The chain")}</p>
              <h2 className="dk-h2">{t("Toda a cadeia, num objeto só.", "The whole chain, in one object.")}</h2>
              <p className="dk-p dk-p--lead">
                {t("Todo arco passa pelo meio.", "Every arc runs through the middle.")}
              </p>
            </div>
            <div className="dk-bottom dk-ring-slide dk-ring-slide--map">
              <Ring locale={l} />
              <div className="dk-ring-slide__meta">
                <div className="dk-row dk-row--3">
                  <div className="dk-metric dk-metric--flat">
                    <span className="dk-metric__v">7</span>
                    <span className="dk-metric__note">{t("camadas", "layers")}</span>
                  </div>
                  <div className="dk-metric dk-metric--flat">
                    <span className="dk-metric__v">50</span>
                    <span className="dk-metric__note">{t("públicos", "audiences")}</span>
                  </div>
                  <div className="dk-metric dk-metric--flat">
                    <span className="dk-metric__v">1</span>
                    <span className="dk-metric__note">{t("centro", "centre")}</span>
                  </div>
                </div>
                <div className="dk-ring-chips__col">
                  <span className="dk-eyebrow">
                    {t("02 · Prova — o centro", "02 · Proof — the centre")}
                  </span>
                  <Resumo locale={l} id="prova" />
                </div>
              </div>
            </div>
          </>
        );
      },
    },

    /* ── 03 · gera ────────────────────────────────────────────────────── */
    {
      id: "gera",
      title: { pt: "02 · Quem gera", en: "02 · Who generates" },
      render: (l) => {
        const t = tx(l);
        return (
          <>
            <div className="dk-top">
              <p className="dk-eyebrow">{t("02 — Quem gera", "02 — Who generates")}</p>
              <h2 className="dk-h2">{t("O lado da oferta.", "The supply side.")}</h2>
            </div>
            <div className="dk-bottom dk-ring-slide dk-ring-slide--split">
              <Ring locale={l} lit={["origem"]} />
              <div className="dk-ring-slide__side">
                <ChipCols
                  locale={l}
                  cols={[{ label: { pt: "01 · Origem", en: "01 · Origin" }, id: "origem" }]}
                />
              </div>
            </div>
          </>
        );
      },
    },

    /* ── 04 · paga ────────────────────────────────────────────────────── */
    {
      id: "paga",
      title: { pt: "03 · Quem paga", en: "03 · Who pays" },
      render: (l) => {
        const t = tx(l);
        return (
          <>
            <div className="dk-top">
              <p className="dk-eyebrow">{t("03 — Quem paga", "03 — Who pays")}</p>
              <h2 className="dk-h2">{t("Quem compra e quem financia.", "Who buys and who funds.")}</h2>
            </div>
            <div className="dk-bottom dk-ring-slide dk-ring-slide--split">
              <Ring locale={l} lit={["mercado", "capital"]} />
              <div className="dk-ring-slide__side">
                <ChipCols
                  locale={l}
                  cols={[
                    {
                      label: { pt: "03 · Mercado", en: "03 · Market" },
                      id: "mercado",
                      accent: ["Comprador com mandato regulatório"],
                    },
                    {
                      label: { pt: "04 · Capital", en: "04 · Capital" },
                      id: "capital",
                      accent: ["Seguradora e resseguradora"],
                    },
                  ]}
                />
              </div>
            </div>
          </>
        );
      },
    },

    /* ── 05 · opera ───────────────────────────────────────────────────── */
    {
      id: "opera",
      title: { pt: "04 · Quem opera", en: "04 · Who operates" },
      render: (l) => {
        const t = tx(l);
        return (
          <>
            <div className="dk-top">
              <p className="dk-eyebrow">{t("04 — Quem opera", "04 — Who operates")}</p>
              <h2 className="dk-h2">{t("Os que atravessam tudo.", "The ones that cut across.")}</h2>
            </div>
            <div className="dk-bottom dk-ring-slide dk-ring-slide--split">
              <Ring locale={l} lit={["defi", "infra", "estado"]} />
              <div className="dk-ring-slide__side">
                <ChipCols
                  locale={l}
                  cols={[
                    {
                      label: { pt: "05 · DeFi", en: "05 · DeFi" },
                      id: "defi",
                      accent: ["Curador de risco"],
                    },
                    {
                      label: { pt: "06 · Infraestrutura", en: "06 · Infrastructure" },
                      id: "infra",
                      accent: ["Agente de IA autônomo (x402)"],
                    },
                    {
                      label: { pt: "07 · Estado", en: "07 · State" },
                      id: "estado",
                    },
                  ]}
                />
              </div>
            </div>
          </>
        );
      },
    },

    /* ── 06 · pedagio ─────────────────────────────────────────────────── */
    {
      id: "pedagio",
      title: { pt: "05 · A posição", en: "05 · The position" },
      skin: "dark",
      center: true,
      render: (l) => {
        const t = tx(l);
        return (
          <div className="dk-ring-pedagio">
            <div className="dk-ring-pedagio__head">
              <p className="dk-eyebrow">{t("05 — A posição", "05 — The position")}</p>
              <h1 className="dk-h1">{t("O novo tecnofeudalismo.", "The new technofeudalism.")}</h1>
            </div>
            <Ring locale={l} lit={[]} labels={false} />
            <div className="dk-ring-pedagio__lines">
              <p className="dk-ring-pedagio__line">
                {t(
                  "Tudo que for tokenizável vai precisar passar por nós.",
                  "Everything tokenizable will have to pass through us.",
                )}
              </p>
              <p className="dk-ring-pedagio__line">
                {t("Não somos um elo da cadeia.", "We are not a link in the chain.")}
              </p>
              <p className="dk-ring-pedagio__line dk-ring-pedagio__line--accent">
                {t("Somos o pedágio dela.", "We are its toll gate.")}
              </p>
            </div>
            <p className="dk-src">
              {t(
                "Lastre Research · Mapa de públicos e arquitetura de tokenização, v1.1, 29.08.2026. Material interno. Não é oferta, promessa de retorno ou recomendação de investimento.",
                "Lastre Research · Map of audiences and tokenisation architecture, v1.1, 29.08.2026. Internal material. Not an offer, a promise of return, or investment advice.",
              )}
            </p>
          </div>
        );
      },
    },
  ],
};
