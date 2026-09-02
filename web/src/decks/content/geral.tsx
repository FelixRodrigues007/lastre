import { tx, type Deck } from "../types";

const MOCK = "/media/decks/lastre-device-mock.png";

/* ─────────────────────────────────────────────────────────────────────────
 * 01 · A Lastre em cinco tempos
 * ───────────────────────────────────────────────────────────────────────── */

export const geral: Deck = {
  slug: "lastre",
  index: "01",
  title: { pt: "A Lastre em cinco tempos", en: "Lastre in five movements" },
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
            <div className="dk-bottom">
              <p className="dk-p dk-p--lead">
                {t(
                  "Tudo o que se tokeniza hoje é tokenizado sobre uma origem declarada. A Lastre existe para provar que a leitura física aconteceu.",
                  "Everything tokenised today is tokenised on top of a declared origin. Lastre exists to prove the physical reading happened.",
                )}
              </p>
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
              <div className="dk-row dk-row--3">
                <div className="dk-metric dk-metric--flat">
                  <span className="dk-eyebrow">{t("Toucan · carbono", "Toucan · carbon")}</span>
                  <span className="dk-metric__v">28<small>%</small></span>
                  <p className="dk-metric__note">
                    {t(
                      "dos 21,6 mi de créditos migrados vinham de projetos zumbis. Pool fungível apaga a origem e precifica pela média.",
                      "of the 21.6m migrated credits came from zombie projects. A fungible pool erases origin and prices to the average.",
                    )}
                  </p>
                </div>
                <div className="dk-metric dk-metric--flat">
                  <span className="dk-eyebrow">{t("Ouro brasileiro", "Brazilian gold")}</span>
                  <span className="dk-metric__v">229<small> t</small></span>
                  <p className="dk-metric__note">
                    {t(
                      "com indícios de ilegalidade entre 2015 e 2020 — cerca de metade da produção. Um terço por cinco DTVMs.",
                      "with signs of illegality between 2015 and 2020 — about half of output. A third through five brokers.",
                    )}
                  </p>
                </div>
                <div className="dk-metric dk-metric--flat">
                  <span className="dk-eyebrow">{t("Seguro", "Insurance")}</span>
                  <span className="dk-metric__v">19</span>
                  <p className="dk-metric__note">
                    {t(
                      "contratos mantidos pela Swiss Re em três propriedades embargadas por desmatamento ilegal. A triagem falha hoje.",
                      "policies kept by Swiss Re on three properties embargoed for illegal deforestation. Screening fails today.",
                    )}
                  </p>
                </div>
              </div>
              <p className="dk-p dk-p--fine">
                {t(
                  "Fontes: análises do Artigo 6 sobre a migração Toucan · Instituto Escolhas, Raio X do Ouro, 10.02.2022 · Repórter Brasil, 11/2023 e 03/2025.",
                  "Sources: Article 6 analyses of the Toucan migration · Instituto Escolhas, Raio X do Ouro, 10.02.2022 · Repórter Brasil, 11/2023 and 03/2025.",
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
                        "Peso, teor, ensaio, coordenada, operador e horário — a leitura, não a declaração.",
                        "Weight, grade, assay, coordinate, operator and time — the reading, not the claim.",
                      )}
                    </span>
                  </div>
                  <div className="dk-kv__row">
                    <span className="dk-kv__k">{t("Como sela", "How it seals")}</span>
                    <span className="dk-kv__v">
                      {t(
                        "SHA-256 canônico, calculado offline no ponto de leitura. Sem nuvem, sem relógio, sem modelo decidindo.",
                        "A canonical SHA-256, computed offline at the point of reading. No cloud, no clock, no model deciding.",
                      )}
                    </span>
                  </div>
                  <div className="dk-kv__row">
                    <span className="dk-kv__k">{t("Onde julga", "Where it judges")}</span>
                    <span className="dk-kv__v">
                      {t(
                        "Casper. O veredito é permanente nos dois sentidos — quase ninguém registra o “não”.",
                        "Casper. The verdict is permanent both ways — almost nobody records the “no”.",
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
                        "O trilho abre. Registro, circulação e crédito passam a existir para aquele lote.",
                        "The rail opens. Registry, circulation and credit come into existence for that lot.",
                      )}
                    </p>
                  </div>
                  <div className="dk-panel">
                    <div className="dk-label">
                      <span>Invalid</span>
                    </div>
                    <p className="dk-p">
                      {t(
                        "O trilho fecha. A recusa também é prova — é o que impede o selo de virar ferramenta de lavagem.",
                        "The rail closes. The refusal is proof too — it is what stops the seal becoming a laundering tool.",
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

    /* ── o produto (mock 3D) ──────────────────────────────────────────── */
    {
      id: "produto",
      title: { pt: "O produto", en: "The product" },
      center: true,
      render: (l) => {
        const t = tx(l);
        return (
          <div className="dk-row dk-row--media" style={{ alignSelf: "center" }}>
            <img
              className="dk-media"
              src={MOCK}
              alt={t(
                "MacBook e iPhone exibindo o site da Lastre.",
                "A MacBook and iPhone showing the Lastre site.",
              )}
              loading="eager"
              decoding="async"
            />
            <div className="dk-top">
              <p className="dk-eyebrow">{t("Não é slide — está no ar", "Not a slide — it is live")}</p>
              <h2 className="dk-h2">
                {t("O selo já roda em testnet.", "The seal already runs on testnet.")}
              </h2>
              <div className="dk-label" style={{ marginTop: "1.4rem" }}>
                <span>lastre.io</span>
              </div>
              <p className="dk-p">
                {t(
                  "Selo determinístico offline, veredito ancorado na Casper e a demonstração de fraude aberta ao público. O que falta não é engenharia — é a primeira leitura real de campo.",
                  "Deterministic offline seal, verdict anchored on Casper, and the tamper demo open to the public. What is missing is not engineering — it is the first real field reading.",
                )}
              </p>
            </div>
          </div>
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
          <div className="dk-top" style={{ maxWidth: "24ch" }}>
            <p className="dk-eyebrow">{t("A frase que nos separa", "The line that separates us")}</p>
            <h2 className="dk-h1">
              {t("A concorrência prova o que o fornecedor ", "The competition proves what the supplier ")}
              <span className="dk-strike">{t("declarou.", "declared.")}</span>{" "}
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
              <div className="dk-row dk-row--4 dk-row--top">
                <div className="dk-floor dk-floor--0">
                  <span className="dk-eyebrow">{t("Andar 0", "Floor 0")}</span>
                  <div className="dk-floor__h">
                    <h3 className="dk-h3">{t("Prova", "Proof")}</h3>
                    <span className="dk-tag dk-tag--accent">{t("é o produto", "the product")}</span>
                  </div>
                  <p className="dk-p">
                    {t(
                      "O selo. Não-financeiro, multi-inquilino, receita por verificação. É o único andar que precisa existir para a empresa existir.",
                      "The seal. Non-financial, multi-tenant, revenue per verification. The only floor that must exist for the company to exist.",
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
                      "NFT de área ou título e a cesta do ativo como inventário. Identidade e colateral — não circula.",
                      "An NFT of the area or title, and the asset basket as inventory. Identity and collateral — it does not circulate.",
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
                      "Token de lote por série, custodiado e redimível pelo físico. Único andar em que pode haver pool.",
                      "A per-series lot token, custodied and redeemable for the physical. The only floor where a pool can exist.",
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
                      "Royalty e pré-pagamento em SPV. Fora da entidade e do domínio de comunicação da prova — fronteira societária, não preferência de marca.",
                      "Royalty and prepayment in an SPV. Outside the proof entity and its communication domain — a corporate boundary, not a brand preference.",
                    )}
                  </p>
                </div>
              </div>
              <p className="dk-p dk-p--fine">
                <b>{t("Regra de ouro. ", "Golden rule. ")}</b>
                {t(
                  "Nunca fungibilizar através da fronteira de origem: dois lotes só compartilham um token se compartilharem origem provada, período e especificação. Fungibilizar “Token Ouro” apaga a origem — que é o produto.",
                  "Never make assets fungible across the origin boundary: two lots share a token only if they share proven origin, period and specification. Making a generic “Gold Token” erases origin — which is the product.",
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
                <span className="dk-accent">{t("3 g de ouro por tonelada.", "3 g of gold per tonne.")}</span>
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
                      "Um passivo ambiental que já foi escavado, moído e pago. O ouro está lá. O que falta não é geologia — é alguém capaz de provar que o teor foi lido, e não afirmado.",
                      "An environmental liability already dug, milled and paid for. The gold is there. What is missing is not geology — it is someone able to prove the grade was read, not asserted.",
                    )}
                  </p>
                  <p className="dk-p dk-p--fine">
                    <b>{t("Metal contido não é receita. ", "Contained metal is not revenue. ")}</b>
                    {t(
                      "Rejeito exige recuperação metalúrgica e nenhum projeto entrega 100%. A próxima tela traz a faixa honesta. Cobre residual não quantificado — não há teor informado.",
                      "Tailings need metallurgical recovery and no project delivers 100%. The next screen carries the honest range. Residual copper is not quantified — no grade was given.",
                    )}
                  </p>
                </div>
              </div>
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
              <div className="dk-row dk-row--3">
                <div className="dk-panel">
                  <div className="dk-label">
                    <span>{t("Recuperação 50%", "50% recovery")}</span>
                  </div>
                  <span className="dk-metric__v">
                    <small>US$ </small>522<small> mi</small>
                  </span>
                  <p className="dk-metric__note">{t("3,75 t recuperadas", "3.75 t recovered")}</p>
                </div>
                <div className="dk-panel">
                  <div className="dk-label">
                    <span>{t("Recuperação 65% · central", "65% recovery · central")}</span>
                  </div>
                  <span className="dk-metric__v">
                    <small>US$ </small>679<small> mi</small>
                  </span>
                  <p className="dk-metric__note">{t("4,88 t recuperadas", "4.88 t recovered")}</p>
                </div>
                <div className="dk-panel">
                  <div className="dk-label">
                    <span>{t("Recuperação 80%", "80% recovery")}</span>
                  </div>
                  <span className="dk-metric__v">
                    <small>US$ </small>836<small> mi</small>
                  </span>
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
                        "O ouro certificado tem prêmio publicado: US$ 2.000/kg (Fairtrade) a US$ 4.000/kg (Fairmined). Sobre 4,88 t, ",
                        "Certified gold carries a published premium: US$ 2,000/kg (Fairtrade) to US$ 4,000/kg (Fairmined). On 4.88 t, that is ",
                      )}
                      <i>{t("US$ 9,8 mi a US$ 19,5 mi", "US$ 9.8m to US$ 19.5m")}</i>
                      {t(" — e nenhum desses esquemas opera no Brasil hoje.", " — and neither scheme operates in Brazil today.")}
                    </span>
                  </div>
                  <div className="dk-kv__row">
                    <span className="dk-kv__k">{t("Acesso a seguro", "Insurance access")}</span>
                    <span className="dk-kv__v">
                      {t(
                        "Barragem é quase inassegurável. O argumento não é prêmio mais barato — é ser subscrito na capacidade que hoje está fechada.",
                        "A tailings dam is close to uninsurable. The argument is not a cheaper premium — it is being underwritten in capacity that is closed today.",
                      )}
                    </span>
                  </div>
                  <div className="dk-kv__row">
                    <span className="dk-kv__k">{t("Âncora de preço", "Price anchor")}</span>
                    <span className="dk-kv__v">
                      {t(
                        "O PL 3025/23 põe teto público em rastreabilidade: R$ 5,00 por grama marcada. Sobre 4,88 t, o Estado precificaria R$ 24,4 mi pelo mesmo trabalho.",
                        "Bill 3025/23 sets a public ceiling on traceability: R$ 5.00 per marked gram. On 4.88 t, the State would price the same work at R$ 24.4m.",
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
                      "O benchmark de primeira milha existente — iTSCi, US$ 130–180 por tonelada — quebrou por caro. A 2,5 Mt, ele custaria mais do que o ouro vale.",
                      "The existing first-mile benchmark — iTSCi, US$ 130–180 per tonne — broke because it was too expensive. At 2.5 Mt it would cost more than the gold is worth.",
                    )}
                  </p>
                  <p className="dk-p">
                    <b>
                      {t(
                        "A unidade de cobrança da Lastre não pode ser a tonelada. Tem de ser a verificação ou o lote.",
                        "Lastre cannot charge by the tonne. It has to charge by the verification, or by the lot.",
                      )}
                    </b>
                  </p>
                  <p className="dk-p dk-p--fine">
                    {t(
                      "Fontes: ouro à vista US$ 4.334/oz em 02.09.2026 (Fortune) · tabelas Fairtrade e Fairmined 2025/2026 · PL 3025/23, aprovado na Câmara em 22.04.2026, travado no Senado · iTSCi, único esquema com preço público.",
                      "Sources: gold spot US$ 4,334/oz on 02.09.2026 (Fortune) · Fairtrade and Fairmined 2025/2026 schedules · Bill 3025/23, passed the Chamber 22.04.2026, stalled in the Senate · iTSCi, the only scheme with a public price.",
                    )}
                  </p>
                </div>
              </div>
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
              <div className="dk-row dk-row--3 dk-row--top dk-steps">
                <div className="dk-step">
                  <span className="dk-step__n">01</span>
                  <span className="dk-step__k">{t("Usuário certificado", "Certified user")}</span>
                  <p className="dk-p dk-step__b">
                    {t(
                      "Faixas de assinatura que abrem acesso a conjuntos diferentes de lotes provados — propriedades, minas, crédito de carbono. A faixa define o escopo do catálogo e o nível de garantia operacional: colateral e escrow adicionais nas faixas superiores.",
                      "Subscription tiers opening access to different sets of proven lots — properties, mines, carbon credits. The tier sets the catalogue scope and the level of operational guarantee: extra collateral and escrow in the upper tiers.",
                    )}
                  </p>
                </div>
                <div className="dk-step">
                  <span className="dk-step__n">02</span>
                  <span className="dk-step__k">{t("Produtor / mineradora", "Producer / miner")}</span>
                  <p className="dk-p dk-step__b">
                    {t(
                      "Paga por categoria de alcance: quantos e quais participantes certificados enxergam seus lotes. A prova é o requisito de entrada; a categoria é a distribuição.",
                      "Pays by reach category: how many and which certified participants see their lots. Proof is the entry requirement; the category is the distribution.",
                    )}
                  </p>
                </div>
                <div className="dk-step">
                  <span className="dk-step__n">03</span>
                  <span className="dk-step__k">{t("Quem paga antes de 2027", "Who pays before 2027")}</span>
                  <p className="dk-p dk-step__b">
                    {t(
                      "Seguradora, auditor e agente autônomo pagando por consulta. O comprador com mandato regulatório só é obrigado a partir de 18.02.2027 — precisamos de caixa antes disso.",
                      "Insurer, auditor and autonomous agent paying per query. The buyer under a regulatory mandate is only obliged from 18.02.2027 — we need cash before that.",
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
                        "A Lastre nasce e opera fora do Brasil. A camada de capital fica em entidade separada da camada de prova.",
                        "Lastre is born and operates outside Brazil. The capital layer sits in an entity separate from the proof layer.",
                      )}
                    </span>
                  </div>
                  <div className="dk-kv__row">
                    <span className="dk-kv__k">{t("Liquidação", "Settlement")}</span>
                    <span className="dk-kv__v">
                      {t(
                        "O produtor brasileiro mantém conta própria no exterior e recebe em USDT. A responsabilidade fiscal e de reporte da operação dele é dele.",
                        "The Brazilian producer keeps their own offshore account and is paid in USDT. Their operation's tax and reporting duties are theirs.",
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
                        "Estrutura desenhada, ainda não validada por tributarista nas duas jurisdições. Não tratar como decidido.",
                        "Structure designed, not yet validated by tax counsel in either jurisdiction. Do not treat it as settled.",
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
                  <p className="dk-p dk-p--fine">
                    {t(
                      "Por que 04 é diferente: histórico de catálogo não se compra depois. Todo mês sem leitura real é um mês que nenhum aporte recompra.",
                      "Why 04 is different: catalogue history cannot be bought later. Every month without a real reading is a month no funding round buys back.",
                    )}
                  </p>
                </div>
              </div>
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
              <p className="dk-p dk-p--fine">
                {t(
                  "Material interno. Não é oferta, promessa de retorno ou recomendação de investimento. Cifras de terceiros trazem fonte e data na tela em que aparecem; as cifras do caso do rejeito são cálculo determinístico sobre premissas declaradas, não projeção de receita.",
                  "Internal material. Not an offer, a promise of return, or investment advice. Third-party figures carry their source and date on the screen where they appear; the tailings figures are a deterministic calculation on stated assumptions, not a revenue forecast.",
                )}
              </p>
            </div>
          </>
        );
      },
    },
  ],
};
