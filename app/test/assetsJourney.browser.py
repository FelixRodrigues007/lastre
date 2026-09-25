"""Local Assets journeys. Run with app API and Vite already listening.
ASSETS_BASE_URL defaults to http://localhost:5174. Creates isolated test accounts.
Artifacts are written to the ignored output/assets directory.
"""
import json
import os
import uuid
from pathlib import Path
from playwright.sync_api import sync_playwright, expect

BASE = os.environ.get('ASSETS_BASE_URL', 'http://localhost:5174')
OUTPUT = Path(__file__).resolve().parents[2] / 'output' / 'assets'
OUTPUT.mkdir(parents=True, exist_ok=True)
HEADERS = {'X-Lastre-Request': 'assets'}

def post(context, path, payload):
    response = context.request.post(BASE + '/api/assets' + path, data=payload, headers=HEADERS)
    assert response.ok, (path, response.status, response.text())
    return response.json()

def workspace(context):
    response = context.request.get(BASE + '/api/assets/workspace')
    assert response.ok
    return response.json()

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    suffix = uuid.uuid4().hex[:10]
    source = browser.new_context(viewport={'width': 1440, 'height': 1000})
    receiver = browser.new_context(viewport={'width': 1440, 'height': 1000})
    source_email, receiver_email = 'source-' + suffix + '@example.com', 'receiver-' + suffix + '@example.com'
    post(source, '/register', {'name': 'Marina Costa', 'email': source_email, 'password': 'Test-only-strong-password', 'organization': 'Serra Clara ' + suffix})
    post(receiver, '/register', {'name': 'Rafael Lima', 'email': receiver_email, 'password': 'Test-only-strong-password', 'organization': 'Horizonte ' + suffix})
    page = source.new_page()
    errors = []
    page.on('pageerror', lambda error: errors.append(str(error)))
    page.goto(BASE + '/assets')
    page.wait_for_load_state('networkidle')
    expect(page.get_by_role('heading', name='Seu primeiro ativo começa aqui')).to_be_visible()
    page.get_by_role('link', name='Cadastrar ativo', exact=False).first.click()
    page.get_by_role('textbox', name='Nome do ativo', exact=True).fill('Unidade de origem')
    page.get_by_role('link', name='Início', exact=True).click()
    expect(page.get_by_role('dialog', name='Há alterações ainda não salvas.')).to_be_visible()
    page.get_by_role('button', name='Continuar editando', exact=True).click()
    expect(page.get_by_role('textbox', name='Nome do ativo', exact=True)).to_have_value('Unidade de origem')
    page.get_by_role('textbox', name='Localização', exact=True).fill('Itabirito, MG')
    page.get_by_role('button', name='Salvar rascunho', exact=True).click()
    expect(page.get_by_role('heading', name='Unidade de origem', exact=True)).to_be_visible()
    origin_id = workspace(source)['objects'][0]['id']
    solicitation = post(receiver, '/requests', {'recipientEmail': source_email, 'title': 'Documentação do lote SC-101', 'purpose': 'Qualificação documental de fornecimento', 'dueAt': '2099-01-01', 'requirements': [{'label': 'Declaração de origem', 'description': 'Identifique lote e responsável pela declaração.', 'required': True, 'allowJustification': False}]})
    page.goto(BASE + '/assets/solicitacoes/' + solicitation['id'])
    page.wait_for_load_state('networkidle')
    page.get_by_role('link', name='Cadastrar novo lote', exact=True).click()
    page.get_by_role('textbox', name='Identificação do lote', exact=True).fill('Cobre SC-101')
    page.get_by_role('textbox', name='Localização', exact=True).fill('Itabirito, MG')
    page.get_by_role('textbox', name='Material', exact=True).fill('Concentrado de cobre')
    page.get_by_role('spinbutton', name='Quantidade', exact=True).fill('248.6')
    page.get_by_label('Início da produção', exact=True).fill('2026-09-01')
    page.get_by_label('Fim da produção', exact=True).fill('2026-09-10')
    page.get_by_role('combobox', name='Ativo de origem (opcional)', exact=True).select_option(origin_id)
    page.get_by_role('button', name='Salvar rascunho', exact=True).click()
    expect(page.get_by_role('heading', name='Documentação do lote SC-101', exact=True)).to_be_visible()
    page.get_by_role('link', name='Anexar documento', exact=False).click()
    evidence_path = OUTPUT / ('test-evidence-' + suffix + '.txt')
    evidence_path.write_text('Documento fictício de validação da interface. Lote SC-101.')
    page.get_by_label('Arquivo', exact=True).set_input_files(str(evidence_path))
    page.get_by_role('textbox', name='Fonte ou emissor', exact=True).fill('Equipe técnica')
    page.get_by_role('button', name='Salvar documento no dossiê', exact=True).click()
    expect(page.get_by_text('Documento salvo no dossiê.', exact=False)).to_be_visible()
    state = workspace(source)
    lot = next(o for o in state['objects'] if o['kind'] == 'lot')
    page.goto(BASE + '/assets/solicitacoes/' + solicitation['id'])
    page.get_by_role('link', name='Revisar envio', exact=True).click()
    page.get_by_role('checkbox', name='Permitir download', exact=False).check()
    page.get_by_role('checkbox', name='Conferi o destinatário', exact=False).check()
    page.screenshot(path=str(OUTPUT / 'review-real.png'), full_page=True)
    page.get_by_role('button', name='Enviar para Horizonte', exact=False).click()
    expect(page.get_by_role('heading', name='Sua versão foi compartilhada.', exact=True)).to_be_visible()
    page.get_by_role('link', name='Consultar versão enviada', exact=True).click()
    with page.expect_download() as download:
        page.get_by_role('button', name='Exportar resumo desta versão', exact=True).click()
    export = json.loads(Path(download.value.path()).read_text())
    assert export['version']['fields']['name'] == 'Cobre SC-101'
    state = workspace(source)
    share = state['shares'][0]
    reader = receiver.new_page()
    reader.on('pageerror', lambda error: errors.append(str(error)))
    reader.goto(BASE + '/assets/recebidos/' + share['id'])
    reader.wait_for_load_state('networkidle')
    expect(reader.get_by_role('heading', name='Cobre SC-101', exact=True)).to_be_visible()
    with reader.expect_download() as downloaded:
        reader.get_by_role('button', name='Baixar ' + evidence_path.name, exact=True).click()
    assert Path(downloaded.value.path()).read_text() == evidence_path.read_text()
    page.goto(BASE + '/assets/lotes/' + lot['id'] + '?aba=acessos')
    page.get_by_role('button', name='Revogar acesso', exact=True).click()
    page.get_by_role('button', name='Confirmar revogação', exact=True).click()
    expect(page.get_by_text('Revogado', exact=True)).to_be_visible()
    reader.reload()
    expect(reader.get_by_role('alert')).to_contain_text('expirou ou foi revogado')
    assert receiver.request.get(BASE + '/api/assets/evidence/' + state['evidence'][0]['id'] + '?share=' + share['id']).status == 403
    page.goto(BASE + '/assets/lotes')
    page.get_by_role('button', name='Importar CSV', exact=True).click()
    csv_path = OUTPUT / ('lots-' + suffix + '.csv')
    csv_path.write_text('nome;setor;material;quantidade;unidade;localizacao;responsavel;inicio;fim\nSC-102;mineral;Cobre;12.5;t;Itabirito;Marina;2026-09-01;2026-09-02\nSC-103;mineral;Cobre;14.5;t;Itabirito;Marina;2026-09-01;2026-09-02\n')
    page.get_by_label('Arquivo CSV', exact=True).set_input_files(str(csv_path))
    page.get_by_role('button', name='Importar 2 lote(s)', exact=True).click()
    expect(page.get_by_text('2 lote(s) importado(s) como rascunho.', exact=True)).to_be_visible()
    page.goto(BASE + '/assets/organizacao')
    collaborator_email = 'collaborator-' + suffix + '@example.com'
    page.get_by_role('textbox', name='E-mail', exact=True).fill(collaborator_email)
    page.get_by_role('combobox', name='Permissão', exact=True).select_option('contributor')
    page.get_by_role('combobox', name='Cadastro autorizado', exact=True).select_option(lot['id'])
    page.get_by_role('button', name='Criar convite', exact=True).click()
    invite_url = page.get_by_role('textbox', name='Link do convite', exact=True).input_value()
    collaborator = browser.new_context(viewport={'width': 390, 'height': 844})
    collaborator_page = collaborator.new_page()
    collaborator_page.on('pageerror', lambda error: errors.append(str(error)))
    collaborator_page.goto(invite_url)
    collaborator_page.get_by_role('textbox', name='Seu nome', exact=True).fill('Ana Técnica')
    collaborator_page.get_by_label('Crie uma senha', exact=True).fill('Test-only-collaborator-password')
    collaborator_page.get_by_role('button', name='Aceitar convite', exact=True).click()
    collaborator_page.wait_for_url('**/assets')
    assert len(workspace(collaborator)['objects']) == 1
    collaborator_page.goto(BASE + '/assets/ativos/' + origin_id)
    expect(collaborator_page.get_by_role('heading', name='Cadastro não encontrado', exact=True)).to_be_visible()
    for route in ['/assets', '/assets/ativos', '/assets/lotes', '/assets/lotes/' + lot['id'], '/assets/solicitacoes/' + solicitation['id'], '/assets/organizacao']:
        page.set_viewport_size({'width': 390, 'height': 844})
        page.goto(BASE + route)
        page.wait_for_load_state('networkidle')
        assert not page.evaluate('document.documentElement.scrollWidth > innerWidth'), route
    page.get_by_label('Aparência', exact=True).select_option('light')
    page.goto(BASE + '/assets')
    page.wait_for_load_state('networkidle')
    page.screenshot(path=str(OUTPUT / 'journey-mobile-light.png'), full_page=True)
    page.set_viewport_size({'width': 1440, 'height': 1000})
    page.screenshot(path=str(OUTPUT / 'journey-desktop-light.png'), full_page=True)
    page.goto(BASE + '/admin/inventario?view=catalogo&app=assets&screen=LA-007&tab=contrato')
    page.wait_for_load_state('networkidle')
    expect(page.get_by_role('dialog')).to_be_visible()
    page.screenshot(path=str(OUTPUT / 'inventory-desktop.png'), full_page=True)
    page.keyboard.press('Escape')
    page.set_viewport_size({'width': 390, 'height': 844})
    page.screenshot(path=str(OUTPUT / 'inventory-mobile.png'), full_page=True)
    assert not page.evaluate('document.documentElement.scrollWidth > innerWidth')
    assert not errors, errors
    browser.close()
    print('PASS: create, protect unsaved input, associate request, upload, share, receive, export, revoke, import, invite, scope, mobile and Admin. No page errors.')
