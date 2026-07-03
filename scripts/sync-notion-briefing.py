#!/usr/bin/env python3
"""Populate Lastre Subnichos Genesis Notion page from repo briefing."""

from __future__ import annotations

import json
import os
import re
import sys
import urllib.error
import urllib.request
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
PAGE_ID = os.environ.get(
    "NOTION_PARENT_PAGE_ID", "3900c187-eeaf-8020-85b8-e1b0654bde42"
).replace("-", "")
API = "https://api.notion.com/v1"
VERSION = "2022-06-28"
TOKEN_FILE = Path("/tmp/.notion_lastre_token")

# Child pages
PAGES = {
    "research": "4220c187-eeaf-83d8-846c-817a57bd3267",
    "identidade": "ac50c187-eeaf-820d-bbd8-0140eb64fa44",
    "conteudo": "2970c187-eeaf-820b-9650-01d5c699a49d",
    "gtm": "f960c187-eeaf-828d-a717-8152baa18cb5",
    "canais": "6070c187-eeaf-8376-9f63-0123790e86d3",
    "tecnico": "6ec0c187-eeaf-83f4-86e7-01b6497a8388",
    "metas": "fb90c187-eeaf-8246-9422-01ad0ce45ab4",
    "visual": "c330c187-eeaf-831c-abd6-8197a8f52c9c",
}

# Databases
DBS = {
    "personas": "94d0c187-eeaf-82d4-8ec0-01521dca47bd",
    "dor_solucao": "0a00c187-eeaf-820b-bba5-81de46de9b2f",
    "ofertas": "2200c187-eeaf-8361-bec8-8153ac18db75",
    "claims": "79b0c187-eeaf-8224-a43f-81ef1129a40d",
    "brand_voice": "dde0c187-eeaf-83e8-b208-8122d3489dc1",
    "objecoes": "3070c187-eeaf-83eb-8e85-01e8d7ef7691",
    "faq": "0810c187-eeaf-8237-ac01-817395bc11a1",
    "vocabulario": "a890c187-eeaf-824d-813d-813c6156e956",
    "concorrentes": "6fb0c187-eeaf-8250-ae19-01546a709780",
    # Auxiliary databases
    "funil_aquisicao": "8c60c187-eeaf-82cf-9097-01ad15444d58",
    "funil_lifecycle": "29b0c187-eeaf-82a1-8795-81c99d303d4d",
    "tom_canal": "3c50c187-eeaf-83d4-a7c1-81047504b8ae",
    "gtm_canais": "bbf0c187-eeaf-8333-8f0f-8175b6aab21e",
    "gtm_parcerias": "3e50c187-eeaf-8331-a7f6-814b6d1b1230",
    "canais_presenca": "ff60c187-eeaf-83cc-8a62-016bd3c33f7e",
    "dominios": "4cd0c187-eeaf-83d0-bb29-016a97066f69",
    "metricas": "ed40c187-eeaf-82eb-900c-01e5b36c51b5",
    "design_system_a": "fd00c187-eeaf-837f-ae62-01db38d5f7b0",
    "design_system_b": "abd0c187-eeaf-83c6-834c-814c539fd4ce",
    "refs_visuais": "2680c187-eeaf-83c6-9cbe-01572271661d",
    "assets_marca": "b700c187-eeaf-82e1-9864-811f614a932f",
}

CALLOUT_ID = "1940c187-eeaf-83f4-bb84-817ae811d79c"


def token() -> str:
    for key in ("NOTION_API_KEY", "NOTION_TOKEN"):
        val = os.environ.get(key)
        if val:
            return val.strip()
    if TOKEN_FILE.exists():
        return TOKEN_FILE.read_text().strip()
    raise RuntimeError("NOTION_API_KEY não definida.")


def req(method: str, path: str, body: dict | None = None) -> dict:
    data = None if body is None else json.dumps(body).encode()
    request = urllib.request.Request(
        f"{API}{path}",
        data=data,
        method=method,
        headers={
            "Authorization": f"Bearer {token()}",
            "Notion-Version": VERSION,
            "Content-Type": "application/json",
        },
    )
    try:
        with urllib.request.urlopen(request, timeout=120) as resp:
            return json.loads(resp.read().decode())
    except urllib.error.HTTPError as e:
        err = e.read().decode()
        raise RuntimeError(f"{method} {path} -> {e.code}: {err}") from e


def rich(text: str, bold: bool = False) -> list[dict]:
    chunks = []
    for i in range(0, len(text), 1900):
        obj: dict = {"type": "text", "text": {"content": text[i : i + 1900]}}
        if bold:
            obj["annotations"] = {"bold": True}
        chunks.append(obj)
    return chunks or [{"type": "text", "text": {"content": " "}}]


def rt(text: str) -> dict:
    return {"rich_text": rich(text)}


def title(text: str) -> dict:
    return {"title": rich(text)}


def select(name: str) -> dict:
    return {"select": {"name": name}}


def status(name: str) -> dict:
    return {"status": {"name": name}}


def checkbox(val: bool) -> dict:
    return {"checkbox": val}


def list_children(block_id: str) -> list[dict]:
    blocks: list[dict] = []
    cursor = None
    while True:
        q = f"?page_size=100"
        if cursor:
            q += f"&start_cursor={cursor}"
        data = req("GET", f"/blocks/{block_id}/children{q}")
        blocks.extend(data.get("results", []))
        if not data.get("has_more"):
            break
        cursor = data.get("next_cursor")
    return blocks


def block_text(block: dict) -> str:
    t = block["type"]
    if t in ("paragraph", "heading_1", "heading_2", "heading_3", "bulleted_list_item",
             "numbered_list_item", "to_do", "quote"):
        return "".join(x.get("plain_text", "") for x in block[t].get("rich_text", []))
    return ""


def archive_blocks(ids: list[str]) -> None:
    for block_id in ids:
        req("PATCH", f"/blocks/{block_id}", {"archived": True})


def append_blocks(parent_id: str, children: list[dict]) -> None:
    for i in range(0, len(children), 90):
        req("PATCH", f"/blocks/{parent_id}/children", {"children": children[i : i + 90]})


def update_block_text(block_id: str, block_type: str, text: str) -> None:
    req("PATCH", f"/blocks/{block_id}", {block_type: rt(text)})


def fill_page_by_map(page_id: str, replacements: dict[str, str]) -> int:
    """Replace blocks whose text starts with a key prefix."""
    count = 0
    for block in list_children(page_id):
        t = block["type"]
        if t not in ("paragraph", "bulleted_list_item", "numbered_list_item", "quote", "to_do"):
            continue
        text = block_text(block)
        if not text:
            continue
        for prefix, new_text in replacements.items():
            if text.startswith(prefix) or prefix in text:
                update_block_text(block["id"], t, new_text)
                count += 1
                break
    return count


