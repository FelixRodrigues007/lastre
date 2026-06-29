import type { ReactNode } from "react";
import "./visual.css";

type ShaderImageProps = {
  src: string;
  alt?: string;
  shader?: "mesh" | "glow" | "liquid" | "none";
  className?: string;
  priority?: boolean;
  drift?: boolean;
  children?: ReactNode;
};

/**
 * Cinematic still — image + subtle bottom grade, with an optional ken-burns
 * drift. The WebGL veils (mesh/glow/liquid) were dropped: laid over a photo at
 * ~0.55 opacity they read as a broken translucent band. The `shader` prop is
 * kept for API compatibility but no longer renders an overlay.
 */
export function ShaderImage({
  src,
  alt = "",
  className = "",
  priority = false,
  drift = true,
  children,
}: ShaderImageProps) {
  return (
    <div className={`shader-image${drift ? " shader-image--drift" : ""} ${className}`.trim()}>
      <img
        className="shader-image__img"
        src={src}
        alt={alt}
        decoding="async"
        draggable={false}
        loading={priority ? "eager" : "lazy"}
        fetchPriority={priority ? "high" : undefined}
      />
      <div className="shader-image__grade" aria-hidden="true" />
      {children}
    </div>
  );
}