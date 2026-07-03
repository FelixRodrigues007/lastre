import { useEffect, useId } from "react";
import { createPortal } from "react-dom";
import "./market-notice-modal.css";

type MarketNoticeModalProps = {
  title: string;
  message: string;
  tone?: "info" | "success" | "error";
  onClose: () => void;
};

export function MarketNoticeModal({
  title,
  message,
  tone = "info",
  onClose,
}: MarketNoticeModalProps) {
  const titleId = useId();

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };

    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [onClose]);

  return createPortal(
    <div className="market-notice-overlay" onClick={onClose} role="presentation">
      <div
        className={`market-notice market-notice--${tone}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        onClick={(event) => event.stopPropagation()}
      >
        <h3 id={titleId} className="market-notice__title">
          {title}
        </h3>
        <p className="market-notice__message">{message}</p>
        <div className="market-notice__actions">
          <button type="button" className="route-cta" onClick={onClose}>
            OK
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}
