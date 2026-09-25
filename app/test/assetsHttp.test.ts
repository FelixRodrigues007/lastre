import assert from "node:assert/strict";
import { createServer } from "node:http";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { test } from "node:test";
import { handleAssetsRequest } from "../server/assets/http.js";
import { AssetsStore, blankFields } from "../server/assets/store.js";

test("HTTP enforces sessions, CSRF, input limits, cookies and protected document access", async () => {
  const dir = mkdtempSync(join(tmpdir(), "assets-http-"));
  const store = new AssetsStore(join(dir, "db.json"));
  const server = createServer(async (req, res) => {
    if (!(await handleAssetsRequest(req, res, store))) {
      res.statusCode = 404;
      res.end();
    }
  });
  await new Promise<void>((resolve) => server.listen(0, "127.0.0.1", resolve));
  const address = server.address();
  assert(address && typeof address !== "string");
  const base = `http://127.0.0.1:${address.port}/api/assets`;
  const headers = {
    "Content-Type": "application/json",
    "X-Lastre-Request": "assets",
  };
  try {
    assert.equal((await fetch(`${base}/workspace`)).status, 401);
    assert.equal(
      (await fetch(`${base}/register`, { method: "POST", body: "{}" })).status,
      403,
    );
    assert.equal(
      (
        await fetch(`${base}/register`, {
          method: "POST",
          headers: { ...headers, Origin: "https://foreign.example" },
          body: "{}",
        })
      ).status,
      403,
    );
    assert.equal(
      (
        await fetch(`${base}/register`, {
          method: "POST",
          headers,
          body: "null",
        })
      ).status,
      400,
    );
    const register = await fetch(`${base}/register`, {
      method: "POST",
      headers,
      body: JSON.stringify({
        name: "Marina",
        email: "marina@example.com",
        password: "A-good-password-for-test",
        organization: "Serra Clara",
      }),
    });
    assert.equal(register.status, 200);
    const cookieHeader = register.headers.get("set-cookie")!;
    assert.match(cookieHeader, /HttpOnly/);
    assert.match(cookieHeader, /SameSite=Strict/);
    const cookie = cookieHeader.split(";")[0];
    const auth = { ...headers, Cookie: cookie };
    const created = await fetch(`${base}/objects`, {
      method: "POST",
      headers: auth,
      body: JSON.stringify({
        kind: "lot",
        fields: { ...blankFields, name: "Teste HTTP" },
      }),
    });
    assert.equal(created.status, 201);
    const object = await created.json();
    const upload = await fetch(`${base}/objects/${object.id}/evidence`, {
      method: "POST",
      headers: auth,
      body: JSON.stringify({
        revision: 1,
        name: "nome com acento ç.txt",
        mime: "text/plain",
        source: "Equipe",
        content: Buffer.from("Evidência").toString("base64"),
      }),
    });
    assert.equal(upload.status, 200);
    const file = await upload.json();
    assert.equal((await fetch(`${base}/evidence/${file.id}`)).status, 401);
    const download = await fetch(`${base}/evidence/${file.id}`, {
      headers: { Cookie: cookie },
    });
    assert.equal(download.status, 200);
    assert.match(download.headers.get("content-disposition")!, /attachment/);
    assert.equal(await download.text(), "Evidência");
    assert.equal(download.headers.get("cache-control"), "no-store");
    const stale = await fetch(`${base}/objects/${object.id}`, {
      method: "POST",
      headers: auth,
      body: JSON.stringify({ revision: 1, fields: object.fields }),
    });
    assert.equal(stale.status, 409);
    assert.equal((await stale.json()).code, "STALE_REVISION");
    const logout = await fetch(`${base}/logout`, {
      method: "POST",
      headers: auth,
      body: "{}",
    });
    assert.equal(logout.status, 200);
    assert.match(logout.headers.get("set-cookie")!, /Max-Age=0/);
    assert.equal(
      (await fetch(`${base}/workspace`, { headers: { Cookie: cookie } }))
        .status,
      401,
    );
  } finally {
    await new Promise<void>((resolve, reject) =>
      server.close((error) => (error ? reject(error) : resolve())),
    );
    rmSync(dir, { recursive: true, force: true });
  }
});