def query_db(db_id: str) -> list[dict]:
    rows: list[dict] = []
    cursor = None
    while True:
        body: dict = {"page_size": 100}
        if cursor:
            body["start_cursor"] = cursor
        data = req("POST", f"/databases/{db_id}/query", body)
        rows.extend(data.get("results", []))
        if not data.get("has_more"):
            break
        cursor = data.get("next_cursor")
    return rows


def create_db_row(db_id: str, props: dict) -> str:
    page = req(
        "POST",
        "/pages",
        {"parent": {"database_id": db_id}, "properties": props},
    )
    return page["id"]


def update_page_props(page_id: str, props: dict) -> None:
    req("PATCH", f"/pages/{page_id}", {"properties": props})


def fill_research() -> None:
    page_id = PAGES["research"]
    existing = list_children(page_id)
    if existing:
        archive_blocks([b["id"] for b in existing])
    blocks = [
        {"object": "block", "type": "heading_2", "heading_2": rt("Nicho & Sub-nicho")},
        {"object": "block", "type": "heading_3", "heading_3": rt("Nicho")},
        {"object": "block", "type": "paragraph", "paragraph": rt(
            "Tokenização de ativos do mundo real (RWA) e infraestrutura de confiança em blockchain."
        )},
        {"object": "block", "type": "paragraph", "paragraph": rt(
            "Mercado amplo onde equipes tentam representar ativos físicos (minerais, commodities, "
            "propriedades, cadeias de suprimento) em sistemas digitais, agentes autônomos e "
            "contratos inteligentes — mas frequentemente sem provar a origem física real dos dados."
        )},
        {"object": "block", "type": "heading_3", "heading_3": rt("Sub-nicho")},
        {"object": "block", "type": "paragraph", "paragraph": rt(
            "Prova de proveniência determinística para RWA na Casper — antes da tokenização ou "
            "do uso por agentes."
        )},
        {"object": "block", "type": "bulleted_list_item", "bulleted_list_item": rt(
            "Builders de RWA e equipes de tokenização"
        )},
        {"object": "block", "type": "bulleted_list_item", "bulleted_list_item": rt(
            "Ecossistema Casper (Odra/Rust, testnet, hackathons)"
        )},
        {"object": "block", "type": "bulleted_list_item", "bulleted_list_item": rt(
            "Avaliadores técnicos, jurados e stakeholders de compliance/risco"
        )},
        {"object": "block", "type": "bulleted_list_item", "bulleted_list_item": rt(
            "Quem precisa demonstrar Valid e Invalid on-chain — não só o happy path"
        )},
        {"object": "block", "type": "quote", "quote": rt(
            "Camada de trust para provar origem física com selo SHA-256 offline + attestation "
            "na Casper, separando verificação determinística de decisão operacional por LLM/agente."
        )},
        {"object": "block", "type": "divider", "divider": {}},
        {"object": "block", "type": "heading_3", "heading_3": rt("Anti-persona")},
        {"object": "block", "type": "bulleted_list_item", "bulleted_list_item": rt(
            "Investidor buscando yield, ROI ou retorno"
        )},
        {"object": "block", "type": "bulleted_list_item", "bulleted_list_item": rt(
            "Comprador de token ou fractional ownership"
        )},
        {"object": "block", "type": "bulleted_list_item", "bulleted_list_item": rt(
            "Quem espera produto financeiro pronto para produção"
        )},
        {"object": "block", "type": "divider", "divider": {}},
        {"object": "block", "type": "heading_3", "heading_3": rt("Status do projeto")},
        {"object": "block", "type": "paragraph", "paragraph": rt(
            "Protótipo ativo — Casper Agentic Buildathon 2026. "
            "DEMONSTRATION — simulated assets, no investment offered."
        )},
    ]
    append_blocks(page_id, blocks)
    print("  ✓ Research")


def fill_identidade() -> None:
    replacements = {
        "Para investidor/cliente institucional:": (
            "Para investidor/cliente institucional: Camada de confiança auditável para RWA — "
            "prova de origem física ancorada na Casper antes de tokenizar ou de agentes agirem."
        ),
        "Para usuário final/varejo:": (
            "Para usuário final/varejo: Não é o público principal. Lastre é infraestrutura "
            "developer-facing e demo técnica — não produto financeiro de varejo."
        ),
        "[preencher]": (
            "Proof before token — a cadeia de prova da terra ao token, com selo SHA-256 "
            "determinístico e vereditos Valid/Invalid na Casper Testnet."
        ),
        "[Valor 1]": (
            "Determinismo — o selo SHA-256 decide o veredito; nunca o LLM"
        ),
        "[Valor 2]": (
            "Transparência — Invalid é prova permanente on-chain, não erro descartado"
        ),
        "[Valor 3]": (
            "Honestidade regulatória — banner de demonstração; zero linguagem de investimento"
        ),
        "Palavras que definem:": (
            "Palavras que definem: técnico, credível, preciso, forense, infrastructure-grade"
        ),
        "Palavras proibidas:": (
            "Palavras proibidas: invest, yield, ROI, returns, profit, buy, sell, ownership, "
            "token sale, passive income, AI verified truth"
        ),
        "Exemplo de tom correto:": (
            'Exemplo de tom correto: "The seal decides the verdict. The LLM can only choose an action."'
        ),
        "Exemplo de tom errado:": (
            'Exemplo de tom errado: "AI-verified gold tokens with guaranteed returns."'
        ),
        "Categoria de mercado:": (
            "Categoria de mercado: Infraestrutura de proveniência RWA / camada de confiança / "
            "protocolo proof-of-origin (não fintech de investimento)"
        ),
        "Nível de consciência do mercado:": (
            "Nível de consciência do mercado: Novo conceito — trust layer antes da tokenização"
        ),
        "De → Para:": (
            "De → Para: O builder sai de demos token-first sem prova de origem física e chega em "
            "arquitetura auditável com selo offline + attestation Casper + rejeição como evidência."
        ),
        "[Escrever aqui o pitch completo": (
            "Lastre é a camada de prova de proveniência para RWA na Casper. Medimos origem física, "
            "geramos um selo SHA-256 offline, ancoramos Valid ou Invalid on-chain, e só então "
            "permitimos mint simbólico ou ação de agente. Para builders, jurados e compliance que "
            "precisam de proof before token — não de mais um slide de tokenização genérico."
        ),
        "Para [público] que": (
            "Para builders RWA e avaliadores técnicos que precisam provar origem física antes de "
            "tokenizar, a Lastre é a camada de trust que ancora vereditos determinísticos na Casper, "
            "diferente de oráculos de preço ou AI verified, porque o selo decide o veredito e "
            "Invalid também fica on-chain."
        ),
    }
    n = fill_page_by_map(PAGES["identidade"], replacements)
    print(f"  ✓ Identidade e posicionamento ({n} blocos)")


