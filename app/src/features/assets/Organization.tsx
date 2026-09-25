import { useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { api, request, type Role } from "./api";
import { useWorkspace } from "./context";
import { useTheme } from "../../hooks/useTheme";
import { dateLabel, roleLabels } from "./model";
import { Badge, Feedback, Field, Notice, PageHead, useAction } from "./ui";
export function AssetsOrganization() {
  const { data, reload, clear } = useWorkspace();
  const action = useAction();
  const { theme, setTheme } = useTheme();
  const admin = data.membership.role === "admin";
  const [name, setName] = useState(data.organization.name);
  const [role, setRole] = useState<Role>("editor");
  const [inviteUrl, setInviteUrl] = useState("");
  const [copyStatus, setCopyStatus] = useState("");
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
    }, "Convite criado. Copie o link e compartilhe com a pessoa indicada. Nenhum e-mail foi enviado automaticamente.");
  };
  return (
    <>
      <PageHead
        eyebrow="Conta e colaboração"
        title="Organização e equipe"
        description="Defina quem prepara informações, quem compartilha e quem pode consultar."
      />
      <Feedback error={action.error} success={action.success} />
      <div className="assets-detail-grid">
        <div className="assets-stack">
          <section className="assets-panel">
            <div className="assets-section-head">
              <h2>Dados da organização</h2>
              {data.organization.demo && <Badge>Demonstração</Badge>}
            </div>
            <form
              className="assets-stack"
              onSubmit={(e) => {
                e.preventDefault();
                void action.run(async () => {
                  await request("/organization", { name });
                  await reload();
                }, "Organização atualizada.");
              }}
            >
              <Field label="Nome da organização">
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  maxLength={160}
                  disabled={!admin || action.busy}
                />
              </Field>
              {admin && (
                <button
                  className="assets-button"
                  disabled={action.busy || name === data.organization.name}
                >
                  Salvar organização
                </button>
              )}
            </form>
          </section>
          <section className="assets-panel">
            <div className="assets-section-head">
              <div>
                <h2>Pessoas e permissões</h2>
                <p>
                  Administrar a equipe não concede acesso a documentos de outras
                  organizações.
                </p>
              </div>
            </div>
            {data.membership.role === "contributor" ? (
              <Notice>
                Seu acesso de colaborador é restrito ao cadastro atribuído. A
                equipe completa é visível aos participantes internos.
              </Notice>
            ) : (
              <div>
                {data.members.map((member) => (
                  <article className="assets-member" key={member.id}>
                    <span className="assets-avatar">
                      {member.name.slice(0, 2).toUpperCase()}
                    </span>
                    <div>
                      <strong>
                        {member.name}
                        {member.userId === data.user.id ? " · você" : ""}
                      </strong>
                      <p>{member.email}</p>
                      <small>
                        {member.active
                          ? roleLabels[member.role]
                          : "Acesso encerrado"}
                        {member.objectId
                          ? ` · ${data.objects.find((o) => o.id === member.objectId)?.fields.name ?? "Cadastro delimitado"}`
                          : ""}
                      </small>
                    </div>
                    {admin && member.userId !== data.user.id && (
                      <div className="assets-member__controls">
                        {member.role !== "contributor" && member.active && (
                          <select
                            aria-label={`Papel de ${member.name}`}
                            value={member.role}
                            disabled={action.busy}
                            onChange={(e) =>
                              void action.run(async () => {
                                await request(`/members/${member.id}`, {
                                  role: e.target.value,
                                });
                                await reload();
                              }, "Permissão atualizada.")
                            }
                          >
                            {Object.entries(roleLabels)
                              .filter(([role]) => role !== "contributor")
                              .map(([value, label]) => (
                                <option key={value} value={value}>
                                  {label}
                                </option>
                              ))}
                          </select>
                        )}
                        <button
                          className="assets-text-link"
                          disabled={action.busy}
                          onClick={() =>
                            void action.run(
                              async () => {
                                await request(`/members/${member.id}`, {
                                  active: !member.active,
                                });
                                await reload();
                              },
                              member.active
                                ? "Acesso encerrado para novas consultas."
                                : "Participação reativada.",
                            )
                          }
                        >
                          {member.active
                            ? "Encerrar acesso"
                            : "Reativar acesso"}
                        </button>
                      </div>
                    )}
                  </article>
                ))}
              </div>
            )}
          </section>
          {admin && (
            <section className="assets-panel">
              <div className="assets-section-head">
                <div>
                  <h2>Convidar uma pessoa</h2>
                  <p>
                    O convite vale por sete dias e só pode ser usado pela conta
                    indicada.
                  </p>
                </div>
              </div>
              <form className="assets-fields" onSubmit={invite}>
                <Field label="E-mail">
                  <input name="email" type="email" required maxLength={254} />
                </Field>
                <Field label="Permissão">
                  <select
                    name="role"
                    value={role}
                    onChange={(e) => setRole(e.target.value as Role)}
                  >
                    {Object.entries(roleLabels).map(([value, label]) => (
                      <option key={value} value={value}>
                        {label}
                      </option>
                    ))}
                  </select>
                </Field>
                {role === "contributor" && (
                  <Field label="Cadastro autorizado" wide>
                    <select name="objectId" required>
                      <option value="">Selecione um cadastro</option>
                      {data.objects
                        .filter((o) => o.status !== "archived")
                        .map((o) => (
                          <option key={o.id} value={o.id}>
                            {o.fields.name || "Sem identificação"}
                          </option>
                        ))}
                    </select>
                  </Field>
                )}
                <button
                  className="assets-button assets-button--primary"
                  disabled={action.busy}
                >
                  Criar convite
                </button>
              </form>
              {inviteUrl && (
                <div className="assets-invite-link">
                  <Field label="Link do convite">
                    <input
                      readOnly
                      value={inviteUrl}
                      onFocus={(e) => e.target.select()}
                    />
                  </Field>
                  <button
                    className="assets-button"
                    onClick={() =>
                      void action.run(async () => {
                        await navigator.clipboard.writeText(inviteUrl);
                        setCopyStatus("Link copiado.");
                      })
                    }
                  >
                    Copiar link
                  </button>
                  <span role="status">{copyStatus}</span>
                </div>
              )}
              {data.invitations.length > 0 && (
                <div className="assets-related">
                  <h3>Convites criados</h3>
                  {data.invitations.map((i) => (
                    <div key={i.id} className="assets-list-row">
                      <div>
                        <strong>{i.email}</strong>
                        <p>
                          {roleLabels[i.role]} · Até {dateLabel(i.expiresAt)}
                        </p>
                      </div>
                      <Badge>
                        {i.acceptedAt
                          ? "Aceito"
                          : i.revokedAt
                            ? "Revogado"
                            : Date.parse(i.expiresAt) < Date.now()
                              ? "Expirado"
                              : "Pendente"}
                      </Badge>
                      {!i.acceptedAt &&
                        !i.revokedAt &&
                        Date.parse(i.expiresAt) > Date.now() && (
                          <button
                            className="assets-text-link"
                            disabled={action.busy}
                            onClick={() =>
                              void action.run(async () => {
                                await request(
                                  `/invitations/${i.id}/revoke`,
                                  {},
                                );
                                await reload();
                              }, "Convite revogado.")
                            }
                          >
                            Revogar
                          </button>
                        )}
                    </div>
                  ))}
                </div>
              )}
            </section>
          )}
        </div>
        <aside className="assets-stack">
          <section className="assets-panel assets-stack">
            <p className="assets-eyebrow">Sua conta</p>
            <h2>{data.user.name}</h2>
            <p>{data.user.email}</p>
            <Badge>{roleLabels[data.membership.role]}</Badge>
            {data.organizations.length > 1 && (
              <Field label="Organização ativa">
                <select
                  value={data.organization.id}
                  disabled={action.busy}
                  onChange={(e) =>
                    void action.run(async () => {
                      await request("/switch-organization", {
                        organizationId: e.target.value,
                      });
                      await reload();
                    })
                  }
                >
                  {data.organizations.map((o) => (
                    <option key={o.id} value={o.id}>
                      {o.name}
                    </option>
                  ))}
                </select>
              </Field>
            )}
            <Field label="Aparência">
              <select
                value={theme}
                onChange={(e) => setTheme(e.target.value as "light" | "dark")}
              >
                <option value="dark">Tema escuro</option>
                <option value="light">Tema claro</option>
              </select>
            </Field>
            <button
              className="assets-button"
              disabled={action.busy}
              onClick={() =>
                void action.run(async () => {
                  await api.logout();
                  clear();
                })
              }
            >
              Sair da conta
            </button>
          </section>
          <section className="assets-panel assets-role-guide">
            <h2>Cada papel, uma tarefa</h2>
            <dl>
              <dt>Cadastro</dt>
              <dd>
                Organiza dados e documentos. Não compartilha externamente.
              </dd>
              <dt>Envio</dt>
              <dd>Prepara o dossiê e confirma as versões enviadas.</dd>
              <dt>Colaborador externo</dt>
              <dd>Contribui somente no cadastro atribuído.</dd>
              <dt>Leitor</dt>
              <dd>Consulta o conteúdo autorizado, sem alterações.</dd>
              <dt>Administrador</dt>
              <dd>Gerencia a equipe e acumula cadastro e envio.</dd>
            </dl>
          </section>
          <Link className="assets-text-link" to="/assets">
            Voltar ao início
          </Link>
        </aside>
      </div>
    </>
  );
}
