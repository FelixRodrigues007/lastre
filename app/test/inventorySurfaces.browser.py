"""Live Admin inventory: real surfaces, independent scenarios and isolated drafts.

python3 app/test/inventorySurfaces.browser.py --base-url http://localhost:5174
"""
import argparse
import json
from pathlib import Path
from playwright.sync_api import expect, sync_playwright


def select(owner, label, option):
    owner.get_by_role('button', name=label, exact=True).click()
    owner.get_by_role('option', name=option, exact=True).click()


def verify(base_url, artifacts):
    artifacts.mkdir(parents=True, exist_ok=True)
    gallery = base_url.rstrip('/') + '/admin/inventario?view=superficies'
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        try:
            for width in (1440, 390):
                page = browser.new_page(viewport={'width': width, 'height': 1000}, reduced_motion='reduce')
                errors, writes = [], []
                page.on('pageerror', lambda e: errors.append(str(e)))
                page.on('request', lambda r: writes.append(r.url) if r.method not in ('GET', 'HEAD') and '/api/' in r.url else None)
                # Every hosted surface mounts its actual dialog, including shell utilities.
                for n in range(1, 28):
                    sid = f'AD-S{n:02d}'
                    page.goto(gallery + '&preview=' + sid)
                    frame = page.frame_locator('.iv-live-frame')
                    if n == 16:
                        expect(frame.get_by_role('tab', name='Revisão', exact=True)).to_have_attribute('aria-selected', 'true')
                    else:
                        expect(frame.locator('dialog[open]')).to_have_count(1)
                    expect(page.locator('.iv-frame-status')).to_have_count(0)
                    assert not page.evaluate('document.documentElement.scrollWidth > innerWidth + 1'), sid
                    assert '/admin/inventario' in page.url
                print(f'PASS {width}px: all 27 actual interfaces mount inside the inventory', flush=True)
                page.goto(gallery + '&preview=AD-S03')
                frame = page.frame_locator('.iv-live-frame')
                expect(frame.get_by_role('dialog')).to_be_visible()
                search = page.get_by_role('searchbox', name='Buscar modal ou drawer')
                search.fill('ocorrencia')
                expect(page.locator('.iv-surface-index-item')).to_have_count(5)
                search.fill('sem-correspondencia')
                expect(page.locator('.iv-surface-index-item')).to_have_count(0)
                # Filtering must not unmount the active example.
                expect(frame.get_by_role('dialog')).to_be_visible()
                search.fill('')
                page.get_by_role('group', name='Filtrar por formato').get_by_role('button', name='Modais 11', exact=True).click()
                expect(page.locator('.iv-surface-index-item')).to_have_count(11)
                page.reload()
                expect(page.get_by_role('button', name='Modais 11', exact=True)).to_have_attribute('aria-pressed', 'true')
                # Each scenario displays the real form state, not a diagram.
                select(page, 'Estado da prévia', 'Erro de validação')
                expect(frame.get_by_role('alert')).to_contain_text('Preencha os campos obrigatórios')
                select(page, 'Estado da prévia', 'Revisão')
                expect(frame.get_by_role('heading', name='Revise antes de solicitar')).to_be_visible()
                expect(frame.get_by_role('button', name='Enviar solicitação')).to_be_disabled()
                select(page, 'Estado da prévia', 'Falha ao salvar')
                expect(frame.get_by_role('alert')).to_contain_text('Não foi possível salvar')
                page.locator('.iv-live-frame').scroll_into_view_if_needed()
                frame.get_by_role('button', name='Salvar preparação local').click()
                expect(frame.get_by_role('status')).to_contain_text('apenas nesta prévia')
                select(page, 'Estado da prévia', 'Conteúdo extenso')
                expect(frame.get_by_text('Contexto completo da revisão')).to_be_visible()
                page.locator('.iv-live-frame').scroll_into_view_if_needed()
                frame.get_by_role('button', name='Salvar preparação local').scroll_into_view_if_needed()
                expect(frame.get_by_role('button', name='Salvar preparação local')).to_be_visible()
                select(page, 'Estado da prévia', 'Estado inicial')
                # Two independently editable frames; changing viewport preserves the first.
                page.get_by_role('button', name='Comparar estados', exact=True).click()
                expect(page.locator('.iv-live-frame')).to_have_count(2)
                left, right = page.frame_locator('.iv-live-frame').nth(0), page.frame_locator('.iv-live-frame').nth(1)
                expect(right.get_by_role('dialog')).to_be_visible()
                page.locator('.iv-live-frame').first.scroll_into_view_if_needed()
                select(left, 'Responsável', 'Rafael Lima')
                expect(right.get_by_role('button', name='Responsável', exact=True)).not_to_contain_text('Rafael Lima')
                select(page, 'Viewport da prévia', 'Celular · 390 px')
                expect(left.get_by_role('button', name='Responsável', exact=True)).to_contain_text('Rafael Lima')
                page.screenshot(path=str(artifacts / f'comparison-{width}.png'), full_page=True)
                # Dirty changes block route-driven state changes without erasing either frame.
                select(page, 'Estado da prévia', 'Revisão')
                expect(page.get_by_role('alert')).to_contain_text('Há alterações nesta prévia')
                page.get_by_role('button', name='Continuar explorando', exact=True).click()
                expect(left.get_by_role('button', name='Responsável', exact=True)).to_contain_text('Rafael Lima')
                select(page, 'Estado da prévia', 'Revisão')
                page.get_by_role('button', name='Descartar e continuar', exact=True).click()
                expect(left.get_by_role('heading', name='Revise antes de solicitar')).to_be_visible()
                page.reload()
                expect(page.locator('.iv-live-frame')).to_have_count(2)
                expect(left.get_by_role('heading', name='Revise antes de solicitar')).to_be_visible()
                # Gallery persistence is ephemeral; existing operational drafts are untouched.
                page.evaluate('sessionStorage.setItem("lastre-admin-preparation:assign:OC-104", "preserve-existing-draft")')
                page.locator('.iv-live-frame').first.scroll_into_view_if_needed()
                left.get_by_role('button', name='Salvar preparação local').click()
                expect(left.get_by_role('status')).to_contain_text('Nenhum comando foi enviado')
                assert page.evaluate('sessionStorage.getItem("lastre-admin-preparation:assign:OC-104")') == 'preserve-existing-draft'
                page.get_by_role('button', name='Fechar comparação', exact=True).click()
                expect(page.locator('.iv-live-frame')).to_have_count(1)
                # Native Escape closes only the inner dialog and returns to the outer control.
                frame = page.frame_locator('.iv-live-frame')
                page.locator('.iv-live-frame').scroll_into_view_if_needed()
                frame.get_by_role('button', name='Fechar painel').focus()
                page.keyboard.press('Escape')
                expect(frame.get_by_role('dialog')).to_have_count(0)
                expect(page.get_by_role('button', name='Reiniciar exemplo')).to_be_focused()
                page.get_by_role('button', name='Reiniciar exemplo').click()
                expect(frame.get_by_role('dialog')).to_be_visible()
                # Host navigation remains inside the frame, including missing and empty states.
                for sid in ('AD-S01', 'AD-S19', 'AD-S20'):
                    page.goto(gallery + f'&preview={sid}&cenario=missing')
                    expect(page.frame_locator('.iv-live-frame').get_by_role('dialog')).to_contain_text('encontrad')
                page.goto(gallery + '&preview=AD-S27&cenario=empty')
                expect(page.frame_locator('.iv-live-frame').get_by_role('heading', name='Nenhum resultado encontrado')).to_be_visible()
                page.goto(gallery + '&preview=AD-S23')
                frame = page.frame_locator('.iv-live-frame')
                page.locator('.iv-live-frame').scroll_into_view_if_needed()
                frame.get_by_role('link', name='Uma ocorrência foi atribuída a você').click()
                expect(frame.locator('h1')).to_contain_text('Fonte externa indisponível')
                assert 'preview=AD-S23' in page.url
                # Frame theme changes do not alter the parent or the stored global preference.
                page.goto(gallery + '&preview=AD-S25')
                frame = page.frame_locator('.iv-live-frame')
                expect(frame.get_by_role('dialog')).to_be_visible()
                parent_theme = page.locator('html').get_attribute('data-theme')
                stored_theme = page.evaluate('localStorage.getItem("lastro-app-theme")')
                page.locator('.iv-live-frame').scroll_into_view_if_needed()
                frame.get_by_role('button', name='Usar tema claro' if parent_theme == 'dark' else 'Usar tema escuro').click()
                expect(frame.locator('html')).to_have_attribute('data-theme', 'light' if parent_theme == 'dark' else 'dark')
                assert page.locator('html').get_attribute('data-theme') == parent_theme
                assert page.evaluate('localStorage.getItem("lastro-app-theme")') == stored_theme
                # Out-of-date links and bogus scenarios recover without nested laboratories.
                page.goto(gallery + '&preview=unknown')
                expect(page.get_by_role('heading', name='Interface não encontrada')).to_be_visible()
                page.get_by_role('button', name='Abrir Criar ocorrência').click()
                expect(page.frame_locator('.iv-live-frame').get_by_role('dialog')).to_be_visible()
                page.goto(gallery + '&preview=AD-S03&cenario=unknown')
                expect(page.get_by_role('button', name='Estado da prévia')).to_contain_text('Estado inicial')
                expect(page.frame_locator('.iv-live-frame').get_by_role('dialog')).to_be_visible()
                page.screenshot(path=str(artifacts / f'studio-{width}.png'), full_page=True)
                page.get_by_role('button', name='Tema claro', exact=True).click()
                expect(page.frame_locator('.iv-live-frame').locator('html')).to_have_attribute('data-theme', 'light')
                page.screenshot(path=str(artifacts / f'studio-light-{width}.png'), full_page=True)
                with page.expect_download() as info:
                    page.get_by_role('button', name='Exportar JSON').click()
                assert len(json.loads(Path(info.value.path()).read_text())['surfaces']) == 27
                assert not errors, errors
                assert not writes, writes
                page.close()
                print(f'PASS {width}px: filters, states, comparison, dirty guard, viewports, draft/theme isolation, focus, recovery and zero API writes', flush=True)
        finally:
            browser.close()


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--base-url', default='http://localhost:5174')
    parser.add_argument('--artifacts', type=Path, default=Path('/tmp/lastre-inventory-studio'))
    args = parser.parse_args()
    verify(args.base_url, args.artifacts)
