import { tx, type Deck } from "../types";

/* ─────────────────────────────────────────────────────────────────────────
 * 02 · Mapa de públicos
 * ───────────────────────────────────────────────────────────────────────── */

export const publicos: Deck = {
  slug: "publicos",
  index: "02",
  title: { pt: "Mapa de públicos", en: "Map of audiences" },
  summary: {
    pt: "Quem paga, quem valida, quem distribui e quem ataca. Os seis públicos esquecidos, o relógio regulatório e o adversário que o produto ainda não trata.",
    en: "Who pays, who validates, who distributes and who attacks. The six forgotten audiences, the regulatory clock, and the adversary the product does not yet handle.",
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
                {t("Quem está", "Who is")}
                <br />
                {t("na mesa.", "at the table.")}
              </h1>
              <p className="dk-eyebrow">
                {t("Documento de trabalho · 02 setembro 2026", "Working document · 02 September 2026")}
              </p>
            </div>
            <div className="dk-bottom">
              <p className="dk-p dk-p--lead">
                {t(
                  "Cada andar do prédio tem um público diferente, com uma dor diferente e um relógio diferente. Confundi-los é o erro que trava a receita.",
                  "Each floor of the building has a different audience, a different pain and a different clock. Confusing them is the mistake that stalls revenue.",
                )}
              </p>
            </div>
          </>
        );
      },
    },

    /* ── 01 · um público por andar ────────────────────────────────────── */
    {
      id: "andares",
      title: { pt: "01 · Um público por andar", en: "01 · One audience per floor" },
      render: (l) => {
        const t = tx(l);
        return (
          <>
            <div className="dk-top">
              <p className="dk-eyebrow">{t("01 — Um público por andar", "01 — One audience per floor")}</p>
              <h2 className="dk-h1">
                {t("Cada andar vende para gente diferente.", "Each floor sells to different people.")}
              </h2>
            </div>
            <div className="dk-bottom">
              <div className="dk-row dk-row--4 dk-row--top">
                <div className="dk-floor dk-floor--0">
                  <span className="dk-eyebrow">{t("Andar 0 · Prova", "Floor 0 · Proof")}</span>
                  <h3 className="dk-h3">{t("Seguradora · auditor · comprador", "Insurer · auditor · buyer")}</h3>
                  <p className="dk-p">
                    {t(
                      "Vende certeza. Receita por verificação. É onde há caixa hoje.",
                      "Sells certainty. Revenue per verification. This is where the cash is today.",
                    )}
                  </p>
                </div>
                <div className="dk-floor dk-floor--1">
                  <span className="dk-eyebrow">{t("Andar 1 · Registro", "Floor 1 · Registry")}</span>
                  <h3 className="dk-h3">{t("Produtor · titular de área", "Producer · title holder")}</h3>
                  <p className="dk-p">
                    {t(
                      "Vende identidade e colateral. Não circula, não é oferta.",
                      "Sells identity and collateral. It does not circulate and it is not an offer.",
                    )}
                  </p>
                </div>
                <div className="dk-floor dk-floor--2">
                  <span className="dk-eyebrow">{t("Andar 2 · Circulação", "Floor 2 · Circulation")}</span>
                  <h3 className="dk-h3">{t("Armazém · trading · curador", "Warehouse · trading · curator")}</h3>
                  <p className="dk-p">
                    {t(
                      "Vende liquidez redimível. Só existe com custodiante — e o custodiante ainda não existe no Brasil para minério.",
                      "Sells redeemable liquidity. It only exists with a custodian — and no custodian exists in Brazil for ore.",
                    )}
                  </p>
                </div>
                <div className="dk-floor dk-floor--3">
                  <span className="dk-eyebrow">{t("Andar 3 · Capital", "Floor 3 · Capital")}</span>
                  <h3 className="dk-h3">{t("Público de capital", "Capital audience")}</h3>
                  <p className="dk-p">
                    {t(
                      "Royalty e pré-pagamento em SPV. Domínio de comunicação próprio, fora da marca de prova.",
                      "Royalty and prepayment in an SPV. Its own communication domain, outside the proof brand.",
                    )}
                  </p>
                </div>
              </div>
              <p className="dk-p dk-p--fine">
                <b>{t("Regra de ouro. ", "Golden rule. ")}</b>
                {t(
                  "Nunca fungibilizar através da fronteira de origem. Dois lotes só compartilham um token se compartilharem origem provada, período e especificação.",
                  "Never make assets fungible across the origin boundary. Two lots share a token only if they share proven origin, period and specification.",
                )}
              </p>
            </div>
          </>
        );
      },
    },

    /* ── 02 · os seis esquecidos ──────────────────────────────────────── */
    {
      id: "esquecidos",
      title: { pt: "02 · Os seis esquecidos", en: "02 · The forgotten six" },
      skin: "mint",
      render: (l) => {
        const t = tx(l);
        const items: Array<[string, string, string]> = [
          [
            t("Seguradora", "Insurer"),
            t("compra certeza", "buys certainty"),
            t(
              "O argumento não é prêmio mais barato — é acesso: ser subscrito na capacidade que hoje está fechada.",
              "The argument is not a cheaper premium — it is access: being underwritten in capacity that is closed today.",
            ),
          ],
          [
            t("Auditor", "Auditor"),
            t("reduz custo direto", "cuts direct cost"),
            t(
              "Evidência selada substitui teste substantivo. Única venda em que a Lastre reduz custo mensurável do comprador.",
              "Sealed evidence replaces substantive testing. The only sale where Lastre cuts a measurable buyer cost.",
            ),
          ],
          [
            t("Comprador com mandato", "Mandated buyer"),
            t("única demanda compulsória", "the only compulsory demand"),
            t(
              "Passaporte de bateria da UE obrigatório em 18.02.2027. O funil se desenha a partir dele, para trás.",
              "The EU battery passport becomes mandatory on 18.02.2027. The funnel is drawn backwards from there.",
            ),
          ],
          [
            t("Curador de risco", "Risk curator"),
            t("papel que não existe", "a role that does not exist"),
            t(
              "Para o público DeFi, o desenho certo é vault curado, não AMM aberto. A Lastre pode criar esse papel.",
              "For the DeFi audience the right design is a curated vault, not an open AMM. Lastre can create this role.",
            ),
          ],
          [
            t("Armazém geral", "Bonded warehouse"),
            t("o elo que falta", "the missing link"),
            t(
              "Sem depósito redimível não há arbitrador; sem arbitrador o pool não tem âncora de preço.",
              "With no redeemable deposit there is no arbitrageur; with no arbitrageur the pool has no price anchor.",
            ),
          ],
          [
            t("Agente de IA", "AI agent"),
            t("cliente não-humano", "a non-human client"),
            t(
              "Paga por chamada via x402. Não negocia preço, não tem ciclo de vendas, escala sem headcount.",
              "Pays per call over x402. No price negotiation, no sales cycle, scales without headcount.",
            ),
          ],
        ];
        return (
          <>
            <div className="dk-top">
              <p className="dk-eyebrow">{t("02 — Os seis públicos esquecidos", "02 — The six forgotten audiences")}</p>
              <h2 className="dk-h1">
                {t("Ninguém no setor está falando com estes seis.", "Nobody in the sector is talking to these six.")}
              </h2>
            </div>
            <div className="dk-bottom">
              <div className="dk-row dk-row--3 dk-row--top">
                {items.map(([name, kicker, body]) => (
                  <div className="dk-metric" key={name}>
                    <div className="dk-label">
                      <span>{name}</span>
                    </div>
                    <p className="dk-p">
                      <b>{kicker}.</b> {body}
                    </p>
                  </div>
                ))}
              </div>
              <p className="dk-p dk-p--fine">
                {t(
                  "O que estes seis têm em comum: nenhum quer comprar minério. Todos querem reduzir uma incerteza que hoje pagam de outra forma — em prêmio, em horas de auditoria, em multa ou em capital parado.",
                  "What these six share: none of them wants to buy ore. All of them want to cut an uncertainty they already pay for another way — in premium, in audit hours, in fines, or in idle capital.",
                )}
              </p>
            </div>
          </>
        );
      },
    },

    /* ── 03 · o relógio ───────────────────────────────────────────────── */
    {
      id: "relogio",
      title: { pt: "03 · O relógio", en: "03 · The clock" },
      skin: "dark",
      render: (l) => {
        const t = tx(l);
        return (
          <>
            <div className="dk-top">
              <p className="dk-eyebrow">{t("03 — O relógio da demanda", "03 — The demand clock")}</p>
              <h2 className="dk-h1">
                {t("A obrigação chega em 2027.", "The obligation arrives in 2027.")}
                <br />
                {t("O caixa precisa chegar antes.", "The cash has to arrive first.")}
              </h2>
            </div>
            <div className="dk-bottom">
              <div className="dk-row dk-row--wide">
                <div className="dk-kv">
                  <div className="dk-kv__row">
                    <span className="dk-kv__k">18.02.2027</span>
                    <span className="dk-kv__v">
                      {t(
                        "Passaporte de bateria da UE obrigatório. Sem limiar para VE e transporte leve; acima de 2 kWh para industriais.",
                        "The EU battery passport becomes mandatory. No threshold for EVs and light transport; above 2 kWh for industrial cells.",
                      )}
                    </span>
                  </div>
                  <div className="dk-kv__row">
                    <span className="dk-kv__k">18.08.2027</span>
                    <span className="dk-kv__v">
                      {t(
                        "Due diligence adiada de 2025 para cá pelo Regulamento (UE) 2025/1561.",
                        "Due diligence pushed here from 2025 by Regulation (EU) 2025/1561.",
                      )}
                    </span>
                  </div>
                  <div className="dk-kv__row">
                    <span className="dk-kv__k">26.07.2029</span>
                    <span className="dk-kv__v">
                      {t(
                        "CSDDD pós-Omnibus: só empresas com mais de 5.000 funcionários e € 1,5 bi. Aplicação efetiva.",
                        "Post-Omnibus CSDDD: only companies above 5,000 staff and € 1.5bn. Effective application.",
                      )}
                    </span>
                  </div>
                </div>

                <div className="dk-top">
                  <div className="dk-panel">
                    <div className="dk-label">
                      <span>{t("Janela até a obrigação", "Window to the obligation")}</span>
                    </div>
                    <span className="dk-metric__v">
                      17<small> {t("meses", "months")}</small>
                    </span>
                    <p className="dk-metric__note">
                      {t(
                        "O tempo em que a receita precisa vir de quem compra por vontade própria — seguradora e auditor.",
                        "The time in which revenue has to come from those who buy by choice — insurers and auditors.",
                      )}
                    </p>
                  </div>
                  <p className="dk-p">
                    <b>{t("O que não pode esperar o relógio: ", "What cannot wait for the clock: ")}</b>
                    {t(
                      "registrar a primeira leitura real. Histórico de catálogo não se compra depois — é o único item cujo adiamento é irreversível.",
                      "recording the first real reading. Catalogue history cannot be bought later — it is the one item whose delay is irreversible.",
                    )}
                  </p>
                </div>
              </div>
            </div>
          </>
        );
      },
    },

    /* ── 04 · o canal ─────────────────────────────────────────────────── */
    {
      id: "canal",
      title: { pt: "04 · O canal", en: "04 · The channel" },
      render: (l) => {
        const t = tx(l);
        return (
          <>
            <div className="dk-top">
              <p className="dk-eyebrow">{t("04 — O canal", "04 — The channel")}</p>
              <h2 className="dk-h1">
                {t("Todo o ouro brasileiro passa por um funil de ", "All Brazilian gold passes through a funnel of ")}
                <span className="dk-accent">{t("cinco portas.", "five doors.")}</span>
              </h2>
            </div>
            <div className="dk-bottom">
              <div className="dk-row dk-row--2">
                <div className="dk-kv">
                  <div className="dk-kv__row">
                    <span className="dk-kv__k">{t("O dever já existe", "The duty already exists")}</span>
                    <span className="dk-kv__v">
                      {t(
                        "Desde março de 2025, quando o STF derrubou a presunção de boa-fé. Não depende do PL 3025 ser aprovado.",
                        "Since March 2025, when the Supreme Court struck down the good-faith presumption. It does not depend on Bill 3025 passing.",
                      )}
                    </span>
                  </div>
                  <div className="dk-kv__row">
                    <span className="dk-kv__k">{t("Concentração", "Concentration")}</span>
                    <span className="dk-kv__v">
                      {t(
                        "Cinco corretoras concentram o mercado — e todas têm passivo: processo administrativo na CVM aberto em 18.01.2023, MPF pedindo R$ 10 bi no conjunto.",
                        "Five brokers concentrate the market — and all carry liabilities: a securities-commission proceeding opened 18.01.2023, prosecutors seeking R$ 10bn across them.",
                      )}
                    </span>
                  </div>
                  <div className="dk-kv__row">
                    <span className="dk-kv__k">{t("O vácuo do Pará", "The Pará vacuum")}</span>
                    <span className="dk-kv__v">
                      {t(
                        "Cerca de 65% do ouro garimpável do país e hoje nenhuma corretora legal operando — as que atuavam foram fechadas.",
                        "About 65% of the country's artisanal gold, and today no legal broker operating — those that did were shut down.",
                      )}
                    </span>
                  </div>
                </div>

                <div className="dk-top">
                  <div className="dk-label">
                    <span>{t("A leitura", "The read")}</span>
                  </div>
                  <p className="dk-p dk-p--lead">
                    {t(
                      "Quem entrar sob as regras novas precisa de rastreabilidade desde o dia um, sem passivo a esconder. É o melhor alvo de canal do mapa — e ainda não foi trabalhado.",
                      "Whoever enters under the new rules needs traceability from day one, with no liability to hide. It is the best channel target on the map — and nobody has worked it.",
                    )}
                  </p>
                </div>
              </div>
            </div>
          </>
        );
      },
    },

    /* ── o precedente ─────────────────────────────────────────────────── */
    {
      id: "precedente",
      title: { pt: "O precedente", en: "The precedent" },
      skin: "dark",
      render: (l) => {
        const t = tx(l);
        return (
          <>
            <div className="dk-top">
              <p className="dk-eyebrow">{t("04 — Precedente antes de repetir", "04 — Precedent, before repeating it")}</p>
              <h2 className="dk-h1">
                {t("A primeira barra rastreada do Brasil parou no anúncio.", "Brazil's first traced gold bar stopped at the announcement.")}
              </h2>
            </div>
            <div className="dk-bottom">
              <div className="dk-row dk-row--2">
                <div className="dk-panel">
                  <div className="dk-label">
                    <span>{t("Fênix + Minespider · jan 2023", "Fênix + Minespider · Jan 2023")}</span>
                  </div>
                  <p className="dk-p">
                    {t(
                      "A corretora foi suspensa pela Justiça em set/2023 e o sócio preso em set/2024. Rastrear ouro no Brasil não falhou por falta de blockchain — falhou por captura do comprador.",
                      "The broker was suspended by the courts in Sep 2023 and its partner arrested in Sep 2024. Tracing gold in Brazil did not fail for lack of blockchain — it failed through capture of the buyer.",
                    )}
                  </p>
                </div>
                <div className="dk-panel">
                  <div className="dk-label">
                    <span>{t("O espaço não está vazio", "The space is not empty")}</span>
                  </div>
                  <p className="dk-p">
                    {t(
                      "Minery (SP) com certificação Certimine, piloto em Poconé/MT; Selo Amarelo (PA), operado pela refinaria North Star em Belém, Serabi Gold como primeira certificada, 24 t/ano projetadas. Status 2026 não confirmado em nenhum dos dois.",
                      "Minery (SP) with Certimine certification, piloting in Poconé/MT; Selo Amarelo (PA), run by the North Star refinery in Belém, Serabi Gold as first certified producer, 24 t/year projected. 2026 status unconfirmed for both.",
                    )}
                  </p>
                </div>
              </div>
            </div>
          </>
        );
      },
    },

    /* ── 05 · o adversário ────────────────────────────────────────────── */
    {
      id: "adversario",
      title: { pt: "05 · O adversário", en: "05 · The adversary" },
      skin: "mint",
      center: true,
      render: (l) => {
        const t = tx(l);
        return (
          <div className="dk-top" style={{ maxWidth: "26ch" }}>
            <p className="dk-eyebrow">{t("05 — O anti-público que virou adversário", "05 — The anti-audience that became an adversary")}</p>
            <h2 className="dk-h1">
              {t("O maior risco não é ninguém adotar. É ", "The biggest risk is not that nobody adopts it. It is that ")}
              <span className="dk-neg">{t("alguém adotar.", "somebody does.")}</span>
            </h2>
            <p className="dk-p dk-p--lead" style={{ marginTop: "1.6rem" }}>
              {t(
                "Quem quer esquentar origem não é um público que recusamos — é um adversário que nos procura. Um selo usado para legitimar ouro sujo destrói a empresa mais rápido do que a falta de clientes.",
                "Whoever wants to launder origin is not an audience we decline — it is an adversary that seeks us out. A seal used to legitimise dirty gold destroys the company faster than a lack of customers.",
              )}
            </p>
          </div>
        );
      },
    },

    /* ── threat model ─────────────────────────────────────────────────── */
    {
      id: "threat",
      title: { pt: "O que o selo não pega", en: "What the seal misses" },
      skin: "dark",
      render: (l) => {
        const t = tx(l);
        return (
          <>
            <div className="dk-top">
              <p className="dk-eyebrow">{t("05 — Threat model v0.1", "05 — Threat model v0.1")}</p>
              <h2 className="dk-h1">
                {t("Dez cenários. Em nove, a Lastre hoje detecta ", "Ten scenarios. In nine of them, Lastre today detects ")}
                <span className="dk-neg">{t("nada.", "nothing.")}</span>
              </h2>
            </div>
            <div className="dk-bottom">
              <div className="dk-row dk-row--2">
                <div className="dk-top">
                  <div className="dk-label">
                    <span>{t("A causa", "The cause")}</span>
                  </div>
                  <p className="dk-p">
                    {t(
                      "Consequência direta de um selo determinístico e offline num mundo em que a fraude acontece antes da leitura.",
                      "The direct consequence of a deterministic, offline seal in a world where the fraud happens before the reading.",
                    )}
                  </p>
                  <p className="dk-p">
                    {t(
                      "Limite físico confirmado por fonte independente: o Parlamento Europeu registra que assinaturas naturais são alteradas no refino, o blending derrota o rastreio físico, e a intensidade de capital marginaliza a mineração artesanal — externalidade que contradiz o propósito declarado e ainda não está tratada.",
                      "A physical limit confirmed independently: the European Parliament records that natural signatures are altered in refining, blending defeats physical tracing, and capital intensity marginalises artisanal mining — an externality that contradicts the stated purpose and is still untreated.",
                    )}
                  </p>
                </div>
                <div className="dk-top">
                  <div className="dk-label">
                    <span>{t("A correção", "The correction")}</span>
                  </div>
                  <p className="dk-p dk-p--lead">
                    {t(
                      "A integridade criptográfica é a parte fácil e já resolvida. O produto real é a corroboração da leitura: calibração vigente, separação de funções, checagem territorial de sobreposição e reconciliação nas duas pontas.",
                      "Cryptographic integrity is the easy part, already solved. The real product is corroboration of the reading: current calibration, separation of duties, territorial overlap checks and reconciliation at both ends.",
                    )}
                  </p>
                  <p className="dk-p dk-p--fine">
                    {t(
                      "Artefato em atraso: o threat model e a lista pública do que a Lastre não sela. Aparece como critério em aberto em quatro das onze dimensões do diagnóstico.",
                      "Overdue artefact: the threat model and the public list of what Lastre does not seal. It shows up as an open criterion in four of the eleven diagnostic dimensions.",
                    )}
                  </p>
                </div>
              </div>
            </div>
          </>
        );
      },
    },

    /* ── 06 · contra quem ─────────────────────────────────────────────── */
    {
      id: "concorrencia",
      title: { pt: "06 · Contra quem", en: "06 · Against whom" },
      render: (l) => {
        const t = tx(l);
        return (
          <>
            <div className="dk-top">
              <p className="dk-eyebrow">{t("06 — Contra quem competimos", "06 — Who we compete with")}</p>
              <h2 className="dk-h1">
                {t("Todo o mercado verifica documento. Ninguém verifica o ato de ler.", "The whole market verifies documents. Nobody verifies the act of reading.")}
              </h2>
            </div>
            <div className="dk-bottom">
              <div className="dk-row dk-row--3 dk-row--top">
                <div className="dk-metric">
                  <div className="dk-label">
                    <span>Circulor · US$ 39,1 mi</span>
                  </div>
                  <p className="dk-p">
                    <b>{t("A incumbente. ", "The incumbent. ")}</b>
                    {t(
                      "Cadeia de custódia e balanço de massa para bateria, dentro do Catena-X. Opera sobre dado declarado pelo fornecedor — não verifica o material.",
                      "Chain of custody and mass balance for batteries, inside Catena-X. It runs on supplier-declared data — it does not verify the material.",
                    )}
                  </p>
                </div>
                <div className="dk-metric">
                  <div className="dk-label">
                    <span>ProofLayer · Casper</span>
                  </div>
                  <p className="dk-p">
                    <b>{t("O vizinho perigoso. ", "The dangerous neighbour. ")}</b>
                    {t(
                      "Infra de prova em TEE, mesma chain, mesmo discurso. Diferenciação que sobra: prova de leitura física contra integridade de feed digital. Parar de usar “camada de prova” como posicionamento.",
                      "TEE-based proof infrastructure, same chain, same pitch. The differentiation left: proof of a physical reading versus integrity of a digital feed. Stop using “proof layer” as positioning.",
                    )}
                  </p>
                </div>
                <div className="dk-metric">
                  <div className="dk-label">
                    <span>LBMA Gold Bar Integrity</span>
                  </div>
                  <p className="dk-p">
                    <b>{t("O padrão de 2027. ", "The 2027 standard. ")}</b>
                    {t(
                      "100% dos refinadores Good Delivery integrados, relatório mensal obrigatório em 2027. Mas o dado de origem é declaratório e no nível do refinador — tudo a montante fica fora. Esse “fora” é o nosso mercado.",
                      "All Good Delivery refiners integrated, monthly reporting mandatory in 2027. But the origin data is declaratory and sits at refiner level — everything upstream is out. That “out” is our market.",
                    )}
                  </p>
                </div>
              </div>
              <p className="dk-p dk-p--fine">
                {t(
                  "Cemitério útil: Everledger liquidada em 2023 · iTSCi removido da lista RMI em 31.10.2022 e abandonado por custo · Fairmined e Fairtrade somam cerca de 101 kg vendidos no mundo em 2025, e nenhum esquema internacional de certificação de ouro opera no Brasil. Números de mercado de RWA são pouco confiáveis — estimativas para meados de 2026 vão de US$ 23 bi a US$ 34 bi para o mesmo mercado.",
                  "Useful graveyard: Everledger liquidated in 2023 · iTSCi removed from the RMI list on 31.10.2022 and abandoned on cost · Fairmined and Fairtrade together sold about 101 kg worldwide in 2025, and no international gold certification scheme operates in Brazil. RWA market figures are unreliable — mid-2026 estimates range from US$ 23bn to US$ 34bn for the same market.",
                )}
              </p>
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
                {t("Um público paga hoje.", "One audience pays today.")}
                <br />
                {t("Os outros esperam um elo que ainda não existe.", "The rest wait on a link that does not exist yet.")}
              </h2>
            </div>
            <div className="dk-bottom">
              <p className="dk-p dk-p--lead">
                {t(
                  "A cadeia é serial: leitura corroborada → selo → depósito em armazém geral → redenção → arbitrador → pool. O terceiro elo não existe no país e bloqueia os três seguintes. Por isso a primeira conversa não é com investidor — é com um armazém geral, e custa uma semana.",
                  "The chain is serial: corroborated reading → seal → bonded deposit → redemption → arbitrageur → pool. The third link does not exist in the country and blocks the three that follow. Which is why the first conversation is not with an investor — it is with a warehouse, and it costs a week.",
                )}
              </p>
              <p className="dk-p dk-p--fine">
                {t(
                  "Material interno. Não é oferta, promessa de retorno ou recomendação de investimento. Todos os números de terceiros trazem fonte e data; onde a pesquisa não encontrou dado, está escrito “não encontrado” — nada foi estimado.",
                  "Internal material. Not an offer, a promise of return, or investment advice. Every third-party figure carries its source and date; where research found nothing it says “not found” — nothing was estimated.",
                )}
              </p>
            </div>
          </>
        );
      },
    },
  ],
};
