import assert from "node:assert/strict";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { test } from "node:test";
import {
  AssetsError,
  AssetsStore,
  blankFields,
} from "../server/assets/store.js";
import type { DossierObject, Session } from "../server/assets/types.js";
const password = "A-long-test-password!";
function setup() {
  const dir = mkdtempSync(join(tmpdir(), "lastre-assets-"));
  const path = join(dir, "data.json");
  const store = new AssetsStore(path);
  const register = (email: string, name = email) => {
    const token = store.register({
      name,
      email,
      password,
      organization: `Organização ${name}`,
    });
    return { token, actor: store.session(token) };
  };
  return {
    store,
    path,
    register,
    cleanup: () => rmSync(dir, { recursive: true, force: true }),
  };
}
function complete(store: AssetsStore, actor: Session): DossierObject {
  return store.createObject(actor, {
    kind: "lot",
    fields: {
      ...blankFields,
      name: "Lote SC-101",
      material: "Cobre",
      quantity: "24.6",
      unit: "t",
      responsible: actor.user.name,
      location: "Itabirito, MG",
      periodStart: "2026-09-01",
      periodEnd: "2026-09-10",
    },
  });
}
function denied(fn: () => unknown, status: number, code?: string) {
  assert.throws(
    fn,
    (e) =>
      e instanceof AssetsError &&
      e.status === status &&
      (!code || e.code === code),
  );
}
function upload(
  store: AssetsStore,
  actor: Session,
  object: DossierObject,
  extra = {},
) {
  return store.upload(actor, object.id, {
    revision: object.revision,
    name: "relatorio.txt",
    mime: "text/plain",
    content: Buffer.from("Medição de produção.").toString("base64"),
    source: "Equipe técnica",
    issuedAt: "2026-09-01",
    ...extra,
  });
}
function shareInput(object: DossierObject, email: string, extra = {}) {
  return {
    revision: object.revision,
    key: "test-send",
    recipientEmail: email,
    purpose: "Análise documental",
    expiresAt: "2099-01-01T23:59:59Z",
    allowDownload: true,
    ...extra,
  };
}

test("drafts and sessions survive restart, and another organization cannot read or mutate them", () => {
  const f = setup();
  try {
    const a = f.register("a@example.com");
    const b = f.register("b@example.com");
    const object = f.store.createObject(a.actor, {
      kind: "asset",
      fields: { ...blankFields, category: "area" },
    });
    const restarted = new AssetsStore(f.path);
    assert.equal(
      restarted.workspace(restarted.session(a.token)).objects[0].id,
      object.id,
    );
    assert.equal(restarted.workspace(b.actor).objects.length, 0);
    denied(
      () =>
        restarted.updateObject(b.actor, object.id, {
          revision: 1,
          fields: object.fields,
        }),
      404,
    );
    denied(
      () =>
        restarted.share(
          a.actor,
          object.id,
          shareInput(object, b.actor.user.email),
        ),
      422,
      "MISSING_FIELDS",
    );
    denied(
      () => restarted.login({ email: a.actor.user.email, password: "bad" }),
      401,
    );
    assert.equal(
      JSON.stringify(restarted.workspace(a.actor)).includes("passwordHash"),
      false,
    );
  } finally {
    f.cleanup();
  }
});

test("optimistic concurrency preserves the first editor and invalidates stale review", () => {
  const f = setup();
  try {
    const a = f.register("a@example.com");
    const b = f.register("b@example.com");
    const object = complete(f.store, a.actor);
    const changed = f.store.updateObject(a.actor, object.id, {
      revision: object.revision,
      fields: { ...object.fields, quantity: "30" },
    });
    denied(
      () =>
        f.store.updateObject(a.actor, object.id, {
          revision: object.revision,
          fields: { ...object.fields, quantity: "40" },
        }),
      409,
      "STALE_REVISION",
    );
    denied(
      () =>
        f.store.share(
          a.actor,
          object.id,
          shareInput(object, b.actor.user.email),
        ),
      409,
      "STALE_REVISION",
    );
    assert.equal(f.store.workspace(a.actor).objects[0].fields.quantity, "30");
    assert.equal(changed.revision, 2);
  } finally {
    f.cleanup();
  }
});

