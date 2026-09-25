import ts from "../app/node_modules/typescript/lib/typescript.js";
import type { Screen } from "../app/src/lib/inventory/types";

export type RouteRecord = {
  path: string;
  file: string;
  line: number;
  excluded: string | null;
};

/** React Router JSX + the explicit pathname branch in app/src/main.tsx. */
export function extractRoutes(text: string, file: string): RouteRecord[] {
  const source = ts.createSourceFile(
    file,
    text,
    ts.ScriptTarget.Latest,
    true,
    ts.ScriptKind.TSX,
  );
  const routes: RouteRecord[] = [];
  const record = (path: string, node: ts.Node) =>
    routes.push({
      path,
      file,
      line:
        source.getLineAndCharacterOfPosition(node.getStart(source)).line + 1,
      excluded:
        path === "*" || path === "/*"
          ? "Fallback ou envelope de rotas; não representa uma página."
          : null,
    });
  const visit = (node: ts.Node) => {
    if (
      (ts.isJsxSelfClosingElement(node) || ts.isJsxOpeningElement(node)) &&
      node.tagName.getText(source) === "Route"
    ) {
      const attr = node.attributes.properties.find(
        (prop) =>
          ts.isJsxAttribute(prop) && prop.name.getText(source) === "path",
      );
      if (attr && ts.isJsxAttribute(attr)) {
        const value = attr.initializer;
        if (value && ts.isStringLiteral(value)) record(value.text, node);
        else if (
          value &&
          ts.isJsxExpression(value) &&
          value.expression &&
          ts.isStringLiteral(value.expression)
        )
          record(value.expression.text, node);
        else record("INDETERMINADO", node);
      }
    }
    if (
      file === "app/src/main.tsx" &&
      ts.isBinaryExpression(node) &&
      node.operatorToken.kind === ts.SyntaxKind.EqualsEqualsEqualsToken &&
      ts.isStringLiteral(node.right) &&
      node.left.getText(source).includes("window.location.pathname")
    ) {
      record(node.right.text, node);
    }
    ts.forEachChild(node, visit);
  };
  visit(source);
  return routes;
}

export function normalizeRoute(path: string): string {
  return path.replace(/:[^/]+/g, ":param").replace(/\/+$/, "") || "/";
}

export function reconcileRoutes(routes: RouteRecord[], screens: Screen[]) {
  const actual = routes.filter((route) => !route.excluded);
  const declared = screens.filter(
    (screen) =>
      screen.route.origin === "app" &&
      screen.lifecycle === "existing" &&
      screen.kind !== "hosted",
  );
  return {
    uncovered: actual.filter(
      (route) =>
        !declared.some(
          (screen) =>
            normalizeRoute(screen.route.path) === normalizeRoute(route.path),
        ),
    ),
    missing: declared.filter(
      (screen) =>
        !actual.some(
          (route) =>
            normalizeRoute(route.path) === normalizeRoute(screen.route.path),
        ),
    ),
    duplicateRoutes: actual.filter(
      (route, index) =>
        actual.findIndex(
          (other) => normalizeRoute(other.path) === normalizeRoute(route.path),
        ) !== index,
    ),
  };
}

/** Validate a real callable declaration, including a qualified class method. */
export function hasCallableSymbol(
  text: string,
  file: string,
  symbol: string,
): boolean {
  const source = ts.createSourceFile(
    file,
    text,
    ts.ScriptTarget.Latest,
    true,
    ts.ScriptKind.TS,
  );
  const [owner, member] = symbol.split(".");
  return source.statements.some((node) => {
    if (member)
      return (
        ts.isClassDeclaration(node) &&
        node.name?.text === owner &&
        node.members.some(
          (method) =>
            ts.isMethodDeclaration(method) &&
            method.name.getText(source) === member &&
            Boolean(method.body),
        )
      );
    if (ts.isFunctionDeclaration(node))
      return node.name?.text === owner && Boolean(node.body);
    return (
      ts.isVariableStatement(node) &&
      node.declarationList.declarations.some(
        (declaration) =>
          ts.isIdentifier(declaration.name) &&
          declaration.name.text === owner &&
          declaration.initializer &&
          (ts.isArrowFunction(declaration.initializer) ||
            ts.isFunctionExpression(declaration.initializer)),
      )
    );
  });
}