def fill_conteudo() -> None:
    replacements = {
        "Headline institucional:": "Headline institucional: Proof before token.",
        "Headline varejo / usuário final:": (
            "Headline varejo / usuário final: A cadeia de prova da terra ao token — "
            "verificada offline e ancorada na Casper."
        ),
        "Headline em inglês:": "Headline em inglês: Proof before token.",
        "Subheadline:": (
            "Subheadline: Deterministic SHA-256 seals anchor both Valid and Invalid "
            "provenance verdicts on Casper — before tokenization or agent action."
        ),
        "CTA principal:": "CTA principal: Verificar proveniência",
        "CTA secundário:": "CTA secundário: Spot the fraud",
        "[preencher]": "",  # handled by numbered items below
    }
    args = [
        "Proof before token — narrativa clara e defensável para RWA.",
        "Selo SHA-256 decide o veredito; LLM só escolhe ação (pay/skip/escalate).",
        "Invalid é prova permanente on-chain — rejeição auditável.",
        "Demo Spot-the-Fraud: +1 g quebra o selo → veredito Invalid.",
        "Casper-native: contrato ProofOfOrigin deployado na testnet com txs públicas.",
    ]
    idx = 0
    for block in list_children(PAGES["conteudo"]):
        if block["type"] != "numbered_list_item":
            continue
        text = block_text(block)
        if "[preencher]" in text and idx < len(args):
            update_block_text(block["id"], "numbered_list_item", args[idx])
            idx += 1
    n = fill_page_by_map(PAGES["conteudo"], replacements)
    print(f"  ✓ Conteúdo e narrativa ({n + idx} blocos)")


def fill_gtm() -> None:
    replacements = {
        "Modelo de GTM:": "Modelo de GTM: Product-led + Community-led (hackathon/ecossistema Casper)",
        "Mercado inicial:": (
            "Mercado inicial: Ecossistema Casper, RWA builders, hackathons e avaliadores técnicos"
        ),
        "ICP do lançamento:": (
            "ICP do lançamento: Marina — RWA Protocol Lead (30–45), construindo demo/MVP em Casper"
        ),
        "Proposta de valor em 1 frase:": (
            "Proposta de valor em 1 frase: Proof before token — origem física verificada "
            "deterministicamente antes de tokenizar ou de agentes agirem."
        ),
        "Data: [preencher]": "Data: Casper Agentic Buildathon 2026",
        "[preencher]": "Demo pública lastre.io + repo open-core + gravação Spot-the-Fraud",
    }
    # Check launch goals
    for block in list_children(PAGES["metas"]):
        if block["type"] != "to_do":
            continue
        text = block_text(block)
        if text == "Educar o mercado":
            req("PATCH", f"/blocks/{block['id']}", {"to_do": {**block["to_do"], "checked": True}})
        elif text == "Validar demanda":
            req("PATCH", f"/blocks/{block['id']}", {"to_do": {**block["to_do"], "checked": True}})
    n = fill_page_by_map(PAGES["gtm"], replacements)
    print(f"  ✓ Go-To Market ({n} blocos)")


def fill_canais() -> None:
    channel_map = {
        "LinkedIn:": {
            "Objetivo:": "Objetivo: Narrativa técnica para builders RWA e ecossistema Casper",
            "Frequência de post:": "Frequência de post: Durante buildathon / marcos de deploy",
            "Tipo de conteúdo:": "Tipo de conteúdo: Arquitetura, txs on-chain, demo Spot-the-Fraud",
            "Responsável:": "Responsável: Felix (demo ops) + Laura (design)",
        },
        "Instagram:": {
            "Objetivo:": "Objetivo: Baixa prioridade — produto é developer-facing",
            "Frequência de post:": "Frequência de post: Opcional / clips de demo",
            "Tipo de conteúdo:": "Tipo de conteúdo: Motion hero, Spot-the-Fraud clip",
            "Responsável:": "Responsável: Laura",
        },
        "Email:": {
            "Objetivo:": "Objetivo: N/A no protótipo — sem lista de leads institucionais ainda",
            "Ferramenta:": "Ferramenta: N/A",
            "Frequência:": "Frequência: N/A",
        },
    }
    site_replacements = {
        "Objetivo principal:": (
            "Objetivo principal: Demonstrar proof before token em <15s — selo, tamper, veredito on-chain"
        ),
        "Páginas prioritárias:": (
            "Páginas prioritárias: / (landing), /proof, /catalog, /spot-fraud, app console"
        ),
        "Frequência de atualização:": (
            "Frequência de atualização: Contínua durante buildathon; estabilizar pós-launch"
        ),
    }
    current = None
    count = 0
    for block in list_children(PAGES["canais"]):
        t = block["type"]
        if t == "paragraph":
            txt = block_text(block).strip()
            if txt in channel_map:
                current = txt
            elif txt == "Site:":
                current = "Site:"
        if t == "bulleted_list_item":
            text = block_text(block)
            if current == "Site:":
                for prefix, new in site_replacements.items():
                    if text.startswith(prefix):
                        update_block_text(block["id"], t, new)
                        count += 1
                        break
            elif current in channel_map:
                for prefix, new in channel_map[current].items():
                    if text.startswith(prefix) or "[preencher]" in text and prefix.rstrip(":") in text:
                        update_block_text(block["id"], t, new)
                        count += 1
                        break
                if text.strip() in ("", " "):
                    # Objetivo line left blank by prior run
                    if current in channel_map and "Objetivo:" in channel_map[current]:
                        update_block_text(block["id"], t, channel_map[current]["Objetivo:"])
                        count += 1
    print(f"  ✓ Canais ({count} blocos)")


def fill_tecnico() -> None:
    replacements = {
        "Frontend:": "Frontend: React/Vite (lastre.io + app console), Vercel",
        "Backend:": "Backend: Gateway Node/Express (lastro.onrender.com → api.lastre.io)",
        "Banco de dados:": "Banco de dados: Estado on-chain Casper Testnet (sem DB relacional no protótipo)",
        "Hosting:": "Hosting: Vercel (frontend) + Render (gateway)",
        "CI/CD:": "CI/CD: GitHub Actions + deploy Vercel/Render",
        "URL:": "URL: https://github.com/FelixRodrigues007/lastro",
        "Acesso:": "Acesso: Repositório público",
        "Integrações obrigatórias": (
            "Integrações obrigatórias: Casper Testnet (ProofOfOrigin + MintGate), x402 mock facilitator, gateway JSON API"
        ),
        "[preencher]": "Monitoramento: health check gateway + smoke tests pré-demo",
        "Ferramenta:": "Ferramenta: A definir (protótipo — eventos mínimos: demo batch, seal verify, tx anchor)",
        "Eventos principais:": (
            "Eventos principais: spot_fraud_played, proof_verified, attestation_submitted, demo_batch_run"
        ),
    }
    n = fill_page_by_map(PAGES["tecnico"], replacements)
    print(f"  ✓ Técnico e operacional ({n} blocos)")


