import type { DeckLocale, L10n } from "./types";

/* O corpus não é um deck: é um documento longo, servido inteiro como HTML
 * estático em /corpus (trancado pelo mesmo portão, ver web/functions/corpus).
 * Ele já se divide em partes por dentro — cada parte é um cartão, e a rota
 * #/parteN abre a parte sozinha. A gaveta só repete esses cartões, para que
 * ninguém precise abrir o documento inteiro para achar uma parte. */

const BASE = "/corpus/";

export type CorpusPart = {
  /** Numeral que vai na etiqueta do cartão. */
  numeral: string;
  /** Âncora da parte dentro do documento, por língua. Parte sem tradução
   *  aponta para a folha em português — o documento troca de língua sozinho. */
  anchor: Record<DeckLocale, string>;
  title: L10n;
  summary: L10n;
  /** Línguas em que a parte existe, na ordem em que aparecem na etiqueta. */
  langs: string[];
};

export const corpusUpdated = "07.09.2026";

export const corpusHref = (part: CorpusPart, locale: DeckLocale): string =>
  `${BASE}#/${part.anchor[locale]}`;

/** O documento inteiro, na ordem em que foi escrito. */
export const corpusAll = `${BASE}#/all`;

export const corpusParts: CorpusPart[] = [
  {
    numeral: "I",
    anchor: { pt: "parte1", en: "en-parte1" },
    title: { pt: "A tese do país", en: "The country thesis" },
    summary: {
      pt: "Terras raras e o futuro do Brasil: o mapa de poder, onde a China sangra, o Brasil real, as seis travas, a auditoria das cinco apostas e a economia da tese.",
      en: "Rare earths and Brazil's future: the map of power, where China bleeds, the real Brazil, the six locks, the audit of the five bets and the economics of the thesis.",
    },
    langs: ["PT", "EN"],
  },
  {
    numeral: "II",
    anchor: { pt: "parte2", en: "en-parte2" },
    title: { pt: "A camada de origem", en: "The provenance layer" },
    summary: {
      pt: "Informação assimétrica, verificação a custo marginal zero, o espaço lastreável e o comprador obrigado — o trilho de prova e liquidação para ativos do mundo real.",
      en: "Asymmetric information, verification at zero marginal cost, the backable space and the obligated buyer — the rail of proof and settlement for real-world assets.",
    },
    langs: ["PT", "EN"],
  },
  {
    numeral: "III",
    anchor: { pt: "parte3", en: "parte3" },
    title: { pt: "O mapa de públicos", en: "The map of audiences" },
    summary: {
      pt: "Quem usa a Lastre e o que exatamente vira token: as sete camadas da cadeia, os 42 públicos comerciais, os 8 atores de Estado, os quatro elos esquecidos e os anti-públicos.",
      en: "Who uses Lastre and what exactly becomes a token: the chain's seven layers, the 42 commercial audiences, the 8 State actors, the four forgotten links and the anti-audiences.",
    },
    langs: ["PT"],
  },
  {
    numeral: "IV",
    anchor: { pt: "parte4", en: "parte4" },
    title: { pt: "O mercado, camada por camada", en: "The market, layer by layer" },
    summary: {
      pt: "Evidência externa levantada camada por camada a partir das perguntas do dossiê. Onde a busca falhou está escrito não encontrado; onde o achado contradisse a suposição interna, ele prevalece.",
      en: "External evidence gathered layer by layer from the dossier's questions. Where the search failed it says not found; where the finding contradicted the internal assumption, the finding prevails.",
    },
    langs: ["PT"],
  },
  {
    numeral: "V",
    anchor: { pt: "parte5", en: "parte5" },
    title: { pt: "Provenance before token", en: "Provenance before token" },
    summary: {
      pt: "A camada de responsabilidade: por que a Lastre aluga o trilho de tokenização em vez de tokenizar, o que essa escolha protege de fato, o que ela não protege, e qual desenho os precedentes brasileiros já autorizam.",
      en: "The liability layer: why Lastre rents the tokenisation rail instead of tokenising, what that choice actually protects, what it does not, and which design Brazilian precedent already allows.",
    },
    langs: ["PT"],
  },
];
