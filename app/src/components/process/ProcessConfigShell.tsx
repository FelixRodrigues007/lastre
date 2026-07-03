import type { ReactNode } from "react";
import "./process-config-shell.css";

type ProcessConfigShellProps = {
  children: ReactNode;
  running?: boolean;
};

export function ProcessConfigShell({ children, running = false }: ProcessConfigShellProps) {
  return (
    <div className={`process-config-shell${running ? " process-config-shell--running" : ""}`}>
      <div className="process-config-shell__glow" aria-hidden="true" />
      <div className="process-config-shell__inner">{children}</div>
    </div>
  );
}
