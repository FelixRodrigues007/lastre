import { useState, type FormEvent } from "react";
import { useSearchParams } from "react-router-dom";
import { Button } from "../../components/ui/Button";
import { DataTable, type Column } from "../../components/ui/DataTable";
import { Drawer } from "../../components/ui/Drawer";
import type { MenuEntry } from "../../components/ui/DropdownMenu";
import { FacetFilter } from "../../components/ui/FacetFilter";
import { FilterBar } from "../../components/ui/FilterBar";
import { Icon, type IconName } from "../../components/ui/Icon";
import { Select } from "../../components/ui/Select";
import { Tabs } from "../../components/ui/Tabs";
import { api, request, type Role, type Workspace } from "./api";
import { useWorkspace } from "./context";
import { useTheme } from "../../hooks/useTheme";
import { dateLabel, roleLabels } from "./model";
import { toast } from "./overlay";
import {
  Avatar,
  Badge,
  Empty,
  Feedback,
  Field,
  Glyph,
  Notice,
  PageHead,
  Panel,
  Properties,
  relativeTime,
  useAction,
} from "./ui";

const sections: { id: string; label: string; icon: IconName }[] = [
  { id: "geral", label: "Geral", icon: "settings" },
  { id: "equipe", label: "Equipe", icon: "users" },
  { id: "convites", label: "Convites", icon: "send" },
  { id: "conta", label: "Sua conta", icon: "user" },
];

/** What each role may do. Mirrors canCreate/canEdit/canSend in model.ts and the server. */
const permissions: { label: string; roles: Role[] }[] = [
  { label: "Consultar", roles: ["admin", "editor", "sender", "reader", "contributor"] },
  { label: "Cadastrar", roles: ["admin", "editor", "sender"] },
  { label: "Editar e anexar", roles: ["admin", "editor", "sender", "contributor"] },
  { label: "Compartilhar", roles: ["admin", "sender"] },
  { label: "Gerir equipe", roles: ["admin"] },
];
const roleOrder: Role[] = ["admin", "sender", "editor", "reader", "contributor"];
const roleHints: Record<Role, string> = {
  admin: "Tudo, inclusive gerir a equipe.",
  sender: "Cadastra, edita e compartilha versões.",
  editor: "Cadastra, edita e anexa documentos.",
  reader: "Somente consulta.",
  contributor: "Edita um único cadastro atribuído.",
};

function inviteState(i: { acceptedAt: string | null; revokedAt: string | null; expiresAt: string }) {
  if (i.acceptedAt) return { label: "Aceito", tone: "good" as const };
  if (i.revokedAt) return { label: "Revogado", tone: "neutral" as const };
  if (Date.parse(i.expiresAt) < Date.now()) return { label: "Expirado", tone: "neutral" as const };
  return { label: "Pendente", tone: "warning" as const };
}

type OrgTab = "geral" | "equipe" | "convites" | "conta";
type MemberRow = Workspace["members"][number];
type InviteRow = Workspace["invitations"][number];

