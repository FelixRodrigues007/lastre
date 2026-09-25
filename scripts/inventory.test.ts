import assert from "node:assert/strict";
import { test } from "node:test";
import {
  extractRoutes,
  reconcileRoutes,
  hasCallableSymbol,
} from "./inventory-core";
import type { Screen } from "../app/src/lib/inventory/types";
import {
  mkdtempSync,
  mkdirSync,
  readFileSync,
  writeFileSync,
  rmSync,
  symlinkSync,
  copyFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";
import {
  isFrontendInventoryInput,
  validateSpecifications,
} from "./inventory-governance";
import { specifications } from "../app/src/lib/inventory/specifications";

const screen = (
  id: string,
  path: string,
  lifecycle: Screen["lifecycle"] = "existing",
): Screen => ({
  id,
  app: "console",
  name: id,
  objective: "Test fixture",
  owner: "Test",
  lifecycle,
  route: { path, origin: "app" },
  kind: "page",
  operations: [],
  states: [],
  notes: "",
});

test("extracts JSX paths, excludes wrappers and does not mistake comments or text for routes", () => {
  const code =
    '// <Route path="/ghost" />\nconst x = <><Route path="/lots/:id" /><Route path={"/audit"} /><Route path="*" /></>; const text = \'<Route path="/also-ghost" />\';';
  const routes = extractRoutes(code, "app/src/App.tsx");
  assert.deepEqual(
    routes.map((route) => route.path),
    ["/lots/:id", "/audit", "*"],
  );
  assert.ok(routes[2].excluded);
});
test("reports unresolved paths rather than silently dropping them", () => {
  assert.equal(
    extractRoutes("const x = <Route path={runtimePath} />", "routes.tsx")[0]
      .path,
    "INDETERMINADO",
  );
});
test("a planned screen cannot conceal a new route without an existing record", () => {
  const routes = extractRoutes('const x = <Route path="/new" />', "routes.tsx");
  assert.equal(
    reconcileRoutes(routes, [screen("LA-001", "/new", "planned")]).uncovered
      .length,
    1,
  );
});
test("detects removed and duplicate routes while normalizing parameter names", () => {
  const routes = extractRoutes(
    'const x = <><Route path="/lots/:id" /><Route path="/lots/:other" /></>',
    "routes.tsx",
  );
  const result = reconcileRoutes(routes, [
    screen("LC-001", "/lots/:assetId"),
    screen("LC-002", "/missing"),
  ]);
  assert.equal(result.uncovered.length, 0);
  assert.equal(result.duplicateRoutes.length, 1);
  assert.equal(result.missing[0].id, "LC-002");
});
test("includes the design-system entry outside the React Router tree", () => {
  const routes = extractRoutes(
    'const standalone = window.location.pathname.replace(/\\/$/, "") === "/design-system";',
    "app/src/main.tsx",
  );
  assert.equal(routes[0].path, "/design-system");
});

test("monitors shared styles, web and design sources without including its generated report", () => {
  for (const path of [
    "app/src/styles/app.css",
    "app/src/lib/navigation.ts",
    "web/src/main.tsx",
    "design-system/tokens/lastre.tokens.json",
  ]) {
    assert.equal(isFrontendInventoryInput(path), true, path);
  }
  for (const path of [
    "app/src/lib/inventory/generated/report.json",
    "web/node_modules/lib/index.js",
    "design-system/assets/font.woff2",
  ]) {
    assert.equal(isFrontendInventoryInput(path), false, path);
  }
});

test("rejects orphan, duplicate and incomplete functional specifications", () => {
  const specification = specifications[0];
  const records = [screen(specification.screen, "/response")];
  assert.deepEqual(validateSpecifications([specification], records), []);
  assert.match(
    validateSpecifications([specification], [])[0],
    /contrato sem ficha/,
  );
  assert.match(
    validateSpecifications([specification, specification], records)[0],
    /duplicado/,
  );
  assert.match(
    validateSpecifications([{ ...specification, acceptance: [] }], records)[0],
    /incompleto/,
  );
});

test("check blocks unsynced frontend changes and sync cannot hide an unregistered route", () => {
  const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
  const fixture = mkdtempSync(join(tmpdir(), "lastre-inventory-"));
  const write = (path: string, content: string) => {
    mkdirSync(dirname(join(fixture, path)), { recursive: true });
    writeFileSync(join(fixture, path), content);
  };
  try {
    for (const name of [
      "inventory.ts",
      "inventory-core.ts",
      "inventory-governance.ts",
    ]) {
      write(
        `scripts/${name}`,
        readFileSync(join(root, "scripts", name), "utf8"),
      );
    }
    write("app/src/App.tsx", 'const page = <Route path="/" />;');
    write("app/src/styles/app.css", "body { margin: 0; }");
    write("web/src/App.tsx", "export const web = 1;");
    write("design-system/tokens/base.css", ":root { --space: 8px; }");
    write(
      "app/src/lib/inventory/screens.ts",
      `export const screens = ${JSON.stringify([{ ...screen("TEST-001", "/"), source: "app/src/App.tsx" }])};`,
    );
    write(
      "app/src/lib/inventory/apps.ts",
      'export const apps = [{ id: "console" }];',
    );
    for (const name of ["operations", "flows", "specifications"])
      write(`app/src/lib/inventory/${name}.ts`, `export const ${name} = [];`);
    copyFileSync(
      join(root, "app/src/lib/inventory/types.ts"),
      join(fixture, "app/src/lib/inventory/types.ts"),
    );
    symlinkSync(
      join(root, "app/node_modules"),
      join(fixture, "app/node_modules"),
      "dir",
    );
    const run = (check = false) =>
      spawnSync(
        join(root, "app/node_modules/.bin/tsx"),
        [join(fixture, "scripts/inventory.ts"), ...(check ? ["--check"] : [])],
        { cwd: fixture, encoding: "utf8" },
      );
    assert.equal(run().status, 0);
    assert.equal(run(true).status, 0);
    for (const [path, content] of [
      ["app/src/styles/app.css", "body { display: grid; }"],
      ["web/src/App.tsx", "export const web = 2;"],
      ["design-system/tokens/base.css", ":root { --space: 12px; }"],
    ]) {
      write(path, content);
      const stale = run(true);
      assert.equal(stale.status, 1, path);
      assert.match(stale.stderr, /G12: relatório desatualizado/);
      assert.equal(run().status, 0);
      assert.equal(run(true).status, 0);
    }
    write(
      "app/src/App.tsx",
      'const page = <><Route path="/" /><Route path="/unregistered" /></>;',
    );
    const invalid = run();
    assert.equal(invalid.status, 1);
    assert.match(invalid.stderr, /G1: rota sem ficha: \/unregistered/);
    assert.equal(run(true).status, 1);
  } finally {
    rmSync(fixture, { recursive: true, force: true });
  }
});

test("operation evidence recognizes qualified methods and ignores comments and other classes", () => {
  const source =
    "// function ghost() {}\nexport class AssetsStore { share() { return true; } } class Other { missing() {} } const load = () => 1;";
  assert.equal(hasCallableSymbol(source, "api.ts", "AssetsStore.share"), true);
  assert.equal(
    hasCallableSymbol(source, "api.ts", "AssetsStore.missing"),
    false,
  );
  assert.equal(hasCallableSymbol(source, "api.ts", "ghost"), false);
  assert.equal(hasCallableSymbol(source, "api.ts", "load"), true);
  assert.equal(
    hasCallableSymbol("function fetchData() {}", "api.ts", "fetchData"),
    true,
  );
});