def fill_metas() -> None:
    replacements = {
        "Data ideal de lançamento:": "Data ideal de lançamento: Casper Agentic Buildathon 2026",
        "Evento externo puxando prazo:": (
            "Evento externo puxando prazo: Casper Agentic Buildathon 2026"
        ),
        "Rodada/parceria/campanha vinculada:": (
            "Rodada/parceria/campanha vinculada: Hackathon Casper — sem rodada financeira"
        ),
        "Outro: [preencher]": (
            "Outro: Validar arquitetura proof-before-token com jurados e builders RWA"
        ),
    }
    for block in list_children(PAGES["metas"]):
        if block["type"] == "to_do":
            text = block_text(block)
            if text in ("Educar o mercado", "Validar demanda"):
                req("PATCH", f"/blocks/{block['id']}", {"to_do": {**block["to_do"], "checked": True}})
    n = fill_page_by_map(PAGES["metas"], replacements)
    print(f"  ✓ Metas e lançamento ({n} blocos)")


def fill_visual() -> None:
    replacements = {
        "Dark mode, light mode ou ambos:": "Dark mode, light mode ou ambos: Dark mode primário (forense/infrastructure)",
        "Mood da marca:": "Mood da marca: forense, rigoroso, infrastructure-grade",
        "Marca de referência em outro setor:": (
            "Marca de referência em outro setor: Linear / Raycast (precisão técnica) + "
            "estética audit trail / chain-of-custody"
        ),
    }
    n = fill_page_by_map(PAGES["visual"], replacements)
    print(f"  ✓ Identidade visual ({n} blocos)")


def clear_and_seed_db(db_key: str, rows: list[dict]) -> None:
    db_id = DBS[db_key]
    existing = query_db(db_id)
    for row in existing:
        req("PATCH", f"/pages/{row['id']}", {"archived": True})
    for props in rows:
        create_db_row(db_id, props)
    print(f"  ✓ DB {db_key} ({len(rows)} linhas)")