test("sharing is idempotent, preserves old documents, scopes versions, and revocation stops downloads", () => {
  const f = setup();
  try {
    const a = f.register("a@example.com");
    const b = f.register("b@example.com");
    const c = f.register("c@example.com");
    let object = complete(f.store, a.actor);
    const firstDoc = upload(f.store, a.actor, object);
    object = f.store.workspace(a.actor).objects[0];
    const input = shareInput(object, b.actor.user.email);
    const first = f.store.share(a.actor, object.id, input);
    const repeated = f.store.share(a.actor, object.id, input);
    assert.equal(first.share.receipt, repeated.share.receipt);
    assert.equal(f.store.workspace(a.actor).versions.length, 1);
    denied(
      () =>
        f.store.share(a.actor, object.id, { ...input, purpose: "Outro envio" }),
      409,
      "IDEMPOTENCY_CONFLICT",
    );
    denied(() => f.store.received(c.actor, first.share.id), 404);
    denied(() => f.store.download(b.actor, firstDoc.id), 404);
    assert.equal(
      f.store.download(b.actor, firstDoc.id, first.share.id).bytes.toString(),
      "Medição de produção.",
    );
    const secondDoc = upload(f.store, a.actor, object, {
      content: Buffer.from("Medição corrigida.").toString("base64"),
      supersedes: firstDoc.id,
    });
    object = f.store.workspace(a.actor).objects[0];
    const second = f.store.share(
      a.actor,
      object.id,
      shareInput(object, b.actor.user.email, { key: "second-send" }),
    );
    assert.equal(second.version.number, 2);
    assert.equal(
      f.store.received(b.actor, first.share.id).version.evidence[0].id,
      firstDoc.id,
    );
    denied(() => f.store.download(b.actor, secondDoc.id, first.share.id), 403);
    f.store.revokeShare(a.actor, first.share.id);
    denied(
      () => f.store.received(b.actor, first.share.id),
      403,
      "ACCESS_ENDED",
    );
    denied(() => f.store.download(b.actor, firstDoc.id, first.share.id), 403);
    assert.equal(
      f.store.received(b.actor, second.share.id).version.id,
      second.version.id,
    );
    assert.equal(
      f.store
        .workspace(a.actor)
        .versions.find((v) => v.id === first.version.id)!.evidence[0].id,
      firstDoc.id,
    );
  } finally {
    f.cleanup();
  }
});

test("no-download grants deny file bytes and grants expire independently of stored history", () => {
  const f = setup();
  try {
    const a = f.register("a@example.com");
    const b = f.register("b@example.com");
    let object = complete(f.store, a.actor);
    const file = upload(f.store, a.actor, object);
    object = f.store.workspace(a.actor).objects[0];
    const shared = f.store.share(
      a.actor,
      object.id,
      shareInput(object, b.actor.user.email, {
        allowDownload: false,
        expiresAt: new Date(Date.now() + 1000).toISOString(),
      }),
    );
    denied(() => f.store.download(b.actor, file.id, shared.share.id), 403);
    const time = Date.now;
    try {
      Date.now = () => time() + 2000;
      denied(
        () => f.store.received(b.actor, shared.share.id),
        403,
        "ACCESS_ENDED",
      );
    } finally {
      Date.now = time;
    }
    assert.equal(f.store.workspace(a.actor).versions.length, 1);
  } finally {
    f.cleanup();
  }
});

test("request response enforces documents, versions justifications and keeps a clarification awaiting review", () => {
  const f = setup();
  try {
    const source = f.register("source@example.com");
    const buyer = f.register("buyer@example.com");
    let object = complete(f.store, source.actor);
    const r = f.store.createRequest(buyer.actor, {
      recipientEmail: source.actor.user.email,
      title: "Documentação de origem",
      purpose: "Análise documental",
      dueAt: "2026-10-10",
      requirements: [
        {
          label: "Origem",
          description: "Anexe declaração",
          required: true,
          allowJustification: false,
        },
        {
          label: "Medição",
          description: "Medição ou justificativa",
          required: true,
          allowJustification: true,
        },
      ],
    });
    let current = f.store.updateRequest(source.actor, r.id, {
      revision: r.revision,
      objectId: object.id,
    });
    object = f.store.workspace(source.actor).objects[0];
    denied(
      () =>
        f.store.updateRequest(source.actor, r.id, {
          revision: current.revision,
          justifications: { [r.requirements[0].id]: "Não tenho" },
        }),
      422,
    );
    denied(
      () =>
        f.store.share(
          source.actor,
          object.id,
          shareInput(object, buyer.actor.user.email, {
            requestId: r.id,
            requestRevision: current.revision,
          }),
        ),
      422,
      "MISSING_REQUIREMENTS",
    );
    upload(f.store, source.actor, object, {
      requirementId: r.requirements[0].id,
    });
    current = f.store.updateRequest(source.actor, r.id, {
      revision: current.revision,
      justifications: {
        [r.requirements[1].id]: "Medição não aplicável ao contexto.",
      },
    });
    object = f.store.workspace(source.actor).objects[0];
    const sent = f.store.share(
      source.actor,
      object.id,
      shareInput(object, buyer.actor.user.email, {
        requestId: r.id,
        requestRevision: current.revision,
      }),
    );
    assert.equal(
      sent.version.request?.justifications[r.requirements[1].id],
      "Medição não aplicável ao contexto.",
    );
    const clarification = f.store.clarify(buyer.actor, r.id, {
      requirementId: r.requirements[1].id,
      question: "Explique a quantidade informada.",
    });
    current = f.store.updateRequest(source.actor, r.id, {
      revision: clarification.revision,
      clarificationId: clarification.clarifications[0].id,
      response: "A quantidade é declarada pelo operador.",
    });
    assert.equal(current.clarifications[0].status, "open");
    object = f.store.workspace(source.actor).objects[0];
    const corrected = f.store.share(
      source.actor,
      object.id,
      shareInput(object, buyer.actor.user.email, {
        key: "correction",
        requestId: r.id,
        requestRevision: current.revision,
      }),
    );
    assert.equal(corrected.version.number, 2);
    assert.equal(
      f.store.workspace(source.actor).requests[0].clarifications[0].status,
      "responded",
    );
    assert.equal(
      f.store.received(buyer.actor, sent.share.id).version.request
        ?.clarifications.length,
      0,
    );
  } finally {
    f.cleanup();
  }
});

