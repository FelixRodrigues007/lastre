import { useEffect, useState } from "react";
import { useReducedMotion } from "../hooks/useReducedMotion";
import type { DeckLocale as Locale } from "./types";

/* ─────────────────────────────────────────────────────────────────────────
 * Small animated pieces. Everything here degrades to a still frame under
 * prefers-reduced-motion — the number is final, the seal reads Valid.
 * ───────────────────────────────────────────────────────────────────────── */

type FigureProps = {
  /** The number to display. */
  to: number;
  locale: Locale;
  prefix?: string;
  suffix?: string;
  decimals?: number;
  className?: string;
};

/** A large formatted number — no animation, final value from frame one. */
export function Figure({ to, locale, prefix, suffix, decimals = 0, className }: FigureProps) {
  const text = new Intl.NumberFormat(locale === "pt" ? "pt-BR" : "en-US", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(to);

  return (
    <span className={className ? `dk-metric__v ${className}` : "dk-metric__v"}>
      {prefix && <small>{prefix}</small>}
      {text}
      {suffix && <small>{suffix}</small>}
    </span>
  );
}

const HEX = "0123456789abcdef";
const FINAL = "472c927a81f4c0e3…00f2";

/**
 * The live seal. Field reading → offline SHA-256 → Casper verdict.
 * Runs once on mount (~2.5s), then rests on Valid.
 */
export function SealCard({ locale }: { locale: Locale }) {
  const reduced = useReducedMotion();
  const pt = locale === "pt";
  const [step, setStep] = useState(reduced ? 3 : 0);
  const [hash, setHash] = useState(FINAL);

  useEffect(() => {
    if (reduced) {
      setStep(3);
      setHash(FINAL);
      return;
    }
    const timers: number[] = [];
    timers.push(window.setTimeout(() => setStep(1), 700));
    timers.push(window.setTimeout(() => setStep(2), 1580));
    timers.push(window.setTimeout(() => setStep(3), 2460));
    return () => timers.forEach((t) => window.clearTimeout(t));
  }, [reduced]);

  useEffect(() => {
    if (reduced || step >= 3) {
      setHash(FINAL);
      return;
    }
    const id = window.setInterval(() => {
      setHash(
        FINAL.split("")
          .map((c) => (c === "…" ? c : HEX[Math.floor(Math.random() * 16)]))
          .join(""),
      );
    }, 55);
    return () => window.clearInterval(id);
  }, [step, reduced]);

  const steps = pt
    ? ["Leitura física", "Selo SHA-256", "Âncora Casper"]
    : ["Physical reading", "SHA-256 seal", "Casper anchor"];

  return (
    <aside className="dk-seal" aria-label={pt ? "Selo de proveniência" : "Provenance seal"}>
      <header className="dk-seal__head">
        <span>{pt ? "Selo de proveniência" : "Provenance seal"}</span>
        <span className="dk-seal__verdict" data-on={step >= 3}>
          Valid
        </span>
      </header>

      <p className="dk-seal__hash" data-live={step < 3}>
        {hash}
      </p>

      <ol className="dk-seal__steps">
        {steps.map((s, i) => (
          <li key={s} data-on={step > i}>
            <i aria-hidden="true" />
            {s}
          </li>
        ))}
      </ol>
    </aside>
  );
}
