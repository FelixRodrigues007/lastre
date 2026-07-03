import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";

/** Flips true after route paint — drives page enter choreography in CSS. */
export function usePageReveal(): boolean {
  const { pathname } = useLocation();
  const [revealed, setRevealed] = useState(false);

  useEffect(() => {
    setRevealed(false);
    let outer = 0;
    let inner = 0;

    outer = requestAnimationFrame(() => {
      inner = requestAnimationFrame(() => setRevealed(true));
    });

    return () => {
      cancelAnimationFrame(outer);
      cancelAnimationFrame(inner);
    };
  }, [pathname]);

  return revealed;
}
