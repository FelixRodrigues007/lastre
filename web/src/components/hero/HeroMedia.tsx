import { useEffect, useRef, useState } from "react";
import { useSite } from "../../context/SiteContext";
import { MEDIA } from "../../site-media";
import { useReducedMotion } from "../../hooks/useReducedMotion";
import { ProofPanel } from "./ProofPanel";
import { useHeroParallax } from "./useHeroParallax";
import "./proof-panel.css";

const HERO_WIDTH = 2560;
const HERO_HEIGHT = 1428;

const HERO_VIDEO_POSTER = "/media/hero/hero-scene-poster.jpg";
const HERO_VIDEO_DESKTOP = {
  webm: "/media/hero/hero-scene-1080.webm",
  mp4: "/media/hero/hero-scene-1080.mp4",
} as const;
const HERO_VIDEO_MOBILE = {
  mp4: "/media/hero/hero-scene-720.mp4",
} as const;

const HERO_SRCSET_MOBILE = [
  { w: 1280, webp: "/media/hero/hero-origin-1280.webp", png: "/media/hero/hero-origin-1280.png" },
] as const;

const HERO_SRCSET_DESKTOP = [
  { w: 1280, webp: "/media/hero/hero-origin-1280.webp", png: "/media/hero/hero-origin-1280.png" },
  { w: 1920, webp: "/media/hero/hero-origin-1920.webp", png: "/media/hero/hero-origin-1920.png" },
  { w: 2560, webp: "/media/hero/hero-origin-2560.webp", png: "/media/hero/hero-origin-2560.png" },
] as const;

function useIsMobile() {
  const [mobile, setMobile] = useState(() =>
    typeof window !== "undefined" ? window.matchMedia("(max-width: 767px)").matches : false,
  );
  useEffect(() => {
    const mq = window.matchMedia("(max-width: 767px)");
    const fn = () => setMobile(mq.matches);
    mq.addEventListener("change", fn);
    return () => mq.removeEventListener("change", fn);
  }, []);
  return mobile;
}

function HeroPicture({
  alt,
  className,
  priority = false,
  mobile = false,
}: {
  alt: string;
  className?: string;
  priority?: boolean;
  mobile?: boolean;
}) {
  const set = mobile ? HERO_SRCSET_MOBILE : HERO_SRCSET_DESKTOP;
  const webpSet = set.map(({ w, webp }) => `${webp} ${w}w`).join(", ");
  const pngSet = set.map(({ w, png }) => `${png} ${w}w`).join(", ");

  return (
    <picture>
      <source srcSet={webpSet} sizes="100vw" type="image/webp" />
      <source srcSet={pngSet} sizes="100vw" type="image/png" />
      <img
        className={className}
        src={mobile ? "/media/hero/hero-origin-1280.png" : "/media/hero/hero-origin-2560.png"}
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

/** Autoplaying, muted, looping scene video — the moving counterpart to HeroPicture. */
function HeroVideo({ className, mobile }: { className?: string; mobile: boolean }) {
  const videoRef = useRef<HTMLVideoElement>(null);

  // Some mobile browsers ignore the autoplay attribute until play() is called.
  useEffect(() => {
    const el = videoRef.current;
    if (!el) return;
    const tryPlay = () => {
      void el.play().catch(() => {
        /* autoplay blocked — poster stays visible, acceptable fallback */
      });
    };
    tryPlay();
  }, []);

  return (
    <video
      ref={videoRef}
      className={className}
      width={HERO_WIDTH}
      height={HERO_HEIGHT}
      poster={HERO_VIDEO_POSTER}
      autoPlay
      muted
      loop
      playsInline
      preload="auto"
      aria-hidden="true"
    >
      {!mobile ? <source src={HERO_VIDEO_DESKTOP.webm} type="video/webm" /> : null}
      <source src={mobile ? HERO_VIDEO_MOBILE.mp4 : HERO_VIDEO_DESKTOP.mp4} type="video/mp4" />
    </video>
  );
}

/** Full-bleed hero scene — parallax depth planes with an autoplaying motion layer. */
export function HeroMedia() {
  const mobile = useIsMobile();
  const reducedMotion = useReducedMotion();
  const { content } = useSite();
  const mediaRef = useRef<HTMLDivElement>(null);
  useHeroParallax(mediaRef, { travel: mobile ? 80 : 140 });

  return (
    <div className="hero__media" ref={mediaRef}>
      <div className="hero__depth" aria-hidden="true">
        <div className="hero__layer hero__layer--back" data-parallax-depth={mobile ? "0.08" : "0.18"}>
          <img
            className="hero__layer-img hero__layer-img--back"
            src={MEDIA.layerBack}
            alt=""
            width={2560}
            height={1428}
            decoding="async"
            draggable={false}
            onError={(e) => {
              e.currentTarget.style.display = "none";
            }}
          />
        </div>

        <div className="hero__layer hero__layer--main" data-parallax-depth={mobile ? "0.15" : "0.38"}>
          {reducedMotion ? (
            <HeroPicture
              alt={content.hero.mediaAlt}
              className="hero__layer-img hero__layer-img--main"
              priority
              mobile={mobile}
            />
          ) : (
            <HeroVideo className="hero__layer-img hero__layer-img--main" mobile={mobile} />
          )}
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
    <div className="hero__proof" data-parallax-depth="0.22">
      <ProofPanel />
    </div>
  );
}

type FilmstripLink = { label: string; href: string };

export function HeroFilmstrip({ links }: { links: readonly FilmstripLink[] }) {
  return (
    <p className="hero__filmstrip mono-label">
      {links.map((item, index) => (
        <span key={item.label} className="hero__filmstrip-item">
          {index > 0 ? <span className="hero__filmstrip-sep" aria-hidden="true">·</span> : null}
          <a className="hero__filmstrip-link link-grow" href={item.href}>
            {item.label}
          </a>
        </span>
      ))}
    </p>
  );
}
