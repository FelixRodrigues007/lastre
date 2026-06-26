import type { CSSProperties } from "react";
import { ProofPanel } from "./ProofPanel";

const FILMSTRIP = ["Field capture", "Open pit", "SHA-256 seal", "Casper anchor"] as const;

function LayerImg({
  webp,
  png,
  alt,
  className,
  priority = false,
}: {
  webp: string;
  png: string;
  alt: string;
  className?: string;
  priority?: boolean;
}) {
  return (
    <picture>
      <source srcSet={webp} type="image/webp" />
      <img
        className={className}
        src={png}
        alt={alt}
        decoding="async"
        draggable={false}
        fetchPriority={priority ? "high" : undefined}
      />
    </picture>
  );
}

/** Full-bleed parallax media — environment, subject, foreground, scrims. */
export function HeroMedia() {
  return (
    <div className="hero__media">
      <div className="hero__depth" aria-hidden="true">
        <div className="hero__layer hero__layer--back" data-parallax-depth="0.18">
          <LayerImg
            webp="/media/hero/layer-back.webp"
            png="/media/hero/layer-back.png"
            alt=""
            className="hero__layer-img hero__layer-img--back"
          />
        </div>

        <div className="hero__layer hero__layer--haze" data-parallax-depth="0.32" />

        <div className="hero__layer hero__layer--subject" data-parallax-depth="0.52">
          <LayerImg
            webp="/media/hero/layer-subject.webp"
            png="/media/hero/layer-subject.png"
            alt=""
            className="hero__layer-img hero__layer-img--subject"
            priority
          />
          <span className="hero__pulse" />
        </div>

        <div className="hero__layer hero__layer--dust" data-parallax-depth="0.72">
          <svg className="hero__dust" viewBox="0 0 1440 900" preserveAspectRatio="xMidYMid slice">
            {[
              [180, 220, 2], [320, 160, 1.5], [520, 120, 2.4], [680, 200, 1.8],
              [840, 140, 2.2], [1020, 260, 1.4], [1180, 180, 2.6], [1320, 320, 1.6],
              [960, 380, 1.2], [640, 340, 1.9], [400, 400, 1.4], [220, 480, 2.1],
            ].map(([cx, cy, r]) => (
              <circle key={`${cx}-${cy}`} cx={cx} cy={cy} r={r} className="hero__dust-mote" />
            ))}
          </svg>
        </div>

        <div className="hero__layer hero__layer--front" data-parallax-depth="1">
          <LayerImg
            webp="/media/hero/layer-front.webp"
            png="/media/hero/layer-front.png"
            alt=""
            className="hero__layer-img hero__layer-img--front"
          />
        </div>
      </div>

      <div className="hero__scrim" aria-hidden="true" />
      <div className="hero__fade" aria-hidden="true" />
    </div>
  );
}

/** Floating proof UI + connector, parallaxed with the scene. */
export function HeroUi() {
  return (
    <>
      <svg
        className="hero__link"
        viewBox="0 0 520 400"
        preserveAspectRatio="none"
        aria-hidden="true"
        data-parallax-depth="0.58"
      >
        <path
          className="hero__link-path"
          d="M168 152 C 228 168, 288 220, 338 272 S 420 330, 468 352"
          pathLength={1}
        />
        <circle className="hero__link-node hero__link-node--origin" cx="168" cy="152" r="5" />
        <circle className="hero__link-node hero__link-node--seal" cx="338" cy="272" r="4" />
      </svg>

      <div
        className="hero__proof reveal-scroll"
        style={{ "--reveal-delay": "340ms" } as CSSProperties}
        data-parallax-depth="0.62"
      >
        <ProofPanel />
      </div>
    </>
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
