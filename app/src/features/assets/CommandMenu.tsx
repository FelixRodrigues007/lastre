import { useEffect, useId, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Icon, type IconName } from "../../components/ui/Icon";
import { useWorkspace } from "./context";
import { canCreate, categoryLabels, objectPath, statusLabels } from "./model";
import { Kbd } from "./ui";

type Command = {
  id: string;
  group: string;
  label: string;
  hint?: string;
  icon: IconName;
  to: string;
  keywords: string;
};

/** ⌘K navigation over pages, actions and the organization's own records. */
export function CommandMenu({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const { data } = useWorkspace();
  const navigate = useNavigate();
  const dialog = useRef<HTMLDialogElement>(null);
  const input = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);
  const listId = useId();

  const commands = useMemo<Command[]>(() => {
    const pages: Command[] = [
      { id: "p-home", group: "Ir para", label: "Início", icon: "overview", to: "/assets", keywords: "inicio home painel" },
      { id: "p-assets", group: "Ir para", label: "Meus ativos", icon: "globe", to: "/assets/ativos", keywords: "ativos areas direitos projetos" },
      { id: "p-lots", group: "Ir para", label: "Lotes", icon: "lots", to: "/assets/lotes", keywords: "lotes producao" },
      { id: "p-req", group: "Ir para", label: "Solicitações", icon: "inbox", to: "/assets/solicitacoes", keywords: "solicitacoes pedidos requisitos" },
      { id: "p-org", group: "Ir para", label: "Organização e equipe", icon: "users", to: "/assets/organizacao", keywords: "organizacao equipe convite membros" },
    ];
    const actions: Command[] = canCreate(data.membership.role)
      ? [
          { id: "a-asset", group: "Criar", label: "Cadastrar ativo", icon: "plus", to: "/assets/ativos/novo", keywords: "novo ativo criar" },
          { id: "a-lot", group: "Criar", label: "Cadastrar lote", icon: "plus", to: "/assets/lotes/novo", keywords: "novo lote criar" },
        ]
      : [];
    const records: Command[] = data.objects.map((o) => ({
      id: o.id,
      group: "Cadastros",
      label: o.fields.name || "Sem identificação",
      hint: `${categoryLabels[o.fields.category]} · ${statusLabels[o.status]}`,
      icon: o.kind === "lot" ? "lots" : "globe",
      to: objectPath(o),
      keywords: `${o.fields.location} ${o.fields.responsible} ${o.fields.material}`,
    }));
    const requests: Command[] = data.requests.map((r) => ({
      id: r.id,
      group: "Solicitações",
      label: r.title,
      hint: r.requesterName,
      icon: "inbox",
      to: `/assets/solicitacoes/${r.id}`,
      keywords: `${r.purpose} ${r.requesterName}`,
    }));
    return [...actions, ...pages, ...records, ...requests];
  }, [data]);

  const filtered = useMemo(() => {
    const q = query
      .trim()
      .toLowerCase()
      .normalize("NFD")
      .replace(/\p{Diacritic}/gu, "");
    if (!q) return commands.filter((c) => c.group !== "Cadastros").concat(
      commands.filter((c) => c.group === "Cadastros").slice(0, 5),
    );
    return commands.filter((c) =>
      `${c.label} ${c.hint ?? ""} ${c.keywords}`
        .toLowerCase()
        .normalize("NFD")
        .replace(/\p{Diacritic}/gu, "")
        .includes(q),
    );
  }, [commands, query]);

  useEffect(() => {
    const d = dialog.current;
    if (!d) return;
    if (open && !d.open) {
      d.showModal();
      setQuery("");
      setActive(0);
      requestAnimationFrame(() => input.current?.focus());
    }
    if (!open && d.open) d.close();
  }, [open]);
  useEffect(() => setActive(0), [query]);

  const go = (command?: Command) => {
    if (!command) return;
    onClose();
    navigate(command.to);
  };
  let lastGroup = "";

  return (
    <dialog
      ref={dialog}
      className="assets-command"
      aria-label="Buscar e navegar"
      onCancel={(e) => {
        e.preventDefault();
        onClose();
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      {open && (
        <div className="assets-command__panel">
          <div className="assets-command__search">
            <Icon name="search" size={18} />
            <input
              ref={input}
              role="combobox"
              aria-expanded="true"
              aria-controls={listId}
              aria-activedescendant={filtered[active] ? `${listId}-${filtered[active].id}` : undefined}
              aria-label="Buscar cadastros, solicitações e páginas"
              placeholder="Buscar cadastros, solicitações e páginas…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "ArrowDown") {
                  e.preventDefault();
                  setActive((i) => Math.min(filtered.length - 1, i + 1));
                } else if (e.key === "ArrowUp") {
                  e.preventDefault();
                  setActive((i) => Math.max(0, i - 1));
                } else if (e.key === "Enter") {
                  e.preventDefault();
                  go(filtered[active]);
                }
              }}
            />
            <Kbd>Esc</Kbd>
          </div>
          <ul id={listId} role="listbox" className="assets-command__list" aria-label="Resultados">
            {filtered.length === 0 && (
              <li className="assets-command__empty" role="presentation">
                Nada encontrado para “{query}”.
              </li>
            )}
            {filtered.map((c, i) => {
              const header = c.group !== lastGroup;
              lastGroup = c.group;
              return (
                <li key={c.id} role="presentation">
                  {header && <p className="assets-command__group">{c.group}</p>}
                  <div
                    id={`${listId}-${c.id}`}
                    role="option"
                    aria-selected={i === active}
                    className="assets-command__item"
                    onMouseMove={() => setActive(i)}
                    onClick={() => go(c)}
                  >
                    <Icon name={c.icon} size={16} />
                    <span className="assets-command__label">{c.label}</span>
                    {c.hint && <span className="assets-command__hint">{c.hint}</span>}
                    {i === active && <Icon name="arrow-right" size={14} className="assets-command__enter" />}
                  </div>
                </li>
              );
            })}
          </ul>
          <footer className="assets-command__foot">
            <span><Kbd>↑</Kbd><Kbd>↓</Kbd> navegar</span>
            <span><Kbd>↵</Kbd> abrir</span>
          </footer>
        </div>
      )}
    </dialog>
  );
}
