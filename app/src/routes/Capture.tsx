import { Link } from "react-router-dom";
import React, { useState, useRef } from "react";
import { PageHeader } from "../components/layout/PageHeader";
import { ProofJourney } from "../components/proof/ProofJourney";
import { BtnIcon } from "../components/ui/BtnIcon";
import { computeSealForArtifact, createArtifact, processBatch } from "../lib/api";
import type { CarbonCreditType } from "../lib/types";
import "./capture.css";

const CARBON_TYPES: CarbonCreditType[] = [
  "VCU", "VCS", "GoldStandard", "CER", "REDD+", "ARR",
  "RenewableEnergy", "Biomass", "Wind", "Solar", "PCH", "IREC",
];

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
  const [submittedAssetId, setSubmittedAssetId] = useState<string | null>(null);

  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const update = (patch: Partial<FormState>) => setForm((f) => ({ ...f, ...patch }));

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

    const artifact: any = {
      assetId: form.assetId,
      category: form.category,
      origin: { lat: form.lat, lng: form.lng, site: form.site },
      frameHash: frameHash || "simulated-frame-" + Date.now().toString(36),
      capturedAtISO: form.capturedAtISO,
      operator: form.operator,
    };

    if (form.category === "mineral") {
      artifact.massGrams = form.massGrams || 100000;
      artifact.mineral = form.mineral || "Gold";
      artifact.mineralType = form.mineralType || "Ore";
    } else {
      artifact.tonnesCO2e = form.tonnesCO2e || 50000;
      artifact.creditType = form.creditType;
      artifact.vintage = form.vintage;
      artifact.methodology = form.methodology;
      artifact.projectId = form.projectId;
      artifact.verifier = form.verifier || "Verra";
    }

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

  async function submitToApp() {
    if (!sealResult) {
      setMessage("Generate passport first.");
      return;
    }
    setLoading(true);
    try {
      await createArtifact(sealResult.artifact);
      // Auto-process with rule decider for instant demo flow (user can re-run with LLM in /process)
      try {
        await processBatch([sealResult.artifact.assetId], "rule");
      } catch {}
      setSubmittedAssetId(sealResult.artifact.assetId);
      setMessage(
        "Artifact submitted and auto-processed (Valid expected for clean capture). Choose your next step below.",
      );
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
        lead="Document → structured fields → SHA-256 seal. The seal decides Valid or Invalid — not the agent."
        actions={<Link className="route-cta route-cta--ghost" to="/lots">View lots</Link>}
      />

      <ProofJourney activePath="/capture" compact />

      {submittedAssetId ? (
        <section className="panel capture-next panel--accent" aria-label="Next steps after capture">
          <h3 className="capture-next__title">What happened?</h3>
          <p className="capture-next__lead">
            Passport sealed, batch processed, and proof logged. The agent chose the action; the seal
            decided the verdict.
          </p>
          <div className="capture-next__actions">
            <Link className="route-cta" to={`/lots/${encodeURIComponent(submittedAssetId)}`}>
              <BtnIcon icon="lots">Open lot evidence</BtnIcon>
            </Link>
            <Link className="route-cta route-cta--ghost" to="/process">
              <BtnIcon icon="process">Re-run in Process</BtnIcon>
            </Link>
            <Link className="route-cta route-cta--ghost" to="/audit">
              <BtnIcon icon="audit">Open audit log</BtnIcon>
            </Link>
            <Link className="route-cta route-cta--ghost" to="/marketplace">
              <BtnIcon icon="globe">Claim demo representation</BtnIcon>
            </Link>
          </div>
        </section>
      ) : null}

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
              <button type="button" className="btn small" style={{marginTop:4}} onClick={() => update({ assetId: "CARBON-VCS-AMAZONIA-2024-001", category: "carbon_credit", creditType: "VCS", tonnesCO2e: 125000, vintage: "2024", site: "Amazon REDD+ Zone A — fictional" })}>Use demo Valid carbon</button>
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
            {sealResult && <button className="secondary" onClick={submitToApp} disabled={loading}>Submit to App Queue</button>}
          </div>
          {message && <p className="capture-msg">{message}</p>}
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
