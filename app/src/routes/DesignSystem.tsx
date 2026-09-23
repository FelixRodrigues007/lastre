import { useEffect, useRef, useState, type ReactNode } from "react";
import tokens from "@design-system/tokens/lastre.tokens.json";
import tokensUrl from "@design-system/tokens/lastre.tokens.json?url";
import { Button } from "../components/ui/Button";
import { TextField } from "../components/ui/TextField";
import { LastreWordmark } from "../components/ui/LastreWordmark";
import { StatusBadge } from "../components/ui/StatusBadge";
import { InlineNotice } from "../components/ui/InlineNotice";
import { TokenInspector } from "../components/design-system/TokenInspector";
import { ButtonPlayground } from "../components/design-system/ButtonPlayground";
import { ProductPreview } from "../components/design-system/ProductPreview";
import { SearchInput } from "../components/ui/SearchInput";
import { applyTheme, getStoredTheme } from "../lib/theme";
import "./design-system.css";

const sections = [
  ["overview", "Visão geral"],
  ["colors", "Cores"],
  ["tokens", "Tokens semânticos"],
  ["type", "Tipografia"],
  ["space", "Espaçamento"],
  ["components", "Componentes"],
  ["patterns", "Em contexto"],
  ["guidelines", "Critérios de uso"],
];
const version = tokens.meta.version.split(".").slice(0, 2).join(".");
const shades = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950];
const palettes = [
  {
    name: "Mirage",
    key: "mirage",
    role: "A base de tudo",
    description:
      "Superfícies, texto e estrutura. Uma escala neutra que mantém o foco na informação.",
  },
  {
    name: "Blue",
    key: "blue",
    role: "Ação e confiança",
    description:
      "Cor principal. Orienta ações, navegação, links e informação verificável.",
  },
  {
    name: "Gold",
    key: "gold",
    role: "Destaque com propósito",
    description:
      "Cor de apoio. Evidencia selos e pontos de atenção, com uso pontual.",
  },
] as const;
const primitiveColors: Record<string, { $value: string }> = tokens.primitive;
const color = (family: string, shade: number) =>
  primitiveColors[`color-${family}-${shade}`].$value;
function onColor(hex: string) {
  const rgb = [1, 3, 5]
    .map((i) => parseInt(hex.slice(i, i + 2), 16) / 255)
    .map((v) => (v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4));
  return rgb[0] * 0.2126 + rgb[1] * 0.7152 + rgb[2] * 0.0722 > 0.179
    ? "#000000"
    : "#FFFFFF";
}
function Section({
  id,
  number,
  title,
  description,
  children,
}: {
  id: string;
  number: string;
  title: string;
  description: string;
  children: ReactNode;
}) {
  return (
    <section id={id} className="ds-section" aria-labelledby={`${id}-heading`}>
      <div className="ds-section__heading">
        <span className="ds-index">{number}</span>
        <div>
          <h2 id={`${id}-heading`}>{title}</h2>
          <p>{description}</p>
        </div>
      </div>
      {children}
    </section>
  );
}

