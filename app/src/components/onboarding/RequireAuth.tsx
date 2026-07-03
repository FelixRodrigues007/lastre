import { Navigate, useLocation } from "react-router-dom";
import type { ReactNode } from "react";
import { useOnboarding } from "../../context/OnboardingContext";

type RequireAuthProps = {
  children: ReactNode;
};

export function RequireAuth({ children }: RequireAuthProps) {
  const { isAuthenticated, persona } = useOnboarding();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (!persona) {
    return <Navigate to="/welcome" replace />;
  }

  return children;
}
