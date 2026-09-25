import {
  createHash,
  randomBytes,
  randomUUID,
  scryptSync,
  timingSafeEqual,
} from "node:crypto";
import {
  existsSync,
  mkdirSync,
  readFileSync,
  renameSync,
  writeFileSync,
} from "node:fs";
import { dirname } from "node:path";
import type {
  Activity,
  DossierObject,
  Evidence,
  Fields,
  InformationRequest,
  Invitation,
  Member,
  Notification,
  Organization,
  Role,
  Session,
  Share,
  Snapshot,
  User,
  Workspace,
} from "./types.js";

type Account = User & { passwordHash: string; salt: string };
type StoredSession = {
  hash: string;
  userId: string;
  organizationId: string;
  expiresAt: string;
};
type Database = {
  imports?: {
    key: string;
    organizationId: string;
    digest: string;
    objectIds: string[];
  }[];
  schema: 1;
  accounts: Account[];
  organizations: Organization[];
  members: Member[];
  sessions: StoredSession[];
  objects: DossierObject[];
  evidence: (Evidence & { content: string })[];
  requests: InformationRequest[];
  versions: Snapshot[];
  shares: Share[];
  activity: Activity[];
  invitations: Invitation[];
  notifications: Notification[];
};
export class AssetsError extends Error {
  constructor(
    public status: number,
    public code: string,
    message: string,
  ) {
    super(message);
  }
}
const fail = (status: number, code: string, message: string): never => {
  throw new AssetsError(status, code, message);
};
const id = (prefix: string) => `${prefix}_${randomUUID()}`;
const now = () => new Date().toISOString();
const hash = (value: string | Buffer) =>
  createHash("sha256").update(value).digest("hex");
const roles: Role[] = ["admin", "editor", "sender", "reader", "contributor"];
export const blankFields: Fields = {
  name: "",
  category: "lot",
  sector: "mineral",
  material: "",
  quantity: "",
  unit: "t",
  location: "",
  responsible: "",
  periodStart: "",
  periodEnd: "",
  originId: "",
  description: "",
  registration: "",
  area: "",
};
const empty = (): Database => ({
  schema: 1,
  accounts: [],
  organizations: [],
  members: [],
  sessions: [],
  objects: [],
  evidence: [],
  requests: [],
  versions: [],
  shares: [],
  activity: [],
  invitations: [],
  notifications: [],
});
const cleanEmail = (value: unknown) => {
  const email = text(value, "E-mail", 254).toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
    fail(422, "INVALID_EMAIL", "Informe um e-mail válido.");
  return email;
};
function text(
  value: unknown,
  label: string,
  max = 4000,
  required = true,
): string {
  if (
    typeof value !== "string" ||
    value.length > max ||
    (required && !value.trim())
  )
    return fail(422, "INVALID_INPUT", `${label}: confira o preenchimento.`);
  return value.trim();
}
function date(value: unknown, label: string, optional = false): string {
  if (optional && !value) return "";
  const result = text(value, label, 40);
  if (!Number.isFinite(Date.parse(result)))
    fail(422, "INVALID_DATE", `${label}: informe uma data válida.`);
  return result;
}
function publicUser(account: Account): User {
  return { id: account.id, name: account.name, email: account.email };
}
function metadata({
  content: _content,
  ...evidence
}: Database["evidence"][number]): Evidence {
  return evidence;
}
function activeShare(share: Share) {
  return !share.revokedAt && Date.parse(share.expiresAt) > Date.now();
}
export function requiredFields(object: DossierObject): string[] {
  const f = object.fields;
  const missing: string[] = [];
  if (!f.name) missing.push("Identificação");
  if (!f.responsible) missing.push("Responsável");
  if (!f.location) missing.push("Localização");
  if (object.kind === "lot") {
    if (!f.material) missing.push("Material ou produção");
    if (!(Number(f.quantity) > 0)) missing.push("Quantidade maior que zero");
    if (!f.unit) missing.push("Unidade");
    if (!f.periodStart || !f.periodEnd) missing.push("Período da produção");
  }
  if (f.category === "right" && !f.registration)
    missing.push("Referência do direito");
  return missing;
}

