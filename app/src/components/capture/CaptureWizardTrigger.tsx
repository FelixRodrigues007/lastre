import { Button } from "../ui/Button";
import type { ReactNode } from "react";
import { useCaptureWizard } from "../../context/CaptureWizardContext";
import { BtnIcon } from "../ui/BtnIcon";

type CaptureWizardTriggerProps = {
  children: ReactNode;
  className?: string;
  icon?: boolean;
};

export function CaptureWizardTrigger({
  children,
  className = "route-cta",
  icon = false,
}: CaptureWizardTriggerProps) {
  const { openCaptureWizard } = useCaptureWizard();

  return (
    <Button
      variant={className.includes("ghost") ? "secondary" : "primary"}
      size="md"
      type="button"
      aria-label={typeof children === "string" ? children : undefined}
      className={className}
      onClick={openCaptureWizard}
    >
      {icon ? <BtnIcon icon="capture">{children}</BtnIcon> : children}
    </Button>
  );
}
