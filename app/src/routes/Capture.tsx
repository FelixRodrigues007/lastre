import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useCaptureWizard } from "../context/CaptureWizardContext";

/** Deep link: /capture opens the wizard modal and returns to lots. */
export function Capture() {
  const { openCaptureWizard } = useCaptureWizard();
  const navigate = useNavigate();

  useEffect(() => {
    openCaptureWizard();
    navigate("/lots", { replace: true });
  }, [openCaptureWizard, navigate]);

  return null;
}
