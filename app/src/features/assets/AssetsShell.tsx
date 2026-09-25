import { useEffect, useRef, useState, type ReactNode } from "react";
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import { LastreIcon } from "../../components/ui/LastreIcon";
import { LastreWordmark } from "../../components/ui/LastreWordmark";
import { Icon, type IconName } from "../../components/ui/Icon";
import { useTheme } from "../../hooks/useTheme";
import { api, request } from "./api";
import { useWorkspace } from "./context";
import { canCreate, roleLabels } from "./model";
import { CommandMenu } from "./CommandMenu";
import { Dialog, MenuItem, Popover, Toaster } from "./overlay";
import { Avatar, Feedback, Kbd, Segmented, relativeTime, useAction } from "./ui";
import { Button } from "../../components/ui/Button";

const nav: { to: string; label: string; icon: IconName; end?: boolean; short?: string }[] = [
  { to: "/assets", label: "Início", icon: "overview", end: true },
  { to: "/assets/ativos", label: "Meus ativos", icon: "globe", short: "Ativos" },
  { to: "/assets/lotes", label: "Lotes", icon: "lots" },
  { to: "/assets/solicitacoes", label: "Solicitações", icon: "inbox", short: "Pedidos" },
];

function useCrumbs() {
  const { pathname } = useLocation();
  const { data } = useWorkspace();
  const parts = pathname.split("/").filter(Boolean).slice(1);
  const crumbs: { label: string; to?: string }[] = [];
  const section = nav.find((n) => !n.end && pathname.startsWith(n.to));
  if (!parts.length) crumbs.push({ label: "Início" });
  else if (section) crumbs.push({ label: section.label, to: section.to });
  else if (parts[0] === "organizacao") crumbs.push({ label: "Organização e equipe" });
  else if (parts[0] === "recebidos") crumbs.push({ label: "Recebidos" });
  const id = parts[1];
  if (id === "novo") crumbs.push({ label: parts[0] === "lotes" ? "Novo lote" : "Novo ativo" });
  else if (id) {
    const object = data.objects.find((o) => o.id === id);
    const req = data.requests.find((r) => r.id === id);
    const received = data.received.find((s) => s.id === id);
    const label =
      object?.fields.name || req?.title || received?.objectName || "Detalhe";
    crumbs.push({
      label,
      to: parts[2] ? `/assets/${parts[0]}/${id}` : undefined,
    });
    if (parts[2] === "compartilhar") crumbs.push({ label: "Compartilhar" });
  }
  return crumbs;
}

