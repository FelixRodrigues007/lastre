"""Lastre Admin preview: routes, context, review and keyboard regressions.

python3 app/test/adminPreview.browser.py --base-url http://localhost:5174
"""
import argparse
from pathlib import Path
from playwright.sync_api import expect, sync_playwright

ROUTES = [
    ('/admin', 'Visão geral'),
    ('/admin/inventario', 'Inventário'),
    ('/admin/fila', 'Fila de trabalho'),
    ('/admin/fila/OC-104', 'Fonte externa indisponível'),
    ('/admin/organizacoes', 'Organizações'),
    ('/admin/organizacoes/ORG-014', 'Horizonte Agro'),
    ('/admin/registros', 'Registros'),
    ('/admin/objetos/HZ-014', 'Lote de soja'),
    ('/admin/dossies/DOS-014?versao=V-001', 'Origem do lote'),
    ('/admin/analises/AN-042', 'Análise de origem'),
    ('/admin/evidencias/EVD-014?dossie=DOS-014&versao=V-002', 'Declaração de origem'),
    ('/admin/comparacoes?dossie=DOS-014&base=V-001&alvo=V-002', 'Comparação de versões'),
    ('/admin/verificacoes', 'Verificações'),
    ('/admin/verificacoes/EX-204', 'Consulta de origem'),
    ('/admin/modelos', 'Modelos e regras'),
    ('/admin/modelos/MOD-001', 'Documentação de origem'),
    ('/admin/modelos/MOD-001/editar', 'Editar rascunho'),
    ('/admin/integracoes', 'Integrações'),
    ('/admin/integracoes/INTG-003', 'Entrega de comunicações'),
    ('/admin/acessos', 'Pessoas e acessos'),
    ('/admin/acessos/pessoas/PES-002', 'Camila Nunes'),
    ('/admin/acessos/politicas', 'Papéis e políticas'),
    ('/admin/auditoria', 'Auditoria'),
    ('/admin/configuracoes', 'Configurações'),
    ('/admin/entrar', 'Operação com contexto'),
    ('/admin/intervencoes/INT-104', 'Repetir consulta de origem'),
    ('/admin/busca?q=Horizonte', 'Busca'),
]


