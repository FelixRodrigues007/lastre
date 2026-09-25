import { useEffect, useState, type FormEvent } from "react";
import {
  Link,
  Navigate,
  useNavigate,
  useParams,
  useSearchParams,
} from "react-router-dom";
import { LastreIcon } from "../../components/ui/LastreIcon";
import { LastreWordmark } from "../../components/ui/LastreWordmark";
import { api, request, type Role } from "./api";
import { useAssets } from "./context";
import { roleLabels } from "./model";
import { Feedback, Field, Loading, Notice, useAction } from "./ui";
export function safeDestination(value: string | null) {
  return value?.startsWith("/assets") &&
    !value.startsWith("/assets/entrar") &&
    !value.includes("://") &&
    !value.includes("\\")
    ? value
    : "/assets";
}
export function AssetsLogin() {
  const [mode, setMode] = useState<"login" | "register">("login");
  const [params] = useSearchParams();
  const { data, reload } = useAssets();
  const action = useAction();
  const navigate = useNavigate();
  const destination = safeDestination(params.get("next"));
  if (data) return <Navigate to={destination} replace />;
  const submit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const values = Object.fromEntries(new FormData(e.currentTarget));
    void action.run(async () => {
      await api.auth(mode, values);
      await reload();
      navigate(destination, { replace: true });
    });
  };
  return (
    <div className="assets-auth">
      <section className="assets-auth__story">
        <Link className="assets-brand" to="/assets">
          <LastreIcon size={34} />
          <LastreWordmark />
          <span>Assets</span>
        </Link>
        <div>
          <p className="assets-eyebrow">Cadastro e gestão de ativos</p>
          <h1>
            O valor começa
            <br />
            na informação.
          </h1>
          <p>
            Organize seus ativos, reúna os documentos e apresente cada versão
            com clareza.
          </p>
        </div>
        <span className="assets-auth__caption">
          Do cadastro ao dossiê compartilhado.
        </span>
      </section>
      <section className="assets-auth__form">
        <div>
          <p className="assets-eyebrow">Seu espaço de trabalho</p>
          <h2>
            {mode === "login"
              ? "Bem-vindo à Lastre."
              : "Comece pela sua organização."}
          </h2>
          <p>
            {mode === "login"
              ? "Entre para retomar seus cadastros e solicitações."
              : "Crie sua conta e organize o primeiro ativo."}
          </p>
          <div className="assets-segments" aria-label="Tipo de acesso">
            <button
              aria-pressed={mode === "login"}
              onClick={() => setMode("login")}
            >
              Entrar
            </button>
            <button
              aria-pressed={mode === "register"}
              onClick={() => setMode("register")}
            >
              Criar organização
            </button>
          </div>
          <form onSubmit={submit} className="assets-stack">
            {mode === "register" && (
              <>
                <Field label="Seu nome">
                  <input
                    name="name"
                    autoComplete="name"
                    required
                    maxLength={120}
                  />
                </Field>
                <Field label="Nome da organização">
                  <input
                    name="organization"
                    autoComplete="organization"
                    required
                    maxLength={160}
                  />
                </Field>
              </>
            )}
            <Field label="E-mail">
              <input
                name="email"
                type="email"
                autoComplete="email"
                required
                maxLength={254}
              />
            </Field>
            <Field
              label="Senha"
              hint={
                mode === "register" ? "Pelo menos 10 caracteres." : undefined
              }
            >
              <input
                name="password"
                type="password"
                autoComplete={
                  mode === "register" ? "new-password" : "current-password"
                }
                required
                minLength={mode === "register" ? 10 : undefined}
                maxLength={128}
              />
            </Field>
            <Feedback error={action.error} />
            <button
              className="assets-button assets-button--primary"
              disabled={action.busy}
            >
              {action.busy
                ? "Conectando…"
                : mode === "login"
                  ? "Entrar na organização"
                  : "Criar conta e continuar"}
            </button>
          </form>
          <div className="assets-auth__demo">
            <p>Quer conhecer o fluxo primeiro?</p>
            <button
              className="assets-button"
              disabled={action.busy}
              onClick={() =>
                void action.run(async () => {
                  await api.auth("demo", {});
                  await reload();
                  navigate(destination);
                })
              }
            >
              Explorar demonstração
            </button>
            <small>
              Uma organização de exemplo só para esta sessão.
              <br />
              Nenhum documento é enviado a empresas reais.
            </small>
          </div>
        </div>
      </section>
    </div>
  );
}
export function AssetsInvite() {
  const { token = "" } = useParams();
  const { data, reload } = useAssets();
  const [invite, setInvite] = useState<{
    organization: string;
    email: string;
    role: Role;
    objectName?: string;
    expiresAt: string;
  } | null>(null);
  const action = useAction();
  const navigate = useNavigate();
  useEffect(() => {
    void action.run(async () => setInvite(await request(`/invites/${token}`)));
  }, [token]);
  const submit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fields = Object.fromEntries(new FormData(e.currentTarget));
    void action.run(async () => {
      await request(`/invites/${token}`, fields);
      await reload();
      navigate("/assets");
    });
  };
  return (
    <div className="assets-invite">
      <Link className="assets-brand" to="/assets">
        <LastreIcon size={30} />
        <LastreWordmark />
        <span>Assets</span>
      </Link>
      <Feedback error={action.error} />
      {!invite && !action.error ? (
        <Loading />
      ) : (
        invite && (
          <div className="assets-panel assets-stack">
            <p className="assets-eyebrow">Convite de colaboração</p>
            <h1>{invite.organization}</h1>
            <p>
              Convite para <strong>{invite.email}</strong>.
            </p>
            <Notice>
              Permissão: {roleLabels[invite.role]}.
              {invite.objectName
                ? ` Acesso somente ao cadastro ${invite.objectName}.`
                : " Acesso no contexto desta organização."}
            </Notice>
            <form onSubmit={submit} className="assets-stack">
              {!data && (
                <>
                  <Field label="Seu nome">
                    <input name="name" required autoComplete="name" />
                  </Field>
                  <Field
                    label="Crie uma senha"
                    hint="Para uma conta nova, use pelo menos 10 caracteres."
                  >
                    <input
                      name="password"
                      type="password"
                      required
                      minLength={10}
                      autoComplete="new-password"
                    />
                  </Field>
                  <Link
                    className="assets-text-link"
                    to={`/assets/entrar?next=${encodeURIComponent(`/assets/convites/${token}`)}`}
                  >
                    Já tenho conta — entrar para aceitar
                  </Link>
                </>
              )}
              <button
                className="assets-button assets-button--primary"
                disabled={action.busy}
              >
                Aceitar convite
              </button>
            </form>
          </div>
        )
      )}
    </div>
  );
}
