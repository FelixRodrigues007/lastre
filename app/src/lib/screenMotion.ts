export type ScreenId =
  | "overview"
  | "lots"
  | "process"
  | "audit"
  | "escalations"
  | "marketplace"
  | "my-assets"
  | "settings"
  | "capture"
  | "login"
  | "welcome"
  | "unknown";

export function resolveScreenId(pathname: string): ScreenId {
  if (pathname === "/" || pathname === "") return "overview";
  if (pathname.startsWith("/lots")) return "lots";
  if (pathname.startsWith("/process")) return "process";
  if (pathname.startsWith("/audit")) return "audit";
  if (pathname.startsWith("/escalations")) return "escalations";
  if (pathname.startsWith("/marketplace")) return "marketplace";
  if (pathname.startsWith("/my-assets")) return "my-assets";
  if (pathname.startsWith("/settings")) return "settings";
  if (pathname.startsWith("/capture")) return "capture";
  if (pathname === "/login") return "login";
  if (pathname === "/welcome") return "welcome";
  return "unknown";
}
