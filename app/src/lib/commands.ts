import type { TranslationKey } from "../i18n/translations";

export type CommandItem = {
  label: string;
  // Optional i18n key — when present, CommandPalette resolves the label via
  // t(labelKey) instead of the literal `label` (which stays as an English
  // fallback for search matching and for any caller without locale context).
  labelKey?: TranslationKey;
  path: string;
  keywords: string[];
};

export const COMMAND_ITEMS: CommandItem[] = [
  { label: "Overview", path: "/", keywords: ["home", "dashboard", "console"] },
  { label: "Lots", path: "/lots", keywords: ["queue", "artifacts", "assets"] },
  { label: "Run batch", path: "/process", keywords: ["demo", "process", "batch"] },
  { label: "Audit log", path: "/audit", keywords: ["history", "records", "export", "casper", "testnet", "on-chain", "chain"] },
  { label: "Escalations", path: "/escalations", keywords: ["review", "queue", "human"] },
  {
    label: "Sealed Market Rail",
    labelKey: "commands.sealedRail",
    path: "/marketplace?rail=1",
    keywords: ["rail", "sealed", "market", "defi", "origin", "mintgate", "x402", "collateral"],
  },
  { label: "Settings", path: "/settings", keywords: ["theme", "decider", "config"] },
];
