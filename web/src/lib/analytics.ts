type EventName = "cta_click" | "tamper_demo" | "copy_hash" | "locale_change" | "cmd_palette";

export function trackEvent(name: EventName, detail?: Record<string, string>) {
  window.dispatchEvent(new CustomEvent("lastro-analytics", { detail: { name, ...detail } }));
  if (import.meta.env.DEV) {
    console.debug("[lastro-analytics]", name, detail);
  }
}
