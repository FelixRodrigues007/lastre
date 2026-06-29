import { useWebGLCanvas } from "./useWebGLCanvas";
import { SEAL_GLOW_FRAG, SEAL_GLOW_VERT } from "./sealGlow.glsl";
import "./shaders.css";

type SealGlowProps = {
  speed?: number;
  intensity?: number;
  className?: string;
};

export function SealGlowShader({ speed = 0.8, intensity = 0.9, className = "" }: SealGlowProps) {
  const { canvasRef, className: canvasClass } = useWebGLCanvas({
    shaders: { vertex: SEAL_GLOW_VERT, fragment: SEAL_GLOW_FRAG },
    uniforms: () => ({ u_speed: speed, u_intensity: intensity }),
    lazy: true,
  });

  return (
    <canvas
      ref={canvasRef}
      className={`${canvasClass} seal-glow ${className}`.trim()}
      aria-hidden="true"
    />
  );
}