/** Single-process local persistence. Atomic replacement; failed mutations never publish state. */
export class AssetsStore {
  private db: Database;
  constructor(private file: string) {
    this.db = existsSync(file)
      ? (JSON.parse(readFileSync(file, "utf8")) as Database)
      : empty();
    if (this.db.schema !== 1) throw new Error("Unsupported Assets data schema");
  }
  private write<T>(mutate: () => T): T {
    const before = this.db;
    this.db = structuredClone(before);
    try {
      const result = mutate();
      mkdirSync(dirname(this.file), { recursive: true, mode: 0o700 });
      const tmp = `${this.file}.${randomUUID()}.tmp`;
      writeFileSync(tmp, JSON.stringify(this.db), { mode: 0o600 });
      renameSync(tmp, this.file);
      return structuredClone(result);
    } catch (error) {
      this.db = before;
      throw error;
    }
  }
  private event(
    actor: Session,
    objectId: string,
    message: string,
    versionId?: string,
  ) {
    this.db.activity.unshift({
      id: id("event"),
      organizationId: actor.organization.id,
      objectId,
      actor: actor.user.name,
      message,
      createdAt: now(),
      versionId,
    });
  }
  private notify(
    organizationId: string,
    objectId: string,
    title: string,
    href: string,
  ) {
    this.db.notifications.unshift({
      id: id("notice"),
      organizationId,
      objectId,
      title,
      href,
      createdAt: now(),
      readBy: [],
    });
  }
  private account(
    name: unknown,
    emailValue: unknown,
    password: unknown,
  ): Account {
    const email = cleanEmail(emailValue);
    if (this.db.accounts.some((a) => a.email === email))
      fail(
        409,
        "EMAIL_IN_USE",
        "Este e-mail já possui uma conta. Entre para continuar.",
      );
    const pass = text(password, "Senha", 128);
    if (pass.length < 10)
      fail(422, "WEAK_PASSWORD", "Use uma senha com pelo menos 10 caracteres.");
    const salt = randomBytes(16).toString("hex");
    const account = {
      id: id("user"),
      name: text(name, "Nome", 120),
      email,
      salt,
      passwordHash: scryptSync(pass, salt, 64).toString("hex"),
    };
    this.db.accounts.push(account);
    return account;
  }
  private newSession(userId: string, organizationId: string): string {
    const token = randomBytes(32).toString("hex");
    this.db.sessions = this.db.sessions.filter(
      (s) => Date.parse(s.expiresAt) > Date.now(),
    );
    this.db.sessions.push({
      hash: hash(token),
      userId,
      organizationId,
      expiresAt: new Date(Date.now() + 7 * 86400000).toISOString(),
    });
    return token;
  }
  session(token: string): Session {
    const stored = this.db.sessions.find(
      (s) => s.hash === hash(token) && Date.parse(s.expiresAt) > Date.now(),
    );
    if (!stored)
      return fail(401, "SESSION_EXPIRED", "Entre na sua conta para continuar.");
    const account = this.db.accounts.find((a) => a.id === stored.userId)!;
    const membership = this.db.members.find(
      (m) =>
        m.userId === account.id &&
        m.organizationId === stored.organizationId &&
        m.active,
    );
    if (!membership)
      return fail(
        401,
        "ACCESS_ENDED",
        "Sua participação nesta organização foi encerrada.",
      );
    return structuredClone({
      user: publicUser(account),
      organization: this.db.organizations.find(
        (o) => o.id === membership.organizationId,
      )!,
      membership,
    });
  }
  register(input: Record<string, unknown>): string {
    return this.write(() => {
      const account = this.account(input.name, input.email, input.password);
      const org = {
        id: id("org"),
        name: text(input.organization, "Organização", 160),
        demo: false,
        createdAt: now(),
      };
      this.db.organizations.push(org);
      this.db.members.push({
        id: id("member"),
        organizationId: org.id,
        userId: account.id,
        role: "admin",
        active: true,
      });
      return this.newSession(account.id, org.id);
    });
  }
  login(input: Record<string, unknown>): string {
    const email = cleanEmail(input.email);
    const pass = text(input.password, "Senha", 128);
    const account = this.db.accounts.find((a) => a.email === email);
    const candidate = scryptSync(
      pass,
      account?.salt ?? "nonexistent-account",
      64,
    );
    if (
      !account ||
      !timingSafeEqual(candidate, Buffer.from(account.passwordHash, "hex"))
    )
      return fail(401, "INVALID_LOGIN", "E-mail ou senha incorretos.");
    const member = this.db.members.find(
      (m) => m.userId === account.id && m.active,
    );
    if (!member)
      return fail(
        403,
        "NO_MEMBERSHIP",
        "Sua conta não tem uma participação ativa.",
      );
    return this.write(() => this.newSession(account.id, member.organizationId));
  }
  logout(token: string) {
    return this.write(() => {
      this.db.sessions = this.db.sessions.filter((s) => s.hash !== hash(token));
      return { ok: true };
    });
  }
  private authorize(actor: Session, allowed: Role[], objectId?: string) {
    const m = this.db.members.find(
      (m) =>
        m.id === actor.membership.id &&
        m.active &&
        m.organizationId === actor.organization.id &&
        m.userId === actor.user.id,
    );
    if (
      !m ||
      !allowed.includes(m.role) ||
      (m.role === "contributor" && (!objectId || m.objectId !== objectId))
    )
      fail(403, "FORBIDDEN", "Seu papel não permite esta ação neste cadastro.");
  }
  private object(actor: Session, objectId: string): DossierObject {
    this.authorize(actor, roles, objectId);
    const object = this.db.objects.find(
      (o) => o.id === objectId && o.organizationId === actor.organization.id,
    );
    if (!object)
      return fail(
        404,
        "NOT_FOUND",
        "Cadastro não encontrado ou acesso indisponível.",
      );
    return object;
  }
  private editable(
    actor: Session,
    objectId: string,
    revision: unknown,
  ): DossierObject {
    const object = this.object(actor, objectId);
    this.authorize(
      actor,
      ["admin", "editor", "sender", "contributor"],
      objectId,
    );
    if (object.status === "archived")
      fail(409, "ARCHIVED", "Restaure este cadastro antes de editar.");
    if (revision !== object.revision)
      fail(
        409,
        "STALE_REVISION",
        "O cadastro mudou desde que você abriu esta página. Seus campos foram preservados. Recarregue os dados antes de confirmar.",
      );
    return object;
  }
  private touch(object: DossierObject) {
    object.revision += 1;
    object.updatedAt = now();
    object.status = "draft";
  }
  workspace(actor: Session): Workspace {
    const orgId = actor.organization.id;
    const scoped = actor.membership.role === "contributor";
    const objects = this.db.objects.filter(
      (o) =>
        o.organizationId === orgId &&
        (!scoped || o.id === actor.membership.objectId),
    );
    const ids = new Set(objects.map((o) => o.id));
    return structuredClone({
      ...actor,
      organizations: this.db.members
        .filter((m) => m.userId === actor.user.id && m.active)
        .map((m) => ({
          id: m.organizationId,
          name: this.db.organizations.find((o) => o.id === m.organizationId)!
            .name,
          role: m.role,
        })),
      objects,
      evidence: this.db.evidence
        .filter((e) => ids.has(e.objectId))
        .map(metadata),
      requests: this.db.requests.filter(
        (r) => r.organizationId === orgId && (!scoped || ids.has(r.objectId)),
      ),
      versions: this.db.versions.filter((v) => ids.has(v.objectId)),
      shares: scoped
        ? []
        : this.db.shares.filter((s) => s.organizationId === orgId),
      received: scoped
        ? []
        : this.db.shares
            .filter((s) => s.recipientId === orgId)
            .map((s) => ({
              ...s,
              objectName: this.db.versions.find((v) => v.id === s.versionId)!
                .fields.name,
              senderName: this.db.organizations.find(
                (o) => o.id === s.organizationId,
              )!.name,
            })),
      activity: this.db.activity.filter(
        (e) => e.organizationId === orgId && (!scoped || ids.has(e.objectId)),
      ),
      notifications: this.db.notifications.filter(
        (n) => n.organizationId === orgId && (!scoped || ids.has(n.objectId)),
      ),
      members: scoped
        ? []
        : this.db.members
            .filter((m) => m.organizationId === orgId)
            .map((m) => {
              const u = this.db.accounts.find((u) => u.id === m.userId)!;
              return { ...m, name: u.name, email: u.email };
            }),
      invitations:
        actor.membership.role === "admin"
          ? this.db.invitations
              .filter((i) => i.organizationId === orgId)
              .map(({ tokenHash: _hash, ...i }) => i)
          : [],
    });
  }
  private fields(
    input: unknown,
    kind: "asset" | "lot",
    actor: Session,
  ): Fields {
    if (!input || typeof input !== "object" || Array.isArray(input))
      return fail(422, "INVALID_FIELDS", "Confira os campos do cadastro.");
    const raw = input as Record<string, unknown>;
    const fields = { ...blankFields };
    for (const key of Object.keys(blankFields) as (keyof Fields)[])
      (fields as Record<string, string>)[key] = text(
        raw[key] ?? "",
        key,
        key === "description" ? 4000 : 240,
        false,
      );
    if (
      !["mineral", "energy", "environment", "recycling"].includes(fields.sector)
    )
      fail(422, "INVALID_SECTOR", "Escolha um setor.");
    if (
      !(
        kind === "lot" ? ["lot"] : ["area", "right", "project", "equipment"]
      ).includes(fields.category)
    )
      fail(422, "INVALID_CATEGORY", "Escolha um tipo de cadastro compatível.");
    const units =
      fields.sector === "energy"
        ? ["MWh", "kWh"]
        : fields.sector === "environment"
          ? ["t", "m³", "ha"]
          : ["t", "kg", "m³"];
    if (!units.includes(fields.unit))
      fail(422, "INVALID_UNIT", "Escolha uma unidade compatível com o setor.");
    if (
      fields.quantity &&
      (!Number.isFinite(Number(fields.quantity)) ||
        Number(fields.quantity) <= 0)
    )
      fail(422, "INVALID_QUANTITY", "A quantidade deve ser maior que zero.");
    if (
      fields.area &&
      (!Number.isFinite(Number(fields.area)) || Number(fields.area) <= 0)
    )
      fail(422, "INVALID_AREA", "A área deve ser maior que zero.");
    if (fields.periodStart) date(fields.periodStart, "Início");
    if (fields.periodEnd) date(fields.periodEnd, "Fim");
    if (
      fields.periodStart &&
      fields.periodEnd &&
      fields.periodStart > fields.periodEnd
    )
      fail(
        422,
        "INVALID_PERIOD",
        "O fim do período deve ser posterior ao início.",
      );
    if (fields.originId) {
      const origin = this.object(actor, fields.originId);
      if (origin.kind !== "asset" || origin.status === "archived")
        fail(
          422,
          "INVALID_ORIGIN",
          "Associe um ativo disponível da sua organização.",
        );
    }
    return fields;
  }
  createObject(actor: Session, input: Record<string, unknown>) {
    return this.write(() => {
      this.authorize(actor, ["admin", "editor", "sender"]);
      if (!["asset", "lot"].includes(String(input.kind)))
        fail(422, "INVALID_KIND", "Escolha ativo ou lote.");
      const kind = input.kind as "asset" | "lot";
      const fields = this.fields(input.fields, kind, actor);
      const object: DossierObject = {
        id: id(kind),
        organizationId: actor.organization.id,
        kind,
        fields,
        revision: 1,
        status: "draft",
        evidenceIds: [],
        createdAt: now(),
        updatedAt: now(),
      };
      this.db.objects.unshift(object);
      this.event(actor, object.id, "Cadastro criado como rascunho.");
      if (input.requestId) {
        const request = this.request(actor, String(input.requestId));
        if (request.objectId)
          fail(
            409,
            "ALREADY_LINKED",
            "Esta solicitação já tem um cadastro associado.",
          );
        request.objectId = object.id;
        request.revision++;
      }
      return object;
    });
  }
  importLots(actor: Session, input: Record<string, unknown>) {
    return this.write(() => {
      this.authorize(actor, ["admin", "editor", "sender"]);
      const key = text(input.key, "Identificador da importação", 160);
      if (
        !Array.isArray(input.rows) ||
        input.rows.length < 1 ||
        input.rows.length > 100
      )
        return fail(
          422,
          "INVALID_IMPORT",
          "Importe entre 1 e 100 lotes por arquivo.",
        );
      const rows = input.rows.map((raw, index) => {
        try {
          const fields = this.fields(raw, "lot", actor);
          if (!fields.name)
            fail(422, "INVALID_INPUT", "Informe a identificação do lote.");
          return fields;
        } catch (error) {
          if (error instanceof AssetsError)
            throw new AssetsError(
              error.status,
              error.code,
              `Linha ${index + 2}: ${error.message}`,
            );
          throw error;
        }
      });
      const digest = hash(JSON.stringify(rows));
      const previous = this.db.imports?.find(
        (i) => i.organizationId === actor.organization.id && i.key === key,
      );
      if (previous) {
        if (previous.digest !== digest)
          return fail(
            409,
            "IDEMPOTENCY_CONFLICT",
            "Esta importação já foi usada com outro conteúdo.",
          );
        return {
          objectIds: previous.objectIds,
          count: previous.objectIds.length,
        };
      }
      const objects: DossierObject[] = rows.map((fields) => ({
        id: id("lot"),
        organizationId: actor.organization.id,
        kind: "lot",
        fields,
        revision: 1,
        status: "draft",
        evidenceIds: [],
        createdAt: now(),
        updatedAt: now(),
      }));
      this.db.objects.unshift(...objects);
      for (const object of objects)
        this.event(actor, object.id, "Lote importado como rascunho.");
      const receipt = {
        key,
        organizationId: actor.organization.id,
        digest,
        objectIds: objects.map((o) => o.id),
      };
      (this.db.imports ??= []).push(receipt);
      return { objectIds: receipt.objectIds, count: objects.length };
    });
  }
  exportVersion(actor: Session, objectId: string, versionId: string) {
    const object = this.object(actor, objectId);
    const version = this.db.versions.find(
      (v) => v.objectId === objectId && v.id === versionId,
    );
    if (!version) return fail(404, "NOT_FOUND", "Versão não encontrada.");
    this.write(() =>
      this.event(
        actor,
        objectId,
        `Resumo da versão ${version.number} exportado.`,
        versionId,
      ),
    );
    return structuredClone({
      product: "Lastre Assets",
      exportedAt: now(),
      organization: actor.organization.name,
      objectKind: object.kind,
      version,
      scope:
        "Resumo da versão enviada e metadados dos documentos. Não inclui os bytes dos arquivos nem comprova titularidade ou origem física.",
    });
  }
  updateObject(
    actor: Session,
    objectId: string,
    input: Record<string, unknown>,
  ) {
    return this.write(() => {
      const object = this.editable(actor, objectId, input.revision);
      object.fields = this.fields(input.fields, object.kind, actor);
      this.touch(object);
      this.event(
        actor,
        object.id,
        "Rascunho atualizado. Versões enviadas foram preservadas.",
      );
      return object;
    });
  }
  setStatus(actor: Session, objectId: string, input: Record<string, unknown>) {
    return this.write(() => {
      const object = this.object(actor, objectId);
      this.authorize(actor, ["admin", "editor", "sender"], objectId);
      if (object.revision !== input.revision)
        fail(
          409,
          "STALE_REVISION",
          "Atualize o cadastro antes de mudar sua situação.",
        );
      if (!["draft", "ready", "archived"].includes(String(input.status)))
        fail(422, "INVALID_STATUS", "Situação inválida.");
      if (input.status === "ready" && requiredFields(object).length)
        fail(
          422,
          "MISSING_FIELDS",
          `Complete: ${requiredFields(object).join(", ")}.`,
        );
      object.status = input.status as DossierObject["status"];
      object.revision++;
      object.updatedAt = now();
      this.event(
        actor,
        objectId,
        object.status === "archived"
          ? "Cadastro arquivado. O histórico permanece disponível."
          : object.status === "ready"
            ? "Cadastro preparado para revisão."
            : "Cadastro reaberto como rascunho.",
      );
      return object;
    });
  }
  upload(actor: Session, objectId: string, input: Record<string, unknown>) {
    return this.write(() => {
      const object = this.object(actor, objectId);
      this.authorize(
        actor,
        ["admin", "editor", "sender", "contributor"],
        objectId,
      );
      const mime = text(input.mime, "Formato", 120);
      if (
        !["application/pdf", "image/jpeg", "image/png", "text/plain"].includes(
          mime,
        )
      )
        fail(422, "INVALID_FORMAT", "Use PDF, JPG, PNG ou TXT.");
      const content = text(input.content, "Arquivo", 12 * 1024 * 1024);
      if (!/^[A-Za-z0-9+/]*={0,2}$/.test(content))
        fail(422, "INVALID_FILE", "Não foi possível ler o arquivo.");
      const bytes = Buffer.from(content, "base64");
      if (!bytes.length || bytes.length > 8 * 1024 * 1024)
        fail(
          422,
          "FILE_TOO_LARGE",
          "O arquivo deve ter conteúdo e no máximo 8 MB.",
        );
      if (
        (mime === "application/pdf" &&
          bytes.subarray(0, 5).toString() !== "%PDF-") ||
        (mime === "image/png" &&
          !bytes
            .subarray(0, 8)
            .equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]))) ||
        (mime === "image/jpeg" &&
          bytes.subarray(0, 3).toString("hex") !== "ffd8ff")
      )
        fail(
          422,
          "INVALID_FILE",
          "O conteúdo do arquivo não corresponde ao formato informado.",
        );
      const requirementId = text(
        input.requirementId ?? "",
        "Requisito",
        160,
        false,
      );
      if (
        requirementId &&
        !this.db.requests.some(
          (r) =>
            r.organizationId === actor.organization.id &&
            r.objectId === objectId &&
            r.requirements.some((q) => q.id === requirementId),
        )
      )
        fail(
          422,
          "INVALID_REQUIREMENT",
          "Este requisito não pertence ao cadastro.",
        );
      const digest = hash(bytes);
      const duplicate = this.db.evidence.find(
        (e) =>
          object.evidenceIds.includes(e.id) &&
          e.digest === digest &&
          e.requirementId === requirementId,
      );
      if (duplicate) return metadata(duplicate);
      this.editable(actor, objectId, input.revision);
      const supersedes =
        typeof input.supersedes === "string" ? input.supersedes : undefined;
      if (supersedes && !object.evidenceIds.includes(supersedes))
        fail(
          409,
          "INVALID_REPLACEMENT",
          "O documento a substituir não faz parte do rascunho.",
        );
      const evidence = {
        id: id("evidence"),
        objectId,
        organizationId: actor.organization.id,
        name: text(input.name, "Nome do arquivo", 240),
        mime,
        size: bytes.length,
        digest,
        content,
        author: actor.user.name,
        source: text(input.source, "Fonte do documento", 240),
        issuedAt: date(input.issuedAt, "Data de emissão", true),
        uploadedAt: now(),
        requirementId,
        supersedes,
      };
      this.db.evidence.push(evidence);
      object.evidenceIds = object.evidenceIds.filter((e) => e !== supersedes);
      object.evidenceIds.push(evidence.id);
      this.touch(object);
      this.event(
        actor,
        objectId,
        `${supersedes ? "Documento substituído" : "Documento anexado"}: ${evidence.name}.`,
      );
      return metadata(evidence);
    });
  }
  removeEvidence(
    actor: Session,
    objectId: string,
    evidenceId: string,
    revision: unknown,
  ) {
    return this.write(() => {
      const object = this.editable(actor, objectId, revision);
      if (!object.evidenceIds.includes(evidenceId))
        fail(404, "NOT_FOUND", "Documento não encontrado no rascunho.");
      object.evidenceIds = object.evidenceIds.filter((e) => e !== evidenceId);
      this.touch(object);
      this.event(
        actor,
        objectId,
        "Documento removido do rascunho. Versões enviadas foram preservadas.",
      );
      return object;
    });
  }
  private request(actor: Session, requestId: string) {
    const request = this.db.requests.find(
      (r) => r.id === requestId && r.organizationId === actor.organization.id,
    );
    if (!request) return fail(404, "NOT_FOUND", "Solicitação não encontrada.");
    this.authorize(actor, roles, request.objectId);
    return request;
  }
  updateRequest(
    actor: Session,
    requestId: string,
    input: Record<string, unknown>,
  ) {
    return this.write(() => {
      const request = this.request(actor, requestId);
      this.authorize(
        actor,
        ["admin", "editor", "sender", "contributor"],
        request.objectId,
      );
      if (input.revision !== request.revision)
        fail(
          409,
          "STALE_REVISION",
          "A solicitação foi atualizada. Recarregue antes de salvar sua resposta.",
        );
      if (input.objectId) {
        if (request.status === "responded")
          fail(
            409,
            "ALREADY_SENT",
            "Uma solicitação enviada mantém seu cadastro original.",
          );
        this.object(actor, String(input.objectId));
        request.objectId = String(input.objectId);
      }
      if (input.justifications && typeof input.justifications === "object") {
        for (const [key, value] of Object.entries(input.justifications)) {
          const requirement = request.requirements.find(
            (r) => r.id === key && r.allowJustification,
          );
          if (!requirement)
            fail(
              422,
              "EXCEPTION_NOT_ALLOWED",
              "Este requisito exige um documento.",
            );
          request.justifications[key] = text(
            value,
            "Justificativa",
            4000,
            false,
          );
        }
      }
      if (input.clarificationId) {
        const clarification = request.clarifications.find(
          (c) => c.id === input.clarificationId && c.status !== "resolved",
        );
        if (!clarification) fail(404, "NOT_FOUND", "Pendência não encontrada.");
        clarification!.response = text(input.response, "Resposta");
      }
      request.revision++;
      if (request.objectId) {
        const object = this.object(actor, request.objectId);
        if (object.status === "archived")
          fail(409, "ARCHIVED", "Restaure o cadastro antes de responder.");
        this.touch(object);
      }
      this.event(
        actor,
        request.objectId,
        "Resposta da solicitação salva para revisão.",
      );
      return request;
    });
  }
  share(actor: Session, objectId: string, input: Record<string, unknown>) {
    return this.write(() => {
      const object = this.object(actor, objectId);
      this.authorize(actor, ["admin", "sender"], objectId);
      const key = text(input.key, "Identificador de envio", 160);
      const email = cleanEmail(input.recipientEmail);
      const purpose = text(input.purpose, "Finalidade");
      const expiresAt = date(input.expiresAt, "Vigência");
      const requestId = text(input.requestId ?? "", "Solicitação", 160, false);
      const prior = this.db.shares.find(
        (s) => s.organizationId === actor.organization.id && s.key === key,
      );
      if (prior) {
        const version = this.db.versions.find((v) => v.id === prior.versionId)!;
        if (
          (input.recipientId && prior.recipientId !== input.recipientId) ||
          prior.objectId !== objectId ||
          prior.recipientEmail !== email ||
          prior.purpose !== purpose ||
          prior.expiresAt !== expiresAt ||
          prior.requestId !== requestId ||
          prior.allowDownload !== (input.allowDownload === true) ||
          version.revision !== input.revision
        )
          fail(
            409,
            "IDEMPOTENCY_CONFLICT",
            "Este identificador já foi usado em outro envio.",
          );
        return { share: prior, version };
      }
      if (object.status === "archived")
        fail(409, "ARCHIVED", "Restaure o cadastro antes de compartilhar.");
      if (object.revision !== input.revision)
        fail(
          409,
          "STALE_REVISION",
          "O conteúdo mudou durante a revisão. Atualize e confira a nova versão antes de enviar.",
        );
      if (Date.parse(expiresAt) <= Date.now())
        fail(
          422,
          "INVALID_EXPIRY",
          "A vigência deve terminar em uma data futura.",
        );
      const missing = requiredFields(object);
      if (missing.length)
        fail(
          422,
          "MISSING_FIELDS",
          `Complete antes de enviar: ${missing.join(", ")}.`,
        );
      const request = requestId ? this.request(actor, requestId) : undefined;
      if (
        request &&
        (request.objectId !== objectId ||
          request.revision !== input.requestRevision ||
          request.requesterEmail !== email ||
          request.purpose !== purpose)
      )
        fail(
          409,
          "REQUEST_CHANGED",
          "Confira o cadastro, destinatário e finalidade desta solicitação.",
        );
      const recipientAccount = this.db.accounts.find((a) => a.email === email);
      const candidates = this.db.members.filter(
        (m) =>
          m.userId === recipientAccount?.id &&
          m.active &&
          m.role !== "contributor" &&
          m.organizationId !== actor.organization.id &&
          this.db.organizations.find((o) => o.id === m.organizationId)?.demo ===
            actor.organization.demo,
      );
      if (!request && !input.recipientId && candidates.length > 1)
        fail(
          422,
          "RECIPIENT_AMBIGUOUS",
          "Este contato participa de mais de uma organização. Confira e selecione o destinatário.",
        );
      const recipientMember = candidates.find(
        (m) =>
          m.organizationId ===
          (request?.requesterId ??
            input.recipientId ??
            candidates[0]?.organizationId),
      );
      const recipient = request
        ? this.db.organizations.find((o) => o.id === request.requesterId)
        : this.db.organizations.find(
            (o) => o.id === recipientMember?.organizationId,
          );
      if (
        !recipient ||
        recipient.id === actor.organization.id ||
        recipient.demo !== actor.organization.demo
      )
        return fail(
          422,
          "RECIPIENT_UNAVAILABLE",
          "O destinatário precisa ter uma conta ativa em outra organização no mesmo ambiente.",
        );
      if (!actor.organization.demo && !recipientMember)
        fail(
          422,
          "RECIPIENT_UNAVAILABLE",
          "O destinatário precisa ter uma participação ativa.",
        );
      if (
        recipientMember &&
        request &&
        recipientMember.organizationId !== request.requesterId
      )
        fail(
          422,
          "RECIPIENT_UNAVAILABLE",
          "O destinatário não corresponde à organização solicitante.",
        );
      const evidence = object.evidenceIds.map(
        (eid) => this.db.evidence.find((e) => e.id === eid)!,
      );
      if (request) {
        const absent = request.requirements.filter(
          (q) =>
            q.required &&
            !evidence.some((e) => e.requirementId === q.id) &&
            !(q.allowJustification && request.justifications[q.id]?.trim()),
        );
        if (absent.length)
          fail(
            422,
            "MISSING_REQUIREMENTS",
            `Documentos pendentes: ${absent.map((q) => q.label).join(", ")}.`,
          );
        if (
          request.clarifications.some(
            (c) => c.status === "open" && !c.response.trim(),
          )
        )
          fail(
            422,
            "MISSING_RESPONSE",
            "Responda às pendências antes de enviar uma nova versão.",
          );
      }
      const createdAt = now();
      const version: Snapshot = {
        id: id("version"),
        objectId,
        organizationId: actor.organization.id,
        number:
          this.db.versions.filter((v) => v.objectId === objectId).length + 1,
        revision: object.revision,
        fields: structuredClone(object.fields),
        evidence: evidence.map(metadata),
        author: actor.user.name,
        createdAt,
        verifications: evidence.map((e) => ({
          id: id("check"),
          method: "Integridade do arquivo recebido",
          methodVersion: "sha256-v1",
          status: "completed",
          result:
            hash(Buffer.from(e.content, "base64")) === e.digest
              ? "consistent"
              : "divergent",
          scope: `Comparação dos bytes armazenados com o resumo registrado no upload de ${e.name}.`,
          limitation:
            "Não comprova a autoria, a veracidade do conteúdo, a titularidade ou a origem física.",
          checkedAt: createdAt,
          evidenceId: e.id,
        })),
      };
      if (request)
        version.request = structuredClone({
          id: request.id,
          title: request.title,
          purpose: request.purpose,
          templateVersion: request.templateVersion,
          requirements: request.requirements,
          justifications: request.justifications,
          clarifications: request.clarifications,
        });
      version.verifications.push({
        id: id("check"),
        method: "Origem e titularidade",
        methodVersion: "unavailable",
        status: "unavailable",
        result: "inconclusive",
        scope: "Não executada.",
        limitation:
          "Não há método integrado para comprovar origem física ou titularidade nesta versão.",
        checkedAt: createdAt,
      });
      const share: Share = {
        id: id("share"),
        organizationId: actor.organization.id,
        recipientId: recipient.id,
        recipientName: recipient.name,
        recipientEmail: email,
        purpose,
        versionId: version.id,
        objectId,
        requestId,
        expiresAt,
        revokedAt: null,
        createdAt,
        receipt: id("receipt"),
        key,
        allowDownload: input.allowDownload === true,
      };
      this.db.versions.unshift(version);
      this.db.shares.unshift(share);
      object.status = "ready";
      if (request) {
        request.status = "responded";
        request.revision++;
        request.clarifications.forEach((c) => {
          if (c.status === "open" && c.response.trim()) c.status = "responded";
        });
      }
      this.event(
        actor,
        objectId,
        `Versão ${version.number} compartilhada com ${recipient.name}.`,
        version.id,
      );
      this.notify(
        recipient.id,
        objectId,
        `Nova versão de ${object.fields.name}`,
        `/assets/recebidos/${share.id}`,
      );
      return { share, version };
    });
  }
  revokeShare(actor: Session, shareId: string) {
    return this.write(() => {
      this.authorize(actor, ["admin", "sender"]);
      const share = this.db.shares.find(
        (s) => s.id === shareId && s.organizationId === actor.organization.id,
      );
      if (!share)
        return fail(404, "NOT_FOUND", "Compartilhamento não encontrado.");
      if (!share.revokedAt) {
        share.revokedAt = now();
        this.event(
          actor,
          share.objectId,
          `Acesso de ${share.recipientName} revogado.`,
          share.versionId,
        );
        this.notify(
          share.recipientId,
          share.objectId,
          "O acesso a um dossiê foi encerrado.",
          `/assets/recebidos/${share.id}`,
        );
      }
      return share;
    });
  }
  received(actor: Session, shareId: string) {
    this.authorize(actor, ["admin", "editor", "sender", "reader"]);
    const share = this.db.shares.find(
      (s) => s.id === shareId && s.recipientId === actor.organization.id,
    );
    if (!share)
      return fail(404, "NOT_FOUND", "Compartilhamento não encontrado.");
    if (!activeShare(share))
      return fail(
        403,
        "ACCESS_ENDED",
        "O acesso a esta versão expirou ou foi revogado. Solicite uma nova concessão à organização responsável.",
      );
    const version = this.db.versions.find((v) => v.id === share.versionId)!;
    return structuredClone({
      share,
      version,
      sender: this.db.organizations.find((o) => o.id === share.organizationId)!
        .name,
    });
  }
  download(actor: Session, evidenceId: string, shareId?: string) {
    const evidence = this.db.evidence.find((e) => e.id === evidenceId);
    if (!evidence) return fail(404, "NOT_FOUND", "Documento indisponível.");
    if (shareId) {
      const { share, version } = this.received(actor, shareId);
      if (
        !share.allowDownload ||
        !version.evidence.some((e) => e.id === evidenceId)
      )
        return fail(
          403,
          "FORBIDDEN",
          "Este documento não está disponível para download neste compartilhamento.",
        );
    } else this.object(actor, evidence.objectId);
    this.write(() => {
      this.event(
        actor,
        evidence.objectId,
        `Download do documento ${evidence.name}.`,
      );
    });
    return {
      ...metadata(evidence),
      bytes: Buffer.from(evidence.content, "base64"),
    };
  }
  recipients(actor: Session, value: unknown) {
    this.authorize(actor, ["admin", "sender"]);
    const email = cleanEmail(value);
    const user = this.db.accounts.find((a) => a.email === email);
    return this.db.members
      .filter(
        (m) =>
          m.userId === user?.id &&
          m.active &&
          m.role !== "contributor" &&
          m.organizationId !== actor.organization.id,
      )
      .map((m) => this.db.organizations.find((o) => o.id === m.organizationId)!)
      .filter((o) => o.demo === actor.organization.demo)
      .map((o) => ({ id: o.id, name: o.name }));
  }
  switchOrganization(actor: Session, organizationId: string) {
    return this.write(() => {
      if (
        !this.db.members.some(
          (m) =>
            m.userId === actor.user.id &&
            m.organizationId === organizationId &&
            m.active,
        )
      )
        return fail(
          403,
          "FORBIDDEN",
          "Sua conta não participa desta organização.",
        );
      return this.newSession(actor.user.id, organizationId);
    });
  }
  updateOrganization(actor: Session, input: Record<string, unknown>) {
    return this.write(() => {
      this.authorize(actor, ["admin"]);
      const organization = this.db.organizations.find(
        (o) => o.id === actor.organization.id,
      )!;
      organization.name = text(input.name, "Organização", 160);
      this.event(actor, "", "Nome da organização atualizado.");
      return organization;
    });
  }
  invite(actor: Session, input: Record<string, unknown>) {
    return this.write(() => {
      this.authorize(actor, ["admin"]);
      const email = cleanEmail(input.email);
      if (!roles.includes(input.role as Role))
        fail(422, "INVALID_ROLE", "Escolha uma permissão válida.");
      const role = input.role as Role;
      const objectId =
        role === "contributor"
          ? text(input.objectId, "Cadastro do colaborador", 160)
          : undefined;
      if (objectId) this.object(actor, objectId);
      if (
        this.db.members.some(
          (m) =>
            m.organizationId === actor.organization.id &&
            m.active &&
            this.db.accounts.find((a) => a.id === m.userId)?.email === email,
        )
      )
        fail(409, "ALREADY_MEMBER", "Esta pessoa já participa da organização.");
      const token = randomBytes(32).toString("hex");
      const invitation: Invitation = {
        id: id("invite"),
        organizationId: actor.organization.id,
        email,
        role,
        objectId,
        expiresAt: new Date(Date.now() + 7 * 86400000).toISOString(),
        acceptedAt: null,
        revokedAt: null,
        tokenHash: hash(token),
      };
      this.db.invitations.push(invitation);
      this.event(actor, objectId ?? "", `Convite criado para ${email}.`);
      return { id: invitation.id, token, expiresAt: invitation.expiresAt };
    });
  }
  invitation(token: string) {
    const invitation = this.db.invitations.find(
      (i) => i.tokenHash === hash(token),
    );
    if (
      !invitation ||
      invitation.revokedAt ||
      invitation.acceptedAt ||
      Date.parse(invitation.expiresAt) <= Date.now()
    )
      return fail(
        410,
        "INVITE_ENDED",
        "Este convite expirou, foi utilizado ou revogado. Peça um novo convite.",
      );
    return {
      invitation,
      organization: this.db.organizations.find(
        (o) => o.id === invitation.organizationId,
      )!,
    };
  }
  previewInvitation(token: string) {
    const { invitation, organization } = this.invitation(token);
    return {
      organization: organization.name,
      email: invitation.email,
      role: invitation.role,
      objectName: this.db.objects.find((o) => o.id === invitation.objectId)
        ?.fields.name,
      expiresAt: invitation.expiresAt,
    };
  }
  acceptInvitation(
    token: string,
    input: Record<string, unknown>,
    sessionToken: string,
  ) {
    return this.write(() => {
      const { invitation } = this.invitation(token);
      let account = this.db.accounts.find((a) => a.email === invitation.email);
      if (account) {
        const actor = this.session(sessionToken);
        if (actor.user.id !== account.id)
          fail(
            403,
            "WRONG_ACCOUNT",
            "Entre com a conta que recebeu o convite.",
          );
      } else
        account = this.account(input.name, invitation.email, input.password);
      if (
        this.db.members.some(
          (m) =>
            m.userId === account!.id &&
            m.active &&
            m.organizationId === invitation.organizationId,
        )
      )
        fail(
          409,
          "ALREADY_MEMBER",
          "Sua conta já participa desta organização.",
        );
      this.db.members.push({
        id: id("member"),
        userId: account.id,
        organizationId: invitation.organizationId,
        role: invitation.role,
        objectId: invitation.objectId,
        active: true,
      });
      invitation.acceptedAt = now();
      return this.newSession(account.id, invitation.organizationId);
    });
  }
  revokeInvitation(actor: Session, invitationId: string) {
    return this.write(() => {
      this.authorize(actor, ["admin"]);
      const invitation = this.db.invitations.find(
        (i) =>
          i.id === invitationId && i.organizationId === actor.organization.id,
      );
      if (!invitation) return fail(404, "NOT_FOUND", "Convite não encontrado.");
      invitation.revokedAt = now();
      this.event(actor, invitation.objectId ?? "", "Convite revogado.");
      return { ok: true };
    });
  }
  updateMember(
    actor: Session,
    memberId: string,
    input: Record<string, unknown>,
  ) {
    return this.write(() => {
      this.authorize(actor, ["admin"]);
      const member = this.db.members.find(
        (m) => m.id === memberId && m.organizationId === actor.organization.id,
      );
      if (!member)
        return fail(404, "NOT_FOUND", "Participante não encontrado.");
      if (member.id === actor.membership.id)
        fail(
          422,
          "SELF_CHANGE",
          "Outro administrador deve alterar suas permissões.",
        );
      if (input.role !== undefined) {
        if (!roles.includes(input.role as Role))
          fail(422, "INVALID_ROLE", "Papel inválido.");
        if (input.role === "contributor") {
          const objectId = text(input.objectId, "Cadastro", 160);
          this.object(actor, objectId);
          member.objectId = objectId;
        } else delete member.objectId;
        member.role = input.role as Role;
      }
      if (typeof input.active === "boolean") member.active = input.active;
      this.event(
        actor,
        member.objectId ?? "",
        "Permissão de participante atualizada.",
      );
      return member;
    });
  }
  readNotification(actor: Session, notificationId: string) {
    return this.write(() => {
      const n = this.db.notifications.find(
        (n) =>
          n.id === notificationId && n.organizationId === actor.organization.id,
      );
      if (!n) return fail(404, "NOT_FOUND", "Notificação não encontrada.");
      this.authorize(actor, roles, n.objectId);
      if (!n.readBy.includes(actor.user.id)) n.readBy.push(actor.user.id);
      return { ok: true };
    });
  }
  // Product endpoint for the future Investors client. No email is sent implicitly.
  createRequest(actor: Session, input: Record<string, unknown>) {
    return this.write(() => {
      this.authorize(actor, ["admin", "sender"]);
      const email = cleanEmail(input.recipientEmail);
      const account = this.db.accounts.find((a) => a.email === email);
      const member = this.db.members.find(
        (m) => m.userId === account?.id && m.active && m.role !== "contributor",
      );
      const org = this.db.organizations.find(
        (o) => o.id === member?.organizationId,
      );
      if (
        !org ||
        org.id === actor.organization.id ||
        org.demo !== actor.organization.demo
      )
        return fail(
          422,
          "RECIPIENT_UNAVAILABLE",
          "Organização destinatária indisponível.",
        );
      if (
        !Array.isArray(input.requirements) ||
        !input.requirements.length ||
        input.requirements.length > 20
      )
        fail(422, "INVALID_REQUIREMENTS", "Inclua entre 1 e 20 requisitos.");
      const requirements = (
        input.requirements as Record<string, unknown>[]
      ).map((q) => ({
        id: id("requirement"),
        label: text(q.label, "Documento", 160),
        description: text(q.description, "Instrução"),
        required: q.required !== false,
        allowJustification: q.allowJustification === true,
      }));
      const request: InformationRequest = {
        id: id("request"),
        organizationId: org.id,
        requesterId: actor.organization.id,
        requesterName: actor.organization.name,
        requesterEmail: actor.user.email,
        title: text(input.title, "Título", 200),
        purpose: text(input.purpose, "Finalidade"),
        dueAt: date(input.dueAt, "Prazo", true),
        objectId: "",
        requirements,
        templateVersion: "documental-v1",
        justifications: {},
        clarifications: [],
        status: "open",
        revision: 1,
        createdAt: now(),
      };
      this.db.requests.unshift(request);
      this.notify(
        org.id,
        "",
        request.title,
        `/assets/solicitacoes/${request.id}`,
      );
      return request;
    });
  }
  clarify(actor: Session, requestId: string, input: Record<string, unknown>) {
    return this.write(() => {
      this.authorize(actor, ["admin", "sender"]);
      const request = this.db.requests.find(
        (r) => r.id === requestId && r.requesterId === actor.organization.id,
      );
      if (!request)
        return fail(404, "NOT_FOUND", "Solicitação não encontrada.");
      if (
        !this.db.shares.some(
          (s) =>
            s.requestId === requestId &&
            s.recipientId === actor.organization.id &&
            activeShare(s),
        )
      )
        fail(
          403,
          "ACCESS_ENDED",
          "É necessário ter acesso vigente à versão recebida.",
        );
      const requirementId = text(input.requirementId, "Requisito", 160);
      if (!request.requirements.some((r) => r.id === requirementId))
        fail(
          422,
          "INVALID_REQUIREMENT",
          "Requisito não encontrado nesta solicitação.",
        );
      request.clarifications.push({
        id: id("clarification"),
        requirementId,
        question: text(input.question, "Pergunta"),
        author: actor.user.name,
        createdAt: now(),
        response: "",
        status: "open",
      });
      request.status = "open";
      request.revision++;
      this.notify(
        request.organizationId,
        request.objectId,
        "Uma solicitação precisa de esclarecimento.",
        `/assets/solicitacoes/${request.id}`,
      );
      this.db.activity.unshift({
        id: id("event"),
        organizationId: request.organizationId,
        objectId: request.objectId,
        actor: actor.user.name,
        message: "Organização solicitante pediu esclarecimento.",
        createdAt: now(),
      });
      return request;
    });
  }
  demo(): string {
    return this.write(() => {
      const account = this.account(
        "Marina Costa",
        `demo-${randomUUID()}@lastre.example`,
        randomBytes(24).toString("hex"),
      );
      const org: Organization = {
        id: id("org"),
        name: "Serra Clara · demonstração",
        demo: true,
        createdAt: now(),
      };
      const buyer: Organization = {
        id: id("org"),
        name: "Horizonte Materiais · demonstração",
        demo: true,
        createdAt: now(),
      };
      this.db.organizations.push(org, buyer);
      const member: Member = {
        id: id("member"),
        userId: account.id,
        organizationId: org.id,
        role: "admin",
        active: true,
      };
      this.db.members.push(member);
      const actor: Session = {
        user: publicUser(account),
        organization: org,
        membership: member,
      };
      const asset: DossierObject = {
        id: id("asset"),
        organizationId: org.id,
        kind: "asset",
        fields: {
          ...blankFields,
          name: "Unidade Serra Clara",
          category: "area",
          location: "Itabirito, Minas Gerais",
          responsible: "Marina Costa",
          area: "128.4",
          description:
            "Área de operação usada como exemplo. Dados e documentos fictícios.",
        },
        revision: 1,
        status: "ready",
        evidenceIds: [],
        createdAt: now(),
        updatedAt: now(),
      };
      const lot: DossierObject = {
        id: id("lot"),
        organizationId: org.id,
        kind: "lot",
        fields: {
          ...blankFields,
          name: "Concentrado de cobre · SC-024",
          material: "Concentrado de cobre",
          quantity: "248.6",
          unit: "t",
          location: "Itabirito, Minas Gerais",
          responsible: "Marina Costa",
          periodStart: new Date().toISOString().slice(0, 10),
          periodEnd: new Date().toISOString().slice(0, 10),
          originId: asset.id,
        },
        revision: 1,
        status: "draft",
        evidenceIds: [],
        createdAt: now(),
        updatedAt: now(),
      };
      const draft: DossierObject = {
        ...structuredClone(lot),
        id: id("lot"),
        fields: {
          ...lot.fields,
          name: "Concentrado de cobre · SC-025",
          quantity: "",
          periodEnd: "",
        },
      };
      this.db.objects.push(asset, lot, draft);
      const requirementId = id("requirement");
      const request: InformationRequest = {
        id: id("request"),
        organizationId: org.id,
        requesterId: buyer.id,
        requesterName: buyer.name,
        requesterEmail: "analise@horizonte.example",
        title: "Documentação de origem · SC-024",
        purpose:
          "Análise documental da origem declarada do lote para qualificação de fornecimento.",
        dueAt: new Date(Date.now() + 5 * 86400000).toISOString().slice(0, 10),
        objectId: lot.id,
        requirements: [
          {
            id: requirementId,
            label: "Declaração de origem",
            description:
              "Documento que identifica o lote, a unidade de origem e o responsável pela declaração.",
            required: true,
            allowJustification: false,
          },
          {
            id: id("requirement"),
            label: "Relatório de medição",
            description:
              "Informe a quantidade, a unidade e o período a que se refere a medição. Se não for aplicável, justifique.",
            required: true,
            allowJustification: true,
          },
        ],
        templateVersion: "documental-v1",
        justifications: {},
        clarifications: [],
        status: "open",
        revision: 1,
        createdAt: now(),
      };
      const content = Buffer.from(
        "EXEMPLO FICTÍCIO — Declaração de origem\nLote SC-024. Serra Clara. Este documento serve apenas para explorar a interface.",
      ).toString("base64");
      const evidence = {
        id: id("evidence"),
        objectId: lot.id,
        organizationId: org.id,
        name: "declaracao-origem-exemplo.txt",
        mime: "text/plain",
        size: Buffer.from(content, "base64").length,
        content,
        digest: hash(Buffer.from(content, "base64")),
        author: "Marina Costa",
        source: "Exemplo fictício da Lastre",
        issuedAt: now().slice(0, 10),
        uploadedAt: now(),
        requirementId,
      };
      this.db.evidence.push(evidence);
      lot.evidenceIds.push(evidence.id);
      this.db.requests.push(request);
      this.event(
        actor,
        lot.id,
        "Ambiente de demonstração criado com dados fictícios.",
      );
      this.notify(
        org.id,
        lot.id,
        "Horizonte Materiais solicitou dois documentos.",
        `/assets/solicitacoes/${request.id}`,
      );
      return this.newSession(account.id, org.id);
    });
  }
}