def fill_databases() -> None:
    clear_and_seed_db("personas", [
        {
            "Persona": title("Marina — RWA Protocol Lead"),
            "Tipo": select("Primária"),
            "Perfil": rt("Fundadora/CTO ou lead de produto, 30–45, construindo demo/MVP em Casper"),
            "Dor / medo": rt(
                "Demos provam preço/propriedade mas não origem física; medo de greenwashing e auditoria fraca"
            ),
            "Desejo principal": rt(
                "Mostrar proof before token em <15s com txs reais na testnet"
            ),
            "Objeções": rt("Complexidade on-chain; medo de overclaim em IA"),
            "Conversão desejada": rt("Clone do repo, exploração da demo, entendimento da arquitetura"),
            "Geografia": rt("Global — ecossistema Casper, hackathons, GitHub"),
            "Nível de consciência": select("Consciente do problema"),
        },
        {
            "Persona": title("Rafael — Technical Evaluator / Jurado"),
            "Tipo": select("Secundária"),
            "Perfil": rt("Engenheiro, auditor ou jurado de buildathon"),
            "Dor / medo": rt("Separar demo superficial de infraestrutura que funciona de verdade"),
            "Desejo principal": rt(
                "Contrato deployado, leitura on-chain, fronteiras de confiança claras"
            ),
            "Conversão desejada": rt("Verificar package hash, txs e fluxo Valid/Invalid"),
        },
        {
            "Persona": title("Camila — Compliance / Risk"),
            "Tipo": select("Secundária"),
            "Perfil": rt("Risco, compliance ou auditoria em projeto RWA"),
            "Dor / medo": rt("Invalid desaparece — sem rastro auditável quando proveniência falha"),
            "Desejo principal": rt("Rejeição registrada como prova permanente on-chain"),
        },
    ])

    clear_and_seed_db("dor_solucao", [
        {
            "Dor do público": title("Demos RWA não provam origem física"),
            "Solução que a oferta entrega": rt("Selo SHA-256 offline + attestation Casper antes do token"),
            "Feature / mecanismo": rt("Sealer → ProofOfOrigin → MintGate"),
            "Prova": rt("Spot-the-Fraud: +1g → selo quebrado → Invalid on-chain"),
        },
        {
            "Dor do público": title("LLM vendido como fonte da verdade"),
            "Solução que a oferta entrega": rt("Separação verificação (selo) vs orquestração (agente)"),
            "Feature / mecanismo": rt("OriginChain Agent — LLM escolhe pay/skip/escalate apenas"),
            "Prova": rt("Copy e arquitetura documentados; veredito vem do contrato"),
        },
        {
            "Dor do público": title("Erros de proveniência são apagados"),
            "Solução que a oferta entrega": rt("Invalid gravado on-chain como evidência permanente"),
            "Feature / mecanismo": rt("ProofOfOrigin registra accepted e rejected"),
            "Prova": rt("Estado on-chain: accepted=2, rejected=1; LOTE-001 Invalid"),
        },
        {
            "Dor do público": title("Difícil explicar confiança em 15 segundos"),
            "Solução que a oferta entrega": rt("Narrativa proof before token + demo interativa"),
            "Feature / mecanismo": rt("/spot-fraud + ProofJourney na landing"),
            "Prova": rt("North star: proveniência óbvia em <15s"),
        },
    ])

    clear_and_seed_db("ofertas", [
        {
            "Oferta": title("Protocolo ProofOfOrigin + MintGate"),
            "Tipo": select("Produto"),
            "Público": select("B2B"),
            "Benefício principal": rt("Vereditos Valid/Invalid ancorados na Casper Testnet"),
            "Solução": rt("Contratos Odra/Rust deployados — leitura via gateway"),
            "Preço / valor": rt("Open-core (Apache-2.0 contratos; sealer BUSL-1.1)"),
            "CTA": rt("Explorar repo + verificar txs no explorer"),
            "Status": status("Validado"),
        },
        {
            "Oferta": title("Demo pública lastre.io"),
            "Tipo": select("Produto"),
            "Público": select("B2B"),
            "Benefício principal": rt("Proof before token demonstrável sem confiar no frontend"),
            "Solução": rt("Landing, /proof, /catalog, /spot-fraud"),
            "CTA": rt("Verificar proveniência / Spot the fraud"),
            "Status": status("Validado"),
        },
        {
            "Oferta": title("Gateway API"),
            "Tipo": select("Produto"),
            "Público": select("B2B"),
            "Benefício principal": rt("Leituras on-chain + writes controlados SANDBOX"),
            "Solução": rt("https://lastro.onrender.com → api.lastre.io"),
            "Status": status("Validado"),
        },
    ])

    clear_and_seed_db("claims", [
        {
            "Claim": title("Proof before token"),
            "Categoria": select("Produto"),
            "Versão segura": rt("Origem física verificada deterministicamente antes de tokenizar"),
            "Pode publicar?": checkbox(True),
            "Precisa disclaimer?": checkbox(True),
            "Fonte de prova": rt("Arquitetura + demo lastre.io"),
            "Status": status("Aprovado"),
        },
        {
            "Claim": title("Invalid is proof too"),
            "Categoria": select("Produto"),
            "Versão segura": rt("Rejeições de proveniência ficam registradas on-chain como evidência"),
            "Pode publicar?": checkbox(True),
            "Precisa disclaimer?": checkbox(True),
            "Status": status("Aprovado"),
        },
        {
            "Claim": title("The seal decides the verdict"),
            "Categoria": select("Produto"),
            "Versão segura": rt("Selo SHA-256 decide Valid/Invalid; LLM só escolhe ação"),
            "Pode publicar?": checkbox(True),
            "Status": status("Aprovado"),
        },
    ])

    clear_and_seed_db("brand_voice", [
        {
            "Item": title("Tom geral"),
            "Categoria": select("Tom"),
            "Diretriz": rt("Técnico, credível, preciso, contido — forense e infrastructure-grade"),
            "Exemplo correto": rt("Change one gram. The seal breaks."),
            "Exemplo errado": rt("AI-verified tokens with guaranteed returns"),
            "Pode ir para site?": checkbox(True),
            "Idioma": select("EN"),
            "Status": status("Validado"),
        },
        {
            "Item": title("Palavras proibidas"),
            "Categoria": select("Frase proibida"),
            "Diretriz": rt("invest, yield, ROI, returns, profit, buy, sell, ownership, token sale"),
            "Status": status("Validado"),
        },
    ])

    clear_and_seed_db("objecoes", [
        {
            "Objeção": title("Isso é produto financeiro?"),
            "Resposta curta": rt("Não — camada de prova/proveniência, sem yield ou venda."),
            "Resposta longa": rt(
                "Lastre é infraestrutura de trust para RWA. Não oferece investimento, retorno, "
                "yield ou direitos financeiros. Banner DEMONSTRATION em toda tela."
            ),
            "Persona": select("Cético"),
            "Usar em FAQ?": checkbox(True),
            "Status": status("Validada"),
        },
        {
            "Objeção": title("O LLM decide se é válido?"),
            "Resposta curta": rt("Não — o selo SHA-256 decide; o LLM só escolhe ação."),
            "Resposta longa": rt(
                "Verificação determinística (sealer) é separada de orquestração (OriginChain Agent). "
                "Veredito vem do contrato via gateway."
            ),
            "Persona": select("Comprador técnico"),
            "Usar em FAQ?": checkbox(True),
            "Status": status("Validada"),
        },
        {
            "Objeção": title("Está pronto para produção?"),
            "Resposta curta": rt("Não — protótipo com dados fictícios, não auditado."),
            "Persona": select("Comprador técnico"),
            "Usar em FAQ?": checkbox(True),
            "Status": status("Validada"),
        },
        {
            "Objeção": title("São dados reais de mineração?"),
            "Resposta curta": rt("Não — samples fictícios (ex.: Mineradora Vale do Ouro, LOTE-001/002)."),
            "Persona": select("Cético"),
            "Usar em FAQ?": checkbox(True),
            "Status": status("Validada"),
        },
    ])

    clear_and_seed_db("faq", [
        {
            "Pergunta": title("O que é a Lastre?"),
            "Resposta": rt(
                "Protocolo de proof-of-provenance para RWA na Casper: selo SHA-256 offline, "
                "attestation on-chain, proof before token."
            ),
            "Categoria": select("Produto"),
            "Prioridade": select("Alta"),
            "Fonte": select("Pesquisa"),
            "Status": status("Concluído"),
        },
        {
            "Pergunta": title("Para quem é?"),
            "Resposta": rt(
                "Builders RWA, avaliadores técnicos, jurados de hackathon e stakeholders de "
                "compliance — não investidores de varejo."
            ),
            "Categoria": select("Produto"),
            "Prioridade": select("Alta"),
            "Fonte": select("Pesquisa"),
            "Status": status("Concluído"),
        },
        {
            "Pergunta": title("Por que Casper?"),
            "Resposta": rt(
                "Buildathon/ecossistema; contrato ProofOfOrigin já na testnet com estado verificável."
            ),
            "Categoria": select("Produto"),
            "Prioridade": select("Média"),
            "Fonte": select("Pesquisa"),
            "Status": status("Concluído"),
        },
    ])

    clear_and_seed_db("vocabulario", [
        {
            "Termo": title("Proof before token"),
            "Tipo": select("Branding"),
            "Notas": rt("Proveniência verificada antes de tokenizar ou agente agir"),
            "Usar em": {"multi_select": [{"name": "Site"}]},
        },
        {
            "Termo": title("Seal"),
            "Tipo": select("Técnico"),
            "Notas": rt("Digest SHA-256 determinístico do artefato de proveniência"),
            "Usar em": {"multi_select": [{"name": "Site"}]},
        },
        {
            "Termo": title("Verdict"),
            "Tipo": select("Técnico"),
            "Notas": rt("Valid ou Invalid — decidido pelo selo, não pelo LLM"),
        },
        {
            "Termo": title("Attestation"),
            "Tipo": select("Técnico"),
            "Notas": rt("Registro on-chain do veredito no contrato ProofOfOrigin"),
        },
    ])

    clear_and_seed_db("concorrentes", [
        {
            "Nome": title("Oráculos de preço/claims"),
            "Segmento": select("Direto"),
            "Posicionamento": rt("Provam número ou claim, não origem física determinística"),
            "Pontos Fracos": rt("Teatro de oráculo; sem selo offline auditável"),
            "Pontos Fortes": rt("Integração madura em DeFi"),
        },
        {
            "Nome": title("PDFs e auditoria manual"),
            "Segmento": select("Indireto"),
            "Posicionamento": rt("Documentação tradicional de proveniência"),
            "Pontos Fracos": rt("Lento, difícil de compor em workflow agentic"),
        },
        {
            "Nome": title("AI verified / LLM como oráculo"),
            "Segmento": select("Direto"),
            "Posicionamento": rt("IA como fonte da verdade"),
            "Pontos Fracos": rt("Inaceitável para compliance; não determinístico"),
        },
        {
            "Nome": title("Demos token-first"),
            "Segmento": select("Direto"),
            "Posicionamento": rt("Tokenização sem prova de origem"),
            "Pontos Fracos": rt("Pulam a pergunta mais importante — origem física"),
        },
    ])


