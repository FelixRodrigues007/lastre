import type { IncomingMessage, ServerResponse } from "node:http";
import { fileURLToPath } from "node:url";
import { AssetsError, AssetsStore } from "./store.js";

let singleton: AssetsStore | undefined;
const token = (req: IncomingMessage) =>
  (req.headers.cookie ?? "")
    .split(";")
    .map((s) => s.trim())
    .find((s) => s.startsWith("lastre_assets="))
    ?.slice("lastre_assets=".length) ?? "";
const send = (res: ServerResponse, status: number, payload: unknown) => {
  res.statusCode = status;
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.end(JSON.stringify(payload));
};
function setSession(res: ServerResponse, value: string) {
  res.setHeader(
    "Set-Cookie",
    `lastre_assets=${value}; Path=/api/assets; HttpOnly; SameSite=Strict; Max-Age=${value ? 604800 : 0}${process.env.NODE_ENV === "production" ? "; Secure" : ""}`,
  );
}
async function body(req: IncomingMessage): Promise<Record<string, unknown>> {
  const chunks: Buffer[] = [];
  let size = 0;
  for await (const part of req) {
    const chunk = Buffer.from(part);
    size += chunk.length;
    if (size > 12 * 1024 * 1024)
      throw new AssetsError(
        413,
        "BODY_TOO_LARGE",
        "O arquivo excede o limite de tamanho.",
      );
    chunks.push(chunk);
  }
  try {
    const value: unknown = JSON.parse(Buffer.concat(chunks).toString() || "{}");
    if (!value || typeof value !== "object" || Array.isArray(value))
      throw new Error();
    return value as Record<string, unknown>;
  } catch {
    throw new AssetsError(
      400,
      "INVALID_JSON",
      "Não foi possível ler esta solicitação.",
    );
  }
}
const attempts = new Map<string, { count: number; reset: number }>();
function throttle(req: IncomingMessage) {
  const key = req.socket.remoteAddress ?? "local";
  const current = attempts.get(key);
  if (!current || current.reset < Date.now()) {
    if (attempts.size > 1000)
      for (const [k, v] of attempts)
        if (v.reset < Date.now()) attempts.delete(k);
    attempts.set(key, { count: 1, reset: Date.now() + 60000 });
  } else if (++current.count > 30)
    throw new AssetsError(
      429,
      "TOO_MANY_ATTEMPTS",
      "Muitas tentativas. Aguarde um minuto e tente novamente.",
    );
}

