"""Regression: the entire inventory row must open its drawer.

Run against the Vite dev server with Python Playwright installed:
  python3 app/test/inventoryDrawer.browser.py --base-url http://localhost:5174
"""
import argparse
from playwright.sync_api import expect, sync_playwright


def verify(base_url):
    with sync_playwright() as playwright:
        browser = playwright.chromium.launch(headless=True)
        try:
            for width in (1440, 390):
                page = browser.new_page(viewport={"width": width, "height": 900})
                errors = []
                page.on("pageerror", lambda error: errors.append(str(error)))
                page.goto(f"{base_url.rstrip('/')}/admin/inventario?view=catalogo&app=assets")
                page.wait_for_load_state("networkidle")
                row = page.locator(".iv-table tbody tr").filter(has_text="Responder solicitação")
                trigger = row.locator(".iv-screen-link")
                for part in ("description", "route", "status", "area", "whitespace", "name"):
                    history = page.evaluate("history.length")
                    if part == "name":
                        trigger.click()
                    elif part == "description":
                        row.locator("td").nth(0).locator("p").click()
                    elif part == "whitespace":
                        row.locator("td").nth(0).click(position={"x": 5, "y": 5})
                    else:
                        row.locator("td").nth({"area": 1, "route": 2, "status": 3}[part]).click()
                    dialog = page.get_by_role("dialog", name="Responder solicitação", exact=True)
                    expect(dialog).to_be_visible(timeout=3000)
                    expect(page.locator("dialog[open]")).to_have_count(1)
                    expect(dialog.get_by_role("tab")).to_have_count(5)
                    assert "screen=LA-006" in page.url, (width, part, page.url)
                    assert page.evaluate("history.length") == history + 1, "A click must create a single navigation"
                    page.keyboard.press("Escape")
                    expect(dialog).not_to_be_visible()
                    expect(trigger).to_be_focused()
                for key in ("Enter", "Space"):
                    trigger.focus()
                    trigger.press(key)
                    dialog = page.get_by_role("dialog")
                    expect(dialog).to_be_visible()
                    dialog.get_by_role("tab", name="Contrato", exact=True).click()
                    expect(dialog.get_by_role("heading", name="Contrato funcional", exact=True)).to_be_visible()
                    page.keyboard.press("Escape")
                    expect(dialog).not_to_be_visible()
                    expect(trigger).to_be_focused()
                assert not errors, errors
                page.close()
            print("Passed: whole-row clicks, one navigation, five tabs, keyboard and focus return on desktop/mobile.")
        finally:
            browser.close()


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--base-url", default="http://localhost:5174")
    verify(parser.parse_args().base_url)
