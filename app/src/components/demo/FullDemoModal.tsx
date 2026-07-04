export type FullDemoStep = {
  label: string;
  detail: string;
};

type FullDemoModalProps = {
  open: boolean;
  title?: string;
  assetId: string;
  steps: FullDemoStep[];
  activeStep: number;
  status?: string;
  onClose?: () => void;
};

export function FullDemoModal({
  open,
  title = "Running full end-to-end demo",
  assetId,
  steps,
  activeStep,
  status,
  onClose,
}: FullDemoModalProps) {
  if (!open) return null;

  return (
    <div className="modal-overlay full-demo-overlay" role="dialog" aria-modal="true" aria-label={title}>
      <div className="full-demo-modal">
        <div className="full-demo-modal__head">
          <div>
            <span className="eyebrow">Demo Killer · &lt;90s path</span>
            <h3>{title}</h3>
            <p className="small muted">
              Asset: <code>{assetId}</code>. Fictional data only — proof before token.
            </p>
          </div>
          {onClose ? (
            <button type="button" className="btn small ghost" onClick={onClose}>
              Hide
            </button>
          ) : null}
        </div>

        <ol className="full-demo-steps">
          {steps.map((step, index) => {
            const state = index < activeStep ? "done" : index === activeStep ? "active" : "queued";
            return (
              <li key={step.label} className={`full-demo-step full-demo-step--${state}`}>
                <span className="full-demo-step__marker">{index < activeStep ? "✓" : index + 1}</span>
                <div>
                  <strong>{step.label}</strong>
                  <p>{step.detail}</p>
                </div>
              </li>
            );
          })}
        </ol>

        {status ? <p className="full-demo-status">{status}</p> : null}
      </div>
    </div>
  );
}