def seed_db(db_key: str, rows: list[dict]) -> None:
    """Seed database without archiving (append-only for partial fills)."""
    db_id = DBS[db_key]
    existing = query_db(db_id)
    if existing:
        print(f"  ↷ DB {db_key} já tem {len(existing)} linhas — pulando")
        return
    for props in rows:
        create_db_row(db_id, props)
    print(f"  ✓ DB {db_key} ({len(rows)} linhas)")


def fill_auxiliary() -> None:
    clear_and_seed_db("funil_aquisicao", [
        {
            "Fase": title("Awareness"),
            "Etapa": rt("Descobre Lastre via hackathon, GitHub ou lastre.io"),
            "Objetivo": rt("Entender proof before token em <15s"),
            "Canais": rt("Site, GitHub, Discord Casper, demo Spot-the-Fraud"),
            "CTA": rt("Verificar proveniência"),
            "Gatilho emocional": rt("Ceticismo com demos RWA superficiais"),
        },
        {
            "Fase": title("Consideração"),
            "Etapa": rt("Explora arquitetura: sealer → Casper → agente"),
            "Objetivo": rt("Validar que Invalid também fica on-chain"),
            "Canais": rt("Repo, gateway API, explorer Casper testnet"),
            "CTA": rt("Spot the fraud / clone repo"),
            "Gatilho emocional": rt("Medo de overclaim em IA"),
        },
        {
            "Fase": title("Decisão"),
            "Etapa": rt("Avaliador técnico ou jurado testa fluxo completo"),
            "Objetivo": rt("Confirmar txs reais e fronteiras selo vs LLM"),
            "Canais": rt("Demo live, README, package hash verificável"),
            "CTA": rt("Verificar no explorer"),
            "Gatilho emocional": rt("Precisa de prova auditável, não slide"),
        },
        {
            "Fase": title("Advocacy"),
            "Etapa": rt("Builder leva narrativa para pitch/slides"),
            "Objetivo": rt("Reutilizar arquitetura como trust layer"),
            "Canais": rt("GitHub fork, Notion briefing, gravação demo"),
            "CTA": rt("Integrar gateway / contratos"),
            "Gatilho emocional": rt("Quer diferenciar no ecossistema Casper"),
        },
    ])

    seed_db("funil_lifecycle", [
        {
            "Etapa": title("Onboarding técnico"),
            "Fase": select("Topo"),
            "Objetivo": rt("Rodar demo batch e entender 4 passos do fluxo"),
            "Canais": {"multi_select": [{"name": "Website"}, {"name": "Email"}]},
            "Conteúdo Sugerido": rt("ProofJourney + OverviewNextStep no console"),
            "CTA Principal": rt("Run demo batch"),
            "Gatilhos Emocionais": rt("Curiosidade + ceticismo saudável"),
        },
        {
            "Etapa": title("Exploração profunda"),
            "Fase": select("Meio"),
            "Objetivo": rt("Verificar package hash e estado on-chain"),
            "Canais": {"multi_select": [{"name": "Website"}]},
            "Conteúdo Sugerido": rt("Links para testnet.cspr.live + gateway health"),
            "CTA Principal": rt("Abrir explorer"),
        },
        {
            "Etapa": title("Integração / fork"),
            "Fase": select("Fundo"),
            "Objetivo": rt("Adotar contratos ou gateway no próprio MVP"),
            "Canais": {"multi_select": [{"name": "Website"}]},
            "Conteúdo Sugerido": rt("Docs hub + open-core Apache-2.0"),
            "CTA Principal": rt("Clone repo"),
        },
        {
            "Etapa": title("Feedback pós-demo"),
            "Fase": select("Pós-venda"),
            "Objetivo": rt("Coletar gaps de UX e hardening para roadmap"),
            "Canais": {"multi_select": [{"name": "Email"}]},
            "Conteúdo Sugerido": rt("Issues GitHub + Notion UX audit"),
            "CTA Principal": rt("Abrir issue"),
        },
    ])

    clear_and_seed_db("tom_canal", [
        {
            "Canal": title("Site / lastre.io"),
            "Tom": rt("Técnico, preciso, proof-led — headlines curtas"),
            "Formalidade": select("Semi-formal"),
            "Exemplos de Linguagem": rt("Proof before token. Change one gram. The seal breaks."),
            "Evitar": rt("yield, ROI, AI verified, hype crypto"),
            "Referências": rt("design-system/product-marketing-context.md"),
        },
        {
            "Canal": title("GitHub / README"),
            "Tom": rt("Developer-facing, arquitetura clara, honest sobre protótipo"),
            "Formalidade": select("Semi-formal"),
            "Exemplos de Linguagem": rt("Deterministic seal decides verdict; LLM chooses action only."),
            "Evitar": rt("Promessas financeiras, mainnet-ready"),
        },
        {
            "Canal": title("LinkedIn / pitch"),
            "Tom": rt("Infrastructure-grade, credível para jurados e parceiros"),
            "Formalidade": select("Formal"),
            "Exemplos de Linguagem": rt("Trust layer for RWA provenance on Casper Testnet."),
            "Evitar": rt("Token sale, passive income, real company names"),
        },
        {
            "Canal": title("Discord / hackathon"),
            "Tom": rt("Direto, demo-first, links para txs"),
            "Formalidade": select("Informal"),
            "Exemplos de Linguagem": rt("LOTE-001 is Invalid on-chain — tamper proof in 15s."),
            "Evitar": rt("Overclaim em IA ou produção"),
        },
    ])

    seed_db("gtm_canais", [
        {
            "Canal": title("lastre.io + demo"),
            "Tipo": select("Orgânico"),
            "Prioridade": select("Alta"),
            "Meta": rt("Proveniência óbvia em <15s para visitante técnico"),
            "Responsável": rt("Laura (UI) + Felix (gateway)"),
            "Status": status("Em andamento"),
        },
        {
            "Canal": title("GitHub open-core"),
            "Tipo": select("Orgânico"),
            "Prioridade": select("Alta"),
            "Meta": rt("Repo auditável com contratos e README defensável"),
            "Responsável": rt("Felix"),
            "Status": status("Em andamento"),
        },
        {
            "Canal": title("Ecossistema Casper / Discord"),
            "Tipo": select("Parceria"),
            "Prioridade": select("Alta"),
            "Meta": rt("Visibilidade no Agentic Buildathon 2026"),
            "Responsável": rt("Felix"),
            "Status": status("Em andamento"),
        },
        {
            "Canal": title("Gravação Spot-the-Fraud"),
            "Tipo": select("Orgânico"),
            "Prioridade": select("Média"),
            "Meta": rt("Hook de 15s para pitch e redes"),
            "Responsável": rt("Felix + Laura"),
            "Status": status("Não iniciada"),
        },
    ])

    seed_db("gtm_parcerias", [
        {
            "Parceiro": title("Casper Foundation / Buildathon"),
            "Tipo": select("Co-marketing"),
            "Status": select("Em conversa"),
            "O que oferecemos": rt("Demo Casper-native proof-of-provenance + contrato na testnet"),
            "O que ganhamos": rt("Visibilidade, feedback técnico, narrativa agentic + x402"),
        },
        {
            "Parceiro": title("Comunidade RWA builders"),
            "Tipo": select("Distribuição"),
            "Status": select("Prospectando"),
            "O que oferecemos": rt("Trust layer open-core reutilizável"),
            "O que ganhamos": rt("Validação de arquitetura e casos de uso"),
        },
    ])

    seed_db("canais_presenca", [
        {
            "Canal": title("lastre.io"),
            "Tipo": select("Site"),
            "URL / Handle": {"url": "https://lastre.io"},
            "Objetivo": rt("Demo pública proof before token"),
            "Frequência": rt("Contínua — deploy Vercel"),
            "Responsável": rt("Laura"),
            "Status": status("Em andamento"),
        },
        {
            "Canal": title("GitHub"),
            "Tipo": select("Site"),
            "URL / Handle": {"url": "https://github.com/FelixRodrigues007/lastro"},
            "Objetivo": rt("Código, contratos, docs"),
            "Frequência": rt("Por commit / PR"),
            "Responsável": rt("Felix"),
            "Status": status("Em andamento"),
        },
        {
            "Canal": title("Gateway API"),
            "Tipo": select("Ferramenta"),
            "URL / Handle": {"url": "https://lastro.onrender.com"},
            "Objetivo": rt("Leituras on-chain + writes SANDBOX"),
            "Frequência": rt("Sempre on (Render)"),
            "Responsável": rt("Felix"),
            "Status": status("Em andamento"),
        },
        {
            "Canal": title("Casper Testnet Explorer"),
            "Tipo": select("Ferramenta"),
            "URL / Handle": {"url": "https://testnet.cspr.live"},
            "Objetivo": rt("Verificação independente de txs"),
            "Responsável": rt("Público"),
            "Status": status("Concluído"),
        },
    ])

    clear_and_seed_db("dominios", [
        {
            "Recurso": title("lastre.io"),
            "URL / acesso": rt("https://lastre.io — Vercel production"),
            "Responsável": rt("Laura"),
            "Senha/gestor": rt("Vercel team / DNS apex"),
        },
        {
            "Recurso": title("api.lastre.io (futuro)"),
            "URL / acesso": rt("Render custom domain → substituir lastro.onrender.com"),
            "Responsável": rt("Felix"),
        },
        {
            "Recurso": title("GitHub repo"),
            "URL / acesso": rt("https://github.com/FelixRodrigues007/lastro"),
            "Responsável": rt("Felix"),
        },
        {
            "Recurso": title("Notion Subnichos Genesis"),
            "URL / acesso": rt("https://app.notion.com/p/subnichosgenesis/Lastre-3900c187eeaf802085b8e1b0654bde42"),
            "Responsável": rt("Laura"),
        },
    ])

    clear_and_seed_db("metricas", [
        {
            "Métrica": title("Tempo até entender proof before token"),
            "Meta": rt("< 15 segundos na landing ou Spot-the-Fraud"),
            "Como medir": rt("Teste moderado + gravação demo"),
            "Status": status("Em andamento"),
        },
        {
            "Métrica": title("Demo batch completo sem erro"),
            "Meta": rt("Smoke test verde no gateway + frontend"),
            "Como medir": rt("CI + teste manual pré-pitch"),
            "Status": status("Em andamento"),
        },
        {
            "Métrica": title("Vereditos on-chain verificáveis"),
            "Meta": rt("LOTE-001 Invalid + LOTE-002 Valid com links explorer"),
            "Como medir": rt("Estado contrato + accepted/rejected counters"),
            "Resultado atual": rt("accepted=2, rejected=1 (testnet)"),
            "Status": status("Concluído"),
        },
        {
            "Métrica": title("Zero palavras da blacklist em UI pública"),
            "Meta": rt("Nenhum yield/ROI/invest em copy live"),
            "Como medir": rt("banned-word checks + revisão manual"),
            "Status": status("Em andamento"),
        },
    ])

    clear_and_seed_db("design_system_a", [
        {
            "Elemento": title("Background primary"),
            "Categoria": select("Cor"),
            "Hex / token": rt("--lastro-bg-primary / olive-950 #0a1713"),
            "Valor": rt("#0a1713"),
            "Regra de uso": rt("Superfície default dark — forense/infrastructure"),
            "Status": status("Validado"),
            "Pode reutilizar em case?": checkbox(True),
        },
        {
            "Elemento": title("Brand seal accent"),
            "Categoria": select("Cor"),
            "Hex / token": rt("--lastro-brand-seal / seal-500 #72c458"),
            "Valor": rt("#72c458"),
            "Regra de uso": rt("CTAs, selo válido, sinais de prova — não decoração"),
            "Status": status("Validado"),
        },
        {
            "Elemento": title("Status valid"),
            "Categoria": select("Cor"),
            "Hex / token": rt("--lastro-status-valid / valid-500 #6f8f2e"),
            "Valor": rt("#6f8f2e"),
            "Regra de uso": rt("Veredito Valid, badges de sucesso on-chain"),
            "Status": status("Validado"),
        },
        {
            "Elemento": title("Status invalid"),
            "Categoria": select("Cor"),
            "Hex / token": rt("--lastro-status-invalid / invalid-500 #c34a2c"),
            "Valor": rt("#c34a2c"),
            "Regra de uso": rt("Veredito Invalid, tamper, rejeição — prova, não erro"),
            "Status": status("Validado"),
        },
        {
            "Elemento": title("Font display"),
            "Categoria": select("Tipografia"),
            "Hex / token": rt("--lastro-font-display"),
            "Valor": rt("Inter Display, Inter, system-ui"),
            "Regra de uso": rt("Headlines, títulos de painel"),
            "Status": status("Validado"),
        },
        {
            "Elemento": title("Font mono"),
            "Categoria": select("Tipografia"),
            "Hex / token": rt("--lastro-font-mono"),
            "Valor": rt("JetBrains Mono, IBM Plex Mono"),
            "Regra de uso": rt("Hashes, lot IDs, dados forenses"),
            "Status": status("Validado"),
        },
    ])

    seed_db("design_system_b", [
        {
            "Elemento": title("Tokens canonical CSS"),
            "Categoria": select("Cor"),
            "Valor / Token": rt("design-system/tokens/lastro.css v0.3.1"),
            "Hex / Código": rt(":root — forest-mint family, dark default"),
            "Regra de uso": rt("Única fonte canônica web + app"),
            "Arquivo / Link": {"url": "https://github.com/FelixRodrigues007/lastro/tree/main/design-system/tokens"},
            "Status": select("Definido"),
        },
        {
            "Elemento": title("Radius md"),
            "Categoria": select("Espaçamento"),
            "Valor / Token": rt("--lastro-radius-md: 16px"),
            "Regra de uso": rt("Cards, painéis de prova"),
            "Status": select("Definido"),
        },
    ])

    clear_and_seed_db("refs_visuais", [
        {
            "Referência": title("Linear"),
            "Tipo": select("UI/Layout"),
            "Aplicar Em": select("Interações"),
            "URL": {"url": "https://linear.app"},
            "O Que Capturar": rt("Precisão técnica, densidade informacional, zero crypto slop"),
        },
        {
            "Referência": title("Raycast"),
            "Tipo": select("UI/Layout"),
            "Aplicar Em": select("Atmosfera geral"),
            "URL": {"url": "https://raycast.com"},
            "O Que Capturar": rt("Dark infrastructure-grade, motion contido"),
        },
        {
            "Referência": title("Hero motion Lastre"),
            "Tipo": select("Animação/Motion"),
            "Aplicar Em": select("Hero"),
            "O Que Capturar": rt("Cadeia de custódia terra→token; output/lastre-hero-motion/"),
        },
    ])

    clear_and_seed_db("assets_marca", [
        {
            "Asset": title("Logo Lastre 480px"),
            "Tipo": select("Logo"),
            "Arquivo / link": {"url": "https://lastre.io"},
            "Uso": {"multi_select": [{"name": "Site"}, {"name": "Social"}]},
            "Status": status("Aprovado"),
            "Pode publicar?": checkbox(True),
            "Observação": rt("output/exports/lastro-logo-480x480.png"),
        },
        {
            "Asset": title("Favicon set"),
            "Tipo": select("Ícone"),
            "Uso": {"multi_select": [{"name": "Site"}]},
            "Status": status("Aprovado"),
            "Pode publicar?": checkbox(True),
            "Observação": rt("32/180/480 — output/exports/"),
        },
        {
            "Asset": title("Hero video web"),
            "Tipo": select("Vídeo"),
            "Uso": {"multi_select": [{"name": "Site"}]},
            "Status": status("Em revisão"),
            "Observação": rt("output/lastre-hero-motion/web/lastre-hero-1080.mp4"),
        },
    ])

    # Fix inline template leftovers in callout (Akrus, empty journey intros)
    callout_replacements = {
        "Antes de conhecer a Akrus:": (
            "Antes de conhecer a Lastre: consome dados RWA não verificados; "
            "tokens herdam ceticismo; Invalid desaparece como erro."
        ),
        "Onboarding (dia 1-7):": (
            "Onboarding (dia 1-7): landing → Spot-the-Fraud → verificar tx no explorer → README"
        ),
        "ToFu (ainda não conhece):": (
            "ToFu (ainda não conhece): 'Mais um demo RWA?' — hook Spot-the-Fraud + proof before token"
        ),
    }
    n = fill_page_by_map(CALLOUT_ID, callout_replacements)
    if n:
        print(f"  ✓ Callout inline ({n} blocos)")


