import { Figure, SealCard } from "../Motion";
import {
  Bars,
  Chain,
  Converge,
  Ratio,
  Scale,
  Stack,
  TimeRail,
  Watermark,
} from "../figures/substrates";
import { tx, type Deck } from "../types";
import type { Locale } from "../../i18n/translations";

/* The five movements of the document. They name the rail on the cover and
 * come back, fully lit, on the closing sheet. */
const TEMPOS = (l: Locale): string[] =>
  l === "pt"
    ? ["Problema", "O que é", "Como funciona", "O caso", "Quem paga"]
    : ["Problem", "What it is", "How it works", "The case", "Who pays"];

const RAIL: { pt: string; en: string } = {
  pt: "Os cinco tempos do documento",
  en: "The five movements of the document",
};

const LAPTOP = "/media/decks/lastre-macbook.webp";

/* ─────────────────────────────────────────────────────────────────────────
 * 01 · Apresentação geral
 * ───────────────────────────────────────────────────────────────────────── */

export const geral: Deck = {
  slug: "lastre",
  index: "01",
  title: { pt: "Apresentação Geral", en: "General Overview" },
  summary: {
    pt: "O que a Lastre é, por que existe, como funciona e quem paga — com um caso real: 2,5 Mt de rejeito de cobre a 3 g/t de ouro.",
    en: "What Lastre is, why it exists, how it works and who pays — with a real case: 2.5 Mt of copper tailings at 3 g/t gold.",
  },
  audience: { pt: "Sócios e convidados", en: "Partners and guests" },
  updated: "02.09.2026",
  slides: [
    /* ── capa ─────────────────────────────────────────────────────────── */
    {
      id: "capa",
      title: { pt: "Capa", en: "Cover" },
      skin: "wave",
      render: (l) => {
        const t = tx(l);
        return (
          <>
            <div className="dk-row dk-row--wide">
              <div className="dk-top">
                <h1 className="dk-h1">
                  {t("Prova antes", "Proof before")}
                  <br />
                  {t("do valor.", "value.")}
                </h1>
                <p className="dk-eyebrow">
                  {t("Documento de trabalho · 02 setembro 2026", "Working document · 02 September 2026")}
                </p>
              </div>
              <SealCard locale={l} />
            </div>
            <div className="dk-bottom">
              <p className="dk-p dk-p--lead">
                {t(
                  "Hoje se tokeniza sobre origem declarada. A Lastre prova que a leitura aconteceu.",
                  "Today everything is tokenised on a declared origin. Lastre proves the reading happened.",
                )}
              </p>
              <div className="dk-tempo-rail">
                <TimeRail locale={l} title={RAIL} steps={TEMPOS(l)} lit={1} />
              </div>
            </div>
          </>
        );
      },
    },

    /* ── 01 · o problema ──────────────────────────────────────────────── */
    {
      id: "problema",
      title: { pt: "01 · O problema", en: "01 · The problem" },
      render: (l) => {
        const t = tx(l);
        return (
          <>
            <div className="dk-top">
              <p className="dk-eyebrow">{t("01 — O problema", "01 — The problem")}</p>
              <h2 className="dk-h1">
                {t("O mercado não verifica a origem.", "The market does not verify origin.")}{" "}
                <span className="dk-strike">{t("Ele aceita.", "It accepts it.")}</span>
              </h2>
            </div>
            <div className="dk-bottom">
              <Chain
                locale={l}
                title={{
                  pt: "A cadeia do mercado: a leitura acontece, a declaração não é verificada, o token é emitido assim mesmo.",
                  en: "The market chain: the reading happens, the claim is never verified, the token is issued anyway.",
                }}
                links={[
                  { n: "01", label: t("leitura", "reading") },
                  { n: "02", label: t("declaração", "claim"), missing: true },
                  { n: "03", label: t("token", "token") },
                ]}
              />
              <div className="dk-row dk-row--3">
                <div className="dk-metric dk-metric--flat">
                  <span className="dk-eyebrow">{t("Toucan · carbono", "Toucan · carbon")}</span>
                  <Figure to={28} locale={l} suffix="%" />
                  <p className="dk-metric__note">
                    {t(
                      "Créditos migrados vindos de projetos zumbis.",
                      "Migrated credits coming from zombie projects.",
                    )}
                  </p>
                </div>
                <div className="dk-metric dk-metric--flat">
                  <span className="dk-eyebrow">{t("Ouro brasileiro", "Brazilian gold")}</span>
                  <Figure to={229} locale={l} suffix=" t" />
                  <p className="dk-metric__note">
                    {t(
                      "Toneladas com indício de ilegalidade entre 2015 e 2020 — cerca de metade da produção.",
                      "Tonnes with signs of illegality between 2015 and 2020 — about half of output.",
                    )}
                  </p>
                </div>
                <div className="dk-metric dk-metric--flat">
                  <span className="dk-eyebrow">{t("Seguro", "Insurance")}</span>
                  <Figure to={19} locale={l} />
                  <p className="dk-metric__note">
                    {t(
                      "Apólices da Swiss Re em propriedades embargadas por desmatamento ilegal.",
                      "Swiss Re policies on properties embargoed for illegal deforestation.",
                    )}
                  </p>
                </div>
              </div>
              <p className="dk-src">
                {t(
                  "Fontes: Artigo 6 / migração Toucan · Instituto Escolhas, Raio X do Ouro, 2022 · Repórter Brasil, 2023–2025.",
                  "Sources: Article 6 / Toucan migration · Instituto Escolhas, Raio X do Ouro, 2022 · Repórter Brasil, 2023–2025.",
                )}
              </p>
            </div>
          </>
        );
      },
    },

    /* ── 02 · o que é ─────────────────────────────────────────────────── */
    {
      id: "o-que-e",
      title: { pt: "02 · O que a Lastre é", en: "02 · What Lastre is" },
      skin: "dark",
      render: (l) => {
        const t = tx(l);
        return (
          <>
            <div className="dk-top">
              <p className="dk-eyebrow">{t("02 — O que a Lastre é", "02 — What Lastre is")}</p>
              <h2 className="dk-h1">
                {t("A prova de que a leitura", "Proof that the reading")}
                <br />
                {t("física ", "physically ")}
                <span className="dk-accent">{t("aconteceu.", "happened.")}</span>
              </h2>
            </div>
            <div className="dk-bottom">
              <div className="dk-row dk-row--wide">
                <div className="dk-kv">
                  <div className="dk-kv__row">
                    <span className="dk-kv__k">{t("O que sela", "What it seals")}</span>
                    <span className="dk-kv__v">
                      {t(
                        "Peso, teor, ensaio, coordenada, operador, horário. A leitura — não a declaração.",
                        "Weight, grade, assay, coordinate, operator, time. The reading — not the claim.",
                      )}
                    </span>
                  </div>
                  <div className="dk-kv__row">
                    <span className="dk-kv__k">{t("Como sela", "How it seals")}</span>
                    <span className="dk-kv__v">
                      {t(
                        "SHA-256 canônico, calculado offline no ponto de leitura. Sem nuvem, sem modelo.",
                        "A canonical SHA-256, computed offline at the point of reading. No cloud, no model.",
                      )}
                    </span>
                  </div>
                  <div className="dk-kv__row">
                    <span className="dk-kv__k">{t("Onde julga", "Where it judges")}</span>
                    <span className="dk-kv__v">
                      {t(
                        "Casper. O veredito é permanente nos dois sentidos.",
                        "Casper. The verdict is permanent both ways.",
                      )}
                    </span>
                  </div>
                </div>

                <div className="dk-row dk-row--2">
                  <div className="dk-panel">
                    <div className="dk-label">
                      <span>Valid</span>
                    </div>
                    <p className="dk-p">
                      {t(
                        "O trilho abre. Registro, circulação e crédito passam a existir.",
                        "The rail opens. Registry, circulation and credit come into existence.",
                      )}
                    </p>
                  </div>
                  <div className="dk-panel">
                    <div className="dk-label">
                      <span>Invalid</span>
                    </div>
                    <p className="dk-p">
                      {t(
                        "O trilho fecha. A recusa também é prova — é o que impede o selo de virar lavagem.",
                        "The rail closes. The refusal is proof too — it stops the seal becoming laundering.",
                      )}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </>
        );
      },
    },

    /* ── o produto: o MacBook como peça de colagem ────────────────────── */
    {
      id: "produto",
      title: { pt: "O que já existe", en: "What already exists" },
      skin: "dark",
      render: (l) => {
        const t = tx(l);
        const cards: Array<[string, string]> = [
          [t("Selo offline", "Offline seal"), "SHA-256 · determinístico"],
          [t("Veredito on-chain", "On-chain verdict"), "Casper Testnet"],
          [t("Invalid registrado", "Invalid recorded"), t("permanente", "permanent")],
          [t("Demo de fraude", "Tamper demo"), t("aberta ao público", "open to the public")],
        ];
        return (
          <>
            <div className="dk-shot dk-shot--laptop">
              <img
                src={LAPTOP}
                alt={t("MacBook exibindo o site da Lastre.", "A MacBook showing the Lastre site.")}
                loading="eager"
                decoding="async"
              />
            </div>
            <div className="dk-top dk-half-l">
              <p className="dk-eyebrow">{t("Não é slide — está no ar", "Not a slide — it is live")}</p>
              <h2 className="dk-h1">{t("O selo já roda em testnet.", "The seal already runs on testnet.")}</h2>
              <p className="dk-p">
                {t(
                  "Selo determinístico offline, veredito ancorado na Casper e a demonstração de fraude aberta ao público. O que falta não é engenharia — é a primeira leitura real de campo.",
                  "Deterministic offline seal, verdict anchored on Casper, and the tamper demo open to the public. What is missing is not engineering — it is the first real field reading.",
                )}
              </p>
            </div>
            <div className="dk-bottom dk-half-l">
              <div className="dk-cards">
                {cards.map(([k, v]) => (
                  <div key={k}>
                    <span className="dk-cards__k">{k}</span>
                    <span className="dk-cards__v">{v}</span>
                  </div>
                ))}
              </div>
            </div>
          </>
        );
      },
    },

    /* ── a frase ──────────────────────────────────────────────────────── */
    {
      id: "frase",
      title: { pt: "A diferenciação", en: "The differentiation" },
      skin: "mint",
      center: true,
      render: (l) => {
        const t = tx(l);
        return (
          <div className="dk-top" style={{ maxWidth: "42ch", display: "grid", gap: "1.2rem" }}>
            <Watermark />
            <p className="dk-eyebrow">{t("A frase que nos separa", "The line that separates us")}</p>
            <h2 className="dk-h2" style={{ color: "var(--dk-fg-2)" }}>
              {t("A concorrência prova o que o fornecedor ", "The competition proves what the supplier ")}
              <span className="dk-strike--draw">{t("declarou.", "declared.")}</span>
            </h2>
            <h2 className="dk-h2">
              {t("A Lastre prova que a leitura aconteceu.", "Lastre proves the reading happened.")}
            </h2>
          </div>
        );
      },
    },

    /* ── 03 · como funciona ───────────────────────────────────────────── */
    {
      id: "como-funciona",
      title: { pt: "03 · Como funciona", en: "03 · How it works" },
      render: (l) => {
        const t = tx(l);
        return (
          <>
            <div className="dk-top">
              <p className="dk-eyebrow">{t("03 — Como funciona", "03 — How it works")}</p>
              <h2 className="dk-h1">
                {t("Quatro andares.", "Four floors.")}
                <br />
                {t("Um sobe de cada vez.", "One rises at a time.")}
              </h2>
            </div>
            <div className="dk-bottom">
              <div className="dk-row dk-row--stack dk-row--top">
                <Stack
                  locale={l}
                  title={{
                    pt: "Quatro lajes. O andar 0 é a base larga; o andar 3 está deslocado e tracejado — entidade separada.",
                    en: "Four slabs. Floor 0 is the broad base; floor 3 sits offset and dashed — a separate entity.",
                  }}
                  base={t("o único que precisa existir", "the only one that must exist")}
                />
                <div className="dk-floors-col">
                <div className="dk-floor dk-floor--0">
                  <span className="dk-eyebrow">{t("Andar 0", "Floor 0")}</span>
                  <div className="dk-floor__h">
                    <h3 className="dk-h3">{t("Prova", "Proof")}</h3>
                    <span className="dk-tag dk-tag--accent">{t("é o produto", "the product")}</span>
                  </div>
                  <p className="dk-p">
                    {t(
                      "O selo. Receita por verificação. O único andar que precisa existir.",
                      "The seal. Revenue per verification. The only floor that must exist.",
                    )}
                  </p>
                </div>
                <div className="dk-floor dk-floor--1">
                  <span className="dk-eyebrow">{t("Andar 1", "Floor 1")}</span>
                  <div className="dk-floor__h">
                    <h3 className="dk-h3">{t("Registro", "Registry")}</h3>
                    <span className="dk-tag">{t("não negociável", "non-tradable")}</span>
                  </div>
                  <p className="dk-p">
                    {t(
                      "NFT de área ou título e a cesta do ativo. Identidade e colateral — não circula.",
                      "An NFT of the area or title, and the asset basket. Identity and collateral — it does not circulate.",
                    )}
                  </p>
                </div>
                <div className="dk-floor dk-floor--2">
                  <span className="dk-eyebrow">{t("Andar 2", "Floor 2")}</span>
                  <div className="dk-floor__h">
                    <h3 className="dk-h3">{t("Circulação", "Circulation")}</h3>
                    <span className="dk-tag">{t("exige custodiante", "needs a custodian")}</span>
                  </div>
                  <p className="dk-p">
                    {t(
                      "Token de lote por série, custodiado e redimível pelo físico.",
                      "A per-series lot token, custodied and redeemable for the physical.",
                    )}
                  </p>
                </div>
                <div className="dk-floor dk-floor--3">
                  <span className="dk-eyebrow">{t("Andar 3", "Floor 3")}</span>
                  <div className="dk-floor__h">
                    <h3 className="dk-h3">{t("Capital", "Capital")}</h3>
                    <span className="dk-tag dk-tag--neg">{t("entidade separada", "separate entity")}</span>
                  </div>
                  <p className="dk-p">
                    {t(
                      "Royalty e pré-pagamento em SPV. Entidade separada da prova.",
                      "Royalty and prepayment in an SPV. An entity separate from proof.",
                    )}
                  </p>
                </div>
                </div>
              </div>
              <p className="dk-src">
                {t(
                  "Regra de ouro. Dois lotes só compartilham um token se compartilharem origem provada, período e especificação. Fungibilizar “Token Ouro” apaga a origem — que é o produto.",
                  "Golden rule. Two lots share a token only if they share proven origin, period and specification. A generic “Gold Token” erases origin — which is the product.",
                )}
              </p>
            </div>
          </>
        );
      },
    },

    /* ── 04 · o caso ──────────────────────────────────────────────────── */
    {
      id: "caso",
      title: { pt: "04 · O caso do rejeito", en: "04 · The tailings case" },
      render: (l) => {
        const t = tx(l);
        return (
          <>
            <div className="dk-top">
              <p className="dk-eyebrow">{t("04 — O caso: a S.A. do rejeito", "04 — The case: the tailings company")}</p>
              <h2 className="dk-h1">
                {t("2,5 milhões de toneladas de rejeito.", "2.5 million tonnes of tailings.")}{" "}
                <span className="dk-accent">{t("3\u00a0g de ouro por tonelada.", "3\u00a0g of gold per tonne.")}</span>
              </h2>
            </div>
            <div className="dk-bottom">
              <div className="dk-row dk-row--wide">
                <div className="dk-calc">
                  <div className="dk-calc__row">
                    <span className="dk-calc__i">01</span>
                    <span className="dk-calc__k">{t("Massa de rejeito", "Tailings mass")}</span>
                    <span className="dk-calc__v">2.500.000 t</span>
                  </div>
                  <div className="dk-calc__row">
                    <span className="dk-calc__i">02</span>
                    <span className="dk-calc__k">{t("Teor de ouro", "Gold grade")}</span>
                    <span className="dk-calc__v">3,0 g/t</span>
                  </div>
                  <div className="dk-calc__row">
                    <span className="dk-calc__i">03</span>
                    <span className="dk-calc__k">{t("Ouro contido", "Contained gold")}</span>
                    <span className="dk-calc__v">7,50 t · 241.134 oz</span>
                  </div>
                  <div className="dk-calc__row">
                    <span className="dk-calc__i">04</span>
                    <span className="dk-calc__k">{t("Ouro à vista · 02.09.2026", "Gold spot · 02.09.2026")}</span>
                    <span className="dk-calc__v">US$ 4.334 / oz</span>
                  </div>
                  <div className="dk-calc__row dk-calc__row--sum">
                    <span className="dk-calc__i">05</span>
                    <span className="dk-calc__k">{t("Valor do metal contido", "Contained metal value")}</span>
                    <span className="dk-calc__v">US$ 1,045 bi</span>
                  </div>
                </div>

                <div className="dk-top">
                  <p className="dk-p dk-p--lead">
                    {t(
                      "Um passivo ambiental já escavado, moído e pago. O ouro está lá. O que falta não é geologia — é provar que o teor foi lido, e não afirmado.",
                      "An environmental liability already dug, milled and paid for. The gold is there. What is missing is not geology — it is proving the grade was read, not asserted.",
                    )}
                  </p>
                  <p className="dk-src">
                    {t(
                      "Metal contido não é receita: rejeito exige recuperação metalúrgica e nenhum projeto entrega 100%. A faixa honesta está na próxima tela. Cobre residual não quantificado.",
                      "Contained metal is not revenue: tailings need metallurgical recovery and no project delivers 100%. The honest range is on the next screen. Residual copper is not quantified.",
                    )}
                  </p>
                </div>
              </div>
              <Ratio
                locale={l}
                title={{
                  pt: "A massa de rejeito contra o ouro contido, na mesma escala.",
                  en: "The tailings mass against the contained gold, on one scale.",
                }}
                mass={t("2.500.000 t de rejeito", "2,500,000 t of tailings")}
                metal={t("7,5 t de ouro", "7.5 t of gold")}
                share={t("0,0003% da massa", "0.0003% of the mass")}
              />
            </div>
          </>
        );
      },
    },

    /* ── a faixa ──────────────────────────────────────────────────────── */
    {
      id: "faixa",
      title: { pt: "A faixa honesta", en: "The honest range" },
      skin: "dark",
      render: (l) => {
        const t = tx(l);
        return (
          <>
            <div className="dk-top">
              <p className="dk-eyebrow">{t("04 — A faixa honesta", "04 — The honest range")}</p>
              <h2 className="dk-h1">{t("Recuperação metalúrgica.", "Metallurgical recovery.")}</h2>
            </div>
            <div className="dk-bottom">
              <Bars
                locale={l}
                title={{
                  pt: "O trilho do metal contido, com as três marcas de recuperação.",
                  en: "The rail of contained metal, with the three recovery marks.",
                }}
                marks={[
                  { pct: 0.5, value: "50", label: t("3,75 t", "3.75 t"), side: "left" },
                  { pct: 0.65, value: "65", label: t("4,88 t", "4.88 t") },
                  { pct: 0.8, value: "80", label: t("6,00 t", "6.00 t") },
                ]}
              />
              <div className="dk-row dk-row--3">
                <div className="dk-panel">
                  <div className="dk-label">
                    <span>{t("Recuperação 50%", "50% recovery")}</span>
                  </div>
<Figure to={522} locale={l} prefix="US$ " suffix=" mi" />
                  <p className="dk-metric__note">{t("3,75 t recuperadas", "3.75 t recovered")}</p>
                </div>
                <div className="dk-panel">
                  <div className="dk-label">
                    <span>{t("Recuperação 65% · central", "65% recovery · central")}</span>
                  </div>
<Figure to={679} locale={l} prefix="US$ " suffix=" mi" />
                  <p className="dk-metric__note">{t("4,88 t recuperadas", "4.88 t recovered")}</p>
                </div>
                <div className="dk-panel">
                  <div className="dk-label">
                    <span>{t("Recuperação 80%", "80% recovery")}</span>
                  </div>
<Figure to={836} locale={l} prefix="US$ " suffix=" mi" />
                  <p className="dk-metric__note">{t("6,00 t recuperadas", "6.00 t recovered")}</p>
                </div>
              </div>
            </div>
          </>
        );
      },
    },

    /* ── o que a Lastre acrescenta ────────────────────────────────────── */
    {
      id: "acrescenta",
      title: { pt: "O que a Lastre acrescenta", en: "What Lastre adds" },
      render: (l) => {
        const t = tx(l);
        return (
          <>
            <div className="dk-top">
              <p className="dk-eyebrow">{t("04 — O que a Lastre acrescenta", "04 — What Lastre adds")}</p>
              <h2 className="dk-h1">{t("A pilha não muda. O preço dela, sim.", "The pile does not change. Its price does.")}</h2>
            </div>
            <div className="dk-bottom">
              <div className="dk-row dk-row--wide">
                <div className="dk-kv">
                  <div className="dk-kv__row">
                    <span className="dk-kv__k">{t("Prêmio de origem", "Origin premium")}</span>
                    <span className="dk-kv__v">
                      {t(
                        "US$ 2.000/kg (Fairtrade) a US$ 4.000/kg (Fairmined). Sobre 4,88 t: US$ 9,8 a 19,5 mi. Nenhum dos dois opera no Brasil hoje.",
                        "US$ 2,000/kg (Fairtrade) to US$ 4,000/kg (Fairmined). On 4.88 t: US$ 9.8m to 19.5m. Neither scheme operates in Brazil today.",
                      )}
                    </span>
                  </div>
                  <div className="dk-kv__row">
                    <span className="dk-kv__k">{t("Acesso a seguro", "Insurance access")}</span>
                    <span className="dk-kv__v">
                      {t(
                        "Barragem é quase inassegurável. O ganho não é prêmio mais barato — é ser subscrito.",
                        "A tailings dam is close to uninsurable. The gain is not a cheaper premium — it is being underwritten.",
                      )}
                    </span>
                  </div>
                  <div className="dk-kv__row">
                    <span className="dk-kv__k">{t("Âncora de preço", "Price anchor")}</span>
                    <span className="dk-kv__v">
                      {t(
                        "PL 3025/23: R$ 5,00 por grama marcada. Sobre 4,88 t, o Estado precificaria R$ 24,4 mi.",
                        "Bill 3025/23: R$ 5.00 per marked gram. On 4.88 t, the State would price it at R$ 24.4m.",
                      )}
                    </span>
                  </div>
                </div>

                <div className="dk-top">
                  <div className="dk-label">
                    <span>{t("O que este caso decide para nós", "What this case decides for us")}</span>
                  </div>
                  <p className="dk-p">
                    {t(
                      "O benchmark de primeira milha — iTSCi, US$ 130 a 180 por tonelada — quebrou por caro. A 2,5 Mt custaria mais do que o ouro vale.",
                      "The first-mile benchmark — iTSCi, US$ 130 to 180 per tonne — broke because it was too expensive. At 2.5 Mt it would cost more than the gold is worth.",
                    )}
                  </p>
                  <p className="dk-p">
                    <b>
                      {t(
                        "A unidade de cobrança é a verificação ou o lote. Nunca a tonelada.",
                        "The charging unit is the verification or the lot. Never the tonne.",
                      )}
                    </b>
                  </p>
                  <p className="dk-src">
                    {t(
                      "Fontes: ouro à vista US$ 4.334/oz, 02.09.2026 · tabelas Fairtrade e Fairmined 2025/2026 · PL 3025/23 · iTSCi.",
                      "Sources: gold spot US$ 4,334/oz, 02.09.2026 · Fairtrade and Fairmined 2025/2026 schedules · Bill 3025/23 · iTSCi.",
                    )}
                  </p>
                </div>
              </div>
              <Scale
                locale={l}
                title={{
                  pt: "A régua do prêmio de origem, em dólares por quilo.",
                  en: "The origin-premium ruler, in dollars per kilo.",
                }}
                max={5000}
                step={1000}
                unit="US$/kg"
                stops={[
                  { at: 2000, value: "2k", label: "Fairtrade", sub: t("US$ 2.000/kg", "US$ 2,000/kg") },
                  { at: 4000, value: "4k", label: "Fairmined", sub: t("US$ 4.000/kg", "US$ 4,000/kg") },
                ]}
              />
            </div>
          </>
        );
      },
    },

    /* ── 05 · quem paga ───────────────────────────────────────────────── */
    {
      id: "quem-paga",
      title: { pt: "05 · Quem paga", en: "05 · Who pays" },
      skin: "dark",
      render: (l) => {
        const t = tx(l);
        return (
          <>
            <div className="dk-top">
              <p className="dk-eyebrow">{t("05 — Quem paga a Lastre", "05 — Who pays Lastre")}</p>
              <h2 className="dk-h1">
                {t("Dois lados pagam.", "Two sides pay.")}
                <br />
                {t("Nenhum paga por token.", "Neither pays for a token.")}
              </h2>
            </div>
            <div className="dk-bottom">
              <Converge
                locale={l}
                title={{
                  pt: "Dois lados entram no mesmo ponto, e uma saída fina paga antes do mandato.",
                  en: "Two sides enter the same point, and a thin way out pays before the mandate.",
                }}
                a={t("certificado", "certified")}
                b={t("produtor", "producer")}
                out={t("pré-2027", "pre-2027")}
              />
              <div className="dk-row dk-row--3 dk-row--top dk-steps">
                <div className="dk-step">
                  <span className="dk-step__n">01</span>
                  <span className="dk-step__k">{t("Usuário certificado", "Certified user")}</span>
                  <p className="dk-p dk-step__b">
                    {t(
                      "Assinatura por faixa. A faixa define o escopo do catálogo e o nível de garantia — colateral e escrow nas faixas superiores.",
                      "Subscription by tier. The tier sets the catalogue scope and the level of guarantee — collateral and escrow in the upper tiers.",
                    )}
                  </p>
                </div>
                <div className="dk-step">
                  <span className="dk-step__n">02</span>
                  <span className="dk-step__k">{t("Produtor / mineradora", "Producer / miner")}</span>
                  <p className="dk-p dk-step__b">
                    {t(
                      "Paga por alcance: quantos e quais certificados enxergam seus lotes. A prova é a entrada; o alcance é a distribuição.",
                      "Pays by reach: how many and which certified participants see their lots. Proof is entry; reach is distribution.",
                    )}
                  </p>
                </div>
                <div className="dk-step">
                  <span className="dk-step__n">03</span>
                  <span className="dk-step__k">{t("Quem paga antes de 2027", "Who pays before 2027")}</span>
                  <p className="dk-p dk-step__b">
                    {t(
                      "Seguradora, auditor e agente autônomo pagam por consulta. O mandato regulatório só obriga a partir de 18.02.2027 — precisamos de caixa antes.",
                      "Insurer, auditor and autonomous agent pay per query. The regulatory mandate only binds from 18.02.2027 — we need cash before that.",
                    )}
                  </p>
                </div>
              </div>
            </div>
          </>
        );
      },
    },

    /* ── onde a empresa vive ──────────────────────────────────────────── */
    {
      id: "onde-vive",
      title: { pt: "Onde a empresa vive", en: "Where the company lives" },
      render: (l) => {
        const t = tx(l);
        return (
          <>
            <div className="dk-top">
              <p className="dk-eyebrow">{t("05 — Estrutura e ordem", "05 — Structure and order")}</p>
              <h2 className="dk-h1">{t("Fora do Brasil, e nesta ordem.", "Outside Brazil, and in this order.")}</h2>
            </div>
            <div className="dk-bottom">
              <div className="dk-row dk-row--2">
                <div className="dk-kv">
                  <div className="dk-kv__row">
                    <span className="dk-kv__k">{t("Entidade", "Entity")}</span>
                    <span className="dk-kv__v">
                      {t(
                        "Nasce e opera fora do Brasil. A camada de capital fica em entidade separada da camada de prova.",
                        "Born and operating outside Brazil. The capital layer sits in an entity separate from the proof layer.",
                      )}
                    </span>
                  </div>
                  <div className="dk-kv__row">
                    <span className="dk-kv__k">{t("Liquidação", "Settlement")}</span>
                    <span className="dk-kv__v">
                      {t(
                        "O produtor brasileiro mantém conta própria no exterior e recebe em USDT. O reporte fiscal dele é dele.",
                        "The Brazilian producer keeps their own offshore account and is paid in USDT. Their tax reporting is theirs.",
                      )}
                    </span>
                  </div>
                  <div className="dk-kv__row">
                    <span className="dk-kv__k">{t("Status", "Status")}</span>
                    <span className="dk-kv__v">
                      <span className="dk-tag dk-tag--neg" style={{ marginRight: "0.5rem" }}>
                        {t("requer parecer", "opinion required")}
                      </span>
                      {t(
                        "Desenhada, não validada por tributarista nas duas jurisdições. Não tratar como decidida.",
                        "Designed, not validated by tax counsel in either jurisdiction. Do not treat it as settled.",
                      )}
                    </span>
                  </div>
                </div>

                <div className="dk-top">
                  <div className="dk-label">
                    <span>{t("O que precisa ser decidido", "What has to be decided")}</span>
                  </div>
                  <div className="dk-calc">
                    <div className="dk-calc__row">
                      <span className="dk-calc__i">01</span>
                      <span className="dk-calc__k">
                        {t("Perguntar a um armazém geral sobre depósito com trilha digital", "Ask a bonded warehouse about a deposit with a digital trail")}
                      </span>
                      <span className="dk-calc__v">{t("1 semana", "1 week")}</span>
                    </div>
                    <div className="dk-calc__row">
                      <span className="dk-calc__i">02</span>
                      <span className="dk-calc__k">
                        {t("Escrever o threat model e o que a Lastre não sela", "Write the threat model and what Lastre does not seal")}
                      </span>
                      <span className="dk-calc__v">{t("interno", "internal")}</span>
                    </div>
                    <div className="dk-calc__row">
                      <span className="dk-calc__i">03</span>
                      <span className="dk-calc__k">
                        {t("Fixar a unidade de cobrança e levar preço a seguradora ou auditor", "Fix the charging unit and take a price to an insurer or auditor")}
                      </span>
                      <span className="dk-calc__v">{t("em aberto", "open")}</span>
                    </div>
                    <div className="dk-calc__row dk-calc__row--sum">
                      <span className="dk-calc__i">04</span>
                      <span className="dk-calc__k">{t("Registrar a primeira leitura real", "Record the first real reading")}</span>
                      <span className="dk-calc__v">{t("irrecuperável", "unrecoverable")}</span>
                    </div>
                  </div>
                  <p className="dk-src">
                    {t(
                      "Histórico de catálogo não se compra depois. Todo mês sem leitura real é um mês que nenhum aporte recompra.",
                      "Catalogue history cannot be bought later. Every month without a real reading is a month no funding round buys back.",
                    )}
                  </p>
                </div>
              </div>
              <Chain
                locale={l}
                title={{
                  pt: "A ordem das quatro decisões. A quarta não se recupera depois.",
                  en: "The order of the four decisions. The fourth cannot be recovered later.",
                }}
                links={[
                  { n: "01", label: t("armazém", "warehouse") },
                  { n: "02", label: t("threat model", "threat model") },
                  { n: "03", label: t("preço", "price") },
                  { n: "04", label: t("irrecuperável", "unrecoverable"), missing: true },
                ]}
              />
            </div>
          </>
        );
      },
    },

    /* ── fecho ────────────────────────────────────────────────────────── */
    {
      id: "fecho",
      title: { pt: "Fecho", en: "Closing" },
      skin: "wave",
      render: (l) => {
        const t = tx(l);
        return (
          <>
            <div className="dk-top">
              <h2 className="dk-h1">
                {t("A prova é o produto.", "Proof is the product.")}
                <br />
                {t("O mercado é a consequência.", "The market is the consequence.")}
              </h2>
            </div>
            <div className="dk-bottom">
              <div className="dk-tempo-rail dk-tempo-rail--full">
                <TimeRail locale={l} title={RAIL} steps={TEMPOS(l)} lit={5} />
              </div>
              <p className="dk-src">
                {t(
                  "Material interno. Não é oferta, promessa de retorno ou recomendação de investimento. Cifras de terceiros trazem fonte e data na tela em que aparecem; as cifras do rejeito são cálculo sobre premissas declaradas, não projeção de receita.",
                  "Internal material. Not an offer, a promise of return, or investment advice. Third-party figures carry source and date on the screen where they appear; the tailings figures are a calculation on stated assumptions, not a revenue forecast.",
                )}
              </p>
            </div>
          </>
        );
      },
    },
  ],
};
