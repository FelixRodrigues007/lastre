import type { Locale } from "../lib/locale";

export const translations = {
  en: {
    "nav.overview": "Overview",
    "nav.chain": "Chain",
    "nav.lots": "Lots",
    "nav.process": "Process",
    "nav.audit": "Audit",
    "nav.escalations": "Escalations",
    "nav.settings": "Settings",
    "nav.run": "Run",
    "nav.queue": "Queue",
    "nav.workspace": "Workspace",
    "nav.suffix": "Provenance Console",
    "guardrail.demo": "Demo",
    "guardrail.text":
      "Fictional data · Seal decides verdict · Not investment or token sale",
    "prefs.menu": "Preferences",
    "prefs.language": "Language",
    "prefs.theme": "Theme",
    "prefs.theme.dark": "Dark",
    "prefs.theme.light": "Light",
    "prefs.lang.en": "English",
    "prefs.lang.pt": "Português",
    "status.testnet": "Testnet",
    "status.casper": "Casper Testnet",
    "status.livePackage": "Live package",
    "brand.console": "Lastro Console",
    "brand.name": "Lastro",
  },
  pt: {
    "nav.overview": "Visão geral",
    "nav.chain": "Chain",
    "nav.lots": "Lotes",
    "nav.process": "Processar",
    "nav.audit": "Auditoria",
    "nav.escalations": "Escalações",
    "nav.settings": "Configurações",
    "nav.run": "Executar",
    "nav.queue": "Fila",
    "nav.workspace": "Workspace",
    "nav.suffix": "Console de proveniência",
    "guardrail.demo": "Demo",
    "guardrail.text":
      "Dados fictícios · Selo decide veredito · Não é investimento nem venda de token",
    "prefs.menu": "Preferências",
    "prefs.language": "Idioma",
    "prefs.theme": "Tema",
    "prefs.theme.dark": "Escuro",
    "prefs.theme.light": "Claro",
    "prefs.lang.en": "English",
    "prefs.lang.pt": "Português",
    "status.testnet": "Testnet",
    "status.casper": "Casper Testnet",
    "status.livePackage": "Pacote ao vivo",
    "brand.console": "Lastro Console",
    "brand.name": "Lastro",
  },
} as const satisfies Record<Locale, Record<string, string>>;

export type TranslationKey = keyof typeof translations.en;

export function translate(locale: Locale, key: TranslationKey): string {
  return translations[locale][key] ?? translations.en[key];
}
