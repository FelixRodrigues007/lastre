import type { Deck } from "../types";

/* ─────────────────────────────────────────────────────────────────────────
 * 02 · Mapa de públicos
 * Quem está na mesa, quem paga primeiro, quem é o canal e quem é o adversário.
 * ───────────────────────────────────────────────────────────────────────── */

export const publicos: Deck = {
  slug: "publicos",
  index: "02",
  title: "Mapa de públicos",
  summary:
    "Quem paga, quem valida, quem distribui e quem ataca. Os seis públicos esquecidos, o funil desenhado ao contrário e o adversário que o produto ainda não trata.",
  audience: "Sócios e convidados",
  updated: "02.09.2026",
  slides: [
    {
      id: "capa",
      title: "Capa",
      body: (
        <>
          <p className="dk-eyebrow">Documento de trabalho · 02 setembro 2026</p>
          <h1 className="dk-h1">
            Quem está
            <br />
            na mesa.
          </h1>
          <p className="dk-lead">
            A Lastre é um ecossistema completo — prova, mercado e capital. Cada andar do prédio tem um público
            diferente, com uma dor diferente e um relógio diferente. Confundi-los é o erro que trava a receita.
          </p>
          <div className="dk-kv">
            <div className="dk-kv__row">
              <span className="dk-kv__k">O que este mapa decide</span>
              <span className="dk-kv__v">
                Para quem vender primeiro, por qual canal, com qual argumento — e o que recusar.
              </span>
            </div>
          </div>
        </>
      ),
    },

    /* ── 01 os quatro andares e seus públicos ─────────────────────────── */
    {
      id: "andares",
      title: "01 · Um público por andar",
      body: (
        <>
          <p className="dk-eyebrow">01 — Um público por andar</p>
          <div className="dk-split">
            <div className="dk-stack">
              <h2 className="dk-h2">Cada andar vende para gente diferente.</h2>
              <p className="dk-lead">
                O erro clássico é falar com o investidor no andar da prova, e com o auditor no andar do capital. Os
                argumentos não se transferem — e, no caso do Andar 3, nem a entidade.
              </p>
              <div className="dk-stack dk-stack--tight">
                <p className="dk-mono">Regra de ouro</p>
                <p className="dk-lead">
                  Nunca fungibilizar através da fronteira de origem. Dois lotes só compartilham um token se
                  compartilharem <span className="dk-em">origem provada, período e especificação</span>.
                </p>
              </div>
            </div>
            <div className="dk-floors">
              <div className="dk-floor dk-floor--accent">
                <span className="dk-floor__n">Andar 0</span>
                <span className="dk-floor__head">
                  <h3 className="dk-h3">Prova</h3>
                  <span className="dk-tag dk-tag--accent">Seguradora · auditor · comprador</span>
                </span>
                <p className="dk-floor__body">Vende certeza. Receita por verificação. É onde há caixa hoje.</p>
              </div>
              <div className="dk-floor dk-floor--jade">
                <span className="dk-floor__n">Andar 1</span>
                <span className="dk-floor__head">
                  <h3 className="dk-h3">Registro</h3>
                  <span className="dk-tag dk-tag--jade">Produtor · titular de área</span>
                </span>
                <p className="dk-floor__body">Vende identidade e colateral. Não circula, não é oferta.</p>
              </div>
              <div className="dk-floor dk-floor--amber">
                <span className="dk-floor__n">Andar 2</span>
                <span className="dk-floor__head">
                  <h3 className="dk-h3">Circulação</h3>
                  <span className="dk-tag dk-tag--amber">Armazém geral · trading · curador</span>
                </span>
                <p className="dk-floor__body">
                  Vende liquidez redimível. Só existe com custodiante — e o custodiante ainda não existe no Brasil para
                  minério.
                </p>
              </div>
              <div className="dk-floor dk-floor--severed">
                <span className="dk-floor__n">Andar 3</span>
                <span className="dk-floor__head">
                  <h3 className="dk-h3">Capital</h3>
                  <span className="dk-tag dk-tag--coral">Entidade separada</span>
                </span>
                <p className="dk-floor__body">
                  Royalty e pré-pagamento em SPV. Público de capital, domínio de comunicação próprio, fora da marca de
                  prova.
                </p>
              </div>
            </div>
          </div>
        </>
      ),
    },

    /* ── 02 os esquecidos ─────────────────────────────────────────────── */
    {
      id: "esquecidos",
      title: "02 · Os seis esquecidos",
      body: (
        <>
          <p className="dk-eyebrow">02 — Os seis públicos esquecidos</p>
          <h2 className="dk-h2">Ninguém no setor está falando com estes seis.</h2>
          <div className="dk-cols">
            <div>
              <span className="dk-tag dk-tag--accent">01</span>
              <h3 className="dk-h3">Seguradora</h3>
              <p className="dk-body">
                Compra certeza. O argumento não é prêmio mais barato — é acesso: “você consegue ser subscrito na
                capacidade que hoje está fechada para você”.
              </p>
            </div>
            <div>
              <span className="dk-tag dk-tag--accent">02</span>
              <h3 className="dk-h3">Auditor</h3>
              <p className="dk-body">
                Evidência selada substitui teste substantivo. É a única venda em que a Lastre reduz custo direto e
                mensurável do comprador.
              </p>
            </div>
            <div>
              <span className="dk-tag dk-tag--amber">03</span>
              <h3 className="dk-h3">Comprador com mandato regulatório</h3>
              <p className="dk-body">
                Única demanda compulsória que existe. Passaporte de bateria da UE obrigatório em 18.02.2027. O funil se
                desenha a partir dele, para trás.
              </p>
            </div>
            <div>
              <span className="dk-tag dk-tag--jade">04</span>
              <h3 className="dk-h3">Curador de risco</h3>
              <p className="dk-body">
                Para o público DeFi, o desenho certo é vault curado, não AMM aberto. Cria um papel que ainda não existe
                no mercado brasileiro de ativos reais.
              </p>
            </div>
            <div>
              <span className="dk-tag dk-tag--amber">05</span>
              <h3 className="dk-h3">Armazém geral</h3>
              <p className="dk-body">
                O elo que falta. Sem depósito redimível não há arbitrador; sem arbitrador o pool não tem âncora de
                preço.
              </p>
            </div>
            <div>
              <span className="dk-tag dk-tag--jade">06</span>
              <h3 className="dk-h3">Agente de IA</h3>
              <p className="dk-body">
                Cliente não-humano que paga por chamada via x402. Não negocia preço, não tem ciclo de vendas e escala
                sem headcount.
              </p>
            </div>
          </div>
          <div className="dk-notes">
            <p className="dk-note">
              <b>O que estes seis têm em comum:</b> nenhum deles quer comprar minério. Todos querem reduzir uma
              incerteza que hoje pagam de outra forma — em prêmio, em horas de auditoria, em multa ou em capital parado.
            </p>
          </div>
        </>
      ),
    },

    /* ── 03 o relógio ─────────────────────────────────────────────────── */
    {
      id: "relogio",
      title: "03 · O relógio",
      body: (
        <>
          <p className="dk-eyebrow">03 — O relógio da demanda</p>
          <div className="dk-split">
            <div className="dk-stack">
              <h2 className="dk-h2">A obrigação chega em 2027. O caixa precisa chegar antes.</h2>
              <p className="dk-lead">
                A única demanda que não depende de convencimento é a regulatória — e ela atrasou. Desenhar o funil a
                partir dela é correto; depender dela para sobreviver, não.
              </p>
              <div className="dk-kv">
                <div className="dk-kv__row">
                  <span className="dk-kv__k">18.02.2027</span>
                  <span className="dk-kv__v">
                    Passaporte de bateria da UE obrigatório. Sem limiar para VE e transporte leve; acima de 2 kWh para
                    industriais.
                  </span>
                </div>
                <div className="dk-kv__row">
                  <span className="dk-kv__k">18.08.2027</span>
                  <span className="dk-kv__v">
                    Due diligence adiada de 2025 para cá pelo Regulamento (UE) 2025/1561.
                  </span>
                </div>
                <div className="dk-kv__row">
                  <span className="dk-kv__k">26.07.2029</span>
                  <span className="dk-kv__v">
                    CSDDD pós-Omnibus: só empresas com mais de 5.000 funcionários e € 1,5 bi. Aplicação efetiva.
                  </span>
                </div>
              </div>
            </div>
            <div className="dk-stack">
              <div className="dk-figure dk-figure--accent">
                <span className="dk-figure__label">Janela até a obrigação</span>
                <span className="dk-figure__value">
                  17<span className="dk-figure__unit"> meses</span>
                </span>
                <p className="dk-figure__note">
                  De hoje até 18.02.2027. É o tempo em que a receita precisa vir de quem compra por vontade própria —
                  seguradora e auditor — e não por obrigação.
                </p>
              </div>
              <hr className="dk-rule" />
              <p className="dk-mono">O que não pode esperar o relógio</p>
              <p className="dk-lead">
                Registrar a <span className="dk-em">primeira leitura real</span>. Histórico de catálogo não se compra
                depois — é o único item cujo adiamento é irreversível.
              </p>
            </div>
          </div>
        </>
      ),
    },

    /* ── 04 canal ─────────────────────────────────────────────────────── */
    {
      id: "canal",
      title: "04 · O canal",
      body: (
        <>
          <p className="dk-eyebrow">04 — O canal</p>
          <div className="dk-split">
            <div className="dk-stack">
              <h2 className="dk-h2">
                Todo o ouro brasileiro passa por um funil de <span className="dk-accent">cinco portas</span>.
              </h2>
              <p className="dk-lead">
                As DTVMs são o ponto obrigatório de passagem — e o dever de verificar já existe desde março de 2025,
                quando o STF derrubou a presunção de boa-fé. Não depende do PL 3025 ser aprovado.
              </p>
              <div className="dk-kv">
                <div className="dk-kv__row">
                  <span className="dk-kv__k">Concentração</span>
                  <span className="dk-kv__v">
                    Cinco DTVMs concentram o mercado — e todas têm passivo: processo administrativo na CVM aberto em
                    18.01.2023, MPF pedindo R$ 10 bi no conjunto.
                  </span>
                </div>
                <div className="dk-kv__row">
                  <span className="dk-kv__k">O vácuo do Pará</span>
                  <span className="dk-kv__v">
                    Cerca de 65% do ouro garimpável do país, e hoje nenhuma DTVM legal operando — as que atuavam foram
                    fechadas pela PF.
                  </span>
                </div>
                <div className="dk-kv__row">
                  <span className="dk-kv__k">A leitura</span>
                  <span className="dk-kv__v">
                    Quem entrar sob as regras novas precisa de rastreabilidade desde o dia um, sem passivo a esconder. É
                    o melhor alvo de canal do mapa e ainda não foi trabalhado.
                  </span>
                </div>
              </div>
            </div>
            <div className="dk-stack">
              <p className="dk-mono">Precedente que precisamos entender antes de repetir</p>
              <div className="dk-cols">
                <div>
                  <span className="dk-figure__label">Fênix DTVM + Minespider · jan 2023</span>
                  <h3 className="dk-h3">A primeira barra rastreada do Brasil parou no anúncio.</h3>
                  <p className="dk-body">
                    A Fênix foi suspensa pela Justiça em set/2023 e o sócio preso em set/2024. Rastrear ouro no Brasil
                    não falhou por falta de blockchain — falhou por{" "}
                    <span className="dk-em">captura do comprador</span>.
                  </p>
                </div>
                <div>
                  <span className="dk-figure__label">O espaço não está vazio</span>
                  <h3 className="dk-h3">Já existem dois selos operando.</h3>
                  <p className="dk-body">
                    Minery (SP) com certificação Certimine, piloto em Poconé/MT; Selo Amarelo (PA), operado pela
                    refinaria North Star em Belém, Serabi Gold como primeira certificada, 24 t/ano projetadas. Status
                    2026 não confirmado em nenhum dos dois.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </>
      ),
    },

    /* ── 05 adversário ────────────────────────────────────────────────── */
    {
      id: "adversario",
      title: "05 · O adversário",
      body: (
        <>
          <p className="dk-eyebrow">05 — O anti-público que virou adversário</p>
          <div className="dk-split">
            <div className="dk-stack">
              <h2 className="dk-h2">
                O maior risco não é ninguém adotar. É <span className="dk-coral">alguém adotar</span>.
              </h2>
              <p className="dk-lead">
                Quem quer esquentar origem não é um público que recusamos — é um adversário que nos procura. Um selo
                usado para legitimar ouro sujo destrói a empresa mais rápido do que a falta de clientes.
              </p>
              <div className="dk-verdicts">
                <div className="dk-verdict dk-verdict--invalid">
                  <span className="dk-tag dk-tag--coral">Threat model v0.1</span>
                  <h3 className="dk-h3">Dez cenários. Em nove, a Lastre hoje detecta nada.</h3>
                  <p className="dk-body">
                    Consequência direta de um selo determinístico e offline num mundo em que a fraude acontece{" "}
                    <span className="dk-em">antes</span> da leitura.
                  </p>
                </div>
                <div className="dk-verdict dk-verdict--valid">
                  <span className="dk-tag dk-tag--accent">A correção</span>
                  <h3 className="dk-h3">O produto real é a corroboração da leitura.</h3>
                  <p className="dk-body">
                    Calibração vigente, separação de funções, checagem territorial de sobreposição e reconciliação nas
                    duas pontas.
                  </p>
                </div>
              </div>
            </div>
            <div className="dk-stack">
              <p className="dk-mono">Limite físico do selo — fonte independente</p>
              <p className="dk-body">
                Relatório do Parlamento Europeu sobre rastreabilidade de matérias-primas críticas: assinaturas naturais
                são alteradas no refino, o <i>blending</i> derrota o rastreio físico, áreas de mineração artesanal
                carecem de energia e telecom, e a intensidade de capital marginaliza a ASM em favor da grande
                mineração. Esta última é uma externalidade que contradiz o propósito declarado e ainda não está tratada.
              </p>
              <hr className="dk-rule" />
              <p className="dk-mono">Boa notícia competitiva</p>
              <p className="dk-body">
                O Analytical Fingerprint do BGR — proveniência por assinatura geoquímica, em operação desde 2006 — cobre
                estanho, tungstênio e tântalo, e <span className="dk-em">não cobre ouro</span>. No ativo mais provável
                da Lastre, a via analítica ainda não chegou. O MaDiTraCe encerrou em jun/2026 sem sair da prova de
                conceito.
              </p>
              <div className="dk-notes">
                <p className="dk-note">
                  <b>Artefato em atraso:</b> o threat model e a lista pública do que a Lastre <b>não</b> sela. Aparece
                  como critério em aberto em quatro das onze dimensões do diagnóstico.
                </p>
              </div>
            </div>
          </div>
        </>
      ),
    },

    /* ── 06 concorrência ──────────────────────────────────────────────── */
    {
      id: "concorrencia",
      title: "06 · Contra quem",
      body: (
        <>
          <p className="dk-eyebrow">06 — Contra quem competimos de verdade</p>
          <h2 className="dk-h2">Todo o mercado verifica documento. Ninguém verifica o ato de ler.</h2>
          <div className="dk-cols">
            <div>
              <span className="dk-figure__label">Circulor · US$ 39,1 mi</span>
              <h3 className="dk-h3">A incumbente</h3>
              <p className="dk-body">
                Cadeia de custódia e balanço de massa para bateria, dentro do Catena-X. Opera sobre{" "}
                <span className="dk-em">dado declarado pelo fornecedor</span> — não verifica o material. Contra ela,
                “prova física vs. prova de dado” funciona.
              </p>
            </div>
            <div>
              <span className="dk-figure__label">ProofLayer · Casper</span>
              <h3 className="dk-h3">O vizinho perigoso</h3>
              <p className="dk-body">
                Infra de prova em TEE, mesma chain, marketing com a mesma frase que a nossa. Diferenciação que sobra:{" "}
                <span className="dk-em">prova de leitura física</span> contra integridade de feed digital. Parar de usar
                “camada de prova” como posicionamento.
              </p>
            </div>
            <div>
              <span className="dk-figure__label">LBMA Gold Bar Integrity</span>
              <h3 className="dk-h3">O padrão que chega em 2027</h3>
              <p className="dk-body">
                100% dos refinadores Good Delivery integrados; relatório mensal obrigatório em 2027. Mas o dado de
                origem é <span className="dk-em">declaratório e no nível do refinador</span> — tudo a montante fica
                fora. Esse “fora” é o nosso mercado.
              </p>
            </div>
          </div>
          <div className="dk-notes">
            <p className="dk-note">
              <b>Cemitério útil:</b> Everledger liquidada em 2023 · iTSCi removido da lista RMI em 31.10.2022 e
              abandonado por custo · Fairmined e Fairtrade somam cerca de 101 kg vendidos no mundo em 2025, e nenhum
              esquema internacional de certificação de ouro opera no Brasil.
            </p>
            <p className="dk-note">
              <b>Números de mercado de RWA são pouco confiáveis</b> — estimativas para meados de 2026 vão de US$ 23 bi a
              US$ 34 bi para o mesmo mercado. Nunca construir TAM sobre eles sem ressalva. O único dado com corroboração
              cruzada: 56% do valor tokenizado está ocioso.
            </p>
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
            Um público paga hoje.
            <br />
            Os outros esperam um elo
            <br />
            que ainda não existe.
          </h2>
          <div className="dk-split dk-split--even">
            <div className="dk-stack">
              <p className="dk-lead">
                A cadeia é serial: leitura corroborada → selo → depósito em armazém geral → redenção → arbitrador →
                pool. O terceiro elo não existe no país e bloqueia os três seguintes.
              </p>
              <p className="dk-body">
                Por isso a primeira conversa não é com investidor. É com um armazém geral, e custa uma semana.
              </p>
            </div>
            <div className="dk-notes">
              <p className="dk-note">
                <b>Material interno.</b> Não é oferta, promessa de retorno ou recomendação de investimento. Todos os
                números de terceiros trazem fonte e data. Onde a pesquisa não encontrou dado, está escrito “não
                encontrado” — nada foi estimado.
              </p>
            </div>
          </div>
        </>
      ),
    },
  ],
};
