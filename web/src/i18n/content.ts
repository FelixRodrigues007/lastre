import type { Locale } from "./translations";

export const content = {
  en: {
    nav: {
      protocol: "Protocol",
      how: "How",
      proof: "Proof",
      demo: "Demo",
      faq: "FAQ",
      app: "App",
      docs: "Docs",
      openMenu: "Open menu",
      closeMenu: "Close menu",
    },
    hero: {
      eyebrow: "Casper Testnet",
      scrollExplore: "Explore",
      scrollLabel: "Scroll to learn more",
      mediaAlt:
        "Open-pit mineral mine at dawn: field workers and haul trucks at a licensed extraction site used in Lastre's fictional provenance demo.",
      proofPanel: {
        label: "Provenance seal",
        ariaLabel: "Provenance seal — valid on Casper Testnet",
        steps: ["Physical origin", "SHA-256 seal", "Casper anchor"] as const,
      },
    },
    problem: {
      kicker: "The trust gap",
      titlePrefix: "The agent economy is being built on ",
      titleStrike: "unverified origin claims",
      titleSuffix: ".",
      subtitle: "One smart network for agents and assets — close to users, far from proof.",
      lanes: [
        {
          title: "Readings everywhere",
          body: "Sensors, documents, and APIs emit data from every continent — often with no chain of custody.",
        },
        {
          title: "Claims accepted as-is",
          body: "Models and middleware treat the source as given. The origin question is rarely asked.",
        },
        {
          title: "Fiction at scale",
          body: "Agents, escrows, and settlements inherit whatever was claimed — valid or not.",
        },
      ] as const,
      lead1:
        "Autonomous agents and tokenized real-world assets are already interacting with physical data. Yet almost nothing proves that a reading came from a real, legal origin. Most systems accept whatever an API or model claims.",
      lead2Prefix: "When the data is wrong, the entire stack — agents, escrows, settlements — ",
      lead2Emphasis: "runs on fiction",
      lead2Suffix: ".",
      panelAria:
        "Today's stack: an unverified claim propagating through the system without a proof of origin",
      panelTitle: "Without proof",
      gapSteps: [
        { label: "Physical reading", detail: "sensor · document · API" },
        { label: "API / model claim", detail: "accepted as-is" },
        { label: "No proof of origin", detail: "the question is skipped", missing: true },
        { label: "Agents · escrows · settlements", detail: "running on fiction", fiction: true },
      ] as const,
      agentsLabel: "Agents acting on it",
      agents: [
        { name: "Pricing agent", icon: "price" },
        { name: "Settlement bot", icon: "settle" },
        { name: "Escrow agent", icon: "escrow" },
        { name: "Oracle relay", icon: "oracle" },
      ] as const,
    },
    solution: {
      badge: "Origin proof",
      titleLine1: "Lastre proves the origin",
      titleLine2: "before any token or agent touches the data.",
      aside:
        "Lastre sits beneath the agent economy. It turns physical readings into chain-judged proof, so tokens and agents act on verified origin — never on unverified claims.",
      featuresAria: "What the proof layer delivers",
      features: [
        {
          title: "Physical readings, not claims",
          body: "Field readings from sensors, documents, and APIs are sealed offline at origin — before any model or middleware treats the source as given.",
        },
        {
          title: "Verdicts nothing can fake",
          body: "Lastre seals readings offline with deterministic cryptography. No cloud, no clock, no LLM deciding the outcome — only a chain-judged Valid or Invalid.",
        },
        {
          title: "The layer everything builds on",
          body: "Agents, escrows, and tokenization run on verified origin — a proof layer every downstream action can verify on-chain.",
        },
      ] as const,
    },
    different: {
      kicker: "Why it's different",
      titlePrefix: "Others build agents that consume real-world data. ",
      titleEmphasis: "Lastre proves the data came from reality first.",
      pillarsAria: "What makes Lastre different",
      pillars: [
        {
          title: "Physical provenance",
          body: "Not another API feed or a model's claim. Proof tied to a real-world reading.",
        },
        {
          title: "Offline determinism",
          body: "No cloud, no clock, no LLM deciding the verdict. A seal a machine can't fake.",
        },
        {
          title: "On-chain rejection",
          body: 'Valid and Invalid are both permanent on Casper. Almost no one records the "no."',
        },
      ] as const,
    },
    how: {
      kicker: "How it works",
      title: "From a physical reading to a permanent verdict.",
      tabsAria: "The four steps of the provenance loop",
      stepLabel: "Step",
      steps: [
        {
          tab: "Seal",
          state: "Offline",
          headline: "Seal the origin, offline.",
          bodyLead: "A canonical SHA-256 of the field reading. Same reading, same seal — ",
          bodyEmphasis: "anywhere, with no network and no server",
          bodyTail: ".",
        },
        {
          tab: "Anchor",
          state: "On-chain",
          headline: "Register the reference, on-chain.",
          bodyLead: "The genuine seal is anchored to the asset on ",
          bodyEmphasis: "Casper",
          bodyTail: " — the reference every future reading is measured against.",
        },
        {
          tab: "Attest",
          state: "Agent",
          headline: "The agent attests.",
          bodyLead: "An autonomous agent submits a reading. The seal decides the verdict — the agent, and its LLM, only decide ",
          bodyEmphasis: "what to do next",
          bodyTail: ". Never the truth.",
        },
        {
          tab: "Verdict",
          state: "Permanent",
          headline: "Valid or Invalid, both permanent.",
          bodyLead: "A match is accepted, a mismatch is rejected, and both are written to Casper forever. A rejection is ",
          bodyEmphasis: "proof, not a deleted error",
          bodyTail: ".",
        },
      ] as const,
    },
    proof: {
      kicker: "The proof",
      intro: "Interactive tamper test — change one field, watch the seal diverge.",
      title: "Change one gram, and the network rejects it.",
      lead1Prefix: "Tamper with a single value and the entire seal changes. The chain records ",
      lead1Invalid: "Invalid",
      lead1Suffix: " — permanently, verifiably, by anyone.",
      lead2Prefix: "Most systems hide a failure. Lastre ",
      lead2Emphasis: "carves it into the ledger",
      lead2Suffix: " as ",
      evidenceTerm: "evidence",
      evidenceDef: "A permanent on-chain attestation record, Valid or Invalid.",
      panelAria: "Tamper demo: changing a field breaks the seal and records Invalid on-chain",
      tamperTest: "Tamper test",
      mismatchTitle: "Seal hash mismatch — deterministic rejection",
      liveTitle: "Submitted seal matches reference",
      mismatch: "MISMATCH",
      live: "LIVE",
      swapOrigin: "Swap origin",
      restore: "Restore",
      reference: "Reference",
      submitted: "Submitted",
      copyReference: "Copy reference SHA-256",
      copySubmitted: "Copy submitted SHA-256",
      copy: "Copy",
      anchored: "anchored on Casper",
      diverged: "seal diverged",
      matches: "matches reference",
      valid: "Valid",
      invalid: "Invalid",
      invalidDetail: "written to Casper · permanent proof",
      validDetail: "match accepted · tokenization permitted",
      verifyLink: "Verify on Casper →",
      historyAria: "Recent tamper history",
    },
    demonstration: {
      honestyKicker: "A demonstration, by design",
      honestyIntro: "Honesty is part of the protocol boundary.",
      honestyTitle: "We verify provenance. We don't sell anything.",
      honestyLead:
        "Everything here uses simulated assets and offers no investment, no token sale, and no yield. Lastre is a proof layer — it confers no ownership and no financial right.",
      liveKicker: "Verify it yourself",
      liveTitle: "Live on Casper Testnet. Provable by anyone.",
      liveLead: "The contract is deployed. Real attestations — accepted and rejected — sit on-chain right now.",
      viewExplorer: "View on cspr.live",
      readCode: "Read the code",
      showExplorer: "Show live explorer",
      hideExplorer: "Hide live explorer",
      embedTitle: "Casper Testnet explorer — ProofOfOrigin package",
      embedFallback: "If the embed is blocked,",
      embedFallbackLink: "open cspr.live directly",
    },
    minerals: {
      kicker: "Against illegal mining",
      title: "Provenance for the minerals the world runs on.",
      lead:
        "From gold to lithium to niobium, Lastre traces a lot from a licensed, authorized, cleared origin — mine, processing, transport, export — and anchors the proof at every step. The trust layer for a legal mineral supply chain.",
      caption: "Shown with simulated assets for demonstration.",
    },
    faq: {
      items: [
        {
          q: "Who decides Valid or Invalid?",
          a: "The deterministic SHA-256 seal — never an LLM. The agent only decides pay, skip, or escalate.",
        },
        {
          q: "Is this a token sale or investment?",
          a: "No. Lastre is a proof layer. The public demo uses fictional assets only.",
        },
        {
          q: "Testnet vs mainnet?",
          a: "The live contract is on Casper Testnet. Mainnet deployment will be announced via protocol updates only.",
        },
        {
          q: "What is an attestation?",
          a: "A permanent on-chain record of whether a submitted reading matches the anchored reference seal.",
        },
        {
          q: "Why record Invalid on-chain?",
          a: "Rejections are evidence. Hiding failure breaks auditability for compliance and evaluators.",
        },
        {
          q: "Can I verify without trusting Lastre?",
          a: "Yes. Open the Casper explorer, read verdicts, and run make demo from the repository.",
        },
        {
          q: "What data does the demo use?",
          a: "Simulated mineral lots with fictional origin IDs and masses — no real assets or PII.",
        },
        {
          q: "How do agents interact?",
          a: "Agents submit readings; the seal compares hashes. The LLM never overrides the verdict.",
        },
      ] as const,
    },
    useCases: {
      tabs: [
        { key: "minerals" as const, label: "Minerals", title: "Legal supply chain", body: "Trace licensed origin from mine to export with anchored seals at each handoff." },
        { key: "agents" as const, label: "Agents", title: "Agent guardrails", body: "Autonomous agents act only after origin is verified — never on raw API claims." },
        { key: "compliance" as const, label: "Compliance", title: "Audit trail", body: "Permanent Valid and Invalid records for regulators and internal reviewers." },
      ],
    },
    compare: {
      lede: "Lastre proves origin before any agent acts. Oracles and API attestations assume the source is already trustworthy.",
      columns: { lastro: "Lastre", oracle: "Oracle", api: "API attestation" },
      rows: [
        { label: "Verdict source", lastro: "Deterministic seal", oracle: "External attestor", api: "Provider claim" },
        { label: "Offline proof", lastro: "Yes", oracle: "Partial", api: "No" },
        { label: "Invalid on-chain", lastro: "Permanent", oracle: "Rare", api: "Hidden" },
        { label: "LLM decides truth", lastro: "Never", oracle: "Sometimes", api: "Often" },
      ] as const,
    },
    changelog: {
      entries: [
        { date: "2026-06", text: "Proof panel tamper demo + Casper Testnet counts in hero." },
        { date: "2026-05", text: "Deterministic seal separation documented in README." },
        { date: "2026-04", text: "ProofOfOrigin contract deployed to testnet." },
      ] as const,
    },
    whatWeAreNot: {
      expand: "Expand guardrails",
      hide: "Hide guardrails",
      items: [
        "Not an investment product or token sale",
        "Not a yield or ownership instrument",
        "Not a replacement for legal due diligence",
        "Not a wallet or payment product",
      ] as const,
    },
    terminal: {
      label: "Terminal",
      output: "→ Processing fictional lot…\n→ Verdict: Valid | Invalid on Casper",
      copy: "Copy command",
    },
    sandbox: {
      label: "Sandbox — seal any JSON locally",
      jsonLabel: "JSON reading",
      compute: "Compute SHA-256",
    },
    trust: {
      personasTitle: "Built for the people who verify — not speculate.",
      personas: [
        { title: "Technical evaluator", body: "Run the end-to-end demo and inspect audit output in under five minutes.", label: "Evaluator" },
        { title: "RWA builder", body: "See how a lot moves from artifact → decision → on-chain attestation.", label: "Builder" },
        { title: "Compliance reviewer", body: "Trace rejected lots and permanent Invalid records — not hidden failures.", label: "Compliance" },
      ] as const,
      securityItems: [
        "Deterministic seal — no LLM verdict",
        "Invalid is permanent proof on Casper",
        "Simulated assets only in public demo",
        "No investment or token sale language",
      ] as const,
      complianceChips: ["EU critical raw materials", "OECD due diligence", "Offline chain-of-custody"] as const,
      ghLicense: "License",
      ghStack: "Stack",
      ghDemo: "Demo",
      ghDemoVal: "Fictional lots only",
      testimonialsAria: "Evaluator feedback",
      quotes: [
        { text: "The seal vs. action separation clicked immediately — Invalid as proof is the insight.", role: "Simulated protocol evaluator" },
        { text: "Finally a demo that shows rejection on-chain instead of hiding failures.", role: "Simulated compliance reviewer" },
      ] as const,
      pullQuote:
        "When the data is wrong, the entire stack runs on fiction — unless origin is proven first.",
      pullQuoteAria: "Highlight",
    },
    footer: {
      breadcrumbHome: "Home",
      breadcrumbProof: "Proof demo",
      breadcrumbFooter: "Footer",
      tagline: "Proof before token.",
      desc: "A provenance trust layer for mineral assets. Simulated demo only — no investment, no token sale, no financial rights.",
      copy: "Lastre contributors. All rights reserved.",
      note: "RWA provenance trust layer · Demo uses fictional data",
      columns: [
        {
          title: "Protocol",
          links: ["The trust gap", "Origin proof", "How it works", "Tamper demo", "Live demo", "FAQ"],
        },
        {
          title: "Product",
          links: ["App console", "Use cases", "Comparison", "Trust center"],
        },
        {
          title: "Resources",
          links: ["Documentation", "GitHub", "Case study", "Casper Testnet", "Honesty policy"],
        },
        {
          title: "Legal",
          links: ["License", "Demo disclaimer", "What we are not"],
        },
      ],
    },
    chrome: {
      proofRail: [
        { label: "Physical", href: "#problem" },
        { label: "Seal", href: "#how/seal" },
        { label: "Action", href: "#how/attest" },
        { label: "Verdict", href: "#proof" },
        { label: "Casper", href: "#demo" },
      ] as const,
      tocTitle: "On this page",
      tocAria: "On this page",
      toc: [
        { id: "problem", label: "Trust gap" },
        { id: "solution", label: "Origin proof" },
        { id: "how", label: "How it works" },
        { id: "proof", label: "Tamper demo" },
        { id: "different", label: "Different" },
        { id: "minerals", label: "Minerals" },
        { id: "demo", label: "Live demo" },
        { id: "faq", label: "FAQ" },
      ] as const,
    },
    cmd: {
      ariaLabel: "Quick actions",
      search: "Search…",
      searchAria: "Search actions",
      close: "Close",
      actions: [
        { id: "demo", label: "Try tamper demo" },
        { id: "app", label: "Open app console" },
        { id: "how-seal", label: "Jump to Seal step" },
        { id: "docs", label: "Read documentation" },
        { id: "github", label: "GitHub repository" },
        { id: "explorer", label: "Casper Testnet explorer" },
        { id: "terminal", label: "Run make demo" },
      ] as const,
    },
    boundary: {
      title: "Protocol boundary",
      chip: "DEMO ONLY",
      inScopeLabel: "In scope",
      outScopeLabel: "Out of scope",
      inScope: [
        "Deterministic provenance seal",
        "On-chain Valid / Invalid verdict",
        "Simulated demo assets",
      ] as const,
      outScope: [
        "Investment or yield",
        "Token sale or ownership",
        "Financial rights of any kind",
      ] as const,
      foot: "Lastre confers proof, not ownership. The line is part of the protocol.",
    },
    explorer: {
      network: "Casper Testnet · casper-test",
      package: "Package",
      accepted: "Accepted",
      rejected: "Rejected",
      valid: "Valid",
      invalid: "Invalid",
      live: "LIVE",
      sync: "SYNC",
    },
    meta: {
      title: "Lastre — Proof before token.",
      description:
        "Lastre verifies physical origin offline with deterministic SHA-256 seals, then anchors Valid or Invalid verdicts on Casper — before any token or agent acts on the data.",
    },
  },
  pt: {
    nav: {
      protocol: "Protocolo",
      how: "Como",
      proof: "Prova",
      demo: "Demo",
      faq: "FAQ",
      app: "App",
      docs: "Docs",
      openMenu: "Abrir menu",
      closeMenu: "Fechar menu",
    },
    hero: {
      eyebrow: "Casper Testnet",
      scrollExplore: "Explorar",
      scrollLabel: "Rolar para saber mais",
      mediaAlt:
        "Mina a céu aberto ao amanhecer: trabalhadores e caminhões em um site de extração licenciado usado na demo fictícia de proveniência da Lastre.",
      proofPanel: {
        label: "Selo de proveniência",
        ariaLabel: "Selo de proveniência — válido no Casper Testnet",
        steps: ["Origem física", "Selo SHA-256", "Âncora Casper"] as const,
      },
    },
    problem: {
      kicker: "A lacuna de confiança",
      titlePrefix: "A economia de agentes está sendo construída sobre ",
      titleStrike: "alegações de origem não verificadas",
      titleSuffix: ".",
      subtitle: "Uma rede inteligente para agentes e ativos — perto dos usuários, longe da prova.",
      lanes: [
        {
          title: "Leituras em todo lugar",
          body: "Sensores, documentos e APIs emitem dados de todos os continentes — muitas vezes sem cadeia de custódia.",
        },
        {
          title: "Alegações aceitas como estão",
          body: "Modelos e middleware tratam a fonte como dada. A pergunta sobre origem raramente é feita.",
        },
        {
          title: "Ficção em escala",
          body: "Agentes, escrows e liquidações herdam o que foi alegado — válido ou não.",
        },
      ] as const,
      lead1:
        "Agentes autônomos e ativos tokenizados do mundo real já interagem com dados físicos. Quase nada prova que uma leitura veio de uma origem real e legal. A maioria dos sistemas aceita o que uma API ou modelo alega.",
      lead2Prefix: "Quando os dados estão errados, toda a stack — agentes, escrows, liquidações — ",
      lead2Emphasis: "opera sobre ficção",
      lead2Suffix: ".",
      panelAria:
        "Stack atual: uma alegação não verificada propagando pelo sistema sem prova de origem",
      panelTitle: "Sem prova",
      gapSteps: [
        { label: "Leitura física", detail: "sensor · documento · API" },
        { label: "Alegação API / modelo", detail: "aceita como está" },
        { label: "Sem prova de origem", detail: "a pergunta é ignorada", missing: true },
        { label: "Agentes · escrows · liquidações", detail: "operando sobre ficção", fiction: true },
      ] as const,
      agentsLabel: "Agentes que agem sobre isso",
      agents: [
        { name: "Agente de preço", icon: "price" },
        { name: "Bot de liquidação", icon: "settle" },
        { name: "Agente de escrow", icon: "escrow" },
        { name: "Relay de oráculo", icon: "oracle" },
      ] as const,
    },
    solution: {
      badge: "Prova de origem",
      titleLine1: "A Lastre prova a origem",
      titleLine2: "antes de qualquer token ou agente tocar nos dados.",
      aside:
        "A Lastre fica abaixo da economia de agentes. Transforma leituras físicas em prova julgada on-chain, para que tokens e agentes ajam sobre origem verificada — nunca sobre alegações não verificadas.",
      featuresAria: "O que a camada de prova entrega",
      features: [
        {
          title: "Leituras físicas, não alegações",
          body: "Leituras de campo de sensores, documentos e APIs são seladas offline na origem — antes de qualquer modelo ou middleware tratar a fonte como dada.",
        },
        {
          title: "Vereditos que nada pode falsificar",
          body: "A Lastre sela leituras offline com criptografia determinística. Sem nuvem, sem relógio, sem LLM decidindo o resultado — apenas Valid ou Invalid julgado pela chain.",
        },
        {
          title: "A camada sobre a qual tudo se constrói",
          body: "Agentes, escrows e tokenização operam sobre origem verificada — uma camada de prova que toda ação downstream pode verificar on-chain.",
        },
      ] as const,
    },
    different: {
      kicker: "Por que é diferente",
      titlePrefix: "Outros constroem agentes que consomem dados do mundo real. ",
      titleEmphasis: "A Lastre prova que os dados vieram da realidade primeiro.",
      pillarsAria: "O que torna a Lastre diferente",
      pillars: [
        {
          title: "Proveniência física",
          body: "Não é mais um feed de API ou alegação de um modelo. Prova ligada a uma leitura do mundo real.",
        },
        {
          title: "Determinismo offline",
          body: "Sem nuvem, sem relógio, sem LLM decidindo o veredito. Um selo que uma máquina não pode falsificar.",
        },
        {
          title: "Rejeição on-chain",
          body: 'Valid e Invalid são permanentes no Casper. Quase ninguém registra o "não".',
        },
      ] as const,
    },
    how: {
      kicker: "Como funciona",
      title: "De uma leitura física a um veredito permanente.",
      tabsAria: "As quatro etapas do loop de proveniência",
      stepLabel: "Etapa",
      steps: [
        {
          tab: "Selar",
          state: "Offline",
          headline: "Sele a origem, offline.",
          bodyLead: "Um SHA-256 canônico da leitura de campo. Mesma leitura, mesmo selo — ",
          bodyEmphasis: "em qualquer lugar, sem rede e sem servidor",
          bodyTail: ".",
        },
        {
          tab: "Ancorar",
          state: "On-chain",
          headline: "Registre a referência, on-chain.",
          bodyLead: "O selo genuíno é ancorado ao ativo no ",
          bodyEmphasis: "Casper",
          bodyTail: " — a referência contra a qual toda leitura futura é medida.",
        },
        {
          tab: "Atestar",
          state: "Agente",
          headline: "O agente atesta.",
          bodyLead: "Um agente autônomo submete uma leitura. O selo decide o veredito — o agente, e seu LLM, só decidem ",
          bodyEmphasis: "o que fazer em seguida",
          bodyTail: ". Nunca a verdade.",
        },
        {
          tab: "Veredito",
          state: "Permanente",
          headline: "Valid ou Invalid, ambos permanentes.",
          bodyLead: "Uma correspondência é aceita, uma divergência é rejeitada, e ambas são escritas no Casper para sempre. Uma rejeição é ",
          bodyEmphasis: "prova, não um erro apagado",
          bodyTail: ".",
        },
      ] as const,
    },
    proof: {
      kicker: "A prova",
      intro: "Teste interativo de adulteração — mude um campo, veja o selo divergir.",
      title: "Mude um grama, e a rede rejeita.",
      lead1Prefix: "Adultere um único valor e todo o selo muda. A chain registra ",
      lead1Invalid: "Invalid",
      lead1Suffix: " — permanentemente, verificável por qualquer um.",
      lead2Prefix: "A maioria dos sistemas esconde uma falha. A Lastre ",
      lead2Emphasis: "grava no ledger",
      lead2Suffix: " como ",
      evidenceTerm: "evidência",
      evidenceDef: "Um registro permanente on-chain de atestação, Valid ou Invalid.",
      panelAria: "Demo de adulteração: mudar um campo quebra o selo e registra Invalid on-chain",
      tamperTest: "Teste de adulteração",
      mismatchTitle: "Divergência de hash do selo — rejeição determinística",
      liveTitle: "Selo submetido corresponde à referência",
      mismatch: "DIVERGÊNCIA",
      live: "AO VIVO",
      swapOrigin: "Trocar origem",
      restore: "Restaurar",
      reference: "Referência",
      submitted: "Submetido",
      copyReference: "Copiar SHA-256 de referência",
      copySubmitted: "Copiar SHA-256 submetido",
      copy: "Copiar",
      anchored: "ancorado no Casper",
      diverged: "selo divergiu",
      matches: "corresponde à referência",
      valid: "Valid",
      invalid: "Invalid",
      invalidDetail: "escrito no Casper · prova permanente",
      validDetail: "correspondência aceita · tokenização permitida",
      verifyLink: "Verificar no Casper →",
      historyAria: "Histórico recente de adulteração",
    },
    demonstration: {
      honestyKicker: "Uma demonstração, por design",
      honestyIntro: "Honestidade faz parte da fronteira do protocolo.",
      honestyTitle: "Verificamos proveniência. Não vendemos nada.",
      honestyLead:
        "Tudo aqui usa ativos simulados e não oferece investimento, venda de token ou rendimento. A Lastre é uma camada de prova — não confere propriedade nem direito financeiro.",
      liveKicker: "Verifique você mesmo",
      liveTitle: "Ao vivo no Casper Testnet. Provável por qualquer um.",
      liveLead: "O contrato está implantado. Atestações reais — aceitas e rejeitadas — estão on-chain agora.",
      viewExplorer: "Ver no cspr.live",
      readCode: "Ler o código",
      showExplorer: "Mostrar explorer ao vivo",
      hideExplorer: "Ocultar explorer ao vivo",
      embedTitle: "Explorer Casper Testnet — pacote ProofOfOrigin",
      embedFallback: "Se o embed for bloqueado,",
      embedFallbackLink: "abra cspr.live diretamente",
    },
    minerals: {
      kicker: "Contra mineração ilegal",
      title: "Proveniência para os minerais que movem o mundo.",
      lead:
        "Do ouro ao lítio ao nióbio, a Lastre rastreia um lote desde uma origem licenciada, autorizada e liberada — mina, processamento, transporte, exportação — e ancora a prova em cada etapa. A camada de confiança para uma cadeia mineral legal.",
      caption: "Exibido com ativos simulados para demonstração.",
    },
    faq: {
      items: [
        {
          q: "Quem decide Valid ou Invalid?",
          a: "O selo SHA-256 determinístico — nunca um LLM. O agente só decide pagar, pular ou escalar.",
        },
        {
          q: "Isso é venda de token ou investimento?",
          a: "Não. A Lastre é uma camada de prova. A demo pública usa apenas ativos fictícios.",
        },
        {
          q: "Testnet vs mainnet?",
          a: "O contrato ativo está no Casper Testnet. O deploy em mainnet será anunciado apenas via atualizações do protocolo.",
        },
        {
          q: "O que é uma atestação?",
          a: "Um registro permanente on-chain de se uma leitura submetida corresponde ao selo de referência ancorado.",
        },
        {
          q: "Por que registrar Invalid on-chain?",
          a: "Rejeições são evidência. Esconder falhas quebra a auditabilidade para compliance e avaliadores.",
        },
        {
          q: "Posso verificar sem confiar na Lastre?",
          a: "Sim. Abra o explorer Casper, leia os vereditos e execute make demo do repositório.",
        },
        {
          q: "Quais dados a demo usa?",
          a: "Lotes minerais simulados com IDs de origem e massas fictícias — sem ativos reais ou PII.",
        },
        {
          q: "Como os agentes interagem?",
          a: "Agentes submetem leituras; o selo compara hashes. O LLM nunca sobrescreve o veredito.",
        },
      ] as const,
    },
    useCases: {
      tabs: [
        { key: "minerals" as const, label: "Minerais", title: "Cadeia legal", body: "Rastreie origem licenciada da mina à exportação com selos ancorados em cada handoff." },
        { key: "agents" as const, label: "Agentes", title: "Guardrails de agente", body: "Agentes autônomos só agem após origem verificada — nunca sobre alegações brutas de API." },
        { key: "compliance" as const, label: "Compliance", title: "Trilha de auditoria", body: "Registros permanentes de Valid e Invalid para reguladores e revisores internos." },
      ],
    },
    compare: {
      lede: "A Lastre prova origem antes de qualquer agente agir. Oráculos e atestações de API assumem que a fonte já é confiável.",
      columns: { lastro: "Lastre", oracle: "Oráculo", api: "Atestação API" },
      rows: [
        { label: "Fonte do veredito", lastro: "Selo determinístico", oracle: "Atestador externo", api: "Alegação do provedor" },
        { label: "Prova offline", lastro: "Sim", oracle: "Parcial", api: "Não" },
        { label: "Invalid on-chain", lastro: "Permanente", oracle: "Raro", api: "Oculto" },
        { label: "LLM decide verdade", lastro: "Nunca", oracle: "Às vezes", api: "Frequentemente" },
      ] as const,
    },
    changelog: {
      entries: [
        { date: "2026-06", text: "Demo de adulteração no painel de prova + contagens Casper Testnet no hero." },
        { date: "2026-05", text: "Separação do selo determinístico documentada no README." },
        { date: "2026-04", text: "Contrato ProofOfOrigin implantado no testnet." },
      ] as const,
    },
    whatWeAreNot: {
      expand: "Expandir guardrails",
      hide: "Ocultar guardrails",
      items: [
        "Não é produto de investimento ou venda de token",
        "Não é instrumento de rendimento ou propriedade",
        "Não substitui due diligence legal",
        "Não é carteira ou produto de pagamento",
      ] as const,
    },
    terminal: {
      label: "Terminal",
      output: "→ Processando lote fictício…\n→ Veredito: Valid | Invalid no Casper",
      copy: "Copiar comando",
    },
    sandbox: {
      label: "Sandbox — sele qualquer JSON localmente",
      jsonLabel: "Leitura JSON",
      compute: "Calcular SHA-256",
    },
    trust: {
      personasTitle: "Feito para quem verifica — não especula.",
      personas: [
        { title: "Avaliador técnico", body: "Execute a demo end-to-end e inspecione a saída de auditoria em menos de cinco minutos.", label: "Avaliador" },
        { title: "Construtor RWA", body: "Veja como um lote vai de artefato → decisão → atestação on-chain.", label: "Construtor" },
        { title: "Revisor de compliance", body: "Rastreie lotes rejeitados e registros Invalid permanentes — não falhas ocultas.", label: "Compliance" },
      ] as const,
      securityItems: [
        "Selo determinístico — sem veredito de LLM",
        "Invalid é prova permanente no Casper",
        "Apenas ativos simulados na demo pública",
        "Sem linguagem de investimento ou venda de token",
      ] as const,
      complianceChips: ["Matérias-primas críticas UE", "Due diligence OCDE", "Cadeia de custódia offline"] as const,
      ghLicense: "Licença",
      ghStack: "Stack",
      ghDemo: "Demo",
      ghDemoVal: "Apenas lotes fictícios",
      testimonialsAria: "Feedback de avaliadores",
      quotes: [
        { text: "A separação selo vs. ação fez sentido imediatamente — Invalid como prova é o insight.", role: "Avaliador de protocolo simulado" },
        { text: "Finalmente uma demo que mostra rejeição on-chain em vez de esconder falhas.", role: "Revisor de compliance simulado" },
      ] as const,
      pullQuote:
        "Quando os dados estão errados, toda a stack opera sobre ficção — a menos que a origem seja provada primeiro.",
      pullQuoteAria: "Destaque",
    },
    footer: {
      breadcrumbHome: "Início",
      breadcrumbProof: "Demo de prova",
      breadcrumbFooter: "Rodapé",
      tagline: "Prova antes do token.",
      desc: "Camada de confiança de proveniência para ativos minerais. Apenas demo simulada — sem investimento, venda de token ou direitos financeiros.",
      copy: "Contribuidores Lastre. Todos os direitos reservados.",
      note: "Camada de confiança RWA · Demo usa dados fictícios",
      columns: [
        {
          title: "Protocolo",
          links: ["A lacuna de confiança", "Prova de origem", "Como funciona", "Demo de adulteração", "Demo ao vivo", "FAQ"],
        },
        {
          title: "Produto",
          links: ["Console do app", "Casos de uso", "Comparação", "Centro de confiança"],
        },
        {
          title: "Recursos",
          links: ["Documentação", "GitHub", "Estudo de caso", "Casper Testnet", "Política de honestidade"],
        },
        {
          title: "Legal",
          links: ["Licença", "Aviso da demo", "O que não somos"],
        },
      ],
    },
    chrome: {
      proofRail: [
        { label: "Físico", href: "#problem" },
        { label: "Selo", href: "#how/seal" },
        { label: "Ação", href: "#how/attest" },
        { label: "Veredito", href: "#proof" },
        { label: "Casper", href: "#demo" },
      ] as const,
      tocTitle: "Nesta página",
      tocAria: "Nesta página",
      toc: [
        { id: "problem", label: "Lacuna de confiança" },
        { id: "solution", label: "Prova de origem" },
        { id: "how", label: "Como funciona" },
        { id: "proof", label: "Demo de adulteração" },
        { id: "different", label: "Diferente" },
        { id: "minerals", label: "Minerais" },
        { id: "demo", label: "Demo ao vivo" },
        { id: "faq", label: "FAQ" },
      ] as const,
    },
    cmd: {
      ariaLabel: "Ações rápidas",
      search: "Buscar…",
      searchAria: "Buscar ações",
      close: "Fechar",
      actions: [
        { id: "demo", label: "Testar adulteração" },
        { id: "app", label: "Abrir console do app" },
        { id: "how-seal", label: "Ir para etapa Selar" },
        { id: "docs", label: "Ler documentação" },
        { id: "github", label: "Repositório GitHub" },
        { id: "explorer", label: "Explorer Casper Testnet" },
        { id: "terminal", label: "Executar make demo" },
      ] as const,
    },
    boundary: {
      title: "Fronteira do protocolo",
      chip: "APENAS DEMO",
      inScopeLabel: "No escopo",
      outScopeLabel: "Fora do escopo",
      inScope: [
        "Selo de proveniência determinístico",
        "Veredito Valid / Invalid on-chain",
        "Ativos simulados na demo",
      ] as const,
      outScope: [
        "Investimento ou rendimento",
        "Venda de token ou propriedade",
        "Direitos financeiros de qualquer tipo",
      ] as const,
      foot: "A Lastre confere prova, não propriedade. A linha faz parte do protocolo.",
    },
    explorer: {
      network: "Casper Testnet · casper-test",
      package: "Pacote",
      accepted: "Aceitos",
      rejected: "Rejeitados",
      valid: "Valid",
      invalid: "Invalid",
      live: "AO VIVO",
      sync: "SYNC",
    },
    meta: {
      title: "Lastre — Prova antes do token.",
      description:
        "A Lastre verifica origem física offline com selos SHA-256 determinísticos e ancora vereditos Valid ou Invalid no Casper — antes de qualquer token ou agente agir sobre os dados.",
    },
  },
} as const;

export type SiteContent = (typeof content)[Locale];

export function getContent(locale: Locale): SiteContent {
  return content[locale];
}
