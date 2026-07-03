import React, { useEffect, useRef, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { FullDemoModal, type FullDemoStep } from "../components/demo/FullDemoModal";
import { PageHeader } from "../components/layout/PageHeader";
import { computeSealForArtifact, createArtifact, processBatch } from "../lib/api";
import {
  buildMarketplaceDemoUrl,
  createFullDemoState,
  FULL_DEMO_ASSET_ID,
  writeFullDemoState,
} from "../lib/fullDemo";
import type { CarbonCreditType } from "../lib/types";
import "./capture.css";

const CARBON_TYPES: CarbonCreditType[] = [
  "VCU", "VCS", "GoldStandard", "CER", "REDD+", "ARR",
  "RenewableEnergy", "Biomass", "Wind", "Solar", "PCH", "IREC",
];

const DEMO_CARBON_PRESET: FormState = {
  assetId: FULL_DEMO_ASSET_ID,
  category: "carbon_credit",
  operator: "Amazonia Conservation Ltda. (fictional)",
  site: "Amazon REDD+ Zone A — fictional",
  lat: -3.12,
  lng: -60.01,
  capturedAtISO: "2026-06-20T10:00:00.000Z",
  creditType: "VCS",
  tonnesCO2e: 125000,
  vintage: "2024",
  methodology: "REDD+",
  projectId: "VCS-12345",
  verifier: "Verra",
};

const CAPTURE_DEMO_STEPS: FullDemoStep[] = [
  {
    label: "Preset carbon proof",
    detail: "Load the fictional VCS Amazonia carbon credit with global coordinates and registry metadata.",
  },
  {
    label: "Generate passport + SHA-256 seal",
    detail: "Compute the deterministic proof packet the verifier and agents will read.",
  },
  {
    label: "Submit + autonomous agent",
    detail: "Create the artifact, run the Grok LLM path with rule fallback, and attest the Valid seal.",
  },
  {
    label: "Return to Marketplace",
    detail: "Open the x402 agent-query flow, then emit the MintGate demo event.",
  },
];

const FULL_DEMO_FRAME_HASH = "a1b2c3d4e5f67890123456789abcdef0123456789abcdef0123456789abcdef0";
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

interface FormState {
  assetId: string;
  category: "mineral" | "carbon_credit";
  operator: string;
  site: string;
  lat: number;
  lng: number;
  capturedAtISO: string;
  // mineral
  mineral?: string;
  mineralType?: string;
  massGrams?: number;
  // carbon
  creditType?: CarbonCreditType;
  tonnesCO2e?: number;
  vintage?: string;
  methodology?: string;
  projectId?: string;
  verifier?: string;
}

export function Capture() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [form, setForm] = useState<FormState>({
    assetId: `USER-${Date.now().toString().slice(-6)}`,
    category: "carbon_credit",
    operator: "User Capture (fictional)",
    site: "Captured Site",
    lat: -3.12,
    lng: -60.01,
    capturedAtISO: new Date().toISOString(),
    creditType: "VCS",
    tonnesCO2e: 45000,
    vintage: "2025",
    methodology: "REDD+ / ARR",
  });

  const [photoDataUrl, setPhotoDataUrl] = useState<string | null>(null);
  const [frameHash, setFrameHash] = useState<string>("");
  const [sealResult, setSealResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [autoResult, setAutoResult] = useState<{ verdict: string; action: string; decidedBy: string } | null>(null);
  const [fullDemoOpen, setFullDemoOpen] = useState(false);
  const [fullDemoStep, setFullDemoStep] = useState(0);
  const [fullDemoStatus, setFullDemoStatus] = useState("");

  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const fullDemoStartedRef = useRef(false);

  const update = (patch: Partial<FormState>) => setForm((f) => ({ ...f, ...patch }));

  function applyDemoCarbonPreset() {
    setForm({ ...DEMO_CARBON_PRESET });
    setFrameHash(FULL_DEMO_FRAME_HASH);
    setSealResult(null);
    setAutoResult(null);
    setMessage("Loaded fictional Valid carbon preset. Generate passport to compute the matching SHA-256 seal.");
  }

  function buildArtifact(source: FormState = form, sourceFrameHash = frameHash) {
    const artifact: any = {
      assetId: source.assetId,
      category: source.category,
      origin: { lat: source.lat, lng: source.lng, site: source.site },
      frameHash: sourceFrameHash || "simulated-frame-" + Date.now().toString(36),
      capturedAtISO: source.capturedAtISO,
      operator: source.operator,
    };

    if (source.category === "mineral") {
      artifact.massGrams = source.massGrams || 100000;
      artifact.mineral = source.mineral || "Gold";
      artifact.mineralType = source.mineralType || "Ore";
    } else {
      artifact.tonnesCO2e = source.tonnesCO2e || 50000;
      artifact.creditType = source.creditType;
      artifact.vintage = source.vintage;
      artifact.methodology = source.methodology;
      artifact.projectId = source.projectId;
      artifact.verifier = source.verifier || "Verra";
    }

    return artifact;
  }

  useEffect(() => {
    if (searchParams.get("demo") !== "full" || fullDemoStartedRef.current) return;
    fullDemoStartedRef.current = true;
    void runFullDemoCaptureFlow(searchParams.get("assetId") || FULL_DEMO_ASSET_ID);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  async function startCamera() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
      }
      setMessage("Camera active — point at document/certificate and capture.");
    } catch (e) {
      setMessage("Camera access denied or unavailable. Use file upload instead.");
    }
  }

  function stopCamera() {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop());
      streamRef.current = null;
    }
    if (videoRef.current) videoRef.current.srcObject = null;
  }

  async function capturePhoto() {
    const video = videoRef.current;
    if (!video) return;

    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;
    const ctx = canvas.getContext("2d")!;
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const dataUrl = canvas.toDataURL("image/jpeg", 0.8);
    setPhotoDataUrl(dataUrl);

    // Simple frameHash simulation (in real would hash bytes)
    const hash = await simpleHash(dataUrl);
    setFrameHash(hash);

    stopCamera();
    setMessage("Photo captured. Fill details and generate passport.");
  }

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (ev) => {
      const dataUrl = ev.target?.result as string;
      setPhotoDataUrl(dataUrl);
      const hash = await simpleHash(dataUrl);
      setFrameHash(hash);
      setMessage("Document uploaded. Generate passport.");
    };
    reader.readAsDataURL(file);
  }

  async function simpleHash(str: string): Promise<string> {
    const encoder = new TextEncoder();
    const data = encoder.encode(str.slice(0, 500)); // limit
    const hashBuffer = await crypto.subtle.digest("SHA-256", data);
    return Array.from(new Uint8Array(hashBuffer))
      .map(b => b.toString(16).padStart(2, "0"))
      .join("");
  }

  async function generatePassport() {
    setLoading(true);
    setMessage("");
    setSealResult(null);
    const artifact = buildArtifact();

    try {
      const res = await computeSealForArtifact(artifact);
      setSealResult({ artifact, ...res });
      setMessage("Passport generated. Seal computed locally via edge-style process.");
    } catch (e: any) {
      setMessage("Error generating seal: " + (e.message || e));
    } finally {
      setLoading(false);
    }
  }

  async function runFullDemoCaptureFlow(assetId: string) {
    const preset = { ...DEMO_CARBON_PRESET, assetId };
    setFullDemoOpen(true);
    setFullDemoStep(0);
    setFullDemoStatus("Preparing carbon preset…");
    setLoading(true);
    setAutoResult(null);
    setMessage("Full demo started: Capture → Agent → Marketplace → x402 → MintGate.");

    try {
      writeFullDemoState(createFullDemoState("capture", new Date(), assetId));
      setForm(preset);
      setFrameHash(FULL_DEMO_FRAME_HASH);
      await delay(700);

      setFullDemoStep(1);
      setFullDemoStatus("Generating passport and cryptographic seal…");
      const artifact = buildArtifact(preset, FULL_DEMO_FRAME_HASH);
      const seal = await computeSealForArtifact(artifact);
      setSealResult({ artifact, ...seal });
      setMessage("Passport generated. Full demo is submitting to the agent now.");
      await delay(850);

      setFullDemoStep(2);
      setFullDemoStatus("Submitting artifact and letting the Grok LLM path decide action…");
      await createArtifact(artifact);
      let batch = await processBatch([assetId], "llm");
      let record = batch.records?.find((r: any) => r.assetId === assetId) ?? batch.records?.[0] ?? null;
      let verdict = record?.verification?.verdict ?? record?.onChain?.verdict ?? "Unverified";

      // Demo reliability guardrail: the LLM decides action only. If a provider
      // answers conservatively in live demo conditions, run the deterministic
      // rule fallback so the canonical Valid carbon proof still reaches x402.
      if (verdict !== "Valid") {
        batch = await processBatch([assetId], "rule");
        record = batch.records?.find((r: any) => r.assetId === assetId) ?? batch.records?.[0] ?? record;
        verdict = record?.verification?.verdict ?? record?.onChain?.verdict ?? verdict;
      }

      const action = record?.decision?.action ?? "—";
      const decidedBy = record?.decision?.decidedBy ?? "llm";
      setAutoResult({ verdict, action, decidedBy });
      setMessage(`Artifact submitted. Agent (${decidedBy}) chose "${action}". Status: ${verdict}.`);
      await delay(1000);

      setFullDemoStep(3);
      setFullDemoStatus("Opening Marketplace for paid x402 proof query…");
      writeFullDemoState(createFullDemoState("marketplace", new Date(), assetId));
      await delay(650);
      navigate(buildMarketplaceDemoUrl(assetId));
    } catch (error) {
      setFullDemoStatus(`Full demo stopped: ${error instanceof Error ? error.message : "unknown error"}`);
      setMessage("Full demo stopped. You can run the manual Capture flow below.");
    } finally {
      setLoading(false);
    }
  }

  // Autonomous loop: submit → agent auto-processes → verdict surfaced inline.
  async function submitToApp(decider: "rule" | "llm" = "rule") {
    if (!sealResult) {
      setMessage("Generate passport first.");
      return;
    }
    setLoading(true);
    setAutoResult(null);
    setMessage(decider === "llm" ? "Submitting + letting the Grok agent decide fully…" : "Submitting + auto-processing through the agent…");
    try {
      await createArtifact(sealResult.artifact);
      const assetId = sealResult.artifact.assetId;
      let record: any = null;
      try {
        const batch = await processBatch([assetId], decider);
        record = batch.records?.find((r: any) => r.assetId === assetId) ?? batch.records?.[0] ?? null;
      } catch {
        /* processing is best-effort in the demo loop */
      }

      const verdict = record?.verification?.verdict ?? record?.onChain?.verdict ?? "Unverified";
      const action = record?.decision?.action ?? "—";
      const decidedBy = record?.decision?.decidedBy ?? decider;
      setAutoResult({ verdict, action, decidedBy });

      const verdictMsg =
        verdict === "Valid"
          ? "Status: Valid — ready for Marketplace + Claim."
          : verdict === "Invalid"
            ? "Status: Invalid — recorded as tamper evidence (proof, not error)."
            : "Status: Unverified — open Process to attest.";
      setMessage(`Artifact submitted. Agent (${decidedBy}) chose "${action}". ${verdictMsg}`);
      setTimeout(() => navigate("/marketplace"), 1800);
    } catch (e: any) {
      setMessage("Submit failed: " + e.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="page capture-page">
      <PageHeader
        kicker="Provenance Capture"
        title="New Artifact + Passport"
        lead="Use camera or upload a document. Simulate offline edge AI parsing. Generate SHA-256 passport instantly. Works for minerals and all carbon credit types."
        actions={<Link className="route-cta route-cta--ghost" to="/lots">Back to Lots</Link>}
      />

      <FullDemoModal
        open={fullDemoOpen}
        assetId={form.assetId}
        steps={CAPTURE_DEMO_STEPS}
        activeStep={fullDemoStep}
        status={fullDemoStatus}
        onClose={() => setFullDemoOpen(false)}
      />

      <div className="capture-layout">
        {/* Form */}
        <section className="panel capture-form">
          <h3>1. Details</h3>
          <div className="form-grid">
            <label>
              Category
              <select value={form.category} onChange={e => update({ category: e.target.value as any })}>
                <option value="mineral">Mineral</option>
                <option value="carbon_credit">Carbon Credit</option>
              </select>
            </label>

            <label>
              Asset ID
              <input value={form.assetId} onChange={e => update({ assetId: e.target.value })} />
              <button type="button" className="btn small" style={{marginTop:4}} onClick={applyDemoCarbonPreset}>Use demo Valid carbon</button>
            </label>

            <label>
              Operator
              <input value={form.operator} onChange={e => update({ operator: e.target.value })} />
            </label>

            <label>
              Site / Project
              <input value={form.site} onChange={e => update({ site: e.target.value })} />
            </label>

            <label>
              Lat
              <input type="number" step="0.000001" value={form.lat} onChange={e => update({ lat: parseFloat(e.target.value) })} />
            </label>
            <label>
              Lng
              <input type="number" step="0.000001" value={form.lng} onChange={e => update({ lng: parseFloat(e.target.value) })} />
            </label>

            <label>
              Captured ISO
              <input value={form.capturedAtISO} onChange={e => update({ capturedAtISO: e.target.value })} />
            </label>

            {form.category === "mineral" ? (
              <>
                <label>Mass (g) <input type="number" value={form.massGrams || 100000} onChange={e => update({ massGrams: parseInt(e.target.value) })} /></label>
                <label>Mineral <input value={form.mineral || ""} onChange={e => update({ mineral: e.target.value })} /></label>
              </>
            ) : (
              <>
                <label>Tonnes CO₂e <input type="number" value={form.tonnesCO2e || 45000} onChange={e => update({ tonnesCO2e: parseInt(e.target.value) })} /></label>
                <label>Credit Type
                  <select value={form.creditType} onChange={e => update({ creditType: e.target.value as any })}>
                    {CARBON_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </label>
                <label>Vintage <input value={form.vintage || ""} onChange={e => update({ vintage: e.target.value })} /></label>
                <label>Methodology <input value={form.methodology || ""} onChange={e => update({ methodology: e.target.value })} /></label>
                <label>Verifier <input value={form.verifier || ""} onChange={e => update({ verifier: e.target.value })} /></label>
              </>
            )}
          </div>

          <div className="actions">
            <button onClick={generatePassport} disabled={loading}>Generate Passport + Seal</button>
            {sealResult && (
              <>
                <button className="secondary" onClick={() => submitToApp("rule")} disabled={loading}>
                  Submit + Auto-process
                </button>
                <button className="secondary" onClick={() => submitToApp("llm")} disabled={loading}>
                  Let Agent decide fully (Grok LLM)
                </button>
              </>
            )}
          </div>
          {message && <p className="capture-msg">{message}</p>}
          {autoResult && (
            <div className={`auto-loop-result auto-loop-result--${autoResult.verdict.toLowerCase()}`} role="status">
              <span className="mono small">Autonomous loop</span>
              <div className="auto-loop-steps">
                <span>Agent action: <strong>{autoResult.action}</strong></span>
                <span>Decided by: <strong>{autoResult.decidedBy}</strong></span>
                <span>Seal verdict: <strong>{autoResult.verdict}</strong></span>
              </div>
              <p className="small muted">Capture → seal → agent action → verdict, with no extra manual step. Redirecting to Marketplace…</p>
            </div>
          )}
        </section>

        {/* Camera / Upload */}
        <section className="panel capture-media">
          <h3>2. Capture Document (Camera or File)</h3>
          <div className="media-controls">
            <button onClick={startCamera}>Start Camera</button>
            <button onClick={capturePhoto} disabled={!streamRef.current}>Capture Photo</button>
            <label className="file-label">
              Upload File
              <input type="file" accept="image/*,.pdf" onChange={handleFile} />
            </label>
            <button onClick={stopCamera} className="secondary">Stop Camera</button>
          </div>

          <div className="media-preview">
            {photoDataUrl ? (
              <img src={photoDataUrl} alt="Captured document" className="preview-img" />
            ) : (
              <video ref={videoRef} autoPlay playsInline className="preview-video" />
            )}
          </div>
          {frameHash && <div className="mono small">Frame hash: {frameHash.slice(0, 16)}…</div>}
        </section>

        {/* Passport Preview */}
        {sealResult && (
          <section className="panel passport-preview">
            <h3>3. Passport + Seal (offline edge-style)</h3>
            <div className="passport-card">
              <div className="passport-header">
                <strong>LASTRO PROOF PASSPORT</strong>
                <span className="badge">{sealResult.artifact.category}</span>
              </div>
              <div className="passport-body">
                <div><strong>ID:</strong> {sealResult.artifact.assetId}</div>
                <div><strong>Seal (SHA-256):</strong> <code className="seal">{sealResult.seal}</code></div>
                {sealResult.artifact.tonnesCO2e && <div><strong>tCO₂e:</strong> {sealResult.artifact.tonnesCO2e}</div>}
                {sealResult.artifact.massGrams && <div><strong>Mass:</strong> {sealResult.artifact.massGrams} g</div>}
              </div>
              <div className="passport-footer">Deterministic. Verifiable. Proof before token.</div>
            </div>
            <p className="small">Seal matches exactly what on-chain verification will use.</p>
          </section>
        )}
      </div>

      <p className="footer-note">All data fictional. Camera works in modern browsers over HTTPS or localhost.</p>
    </div>
  );
}
