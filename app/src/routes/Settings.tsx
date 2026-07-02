import { useEffect, useState } from "react";
import { PageHeader } from "../components/layout/PageHeader";
import { StatePanel } from "../components/layout/StatePanel";
import { CopyBlock } from "../components/ui/CopyBlock";
import { Tabs } from "../components/ui/Tabs";
import { getSettings, updateSettings } from "../lib/api";
import { CSPR_PACKAGE_URL } from "../lib/navigation";
import type { DeciderMode } from "../lib/types";
import { useAsyncData } from "../hooks/useAsyncData";
import { useTheme } from "../hooks/useTheme";
import "./settings.css";

type SettingsTab = "general" | "decider" | "limits" | "persistence";

const TABS = [
  { id: "general" as const, label: "General" },
  { id: "decider" as const, label: "Decider" },
  { id: "limits" as const, label: "Limits" },
  { id: "persistence" as const, label: "Persistence" },
];

export function Settings() {
  const settings = useAsyncData(getSettings);
  const { theme, setTheme } = useTheme();
  const [tab, setTab] = useState<SettingsTab>("general");
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

      <StatePanel loading={settings.loading} error={settings.error} skeleton="detail" onRetry={settings.reload}>
        {settings.data ? (
          <div className="settings-layout">
            <div className="settings-status-row">
              <span
                className={`settings-pill${settings.data.llmConfigured ? " settings-pill--valid" : ""}`}
              >
                LLM {settings.data.llmConfigured ? "connected" : "fallback"}
              </span>
              <span className="settings-pill">Decider: {decider === "rule" ? "Rule" : "LLM"}</span>
              <span className="settings-pill">Persistence: {settings.data.persistence}</span>
            </div>

            <Tabs tabs={TABS} active={tab} onChange={setTab} ariaLabel="Settings sections">
              {tab === "general" ? (
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
              ) : null}

              {tab === "decider" ? (
                <section className="panel settings-card">
                  <h2 className="settings-card__title">Decider</h2>
                  <p className="settings-card__hint">
                    {settings.data.llmConfigured
                      ? "xAI or OpenRouter key detected on server."
                      : "LLM falls back to rules — XAI_API_KEY or OPENROUTER_API_KEY not set."}
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
              ) : null}

              {tab === "limits" ? (
                <section className="panel settings-card">
                  <h2 className="settings-card__title">Known limits</h2>
                  <p className="settings-card__hint">Used by RuleDecider / LLM triage before payment</p>
                  {limits ? (
                    <table className="settings-limits-table">
                      <thead>
                        <tr>
                          <th scope="col">Parameter</th>
                          <th scope="col">Range</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td>Mine perimeter (lat)</td>
                          <td>
                            {limits.minePerimeter.minLat} … {limits.minePerimeter.maxLat}
                          </td>
                        </tr>
                        <tr>
                          <td>Mine perimeter (lng)</td>
                          <td>
                            {limits.minePerimeter.minLng} … {limits.minePerimeter.maxLng}
                          </td>
                        </tr>
                        <tr>
                          <td>Mass range (g)</td>
                          <td>
                            &gt; {limits.massGrams.minExclusive} · ≤{" "}
                            {limits.massGrams.maxInclusive.toLocaleString()}
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  ) : null}
                </section>
              ) : null}

              {tab === "persistence" ? (
                <section className="panel settings-card">
                  <h2 className="settings-card__title">Persistence & package</h2>
                  <p className="settings-card__hint">
                    Audit log and mock on-chain state live in API memory only. Restart the server
                    to reset. Export JSON from Audit before restarting.
                  </p>
                  <CopyBlock label="Casper package URL" value={CSPR_PACKAGE_URL} />
                </section>
              ) : null}
            </Tabs>
          </div>
        ) : null}
      </StatePanel>
    </div>
  );
}
