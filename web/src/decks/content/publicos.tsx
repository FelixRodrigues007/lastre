import { Ring3D } from "../Ring3D";
import { tx, type Deck } from "../types";
import type { Locale } from "../../i18n/translations";
import { camada, type CamadaId } from "./publicos-data";

/* ─────────────────────────────────────────────────────────────────────────
 * 02 · Mapa de públicos — 6 telas, um anel
 *
 * A cadeia inteira vive num objeto só. O anel repete slide a slide, mudando
 * apenas quais setores estão acesos; o centro nunca apaga, porque é a tese.
 * ───────────────────────────────────────────────────────────────────────── */

function Lista({
  locale,
  items,
  accent,
}: {
  locale: Locale;
  items: { pt: string; en: string }[];
  accent?: string[];
}) {
  return (
    <p className="dk-ring-lista">
      {items.map((p, i) => {
        const label = locale === "pt" ? p.pt : p.en;
        const isAccent = accent?.includes(p.pt) ?? false;
        const suffix = i < items.length - 1 ? ", " : ".";
        return (
          <span key={p.pt}>
            {isAccent ? <b className="dk-ring-lista__hi">{label}</b> : label}
            {suffix}
          </span>
        );
      })}
    </p>
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

/**
 * O número que dimensiona a camada. Sempre com fonte na tela — cifra de
 * terceiro sem procedência não entra em deck.
 */
function BigNum({ v, unit, k }: { v: string; unit?: string; k: string }) {
  return (
    <div className="dk-bignum">
      <span className="dk-bignum__v">
        {v}
        {unit && <small>{unit}</small>}
      </span>
      <span className="dk-bignum__k">{k}</span>
    </div>
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
          <Lista locale={locale} items={camada(col.id).publicos} accent={col.accent} />
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
      center: true,
      render: (l) => {
        const t = tx(l);
        const cards = [
          {
            k: t("Mapeamos a cadeia", "We mapped the chain"),
            v: t(
              "Sete camadas, cinquenta públicos e oito atores de Estado. Nenhum elo ficou de fora do desenho.",
              "Seven layers, fifty audiences and eight State actors. No link was left out of the map.",
            ),
          },
          {
            k: t("Prova antes do valor", "Proof before value"),
            v: t(
              "O valor só anda se a camada 02 disser que o fato existe. A Lastre é o portão, não o percurso.",
              "Value only moves if layer 02 says the fact exists. Lastre is the gate, not the route.",
            ),
          },
          {
            k: t("Todo arco passa pelo meio", "Every arc runs through the middle"),
            v: t(
              "Origem, mercado, capital e DeFi não se ligam entre si. Ligam-se pelo centro.",
              "Origin, market, capital and DeFi do not connect to each other. They connect through the centre.",
            ),
          },
        ];
        return (
          <div className="dk-cover">
            <div className="dk-cover__head">
              <p className="dk-eyebrow">
                {t("Mapa de públicos · 02 setembro 2026", "Map of audiences · 02 September 2026")}
              </p>
              <h1 className="dk-h1">{t("O mapa da cadeia.", "The map of the chain.")}</h1>
              <p className="dk-cover__sub">
                {t(
                  "Sete camadas, cinquenta públicos — e um ponto por onde tudo passa.",
                  "Seven layers, fifty audiences — and one point everything passes through.",
                )}
              </p>
            </div>

            <div className="dk-cover__stage">
              <Ring3D locale={l} />
              <aside className="dk-cover__note dk-cover__note--a">
                <b>{t("50 públicos", "50 audiences")}</b>
                <span>
                  {t(
                    "Mapeados em sete camadas, do buraco no chão ao token negociado.",
                    "Mapped across seven layers, from the hole in the ground to the traded token.",
                  )}
                </span>
              </aside>
              <aside className="dk-cover__note dk-cover__note--b">
                <b>{t("Camada 02 · a Lastre", "Layer 02 · Lastre")}</b>
                <span>
                  {t(
                    "Nada vira token sem alguém dizer que o fato existe.",
                    "Nothing becomes a token without someone saying the fact exists.",
                  )}
                </span>
              </aside>
            </div>

            <ul className="dk-cover__cards">
              {cards.map((c) => (
                <li key={c.k}>
                  <b>{c.k}</b>
                  <span>{c.v}</span>
                </li>
              ))}
            </ul>
          </div>
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
              <Ring3D locale={l} />
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
              <BigNum
                v={t("US$ 55,3", "US$ 55.3")}
                unit={t(" bi", "bn")}
                k={t(
                  "Faturamento da mineração brasileira em 2025 (IBRAM), convertido a R$ 5,40/US$.",
                  "Brazilian mining revenue in 2025 (IBRAM), converted at BRL 5.40/USD.",
                )}
              />
            </div>
            <div className="dk-bottom dk-ring-slide dk-ring-slide--split">
              <Ring3D locale={l} lit={["origem"]} />
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
              <BigNum
                v="US$ 722"
                unit={t(" mi", "m")}
                k={t(
                  "Captados sob a Resolução 88 da CVM em 2025, convertidos a R$ 5,40/US$.",
                  "Raised under CVM Resolution 88 in 2025, converted at BRL 5.40/USD.",
                )}
              />
            </div>
            <div className="dk-bottom dk-ring-slide dk-ring-slide--split">
              <Ring3D locale={l} lit={["mercado", "capital"]} />
              <div className="dk-ring-slide__side">
                <ChipCols
                  locale={l}
                  cols={[
                    {
                      label: { pt: "03 · Mercado", en: "03 · Market" },
                      id: "mercado",
                      accent: ["comprador obrigado por lei a saber a origem"],
                    },
                    {
                      label: { pt: "04 · Capital", en: "04 · Capital" },
                      id: "capital",
                      accent: ["seguradora"],
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
              <BigNum
                v="US$ 90,7"
                unit={t(" bi", "bn")}
                k={t(
                  "Ouro tokenizado, à vista, no 1º trimestre de 2026.",
                  "Tokenised gold, spot, in the first quarter of 2026.",
                )}
              />
            </div>
            <div className="dk-bottom dk-ring-slide dk-ring-slide--stack">
              <Ring3D locale={l} lit={["defi", "infra", "estado"]} />
              <div className="dk-ring-slide__side">
                <ChipCols
                  locale={l}
                  cols={[
                    {
                      label: { pt: "05 · DeFi", en: "05 · DeFi" },
                      id: "defi",
                      accent: ["quem define o risco aceito"],
                    },
                    {
                      label: { pt: "06 · Infraestrutura", en: "06 · Infrastructure" },
                      id: "infra",
                      accent: ["agente de IA que compra sozinho"],
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
            <Ring3D locale={l} lit={[]} labels={false} />
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
