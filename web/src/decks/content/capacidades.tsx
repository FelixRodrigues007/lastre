import { lazy, Suspense } from "react";
import { useAnnounceBoard, useBoardTheme, type BoardTheme } from "../BoardTheme";
import { tx, type Deck, type DeckLocale, type L10n } from "../types";

/* The board is an Excalidraw scene, and Excalidraw is the heaviest thing the
 * site loads. Keep it out of the decks chunk until this sheet is on screen. */
const BoardEmbed = lazy(() =>
  import("../../diagram/BoardEmbed").then((m) => ({ default: m.BoardEmbed })),
);

/* Four committed files per board — two languages, each drawn light and dark —
 * all written by the scripts under web/scripts from one bilingual source. A
 * drawing has no runtime string table and no CSS, so both the translation and
 * the theme are other files.
 *
 * The dark ones are drawn dark rather than filtered: Excalidraw's own dark
 * mode inverts the whole canvas, which lifts border and text to the same
 * near-white and lets neither be softened alone. */
const variants = (stem: string): Record<DeckLocale, Record<BoardTheme, string>> => ({
  pt: { light: stem, dark: `${stem}-dark` },
  en: { light: `${stem}-en`, dark: `${stem}-en-dark` },
});

const BOARDS = {
  capacidades: variants("lastre-capacidades"),
  estrategia: variants("lastre-estrategia"),
};

/* Painted into the canvas bitmap, so it has to equal the sheet exactly. */
const PAPER: Record<BoardTheme, string> = {
  light: "#f7f9f7",
  dark: "#121212",
};

