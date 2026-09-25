import { useEffect, useState, type FormEvent, type ReactNode } from "react";
import {
  Link,
  Navigate,
  useNavigate,
  useParams,
  useSearchParams,
} from "react-router-dom";
import { Button } from "../../components/ui/Button";
import { Icon, type IconName } from "../../components/ui/Icon";
import { LastreIcon } from "../../components/ui/LastreIcon";
import { LastreWordmark } from "../../components/ui/LastreWordmark";
import { SkeletonBlock } from "../../components/ui/Skeleton";
import { api, request, type Role } from "./api";
import { useAssets } from "./context";
import { dateLabel, roleLabels } from "./model";
import {
  Avatar,
  Badge,
  Feedback,
  Field,
  Notice,
  Segmented,
  useAction,
} from "./ui";

export function safeDestination(value: string | null) {
  return value?.startsWith("/assets") &&
    !value.startsWith("/assets/entrar") &&
    !value.includes("://") &&
    !value.includes("\\")
    ? value
    : "/assets";
}

const promises: { icon: IconName; title: string; text: string }[] = [
  {
    icon: "lots",
    title: "Cadastro organizado",
    text: "Ativos, lotes e documentos no mesmo dossiê.",
  },
  {
    icon: "shield",
    title: "Versões conferíveis",
    text: "Cada envio guarda o que foi examinado, com hash.",
  },
  {
    icon: "lock",
    title: "Acesso sob controle",
    text: "Vigência, download e revogação por destinatário.",
  },
];

/** Brand panel: layered surfaces (matte, glass, one metal accent) from the DS hero. */
function AuthStory() {
  return (
    <aside className="assets-auth__story" aria-label="Sobre a Lastre Assets">
      <div className="assets-auth__story-head">
        <p className="assets-eyebrow">Cadastro e gestão de ativos</p>
        <h2>
          O valor começa{" "}
          <span className="lastre-gold-text">na informação.</span>
        </h2>
        <p>
          Organize seus ativos, reúna os documentos e apresente cada versão com
          clareza.
        </p>
      </div>
      <div className="assets-auth__stage" aria-hidden="true">
        <div className="assets-auth__card assets-auth__card--back">
          <span>01</span>
          <i />
          <i />
          <i />
        </div>
        <div className="assets-auth__card assets-auth__card--main">
          <div className="assets-auth__card-top">
            <LastreWordmark />
            <Icon name="external" size={15} />
          </div>
          <p className="assets-auth__card-kicker">
            Cada origem tem uma história.
          </p>
          <p className="assets-auth__card-title">A prova permanece.</p>
          <span className="assets-auth__rule" />
          <div className="assets-auth__card-foot">
            <span>
              <i /> Origem registrada
            </span>
            <span>LST / 024</span>
          </div>
        </div>
        <div className="assets-auth__card assets-auth__card--glass">
          <span className="assets-auth__seal">
            <Icon name="check" size={18} />
          </span>
          <div>
            <strong>Evidência conectada</strong>
            <small>Da origem ao registro.</small>
          </div>
          <Icon name="chain" size={17} />
        </div>
      </div>
      <ul className="assets-auth__promises">
        {promises.map((p) => (
          <li key={p.title}>
            <Icon name={p.icon} size={16} />
            <div>
              <strong>{p.title}</strong>
              <span>{p.text}</span>
            </div>
          </li>
        ))}
      </ul>
    </aside>
  );
}