export async function handleAssetsRequest(
  req: IncomingMessage,
  res: ServerResponse,
  provided?: AssetsStore,
): Promise<boolean> {
  const url = new URL(req.url ?? "/", "http://assets.local");
  if (!/^\/api\/assets(?:\/|$)/.test(url.pathname)) return false;
  res.setHeader("Cache-Control", "no-store");
  res.setHeader("X-Content-Type-Options", "nosniff");
  try {
    const method = req.method ?? "GET";
    // Mutations require an explicit custom header; cross-origin requests are never enabled.
    if (
      !["GET", "HEAD"].includes(method) &&
      req.headers["x-lastre-request"] !== "assets"
    )
      throw new AssetsError(
        403,
        "INVALID_ORIGIN",
        "Reabra a Lastre para continuar esta ação.",
      );
    if (req.headers.origin) {
      const configured = (process.env.LASTRE_ASSETS_ORIGINS ?? "")
        .split(",")
        .filter(Boolean);
      const origin = new URL(req.headers.origin);
      const sameHost = origin.host === req.headers.host;
      const local =
        process.env.NODE_ENV !== "production" &&
        ["localhost", "127.0.0.1", "[::1]"].includes(origin.hostname);
      if (!sameHost && !local && !configured.includes(origin.origin))
        throw new AssetsError(
          403,
          "INVALID_ORIGIN",
          "Origem da solicitação não autorizada.",
        );
    }
    const store =
      provided ??
      (singleton ??= new AssetsStore(
        process.env.LASTRE_ASSETS_DATA ??
          fileURLToPath(new URL("../../.lastre/assets.json", import.meta.url)),
      ));
    const path = url.pathname.slice("/api/assets".length);
    const sessionToken = token(req);
    if (method === "POST" && ["/register", "/login", "/demo"].includes(path)) {
      throttle(req);
      if (
        path === "/demo" &&
        process.env.NODE_ENV === "production" &&
        process.env.LASTRE_ASSETS_DEMO !== "true"
      )
        throw new AssetsError(
          404,
          "DEMO_DISABLED",
          "A demonstração não está disponível neste ambiente.",
        );
      const input = await body(req);
      const value =
        path === "/register"
          ? store.register(input)
          : path === "/login"
            ? store.login(input)
            : store.demo();
      setSession(res, value);
      send(res, 200, store.session(value));
      return true;
    }
    if (method === "POST" && path === "/logout") {
      store.logout(sessionToken);
      setSession(res, "");
      send(res, 200, { ok: true });
      return true;
    }
    const invitation = path.match(/^\/invites\/([a-f0-9]{64})$/);
    if (invitation) {
      if (method === "GET") {
        send(res, 200, store.previewInvitation(invitation[1]));
        return true;
      }
      if (method === "POST") {
        throttle(req);
        const value = store.acceptInvitation(
          invitation[1],
          await body(req),
          sessionToken,
        );
        setSession(res, value);
        send(res, 200, store.session(value));
        return true;
      }
    }
    const actor = store.session(sessionToken);
    if (method === "GET" && path === "/session") {
      send(res, 200, actor);
      return true;
    }
    if (method === "GET" && path === "/recipients") {
      send(res, 200, store.recipients(actor, url.searchParams.get("email")));
      return true;
    }
    if (method === "POST" && path === "/switch-organization") {
      const input = await body(req);
      const nextToken = store.switchOrganization(
        actor,
        String(input.organizationId ?? ""),
      );
      setSession(res, nextToken);
      send(res, 200, store.session(nextToken));
      return true;
    }
    if (method === "GET" && path === "/workspace") {
      send(res, 200, store.workspace(actor));
      return true;
    }
    if (method === "POST" && path === "/objects") {
      send(res, 201, store.createObject(actor, await body(req)));
      return true;
    }
    if (method === "POST" && path === "/requests") {
      send(res, 201, store.createRequest(actor, await body(req)));
      return true;
    }
    if (method === "POST" && path === "/objects/import") {
      send(res, 200, store.importLots(actor, await body(req)));
      return true;
    }
    const exportVersion = path.match(
      /^\/objects\/([^/]+)\/versions\/([^/]+)\/export$/,
    );
    if (exportVersion && method === "GET") {
      send(
        res,
        200,
        store.exportVersion(actor, exportVersion[1], exportVersion[2]),
      );
      return true;
    }
    const object = path.match(
      /^\/objects\/([^/]+)(?:\/(status|evidence|shares))?$/,
    );
    if (object && method === "POST") {
      const input = await body(req);
      const result =
        object[2] === "status"
          ? store.setStatus(actor, object[1], input)
          : object[2] === "evidence"
            ? store.upload(actor, object[1], input)
            : object[2] === "shares"
              ? store.share(actor, object[1], input)
              : store.updateObject(actor, object[1], input);
      send(res, 200, result);
      return true;
    }
    const remove = path.match(
      /^\/objects\/([^/]+)\/evidence\/([^/]+)\/remove$/,
    );
    if (remove && method === "POST") {
      send(
        res,
        200,
        store.removeEvidence(
          actor,
          remove[1],
          remove[2],
          (await body(req)).revision,
        ),
      );
      return true;
    }
    const clarification = path.match(/^\/requests\/([^/]+)\/clarifications$/);
    if (clarification && method === "POST") {
      send(res, 200, store.clarify(actor, clarification[1], await body(req)));
      return true;
    }
    const request = path.match(/^\/requests\/([^/]+)$/);
    if (request && method === "POST") {
      send(res, 200, store.updateRequest(actor, request[1], await body(req)));
      return true;
    }
    const revoke = path.match(/^\/shares\/([^/]+)\/revoke$/);
    if (revoke && method === "POST") {
      send(res, 200, store.revokeShare(actor, revoke[1]));
      return true;
    }
    const received = path.match(/^\/received\/([^/]+)$/);
    if (received && method === "GET") {
      send(res, 200, store.received(actor, received[1]));
      return true;
    }
    const document = path.match(/^\/evidence\/([^/]+)$/);
    if (document && method === "GET") {
      const file = store.download(
        actor,
        document[1],
        url.searchParams.get("share") ?? undefined,
      );
      res.statusCode = 200;
      res.setHeader("Content-Type", file.mime);
      res.setHeader(
        "Content-Disposition",
        `attachment; filename*=UTF-8''${encodeURIComponent(file.name).replace(/'/g, "%27")}`,
      );
      res.setHeader("Content-Length", file.bytes.length);
      res.end(file.bytes);
      return true;
    }
    if (method === "POST" && path === "/organization") {
      send(res, 200, store.updateOrganization(actor, await body(req)));
      return true;
    }
    if (method === "POST" && path === "/invitations") {
      send(res, 201, store.invite(actor, await body(req)));
      return true;
    }
    const invitationRevoke = path.match(/^\/invitations\/([^/]+)\/revoke$/);
    if (invitationRevoke && method === "POST") {
      send(res, 200, store.revokeInvitation(actor, invitationRevoke[1]));
      return true;
    }
    const member = path.match(/^\/members\/([^/]+)$/);
    if (member && method === "POST") {
      send(res, 200, store.updateMember(actor, member[1], await body(req)));
      return true;
    }
    const notice = path.match(/^\/notifications\/([^/]+)\/read$/);
    if (notice && method === "POST") {
      send(res, 200, store.readNotification(actor, notice[1]));
      return true;
    }
    send(res, 404, { code: "NOT_FOUND", message: "Recurso não encontrado." });
  } catch (error) {
    if (error instanceof AssetsError)
      send(res, error.status, { code: error.code, message: error.message });
    else {
      console.error(
        "[assets] Request failed",
        error instanceof Error ? error.message : "Unknown failure",
      );
      send(res, 500, {
        code: "UNAVAILABLE",
        message:
          "Não foi possível confirmar a operação. Seus últimos dados salvos foram preservados. Tente novamente.",
      });
    }
  }
  return true;
}
