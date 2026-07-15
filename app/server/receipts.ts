/**
 * 2-hop receipt composition (vs pure tool cascades).
 *
 * Hop 0: external tool_receipt (parent)
 * Hop 1: lastre_receipt (child) — only if parent is Valid-compatible and
 *         Lastre verdict is Valid. Invalid aborts the next hop (kill-switch).
 */

import { createHash, randomUUID } from "node:crypto";

export type ReceiptKind = "tool_receipt" | "lastre_receipt";

export type CompositionReceipt = {
  id: string;
  kind: ReceiptKind;
  parentId: string | null;
  assetId: string;
  /** Optional payment / tool tx id */
  payTx: string | null;
  verdict: "Valid" | "Invalid" | "Unknown" | "Aborted";
  sealMatch: boolean | null;
  note: string;
  createdAt: string;
  /** Optional merkle-style root of id chain for off-chain anchoring */
  chainRoot: string;
};

export type ComposeResult =
  | { ok: true; parent: CompositionReceipt; child: CompositionReceipt; graph: CompositionReceipt[] }
  | { ok: false; reason: string; parent?: CompositionReceipt; aborted?: CompositionReceipt };

function rootFor(ids: string[]): string {
  return createHash("sha256").update(ids.join("|")).digest("hex");
}

export class ReceiptStore {
  private readonly byId = new Map<string, CompositionReceipt>();

  list(): CompositionReceipt[] {
    return [...this.byId.values()].sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
  }

  get(id: string): CompositionReceipt | undefined {
    return this.byId.get(id);
  }

  /** Hop 0 — external tool acknowledges work on an asset. */
  createToolReceipt(input: {
    assetId: string;
    payTx?: string | null;
    note?: string;
  }): CompositionReceipt {
    const id = `tool-${randomUUID()}`;
    const receipt: CompositionReceipt = {
      id,
      kind: "tool_receipt",
      parentId: null,
      assetId: input.assetId,
      payTx: input.payTx ?? null,
      verdict: "Unknown",
      sealMatch: null,
      note: input.note ?? "External tool hop (pre-Lastre).",
      createdAt: new Date().toISOString(),
      chainRoot: rootFor([id]),
    };
    this.byId.set(id, receipt);
    return receipt;
  }

  /**
   * Hop 1 — Lastre composes on a tool receipt.
   * Kill-switch: if lastreVerdict is Invalid, child is Aborted and no further hop should proceed.
   */
  composeLastreHop(input: {
    parentId: string;
    assetId: string;
    lastreVerdict: "Valid" | "Invalid";
    sealMatch: boolean;
    payTx?: string | null;
  }): ComposeResult {
    const parent = this.byId.get(input.parentId);
    if (!parent) {
      return { ok: false, reason: "parent_not_found" };
    }
    if (parent.kind !== "tool_receipt") {
      return { ok: false, reason: "parent_must_be_tool_receipt", parent };
    }
    if (parent.assetId !== input.assetId) {
      return { ok: false, reason: "asset_id_mismatch", parent };
    }

    const id = `lastre-${randomUUID()}`;

    if (input.lastreVerdict === "Invalid") {
      const aborted: CompositionReceipt = {
        id,
        kind: "lastre_receipt",
        parentId: parent.id,
        assetId: input.assetId,
        payTx: input.payTx ?? null,
        verdict: "Aborted",
        sealMatch: input.sealMatch,
        note: "Kill-switch: Invalid seal aborts composition hop. Downstream tools must not proceed.",
        createdAt: new Date().toISOString(),
        chainRoot: rootFor([parent.id, id, "aborted"]),
      };
      this.byId.set(id, aborted);
      return { ok: false, reason: "invalid_aborts_hop", parent, aborted };
    }

    const child: CompositionReceipt = {
      id,
      kind: "lastre_receipt",
      parentId: parent.id,
      assetId: input.assetId,
      payTx: input.payTx ?? null,
      verdict: "Valid",
      sealMatch: input.sealMatch,
      note: "Lastre hop: Valid proof — composition may continue.",
      createdAt: new Date().toISOString(),
      chainRoot: rootFor([parent.id, id, "valid"]),
    };
    this.byId.set(id, child);
    return { ok: true, parent, child, graph: [parent, child] };
  }

  /** Seed a demo 2-hop graph for judges. */
  seedDemoGraph(assetId: string): { parent: CompositionReceipt; child: CompositionReceipt } {
    const parent = this.createToolReceipt({
      assetId,
      payTx: "tool-pay-demo-001",
      note: "Demo hop-0: external measurement tool receipt.",
    });
    const composed = this.composeLastreHop({
      parentId: parent.id,
      assetId,
      lastreVerdict: "Valid",
      sealMatch: true,
      payTx: "27461bd7d679dfd970dadb195f46a8513f53a916b01643c6f5b6beee1b3f199c",
    });
    if (!composed.ok) {
      throw new Error("demo seed compose failed");
    }
    return { parent: composed.parent, child: composed.child };
  }
}
