import { TextField } from "../components/ui/TextField";
import { Button } from "../components/ui/Button";
import { useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { AuthLayout } from "../components/onboarding/AuthLayout";
import { GoogleIcon } from "../components/onboarding/GoogleIcon";
import { useLocaleContext } from "../context/LocaleContext";
import { useOnboarding } from "../context/OnboardingContext";
import { readPersona } from "../lib/onboarding";
import { buildUserProfile, DEMO_GOOGLE_USER } from "../lib/userSession";
import "./login.css";

export function Login() {
  const { t } = useLocaleContext();
  const { isAuthenticated, login } = useOnboarding();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [showEmail, setShowEmail] = useState(false);

  if (isAuthenticated) {
    return <Navigate to={readPersona() ? "/" : "/welcome"} replace />;
  }

  function finishAuth(profile = DEMO_GOOGLE_USER) {
    login(profile);
    navigate(readPersona() ? "/" : "/welcome", { replace: true });
  }

  return (
    <AuthLayout>
      <section className="login entry-card" aria-labelledby="login-title">
        <header className="login__head">
          <h1 id="login-title" className="login__title">
            {t("onboarding.auth.title")}
          </h1>
        </header>

        <div className="login__actions">
          <Button
            variant="primary"
            size="md"
            type="button"
            className="entry-btn entry-btn--primary"
            onClick={() => finishAuth()}
          >
            <GoogleIcon size={18} />
            {t("onboarding.auth.google")}
          </Button>

          <div className="entry-divider" aria-hidden="true">
            <span>{t("onboarding.auth.dividerOr")}</span>
          </div>

          {!showEmail ? (
            <Button
              variant="secondary"
              size="md"
              type="button"
              className="entry-btn entry-btn--ghost"
              onClick={() => setShowEmail(true)}
            >
              {t("onboarding.auth.emailLink")}
            </Button>
          ) : (
            <form
              className="login__email"
              onSubmit={(e) => {
                e.preventDefault();
                const nextEmail = email.trim();
                finishAuth(buildUserProfile(nextEmail || "demo@lastro.io"));
              }}
            >
              <TextField
                label={t("onboarding.auth.emailPlaceholder")}
                className="entry-field"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                autoComplete="email"
              />
              <Button
                variant="primary"
                size="md"
                type="submit"
                className="entry-btn entry-btn--primary"
              >
                {t("onboarding.auth.emailSubmit")}
              </Button>
            </form>
          )}
        </div>

        <p className="entry-footnote">{t("onboarding.auth.footnote")}</p>
      </section>
    </AuthLayout>
  );
}
