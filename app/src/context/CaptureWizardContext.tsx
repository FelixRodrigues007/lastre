import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { CaptureWizardModal } from "../components/capture/CaptureWizardModal";

type CaptureWizardContextValue = {
  open: boolean;
  openCaptureWizard: () => void;
  closeCaptureWizard: () => void;
};

const CaptureWizardContext = createContext<CaptureWizardContextValue | null>(null);

export function CaptureWizardProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);

  const openCaptureWizard = useCallback(() => setOpen(true), []);
  const closeCaptureWizard = useCallback(() => setOpen(false), []);

  const value = useMemo(
    () => ({ open, openCaptureWizard, closeCaptureWizard }),
    [open, openCaptureWizard, closeCaptureWizard],
  );

  return (
    <CaptureWizardContext.Provider value={value}>
      {children}
      <CaptureWizardModal open={open} onClose={closeCaptureWizard} />
    </CaptureWizardContext.Provider>
  );
}

export function useCaptureWizard(): CaptureWizardContextValue {
  const ctx = useContext(CaptureWizardContext);
  if (!ctx) {
    throw new Error("useCaptureWizard must be used within CaptureWizardProvider");
  }
  return ctx;
}
