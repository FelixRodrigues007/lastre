import { useEffect, useState } from "react";
import { useSite } from "../../context/SiteContext";
import { ProofPanel } from "./ProofPanel";
import "./proof-panel.css";

const HERO_WIDTH = 2560;
const HERO_HEIGHT = 1428;

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

/** Full-bleed hero still — single sharp plane + light parallax on scroll. */
export function HeroMedia() {
  const mobile = useIsMobile();
  const { content } = useSite();

  return (
    <div className="hero__media">
      <div className="hero__depth" aria-hidden="true">
        <div className="hero__layer hero__layer--main" data-parallax-depth={mobile ? "0.15" : "0.38"}>
          <HeroPicture
            alt={content.hero.mediaAlt}
            className="hero__layer-img hero__layer-img--main"
            priority
            mobile={mobile}
          />
        </div>

        <div className="hero__layer hero__layer--grade" aria-hidden="true" />
      </div>

      {/* CSS-animated loop — lightweight stand-in for hero video (improvement #2) */}
      <div className="hero__loop" aria-hidden="true" />

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
