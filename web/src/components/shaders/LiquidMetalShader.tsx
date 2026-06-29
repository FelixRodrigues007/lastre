import { useWebGLCanvas } from "./useWebGLCanvas";
import { LIQUID_METAL_FRAG, LIQUID_METAL_VERT } from "./liquidMetal.glsl";
import "./shaders.css";

type LiquidMetalProps = {
  speed?: number;
  intensity?: number;
  hue?: number;
  className?: string;
  opacity?: number;
};

/** Swirling liquid-metal vortex — 21st.dev Liquid Metal Vortex pattern. */
export function LiquidMetalShader({
  speed = 1.1,
  intensity = 0.85,
  hue = 52,
  className = "",
  opacity = 1,
}: LiquidMetalProps) {
  const { canvasRef, className: canvasClass } = useWebGLCanvas({
    shaders: { vertex: LIQUID_METAL_VERT, fragment: LIQUID_METAL_FRAG },
    uniforms: () => ({ u_speed: speed, u_intensity: intensity, u_hue: hue }),
    lazy: true,
  });

  return (
    <canvas
      ref={canvasRef}
      className={`${canvasClass} liquid-metal ${className}`.trim()}
      aria-hidden="true"
      style={{ opacity }}
    />
  );
}
