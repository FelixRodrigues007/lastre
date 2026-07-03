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
          <button type="button" className="entry-btn entry-btn--primary" onClick={() => finishAuth()}>
            <GoogleIcon size={18} />
            {t("onboarding.auth.google")}
          </button>

          <div className="entry-divider" aria-hidden="true">
            <span>{t("onboarding.auth.dividerOr")}</span>
          </div>

          {!showEmail ? (
            <button
              type="button"
              className="entry-btn entry-btn--ghost"
              onClick={() => setShowEmail(true)}
            >
              {t("onboarding.auth.emailLink")}
            </button>
          ) : (
            <form
              className="login__email"
              onSubmit={(e) => {
                e.preventDefault();
                const nextEmail = email.trim();
                finishAuth(
                  buildUserProfile(
                    nextEmail || "demo@lastro.io",
                  ),
                );
              }}
            >
              <label className="entry-field">
                {t("onboarding.auth.emailPlaceholder")}
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  autoComplete="email"
                />
              </label>
              <button type="submit" className="entry-btn entry-btn--primary">
                {t("onboarding.auth.emailSubmit")}
              </button>
            </form>
          )}
        </div>

        <p className="entry-footnote">{t("onboarding.auth.footnote")}</p>
      </section>
    </AuthLayout>
  );
}