def fill_pessoas() -> None:
    replacements = {
        "Reunião de alinhamento:": "Reunião de alinhamento: Semanal — async-first via Notion + sync antes de marcos do buildathon",
        "Canal principal:": "Canal principal: Discord (ecossistema Casper) + GitHub Issues/PRs",
        "Gestão de tarefas:": "Gestão de tarefas: Notion (Subnichos Genesis) + GitHub Projects/Issues",
        "Repositório de arquivos:": "Repositório de arquivos: GitHub (código) + Figma (design) + output/ (assets exportados)",
    }
    n = fill_page_by_map("6d80c187-eeaf-8235-9a1d-818c882032d9", replacements)
    equipe_db = "fe00c187-eeaf-8247-ab46-01f25ec9bbd0"
    existing = query_db(equipe_db)
    for row in existing:
        req("PATCH", f"/pages/{row['id']}", {"archived": True})
    team = [
        {
            "Nome": title("Laura Eckert Rodrigues"),
            "Cargo": rt("Frontend / Design"),
            "Área": select("Design"),
            "Bio curta": rt("Responsável por Vercel lastre.io, UI forense e tokens de marca"),
            "Pode ir no site?": checkbox(True),
        },
        {
            "Nome": title("Felix Rodrigues"),
            "Cargo": rt("Protocolo / Gateway / Demo ops"),
            "Área": select("Tech"),
            "Bio curta": rt("Contratos ProofOfOrigin, gateway, smoke tests e operação do protótipo"),
            "Pode ir no site?": checkbox(False),
        },
    ]
    for props in team:
        create_db_row(equipe_db, props)
    print(f"  ✓ Pessoas/Equipe ({n} blocos, {len(team)} membros)")


def update_project_properties() -> None:
    props = {
        "URL": {"url": "https://lastre.io"},
        "Cliente": rt(
            "Builders RWA, avaliadores técnicos, ecossistema Casper — não investidor de varejo"
        ),
    }
    try:
        update_page_props(PAGE_ID, props)
        print("  ✓ Propriedades do projeto (URL, Cliente)")
    except RuntimeError as e:
        print(f"  ⚠ Propriedades do projeto: {e}")


def main() -> int:
    print(f"📋 Preenchendo Lastre Notion ({PAGE_ID})")
    page = req("GET", f"/pages/{PAGE_ID}")
    print(f"✓ Página: {page.get('url', PAGE_ID)}")

    update_project_properties()
    fill_research()
    fill_identidade()
    fill_conteudo()
    fill_gtm()
    fill_canais()
    fill_tecnico()
    fill_metas()
    fill_visual()
    fill_pessoas()
    fill_databases()
    fill_auxiliary()

    print(f"✅ Briefing sincronizado: {page.get('url', PAGE_ID)}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