function Board({
  board,
  locale,
}: {
  board: keyof typeof BOARDS;
  locale: DeckLocale;
}) {
  const { theme } = useBoardTheme();
  useAnnounceBoard();

  return (
    <div className="dk-board" data-theme={theme}>
      <Suspense fallback={<div className="board-embed" aria-busy="true" />}>
        <BoardEmbed
          key={`${board}-${locale}-${theme}`}
          slug={BOARDS[board][locale][theme]}
          /* Always light: the darkness is in the file, and Excalidraw's dark
           * theme would filter it a second time. */
          theme="light"
          background={PAPER[theme]}
        />
      </Suspense>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────
 * As unidades do dossiê — uma folha para cada
 *
 * O dossiê tem nove unidades, e o deck reserva uma folha para todas elas
 * desde já: a que está desenhada mostra o quadro, as outras mostram as
 * âncoras que vão ocupar a folha, ainda vazias. A prateleira existe antes do
 * desenho, e por isso a ordem do dossiê nunca precisa ser remontada.
 *
 * Desenhar uma unidade é escrever o seu script em web/scripts sobre a mesma
 * gramática de build-strategy-board.mjs e trocar `board` aqui pelo stem.
 * ───────────────────────────────────────────────────────────────────────── */

type Unidade = {
  /** Deep link (#s/<id>) e número da unidade no dossiê. */
  id: string;
  n: string;
  nome: L10n;
  /** As âncoras que a folha vai carregar, na ordem do dossiê. */
  ancoras: L10n[];
  /** O stem do quadro, quando ele já existe. */
  board?: keyof typeof BOARDS;
  /** Falso enquanto a unidade não foi escrita no dossiê. */
  dossie?: boolean;
};

const two = (pt: string, en: string): L10n => ({ pt, en });

const UNIDADES: Unidade[] = [
  {
    id: "estrategia",
    n: "01",
    nome: two("Estratégia", "Strategy"),
    ancoras: [
      two("Identidade", "Identity"),
      two("Ideia", "Idea"),
      two("Snapshot", "Snapshot"),
      two("Modelo de Negócio", "Business Model"),
    ],
    board: "estrategia",
  },
  {
    id: "publico",
    n: "02",
    nome: two("Público", "Audience"),
    ancoras: [
      two("Personas", "Personas"),
      two("Discovery", "Discovery"),
      two("Dor → Solução", "Pain → Solution"),
      two("Concorrentes", "Alternatives"),
    ],
  },
  {
    id: "oferta",
    n: "03",
    nome: two("Oferta", "Offer"),
    ancoras: [
      two("Ofertas", "Offers"),
      two("Precificação", "Pricing"),
      two("Roadmap", "Roadmap"),
    ],
  },
  {
    id: "marca",
    n: "04",
    nome: two("Marca", "Brand"),
    ancoras: [
      two("Voz da marca", "Brand voice"),
      two("Provas", "Proof"),
      two("Reputação e crise", "Reputation and crisis"),
    ],
  },
  {
    id: "aquisicao",
    n: "05",
    nome: two("Aquisição", "Acquisition"),
    ancoras: [
      two("Estratégia", "Strategy"),
      two("Parcerias", "Partnerships"),
      two("Experimentos", "Experiments"),
    ],
  },
  {
    id: "conversao",
    n: "06",
    nome: two("Conversão", "Conversion"),
    ancoras: [
      two("Funil", "Funnel"),
      two("Objeções", "Objections"),
      two("Playbook", "Playbook"),
    ],
  },
  {
    id: "cliente",
    n: "07",
    nome: two("Cliente", "Customer"),
    ancoras: [
      two("Saúde e retenção", "Health and retention"),
      two("Voz do cliente", "Customer voice"),
    ],
  },
  {
    id: "operacoes",
    n: "08",
    nome: two("Operações", "Operations"),
    ancoras: [
      two("Capacidade e fornecedores", "Capacity and suppliers"),
      two("Qualidade e riscos", "Quality and risk"),
    ],
  },
  {
    id: "tecnologia",
    n: "09",
    nome: two("Tecnologia", "Technology"),
    ancoras: [
      two("Arquitetura", "Architecture"),
      two("Dados e analytics", "Data and analytics"),
      two("Segurança", "Security"),
    ],
    dossie: false,
  },
];

/**
 * A folha reservada: o número e o nome da unidade, uma linha dizendo em que
 * pé ela está, e as âncoras como vagas vazias — o espaço já separado, com o
 * tamanho que o desenho vai ocupar.
 */
function Vaga({ unidade, locale }: { unidade: Unidade; locale: DeckLocale }) {
  const t = tx(locale);
  const escrita = unidade.dossie !== false;

  return (
    <>
      <div className="dk-top">
        <p className="dk-eyebrow">
          {t(`Dossiê · unidade ${unidade.n}`, `Dossier · unit ${unidade.n}`)}
        </p>
        <h2 className="dk-h1">{unidade.nome[locale]}</h2>
        <p className="dk-p">
          {escrita
            ? t(
                "A unidade está escrita no dossiê e o quadro ainda não foi desenhado. As âncoras abaixo são o espaço que ele vai ocupar.",
                "The unit is written in the dossier and the board is not drawn yet. The anchors below are the space it will occupy.",
              )
            : t(
                "A unidade ainda não foi escrita no dossiê, e por isso não há o que desenhar. A folha fica reservada mesmo assim.",
                "The unit has not been written in the dossier yet, so there is nothing to draw. The sheet stays reserved all the same.",
              )}
        </p>
      </div>

      <div className="dk-bottom">
        <div className="dk-label">
          <span>{t("Âncoras", "Anchors")}</span>
        </div>
        <ul className="dk-vagas">
          {unidade.ancoras.map((a) => (
            <li className="dk-vaga" key={a.pt}>
              <span className="dk-vaga__k">{a[locale]}</span>
              <span className="dk-vaga__v" aria-hidden="true" />
            </li>
          ))}
        </ul>
      </div>
    </>
  );
}

/* ─────────────────────────────────────────────────────────────────────────
 * 03 · Capacidades
 * ───────────────────────────────────────────────────────────────────────── */

export const capacidades: Deck = {
  slug: "capacidades",
  index: "03",
  title: { pt: "Capacidades", en: "Capabilities" },
  summary: {
    pt: "O mapa do que a Lastre é capaz de fazer: da prova de validade à tokenização, e daí a custódia, DeFi, staking e liquidação. Depois, o dossiê — uma folha por unidade, da estratégia à tecnologia.",
    en: "The map of what Lastre can do: from proof of validity to tokenisation, and from there to custody, DeFi, staking and settlement. Then the dossier — one sheet per unit, from strategy to technology.",
  },
  audience: { pt: "Sócios e convidados", en: "Partners and guests" },
  updated: "07.09.2026",
  slides: [
    {
      id: "mapa",
      title: { pt: "O mapa", en: "The map" },
      bleed: true,
      render: (l) => <Board board="capacidades" locale={l} />,
    },
    ...UNIDADES.map((u) => ({
      id: u.id,
      title: { pt: `${u.n} · ${u.nome.pt}`, en: `${u.n} · ${u.nome.en}` },
      bleed: u.board !== undefined,
      render: (l: DeckLocale) =>
        u.board ? <Board board={u.board} locale={l} /> : <Vaga unidade={u} locale={l} />,
    })),
  ],
};
