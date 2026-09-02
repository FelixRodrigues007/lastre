import type { Deck } from "../types";

/* ─────────────────────────────────────────────────────────────────────────
 * 01 · A Lastre em cinco telas
 * Argumento em cinco tempos: o problema, o que é, como funciona,
 * quanto vale num caso real, quem paga.
 * ───────────────────────────────────────────────────────────────────────── */

export const geral: Deck = {
  slug: "lastre",
  index: "01",
  title: "A Lastre em cinco telas",
  summary:
    "O que a Lastre é, por que existe, como funciona e quem paga — com um caso real: a abertura de uma S.A. sobre 2,5 Mt de rejeito de cobre a 3 g/t de ouro.",
  audience: "Sócios e convidados",
  updated: "02.09.2026",
  slides: [
    /* ── capa ─────────────────────────────────────────────────────────── */
    {
      id: "capa",
      title: "Capa",
      body: (
        <>
          <p className="dk-eyebrow">Documento de trabalho · 02 setembro 2026</p>
          <h1 className="dk-h1">
            Prova antes
            <br />
            do valor.
          </h1>
          <p className="dk-lead">
            Tudo o que se tokeniza hoje é tokenizado sobre uma origem <span className="dk-em">declarada</span>. A Lastre
            existe para provar que a leitura física aconteceu — antes de qualquer token, contrato ou agente agir sobre
            o dado.
          </p>
          <div className="dk-kv">
            <div className="dk-kv__row">
              <span className="dk-kv__k">Cinco tempos</span>
              <span className="dk-kv__v">
                O problema · O que a Lastre é · Como funciona · Quanto vale num caso real · Quem paga
              </span>
            </div>
            <div className="dk-kv__row">
              <span className="dk-kv__k">Navegação</span>
              <span className="dk-kv__v">
                <span className="dk-em">←</span> <span className="dk-em">→</span> para andar ·{" "}
                <span className="dk-em">G</span> abre o índice · <span className="dk-em">Esc</span> volta às pastas
              </span>
            </div>
          </div>
        </>
      ),
    },

    /* ── 01 problema ──────────────────────────────────────────────────── */
    {
      id: "problema",
      title: "01 · O problema",
      body: (
        <>
          <p className="dk-eyebrow">01 — O problema</p>
          <div className="dk-split">
            <div className="dk-stack">
              <h2 className="dk-h2">
                O mercado não verifica a origem. Ele <span className="dk-strike">aceita</span> a origem declarada.
              </h2>
              <p className="dk-lead">
                Do garimpo à barragem, o dado que sustenta um ativo real nasce de um papel, de uma planilha ou de uma
                API. Ninguém prova que a leitura existiu. Todo o resto — laudo, seguro, token, liquidação — herda essa
                ficção.
              </p>
              <p className="dk-body">
                Não é hipótese. Onde alguém tentou empilhar mercado sobre origem declarada, o mercado precificou pela
                média e degradou até o pior ativo aceito.
              </p>
            </div>
            <div className="dk-stack">
              <div className="dk-cols">
                <div>
                  <span className="dk-figure__label">Toucan · créditos de carbono</span>
                  <span className="dk-figure__value">
                    28<span className="dk-figure__unit">%</span>
                  </span>
                  <p className="dk-figure__note">
                    dos 21,6 mi de créditos migrados vinham de projetos zumbis; 84,8% inelegíveis sob o Artigo 6. Pool
                    fungível de ativos heterogêneos apaga a origem — e o preço vai ao pior.
                  </p>
                </div>
                <div>
                  <span className="dk-figure__label">Ouro brasileiro · Instituto Escolhas</span>
                  <span className="dk-figure__value">
                    229<span className="dk-figure__unit"> t</span>
                  </span>
                  <p className="dk-figure__note">
                    com indícios de ilegalidade entre 2015 e 2020 — cerca de metade da produção. Um terço passou por
                    apenas cinco DTVMs.
                  </p>
                </div>
                <div>
                  <span className="dk-figure__label">Seguro · Repórter Brasil</span>
                  <span className="dk-figure__value">
                    19<span className="dk-figure__unit"> contratos</span>
                  </span>
                  <p className="dk-figure__note">
                    de seguro rural mantidos pela Swiss Re em três propriedades embargadas por desmatamento ilegal. A
                    triagem de origem falha hoje — e falha de forma publicável.
                  </p>
                </div>
              </div>
              <div className="dk-notes">
                <p className="dk-note">
                  <b>Fontes:</b> Toucan/Carbon Plan e análises do Artigo 6 · Instituto Escolhas, <i>Raio X do Ouro</i>,
                  10.02.2022 · Repórter Brasil, 11/2023 e 03/2025.
                </p>
              </div>
            </div>
          </div>
        </>
      ),
    },

    /* ── 02 o que é ───────────────────────────────────────────────────── */
    {
      id: "o-que-e",
      title: "02 · O que a Lastre é",
      body: (
        <>
          <p className="dk-eyebrow">02 — O que a Lastre é</p>
          <div className="dk-split">
            <div className="dk-stack">
              <h2 className="dk-h2">
                A prova de que a leitura física <span className="dk-accent">aconteceu</span>.
              </h2>
              <p className="dk-lead">
                A Lastre sela a leitura de campo no ponto de origem, sem rede e sem servidor, e registra o veredito na
                blockchain. O selo é determinístico: mesma leitura, mesmo selo, em qualquer lugar do mundo. Nenhum
                modelo, nenhum relógio e nenhuma nuvem decidem o resultado.
              </p>
              <div className="dk-kv">
                <div className="dk-kv__row">
                  <span className="dk-kv__k">O que sela</span>
                  <span className="dk-kv__v">
                    Peso, teor, ensaio, coordenada, operador e horário — a leitura, não a declaração.
                  </span>
                </div>
                <div className="dk-kv__row">
                  <span className="dk-kv__k">Como sela</span>
                  <span className="dk-kv__v">SHA-256 canônico, calculado offline no ponto de leitura.</span>
                </div>
                <div className="dk-kv__row">
                  <span className="dk-kv__k">Onde julga</span>
                  <span className="dk-kv__v">
                    Casper. <span className="dk-accent">Valid</span> e <span className="dk-coral">Invalid</span> ficam
                    permanentes — quase ninguém registra o “não”.
                  </span>
                </div>
              </div>
            </div>

            <div className="dk-stack">
              <div className="dk-verdicts">
                <div className="dk-verdict dk-verdict--valid">
                  <span className="dk-tag dk-tag--accent">Valid</span>
                  <h3 className="dk-h3">O trilho abre</h3>
                  <p className="dk-body">
                    Registro, circulação e crédito passam a existir para aquele lote. Cada passo seguinte pode
                    reverificar a origem sozinho, on-chain.
                  </p>
                </div>
                <div className="dk-verdict dk-verdict--invalid">
                  <span className="dk-tag dk-tag--coral">Invalid</span>
                  <h3 className="dk-h3">O trilho fecha</h3>
                  <p className="dk-body">
                    A recusa também é prova permanente. É o que impede que o selo vire ferramenta de lavagem: negar é
                    tão registrado quanto aprovar.
                  </p>
                </div>
              </div>
              <div className="dk-stack dk-stack--tight">
                <p className="dk-mono">A frase que nos separa do resto do mercado</p>
                <p className="dk-lead">
                  “A concorrência prova o que o fornecedor <span className="dk-strike">declarou</span>. A Lastre prova
                  que a <span className="dk-em">leitura aconteceu</span>.”
                </p>
              </div>
              <div className="dk-notes">
                <p className="dk-note">
                  <b>Honestidade técnica:</b> a integridade criptográfica é a parte fácil e já resolvida. O produto real
                  é a <b>corroboração da leitura</b> — calibração vigente, separação de funções, checagem territorial de
                  sobreposição e reconciliação nas duas pontas. Nada disso é blockchain.
                </p>
              </div>
            </div>
          </div>
        </>
      ),
    },

    /* ── 03 como funciona ─────────────────────────────────────────────── */
    {
      id: "como-funciona",
      title: "03 · Como funciona",
      body: (
        <>
          <p className="dk-eyebrow">03 — Como funciona</p>
          <div className="dk-split">
            <div className="dk-stack">
              <h2 className="dk-h2">Quatro andares. Um só sobe de cada vez.</h2>
              <p className="dk-lead">
                A Lastre não é uma camada de prova isolada nem uma corretora de tokens. É um prédio: cada andar só
                existe porque o de baixo foi provado.
              </p>
              <div className="dk-stack dk-stack--tight">
                <p className="dk-mono">Regra de ouro</p>
                <p className="dk-lead">
                  Nunca fungibilizar através da fronteira de origem. Dois lotes só compartilham um token se
                  compartilharem <span className="dk-em">origem provada, período e especificação</span>.
                </p>
              </div>
              <div className="dk-notes">
                <p className="dk-note">
                  <b>Por quê:</b> fungibilizar “Token Ouro” apaga a origem — que é exatamente o produto da Lastre. É o
                  erro que quebrou os pools de carbono.
                </p>
              </div>
            </div>

            <div className="dk-floors">
              <div className="dk-floor dk-floor--accent">
                <span className="dk-floor__n">Andar 0</span>
                <span className="dk-floor__head">
                  <h3 className="dk-h3">Prova</h3>
                  <span className="dk-tag dk-tag--accent">É o produto</span>
                </span>
                <p className="dk-floor__body">
                  O selo. Não-financeiro, multi-inquilino, receita por verificação. Funciona sozinho e é o único andar
                  que precisa existir para a empresa existir.
                </p>
              </div>
              <div className="dk-floor dk-floor--jade">
                <span className="dk-floor__n">Andar 1</span>
                <span className="dk-floor__head">
                  <h3 className="dk-h3">Registro</h3>
                  <span className="dk-tag dk-tag--jade">Não negociável</span>
                </span>
                <p className="dk-floor__body">
                  NFT de área ou título e a cesta do ativo como inventário. Identidade e colateral — não circula.
                </p>
              </div>
              <div className="dk-floor dk-floor--amber">
                <span className="dk-floor__n">Andar 2</span>
                <span className="dk-floor__head">
                  <h3 className="dk-h3">Circulação</h3>
                  <span className="dk-tag dk-tag--amber">Exige custodiante</span>
                </span>
                <p className="dk-floor__body">
                  Token de lote semi-fungível por série, custodiado e redimível pelo físico. Único andar em que pode
                  haver pool — e só existe se houver armazém geral emitindo depósito com trilha digital.
                </p>
              </div>
              <div className="dk-floor dk-floor--severed">
                <span className="dk-floor__n">Andar 3</span>
                <span className="dk-floor__head">
                  <h3 className="dk-h3">Capital</h3>
                  <span className="dk-tag dk-tag--coral">Entidade separada</span>
                </span>
                <p className="dk-floor__body">
                  Royalty e pré-pagamento em SPV. Não pode viver na mesma entidade nem no mesmo domínio de comunicação
                  que a camada de prova — é fronteira societária, não preferência de marca.
                </p>
              </div>
            </div>
          </div>
        </>
      ),
    },

    /* ── 04 o caso ────────────────────────────────────────────────────── */
    {
      id: "caso",
      title: "04 · O caso do rejeito",
      body: (
        <>
          <p className="dk-eyebrow">04 — O caso: a S.A. do rejeito</p>
          <div className="dk-split">
            <div className="dk-stack">
              <h2 className="dk-h2">
                2,5 milhões de toneladas de rejeito de cobre. <span className="dk-accent">3 g de ouro</span> por
                tonelada.
              </h2>
              <p className="dk-lead">
                Um passivo ambiental que já foi escavado, moído e pago. O ouro está lá. O que falta não é geologia — é
                alguém capaz de provar que o teor foi lido, e não afirmado.
              </p>

              <div className="dk-calc">
                <div className="dk-calc__row">
                  <span className="dk-calc__idx">01</span>
                  <span className="dk-calc__label">Massa de rejeito</span>
                  <span className="dk-calc__value">2.500.000 t</span>
                </div>
                <div className="dk-calc__row">
                  <span className="dk-calc__idx">02</span>
                  <span className="dk-calc__label">Teor de ouro</span>
                  <span className="dk-calc__value">3,0 g/t</span>
                </div>
                <div className="dk-calc__row">
                  <span className="dk-calc__idx">03</span>
                  <span className="dk-calc__label">Ouro contido</span>
                  <span className="dk-calc__value">7,50 t · 241.134 oz t</span>
                </div>
                <div className="dk-calc__row">
                  <span className="dk-calc__idx">04</span>
                  <span className="dk-calc__label">Ouro à vista · 02.09.2026</span>
                  <span className="dk-calc__value">US$ 4.334 / oz</span>
                </div>
                <div className="dk-calc__row dk-calc__row--total">
                  <span className="dk-calc__idx">05</span>
                  <span className="dk-calc__label">Valor do metal contido</span>
                  <span className="dk-calc__value">US$ 1,045 bi</span>
                </div>
              </div>

              <div className="dk-notes">
                <p className="dk-note">
                  <b>Metal contido não é receita.</b> Rejeito exige recuperação metalúrgica, e nenhum projeto entrega
                  100%. A faixa abaixo é a leitura honesta.
                </p>
              </div>
            </div>

            <div className="dk-stack">
              <div className="dk-cols">
                <div>
                  <span className="dk-figure__label">Recuperação 50%</span>
                  <span className="dk-figure__value">
                    <span className="dk-figure__unit">US$ </span>522<span className="dk-figure__unit"> mi</span>
                  </span>
                  <p className="dk-figure__note">3,75 t de ouro recuperado.</p>
                </div>
                <div>
                  <span className="dk-figure__label">Recuperação 65% · central</span>
                  <span className="dk-figure__value dk-accent">
                    <span className="dk-figure__unit">US$ </span>679<span className="dk-figure__unit"> mi</span>
                  </span>
                  <p className="dk-figure__note">4,88 t de ouro recuperado.</p>
                </div>
                <div>
                  <span className="dk-figure__label">Recuperação 80%</span>
                  <span className="dk-figure__value">
                    <span className="dk-figure__unit">US$ </span>836<span className="dk-figure__unit"> mi</span>
                  </span>
                  <p className="dk-figure__note">6,00 t de ouro recuperado.</p>
                </div>
              </div>

              <hr className="dk-rule" />

              <p className="dk-mono">O que a Lastre acrescenta a esta pilha</p>
              <div className="dk-kv">
                <div className="dk-kv__row">
                  <span className="dk-kv__k">Prêmio de origem</span>
                  <span className="dk-kv__v">
                    O ouro certificado tem prêmio publicado: <span className="dk-em">US$ 2.000/kg</span> (Fairtrade) a{" "}
                    <span className="dk-em">US$ 4.000/kg</span> (Fairmined). Sobre 4,88 t recuperadas, são{" "}
                    <span className="dk-accent">US$ 9,8 mi a US$ 19,5 mi</span> de prêmio capturável — e nenhum desses
                    esquemas opera no Brasil hoje.
                  </span>
                </div>
                <div className="dk-kv__row">
                  <span className="dk-kv__k">Acesso a seguro</span>
                  <span className="dk-kv__v">
                    Barragem é quase inassegurável. O argumento não é prêmio mais barato — é{" "}
                    <span className="dk-em">ser subscrito na capacidade que hoje está fechada</span>.
                  </span>
                </div>
                <div className="dk-kv__row">
                  <span className="dk-kv__k">Âncora de preço</span>
                  <span className="dk-kv__v">
                    O PL 3025/23 põe teto público em rastreabilidade: <span className="dk-em">R$ 5,00 por grama</span>{" "}
                    marcada. Sobre 4,88 t, o Estado precificaria R$ 24,4 mi pelo mesmo trabalho.
                  </span>
                </div>
              </div>

              <div className="dk-notes">
                <p className="dk-note">
                  <b>O que este caso decide para nós:</b> o benchmark de primeira milha existente (iTSCi,{" "}
                  <b>US$ 130–180 por tonelada</b>) quebrou por caro. A 2,5 Mt, ele custaria mais do que o ouro vale. A
                  unidade de cobrança da Lastre <b>não pode ser a tonelada</b> — tem de ser a verificação ou o lote.
                </p>
                <p className="dk-note">
                  <b>Fontes:</b> ouro à vista US$ 4.334/oz em 02.09.2026 (Fortune) · prêmios Fairtrade e Fairmined,
                  tabelas 2025/2026 · PL 3025/23, aprovado na Câmara em 22.04.2026, travado no Senado · custo iTSCi,
                  único esquema com preço público. Cobre residual não quantificado — não há teor informado.
                </p>
              </div>
            </div>
          </div>
        </>
      ),
    },

    /* ── 05 quem paga ─────────────────────────────────────────────────── */
    {
      id: "quem-paga",
      title: "05 · Quem paga",
      body: (
        <>
          <p className="dk-eyebrow">05 — Quem paga a Lastre</p>
          <div className="dk-split">
            <div className="dk-stack">
              <h2 className="dk-h2">Dois lados pagam. Nenhum deles paga por token.</h2>
              <p className="dk-lead">
                A receita não vem da valorização de um ativo — vem do acesso. De um lado, quem quer ver origem provada.
                Do outro, quem quer ser visto.
              </p>

              <div className="dk-floors">
                <div className="dk-floor dk-floor--accent">
                  <span className="dk-floor__n">Lado A</span>
                  <span className="dk-floor__head">
                    <h3 className="dk-h3">Usuário certificado</h3>
                    <span className="dk-tag dk-tag--accent">3 a 4 faixas</span>
                  </span>
                  <p className="dk-floor__body">
                    Faixas de assinatura que abrem acesso a diferentes conjuntos de lotes provados — propriedades,
                    minas, crédito de carbono. A faixa define o escopo do catálogo e o nível de garantia operacional
                    (colateral e escrow adicionais nas faixas superiores).
                  </p>
                </div>
                <div className="dk-floor dk-floor--jade">
                  <span className="dk-floor__n">Lado B</span>
                  <span className="dk-floor__head">
                    <h3 className="dk-h3">Produtor / mineradora</h3>
                    <span className="dk-tag dk-tag--jade">Categorias de exposição</span>
                  </span>
                  <p className="dk-floor__body">
                    Paga por categoria de alcance: quantos e quais participantes certificados enxergam seus lotes. A
                    prova é o requisito de entrada; a categoria é a distribuição.
                  </p>
                </div>
                <div className="dk-floor">
                  <span className="dk-floor__n">Lado C</span>
                  <span className="dk-floor__head">
                    <h3 className="dk-h3">Quem paga antes de 2027</h3>
                    <span className="dk-tag">Receita por verificação</span>
                  </span>
                  <p className="dk-floor__body">
                    Seguradora, auditor e agente autônomo pagando por consulta (x402). O comprador com mandato
                    regulatório só é obrigado a partir de 18.02.2027 — precisamos de caixa antes disso.
                  </p>
                </div>
              </div>
            </div>

            <div className="dk-stack">
              <p className="dk-mono">Onde a empresa vive</p>
              <div className="dk-kv">
                <div className="dk-kv__row">
                  <span className="dk-kv__k">Entidade</span>
                  <span className="dk-kv__v">
                    A Lastre nasce e opera fora do Brasil. A camada de capital fica em entidade separada da camada de
                    prova.
                  </span>
                </div>
                <div className="dk-kv__row">
                  <span className="dk-kv__k">Liquidação</span>
                  <span className="dk-kv__v">
                    O produtor brasileiro mantém conta própria no exterior e recebe em USDT. A responsabilidade fiscal e
                    de reporte da operação dele é dele.
                  </span>
                </div>
                <div className="dk-kv__row">
                  <span className="dk-kv__k">Status</span>
                  <span className="dk-kv__v">
                    <span className="dk-tag dk-tag--amber">Requer parecer</span> Estrutura desenhada, ainda não validada
                    por tributarista nas duas jurisdições. Não tratar como decidido.
                  </span>
                </div>
              </div>

              <hr className="dk-rule" />

              <p className="dk-mono">O que precisa ser decidido — nesta ordem</p>
              <div className="dk-calc">
                <div className="dk-calc__row">
                  <span className="dk-calc__idx">01</span>
                  <span className="dk-calc__label">Perguntar a um armazém geral se emite depósito com trilha digital</span>
                  <span className="dk-calc__value">1 semana</span>
                </div>
                <div className="dk-calc__row">
                  <span className="dk-calc__idx">02</span>
                  <span className="dk-calc__label">Escrever o threat model e a lista do que a Lastre não sela</span>
                  <span className="dk-calc__value">interno</span>
                </div>
                <div className="dk-calc__row">
                  <span className="dk-calc__idx">03</span>
                  <span className="dk-calc__label">Fixar a unidade de cobrança e levar preço a seguradora ou auditor</span>
                  <span className="dk-calc__value">em aberto</span>
                </div>
                <div className="dk-calc__row dk-calc__row--total">
                  <span className="dk-calc__idx">04</span>
                  <span className="dk-calc__label">Registrar a primeira leitura real</span>
                  <span className="dk-calc__value">irrecuperável</span>
                </div>
              </div>
              <div className="dk-notes">
                <p className="dk-note">
                  <b>Por que 04 é diferente:</b> histórico de catálogo não se compra depois. Todo mês sem leitura real é
                  um mês que nenhum aporte recompra.
                </p>
              </div>
            </div>
          </div>
        </>
      ),
    },

    /* ── fecho ────────────────────────────────────────────────────────── */
    {
      id: "fecho",
      title: "Fecho",
      body: (
        <>
          <p className="dk-eyebrow">Fecho</p>
          <h2 className="dk-h1">
            A prova é o produto.
            <br />O mercado é a consequência.
          </h2>
          <div className="dk-split dk-split--even">
            <p className="dk-lead">
              Tudo o que está acima do Andar 0 depende de uma pergunta que ainda não fizemos a ninguém de fora. Tudo o
              que está no Andar 0 já funciona e pode ser cobrado agora.
            </p>
            <div className="dk-notes">
              <p className="dk-note">
                <b>Material interno.</b> Não é oferta, promessa de retorno ou recomendação de investimento. Cifras de
                terceiros trazem fonte e data na tela em que aparecem. Cifras do caso do rejeito são cálculo
                determinístico sobre premissas declaradas — não são projeção de receita.
              </p>
            </div>
          </div>
        </>
      ),
    },
  ],
};
