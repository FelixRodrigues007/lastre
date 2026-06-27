import type { IconName } from "../components/ui/Icon";
import type { TranslationKey } from "../i18n/translations";

export type NavItem = {
  to: string;
  labelKey: TranslationKey;
  icon: IconName;
  end?: boolean;
  mobileLabelKey?: TranslationKey;
};

export const WORKSPACE_NAV: NavItem[] = [
  { to: "/", labelKey: "nav.overview", icon: "overview", end: true },
  { to: "/chain", labelKey: "nav.chain", icon: "chain" },
  { to: "/lots", labelKey: "nav.lots", icon: "lots" },
  { to: "/process", labelKey: "nav.process", icon: "process", mobileLabelKey: "nav.run" },
  { to: "/audit", labelKey: "nav.audit", icon: "audit" },
  { to: "/escalations", labelKey: "nav.escalations", icon: "escalations", mobileLabelKey: "nav.queue" },
];

export const SETTINGS_NAV: NavItem = {
  to: "/settings",
  labelKey: "nav.settings",
  icon: "settings",
};

export const MOBILE_NAV: NavItem[] = [
  WORKSPACE_NAV[0],
  WORKSPACE_NAV[1],
  WORKSPACE_NAV[3],
  WORKSPACE_NAV[4],
  WORKSPACE_NAV[2],
];

export const CSPR_PACKAGE_URL =
  "https://testnet.cspr.live/contract-package/hash-b8b505fe96c183de157beda5f2233903aa7805208b428c668d191c83f2590561";
