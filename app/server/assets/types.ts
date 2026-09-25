export type Role = "admin" | "editor" | "sender" | "reader" | "contributor";
export type ObjectKind = "asset" | "lot";
export type Category = "area" | "right" | "project" | "equipment" | "lot";
export type Sector = "mineral" | "energy" | "environment" | "recycling";
export interface User {
  id: string;
  name: string;
  email: string;
}
export interface Organization {
  id: string;
  name: string;
  demo: boolean;
  createdAt: string;
}
export interface Member {
  id: string;
  userId: string;
  organizationId: string;
  role: Role;
  objectId?: string;
  active: boolean;
}
export interface Fields {
  name: string;
  category: Category;
  sector: Sector;
  material: string;
  quantity: string;
  unit: string;
  location: string;
  responsible: string;
  periodStart: string;
  periodEnd: string;
  originId: string;
  description: string;
  registration: string;
  area: string;
}
export interface Evidence {
  id: string;
  objectId: string;
  organizationId: string;
  name: string;
  mime: string;
  size: number;
  digest: string;
  author: string;
  source: string;
  issuedAt: string;
  uploadedAt: string;
  requirementId: string;
  supersedes?: string;
}
export interface DossierObject {
  id: string;
  organizationId: string;
  kind: ObjectKind;
  fields: Fields;
  revision: number;
  status: "draft" | "ready" | "archived";
  evidenceIds: string[];
  createdAt: string;
  updatedAt: string;
}
export interface Requirement {
  id: string;
  label: string;
  description: string;
  required: boolean;
  allowJustification: boolean;
}
export interface Clarification {
  id: string;
  requirementId: string;
  question: string;
  author: string;
  createdAt: string;
  response: string;
  status: "open" | "responded" | "resolved";
}
export interface InformationRequest {
  id: string;
  organizationId: string;
  requesterId: string;
  requesterName: string;
  requesterEmail: string;
  title: string;
  purpose: string;
  dueAt: string;
  objectId: string;
  requirements: Requirement[];
  templateVersion: string;
  justifications: Record<string, string>;
  clarifications: Clarification[];
  status: "open" | "responded";
  revision: number;
  createdAt: string;
}
export interface Verification {
  id: string;
  method: string;
  methodVersion: string;
  status: "completed" | "unavailable";
  result: "consistent" | "divergent" | "inconclusive";
  scope: string;
  limitation: string;
  checkedAt: string;
  evidenceId?: string;
}
export interface Snapshot {
  request?: Pick<
    InformationRequest,
    | "id"
    | "title"
    | "purpose"
    | "templateVersion"
    | "requirements"
    | "justifications"
    | "clarifications"
  >;
  id: string;
  objectId: string;
  organizationId: string;
  number: number;
  revision: number;
  fields: Fields;
  evidence: Evidence[];
  author: string;
  createdAt: string;
  verifications: Verification[];
}
export interface Share {
  id: string;
  organizationId: string;
  recipientId: string;
  recipientName: string;
  recipientEmail: string;
  purpose: string;
  versionId: string;
  objectId: string;
  requestId: string;
  expiresAt: string;
  revokedAt: string | null;
  createdAt: string;
  receipt: string;
  key: string;
  allowDownload: boolean;
}
export interface Activity {
  id: string;
  organizationId: string;
  objectId: string;
  actor: string;
  message: string;
  createdAt: string;
  versionId?: string;
}
export interface Invitation {
  id: string;
  organizationId: string;
  email: string;
  role: Role;
  objectId?: string;
  expiresAt: string;
  acceptedAt: string | null;
  revokedAt: string | null;
  tokenHash: string;
}
export interface Notification {
  id: string;
  organizationId: string;
  objectId: string;
  title: string;
  href: string;
  createdAt: string;
  readBy: string[];
}
export interface Workspace {
  organizations: { id: string; name: string; role: Role }[];
  user: User;
  organization: Organization;
  membership: Member;
  members: (Member & { name: string; email: string })[];
  objects: DossierObject[];
  evidence: Evidence[];
  requests: InformationRequest[];
  versions: Snapshot[];
  shares: Share[];
  received: (Share & { objectName: string; senderName: string })[];
  activity: Activity[];
  notifications: Notification[];
  invitations: Omit<Invitation, "tokenHash">[];
}
export interface Session {
  user: User;
  organization: Organization;
  membership: Member;
}
