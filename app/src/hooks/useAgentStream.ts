import { useEffect, useState } from "react";
import { usePrefersReducedMotion } from "./usePrefersReducedMotion";

type AgentStreamPhase = "idle" | "steps" | "reasoning" | "done";

export function useAgentStream(
  active: boolean,
  reasoning: string | null,
  steps: string[],
  stepMs = 420,
  charMs = 18,
): { phase: AgentStreamPhase; stepIndex: number; visibleReasoning: string } {
  const reduced = usePrefersReducedMotion();
  const [phase, setPhase] = useState<AgentStreamPhase>("idle");
  const [stepIndex, setStepIndex] = useState(0);
  const [visibleReasoning, setVisibleReasoning] = useState("");

  useEffect(() => {
    if (!active || !reasoning) {
      setPhase("idle");
      setStepIndex(0);
      setVisibleReasoning("");
      return;
    }

    if (reduced) {
      setPhase("done");
      setStepIndex(steps.length);
      setVisibleReasoning(reasoning);
      return;
    }

    setPhase("steps");
    setStepIndex(0);
    setVisibleReasoning("");

    let stepTimer: ReturnType<typeof setTimeout> | undefined;
    let charTimer: ReturnType<typeof setInterval> | undefined;
    let cancelled = false;

    const startReasoning = () => {
      if (cancelled) return;
      setPhase("reasoning");
      let i = 0;
      charTimer = setInterval(() => {
        i += 1;
        setVisibleReasoning(reasoning.slice(0, i));
        if (i >= reasoning.length) {
          if (charTimer) clearInterval(charTimer);
          setPhase("done");
        }
      }, charMs);
    };

    const runStep = (index: number) => {
      if (cancelled) return;
      setStepIndex(index);
      if (index >= steps.length) {
        startReasoning();
        return;
      }
      stepTimer = setTimeout(() => runStep(index + 1), stepMs);
    };

    stepTimer = setTimeout(() => runStep(1), stepMs);

    return () => {
      cancelled = true;
      if (stepTimer) clearTimeout(stepTimer);
      if (charTimer) clearInterval(charTimer);
    };
  }, [active, reasoning, steps, stepMs, charMs, reduced]);

  return { phase, stepIndex, visibleReasoning };
}
