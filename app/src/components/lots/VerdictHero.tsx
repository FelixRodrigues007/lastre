import { Link } from "react-router-dom";
import { BtnIcon } from "../ui/BtnIcon";
import { Icon } from "../ui/Icon";
import "./verdict-hero.css";

export type VerdictHeroTone = "valid" | "invalid" | "pending";

type VerdictHeroProps = {
  tone: VerdictHeroTone;
  attested: boolean;
  showMarketplaceCta?: boolean;
};

const COPY: Record<
  VerdictHeroTone,
  { seal: string; title: string; lead: string; icon: "shield" | "invalid" | "pending" }
> = {
  invalid: {
    seal: "Invalid",
    title: "Tampered artifact",
    lead: "The recomputed seal does not match the reference. Someone altered this lot.",
    icon: "invalid",
  },
  valid: {
    seal: "Valid",
    title: "Intact artifact",
    lead: "Seal matches reference. Proof is eligible for symbolic demo layers.",
    icon: "shield",
  },
  pending: {
    seal: "Pending",
    title: "Awaiting proof",
    lead: "Run Process to compare agent action against seal verdict.",
    icon: "pending",
  },
};

function HeroIcon({ tone }: { tone: VerdictHeroTone }) {
  if (tone === "valid") {
    return (
      <span className="verdict-hero__icon verdict-hero__icon--valid" aria-hidden="true">
        <Icon name="shield" size={22} />
      </span>
    );
  }

  if (tone === "invalid") {
    return (
      <span className="verdict-hero__icon verdict-hero__icon--invalid" aria-hidden="true">
        <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
          <path
            d="M11 3L19 18H3L11 3Z"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinejoin="round"
          />
          <path d="M11 9V13" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
          <circle cx="11" cy="16" r="0.9" fill="currentColor" />
        </svg>
      </span>
    );
  }

  return (
    <span className="verdict-hero__icon verdict-hero__icon--pending" aria-hidden="true">
      <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
        <circle cx="11" cy="11" r="7.5" stroke="currentColor" strokeWidth="1.6" />
        <path d="M11 7V12L14 14" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      </svg>
    </span>
  );
}

export function VerdictHero({ tone, attested, showMarketplaceCta = false }: VerdictHeroProps) {
  const copy = COPY[tone];
  const lead =
    tone === "valid" && attested
      ? "Seal matches reference. Proof recorded on Casper testnet."
      : copy.lead;

  return (
    <section
      className={`verdict-hero verdict-hero--${tone}`}
      aria-label="Forensic verdict"
    >
      <div className="verdict-hero__main">
        <HeroIcon tone={tone} />
        <div className="verdict-hero__copy">
          <p className="verdict-hero__seal">{copy.seal}</p>
          <h2 className="verdict-hero__title">{copy.title}</h2>
          <p className="verdict-hero__lead">{lead}</p>
        </div>
      </div>

      {showMarketplaceCta ? (
        <div className="verdict-hero__actions">
          <Link className="route-cta" to="/marketplace">
            <BtnIcon icon="globe">Marketplace (demo)</BtnIcon>
          </Link>
        </div>
      ) : null}
    </section>
  );
}