export function AssetsShell({ children }: { children: ReactNode }) {
  const { data, reload, clear } = useWorkspace();
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { theme, setTheme } = useTheme();
  const action = useAction();
  const main = useRef<HTMLElement>(null);
  const [command, setCommand] = useState(false);
  const [drawer, setDrawer] = useState(false);
  const crumbs = useCrumbs();
  const pending = data.requests.filter((r) => r.status === "open").length;
  const unread = data.notifications.filter(
    (n) => !n.readBy.includes(data.user.id),
  ).length;
  const creator = canCreate(data.membership.role);

  useEffect(() => {
    document.title = `${crumbs[crumbs.length - 1]?.label ?? "Início"} · Lastre Assets`;
    document.documentElement.lang = "pt-BR";
    window.scrollTo(0, 0);
    setDrawer(false);
    main.current?.focus({ preventScroll: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);
  useEffect(() => {
    const key = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setCommand((v) => !v);
      }
    };
    window.addEventListener("keydown", key);
    return () => window.removeEventListener("keydown", key);
  }, []);

  const switchOrganization = (organizationId: string) =>
    void action.run(async () => {
      await request("/switch-organization", { organizationId });
      await reload();
      navigate("/assets");
    });
  const logout = () =>
    void action.run(async () => {
      await api.logout();
      clear();
      navigate("/assets/entrar");
    });

  return (
    <div className="assets-shell" data-drawer={drawer || undefined}>
      <NavigationGuard />
      <CommandMenu open={command} onClose={() => setCommand(false)} />
      <Toaster />
      <a className="app-skip" href="#assets-content">
        Pular para o conteúdo
      </a>
      <div
        className="assets-scrim"
        aria-hidden="true"
        onClick={() => setDrawer(false)}
      />
      <aside className="assets-sidebar" aria-label="Menu lateral">
        <div className="assets-sidebar__top">
          <Link
            to="/assets"
            className="assets-brand"
            aria-label="Lastre Assets — início"
          >
            <LastreIcon size={26} />
            <LastreWordmark />
            <span className="assets-brand__product">Assets</span>
          </Link>
          <button
            type="button"
            className="assets-icon-button assets-sidebar__close"
            aria-label="Fechar menu"
            onClick={() => setDrawer(false)}
          >
            <Icon name="close" size={16} />
          </button>
        </div>
        <Popover
          label={`Organização: ${data.organization.name}. Trocar organização`}
          className="assets-org-switch"
          triggerClassName="assets-org-switch__trigger"
          align="start"
          trigger={
            <>
              <Avatar name={data.organization.name} square />
              <span className="assets-org-switch__copy">
                <strong>{data.organization.name}</strong>
                <small>
                  {data.organization.demo ? "Demonstração" : roleLabels[data.membership.role]}
                </small>
              </span>
              <Icon name="chevron-down" size={15} />
            </>
          }
        >
          {(close) => (
            <div className="assets-menu" role="group" aria-label="Organizações">
              <p className="assets-menu__title">Suas organizações</p>
              {data.organizations.map((o) => (
                <MenuItem
                  key={o.id}
                  icon={o.id === data.organization.id ? "check" : undefined}
                  hint={roleLabels[o.role]}
                  onClick={() => {
                    close();
                    if (o.id !== data.organization.id) switchOrganization(o.id);
                  }}
                >
                  {o.name}
                </MenuItem>
              ))}
              <hr />
              <MenuItem
                icon="users"
                onClick={() => {
                  close();
                  navigate("/assets/organizacao");
                }}
              >
                Organização e equipe
              </MenuItem>
            </div>
          )}
        </Popover>
        <button
          type="button"
          className="assets-search-trigger"
          onClick={() => setCommand(true)}
        >
          <Icon name="search" size={16} />
          <span>Buscar ou ir para…</span>
          <Kbd>⌘K</Kbd>
        </button>
        <p className="assets-sidebar__label">Área de trabalho</p>
        <nav aria-label="Navegação principal" className="assets-nav">
          {nav.map((n) => (
            <NavLink key={n.to} to={n.to} end={n.end}>
              <Icon name={n.icon} size={18} />
              <span>{n.label}</span>
              {n.to === "/assets/solicitacoes" && pending > 0 && (
                <span className="assets-nav-count" aria-label={`${pending} abertas`}>
                  {pending}
                </span>
              )}
            </NavLink>
          ))}
        </nav>
        <p className="assets-sidebar__label">Organização</p>
        <nav aria-label="Organização" className="assets-nav">
          <NavLink to="/assets/organizacao">
            <Icon name="users" size={18} />
            <span>Organização e equipe</span>
          </NavLink>
          {import.meta.env.DEV && (
            <a href="/admin/inventario">
              <Icon name="audit" size={18} />
              <span>Inventário do produto</span>
            </a>
          )}
        </nav>
        <div className="assets-sidebar__bottom">
          <div className="assets-sidebar__seal">
            <LastreIcon size={18} />
            <p>
              Informação organizada.
              <br />
              <span className="lastre-gold-text">Decisões com contexto.</span>
            </p>
          </div>
          <Popover
            label={`Conta de ${data.user.name}`}
            className="assets-account"
            triggerClassName="assets-account__trigger"
            align="start"
            placement="above"
            trigger={
              <>
                <Avatar name={data.user.name} />
                <span className="assets-account__copy">
                  <strong>{data.user.name}</strong>
                  <small>{data.user.email}</small>
                </span>
                <Icon name="more" size={16} />
              </>
            }
          >
            {() => (
              <div className="assets-menu">
                <div className="assets-menu__section">
                  <Segmented
                    label="Tema"
                    value={theme}
                    onChange={setTheme}
                    options={[
                      { value: "light", label: "Claro", icon: "sun" },
                      { value: "dark", label: "Escuro", icon: "moon" },
                    ]}
                  />
                </div>
                <hr />
                <MenuItem icon="external" href="/console">
                  Abrir console técnico
                </MenuItem>
                <MenuItem icon="logout" danger onClick={logout}>
                  Sair da conta
                </MenuItem>
              </div>
            )}
          </Popover>
        </div>
      </aside>
      <div className="assets-body">
        <header className="assets-topbar">
          <button
            type="button"
            className="assets-icon-button assets-topbar__menu"
            aria-label="Abrir menu"
            aria-expanded={drawer}
            onClick={() => setDrawer(true)}
          >
            <Icon name="panel-left" size={18} />
          </button>
          <Link to="/assets" className="assets-topbar__brand" aria-label="Lastre Assets — início">
            <LastreIcon size={22} />
          </Link>
          <nav className="assets-crumbs" aria-label="Você está em">
            <ol>
              <li className="assets-crumbs__root">
                <Link to="/assets">Assets</Link>
              </li>
              {crumbs.map((c, i) => (
                <li key={`${c.label}-${i}`}>
                  <Icon name="chevron-right" size={13} />
                  {c.to && i < crumbs.length - 1 ? (
                    <Link to={c.to}>{c.label}</Link>
                  ) : (
                    <span aria-current={i === crumbs.length - 1 ? "page" : undefined}>
                      {c.label}
                    </span>
                  )}
                </li>
              ))}
            </ol>
          </nav>
          <div className="assets-topbar__tools">
            <span
              className="assets-environment"
              data-demo={data.organization.demo || undefined}
            >
              <span aria-hidden="true" />
              {data.organization.demo ? "Demonstração" : "Sua organização"}
            </span>
            <button
              type="button"
              className="assets-icon-button assets-topbar__search"
              aria-label="Buscar"
              onClick={() => setCommand(true)}
            >
              <Icon name="search" size={18} />
            </button>
            <Popover
              label={`Notificações, ${unread} não lidas`}
              className="assets-notifications"
              trigger={
                <>
                  <Icon name="bell" size={18} />
                  {unread > 0 && (
                    <span className="assets-notifications__dot" aria-hidden="true">
                      {unread > 9 ? "9+" : unread}
                    </span>
                  )}
                </>
              }
            >
              {(close) => (
                <div className="assets-notifications__panel">
                  <header>
                    <h2>Notificações</h2>
                    <span>{unread ? `${unread} não lidas` : "Tudo lido"}</span>
                  </header>
                  {data.notifications.length ? (
                    <ul>
                      {data.notifications.slice(0, 12).map((n) => {
                        const isUnread = !n.readBy.includes(data.user.id);
                        return (
                          <li key={n.id}>
                            <button
                              type="button"
                              data-unread={isUnread || undefined}
                              onClick={() => {
                                close();
                                void action.run(async () => {
                                  await request(`/notifications/${n.id}/read`, {});
                                  await reload();
                                  navigate(n.href);
                                });
                              }}
                            >
                              <span className="assets-notifications__mark" aria-hidden="true" />
                              <span className="assets-notifications__copy">
                                <span>
                                  {isUnread && <span className="assets-sr-only">Não lida: </span>}
                                  {n.title}
                                </span>
                                <small>{relativeTime(n.createdAt)}</small>
                              </span>
                              <Icon name="chevron-right" size={14} />
                            </button>
                          </li>
                        );
                      })}
                    </ul>
                  ) : (
                    <p className="assets-notifications__empty">
                      Nenhuma atualização por aqui.
                    </p>
                  )}
                </div>
              )}
            </Popover>
            {creator && (
              <Popover
                label="Novo cadastro"
                className="assets-new"
                triggerClassName="lastre-button lastre-button--primary lastre-button--sm assets-new__trigger"
                trigger={
                  <>
                    <Icon name="plus" size={16} />
                    <span className="assets-new__label">Novo</span>
                  </>
                }
              >
                {(close) => (
                  <div className="assets-menu">
                    <MenuItem
                      icon="globe"
                      hint="Área, direito, projeto"
                      onClick={() => {
                        close();
                        navigate("/assets/ativos/novo");
                      }}
                    >
                      Ativo
                    </MenuItem>
                    <MenuItem
                      icon="lots"
                      hint="Produção ou material"
                      onClick={() => {
                        close();
                        navigate("/assets/lotes/novo");
                      }}
                    >
                      Lote
                    </MenuItem>
                  </div>
                )}
              </Popover>
            )}
          </div>
        </header>
        {data.organization.demo && (
          <div className="assets-demo-banner">
            <Icon name="info" size={15} />
            <span>
              <strong>Ambiente de demonstração</strong> · dados fictícios. Os
              envios ficam neste ambiente.
            </span>
          </div>
        )}
        <main
          id="assets-content"
          className="assets-main"
          tabIndex={-1}
          ref={main}
          key={pathname}
        >
          <Feedback error={action.error} />
          {children}
        </main>
        <footer className="assets-footer">
          <span>
            <LastreIcon size={14} /> Lastre Assets
          </span>
          <span>Cadastro e gestão de ativos</span>
        </footer>
      </div>
      <nav className="assets-tabbar" aria-label="Navegação inferior">
        {nav.map((n) => (
          <NavLink key={n.to} to={n.to} end={n.end}>
            <span className="assets-tabbar__icon">
              <Icon name={n.icon} size={20} />
              {n.to === "/assets/solicitacoes" && pending > 0 && (
                <span className="assets-tabbar__count">{pending}</span>
              )}
            </span>
            <span>{n.short ?? n.label}</span>
          </NavLink>
        ))}
        <NavLink to="/assets/organizacao">
          <span className="assets-tabbar__icon">
            <Icon name="users" size={20} />
          </span>
          <span>Equipe</span>
        </NavLink>
      </nav>
    </div>
  );
}

function NavigationGuard() {
  const [destination, setDestination] = useState<string | null>(null);
  const navigate = useNavigate();
  useEffect(() => {
    const open = (event: Event) =>
      setDestination((event as CustomEvent<string>).detail);
    window.addEventListener("lastre-assets-unsaved-navigation", open);
    return () =>
      window.removeEventListener("lastre-assets-unsaved-navigation", open);
  }, []);
  return (
    <Dialog
      open={Boolean(destination)}
      onClose={() => setDestination(null)}
      title="Há alterações ainda não salvas."
      icon="escalations"
      size="sm"
      description="Continue editando para salvar seu rascunho antes de sair. Descartar não altera os dados já confirmados no servidor."
      actions={
        <>
          <Button
            variant="ghost"
            onClick={() => {
              const target = destination;
              setDestination(null);
              if (target) navigate(target);
            }}
          >
            Descartar alterações e sair
          </Button>
          <Button autoFocus onClick={() => setDestination(null)}>
            Continuar editando
          </Button>
        </>
      }
    />
  );
}