test("contributor invitation scopes workspace and files, editor cannot share, and revocation ends sessions", () => {
  const f = setup();
  try {
    const a = f.register("a@example.com");
    const first = complete(f.store, a.actor);
    const second = complete(f.store, a.actor);
    const secret = upload(f.store, a.actor, second);
    const inv = f.store.invite(a.actor, {
      email: "collab@example.com",
      role: "contributor",
      objectId: first.id,
    });
    const token = f.store.acceptInvitation(
      inv.token,
      { name: "Técnico", password },
      "",
    );
    const contributor = f.store.session(token);
    assert.deepEqual(
      f.store.workspace(contributor).objects.map((o) => o.id),
      [first.id],
    );
    assert.equal(f.store.workspace(contributor).members.length, 0);
    denied(() => f.store.download(contributor, secret.id), 403);
    denied(
      () =>
        f.store.createObject(contributor, {
          kind: "lot",
          fields: first.fields,
        }),
      403,
    );
    denied(
      () =>
        f.store.share(
          contributor,
          first.id,
          shareInput(first, "buyer@example.com"),
        ),
      403,
    );
    upload(f.store, contributor, first);
    denied(
      () =>
        f.store.acceptInvitation(inv.token, { name: "Again", password }, ""),
      410,
    );
    const editorInv = f.store.invite(a.actor, {
      email: "editor@example.com",
      role: "editor",
    });
    const editor = f.store.session(
      f.store.acceptInvitation(
        editorInv.token,
        { name: "Editor", password },
        "",
      ),
    );
    denied(
      () =>
        f.store.share(editor, first.id, shareInput(first, "buyer@example.com")),
      403,
    );
    denied(
      () => f.store.invite(editor, { email: "new@example.com", role: "admin" }),
      403,
    );
    f.store.updateMember(a.actor, contributor.membership.id, { active: false });
    denied(() => f.store.session(token), 401);
    const unused = f.store.invite(a.actor, {
      email: "unused@example.com",
      role: "reader",
    });
    f.store.revokeInvitation(a.actor, unused.id);
    denied(() => f.store.previewInvitation(unused.token), 410);
  } finally {
    f.cleanup();
  }
});

test("invalid uploads and malformed production do not persist partial changes", () => {
  const f = setup();
  try {
    const a = f.register("a@example.com");
    const object = complete(f.store, a.actor);
    denied(
      () => upload(f.store, a.actor, object, { mime: "application/pdf" }),
      422,
      "INVALID_FILE",
    );
    denied(
      () => upload(f.store, a.actor, object, { requirementId: "foreign" }),
      422,
      "INVALID_REQUIREMENT",
    );
    denied(
      () =>
        f.store.updateObject(a.actor, object.id, {
          revision: 1,
          fields: { ...object.fields, quantity: "-3" },
        }),
      422,
    );
    denied(
      () =>
        f.store.updateObject(a.actor, object.id, {
          revision: 1,
          fields: { ...object.fields, periodEnd: "2025-01-01" },
        }),
      422,
    );
    assert.equal(f.store.workspace(a.actor).objects[0].revision, 1);
    assert.equal(f.store.workspace(a.actor).evidence.length, 0);
    assert.equal(
      new AssetsStore(f.path).workspace(a.actor).objects[0].revision,
      1,
    );
  } finally {
    f.cleanup();
  }
});

