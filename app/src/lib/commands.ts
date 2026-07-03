export type CommandItem = {
  label: string;
  path: string;
  keywords: string[];
};

export const COMMAND_ITEMS: CommandItem[] = [
  { label: "Overview", path: "/", keywords: ["home", "dashboard", "console"] },
  { label: "Lots", path: "/lots", keywords: ["queue", "artifacts", "assets"] },
  { label: "Run batch", path: "/process", keywords: ["demo", "process", "batch"] },
  { label: "Audit log", path: "/audit", keywords: ["history", "records", "export", "casper", "testnet", "on-chain", "chain"] },
  { label: "Escalations", path: "/escalations", keywords: ["review", "queue", "human"] },
  { label: "Settings", path: "/settings", keywords: ["theme", "decider", "config"] },
];
