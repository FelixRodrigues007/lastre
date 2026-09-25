import { Select } from "../../components/ui/Select";
import { useEffect, useRef, useState } from "react";
import {
  Link,
  NavLink,
  Outlet,
  ScrollRestoration,
  useLocation,
  useNavigate,
  useSearchParams,
} from "react-router-dom";
import { LastreWordmark } from "../../components/ui/LastreWordmark";
import { LastreIcon } from "../../components/ui/LastreIcon";
import { Icon, type IconName } from "../../components/ui/Icon";
import { useTheme } from "../../hooks/useTheme";
import { ActionProvider } from "./AdminActions";
import { Badge, Button, Empty, Facts, Notice, Surface } from "./AdminUI";
import { cases } from "./admin-data";
import { surfaceLab } from "./surface-lab-runtime";
import { SurfaceLabBridge } from "./SurfaceLabBridge";
import "./admin-layout.css";
import "./admin.css";
import "./admin-kit.css";

const groups: {
  label: string;
  links: { to: string; name: string; icon: IconName }[];
}[] = [
  {
    label: "OPERAÇÃO",
    links: [
      { to: "/admin", name: "Visão geral", icon: "overview" },
      { to: "/admin/fila", name: "Fila de trabalho", icon: "inbox" },
      { to: "/admin/organizacoes", name: "Organizações", icon: "network" },
      { to: "/admin/registros", name: "Registros", icon: "file" },
    ],
  },
  {
    label: "PLATAFORMA",
    links: [
      { to: "/admin/verificacoes", name: "Verificações", icon: "shield" },
      { to: "/admin/modelos", name: "Modelos e regras", icon: "grid" },
      { to: "/admin/integracoes", name: "Integrações", icon: "chain" },
    ],
  },
  {
    label: "GOVERNANÇA",
    links: [
      { to: "/admin/acessos", name: "Pessoas e acessos", icon: "users" },
      { to: "/admin/auditoria", name: "Auditoria", icon: "history" },
      { to: "/admin/inventario", name: "Inventário", icon: "list" },
    ],
  },
];
function Navigation({ close }: { close?: () => void }) {
  const location = useLocation();
  const recordDetail =
    /^\/admin\/(objetos|dossies|analises|evidencias|comparacoes)(\/|$)/.test(
      location.pathname,
    );
  return (
    <nav aria-label="Administração">
      {groups.map((group) => (
        <div key={group.label}>
          <p className="admin-nav-label">{group.label}</p>
          {group.links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.to === "/admin"}
              onClick={close}
              className={({ isActive }) =>
                isActive || (link.to === "/admin/registros" && recordDetail)
                  ? "admin-nav-active"
                  : undefined
              }
            >
              <Icon name={link.icon} size={17} />
              <span>{link.name}</span>
              {link.to === "/admin/fila" && (
                <small
                  aria-label={`${cases.filter((c) => c.status !== "Resolvida").length} ocorrências abertas`}
                >
                  {cases.filter((c) => c.status !== "Resolvida").length}
                </small>
              )}
            </NavLink>
          ))}
        </div>
      ))}
    </nav>
  );
}
function UtilityState({
  state,
  clear,
}: {
  state: string | null;
  clear: () => void;
}) {
  if (state === "sessao-expirada")
    return (
      <Empty
        title="Sessão expirada"
        description="Entre novamente para retomar o contexto. Nenhuma ação pendente será executada automaticamente."
        action={
          <Link className="ad-button" to="/admin/entrar">
            Voltar à entrada
          </Link>
        }
      />
    );
  if (state === "sem-permissao")
    return (
      <Empty
        title="Acesso não autorizado"
        description="Seu contexto não permite consultar esta área. Solicite o vínculo adequado à gestão de acesso."
        action={
          <Link className="ad-button" to="/admin">
            Voltar à visão geral
          </Link>
        }
      />
    );
  if (state === "indisponivel" || state === "manutencao")
    return (
      <Empty
        title={
          state === "manutencao"
            ? "Serviço em manutenção"
            : "Consulta indisponível"
        }
        description="Não foi possível consultar os dados. Nenhuma alteração foi enviada."
        action={<Button onClick={clear}>Tentar novamente</Button>}
      />
    );
  return <Outlet />;
}
export function AdminLayout() {
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();
  const [params, setParams] = useSearchParams();
  const [panel, setPanel] = useState<
    "menu" | "notifications" | "account" | "exports" | "search" | null
  >(() =>
    surfaceLab?.id === "AD-S22"
      ? "exports"
      : surfaceLab?.id === "AD-S23"
        ? "notifications"
        : surfaceLab?.id === "AD-S25"
          ? "account"
          : surfaceLab?.id === "AD-S27" && surfaceLab.scenario !== "empty"
            ? "search"
            : null,
  );
  const [read, setRead] = useState(false);
  const [search, setSearch] = useState(() =>
    surfaceLab?.id === "AD-S27" && surfaceLab.scenario !== "initial"
      ? surfaceLab.scenario === "empty"
        ? "Registro inexistente"
        : "Horizonte"
      : "",
  );
  const searchInput = useRef<HTMLInputElement>(null);
  const searchTrigger = useRef<HTMLButtonElement>(null);
  const [density, setDensity] = useState("comfortable");
  const isEntry = location.pathname === "/admin/entrar";
  const section = groups
    .flatMap((g) => g.links)
    .filter((l) => l.to !== "/admin")
    .find((l) => location.pathname.startsWith(l.to));
  const title =
    section?.name ??
    (/\/admin\/(objetos|dossies|analises|evidencias|comparacoes)/.test(
      location.pathname,
    )
      ? "Registros"
      : location.pathname.includes("intervencoes")
        ? "Intervenções"
        : location.pathname.includes("configuracoes")
          ? "Configurações"
          : location.pathname.includes("busca")
            ? "Busca"
            : isEntry
              ? "Entrada"
              : "Visão geral");
  const previousPath = useRef(location.pathname);
  useEffect(() => {
    document.title = `${title} · Lastre Admin`;
    if (previousPath.current !== location.pathname) setPanel(null);
    previousPath.current = location.pathname;
  }, [location.pathname, title]);
  useEffect(() => {
    const shortcut = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        if (document.querySelector("dialog[open]")) return;
        if (searchInput.current?.getClientRects().length)
          searchInput.current.focus();
        else {
          searchTrigger.current?.focus();
          setPanel("search");
        }
      }
    };
    window.addEventListener("keydown", shortcut);
    return () => window.removeEventListener("keydown", shortcut);
  }, []);
  const submitSearch = () => {
    navigate(`/admin/busca?q=${encodeURIComponent(search.trim())}`);
    setPanel(null);
    setSearch("");
  };
  return (
    <ActionProvider>
      <SurfaceLabBridge />
      <div
        className={`admin-shell${isEntry ? " admin-shell-entry" : ""}`}
        data-density={density}
      >
        <a href="#admin-main" className="admin-skip">
          Ir para o conteúdo
        </a>
        {!isEntry && (
          <aside className="admin-sidebar">
            <Link
              className="admin-brand"
              to="/admin"
              aria-label="Lastre Admin — início"
            >
              <LastreIcon size={26} />
              <LastreWordmark />
            </Link>
            <div className="admin-workspace">
              <span className="admin-workspace-mark">
                <Icon name="shield" size={18} />
              </span>
              <div>
                <strong>Lastre Admin</strong>
                <small>Operação da plataforma</small>
              </div>
            </div>
            <Navigation />
            <div className="admin-sidebar-bottom">
              <NavLink to="/admin/configuracoes">
                <Icon name="settings" size={16} />
                Configurações
              </NavLink>
              <a href="/design-system">
                <Icon name="external" size={16} />
                Design system
              </a>
              <button
                type="button"
                className="admin-profile"
                onClick={() => setPanel("account")}
              >
                <span className="ad-avatar">MC</span>
                <span>
                  <strong>Marina Costa</strong>
                  <small>Perfil demonstrativo</small>
                </span>
                <Icon name="chevron-down" size={14} />
              </button>
            </div>
          </aside>
        )}
        <div className="admin-content">
          <header className="admin-topbar">
            <div className="admin-breadcrumb">
              {!isEntry && (
                <button
                  type="button"
                  className="admin-mobile-menu"
                  aria-label="Abrir navegação"
                  onClick={() => setPanel("menu")}
                >
                  <Icon name="panel-left" />
                </button>
              )}
              <Link to="/admin">Admin</Link>
              <span aria-hidden="true">/</span>
              <span>{title}</span>
            </div>
            <div className="admin-topbar-actions">
              <form
                className="admin-global-search"
                onSubmit={(e) => {
                  e.preventDefault();
                  submitSearch();
                }}
              >
                <Icon name="search" size={15} />
                <input
                  ref={searchInput}
                  aria-label="Buscar no Admin"
                  placeholder="Buscar no Admin…"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
                <kbd aria-hidden="true">⌘ K</kbd>
              </form>
              <button
                ref={searchTrigger}
                className="admin-mobile-search admin-topbar-button"
                type="button"
                aria-label="Abrir busca global"
                aria-keyshortcuts="Meta+K Control+K"
                onClick={() => setPanel("search")}
              >
                <Icon name="search" size={18} />
              </button>
              <span className="admin-local">Demonstração local</span>
              <button
                type="button"
                className="admin-topbar-button"
                aria-label={
                  read ? "Notificações" : "Notificações · 2 não lidas"
                }
                onClick={() => {
                  setPanel("notifications");
                  setRead(true);
                }}
              >
                <Icon name="bell" size={18} />
                {!read && <span className="admin-notification-dot" />}
              </button>
              <button
                className="admin-theme"
                type="button"
                onClick={toggleTheme}
                aria-label={`Tema ${theme === "dark" ? "claro" : "escuro"}`}
                title={`Tema ${theme === "dark" ? "claro" : "escuro"}`}
              >
                <Icon name={theme === "dark" ? "sun" : "moon"} size={18} />
              </button>
            </div>
          </header>
          <div className="admin-preview-line">
            <span className="admin-preview-tag">
              <span aria-hidden="true" />
              AMBIENTE LOCAL
            </span>
            <span>
              Prévia com dados fictícios. Operações administrativas não são
              enviadas.
            </span>
          </div>
          <main id="admin-main" className="admin-main" tabIndex={-1}>
            <div className="ad-page" key={location.pathname}>
              <UtilityState
                state={params.get("estado")}
                clear={() =>
                  setParams((p) => {
                    const next = new URLSearchParams(p);
                    next.delete("estado");
                    return next;
                  })
                }
              />
            </div>
          </main>
        </div>
        {panel === "search" && (
          <Surface
            title="Buscar no Admin"
            description="Encontre organizações, registros, pessoas e ocorrências."
            onClose={() => setPanel(null)}
            kind="modal"
            initialFocus="input"
          >
            <form
              className="ad-form admin-search-form"
              onSubmit={(event) => {
                event.preventDefault();
                submitSearch();
              }}
            >
              <label>
                Nome ou identificador
                <input
                  type="search"
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Ex.: Horizonte ou OC-104"
                />
              </label>
              <Button primary type="submit">
                <Icon name="search" size={16} />
                Buscar
              </Button>
            </form>
          </Surface>
        )}
        {panel === "menu" && (
          <Surface
            title="Navegação administrativa"
            onClose={() => setPanel(null)}
          >
            <Navigation close={() => setPanel(null)} />
            <Link
              className="ad-button"
              to="/admin/configuracoes"
              onClick={() => setPanel(null)}
            >
              Configurações
            </Link>
            <Button onClick={() => setPanel("account")}>
              Conta e preferências
            </Button>
          </Surface>
        )}
        {panel === "notifications" && (
          <Surface
            title="Notificações"
            description="Exemplos de itens que exigem uma ação sua."
            onClose={() => setPanel(null)}
          >
            <div className="ad-list">
              <Link to="/admin/fila/OC-104" onClick={() => setPanel(null)}>
                <div>
                  <strong>Uma ocorrência foi atribuída a você</strong>
                  <small>OC-104 · Horizonte Agro · há 4 min</small>
                </div>
                <span>→</span>
              </Link>
              <Link
                to="/admin/intervencoes/INT-103"
                onClick={() => setPanel(null)}
              >
                <div>
                  <strong>Publicação aguardando revisão</strong>
                  <small>INT-103 · requisitos de origem</small>
                </div>
                <span>→</span>
              </Link>
            </div>
            <Button onClick={() => setPanel("exports")}>
              Acompanhar exportações
            </Button>
          </Surface>
        )}
        {panel === "account" && (
          <Surface title="Conta e preferências" onClose={() => setPanel(null)}>
            <Facts
              items={[
                ["Identidade de exemplo", "Marina Costa"],
                ["Papel", "Operação e suporte"],
                ["Ambiente", "Demonstração local"],
                ["Fuso", "America/Sao_Paulo · BRT"],
              ]}
            />
            <div className="ad-form">
              <label>
                Densidade
                <Select
                  aria-label="Densidade"
                  value={density}
                  onChange={setDensity}
                  options={[
                    {
                      value: "comfortable",
                      label: "Confortável",
                      icon: "rows",
                    },
                    { value: "compact", label: "Compacta", icon: "list" },
                  ]}
                />
              </label>
              <Button onClick={toggleTheme}>
                Usar tema {theme === "dark" ? "claro" : "escuro"}
              </Button>
              <Button onClick={() => setPanel("exports")}>Exportações</Button>
              <Link
                className="ad-button"
                to="/admin/entrar"
                onClick={() => setPanel(null)}
              >
                Voltar à entrada
              </Link>
            </div>
            <Notice title="Sem sessão administrativa real">
              Preferências alteram somente a apresentação. Papéis no navegador
              não autorizam operações.
            </Notice>
          </Surface>
        )}
        {panel === "exports" && (
          <Surface title="Exportações" onClose={() => setPanel(null)}>
            <div className="ad-stack">
              <Badge>Em preparação</Badge>
              <h3>Metadados de auditoria · Horizonte Agro</h3>
              <p>Exemplo de revisão de escopo. Nenhum arquivo foi gerado.</p>
              <Link
                className="ad-button"
                to="/admin/intervencoes/INT-105"
                onClick={() => setPanel(null)}
              >
                Abrir revisão
              </Link>
              <Button disabled>Download indisponível</Button>
            </div>
          </Surface>
        )}
      </div>
      <ScrollRestoration />
    </ActionProvider>
  );
}
