import type { CSSProperties } from "react";
import { ProofPanel } from "./ProofPanel";

const FILMSTRIP = ["Field capture", "Open pit", "SHA-256 seal", "Casper anchor"] as const;

const HERO_WIDTH = 2560;
const HERO_HEIGHT = 1428;

const HERO_SRCSET = [
  { w: 1280, webp: "/media/hero/hero-origin-1280.webp", png: "/media/hero/hero-origin-1280.png" },
  { w: 1920, webp: "/media/hero/hero-origin-1920.webp", png: "/media/hero/hero-origin-1920.png" },
  { w: 2560, webp: "/media/hero/hero-origin-2560.webp", png: "/media/hero/hero-origin-2560.png" },
  { w: 3200, webp: "/media/hero/hero-origin-3200.webp", png: "/media/hero/hero-origin-3200.png" },
] as const;

function HeroPicture({
  alt,
  className,
  priority = false,
}: {
  alt: string;
  className?: string;
  priority?: boolean;
}) {
  const webpSet = HERO_SRCSET.map(({ w, webp }) => `${webp} ${w}w`).join(", ");
  const pngSet = HERO_SRCSET.map(({ w, png }) => `${png} ${w}w`).join(", ");

  return (
    <picture>
      <source srcSet={webpSet} sizes="100vw" type="image/webp" />
      <source srcSet={pngSet} sizes="100vw" type="image/png" />
      <img
        className={className}
        src="/media/hero/hero-origin-2560.png"
        srcSet={pngSet}
        sizes="100vw"
        alt={alt}
        width={HERO_WIDTH}
        height={HERO_HEIGHT}
        decoding="async"
        draggable={false}
        fetchPriority={priority ? "high" : undefined}
      />
    </picture>
  );
}

/** Full-bleed hero still — single sharp plane + light parallax on scroll. */
export function HeroMedia() {
  return (
    <div className="hero__media">
      <div className="hero__depth" aria-hidden="true">
        <div className="hero__layer hero__layer--main" data-parallax-depth="0.38">
          <HeroPicture
            alt="Mineral field workers at an open-pit mine during a morning shift."
            className="hero__layer-img hero__layer-img--main"
            priority
          />
        </div>

        <div className="hero__layer hero__layer--grade" aria-hidden="true" />
      </div>

      <div className="hero__scrim" aria-hidden="true" />
      <div className="hero__fade" aria-hidden="true" />
    </div>
  );
}

/** Floating proof UI, parallaxed with the scene. */
export function HeroUi() {
  return (
    <div
      className="hero__proof reveal-scroll"
      style={{ "--reveal-delay": "340ms" } as CSSProperties}
      data-parallax-depth="0.48"
    >
      <ProofPanel />
    </div>
  );
}

export function HeroFilmstrip() {
  return (
    <p className="hero__filmstrip mono-label">
      {FILMSTRIP.map((label, index) => (
        <span key={label} className="hero__filmstrip-item">
          {index > 0 ? <span className="hero__filmstrip-sep" aria-hidden="true">·</span> : null}
          {label}
        </span>
      ))}
    </p>
  );
}