def verify(base_url, artifacts):
    artifacts.mkdir(parents=True, exist_ok=True)
    with sync_playwright() as playwright:
        browser = playwright.chromium.launch(headless=True)
        try:
            for width in (1440, 390):
                page = browser.new_page(viewport={'width': width, 'height': 1000})
                errors, writes = [], []
                page.on('pageerror', lambda error: errors.append(str(error)))
                page.on('request', lambda request: writes.append(request.url) if request.method not in ('GET', 'HEAD') and '/api/' in request.url else None)
                for index, (route, heading) in enumerate(ROUTES):
                    page.goto(base_url.rstrip('/') + route)
                    expect(page.locator('h1')).to_contain_text(heading)
                    expect(page.locator('.admin-preview-line')).to_contain_text('dados fictícios')
                    assert not page.evaluate('document.documentElement.scrollWidth > innerWidth + 1'), (width, route, 'page overflow')
                    if index in (0, 3, 8, 10, 13, 22, 25):
                        page.screenshot(path=str(artifacts / f'{index:02d}-{width}.png'), full_page=True)
                    tabs = page.get_by_role('tab')
                    for tab_index in range(tabs.count()):
                        tabs.nth(tab_index).click()
                        expect(tabs.nth(tab_index)).to_have_attribute('aria-selected', 'true')
                        expect(page.get_by_role('tabpanel')).to_be_visible()
                        assert not page.evaluate('document.documentElement.scrollWidth > innerWidth + 1'), (width, route, 'tab overflow', tab_index)
                    if tabs.count() > 1:
                        tabs.last.focus()
                        page.keyboard.press('Home')
                        expect(tabs.first).to_be_focused()
                        expect(tabs.first).to_have_attribute('aria-selected', 'true')
                print(f'PASS {width}px: 27 routes, all tabs, keyboard and overflow', flush=True)
                # URL state, quick preview, focus return and non-stacking dialogs.
                page.goto(base_url + '/admin/fila?prioridade=Alta')
                expect(page.locator('.lastre-dt__table tbody tr')).to_have_count(1)
                page.reload()
                expect(page.get_by_label('Prioridade', exact=True)).to_contain_text('Alta')
                trigger = page.get_by_role('button', name='Abrir prévia OC-104')
                trigger.click()
                dialog = page.get_by_role('dialog')
                expect(dialog).to_be_visible()
                assert 'ocorrencia=OC-104' in page.url
                page.keyboard.press('Escape')
                expect(trigger).to_be_focused()
                trigger.click()
                dialog.get_by_role('button', name='Atribuir responsável', exact=True).click()
                expect(page.locator('dialog[open]')).to_have_count(1)
                page.keyboard.press('Escape')
                page.get_by_role('button', name='Filtros avançados', exact=True).click()
                page.get_by_role('dialog').get_by_label('Responsável', exact=True).click()
                page.get_by_role('option', name='Rafael Lima', exact=True).click()
                page.get_by_role('button', name='Aplicar filtros', exact=True).click()
                expect(page.get_by_role('heading', name='Nenhum resultado encontrado')).to_be_visible()
                page.get_by_role('button', name='Limpar filtros', exact=True).first.click()
                expect(page.locator('.lastre-dt__table tbody tr')).to_have_count(6)
                page.get_by_label('Tipo', exact=True).click()
                page.get_by_role('option', name='Falha técnica', exact=True).click()
                expect(page.locator('.lastre-dt__table tbody tr')).to_have_count(3)
                page.get_by_role('button', name='Limpar filtros', exact=True).click()
                expect(page.locator('.lastre-dt__table tbody tr')).to_have_count(6)
                page.goto(base_url + '/admin/registros?tipo=analises&q=inexistente')
                page.get_by_role('button', name='Limpar filtros', exact=True).first.click()
                assert 'tipo=analises' in page.url
                expect(page.locator('.lastre-dt__table tbody tr')).to_have_count(2)
                # The historical version must survive navigation and reload.
                page.goto(base_url + '/admin/fila/OC-095?tab=relacionados')
                expect(page.locator('a[href="/admin/dossies/DOS-014?versao=V-001"]')).to_be_visible()
                page.locator('a[href="/admin/dossies/DOS-014?versao=V-001"]').click()
                expect(page.get_by_label('Versão do dossiê')).to_contain_text('V-001')
                page.reload()
                expect(page.get_by_label('Versão do dossiê')).to_contain_text('V-001')
                expect(page.locator('.lastre-dt__table')).not_to_contain_text('Laudo de classificação')
                page.goto(base_url + '/admin/dossies/DOS-014?versao=V-999')
                expect(page.get_by_role('heading', name='Versão não encontrada')).to_be_visible()
                page.goto(base_url + '/admin/evidencias/EVD-015?versao=V-002')
                expect(page.get_by_role('heading', name='Conteúdo restrito')).to_be_visible()
                expect(page.locator('.ad-paper')).to_have_count(0)
                page.goto(base_url + '/admin/evidencias/EVD-014?versao=V-001')
                expect(page.get_by_role('heading', name='Evidência fora da versão solicitada')).to_be_visible()
                # Reviewer sees explicit context; no critical command is executable.
                page.goto(base_url + '/admin/verificacoes/EX-204')
                page.get_by_role('button', name='Tentar novamente', exact=True).click()
                dialog = page.get_by_role('dialog')
                expect(dialog).to_contain_text('V-002')
                dialog.get_by_label('Motivo', exact=True).fill('Recuperação da fonte externa confirmada no cenário.')
                dialog.get_by_role('button', name='Revisar alcance').click()
                expect(dialog.get_by_role('button', name='Enviar solicitação')).to_be_disabled()
                page.keyboard.press('Escape')
                expect(dialog).to_contain_text('Há uma preparação não salva')
                dialog.get_by_role('button', name='Continuar revisão').click()
                dialog.get_by_role('button', name='Salvar preparação local').click()
                expect(dialog).to_contain_text('Nenhum comando foi enviado')
                page.keyboard.press('Escape')
                page.get_by_role('button', name='Tentar novamente', exact=True).click()
                expect(page.get_by_role('dialog').get_by_label('Motivo', exact=True)).to_have_value('Recuperação da fonte externa confirmada no cenário.')
                page.keyboard.press('Escape')
                expect(page.get_by_role('dialog')).to_have_count(0)
                # Explicit batch target set; ineligible executions are excluded.
                page.goto(base_url + '/admin/verificacoes')
                page.get_by_label('Selecionar EX-204', exact=True).check()
                page.get_by_label('Selecionar EX-203', exact=True).check()
                page.get_by_role('link', name='Revisar reprocessamento').click()
                expect(page.get_by_role('heading', name='Elegíveis · 1')).to_be_visible()
                expect(page.get_by_role('heading', name='Excluídos · 1')).to_be_visible()
                expect(page.get_by_role('button', name='Executar intervenção')).to_be_disabled()
                # Drafts survive reload, published fixtures stay unchanged.
                page.goto(base_url + '/admin/modelos/MOD-001/editar')
                page.get_by_label('Nome do modelo').fill('Origem agrícola — rascunho local')
                page.get_by_role('button', name='Salvar rascunho local').click()
                page.reload()
                expect(page.get_by_label('Nome do modelo')).to_have_value('Origem agrícola — rascunho local')
                page.get_by_label('Nome do modelo').fill('Alteração que será descartada')
                page.get_by_role('link', name='Voltar ao modelo', exact=True).click()
                expect(page.get_by_role('dialog', name='Rascunho não salvo')).to_be_visible()
                page.get_by_role('button', name='Continuar editando').click()
                expect(page.get_by_label('Nome do modelo')).to_have_value('Alteração que será descartada')
                page.get_by_role('link', name='Voltar ao modelo', exact=True).click()
                page.get_by_role('button', name='Descartar e sair').click()
                expect(page.locator('h1')).to_have_text('Documentação de origem agrícola')
                # Unknown IDs and utility states never substitute another record.
                for route in ('/admin/organizacoes/inexistente', '/admin/verificacoes/inexistente', '/admin/rota-inexistente'):
                    page.goto(base_url + route)
                    expect(page.get_by_role('link', name='Voltar à lista')).to_be_visible()
                page.goto(base_url + '/admin?estado=sem-permissao')
                expect(page.get_by_role('heading', name='Acesso não autorizado')).to_be_visible()
                page.goto(base_url + '/admin?estado=indisponivel')
                page.get_by_role('button', name='Tentar novamente').click()
                expect(page.locator('h1')).to_have_text('Visão geral')
                # Mobile navigation uses an accessible modal; themes are rendered.
                if width == 390:
                    page.get_by_role('button', name='Abrir navegação').click()
                    expect(page.get_by_role('dialog')).to_be_visible()
                    page.get_by_role('dialog').get_by_role('link', name='Organizações', exact=True).click()
                    expect(page.get_by_role('dialog')).to_have_count(0)
                    expect(page.locator('h1')).to_have_text('Organizações')
                # Global search is usable at both widths, including focus restoration.
                page.goto(base_url + '/admin')
                page.wait_for_load_state('networkidle')
                page.keyboard.press('Control+k')
                if width == 390:
                    search_dialog = page.get_by_role('dialog', name='Buscar no Admin', exact=True)
                    expect(search_dialog).to_be_visible()
                    expect(search_dialog.get_by_label('Nome ou identificador')).to_be_focused()
                    page.keyboard.press('Control+k')
                    expect(page.locator('dialog[open]')).to_have_count(1)
                    expect(search_dialog.get_by_label('Nome ou identificador')).to_be_focused()
                    page.keyboard.press('Escape')
                    expect(page.get_by_role('button', name='Abrir busca global')).to_be_focused()
                    page.get_by_role('button', name='Abrir busca global').click()
                    search_dialog.get_by_label('Nome ou identificador').fill('Horizonte')
                    search_dialog.get_by_role('button', name='Buscar', exact=True).click()
                    expect(page.get_by_role('dialog')).to_have_count(0)
                else:
                    search_field = page.get_by_label('Buscar no Admin', exact=True)
                    expect(search_field).to_be_focused()
                    search_field.fill('Horizonte')
                    search_field.press('Enter')
                assert 'q=Horizonte' in page.url
                expect(page.locator('main')).to_contain_text('Horizonte Agro')
                page.reload()
                expect(page.locator('main')).to_contain_text('Horizonte Agro')
                # Overview activity links open the referenced audit event.
                page.goto(base_url + '/admin')
                page.wait_for_load_state('networkidle')
                page.get_by_role('link', name='Ocorrência atribuída', exact=True).click()
                expect(page.get_by_role('dialog')).to_contain_text('EVT-504')
                page.keyboard.press('Escape')
                page.get_by_role('button', name='Tema claro', exact=True).click()
                page.wait_for_timeout(200)  # Let the 150 ms theme transition finish before capture.
                page.screenshot(path=str(artifacts / f'light-{width}.png'), full_page=True)
                assert not errors, errors
                assert not writes, writes
                page.close()
                print(f'PASS {width}px: filters, focus, versions, restricted evidence, reviews, drafts, utility states; zero API writes', flush=True)
        finally:
            browser.close()

if __name__ == '__main__':
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--base-url', default='http://localhost:5174')
    parser.add_argument('--artifacts', default='/tmp/lastre-admin-review')
    args = parser.parse_args()
    verify(args.base_url, Path(args.artifacts))
