import { MeshGradientShader } from "../shaders/MeshGradientShader";

type StepKey = "seal" | "anchor" | "attest" | "verdict";

/** Seal-dominant mesh with a per-step accent hue:
 *  seal stays warm, the others pull a distinct cool tone so the four steps
 *  read apart at a glance. One GL context per card (mesh only) — the halftone
 *  texture is layered in CSS, not a second shader. */
const STEP_SHADER: Record<StepKey, { hue: number; intensity: number }> = {
  seal: { hue: 52, intensity: 0.95 }, // brand seal-yellow
  anchor: { hue: 212, intensity: 1.08 }, // cool blue
  attest: { hue: 150, intensity: 1.05 }, // green
  verdict: { hue: 38, intensity: 1.0 }, // amber
};

type StepBackdropProps = {
  step: StepKey;
};

/** Full-bleed WebGL atmosphere behind each how-step mockup — no photo. */
export function StepBackdrop({ step }: StepBackdropProps) {
  const { hue, intensity } = STEP_SHADER[step];

  return (
    <div className="how__step-backdrop" aria-hidden="true">
      <MeshGradientShader
        blend="normal"
        opacity={1}
        hue={hue}
        intensity={intensity}
        speed={0.5}
        grain={0.4}
      />
    </div>
  );
}
