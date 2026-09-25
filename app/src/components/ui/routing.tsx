import { forwardRef, type AnchorHTMLAttributes } from "react";
import { Link, useInRouterContext, useNavigate } from "react-router-dom";

/**
 * Kit components link and navigate through React Router when a router is
 * mounted, and fall back to plain anchors elsewhere (design system page,
 * embedded previews). A component is always either inside or outside a
 * router for its whole life, so the conditional hook call is stable.
 */
export const KitLink = forwardRef<
  HTMLAnchorElement,
  AnchorHTMLAttributes<HTMLAnchorElement> & { to: string }
>(function KitLink({ to, ...props }, ref) {
  const inRouter = useInRouterContext();
  return inRouter ? <Link ref={ref} to={to} {...props} /> : <a ref={ref} href={to} {...props} />;
});

export function useKitNavigate() {
  const inRouter = useInRouterContext();
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const navigate = inRouter ? useNavigate() : null;
  return (to: string) => (navigate ? navigate(to) : window.location.assign(to));
}
