import { useCallback, useEffect, useId, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useNavigate } from "react-router-dom";
import { useLocaleContext } from "../../context/LocaleContext";
import { useOnboarding } from "../../context/OnboardingContext";
import {
  buildArtifactFromForm,
  CARBON_TYPES,
  defaultCaptureForm,
  DEMO_INVALID_CARBON_PATCH,
  DEMO_VALID_CARBON_PATCH,
  hashCaptureFrame,
  validateCaptureStep1,
  type CaptureFormState,
} from "../../lib/captureForm";
import { computeSealForArtifact, createArtifact, processBatch } from "../../lib/api";
import { formatArtifactFieldValue, getSealFieldDefs } from "../../lib/artifactFields";
import type { ProvenanceArtifact } from "../../lib/types";
import { BtnIcon } from "../ui/BtnIcon";
import { Icon } from "../ui/Icon";
import "./capture-wizard.css";

type CaptureWizardModalProps = {
  open: boolean;
  onClose: () => void;
};

type WizardStep = 1 | 2 | 3 | "success";

type SealResult = {
  artifact: ProvenanceArtifact;
  seal: string;
};

const STEPS = [1, 2, 3] as const;

export function CaptureWizardModal({ open, onClose }: CaptureWizardModalProps) {
  const { t } = useLocaleContext();
  const { persona } = useOnboarding();
  const navigate = useNavigate();
  const isOperatorDemo = persona === "operator";
  const titleId = useId();

  const [step, setStep] = useState<WizardStep>(1);
  const [form, setForm] = useState<CaptureFormState>(() => defaultCaptureForm(isOperatorDemo));
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [photoDataUrl, setPhotoDataUrl] = useState<string | null>(null);
  const [frameHash, setFrameHash] = useState("");
  const [cameraActive, setCameraActive] = useState(false);
  const [sealResult, setSealResult] = useState<SealResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [submittedAssetId, setSubmittedAssetId] = useState<string | null>(null);
  const [autoProcess, setAutoProcess] = useState(true);

  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const reset = useCallback(() => {
    setStep(1);
    setForm(defaultCaptureForm(isOperatorDemo));
    setErrors({});
    setPhotoDataUrl(null);
    setFrameHash("");
    setCameraActive(false);
    setSealResult(null);
    setLoading(false);
    setMessage("");
    setSubmittedAssetId(null);
    setAutoProcess(true);
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) videoRef.current.srcObject = null;
  }, [isOperatorDemo]);

  const handleClose = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    reset();
    onClose();
  }, [onClose, reset]);

  useEffect(() => {
    if (!open) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && step !== "success") handleClose();
    };

    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [open, handleClose, step]);

  useEffect(() => {
    if (!open) return;
    reset();
  }, [open, reset]);

  const update = (patch: Partial<CaptureFormState>) => {
    setForm((current) => ({ ...current, ...patch }));
    setErrors((current) => {
      const next = { ...current };
      for (const key of Object.keys(patch)) delete next[key];
      return next;
    });
  };

  async function startCamera() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
        setCameraActive(true);
      }
      setMessage(t("capture.wizard.cameraActive"));
    } catch {
      setMessage(t("capture.wizard.cameraDenied"));
    }
  }

  function stopCamera() {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) videoRef.current.srcObject = null;
    setCameraActive(false);
  }

  async function capturePhoto() {
    const video = videoRef.current;
    if (!video) return;

    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const dataUrl = canvas.toDataURL("image/jpeg", 0.8);
    setPhotoDataUrl(dataUrl);
    setFrameHash(await hashCaptureFrame(dataUrl));
    stopCamera();
    setMessage(t("capture.wizard.photoCaptured"));
  }

  async function handleFile(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (ev) => {
      const dataUrl = ev.target?.result as string;
      setPhotoDataUrl(dataUrl);
      setFrameHash(await hashCaptureFrame(dataUrl));
      setMessage(t("capture.wizard.documentUploaded"));
    };
    reader.readAsDataURL(file);
  }

  async function generatePassport() {
    setLoading(true);
    setMessage("");
    setSealResult(null);

    const artifact = buildArtifactFromForm(form, frameHash);

    try {
      const res = await computeSealForArtifact(artifact);
      setSealResult({ artifact: artifact as ProvenanceArtifact, seal: res.seal });
      setMessage(t("capture.wizard.passportReady"));
    } catch (e: unknown) {
      const err = e as { message?: string };
      setMessage(t("capture.wizard.sealError", { message: err.message ?? String(e) }));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (step === 3 && !sealResult && !loading && !submittedAssetId) {
      void generatePassport();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- generate on step entry only
  }, [step]);

  function goNext() {
    if (step === 1) {
      const nextErrors = validateCaptureStep1(form);
      if (Object.keys(nextErrors).length > 0) {
        setErrors(nextErrors);
        return;
      }
      setStep(2);
      setMessage("");
      return;
    }

    if (step === 2) {
      if (!photoDataUrl && !frameHash) {
        setMessage(t("capture.wizard.needDocument"));
        return;
      }
      setStep(3);
      setMessage("");
    }
  }

  function goBack() {
    if (step === 2) setStep(1);
    if (step === 3) setStep(2);
    setMessage("");
  }

  async function submitToApp() {
    if (!sealResult) {
      setMessage(t("capture.wizard.generateFirst"));
      return;
    }
    setLoading(true);
    try {
      await createArtifact(sealResult.artifact);
      if (autoProcess) {
        try {
          await processBatch([sealResult.artifact.assetId], "rule");
        } catch {
          /* demo flow */
        }
      }
      setSubmittedAssetId(sealResult.artifact.assetId);
      setStep("success");
      setMessage("");
    } catch (e: unknown) {
      const err = e as { message?: string };
      setMessage(t("capture.wizard.submitError", { message: err.message ?? String(e) }));
    } finally {
      setLoading(false);
    }
  }

  function openLotDetail() {
    if (!submittedAssetId) return;
    handleClose();
    navigate(`/lots/${encodeURIComponent(submittedAssetId)}`);
  }

  const errorMessages: Record<string, string> = {
    required: t("capture.wizard.error.required"),
    range: t("capture.wizard.error.range"),
    positive: t("capture.wizard.error.positive"),
  };

  function fieldError(key: string) {
    if (!errors[key]) return null;
    return errorMessages[errors[key]] ?? errors[key];
  }

  if (!open) return null;

  const sealFields = sealResult ? getSealFieldDefs(sealResult.artifact) : [];
  const stepIndex = step === "success" ? 3 : step;

  function stepLabel(n: (typeof STEPS)[number]) {
    if (n === 1) return t("capture.wizard.step1.label");
    if (n === 2) return t("capture.wizard.step2.label");
    return t("capture.wizard.step3.label");
  }

  return createPortal(
    <div className="capture-wizard-overlay" onClick={handleClose} role="presentation">
      <div
        className="capture-wizard"
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        onClick={(event) => event.stopPropagation()}
      >
        <header className="capture-wizard__header">
          <div className="capture-wizard__intro">
            <p className="capture-wizard__kicker mono-label">{t("capture.wizard.kicker")}</p>
            <h2 className="capture-wizard__title" id={titleId}>
              {t("capture.wizard.title")}
            </h2>
          </div>
          <button
            type="button"
            className="capture-wizard__close"
            onClick={handleClose}
            aria-label={t("capture.wizard.close")}
          >
            ×
          </button>
        </header>

        <div className={`capture-wizard__shell${step === "success" ? " capture-wizard__shell--success" : ""}`}>
          {step !== "success" ? (
            <nav className="capture-wizard__rail" aria-label={t("capture.wizard.stepperAria")}>
              <ol className="capture-wizard__stepper">
                {STEPS.map((n, index) => {
                  const done = stepIndex > n;
                  const active = stepIndex === n;
                  return (
                    <li
                      key={n}
                      className={`capture-wizard__step${active ? " capture-wizard__step--active" : ""}${done ? " capture-wizard__step--done" : ""}`}
                      aria-current={active ? "step" : undefined}
                    >
                      <div className="capture-wizard__step-track">
                        <span className="capture-wizard__step-marker" aria-hidden="true">
                          {done ? <Icon name="check" size={12} /> : n}
                        </span>
                        {index < STEPS.length - 1 ? (
                          <span
                            className={`capture-wizard__connector${done ? " capture-wizard__connector--done" : ""}`}
                            aria-hidden="true"
                          />
                        ) : null}
                      </div>
                      <span className="capture-wizard__step-copy">
                        <span className="capture-wizard__step-label">{stepLabel(n)}</span>
                      </span>
                    </li>
                  );
                })}
              </ol>
            </nav>
          ) : null}

          <div className="capture-wizard__main">
            <div className="capture-wizard__body">
          {step !== "success" ? (
            <header className="capture-wizard__step-hero">
              <p className="capture-wizard__step-eyebrow mono-label">
                {t("capture.wizard.progress", { current: stepIndex, total: 3 })}
              </p>
              <h3 className="capture-wizard__step-title">
                {stepIndex === 1
                  ? t("capture.wizard.step1.heading")
                  : stepIndex === 2
                    ? t("capture.wizard.step2.heading")
                    : t("capture.wizard.step3.heading")}
              </h3>
              <p className="capture-wizard__step-lead">
                {stepIndex === 1
                  ? t("capture.wizard.step1.hint")
                  : stepIndex === 2
                    ? t("capture.wizard.step2.hint")
                    : t("capture.wizard.step3.hint")}
              </p>
            </header>
          ) : null}
          {step === 1 ? (
            <section className="capture-wizard__panel" aria-labelledby="capture-step-1">
              <div className="capture-wizard__section capture-wizard__section--accent">
                <header className="capture-wizard__section-head">
                  <h4 id="capture-step-1" className="capture-wizard__section-title">
                    {t("capture.wizard.section.quickStart")}
                  </h4>
                  <p className="capture-wizard__section-hint">
                    {t("capture.wizard.section.quickStartHint")}
                  </p>
                </header>
                <div className="capture-wizard__presets">
                  <button
                    type="button"
                    className="capture-wizard__preset"
                    onClick={() => update(DEMO_VALID_CARBON_PATCH)}
                  >
                    {t("capture.wizard.presetValid")}
                  </button>
                  <button
                    type="button"
                    className="capture-wizard__preset capture-wizard__preset--warn"
                    onClick={() => update(DEMO_INVALID_CARBON_PATCH)}
                  >
                    {t("capture.wizard.presetInvalid")}
                  </button>
                </div>
              </div>

              <div className="capture-wizard__section">
                <header className="capture-wizard__section-head">
                  <h4 className="capture-wizard__section-title">{t("capture.wizard.section.identity")}</h4>
                  <p className="capture-wizard__section-hint">{t("capture.wizard.section.identityHint")}</p>
                </header>
                <div className="capture-wizard__fields capture-wizard__fields--2">
                  <label className={errors.category ? "has-error" : undefined}>
                    <span className="capture-wizard__label">{t("capture.wizard.field.category")}</span>
                    <select
                      value={form.category}
                      onChange={(e) =>
                        update({ category: e.target.value as CaptureFormState["category"] })
                      }
                    >
                      <option value="mineral">{t("capture.wizard.category.mineral")}</option>
                      <option value="carbon_credit">{t("capture.wizard.category.carbon")}</option>
                    </select>
                  </label>

                  <label className={`capture-wizard__field--wide${errors.assetId ? " has-error" : ""}`}>
                    <span className="capture-wizard__label">{t("capture.wizard.field.assetId")}</span>
                    <input value={form.assetId} onChange={(e) => update({ assetId: e.target.value })} />
                    {fieldError("assetId") ? (
                      <span className="capture-wizard__error">{fieldError("assetId")}</span>
                    ) : null}
                  </label>

                  <label className={`capture-wizard__field--wide${errors.operator ? " has-error" : ""}`}>
                    <span className="capture-wizard__label">{t("capture.wizard.field.operator")}</span>
                    <input value={form.operator} onChange={(e) => update({ operator: e.target.value })} />
                    {fieldError("operator") ? (
                      <span className="capture-wizard__error">{fieldError("operator")}</span>
                    ) : null}
                  </label>
                </div>
              </div>

              <div className="capture-wizard__section">
                <header className="capture-wizard__section-head">
                  <h4 className="capture-wizard__section-title">{t("capture.wizard.section.origin")}</h4>
                  <p className="capture-wizard__section-hint">{t("capture.wizard.section.originHint")}</p>
                </header>
                <div className="capture-wizard__fields capture-wizard__fields--2">
                  <label className={`capture-wizard__field--wide${errors.site ? " has-error" : ""}`}>
                    <span className="capture-wizard__label">{t("capture.wizard.field.site")}</span>
                    <input value={form.site} onChange={(e) => update({ site: e.target.value })} />
                    {fieldError("site") ? (
                      <span className="capture-wizard__error">{fieldError("site")}</span>
                    ) : null}
                  </label>

                  <label className={errors.lat ? "has-error" : undefined}>
                    <span className="capture-wizard__label">{t("capture.wizard.field.lat")}</span>
                    <input
                      type="number"
                      step="0.000001"
                      value={form.lat}
                      onChange={(e) => update({ lat: parseFloat(e.target.value) })}
                    />
                    {fieldError("lat") ? (
                      <span className="capture-wizard__error">{fieldError("lat")}</span>
                    ) : null}
                  </label>

                  <label className={errors.lng ? "has-error" : undefined}>
                    <span className="capture-wizard__label">{t("capture.wizard.field.lng")}</span>
                    <input
                      type="number"
                      step="0.000001"
                      value={form.lng}
                      onChange={(e) => update({ lng: parseFloat(e.target.value) })}
                    />
                    {fieldError("lng") ? (
                      <span className="capture-wizard__error">{fieldError("lng")}</span>
                    ) : null}
                  </label>

                  <label className={errors.capturedAtISO ? "has-error" : undefined}>
                    <span className="capture-wizard__label">{t("capture.wizard.field.capturedAt")}</span>
                    <input
                      value={form.capturedAtISO}
                      onChange={(e) => update({ capturedAtISO: e.target.value })}
                    />
                  </label>
                </div>
              </div>

              <div className="capture-wizard__section">
                <header className="capture-wizard__section-head">
                  <h4 className="capture-wizard__section-title">{t("capture.wizard.section.asset")}</h4>
                  <p className="capture-wizard__section-hint">{t("capture.wizard.section.assetHint")}</p>
                </header>
                <div className="capture-wizard__fields capture-wizard__fields--2">
                {form.category === "mineral" ? (
                  <>
                    <label className={errors.massGrams ? "has-error" : undefined}>
                      <span className="capture-wizard__label">{t("capture.wizard.field.massGrams")}</span>
                      <input
                        type="number"
                        value={form.massGrams ?? 100000}
                        onChange={(e) => update({ massGrams: parseInt(e.target.value, 10) })}
                      />
                      {fieldError("massGrams") ? (
                        <span className="capture-wizard__error">{fieldError("massGrams")}</span>
                      ) : null}
                    </label>
                    <label>
                      <span className="capture-wizard__label">{t("capture.wizard.field.mineral")}</span>
                      <input
                        value={form.mineral ?? ""}
                        onChange={(e) => update({ mineral: e.target.value })}
                      />
                    </label>
                  </>
                ) : (
                  <>
                    <label className={errors.tonnesCO2e ? "has-error" : undefined}>
                      <span className="capture-wizard__label">{t("capture.wizard.field.tonnes")}</span>
                      <input
                        type="number"
                        value={form.tonnesCO2e ?? 45000}
                        onChange={(e) => update({ tonnesCO2e: parseInt(e.target.value, 10) })}
                      />
                      {fieldError("tonnesCO2e") ? (
                        <span className="capture-wizard__error">{fieldError("tonnesCO2e")}</span>
                      ) : null}
                    </label>
                    <label>
                      <span className="capture-wizard__label">{t("capture.wizard.field.creditType")}</span>
                      <select
                        value={form.creditType}
                        onChange={(e) =>
                          update({
                            creditType: e.target.value as CaptureFormState["creditType"],
                          })
                        }
                      >
                        {CARBON_TYPES.map((type) => (
                          <option key={type} value={type}>
                            {type}
                          </option>
                        ))}
                      </select>
                    </label>
                    <label>
                      <span className="capture-wizard__label">{t("capture.wizard.field.vintage")}</span>
                      <input
                        value={form.vintage ?? ""}
                        onChange={(e) => update({ vintage: e.target.value })}
                      />
                    </label>
                    <label>
                      <span className="capture-wizard__label">{t("capture.wizard.field.methodology")}</span>
                      <input
                        value={form.methodology ?? ""}
                        onChange={(e) => update({ methodology: e.target.value })}
                      />
                    </label>
                    <label className="capture-wizard__field--wide">
                      <span className="capture-wizard__label">{t("capture.wizard.field.verifier")}</span>
                      <input
                        value={form.verifier ?? ""}
                        onChange={(e) => update({ verifier: e.target.value })}
                      />
                    </label>
                  </>
                )}
                </div>
              </div>
            </section>
          ) : null}

          {step === 2 ? (
            <section className="capture-wizard__panel" aria-labelledby="capture-step-2">
              <div className="capture-wizard__section">
                <header className="capture-wizard__section-head">
                  <h4 id="capture-step-2" className="capture-wizard__section-title">
                    {t("capture.wizard.section.document")}
                  </h4>
                </header>

                <div className="capture-wizard__media-toolbar">
                  <button type="button" className="capture-wizard__tool" onClick={startCamera}>
                    <Icon name="capture" size={14} />
                    {t("capture.wizard.startCamera")}
                  </button>
                  <button
                    type="button"
                    className="capture-wizard__tool"
                    onClick={capturePhoto}
                    disabled={!cameraActive}
                  >
                    {t("capture.wizard.capturePhoto")}
                  </button>
                  <label className="capture-wizard__tool capture-wizard__tool--upload">
                    <Icon name="download" size={14} />
                    {t("capture.wizard.uploadFile")}
                    <input type="file" accept="image/*,.pdf" onChange={handleFile} />
                  </label>
                  {cameraActive ? (
                    <button type="button" className="capture-wizard__tool capture-wizard__tool--ghost" onClick={stopCamera}>
                      {t("capture.wizard.stopCamera")}
                    </button>
                  ) : null}
                </div>

                <div
                  className={`capture-wizard__media-preview${photoDataUrl || cameraActive ? "" : " capture-wizard__media-preview--empty"}`}
                >
                  {photoDataUrl ? (
                    <img src={photoDataUrl} alt="" className="capture-wizard__preview-img" />
                  ) : cameraActive ? (
                    <video
                      ref={videoRef}
                      autoPlay
                      playsInline
                      className="capture-wizard__preview-video"
                    />
                  ) : (
                    <div className="capture-wizard__media-empty">
                      <Icon name="capture" size={24} />
                      <p>{t("capture.wizard.mediaEmpty")}</p>
                    </div>
                  )}
                </div>

                {frameHash ? (
                  <p className="capture-wizard__frame-hash mono small">
                    {t("capture.wizard.frameHash", { hash: frameHash.slice(0, 16) })}
                  </p>
                ) : null}
              </div>
            </section>
          ) : null}

          {step === 3 && sealResult ? (
            <section className="capture-wizard__panel" aria-labelledby="capture-step-3">
              <div className="capture-wizard__passport capture-wizard__passport--hero">
                <div className="capture-wizard__passport-head">
                  <div>
                    <p className="capture-wizard__passport-kicker mono-label">
                      {t("capture.wizard.passportTitle")}
                    </p>
                    <p className="capture-wizard__passport-id">{sealResult.artifact.assetId}</p>
                  </div>
                  <span className="capture-wizard__passport-badge">{sealResult.artifact.category}</span>
                </div>
                <div className="capture-wizard__passport-seal-block">
                  <span className="capture-wizard__label">{t("capture.wizard.sealLabel")}</span>
                  <code className="capture-wizard__seal">{sealResult.seal}</code>
                </div>
                <p className="capture-wizard__passport-foot">{t("capture.wizard.passportFoot")}</p>
              </div>

              <div className="capture-wizard__compare">
                <article className="capture-wizard__compare-card">
                  <header className="capture-wizard__compare-head">
                    <h4 id="capture-step-3" className="capture-wizard__compare-title">
                      {t("capture.wizard.documentCol")}
                    </h4>
                    <p className="capture-wizard__compare-note">{t("capture.wizard.notInSeal")}</p>
                  </header>
                  {photoDataUrl ? (
                    <img src={photoDataUrl} alt="" className="capture-wizard__compare-img" />
                  ) : (
                    <div className="capture-wizard__compare-empty">{t("capture.wizard.noPhoto")}</div>
                  )}
                </article>
                <article className="capture-wizard__compare-card capture-wizard__compare-card--seal">
                  <header className="capture-wizard__compare-head">
                    <h4 className="capture-wizard__compare-title">{t("capture.wizard.sealCol")}</h4>
                  </header>
                  <ul className="capture-wizard__seal-fields">
                    {sealFields
                      .filter((f) => f.sealRelevant)
                      .map((field) => (
                        <li key={field.key}>
                          <span>{field.label}</span>
                          <code>{formatArtifactFieldValue(sealResult.artifact, field.key)}</code>
                        </li>
                      ))}
                  </ul>
                </article>
              </div>

              <label className="capture-wizard__checkbox">
                <input
                  type="checkbox"
                  checked={autoProcess}
                  onChange={(e) => setAutoProcess(e.target.checked)}
                />
                {t("capture.wizard.autoProcess")}
              </label>
            </section>
          ) : null}

          {step === 3 && !sealResult && loading ? (
            <div className="capture-wizard__loading">{t("capture.wizard.generating")}</div>
          ) : null}

          {step === "success" && submittedAssetId ? (
            <section className="capture-wizard__success" aria-labelledby="capture-success">
              <div className="capture-wizard__success-icon" aria-hidden="true">
                <Icon name="shield" size={28} />
              </div>
              <h3 id="capture-success" className="capture-wizard__success-title">
                {t("capture.wizard.success.title")}
              </h3>
              <p className="capture-wizard__success-lead">{t("capture.wizard.success.lead")}</p>
              <div className="capture-wizard__success-actions">
                <button type="button" className="route-cta" onClick={openLotDetail}>
                  <BtnIcon icon="lots">{t("capture.wizard.success.lot")}</BtnIcon>
                </button>
                <button
                  type="button"
                  className="route-cta route-cta--ghost"
                  onClick={() => {
                    handleClose();
                    navigate("/process");
                  }}
                >
                  {t("capture.wizard.success.process")}
                </button>
                <button
                  type="button"
                  className="route-cta route-cta--ghost"
                  onClick={() => {
                    handleClose();
                    navigate("/audit");
                  }}
                >
                  {t("capture.wizard.success.audit")}
                </button>
              </div>
            </section>
          ) : null}

          {message ? <p className="capture-wizard__message">{message}</p> : null}
            </div>

            {step !== "success" ? (
              <footer className="capture-wizard__footer">
                <div className="capture-wizard__footer-start">
                  {step !== 1 ? (
                    <button type="button" className="route-cta route-cta--ghost" onClick={goBack}>
                      {t("capture.wizard.back")}
                    </button>
                  ) : null}
                </div>
                <p className="capture-wizard__footer-progress mono-label">
                  {t("capture.wizard.progress", { current: stepIndex, total: 3 })}
                </p>
                <div className="capture-wizard__footer-end">
                  {step === 3 ? (
                    <button
                      type="button"
                      className="route-cta"
                      onClick={submitToApp}
                      disabled={loading || !sealResult}
                    >
                      {t("capture.wizard.submit")}
                    </button>
                  ) : (
                    <button type="button" className="route-cta" onClick={goNext}>
                      {t("capture.wizard.next")}
                    </button>
                  )}
                </div>
              </footer>
            ) : null}
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
}
