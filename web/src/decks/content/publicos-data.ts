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
  /** O que a camada faz na cadeia. Uma linha, sem jargão. */
  faz: L10n;
  /** O que ela quer da Lastre. Uma linha. Nunca uma promessa nossa. */
  quer: L10n;
  publicos: Publico[];
};

/* Os públicos entram numa frase corrida, separados por vírgula — por isso
 * cada rótulo começa em minúscula, salvo nome próprio. Nada de jargão:
 * quem lê o deck não precisa saber o que é off-taker ou SPV. */

export const CAMADAS: Camada[] = [
  {
    id: "origem",
    num: "01",
    name: { pt: "Origem", en: "Origin" },
    faz: {
      pt: "Tira do chão o que vai ser vendido: minério, madeira, energia, carbono.",
      en: "Takes what will be sold out of the ground: ore, timber, power, carbon.",
    },
    quer: {
      pt: "Provar que o que tem é de verdade, para vender mais caro ou dar como garantia.",
      en: "To prove what it holds is real, to sell it dearer or pledge it as collateral.",
    },
    publicos: [
      { pt: "quem tem o direito de minerar", en: "holders of mining rights" },
      { pt: "mineradora pequena e média", en: "small and mid-sized miners" },
      { pt: "dono da terra", en: "landowners" },
      { pt: "garimpo se legalizando", en: "artisanal mines going legal" },
      { pt: "madeireira e concessão de floresta", en: "timber mills and forest concessions" },
      { pt: "produtor rural com área preservada", en: "farmers with preserved land" },
      { pt: "gerador de energia", en: "power generators" },
      { pt: "reciclagem e sucata", en: "recycling and scrap" },
    ],
  },
  {
    id: "prova",
    num: "02",
    name: { pt: "Prova", en: "Proof" },
    faz: {
      pt: "Pesa, analisa, audita e guarda. É quem confere se o material existe mesmo.",
      en: "Weighs, tests, audits and stores. It is who checks the material is really there.",
    },
    quer: {
      pt: "Um selo que valha como prova. Um laudo em PDF não vale.",
      en: "A seal that counts as proof. A PDF report does not.",
    },
    publicos: [
      { pt: "balança de pesagem", en: "weighbridges" },
      { pt: "laboratório de análise", en: "testing labs" },
      { pt: "certificadora", en: "certifiers" },
      { pt: "engenheiro responsável", en: "signing engineers" },
      { pt: "auditor independente", en: "independent auditors" },
      { pt: "satélite e sensores em campo", en: "satellites and field sensors" },
      { pt: "armazém e cofre", en: "warehouses and vaults" },
      { pt: "transporte com rastreio da carga", en: "tracked transport" },
    ],
  },
  {
    id: "mercado",
    num: "03",
    name: { pt: "Mercado", en: "Market" },
    faz: {
      pt: "Compra o material e decide se a origem vale pagar mais caro.",
      en: "Buys the material and decides whether origin is worth paying more for.",
    },
    quer: {
      pt: "Comprar sem herdar o problema de quem produziu.",
      en: "To buy without inheriting the producer's problem.",
    },
    publicos: [
      { pt: "trading e indústria compradora", en: "traders and industrial buyers" },
      { pt: "refinaria e beneficiamento", en: "refineries and processing plants" },
      { pt: "comprador obrigado por lei a saber a origem", en: "buyers required by law to know the origin" },
      { pt: "comprador com contrato de longo prazo", en: "buyers on long-term contracts" },
      { pt: "exportador e despachante", en: "exporters and customs agents" },
    ],
  },
  {
    id: "capital",
    num: "04",
    name: { pt: "Capital", en: "Capital" },
    faz: {
      pt: "Põe dinheiro hoje contra a produção de amanhã.",
      en: "Puts money in today against tomorrow's production.",
    },
    quer: {
      pt: "Medir o risco por prova, não por promessa.",
      en: "To price risk on proof, not on a promise.",
    },
    publicos: [
      { pt: "banco que financia o dia a dia", en: "banks funding day-to-day operations" },
      { pt: "fundo que compra produção futura", en: "funds buying future production" },
      { pt: "seguradora", en: "insurers" },
      { pt: "fundo e gestora de fortunas", en: "funds and family offices" },
      { pt: "investidor qualificado", en: "qualified investors" },
      { pt: "pequeno investidor", en: "retail investors" },
      { pt: "banco público e fundo do clima", en: "public banks and climate funds" },
    ],
  },
  {
    id: "defi",
    num: "05",
    name: { pt: "DeFi", en: "DeFi" },
    faz: {
      pt: "Compra e vende o token o dia inteiro, aceita como garantia e cobra a dívida.",
      en: "Buys and sells the token all day, takes it as collateral and calls in the debt.",
    },
    quer: {
      pt: "Uma lista de origens que a máquina consiga ler, e poder trocar o token pelo material.",
      en: "A list of origins a machine can read, and the right to swap the token for the material.",
    },
    publicos: [
      { pt: "quem define o risco aceito", en: "those who set the risk accepted" },
      { pt: "quem deixa dinheiro parado rendendo", en: "those parking money to earn yield" },
      { pt: "quem sustenta o preço na tela", en: "those holding the price on screen" },
      { pt: "quem lucra na diferença de preço", en: "those profiting on the price gap" },
      { pt: "quem toma emprestado dando garantia", en: "those borrowing against collateral" },
      { pt: "quem executa a garantia", en: "those seizing the collateral" },
      { pt: "dinheiro que entra e sai atrás de rendimento", en: "money in and out chasing yield" },
    ],
  },
  {
    id: "infra",
    num: "06",
    name: { pt: "Infraestrutura", en: "Infrastructure" },
    faz: {
      pt: "Emite, guarda, cota e distribui o token — e alimenta sistemas que leem dado sozinhos.",
      en: "Issues, holds, prices and distributes the token — and feeds systems that read data on their own.",
    },
    quer: {
      pt: "O selo como condição para emitir, e como consulta que se paga.",
      en: "The seal as a condition to issue, and as a query that pays for itself.",
    },
    publicos: [
      { pt: "quem emite o token", en: "token issuers" },
      { pt: "quem guarda a chave", en: "key custodians" },
      { pt: "quem leva o preço para dentro do sistema", en: "those feeding price into the system" },
      { pt: "corretora autorizada", en: "licensed brokers" },
      { pt: "agente de IA que compra sozinho", en: "AI agents that buy on their own" },
      { pt: "parceiro que revende com a marca dele", en: "partners reselling under their own brand" },
      { pt: "desenvolvedor", en: "developers" },
    ],
  },
  {
    id: "estado",
    num: "07",
    name: { pt: "Estado", en: "State" },
    faz: {
      pt: "Cria a obrigação que faz o resto da cadeia se mexer.",
      en: "Creates the obligation that makes the rest of the chain move.",
    },
    quer: {
      pt: "Saber de onde veio cada carga. E, no caso da ANM, também é comprador.",
      en: "To know where each load came from. And, in ANM's case, it is also a buyer.",
    },
    publicos: [
      { pt: "ANM", en: "ANM" },
      { pt: "Receita Federal e Sefaz", en: "Federal Revenue and state tax offices" },
      { pt: "CVM", en: "CVM" },
      { pt: "Banco Central", en: "the Central Bank" },
      { pt: "Ibama", en: "Ibama" },
      { pt: "Ministério Público e polícia", en: "prosecutors and police" },
      { pt: "comunidade afetada e terra indígena", en: "affected communities and indigenous land" },
      { pt: "imprensa e ONG", en: "the press and NGOs" },
    ],
  },
];

export const camada = (id: CamadaId) => CAMADAS.find((c) => c.id === id)!;

export const TOTAL_PUBLICOS = CAMADAS.reduce((n, c) => n + c.publicos.length, 0);
