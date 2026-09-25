/** Declared records. Scripts only write to generated/, never to these records. */
export type AppId =
  | "web"
  | "console"
  | "identity"
  | "assets"
  | "investors"
  | "admin"
  | "design";
export type Screen = {
  id: string;
  app: AppId;
  name: string;
  objective: string;
  owner: string;
  lifecycle: "existing" | "planned";
  route: {
    path: string;
    origin: "app" | "web";
    query?: Record<string, string>;
  };
  kind: "page" | "redirect" | "hosted";
  source?: string;
  operations: string[];
  states: string[];
  notes: string;
};
export type Operation = {
  id: string;
  name: string;
  status: "observed" | "proposed";
  transport: string | null;
  source: string | null;
  symbol: string | null;
  effects: string[];
  errors: string[];
  notes: string;
};
export type ScreenSpecification = {
  screen: string;
  priority: "P0" | "P1";
  actor: string;
  entry: string;
  context: string[];
  data: string[];
  primaryAction: { label: string; effect: string; enabledWhen: string };
  permissions: string[];
  recovery: string[];
  versioning: string;
  notifications: string;
  acceptance: string[];
  dependencies: string[];
};
export type Flow = {
  id: string;
  name: string;
  status: "proposed" | "implemented";
  precondition: string;
  steps: { screen: string; action: string }[];
  result: string;
};
