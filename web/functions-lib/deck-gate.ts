/* A folha de rosto do portão. Mesmo papel dos decks: fundo claro, uma caixa
 * branca no meio, Inter, e nada além do campo. É HTML servido pelo Worker —
 * não passa pelo bundle, então a senha nunca chega ao cliente. */

type Tone = "ask" | "wrong" | "unset";

const COPY: Record<Tone, { title: string; note: string }> = {
  ask: {
    title: "Documentos internos",
    note: "Estas apresentações não são públicas. Digite a senha para entrar.",
  },
  wrong: {
    title: "Senha incorreta",
    note: "Confira e tente de novo.",
  },
  unset: {
    title: "Portão sem senha configurada",
    note: "Defina DECKS_PASSWORD nas variáveis de ambiente do Cloudflare Pages.",
  },
};

export const gatePage = (tone: Tone): string => {
  const { title, note } = COPY[tone];
  const locked = tone === "unset";

  return `<!doctype html>
<html lang="pt-BR">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<meta name="robots" content="noindex, nofollow" />
<title>Lastre — apresentações</title>
<link rel="icon" type="image/svg+xml" href="/favicon.svg" />
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
<link href="https://fonts.googleapis.com/css2?family=Inter:opsz,wght@14..32,400..600&display=swap" rel="stylesheet" />
<style>
  :root {
    --paper: #e9ede9;
    --sheet: #f7f9f7;
    --ink: #13241d;
    --ink-2: #3b4f46;
    --dim: #6d8178;
    --line: rgba(19, 36, 29, 0.14);
    --accent: #4e8f3c;
    --coral: #b8482a;
  }
  * { box-sizing: border-box; }
  body {
    margin: 0;
    min-height: 100svh;
    display: grid;
    place-items: center;
    padding: 6vh 1.25rem;
    background: var(--paper);
    color: var(--ink);
    font-family: "Inter", ui-sans-serif, system-ui, sans-serif;
    -webkit-font-smoothing: antialiased;
  }
  main {
    width: min(26rem, 100%);
    background: var(--sheet);
    border: 1px solid var(--line);
    border-radius: 18px;
    padding: clamp(1.75rem, 5vw, 2.5rem);
    box-shadow: 0 1px 2px rgba(19, 36, 29, 0.04), 0 18px 48px -28px rgba(19, 36, 29, 0.35);
  }
  .mark {
    font-size: 0.6875rem;
    letter-spacing: 0.16em;
    text-transform: uppercase;
    color: var(--dim);
    margin: 0 0 1.75rem;
  }
  h1 {
    font-size: 1.375rem;
    font-weight: 560;
    letter-spacing: -0.015em;
    line-height: 1.25;
    margin: 0 0 0.5rem;
  }
  p {
    margin: 0 0 1.75rem;
    font-size: 0.9375rem;
    line-height: 1.55;
    color: var(--ink-2);
  }
  p.err { color: var(--coral); }
  label {
    display: block;
    font-size: 0.75rem;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    color: var(--dim);
    margin-bottom: 0.5rem;
  }
  input {
    width: 100%;
    font: inherit;
    font-size: 1rem;
    padding: 0.75rem 0.875rem;
    color: var(--ink);
    background: #fff;
    border: 1px solid var(--line);
    border-radius: 10px;
    transition: border-color 160ms cubic-bezier(0.16, 1, 0.3, 1);
  }
  input:focus-visible {
    outline: 1.5px solid var(--accent);
    outline-offset: 2px;
    border-color: transparent;
  }
  button {
    width: 100%;
    margin-top: 0.875rem;
    font: inherit;
    font-size: 0.9375rem;
    font-weight: 520;
    padding: 0.75rem 1rem;
    color: var(--sheet);
    background: var(--ink);
    border: 0;
    border-radius: 10px;
    cursor: pointer;
    transition: opacity 160ms cubic-bezier(0.16, 1, 0.3, 1);
  }
  button:hover { opacity: 0.88; }
  button:focus-visible { outline: 1.5px solid var(--accent); outline-offset: 3px; }
  footer {
    margin-top: 1.75rem;
    padding-top: 1.25rem;
    border-top: 1px solid var(--line);
    font-size: 0.8125rem;
    color: var(--dim);
  }
  footer a { color: inherit; }
</style>
</head>
<body>
  <main>
    <p class="mark">Lastre</p>
    <h1>${title}</h1>
    <p${tone === "wrong" ? ' class="err"' : ""}>${note}</p>
    ${
      locked
        ? ""
        : `<form method="post" autocomplete="on">
      <label for="password">Senha</label>
      <input id="password" name="password" type="password" autocomplete="current-password" autofocus required />
      <button type="submit">Entrar</button>
    </form>`
    }
    <footer>Precisa de acesso? Fale com <a href="mailto:contato@lastre.io">contato@lastre.io</a>.</footer>
  </main>
</body>
</html>`;
};
