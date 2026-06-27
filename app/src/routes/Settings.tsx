import { useEffect, useState } from "react";
import { PageHeader } from "../components/layout/PageHeader";
import { StatePanel } from "../components/layout/StatePanel";
import { MetricCard } from "../components/ui/MetricCard";
import { getSettings, updateSettings } from "../lib/api";
import type { DeciderMode } from "../lib/types";
import { useAsyncData } from "../hooks/useAsyncData";
import { useTheme } from "../hooks/useTheme";
import "./settings.css";

export function Settings() {
  const settings = useAsyncData(getSettings);
  const { theme, setTheme } = useTheme();
  const [decider, setDecider] = useState<DeciderMode>("rule");
  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);

  useEffect(() => {
    if (settings.data) {
      setDecider(settings.data.decider);
    }
  }, [settings.data]);

  async function saveDecider(next: DeciderMode) {
    setDecider(next);
    setSaving(true);
    setSaveMessage(null);
    try {
      await updateSettings(next);
      setSaveMessage("Saved to API server for this session.");
      settings.reload();
    } catch {
      setSaveMessage("Could not save decider preference.");
    } finally {
      setSaving(false);
    }
  }

  const limits = settings.data?.limits;

  return (
    <div className="page">
      <PageHeader
        kicker="Settings"
        title="Demo configuration"
        lead="Theme, decider mode, and operational limits. Audit data resets when the API server restarts."
      />

      <StatePanel loading={settings.loading} error={settings.error} onRetry={settings.reload}>
        {settings.data ? (
          <div className="settings-layout">
            <div className="settings-status">
              <MetricCard
                label="LLM provider"
                value={settings.data.llmConfigured ? "Connected" : "Fallback"}
                hint={
                  settings.data.llmConfigured
                    ? "OpenRouter key detected on server"
                    : "OPENROUTER_API_KEY not set"
                }
                tone={settings.data.llmConfigured ? "valid" : "default"}
              />
              <MetricCard
                label="Persistence"
                value={settings.data.persistence}
                hint="In-memory session only — export before restart"
              />
              <MetricCard
                label="Active decider"
                value={decider === "rule" ? "RuleDecider" : "LlmDecider"}
                tone="accent"
              />
            </div>

            <div className="settings-grid">
              <section className="panel settings-card">
                <h2 className="settings-card__title">Theme</h2>
                <p className="settings-card__hint">Olive palette · dark default</p>
                <div className="settings-card__row">
                  <label className="settings-radio">
                    <input
                      type="radio"
                      name="theme"
                      checked={theme === "dark"}
                      onChange={() => setTheme("dark")}
                    />
                    Dark
                  </label>
                  <label className="settings-radio">
                    <input
                      type="radio"
                      name="theme"
                      checked={theme === "light"}
                      onChange={() => setTheme("light")}
                    />
                    Light
                  </label>
                </div>
              </section>

              <section className="panel settings-card">
                <h2 className="settings-card__title">Decider</h2>
                <p className="settings-card__hint">
                  {settings.data.llmConfigured
                    ? "OpenRouter key detected on server."
                    : "LLM falls back to rules — OPENROUTER_API_KEY not set."}
                </p>
                <div className="settings-card__row">
                  <label className="settings-radio">
                    <input
                      type="radio"
                      name="decider"
                      checked={decider === "rule"}
                      disabled={saving}
                      onChange={() => saveDecider("rule")}
                    />
                    RuleDecider
                  </label>
                  <label className="settings-radio">
                    <input
                      type="radio"
                      name="decider"
                      checked={decider === "llm"}
                      disabled={saving}
                      onChange={() => saveDecider("llm")}
                    />
                    LlmDecider
                  </label>
                </div>
                {saveMessage ? <p className="settings-card__status">{saveMessage}</p> : null}
              </section>

              <section className="panel settings-card settings-card--wide">
                <h2 className="settings-card__title">Known limits</h2>
                <p className="settings-card__hint">Used by RuleDecider / LLM triage before payment</p>
                {limits ? (
                  <dl className="settings-limits">
                    <div>
                      <dt>Mine perimeter (lat)</dt>
                      <dd>
                        {limits.minePerimeter.minLat} … {limits.minePerimeter.maxLat}
                      </dd>
                    </div>
                    <div>
                      <dt>Mine perimeter (lng)</dt>
                      <dd>
                        {limits.minePerimeter.minLng} … {limits.minePerimeter.maxLng}
                      </dd>
                    </div>
                    <div>
                      <dt>Mass range (g)</dt>
                      <dd>
                        &gt; {limits.massGrams.minExclusive} · ≤{" "}
                        {limits.massGrams.maxInclusive.toLocaleString()}
                      </dd>
                    </div>
                  </dl>
                ) : null}
              </section>

              <section className="panel settings-card settings-card--wide">
                <h2 className="settings-card__title">Persistence</h2>
                <p className="settings-card__hint">
                  Audit log and mock on-chain state live in API memory only (
                  <code>{settings.data.persistence}</code>). Restart the server to reset. Export JSON
                  from Audit before restarting.
                </p>
              </section>
            </div>
          </div>
        ) : null}
      </StatePanel>
    </div>
  );
}
