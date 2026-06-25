#!/usr/bin/env python3
"""Lastro advertising guardrail linter.

Turns the brand/compliance rules into a repeatable check so any generated ad
asset can be verified before export. Exits non-zero on a hard failure.

Checks:
  1. Banned promotional wording (investment/yield/ROI/...) in *rendered ad copy*
     (SVG <text>), excluding the docs that legitimately list banned terms.
  2. Token JSON is valid and has the expected token layers.
  3. Every SVG parses as XML.
  4. Core color pairs meet a minimum contrast ratio on the dark background.

Usage:
  python3 design-system/scripts/lint.py
"""
from __future__ import annotations
import json
import re
import sys
import xml.etree.ElementTree as ET
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
SVG_NS = "{http://www.w3.org/2000/svg}"

# Wording that must never appear inside actual ad creative (SVG text nodes).
BANNED = [
    "invest", "investment", "yield", "roi", "return", "returns", "profit",
    "passive income", "guaranteed", "token sale", "buy the token", "airdrop",
    "apy", "apr",
]
# Phrases allowed even though they contain a banned substring (negations/disclaimers).
ALLOWLIST = [
    "not investment material",
    "no investment",
]

failures: list[str] = []
warnings: list[str] = []


def lint_svg_copy() -> None:
    svgs = sorted((ROOT / "examples").glob("*.svg")) + sorted((ROOT / "outputs").rglob("*.svg"))
    for svg in svgs:
        try:
            tree = ET.parse(svg)
        except ET.ParseError as exc:
            failures.append(f"[svg-xml] {svg.name}: invalid XML: {exc}")
            continue
        texts = [(t.text or "") for t in tree.iter(f"{SVG_NS}text")]
        texts += [(t.text or "") for t in tree.iter(f"{SVG_NS}tspan")]
        joined = " ".join(texts).lower()
        for term in BANNED:
            for m in re.finditer(rf"\b{re.escape(term)}\b", joined):
                ctx = joined[max(0, m.start() - 30): m.end() + 30]
                if any(alw in ctx for alw in ALLOWLIST):
                    continue
                failures.append(f"[banned-copy] {svg.name}: '{term}' in ad text → '...{ctx.strip()}...'")


def lint_tokens() -> None:
    tok = ROOT / "tokens" / "lastro.tokens.json"
    try:
        data = json.loads(tok.read_text())
    except (OSError, json.JSONDecodeError) as exc:
        failures.append(f"[tokens] {tok.name}: {exc}")
        return
    for layer in ("primitive", "semantic", "component"):
        if layer not in data:
            failures.append(f"[tokens] missing layer: {layer}")


def _rgb(h: str):
    h = h.lstrip("#")
    return [int(h[i:i + 2], 16) / 255 for i in (0, 2, 4)]


def _lin(c: float):
    return c / 12.92 if c <= 0.03928 else ((c + 0.055) / 1.055) ** 2.4


def _lum(h: str):
    r, g, b = (_lin(c) for c in _rgb(h))
    return 0.2126 * r + 0.7152 * g + 0.0722 * b


def contrast(fg: str, bg: str) -> float:
    a, b = _lum(fg), _lum(bg)
    return (max(a, b) + 0.05) / (min(a, b) + 0.05)


def lint_contrast() -> None:
    # (label, fg, bg, min ratio). Body text wants AA 4.5; accents/large >=3.
    dark_bg = "#121407"   # olive-950
    light_bg = "#E7E6D0"  # cream-200
    pairs = [
        ("text.primary (cream-200)", "#E7E6D0", dark_bg, 4.5),
        ("text.secondary (sage-300)", "#C5C7B0", dark_bg, 4.5),
        ("seal-400", "#FEF16F", dark_bg, 3.0),
        ("valid-400", "#9AB84A", dark_bg, 3.0),
        ("invalid-400", "#D9603F", dark_bg, 3.0),
        ("text.primary (olive-950)", "#121407", light_bg, 4.5),
        ("text.secondary (olive-700)", "#30331E", light_bg, 4.5),
        ("seal-text (seal-800)", "#6F6410", light_bg, 3.0),
        ("valid-600", "#577322", light_bg, 3.0),
        ("invalid-600", "#9E3A22", light_bg, 3.0),
    ]
    for name, fg, bg, minimum in pairs:
        ratio = contrast(fg, bg)
        on = "olive-950" if bg == dark_bg else "cream-200"
        status = "ok " if ratio >= minimum else "LOW"
        line = f"    {status} {name} on {on}: {ratio:.2f}:1 (min {minimum})"
        if ratio >= minimum:
            print(line)
        else:
            failures.append(f"[contrast] {name} on {on}: {ratio:.2f}:1 < {minimum}:1")


def main() -> int:
    print("Lastro ad guardrail lint")
    print("  • tokens"); lint_tokens()
    print("  • svg copy + xml"); lint_svg_copy()
    print("  • contrast"); lint_contrast()

    print()
    if warnings:
        print(f"WARNINGS ({len(warnings)}):")
        for w in warnings:
            print(f"  - {w}")
    if failures:
        print(f"FAIL ({len(failures)} issue(s)):")
        for f in failures:
            print(f"  - {f}")
        return 1
    print("PASS: all guardrail checks green.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
