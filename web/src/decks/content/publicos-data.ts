import type { L10n } from "../types";

export type Publico = L10n;

export type CamadaId =
  | "origem"
  | "prova"
  | "mercado"
  | "capital"
  | "defi"
  | "infra"
  | "estado";

export type Camada = {
  id: CamadaId;
  num: string;
  name: L10n;
  /** O que a camada faz na cadeia. Uma linha. */
  faz: L10n;
  /** O que ela quer da Lastre. Uma linha. Nunca uma promessa nossa. */
  quer: L10n;
  publicos: Publico[];
};

export const CAMADAS: Camada[] = [
  {
    id: "origem",
    num: "01",
    name: { pt: "Origem", en: "Origin" },
    faz: {
      pt: "Gera o fato físico — minério, madeira, energia, carbono.",
      en: "Generates the physical fact — ore, timber, power, carbon.",
    },
    quer: {
      pt: "Provar que o que tem é real, para vender com prêmio ou dar em garantia.",
      en: "To prove what it holds is real, to sell at a premium or pledge it.",
    },
    publicos: [
      { pt: "Titular de direito minerário", en: "Mining rights holder" },
      { pt: "Mineradora júnior e média", en: "Junior and mid-tier miner" },
      { pt: "Proprietário de terra", en: "Landowner" },
      { pt: "Garimpo em formalização (PLG)", en: "Artisanal mine going formal (PLG)" },
      { pt: "Madeireira e concessionária florestal", en: "Lumber mill and forest concessionaire" },
      { pt: "Produtor rural com ativo ambiental", en: "Rural producer with environmental asset" },
      { pt: "Gerador de energia", en: "Power generator" },
      { pt: "Reciclador e mineração urbana", en: "Recycler and urban mining" },
    ],
  },
  {
    id: "prova",
    num: "02",
    name: { pt: "Prova", en: "Proof" },
    faz: {
      pt: "Produz e valida a leitura: pesa, ensaia, audita, custodia.",
      en: "Produces and validates the reading: weighs, assays, audits, custodies.",
    },
    quer: {
      pt: "Um selo com valor probatório que o laudo em PDF não tem.",
      en: "A seal with the evidentiary weight a PDF report does not carry.",
    },
    publicos: [
      { pt: "Operador de balança", en: "Weighbridge operator" },
      { pt: "Laboratório de ensaio e geoquímica", en: "Assay and geochemistry lab" },
      { pt: "Certificadora", en: "Certification body" },
      { pt: "Responsável técnico (ART)", en: "Technical lead (ART)" },
      { pt: "Auditor independente", en: "Independent auditor" },
      { pt: "Sensoriamento remoto e IoT", en: "Remote sensing and IoT" },
      { pt: "Armazém geral e custodiante físico", en: "General warehouse and physical custodian" },
      { pt: "Transportadora e cadeia de custódia", en: "Carrier and chain of custody" },
    ],
  },
  {
    id: "mercado",
    num: "03",
    name: { pt: "Mercado", en: "Market" },
    faz: {
      pt: "Compra o físico e decide se origem vale prêmio.",
      en: "Buys the physical and decides whether origin earns a premium.",
    },
    quer: {
      pt: "Comprar sem herdar passivo de origem.",
      en: "To buy without inheriting the liability of origin.",
    },
    publicos: [
      { pt: "Trading house e comprador industrial", en: "Trading house and industrial buyer" },
      { pt: "Refinaria e beneficiadora", en: "Refinery and processor" },
      { pt: "Comprador com mandato regulatório", en: "Buyer under regulatory mandate" },
      { pt: "Off-taker de longo prazo", en: "Long-term off-taker" },
      { pt: "Exportador e despachante", en: "Exporter and customs broker" },
    ],
  },
  {
    id: "capital",
    num: "04",
    name: { pt: "Capital", en: "Capital" },
    faz: {
      pt: "Financia a operação contra produção futura.",
      en: "Funds the operation against future production.",
    },
    quer: {
      pt: "Precificar risco com evidência, não com declaração.",
      en: "To price risk on evidence, not on a declaration.",
    },
    publicos: [
      { pt: "Banco de capital de giro", en: "Working-capital bank" },
      { pt: "Fundo de royalty e streaming", en: "Royalty and streaming fund" },
      { pt: "Seguradora e resseguradora", en: "Insurer and reinsurer" },
      { pt: "Investidor institucional e family office", en: "Institutional investor and family office" },
      { pt: "Investidor qualificado", en: "Qualified investor" },
      { pt: "Investidor de varejo (Res. 88)", en: "Retail investor (Res. 88)" },
      { pt: "Fomento público e fundo climático", en: "Public development and climate fund" },
    ],
  },
  {
    id: "defi",
    num: "05",
    name: { pt: "DeFi", en: "DeFi" },
    faz: {
      pt: "Opera o token: liquidez, spread, colateral, liquidação.",
      en: "Operates the token: liquidity, spread, collateral, liquidation.",
    },
    quer: {
      pt: "Catálogo de origens legível por máquina, com redenção pelo físico.",
      en: "A machine-readable catalogue of origins, redeemable for the physical.",
    },
    publicos: [
      { pt: "Curador de risco", en: "Risk curator" },
      { pt: "Provedor de liquidez passivo", en: "Passive liquidity provider" },
      { pt: "Market maker profissional", en: "Professional market maker" },
      { pt: "Arbitrador", en: "Arbitrageur" },
      { pt: "Tomador colateralizado", en: "Collateralised borrower" },
      { pt: "Liquidante", en: "Liquidator" },
      { pt: "Yield farmer mercenário", en: "Mercenary yield farmer" },
    ],
  },
  {
    id: "infra",
    num: "06",
    name: { pt: "Infraestrutura", en: "Infrastructure" },
    faz: {
      pt: "Emite, custodia, cota e distribui — e consome dado sem ser humano.",
      en: "Issues, custodies, quotes and distributes — and consumes data without being human.",
    },
    quer: {
      pt: "O selo como condição de emissão e como chamada de API paga.",
      en: "The seal as a condition of issuance and as a paid API call.",
    },
    publicos: [
      { pt: "Emissor e estruturador (SPV)", en: "Issuer and structurer (SPV)" },
      { pt: "Custodiante de chave", en: "Key custodian" },
      { pt: "Oráculo de preço", en: "Price oracle" },
      { pt: "Corretora e VASP autorizado", en: "Broker and authorised VASP" },
      { pt: "Agente de IA autônomo (x402)", en: "Autonomous AI agent (x402)" },
      { pt: "Canal white-label", en: "White-label channel" },
      { pt: "Builder e desenvolvedor", en: "Builder and developer" },
    ],
  },
  {
    id: "estado",
    num: "07",
    name: { pt: "Estado", en: "State" },
    faz: {
      pt: "Cria a obrigação que move todo o resto da cadeia.",
      en: "Creates the obligation that moves everything else in the chain.",
    },
    quer: {
      pt: "Rastreabilidade — e, no caso da ANM, é comprador.",
      en: "Traceability — and, in ANM's case, it is a buyer.",
    },
    publicos: [
      { pt: "ANM", en: "ANM" },
      { pt: "Receita Federal e SEFAZ", en: "Federal Revenue and SEFAZ" },
      { pt: "CVM", en: "CVM" },
      { pt: "Banco Central", en: "Central Bank" },
      { pt: "Órgão ambiental (IBAMA)", en: "Environmental agency (IBAMA)" },
      { pt: "Ministério Público e polícia", en: "Public prosecutor and police" },
      { pt: "Comunidade impactada e território indígena", en: "Impacted community and indigenous territory" },
      { pt: "Imprensa investigativa e ONG", en: "Investigative press and NGO" },
    ],
  },
];

export const camada = (id: CamadaId) => CAMADAS.find((c) => c.id === id)!;

export const TOTAL_PUBLICOS = CAMADAS.reduce((n, c) => n + c.publicos.length, 0);
