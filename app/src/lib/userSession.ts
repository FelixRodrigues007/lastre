export type UserProfile = {
  email: string;
  name: string;
  avatarUrl: string;
};

const USER_KEY = "lastro-user";
const DEMO_EMAIL = "demo@lastro.io";

export function formatNameFromEmail(email: string): string {
  const local = email.split("@")[0] ?? "user";
  const parts = local.split(/[._-]+/).filter(Boolean);
  if (parts.length === 0) return "User";
  return parts
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join(" ");
}

export function avatarUrlForProfile(name: string, email: string): string {
  const params = new URLSearchParams({
    name,
    size: "64",
    background: "3f6212",
    color: "e2e8d8",
    bold: "true",
  });
  params.set("email", email);
  return `https://ui-avatars.com/api/?${params.toString()}`;
}

export function buildUserProfile(email: string, name?: string): UserProfile {
  const normalized = email.trim().toLowerCase() || DEMO_EMAIL;
  const displayName = name?.trim() || formatNameFromEmail(normalized);
  return {
    email: normalized,
    name: displayName,
    avatarUrl: avatarUrlForProfile(displayName, normalized),
  };
}

export function readUserProfile(): UserProfile | null {
  if (typeof localStorage === "undefined") return null;
  try {
    const raw = localStorage.getItem(USER_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<UserProfile>;
    if (!parsed.email || !parsed.name) return null;
    return {
      email: parsed.email,
      name: parsed.name,
      avatarUrl:
        parsed.avatarUrl ?? avatarUrlForProfile(parsed.name, parsed.email),
    };
  } catch {
    return null;
  }
}

export function writeUserProfile(user: UserProfile | null): void {
  if (typeof localStorage === "undefined") return;
  if (user) localStorage.setItem(USER_KEY, JSON.stringify(user));
  else localStorage.removeItem(USER_KEY);
}

export const DEMO_GOOGLE_USER = buildUserProfile(DEMO_EMAIL, "Laura Eckert");
