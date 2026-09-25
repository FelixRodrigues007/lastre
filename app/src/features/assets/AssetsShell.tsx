import { useEffect, useRef, useState, type ReactNode } from "react";
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import { LastreIcon } from "../../components/ui/LastreIcon";
import { LastreWordmark } from "../../components/ui/LastreWordmark";
import { Icon, type IconName } from "../../components/ui/Icon";
import { useTheme } from "../../hooks/useTheme";
import { api, request } from "./api";
import { useWorkspace } from "./context";
import { roleLabels } from "./model";
import { Feedback, useAction } from "./ui";
const nav: { to: string; label: string; icon: IconName; end?: boolean }[] = [
  { to: "/assets", label: "Início", icon: "overview", end: true },
  { to: "/assets/ativos", label: "Meus ativos", icon: "globe" },
  { to: "/assets/lotes", label: "Lotes", icon: "lots" },
  { to: "/assets/solicitacoes", label: "Solicitações", icon: "audit" },
];
export function AssetsShell({ children }: { children: ReactNode }) {
  const { data, reload, clear } = useWorkspace();
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const action = useAction();
  const main = useRef<HTMLElement>(null);
  const pending = data.requests.filter((r) => r.status === "open").length;
  const unread = data.notifications.filter(
    (n) => !n.readBy.includes(data.user.id),
  ).length;
  useEffect(() => {
    document.title = "Lastre Assets · Cadastro e gestão de ativos";
    document.documentElement.lang = "pt-BR";
    window.scrollTo(0, 0);
    main.current?.focus({ preventScroll: true });
  }, [pathname]);
  return (
    <div className="assets-shell">
      <NavigationGuard />
      <a className="app-skip" href="#assets-content">
        Pular para o conteúdo
      </a>
      <aside className="assets-sidebar">
        <Link
          to="/assets"
          className="assets-brand"
          aria-label="Lastre Assets — início"
        >
          <LastreIcon size={30} />
          <LastreWordmark />
          <span>Assets</span>
        </Link>
        <div className="assets-workspace">
          <span className="assets-avatar">
            {data.organization.name.slice(0, 2).toUpperCase()}
          </span>
          <div>
            <strong>{data.organization.name}</strong>
            <span>Espaço da organização</span>
          </div>
        </div>
        <p className="assets-sidebar__label">Área de trabalho</p>
        <nav aria-label="Navegação principal">
          {nav.map((n) => (
            <NavLink key={n.to} to={n.to} end={n.end}>
              <Icon name={n.icon} />
              <span>{n.label}</span>
              {n.label === "Solicitações" && pending > 0 && (
                <span className="assets-nav-count">{pending}</span>
              )}
            </NavLink>
          ))}
        </nav>
        <div className="assets-sidebar__bottom">
          <div className="assets-sidebar__note">
            <LastreIcon size={20} />
            <p>
              Informação organizada.
              <br />
              <strong>Decisões com contexto.</strong>
            </p>
          </div>
          {import.meta.env.DEV && (
            <a href="/admin/inventario">
              <Icon name="audit" /> Inventário do produto
            </a>
          )}
          <NavLink to="/assets/organizacao">
            <Icon name="settings" />
            <span>Organização e equipe</span>
          </NavLink>
          <details className="assets-account">
            <summary>
              <span className="assets-avatar">
                {data.user.name
                  .split(" ")
                  .map((s) => s[0])
                  .slice(0, 2)
                  .join("")}
              </span>
              <span>
                <strong>{data.user.name}</strong>
                <small>{roleLabels[data.membership.role]}</small>
              </span>
              <Icon name="chevron-down" size={15} />
            </summary>
            <div>
              <button onClick={toggleTheme}>
                Usar tema {theme === "dark" ? "claro" : "escuro"}
              </button>
              <a href="/console">Abrir console técnico</a>
              <button
                disabled={action.busy}
                onClick={() =>
                  void action.run(async () => {
                    await api.logout();
                    clear();
                    navigate("/assets/entrar");
                  })
                }
              >
                Sair da conta
              </button>
            </div>
          </details>
        </div>
      </aside>
      <div className="assets-body">
        <header className="assets-topbar">
          <div>
            <span className="assets-topbar__product">Lastre Assets</span>
            <span className="assets-topbar__divider">/</span>
            <strong>
              {nav.find((n) =>
                n.end ? pathname === n.to : pathname.startsWith(n.to),
              )?.label ?? "Organização"}
            </strong>
          </div>
          <div className="assets-topbar__tools">
            <span className="assets-environment">
              {data.organization.demo ? "Demonstração" : "Sua organização"}
            </span>
            <details className="assets-notifications">
              <summary aria-label={`Notificações, ${unread} não lidas`}>
                <Icon name="audit" size={19} />
                {unread > 0 && <span>{unread}</span>}
              </summary>
              <div>
                <h2>Notificações</h2>
                {data.notifications.length ? (
                  data.notifications.slice(0, 12).map((n) => (
                    <button
                      key={n.id}
                      onClick={() =>
                        void action.run(async () => {
                          await request(`/notifications/${n.id}/read`, {});
                          await reload();
                          navigate(n.href);
                        })
                      }
                    >
                      <span>
                        {!n.readBy.includes(data.user.id) && "• "}
                        {n.title}
                      </span>
                      <Icon name="chevron-right" size={15} />
                    </button>
                  ))
                ) : (
                  <p>Nenhuma atualização por aqui.</p>
                )}
              </div>
            </details>
            <Link
              className="assets-mobile-account"
              to="/assets/organizacao"
              aria-label="Organização e equipe"
            >
              <Icon name="settings" />
            </Link>
          </div>
        </header>
        {data.organization.demo && (
          <div className="assets-demo-banner">
            Ambiente de demonstração · dados fictícios. Os envios ficam neste
            ambiente.
          </div>
        )}
        <main
          id="assets-content"
          className="assets-main"
          tabIndex={-1}
          ref={main}
        >
          <Feedback error={action.error} />
          {children}
        </main>
        <footer className="assets-footer">
          <span>Lastre Assets</span>
          <span>Cadastro e gestão de ativos</span>
        </footer>
      </div>
    </div>
  );
}

function NavigationGuard() {
  const [destination, setDestination] = useState<string | null>(null);
  const dialog = useRef<HTMLDialogElement>(null);
  const navigate = useNavigate();
  useEffect(() => {
    const open = (event: Event) =>
      setDestination((event as CustomEvent<string>).detail);
    window.addEventListener("lastre-assets-unsaved-navigation", open);
    return () =>
      window.removeEventListener("lastre-assets-unsaved-navigation", open);
  }, []);
  useEffect(() => {
    if (destination) dialog.current?.showModal();
    else dialog.current?.close();
  }, [destination]);
  return (
    <dialog
      className="assets-navigation-dialog"
      ref={dialog}
      aria-labelledby="assets-unsaved-title"
      onCancel={() => setDestination(null)}
    >
      <h2 id="assets-unsaved-title">Há alterações ainda não salvas.</h2>
      <p>
        Continue editando para salvar seu rascunho antes de sair. Descartar não
        altera os dados já confirmados no servidor.
      </p>
      <div className="assets-actions">
        <button
          className="assets-button assets-button--primary"
          autoFocus
          onClick={() => setDestination(null)}
        >
          Continuar editando
        </button>
        <button
          className="assets-button"
          onClick={() => {
            const target = destination;
            setDestination(null);
            if (target) navigate(target);
          }}
        >
          Descartar alterações e sair
        </button>
      </div>
    </dialog>
  );
}
