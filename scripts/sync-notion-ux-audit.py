#!/usr/bin/env python3
"""Sync docs/UX-SCREEN-AUDIT.md → child page on Lastre Notion project."""

from __future__ import annotations

import json
import os
import re
import sys
import urllib.error
import urllib.request
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
MD_PATH = ROOT / "docs" / "UX-SCREEN-AUDIT.md"
PARENT_PAGE_ID = os.environ.get(
    "NOTION_PARENT_PAGE_ID", "3900c187-eeaf-8020-85b8-e1b0654bde42"
).replace("-", "")
CHILD_TITLE = os.environ.get("NOTION_CHILD_TITLE", "UX Screen Audit — Console")
API = "https://api.notion.com/v1"
VERSION = "2022-06-28"
TOKEN_FILE = Path("/tmp/.notion_lastre_token")


def token() -> str:
    for key in ("NOTION_API_KEY", "NOTION_TOKEN"):
        val = os.environ.get(key)
        if val:
            return val.strip()
    if TOKEN_FILE.exists():
        return TOKEN_FILE.read_text().strip()
    raise RuntimeError(
        "NOTION_API_KEY não definida. Compartilhe a página Lastre com a integração Cursor."
    )


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


def para(text: str, bold: bool = False) -> dict:
    return {"object": "block", "type": "paragraph", "paragraph": {"rich_text": rich(text, bold)}}


def heading(text: str, level: int = 2) -> dict:
    key = f"heading_{level}"
    return {"object": "block", "type": key, key: {"rich_text": rich(text)}}


def bullet(text: str) -> dict:
    return {"object": "block", "type": "bulleted_list_item", "bulleted_list_item": {"rich_text": rich(text)}}


def divider() -> dict:
    return {"object": "block", "type": "divider", "divider": {}}


def code_block(text: str, language: str = "plain text") -> dict:
    allowed = {"plain text", "javascript", "typescript", "python", "bash", "json", "markdown"}
    lang = language if language in allowed else "plain text"
    return {"object": "block", "type": "code", "code": {"rich_text": rich(text), "language": lang}}


def md_to_blocks(md: str) -> list[dict]:
    lines = md.split("\n")
    blocks: list[dict] = []
    i = 0
    in_code = False
    code_lang = "plain text"
    code_lines: list[str] = []

    while i < len(lines):
        line = lines[i]
        if line.startswith("```"):
            if not in_code:
                in_code = True
                code_lang = line[3:].strip() or "plain text"
                code_lines = []
            else:
                blocks.append(code_block("\n".join(code_lines), code_lang))
                in_code = False
            i += 1
            continue
        if in_code:
            code_lines.append(line)
            i += 1
            continue
        if line.startswith("### "):
            blocks.append(heading(line[4:].strip(), 3))
        elif line.startswith("## "):
            blocks.append(heading(line[3:].strip(), 2))
        elif line.startswith("# "):
            blocks.append(heading(line[2:].strip(), 1))
        elif line.startswith("> "):
            blocks.append(
                {"object": "block", "type": "quote", "quote": {"rich_text": rich(line[2:].strip())}}
            )
        elif line.startswith("- ") or line.startswith("* "):
            blocks.append(bullet(line[2:].strip()))
        elif line.strip() == "---":
            blocks.append(divider())
        elif line.strip():
            blocks.append(para(line.strip()))
        i += 1
    return blocks


def list_child_pages(parent_id: str) -> list[dict]:
    blocks = []
    cursor = None
    while True:
        q = "?page_size=100"
        if cursor:
            q += f"&start_cursor={cursor}"
        data = req("GET", f"/blocks/{parent_id}/children{q}")
        blocks.extend(data.get("results", []))
        if not data.get("has_more"):
            break
        cursor = data.get("next_cursor")
    return [b for b in blocks if b.get("type") == "child_page"]


def child_title(block: dict) -> str:
    return block.get("child_page", {}).get("title", "")


def find_existing_child(parent_id: str, title: str) -> str | None:
    norm = re.sub(r"\s+", " ", title.strip().lower())
    for b in list_child_pages(parent_id):
        if re.sub(r"\s+", " ", child_title(b).strip().lower()) == norm:
            return b["id"]
    return None


def create_child_page(parent_id: str, title: str) -> str:
    page = req(
        "POST",
        "/pages",
        {
            "parent": {"page_id": parent_id},
            "properties": {"title": {"title": rich(title)}},
        },
    )
    return page["id"]


def list_block_ids(block_id: str) -> list[str]:
    ids: list[str] = []
    cursor = None
    while True:
        q = "?page_size=100"
        if cursor:
            q += f"&start_cursor={cursor}"
        data = req("GET", f"/blocks/{block_id}/children{q}")
        ids.extend(b["id"] for b in data.get("results", []))
        if not data.get("has_more"):
            break
        cursor = data.get("next_cursor")
    return ids


def archive_blocks(ids: list[str]) -> None:
    for block_id in ids:
        req("PATCH", f"/blocks/{block_id}", {"archived": True})


def append_blocks(parent_id: str, children: list[dict]) -> None:
    for i in range(0, len(children), 90):
        chunk = children[i : i + 90]
        req("PATCH", f"/blocks/{parent_id}/children", {"children": chunk})
        print(f"  +{len(chunk)} blocos ({min(i + 90, len(children))}/{len(children)})")


def main() -> int:
    if not MD_PATH.exists():
        print(f"Arquivo não encontrado: {MD_PATH}", file=sys.stderr)
        return 1

    md = MD_PATH.read_text(encoding="utf-8")
    blocks = md_to_blocks(md)
    print(f"📄 {MD_PATH.name} → {len(blocks)} blocos")

    parent = req("GET", f"/pages/{PARENT_PAGE_ID}")
    print(f"✓ Página pai: {parent.get('url', PARENT_PAGE_ID)}")

    child_id = find_existing_child(PARENT_PAGE_ID, CHILD_TITLE)
    if child_id:
        print(f"↻ Atualizando subpágina existente: {CHILD_TITLE}")
    else:
        child_id = create_child_page(PARENT_PAGE_ID, CHILD_TITLE)
        print(f"✨ Subpágina criada: {CHILD_TITLE}")

    existing = list_block_ids(child_id)
    if existing:
        print(f"🗑  Arquivando {len(existing)} blocos antigos...")
        archive_blocks(existing)

    print("⬆️  Enviando conteúdo...")
    append_blocks(child_id, blocks)

    child_page = req("GET", f"/pages/{child_id}")
    print(f"✅ Notion sincronizado: {child_page.get('url', child_id)}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
