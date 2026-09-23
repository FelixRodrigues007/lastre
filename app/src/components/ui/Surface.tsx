import type { HTMLAttributes } from "react";
import "./surface.css";

export type Elevation = 0 | 1 | 2 | 3 | 4 | 5;
export type SurfaceMaterial = "matte" | "glass" | "recessed";

/** Elevation conveys hierarchy; it does not make a surface interactive. */
export function Surface({
  as: Element = "div",
  elevation = 1,
  material = "matte",
  className = "",
  ...props
}: HTMLAttributes<HTMLElement> & {
  as?: "div" | "article" | "section";
  elevation?: Elevation;
  material?: SurfaceMaterial;
}) {
  return (
    <Element
      {...props}
      data-elevation={elevation}
      data-material={material}
      className={`lastre-surface ${className}`.trim()}
    />
  );
}
