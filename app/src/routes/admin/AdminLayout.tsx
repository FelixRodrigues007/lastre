import type { ReactNode } from "react";
import { Link, NavLink } from "react-router-dom";
import { LastreWordmark } from "../../components/ui/LastreWordmark";
import { Icon } from "../../components/ui/Icon";
import { useTheme } from "../../hooks/useTheme";
import "./admin-layout.css";

/** Shared admin navigation. Each administrative page owns its internal views. */
export function AdminLayout({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  const { theme, toggleTheme } = useTheme();
  return (
    <div className="admin-shell">
      <a href="#admin-main" className="admin-skip">
        Ir para o conteúdo
      </a>
      <aside className="admin-sidebar">
        <Link
          className="admin-brand"
          to="/admin/inventario"
          aria-label="Lastre Admin — início"
        >
          <LastreWordmark />
          <span>ADMIN</span>
        </Link>
        <div className="admin-workspace">
          <span className="admin-workspace-mark">L</span>
          <div>
            <strong>Lastre Admin</strong>
            <small>Operação da plataforma</small>
          </div>
        </div>
        <p className="admin-nav-label">ADMINISTRAÇÃO</p>
        <nav aria-label="Administração">
          <NavLink to="/admin/inventario">
            <Icon name="overview" size={16} />
            <span>Inventário</span>
          </NavLink>
        </nav>
        <div className="admin-sidebar-bottom">
          <a href="/design-system">
            Design system <span aria-hidden="true">↗</span>
          </a>
          <a href="/">
            Abrir console demo <span aria-hidden="true">↗</span>
          </a>
          <p>Prévia local · v0.1</p>
        </div>
      </aside>
      <div className="admin-content">
        <header className="admin-topbar">
          <span>
            Admin <span aria-hidden="true">/</span> {title}
          </span>
          <div className="admin-topbar-actions">
            <span className="admin-local">
              <i aria-hidden="true" />
              Ambiente de desenvolvimento
            </span>
            <button className="admin-theme" type="button" onClick={toggleTheme}>
              Tema {theme === "dark" ? "claro" : "escuro"}
            </button>
          </div>
        </header>
        <main id="admin-main" className="admin-main" tabIndex={-1}>
          {children}
        </main>
      </div>
    </div>
  );
}