test("demo creates isolated examples and never mixes with real organizations", () => {
  const f = setup();
  try {
    const first = f.store.session(f.store.demo());
    const second = f.store.session(f.store.demo());
    assert.notEqual(first.organization.id, second.organization.id);
    assert.equal(first.organization.demo, true);
    const real = f.register("real@example.com");
    assert.equal(f.store.workspace(real.actor).objects.length, 0);
    const object = f.store
      .workspace(first)
      .objects.find((o) => o.fields.quantity)!;
    denied(
      () =>
        f.store.share(
          first,
          object.id,
          shareInput(object, real.actor.user.email),
        ),
      422,
      "RECIPIENT_UNAVAILABLE",
    );
  } finally {
    f.cleanup();
  }
});

test("bulk import is atomic and idempotent, export is scoped, and upload retries do not duplicate files", () => {
  const f = setup();
  try {
    const a = f.register("a@example.com");
    const b = f.register("b@example.com");
    const row = {
      ...blankFields,
      name: "Importado",
      responsible: "Marina",
      location: "Itabirito",
      material: "Cobre",
      quantity: "5",
      periodStart: "2026-09-01",
      periodEnd: "2026-09-02",
    };
    denied(
      () =>
        f.store.importLots(a.actor, {
          key: "batch",
          rows: [row, { ...row, quantity: "-4" }],
        }),
      422,
    );
    assert.equal(f.store.workspace(a.actor).objects.length, 0);
    const imported = f.store.importLots(a.actor, {
      key: "batch",
      rows: [row, { ...row, name: "Segundo lote" }],
    });
    assert.equal(imported.count, 2);
    assert.deepEqual(
      f.store.importLots(a.actor, {
        key: "batch",
        rows: [row, { ...row, name: "Segundo lote" }],
      }).objectIds,
      imported.objectIds,
    );
    denied(
      () => f.store.importLots(a.actor, { key: "batch", rows: [row] }),
      409,
      "IDEMPOTENCY_CONFLICT",
    );
    let object = f.store.workspace(a.actor).objects[0];
    const file = upload(f.store, a.actor, object);
    assert.equal(upload(f.store, a.actor, object).id, file.id);
    assert.equal(f.store.workspace(a.actor).evidence.length, 1);
    object = f.store.workspace(a.actor).objects[0];
    const shared = f.store.share(
      a.actor,
      object.id,
      shareInput(object, b.actor.user.email),
    );
    assert.equal(
      f.store.exportVersion(a.actor, object.id, shared.version.id).version.id,
      shared.version.id,
    );
    denied(
      () => f.store.exportVersion(b.actor, object.id, shared.version.id),
      404,
    );
  } finally {
    f.cleanup();
  }
});

test("membership switching checks ownership and recipient selection cannot silently choose another organization", () => {
  const f = setup();
  try {
    const sender = f.register("sender@example.com");
    const receiver = f.register("receiver@example.com");
    const third = f.register("third@example.com");
    const invitation = f.store.invite(third.actor, {
      email: receiver.actor.user.email,
      role: "reader",
    });
    denied(
      () => f.store.acceptInvitation(invitation.token, {}, sender.token),
      403,
      "WRONG_ACCOUNT",
    );
    const switchedToken = f.store.acceptInvitation(
      invitation.token,
      {},
      receiver.token,
    );
    const joined = f.store.session(switchedToken);
    assert.equal(joined.organization.id, third.actor.organization.id);
    assert.equal(f.store.workspace(joined).organizations.length, 2);
    denied(
      () =>
        f.store.switchOrganization(sender.actor, third.actor.organization.id),
      403,
    );
    const restored = f.store.session(
      f.store.switchOrganization(joined, receiver.actor.organization.id),
    );
    assert.equal(restored.organization.id, receiver.actor.organization.id);
    const object = complete(f.store, sender.actor);
    denied(
      () =>
        f.store.share(
          sender.actor,
          object.id,
          shareInput(object, receiver.actor.user.email),
        ),
      422,
      "RECIPIENT_AMBIGUOUS",
    );
    const sent = f.store.share(
      sender.actor,
      object.id,
      shareInput(object, receiver.actor.user.email, {
        recipientId: third.actor.organization.id,
      }),
    );
    assert.equal(sent.share.recipientId, third.actor.organization.id);
    denied(() => f.store.received(restored, sent.share.id), 404);
    assert.equal(
      f.store.received(joined, sent.share.id).version.id,
      sent.version.id,
    );
  } finally {
    f.cleanup();
  }
});
