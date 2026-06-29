import { useEffect, useRef } from "react";
import { MEDIA } from "../../site-media";
import { ShaderImage } from "./ShaderImage";
import "./visual.css";

const WALL_IMAGES = [
  { src: MEDIA.heroMiner, label: "Field operator" },
  { src: MEDIA.layerSubject, label: "Origin reading" },
  { src: MEDIA.depthFront, label: "Seal attestation" },
  { src: MEDIA.layerBack, label: "Supply chain" },
  { src: MEDIA.footerMine, label: "Mine exploration" },
  { src: MEDIA.depthBack, label: "Depth scan" },
  { src: MEDIA.layerFront, label: "Layer proof" },
  { src: MEDIA.heroOriginWide, label: "Origin site" },
] as const;

/** Scroll-scrubbed portrait wall — 21st.dev Scroll Portrait Wall pattern. */
export function PortraitWall() {
  const trackRef = useRef<HTMLDivElement>(null);
  const stripRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const track = trackRef.current;
    const strip = stripRef.current;
    if (!track || !strip) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) return;

    let frame = 0;

    const sync = () => {
      frame = 0;
      const rect = track.getBoundingClientRect();
      const vh = window.innerHeight || 1;
      const total = track.offsetHeight - vh;
      if (total <= 0) return;

      const scrolled = Math.min(total, Math.max(0, -rect.top));
      const progress = scrolled / total;
      const maxShift = strip.scrollWidth - track.clientWidth;
      strip.style.transform = `translate3d(${(-progress * maxShift).toFixed(1)}px, 0, 0)`;
    };

    const queue = () => {
      if (frame) return;
      frame = requestAnimationFrame(sync);
    };

    sync();
    window.addEventListener("scroll", queue, { passive: true });
    window.addEventListener("resize", queue);

    return () => {
      window.removeEventListener("scroll", queue);
      window.removeEventListener("resize", queue);
      if (frame) cancelAnimationFrame(frame);
    };
  }, []);

  return (
    <div className="portrait-wall" ref={trackRef} aria-hidden="true">
      <div className="portrait-wall__strip" ref={stripRef}>
        {WALL_IMAGES.map((item, i) => (
          <figure key={item.label} className="portrait-wall__tile">
            <ShaderImage
              src={item.src}
              shader={i === 0 ? "liquid" : i % 3 === 0 ? "glow" : "mesh"}
              drift={i % 2 === 0}
            />
            <figcaption className="portrait-wall__caption mono-label">{item.label}</figcaption>
          </figure>
        ))}
      </div>
    </div>
  );
}