function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="assets-auth">
      <main className="assets-auth__form">
        <Link
          className="assets-auth__brand"
          to="/assets"
          aria-label="Lastre Assets — início"
        >
          <LastreIcon size={28} />
          <LastreWordmark />
          <span className="assets-auth__product">Assets</span>
        </Link>
        <div className="assets-auth__body">{children}</div>
        <p className="assets-auth__legal">
          <Icon name="lock" size={13} /> Sessão protegida · cookies somente de
          acesso
        </p>
      </main>
      <AuthStory />
    </div>
  );
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
    <AuthLayout>
      <header className="assets-auth__head">
        <p className="assets-eyebrow">Seu espaço de trabalho</p>
        <h1>
          {mode === "login"
            ? "Bem-vindo à Lastre."
            : "Comece pela sua organização."}
        </h1>
        <p>
          {mode === "login"
            ? "Entre para retomar seus cadastros e solicitações."
            : "Crie sua conta e organize o primeiro ativo."}
        </p>
      </header>
      <Segmented
        label="Tipo de acesso"
        value={mode}
        onChange={(next) => {
          setMode(next);
          action.setError("");
        }}
        options={[
          { value: "login", label: "Entrar" },
          { value: "register", label: "Criar organização" },
        ]}
      />
      <form onSubmit={submit} className="assets-auth__fields" key={mode}>
        {mode === "register" && (
          <>
            <Field label="Seu nome">
              <input name="name" autoComplete="name" required maxLength={120} />
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
            placeholder="nome@empresa.com"
            required
            maxLength={254}
          />
        </Field>
        <Field
          label="Senha"
          hint={mode === "register" ? "Pelo menos 10 caracteres." : undefined}
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
        <Button
          type="submit"
          size="lg"
          loading={action.busy}
          className="assets-auth__submit"
          endIcon={<Icon name="arrow-right" size={16} />}
        >
          {mode === "login"
            ? "Entrar na organização"
            : "Criar conta e continuar"}
        </Button>
      </form>
      <div className="assets-auth__divider" role="presentation">
        <span>ou</span>
      </div>
      <div className="assets-auth__demo">
        <Button
          variant="secondary"
          size="lg"
          disabled={action.busy}
          startIcon={<Icon name="process" size={16} />}
          onClick={() =>
            void action.run(async () => {
              await api.auth("demo", {});
              await reload();
              navigate(destination);
            })
          }
        >
          Explorar demonstração
        </Button>
        <p>
          Uma organização de exemplo só para esta sessão. Nenhum documento é
          enviado a empresas reais.
        </p>
      </div>
    </AuthLayout>
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
    <AuthLayout>
      {!invite && !action.error ? (
        <div
          className="assets-auth__loading"
          role="status"
          aria-label="Carregando convite"
        >
          <SkeletonBlock width="8rem" height="0.625rem" />
          <SkeletonBlock width="70%" height="2rem" />
          <SkeletonBlock height="5.5rem" />
          <SkeletonBlock height="2.75rem" />
        </div>
      ) : !invite ? (
        <>
          <header className="assets-auth__head">
            <p className="assets-eyebrow">Convite de colaboração</p>
            <h1>Este convite não está disponível.</h1>
          </header>
          <Feedback error={action.error} />
          <Link className="assets-text-link" to="/assets/entrar">
            Ir para a entrada <Icon name="chevron-right" size={15} />
          </Link>
        </>
      ) : (
        <>
          <header className="assets-auth__head">
            <p className="assets-eyebrow">Convite de colaboração</p>
            <h1>{invite.organization}</h1>
            <p>
              Convite para <strong>{invite.email}</strong>.
            </p>
          </header>
          <div className="assets-auth__invite">
            <Avatar name={invite.organization} size="lg" square />
            <div>
              <Badge tone="info">{roleLabels[invite.role]}</Badge>
              <p>
                {invite.objectName
                  ? `Acesso somente ao cadastro ${invite.objectName}.`
                  : "Acesso no contexto desta organização."}
              </p>
              <small>
                <Icon name="clock" size={13} /> Válido até{" "}
                {dateLabel(invite.expiresAt)} · uso único
              </small>
            </div>
          </div>
          <form onSubmit={submit} className="assets-auth__fields">
            {!data ? (
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
              </>
            ) : (
              <Notice tone="info" title={`Você entrou como ${data.user.name}`}>
                O convite será associado à sua conta atual.
              </Notice>
            )}
            <Feedback error={action.error} />
            <Button
              type="submit"
              size="lg"
              loading={action.busy}
              className="assets-auth__submit"
              endIcon={<Icon name="arrow-right" size={16} />}
            >
              Aceitar convite
            </Button>
            {!data && (
              <Link
                className="assets-text-link assets-auth__alt"
                to={`/assets/entrar?next=${encodeURIComponent(`/assets/convites/${token}`)}`}
              >
                Já tenho conta — entrar para aceitar
              </Link>
            )}
          </form>
        </>
      )}
    </AuthLayout>
  );
}