export function AssetsOrganization() {
  const { data, reload, clear } = useWorkspace();
  const action = useAction();
  const { theme, setTheme } = useTheme();
  const [params, setParams] = useSearchParams();
  const admin = data.membership.role === "admin";
  const [name, setName] = useState(data.organization.name);
  const [role, setRole] = useState<Role>("editor");
  const [scopeObject, setScopeObject] = useState("");
  const [inviting, setInviting] = useState(false);
  const [inviteUrl, setInviteUrl] = useState("");
  const [copyStatus, setCopyStatus] = useState("");
  const [memberSearch, setMemberSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<string[]>([]);
  const requested = (params.get("aba") ?? "geral") as OrgTab;
  const tab: OrgTab =
    sections.some((s) => s.id === requested) && (admin || requested !== "convites")
      ? requested
      : "geral";
  const activeMembers = data.members.filter((m) => m.active).length;
  const pendingInvites = data.invitations.filter(
    (i) => inviteState(i).label === "Pendente",
  ).length;

  const invite = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const values = Object.fromEntries(new FormData(form));
    void action.run(async () => {
      const result = await request<{ token: string }>("/invitations", values);
      setInviteUrl(`${location.origin}/assets/convites/${result.token}`);
      setCopyStatus("");
      await reload();
      form.reset();
      setRole("editor");
      setScopeObject("");
    }, "Convite criado. Copie o link e compartilhe com a pessoa indicada. Nenhum e-mail foi enviado automaticamente.");
  };
  const closeInvite = () => {
    setInviting(false);
    setInviteUrl("");
    setCopyStatus("");
    action.reset();
  };
  const updateMember = (id: string, body: unknown, message: string) =>
    void action.run(async () => {
      await request(`/members/${id}`, body);
      await reload();
      toast(message);
    }, message);
  const revoke = (id: string) =>
    void action.run(async () => {
      await request(`/invitations/${id}/revoke`, {});
      await reload();
      toast("Convite revogado.");
    }, "Convite revogado.");

  const scopeOf = (member: MemberRow) =>
    member.objectId
      ? data.objects.find((o) => o.id === member.objectId)?.fields.name ?? "Cadastro delimitado"
      : "Toda a organização";
  const text = memberSearch.toLocaleLowerCase("pt-BR");
  const members = data.members.filter(
    (m) =>
      (!text || `${m.name} ${m.email}`.toLocaleLowerCase("pt-BR").includes(text)) &&
      (!roleFilter.length || roleFilter.includes(m.active ? m.role : "inactive")),
  );

  const memberColumns: Column<MemberRow>[] = [
    {
      id: "person",
      header: "Pessoa",
      primary: true,
      sortValue: (m) => m.name,
      cell: (m) => (
        <span className="assets-object-name">
          <Avatar name={m.name} />
          <span>
            <strong>
              {m.name}
              {m.userId === data.user.id && <span className="assets-member__you">você</span>}
            </strong>
            <small>{m.email}</small>
          </span>
        </span>
      ),
    },
    {
      id: "role",
      header: "Papel",
      sortValue: (m) => roleOrder.indexOf(m.role),
      cell: (m) => (
        <Badge tone={m.role === "admin" ? "info" : "neutral"}>{roleLabels[m.role]}</Badge>
      ),
    },
    {
      id: "scope",
      header: "Escopo",
      hideBelow: "md",
      sortValue: (m) => scopeOf(m),
      cell: (m) => (
        <span className="assets-inline-ref">
          <Icon name={m.objectId ? "lock" : "globe"} size={14} />
          <span className="lastre-dt__clip">{scopeOf(m)}</span>
        </span>
      ),
    },
    {
      id: "state",
      header: "Acesso",
      sortValue: (m) => (m.active ? 0 : 1),
      cell: (m) =>
        m.active ? (
          <Badge tone="good">Ativo</Badge>
        ) : (
          <Badge tone="danger">Encerrado</Badge>
        ),
    },
  ];

  const memberActions = (m: MemberRow): MenuEntry[] =>
    !admin || m.userId === data.user.id
      ? []
      : [
          ...(m.role !== "contributor" && m.active
            ? [
                { type: "label" as const, id: "role-label", label: "Papel" },
                ...roleOrder
                  .filter((r) => r !== "contributor")
                  .map(
                    (r): MenuEntry => ({
                      type: "radio",
                      id: r,
                      label: roleLabels[r],
                      checked: m.role === r,
                      onSelect: () => {
                        if (r !== m.role) updateMember(m.id, { role: r }, "Permissão atualizada.");
                      },
                    }),
                  ),
                { type: "separator" as const, id: "sep" },
              ]
            : []),
          {
            id: "access",
            label: m.active ? "Encerrar acesso" : "Reativar acesso",
            icon: m.active ? "lock" : "refresh",
            danger: m.active,
            description: m.active ? "A pessoa deixa de consultar e editar." : undefined,
            onSelect: () =>
              updateMember(
                m.id,
                { active: !m.active },
                m.active ? "Acesso encerrado para novas consultas." : "Participação reativada.",
              ),
          },
        ];

  const inviteColumns: Column<InviteRow>[] = [
    {
      id: "email",
      header: "Convidado",
      primary: true,
      sortValue: (i) => i.email,
      cell: (i) => (
        <span className="assets-object-name">
          <Avatar name={i.email} size="sm" />
          <span>
            <strong>{i.email}</strong>
            <small>
              {roleLabels[i.role]}
              {i.objectId
                ? ` · ${data.objects.find((o) => o.id === i.objectId)?.fields.name ?? "Cadastro"}`
                : ""}
            </small>
          </span>
        </span>
      ),
    },
    {
      id: "expires",
      header: "Validade",
      sortValue: (i) => i.expiresAt,
      cell: (i) => <span className="assets-nowrap">Até {dateLabel(i.expiresAt)}</span>,
    },
    {
      id: "state",
      header: "Situação",
      sortValue: (i) => inviteState(i).label,
      cell: (i) => {
        const state = inviteState(i);
        return <Badge tone={state.tone}>{state.label}</Badge>;
      },
    },
  ];

  const tabs = sections
    .filter((s) => admin || s.id !== "convites")
    .map((s) => ({
      id: s.id as OrgTab,
      label: s.label,
      icon: s.icon,
      count:
        s.id === "equipe"
          ? activeMembers
          : s.id === "convites" && pendingInvites
            ? pendingInvites
            : undefined,
      attention: s.id === "convites" && pendingInvites > 0,
    }));

  return (
    <>
      <PageHead
        eyebrow="Conta e colaboração"
        title="Organização e equipe"
        description="Defina quem prepara informações, quem compartilha e quem pode consultar."
        action={
          admin && (
            <Button
              startIcon={<Icon name="send" size={16} />}
              onClick={() => setInviting(true)}
            >
              Convidar pessoa
            </Button>
          )
        }
      />
      <Feedback error={inviting ? "" : action.error} success={inviting ? "" : action.success} />
      <Tabs<OrgTab>
        variant="underline"
        ariaLabel="Seções da organização"
        tabs={tabs}
        active={tab}
        onChange={(next) =>
          setParams(next === "geral" ? {} : { aba: next }, { replace: true })
        }
      >
        {tab === "geral" && (
          <div className="assets-org-grid">
            <Panel
              title="Dados da organização"
              description="O nome aparece para quem recebe suas versões compartilhadas."
            >
              <div className="assets-org-profile">
                <Avatar name={data.organization.name} size="lg" square />
                <div className="assets-org-profile__copy">
                  <strong>{data.organization.name}</strong>
                  <div className="assets-row">
                    {data.organization.demo ? (
                      <Badge tone="warning">Demonstração</Badge>
                    ) : (
                      <Badge tone="good">Organização ativa</Badge>
                    )}
                    <span className="assets-caption">
                      Criada em {dateLabel(data.organization.createdAt)}
                    </span>
                  </div>
                </div>
              </div>
              <form
                className="assets-org-rename"
                onSubmit={(e) => {
                  e.preventDefault();
                  void action.run(async () => {
                    await request("/organization", { name });
                    await reload();
                    toast("Organização atualizada.");
                  }, "Organização atualizada.");
                }}
              >
                <Field
                  label="Nome da organização"
                  hint={admin ? undefined : "Somente administradores alteram o nome."}
                >
                  <input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    maxLength={160}
                    disabled={!admin || action.busy}
                  />
                </Field>
                {admin && (
                  <Button
                    type="submit"
                    variant="secondary"
                    loading={action.busy}
                    disabled={name === data.organization.name}
                  >
                    Salvar organização
                  </Button>
                )}
              </form>
            </Panel>
            <Panel eyebrow="Resumo" className="assets-org-stats">
              <dl className="assets-org-kpis">
                <div>
                  <dt>Pessoas ativas</dt>
                  <dd>{activeMembers}</dd>
                </div>
                <div>
                  <dt>Convites pendentes</dt>
                  <dd>{admin ? pendingInvites : "—"}</dd>
                </div>
                <div>
                  <dt>Cadastros</dt>
                  <dd>{data.objects.filter((o) => o.status !== "archived").length}</dd>
                </div>
                <div>
                  <dt>Versões enviadas</dt>
                  <dd>{data.versions.length}</dd>
                </div>
              </dl>
            </Panel>
          </div>
        )}

        {tab === "equipe" &&
          (data.membership.role === "contributor" ? (
            <Notice tone="info" title="Acesso de colaborador">
              Seu acesso de colaborador é restrito ao cadastro atribuído.
              A equipe completa é visível aos participantes internos.
            </Notice>
          ) : (
            <div className="assets-stack assets-stack--lg">
              <div className="assets-stack">
                <FilterBar
                  search={memberSearch}
                  onSearch={setMemberSearch}
                  searchLabel="Buscar pessoas"
                  placeholder="Buscar por nome ou e-mail…"
                  active={Boolean(memberSearch || roleFilter.length)}
                  onClear={() => {
                    setMemberSearch("");
                    setRoleFilter([]);
                  }}
                  filters={
                    <FacetFilter
                      label="Papel"
                      icon="shield"
                      selected={roleFilter}
                      onChange={setRoleFilter}
                      options={[
                        ...roleOrder.map((r) => ({
                          value: r,
                          label: roleLabels[r],
                          count: data.members.filter((m) => m.active && m.role === r).length,
                        })),
                        {
                          value: "inactive",
                          label: "Acesso encerrado",
                          count: data.members.filter((m) => !m.active).length,
                        },
                      ]}
                    />
                  }
                />
                <DataTable<MemberRow>
                  id="assets-members"
                  label="Pessoas da organização"
                  rows={members}
                  columns={memberColumns}
                  getRowId={(m) => m.id}
                  rowLabel={(m) => m.name}
                  rowActions={admin ? memberActions : undefined}
                  rowTone={(m) => (m.active ? undefined : "danger")}
                  defaultSort={{ id: "role", dir: "asc" }}
                  summary={
                    <>
                      <strong>{members.length}</strong>{" "}
                      {members.length === 1 ? "participação" : "participações"}
                    </>
                  }
                  empty={
                    <Empty
                      compact
                      icon="users"
                      title="Ninguém com esses filtros"
                      description="Tente outro nome ou papel."
                    />
                  }
                />
                <p className="assets-caption assets-org-note">
                  <Icon name="shield" size={14} /> Administrar a equipe não concede
                  acesso a documentos de outras organizações.
                </p>
              </div>

              <Panel
                title="Cada papel, uma tarefa"
                description="O que cada permissão pode fazer nesta organização."
                flush
                className="assets-role-matrix-panel"
              >
                <div className="assets-table-wrap">
                  <table className="assets-table assets-role-matrix">
                    <caption className="assets-sr-only">Permissões por papel</caption>
                    <thead>
                      <tr>
                        <th scope="col">Papel</th>
                        {permissions.map((p) => (
                          <th scope="col" key={p.label}>
                            {p.label}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {roleOrder.map((r) => (
                        <tr key={r} data-current={r === data.membership.role || undefined}>
                          <th scope="row">
                            {roleLabels[r]}
                            {r === "contributor" && <small>Somente o cadastro atribuído</small>}
                            {r === data.membership.role && <small>Seu papel</small>}
                          </th>
                          {permissions.map((p) => (
                            <td key={p.label}>
                              {p.roles.includes(r) ? (
                                <span className="assets-role-yes">
                                  <Icon name="check" size={16} />
                                  <span className="assets-sr-only">Sim</span>
                                </span>
                              ) : (
                                <span className="assets-role-no">
                                  <span aria-hidden="true">—</span>
                                  <span className="assets-sr-only">Não</span>
                                </span>
                              )}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Panel>
            </div>
          ))}

        {tab === "convites" && admin && (
          <DataTable<InviteRow>
            id="assets-invitations"
            label="Convites criados"
            rows={data.invitations}
            columns={inviteColumns}
            getRowId={(i) => i.id}
            rowLabel={(i) => i.email}
            defaultSort={{ id: "expires", dir: "desc" }}
            rowActions={(i) =>
              inviteState(i).label === "Pendente"
                ? [
                    {
                      id: "revoke",
                      label: "Revogar convite",
                      icon: "close",
                      danger: true,
                      description: "O link deixa de funcionar imediatamente.",
                      onSelect: () => revoke(i.id),
                    },
                  ]
                : []
            }
            summary={
              <>
                <strong>{data.invitations.length}</strong>{" "}
                {data.invitations.length === 1 ? "convite" : "convites"}
                {pendingInvites > 0 && <> · {pendingInvites} pendente(s)</>}
              </>
            }
            toolbar={
              <button type="button" className="lastre-dt__view" onClick={() => setInviting(true)}>
                <Icon name="plus" size={15} />
                <span>Novo convite</span>
              </button>
            }
            empty={
              <Empty
                compact
                icon="send"
                title="Nenhum convite criado"
                description="Convide quem prepara, envia ou consulta informações da organização."
                action={
                  <Button variant="secondary" onClick={() => setInviting(true)}>
                    Convidar pessoa
                  </Button>
                }
              />
            }
          />
        )}

        {tab === "conta" && (
          <Panel title="Sua conta" className="assets-org-account">
            <div className="assets-org-profile">
              <Avatar name={data.user.name} size="lg" />
              <div className="assets-org-profile__copy">
                <strong>{data.user.name}</strong>
                <span className="assets-caption">{data.user.email}</span>
              </div>
              <Badge tone="info">{roleLabels[data.membership.role]}</Badge>
            </div>
            <Properties
              items={[
                { label: "Organização", value: data.organization.name, icon: "users" },
                {
                  label: "Participações",
                  value: `${data.organizations.length} organização(ões)`,
                  icon: "globe",
                },
                {
                  label: "Última atividade",
                  value: data.activity[0]
                    ? relativeTime(
                        [...data.activity].sort((a, b) =>
                          b.createdAt.localeCompare(a.createdAt),
                        )[0].createdAt,
                      )
                    : "Sem registros",
                  icon: "clock",
                },
              ]}
            />
            <div className="assets-org-prefs">
              {data.organizations.length > 1 && (
                <Field label="Organização ativa">
                  <Select
                    value={data.organization.id}
                    disabled={action.busy}
                    options={data.organizations.map((o) => ({
                      value: o.id,
                      label: o.name,
                      description: roleLabels[o.role],
                      leading: <Avatar name={o.name} size="sm" square />,
                    }))}
                    onChange={(organizationId) =>
                      void action.run(async () => {
                        await request("/switch-organization", { organizationId });
                        await reload();
                      })
                    }
                  />
                </Field>
              )}
              <Field label="Aparência">
                <Select
                  value={theme}
                  onChange={(v) => setTheme(v as "light" | "dark")}
                  options={[
                    { value: "dark", label: "Tema escuro", icon: "moon" },
                    { value: "light", label: "Tema claro", icon: "sun" },
                  ]}
                />
              </Field>
            </div>
            <div className="assets-org-signout">
              <Button
                variant="secondary"
                startIcon={<Icon name="logout" size={16} />}
                disabled={action.busy}
                onClick={() =>
                  void action.run(async () => {
                    await api.logout();
                    clear();
                  })
                }
              >
                Sair da conta
              </Button>
            </div>
          </Panel>
        )}
      </Tabs>

      {admin && (
        <Drawer
          open={inviting}
          onClose={closeInvite}
          size="sm"
          eyebrow="Equipe"
          title="Convidar uma pessoa"
          description="O convite vale por sete dias e só pode ser usado pela conta indicada. Nenhum e-mail é enviado: você copia e compartilha o link."
          leading={<Glyph icon="send" />}
          footer={
            inviteUrl ? (
              <>
                <Button variant="secondary" onClick={() => setInviteUrl("")}>
                  Criar outro
                </Button>
                <Button onClick={closeInvite}>Concluir</Button>
              </>
            ) : (
              <>
                <Button variant="secondary" onClick={closeInvite}>
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  form="assets-invite-form"
                  loading={action.busy}
                  startIcon={<Icon name="send" size={16} />}
                >
                  Criar convite
                </Button>
              </>
            )
          }
        >
          <Feedback error={action.error} />
          {inviteUrl ? (
            <div className="assets-invite-link">
              <div className="assets-invite-link__head">
                <Icon name="link" size={16} />
                <strong>Link pronto para compartilhar</strong>
                <span className="assets-caption">Válido por 7 dias · uso único</span>
              </div>
              <div className="assets-invite-link__row">
                <Field label="Link do convite">
                  <input
                    readOnly
                    className="lastre-field__input assets-mono"
                    value={inviteUrl}
                    onFocus={(e) => e.target.select()}
                  />
                </Field>
                <Button
                  variant="secondary"
                  startIcon={<Icon name={copyStatus ? "check" : "copy"} size={16} />}
                  onClick={() =>
                    void action.run(async () => {
                      await navigator.clipboard.writeText(inviteUrl);
                      setCopyStatus("Link copiado.");
                      toast("Link copiado.");
                    })
                  }
                >
                  {copyStatus ? "Copiado" : "Copiar link"}
                </Button>
              </div>
              <span role="status" className="assets-sr-only">
                {copyStatus}
              </span>
            </div>
          ) : (
            <form id="assets-invite-form" className="assets-invite-form" onSubmit={invite}>
              <Field label="E-mail" wide>
                <input
                  name="email"
                  type="email"
                  required
                  maxLength={254}
                  placeholder="nome@empresa.com"
                  autoFocus
                />
              </Field>
              <Field label="Permissão" wide>
                <Select
                  name="role"
                  value={role}
                  onChange={(v) => setRole(v)}
                  options={roleOrder.map((r) => ({
                    value: r,
                    label: roleLabels[r],
                    description: roleHints[r],
                  }))}
                />
              </Field>
              {role === "contributor" && (
                <Field
                  label="Cadastro autorizado"
                  wide
                  hint="O colaborador vê e edita somente este cadastro."
                >
                  <Select
                    name="objectId"
                    required
                    value={scopeObject}
                    onChange={setScopeObject}
                    placeholder="Selecione um cadastro"
                    options={data.objects
                      .filter((o) => o.status !== "archived")
                      .map((o) => ({
                        value: o.id,
                        label: o.fields.name || "Sem identificação",
                        icon: o.kind === "lot" ? ("lots" as const) : ("globe" as const),
                        group: o.kind === "lot" ? "Lotes" : "Ativos",
                      }))
                      .sort((a, b) => a.group.localeCompare(b.group) || a.label.localeCompare(b.label, "pt-BR"))}
                  />
                </Field>
              )}
            </form>
          )}
        </Drawer>
      )}
    </>
  );
}