export function DesignSystem() {
  const [theme, setTheme] = useState(getStoredTheme);
  const [query, setQuery] = useState("");
  const [message, setMessage] = useState("");
  const [activeSection, setActiveSection] = useState("overview");
  const [loading, setLoading] = useState(false);
  const [assetName, setAssetName] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    const title = document.title;
    const lang = document.documentElement.lang;
    document.title = "Lastre — Design System";
    document.documentElement.lang = "pt-BR";
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries)
          if (entry.isIntersecting) setActiveSection(entry.target.id);
      },
      { rootMargin: "-12% 0px -65% 0px" },
    );
    sections.forEach(([id]) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });
    return () => {
      document.title = title;
      document.documentElement.lang = lang;
      observer.disconnect();
      if (timer.current) clearTimeout(timer.current);
    };
  }, []);
  const copy = async (value: string, label?: string) => {
    try {
      await navigator.clipboard.writeText(value);
      setMessage(`${label ?? value} copiado.`);
    } catch {
      setMessage(
        label
          ? "Não foi possível copiar. Selecione o código ou token e copie manualmente."
          : `Não foi possível copiar. Valor: ${value}`,
      );
    }
  };
  const previewLoading = () => {
    setLoading(true);
    timer.current = setTimeout(() => {
      setLoading(false);
      setMessage("Demonstração concluída. Nenhum dado foi enviado.");
    }, 1200);
  };
  return (
    <div className="ds">
      <a className="ds-skip" href="#ds-main">
        Ir para o conteúdo
      </a>
      <aside className="ds-sidebar">
        <a
          href="#overview"
          className="ds-brand"
          aria-label="Lastre — início do design system"
        >
          <LastreWordmark />
        </a>
        <p className="ds-sidebar__label">
          Design System <span>{version}</span>
        </p>
        <nav aria-label="Seções do design system">
          {sections.map(([id, label], i) => (
            <a
              key={id}
              href={`#${id}`}
              aria-current={activeSection === id ? "location" : undefined}
            >
              <span>0{i + 1}</span>
              {label}
            </a>
          ))}
        </nav>
        <div className="ds-sidebar__foot">
          <span className="ds-live-dot" /> Uma base compartilhada.
          <p>Da origem à prova.</p>
          <a href={tokens.meta.source} target="_blank" rel="noreferrer">
            Referência no Figma ↗
          </a>
        </div>
      </aside>
      <div className="ds-body">
        <header className="ds-topbar">
          <span>
            LASTRE <span className="ds-topbar__slash">/</span> FUNDAMENTOS &
            INTERFACES
          </span>
          <Button
            variant="secondary"
            size="sm"
            aria-label={`Ativar tema ${theme === "dark" ? "claro" : "escuro"}`}
            onClick={() => {
              const next = theme === "dark" ? "light" : "dark";
              applyTheme(next);
              setTheme(next);
            }}
          >
            <span aria-hidden="true">{theme === "dark" ? "☀" : "◐"}</span> Tema{" "}
            {theme === "dark" ? "claro" : "escuro"}
          </Button>
        </header>
        <main id="ds-main" className="ds-main" tabIndex={-1}>
          <section id="overview" className="ds-hero" aria-labelledby="ds-title">
            <div className="ds-eyebrow">
              <span className="ds-live-dot" /> LASTRE DESIGN SYSTEM{" "}
              <span>V{version} / 2026</span>
            </div>
            <h1 id="ds-title">
              Clareza em cada
              <br />
              <em className="lastre-gold-text">ponto de contato.</em>
            </h1>
            <div className="ds-hero__bottom">
              <p>
                A linguagem visual da Lastre. Cores, tipografia e componentes
                para transformar informação complexa em experiências de
                confiança.
              </p>
              <a
                className="lastre-button lastre-button--secondary"
                href={tokensUrl}
                download="lastre.tokens.json"
              >
                Baixar tokens <span aria-hidden="true">↓</span>
              </a>
            </div>
            <div className="ds-quick-links" aria-label="Atalhos da biblioteca">
              <a href="#tokens">
                Explorar tokens <span aria-hidden="true">↗</span>
              </a>
              <a href="#components">
                Testar componentes <span aria-hidden="true">↗</span>
              </a>
              <a href="#patterns">
                Ver estados de tela <span aria-hidden="true">↗</span>
              </a>
            </div>
            <div className="ds-brand-board">
              <div className="ds-wordmark-stage">
                <LastreWordmark />
                <div>
                  <span>PROOF BEFORE TOKEN.</span>
                  <span>IDENTIDADE / 01</span>
                </div>
              </div>
              <div
                className="ds-role"
                style={{
                  background: color("mirage", 50),
                  color: color("mirage", 900),
                }}
              >
                <span>01 / BASE LIGHT</span>
                <strong>Mirage</strong>
                <code>#F0F1F3</code>
              </div>
              <div
                className="ds-role"
                style={{ background: color("blue", 500), color: "#FFFFFF" }}
              >
                <span>02 / PRIMÁRIA</span>
                <strong>Blue</strong>
                <code>#107CA4</code>
              </div>
              <div
                className="ds-role"
                style={{
                  background: color("mirage", 900),
                  color: color("mirage", 50),
                }}
              >
                <span>03 / BASE DARK</span>
                <strong>Mirage</strong>
                <code>#1B1D24</code>
              </div>
              <div
                className="ds-role"
                style={{
                  background: color("gold", 200),
                  color: color("mirage", 900),
                }}
              >
                <span>04 / SECUNDÁRIA</span>
                <strong>Gold</strong>
                <code>#FDA82D</code>
              </div>
            </div>
            <div className="ds-facts">
              <span>
                <b>03</b> famílias de cor
              </span>
              <span>
                <b>33</b> cores de referência
              </span>
              <span>
                <b>02</b> temas
              </span>
              <span>
                <b>01</b> linguagem compartilhada
              </span>
            </div>
          </section>
          <Section
            id="colors"
            number="02"
            title="Uma paleta com função."
            description="Valores originais do Figma. Clique em uma amostra para copiar seu hexadecimal."
          >
            <div className="ds-palette-search">
              <SearchInput
                value={query}
                onChange={setQuery}
                ariaLabel="Buscar cor"
                placeholder="Buscar por nome, tom ou hexadecimal…"
              />
              <span>50 — 950</span>
            </div>
            {palettes.map((p) => {
              const shown = shades.filter((shade) =>
                `${p.name} ${shade} ${color(p.key, shade)}`
                  .toLowerCase()
                  .includes(query.trim().toLowerCase()),
              );
              if (!shown.length) return null;
              return (
                <div className="ds-palette" key={p.key}>
                  <div className="ds-palette__heading">
                    <h3>
                      {p.name} <span>{p.role}</span>
                    </h3>
                    <p>{p.description}</p>
                  </div>
                  <div className="ds-swatches">
                    {shown.map((shade) => (
                      <button
                        type="button"
                        key={shade}
                        className="ds-swatch"
                        onClick={() => void copy(color(p.key, shade))}
                        aria-label={`Copiar ${p.name} ${shade}: ${color(p.key, shade)}`}
                      >
                        <span
                          className="ds-swatch__color"
                          style={{
                            background: color(p.key, shade),
                            color: onColor(color(p.key, shade)),
                          }}
                        >
                          {shade}
                          {((p.key === "blue" && shade === 500) ||
                            (p.key === "gold" && shade === 200)) && (
                            <span aria-label="Cor principal da família">●</span>
                          )}
                        </span>
                        <code>{color(p.key, shade)}</code>
                      </button>
                    ))}
                  </div>
                </div>
              );
            })}
            {query &&
              !palettes.some((p) =>
                shades.some((s) =>
                  `${p.name} ${s} ${color(p.key, s)}`
                    .toLowerCase()
                    .includes(query.trim().toLowerCase()),
                ),
              ) && (
                <p className="ds-empty">
                  Nenhuma cor encontrada para “{query}”.
                </p>
              )}
            <div className="ds-gold-treatment">
              <div className="ds-gold-treatment__surface">
                <span>GOLD / ACENTO</span>
                <strong>Um detalhe faz a diferença.</strong>
                <code>--lastre-gradient-gold</code>
              </div>
              <div className="ds-gold-treatment__description">
                <h3>Brilho na medida certa.</h3>
                <p>
                  O gradiente combina tons de Gold para sugerir a luz sobre o
                  metal. Use em títulos selecionados, selos e filetes. Ações e
                  links continuam azuis.
                </p>
                <span className="lastre-gold-text">Da origem à prova.</span>
              </div>
            </div>
            <div className="ds-note">
              <b>Primitivos definem a cor. Semânticos definem o uso.</b>
              <p>
                Use <code>--lastre-action-primary</code> para ações e{" "}
                <code>--lastre-text-primary</code> para texto. Os papéis se
                adaptam ao tema sem alterar as cores da marca.
              </p>
            </div>
          </Section>
          <Section
            id="tokens"
            number="03"
            title="A intenção antes da cor."
            description="Escolha pelo papel na interface. Clique para copiar a variável CSS e compare os valores nos dois temas."
          >
            <TokenInspector theme={theme} onCopy={copy} />
          </Section>
          <Section
            id="type"
            number="04"
            title="Personalidade. Legibilidade."
            description="Manrope nos títulos. Inter nos textos e controles. A personalidade do logotipo fica na marca."
          >
            <div className="ds-type-grid">
              <div className="ds-display-specimen">
                <span className="ds-label">01 / MANROPE</span>
                <p>Aa</p>
                <h3>A origem importa.</h3>
                <span>Títulos · 500 / 600 · tracking −0.035em</span>
              </div>
              <div className="ds-type-ramp">
                <div>
                  <span className="ds-label">02 / INTER</span>
                  <p className="ds-body-specimen">
                    Informação precisa.
                    <br />
                    Leitura sem esforço.
                  </p>
                  <span>Interface · 14–16px · 400 / 500 / 600</span>
                </div>
                <div>
                  <span className="ds-label">03 / JETBRAINS MONO</span>
                  <p className="ds-mono-specimen">
                    SHA-256
                    <br />
                    a3f1…ff00
                  </p>
                  <span>Hashes, IDs e dados técnicos · 12–14px</span>
                </div>
              </div>
            </div>
            <div className="ds-type-sizes">
              {[
                ["Display", "36–64", "Da origem à prova.", "display"],
                ["Heading", "32", "Evidências conectadas.", "title"],
                ["Section", "24", "Cada etapa, registrada.", "section"],
                [
                  "Body",
                  "16",
                  "Acompanhe a cadeia de origem de cada ativo.",
                  "body",
                ],
              ].map(([name, size, text, role]) => (
                <div key={name}>
                  <span>
                    {name}
                    <small>{size}px</small>
                  </span>
                  <p
                    style={{
                      fontSize: `var(--lastre-text-${role})`,
                      fontFamily:
                        name === "Body"
                          ? "var(--lastre-font-body)"
                          : "var(--lastre-font-display)",
                    }}
                  >
                    {text}
                  </p>
                </div>
              ))}
            </div>
          </Section>
          <Section
            id="space"
            number="05"
            title="Ritmo e estrutura."
            description="Uma escala de 4px organiza distâncias. Controles e superfícies têm geometria consistente."
          >
            <div className="ds-spacing">
              {[1, 2, 3, 4, 6, 8, 12, 16].map((n) => (
                <div key={n}>
                  <span>
                    {n * 4}
                    <small>px</small>
                  </span>
                  <div style={{ height: `${n * 4}px` }} />
                  <code>space-{n}</code>
                </div>
              ))}
            </div>
            <div className="ds-radius-grid">
              {[
                ["6px", "Controles", "sm"],
                ["10px", "Grupos", "md"],
                ["16px", "Superfícies", "lg"],
                ["999px", "Marcadores", "pill"],
              ].map(([size, label, key]) => (
                <div key={key}>
                  <div style={{ borderRadius: size }} />
                  <p>
                    {label}
                    <code>
                      radius-{key} · {size}
                    </code>
                  </p>
                </div>
              ))}
            </div>
          </Section>
          <Section
            id="components"
            number="06"
            title="Feitos para trabalhar juntos."
            description="Componentes reais da aplicação, com estados, hierarquia e foco visível."
          >
            <ButtonPlayground
              onCopy={copy}
              onAction={() =>
                setMessage(
                  "Ação do playground demonstrada. Nenhum dado foi enviado.",
                )
              }
            />
            <div className="ds-component-block">
              <div className="ds-component-label">
                <h3>Botões</h3>
                <code>Button</code>
              </div>
              <div className="ds-component-content">
                <div className="ds-button-row">
                  <Button
                    onClick={() => setMessage("Ação primária demonstrada.")}
                  >
                    Verificar origem <span aria-hidden="true">↗</span>
                  </Button>
                  <Button
                    variant="secondary"
                    onClick={() => setMessage("Ação secundária demonstrada.")}
                  >
                    Ver evidências
                  </Button>
                  <Button
                    variant="ghost"
                    onClick={() => setMessage("Ação de apoio demonstrada.")}
                  >
                    Saiba mais →
                  </Button>
                  <Button
                    variant="danger"
                    onClick={() =>
                      setMessage(
                        "Demonstração de ação crítica. Nenhum dado foi removido.",
                      )
                    }
                  >
                    Remover
                  </Button>
                </div>
                <div className="ds-button-row">
                  <Button
                    size="sm"
                    onClick={() => setMessage("Botão compacto demonstrado.")}
                  >
                    Compacto
                  </Button>
                  <Button disabled>Indisponível</Button>
                  <Button loading={loading} onClick={previewLoading}>
                    Testar carregamento
                  </Button>
                </div>
                <p className="ds-caption">
                  40 / 44 / 52px · Hover · Pressionado · Foco · Desabilitado ·
                  Carregando
                </p>
              </div>
            </div>
            <div className="ds-component-block">
              <div className="ds-component-label">
                <h3>Campos</h3>
                <code>TextField</code>
              </div>
              <form
                className="ds-component-content"
                noValidate
                onSubmit={(e) => {
                  e.preventDefault();
                  setSubmitted(true);
                  if (assetName.trim())
                    setMessage(
                      `Campo validado: ${assetName.trim()}. Exemplo local, sem envio.`,
                    );
                }}
              >
                <div className="ds-fields">
                  <TextField
                    label="Nome do ativo"
                    placeholder="Ex.: Lote Serra Azul"
                    value={assetName}
                    onChange={(e) => setAssetName(e.target.value)}
                    hint="Use um nome fácil de identificar."
                    error={
                      submitted && !assetName.trim()
                        ? "Informe o nome do ativo."
                        : undefined
                    }
                    required
                  />
                  <TextField
                    label="Identificador do selo"
                    defaultValue="LST-"
                    error="Informe um identificador completo."
                  />
                  <TextField
                    label="Rede de registro"
                    value="Casper Testnet"
                    disabled
                    hint="Definida pela organização."
                  />
                  <TextField
                    label="Referência de origem"
                    value="LST-2026-001"
                    readOnly
                    hint="Somente leitura. Você pode selecionar e copiar."
                  />
                </div>
                <Button type="submit" variant="secondary" size="sm">
                  Validar exemplo
                </Button>
              </form>
            </div>
            <div className="ds-component-block">
              <div className="ds-component-label">
                <h3>Estados</h3>
                <code>StatusBadge</code>
              </div>
              <div className="ds-component-content">
                <div className="ds-button-row">
                  <StatusBadge
                    label="Verificado"
                    tone="success"
                    circle="filled"
                  />
                  <StatusBadge
                    label="Em análise"
                    tone="warning"
                    circle="dashed"
                  />
                  <StatusBadge label="Registrado" tone="info" />
                  <StatusBadge label="Inválido" tone="danger" circle="filled" />
                  <StatusBadge label="Rascunho" tone="neutral" circle="empty" />
                </div>
                <p className="ds-caption">
                  Cor + rótulo + indicador. O significado permanece visível sem
                  depender somente da cor.
                </p>
              </div>
            </div>
            <div className="ds-component-block">
              <div className="ds-component-label">
                <h3>Feedback</h3>
                <code>InlineNotice</code>
              </div>
              <div className="ds-notices">
                <InlineNotice tone="success" title="Verificação concluída">
                  As evidências de origem estão consistentes.
                </InlineNotice>
                <InlineNotice tone="warning" title="Revisão necessária">
                  Confira a data de coleta antes de continuar.
                </InlineNotice>
                <InlineNotice tone="info" title="Registro em processamento">
                  Você pode continuar acompanhando a cadeia.
                </InlineNotice>
                <InlineNotice tone="danger" title="Não foi possível verificar">
                  Revise o identificador e tente novamente.
                </InlineNotice>
              </div>
            </div>
          </Section>
          <Section
            id="patterns"
            number="07"
            title="Da base para a experiência."
            description="Uma composição com os mesmos componentes usados no produto. Dados fictícios para demonstração."
          >
            <ProductPreview onCopy={copy} />
            <div className="ds-principles">
              <div>
                <span>01</span>
                <h3>Clareza primeiro</h3>
                <p>
                  Uma ação principal por contexto. A informação importante tem
                  espaço para respirar.
                </p>
              </div>
              <div>
                <span>02</span>
                <h3>Confiança visível</h3>
                <p>
                  Estados explícitos, evidências legíveis e resultados que podem
                  ser conferidos.
                </p>
              </div>
              <div>
                <span>03</span>
                <h3>Consistência real</h3>
                <p>
                  Tokens compartilhados, componentes reutilizáveis e os mesmos
                  papéis nos dois temas.
                </p>
              </div>
            </div>
          </Section>
          <Section
            id="guidelines"
            number="08"
            title="Consistência é uma decisão."
            description="Critérios para criar novas telas e evoluir a biblioteca sem perder a identidade."
          >
            <div className="ds-rules">
              <article className="ds-rule">
                <span>01 / HIERARQUIA</span>
                <h3>Uma ação conduz o contexto.</h3>
                <p>
                  Use o botão primário para o próximo passo. Ações alternativas
                  são secundárias; navegação e apoio usam ghost. Reserve danger
                  para ações destrutivas, com rótulo explícito.
                </p>
              </article>
              <article className="ds-rule">
                <span>02 / GOLD</span>
                <h3>Um acento por composição.</h3>
                <p>
                  Escolha um título, selo ou filete para receber o gradiente.
                  Use a versão de texto adaptada ao tema. Evite parágrafos
                  dourados, brilho contínuo e várias superfícies competindo pelo
                  destaque.
                </p>
              </article>
              <article className="ds-rule">
                <span>03 / COMPORTAMENTO</span>
                <h3>Desenhe o caminho completo.</h3>
                <p>
                  Inclua carregamento, vazio, sucesso e erro. Preserve o
                  contexto ao recuperar uma falha. Todo estado tem texto; toda
                  ação por teclado tem foco visível. Prefira controles de 44px
                  ou mais no toque.
                </p>
              </article>
              <article className="ds-rule">
                <span>04 / EVOLUÇÃO</span>
                <h3>Mude na fonte, valide no produto.</h3>
                <p>
                  Edite <code>lastre.tokens.json</code>, gere o CSS e confira os
                  dois temas. Um componente novo deve ter uso real, API pequena
                  e exemplo com estados. Mudanças incompatíveis pedem orientação
                  de migração.
                </p>
              </article>
            </div>
            <div className="ds-release">
              <div>
                <strong>Base de produto · v{version}</strong>
                <p>
                  Tokens validados, controles reutilizáveis e padrões
                  interativos. A adoção em telas existentes é progressiva; os
                  aliases preservam os contratos legados.
                </p>
              </div>
              <code>npm run tokens:check</code>
            </div>
          </Section>
          <footer className="ds-footer">
            <LastreWordmark />
            <span>DESIGN SYSTEM / V{version}</span>
            <a href="#overview">Voltar ao início ↑</a>
          </footer>
        </main>
      </div>
      <div
        className={`ds-toast${message ? " ds-toast--visible" : ""}`}
        role="status"
        aria-live="polite"
      >
        {message && (
          <>
            <span>{message}</span>
            <button
              type="button"
              aria-label="Fechar aviso"
              onClick={() => setMessage("")}
            >
              ×
            </button>
          </>
        )}
      </div>
    </div>
  );
}
