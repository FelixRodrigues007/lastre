import { surfaceExamples, type SurfaceId } from "./inventory-surface-previews";
import { validScenario } from "./surface-scenarios";

function readLab() {
  if (!import.meta.env.DEV || window.parent === window) return null;
  const params = new URLSearchParams(window.location.search);
  const id = params.get("surfaceLab") as SurfaceId;
  if (!Object.hasOwn(surfaceExamples, id)) return null;
  return {
    id,
    scenario: validScenario(id, params.get("labScenario")),
    instance: params.get("labInstance"),
    example: surfaceExamples[id],
  };
}
/** Fixed for this frame's lifetime; navigation remains inside the isolated preview. */
export const surfaceLab = readLab();
export function notifyLab(
  type: "ready" | "dirty" | "closed" | "navigate" | "escape",
  detail: unknown = null,
) {
  if (surfaceLab)
    window.parent.postMessage(
      {
        channel: "lastre-surface-lab",
        instance: surfaceLab.instance,
        type,
        detail,
      },
      window.location.origin,
    );
}
