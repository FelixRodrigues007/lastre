# Cérebro de negócio (repo privado)

A KB operacional da Lastre (**tese, SKU, cerca, corredores, gates, Fable/PMO**) **não** vive neste repositório. O GitHub `FelixRodrigues007/lastre` é **público**.

Fonte da verdade:

```text
https://github.com/FelixRodrigues007/lastre-negocio
```

Repo **privado**. Colaboradoras: Felix + Laura. Não tornar público. Não copiar corredores para `lastre.io` / Dora / PRs abertos.

## Layout local (irmãos)

```text
~/Developer/lastre/           # este repo (código)
~/Developer/lastre-negocio/   # cérebro (clone do privado)
~/Developer/lastre/docs/kb-negocio  →  symlink para lastre-negocio
```

```bash
cd ~/Developer
git clone git@github.com:FelixRodrigues007/lastre-negocio.git
# ou: gh repo clone FelixRodrigues007/lastre-negocio

cd lastre
ln -sfn ../../lastre-negocio docs/kb-negocio
```

`docs/kb-negocio/` continua no `.gitignore` deste repo. O Claude Project da pasta `lastre` lê o symlink.

## Claude / Fable — DD de corredor

Abrir primeiro (local, gitignorado neste repo):

```text
docs/kb-negocio/04-corredores/PARA-FABLE.md
```

Absoluto: `/Users/felixrodrigues/Developer/lastre/docs/kb-negocio/04-corredores/PARA-FABLE.md`

O cérebro no GitHub privado usa **git-crypt** (working tree em claro). Este repo público **não** cifra o código da competição — o júri precisa lê-lo. O que é confidencial simplesmente **não entra** aqui.

## O que cada repo é

| Repo | Conteúdo |
|---|---|
| `lastre` | app, web, agent, contratos Rust/Odra, landing |
| `lastre-negocio` | PLANO, gates, SKU, cerca, corredores, Fable, Cronos |

Não commitar a KB aqui. Não colar CNPJ, offtaker ou SPE em issue/PR público.
