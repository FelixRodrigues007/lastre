import { useWebGLCanvas } from "./useWebGLCanvas";
import { MESH_GRADIENT_FRAG, MESH_GRADIENT_VERT } from "./meshGradient.glsl";
import "./shaders.css";

type MeshGradientProps = {
  speed?: number;
  intensity?: number;
  grain?: number;
  /** Seal yellow hue in degrees */
  hue?: number;
  className?: string;
  /** Blend mode over underlying content */
  blend?: "normal" | "soft-light" | "screen" | "overlay";
  opacity?: number;
};

/** Animated mesh gradient — 21st.dev NLACE pattern, Lastre palette. */
export function MeshGradientShader({
  speed = 1,
  intensity = 1.4,
  grain = 0.65,
  hue = 52,
  className = "",
  blend = "soft-light",
  opacity = 0.85,
}: MeshGradientProps) {
  const { canvasRef, className: canvasClass } = useWebGLCanvas({
    shaders: { vertex: MESH_GRADIENT_VERT, fragment: MESH_GRADIENT_FRAG },
    uniforms: () => ({ u_speed: speed, u_intensity: intensity, u_grain: grain, u_hue: hue }),
    lazy: true,
  });

  return (
    <canvas
      ref={canvasRef}
      className={`${canvasClass} mesh-gradient ${className}`.trim()}
      aria-hidden="true"
      style={{
        mixBlendMode: blend,
        opacity,
      }}
    />
  );
}
