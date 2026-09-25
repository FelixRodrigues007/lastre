import { createHash } from "node:crypto";
import type {
  Screen,
  ScreenSpecification,
} from "../app/src/lib/inventory/types";

/** Source coverage is wider than route extraction; binary/public assets are manual. */
export function isFrontendInventoryInput(path: string): boolean {
  return (
    /^(app\/src\/|web\/src\/|design-system\/)/.test(path) &&
    !path.startsWith("app/src/lib/inventory/generated/") &&
    !/(^|\/)(node_modules|dist|\.git)\//.test(path) &&
    /\.(tsx?|jsx?|mjs|css|scss|json|html|svg)$/.test(path)
  );
}

export function fingerprintSources(
  entries: { path: string; content: string }[],
): string {
  const hash = createHash("sha256");
  for (const entry of [...entries].sort((a, b) =>
    a.path < b.path ? -1 : a.path > b.path ? 1 : 0,
  )) {
    hash.update(entry.path).update("\0").update(entry.content).update("\0");
  }
  return hash.digest("hex").slice(0, 16);
}

export function validateSpecifications(
  specifications: ScreenSpecification[],
  screens: Screen[],
): string[] {
  const errors: string[] = [];
  const ids = new Set<string>();
  for (const specification of specifications) {
    const id = specification.screen;
    if (ids.has(id)) errors.push(`G2: contrato funcional duplicado: ${id}`);
    ids.add(id);
    if (!screens.some((screen) => screen.id === id))
      errors.push(`G2: contrato sem ficha: ${id}`);
    const required = [
      specification.actor,
      specification.entry,
      specification.versioning,
      specification.notifications,
      ...Object.values(specification.primaryAction),
    ];
    const lists = [
      specification.context,
      specification.data,
      specification.permissions,
      specification.recovery,
      specification.acceptance,
      specification.dependencies,
    ];
    if (
      required.some((value) => !value.trim()) ||
      lists.some(
        (values) => !values.length || values.some((value) => !value.trim()),
      )
    ) {
      errors.push(`G2: contrato funcional incompleto: ${id}`);
    }
  }
  return errors;
}
