import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  EMPTY_CHECKLIST,
  isChecklistComplete,
  readAuthenticated,
  readChecklist,
  readChecklistDismissed,
  readPersona,
  resetChecklistDismissed,
  writeAuthenticated,
  writeChecklist,
  writeChecklistDismissed,
  writePersona,
  type ChecklistState,
  type ChecklistStep,
  type OnboardingPersona,
} from "../lib/onboarding";
import {
  buildUserProfile,
  readUserProfile,
  writeUserProfile,
  type UserProfile,
} from "../lib/userSession";

type OnboardingContextValue = {
  isAuthenticated: boolean;
  user: UserProfile | null;
  persona: OnboardingPersona | null;
  checklist: ChecklistState;
  checklistComplete: boolean;
  checklistDismissed: boolean;
  login: (profile?: UserProfile) => void;
  logout: () => void;
  setPersona: (persona: OnboardingPersona) => void;
  completeStep: (step: ChecklistStep) => void;
  dismissChecklist: () => void;
  restoreChecklist: () => void;
  syncChecklistFromAudit: (auditTotal: number) => void;
};

const OnboardingContext = createContext<OnboardingContextValue | null>(null);

export function OnboardingProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(readAuthenticated);
  const [user, setUser] = useState<UserProfile | null>(() => {
    const stored = readUserProfile();
    if (stored) return stored;
    if (readAuthenticated()) return buildUserProfile("demo@lastro.io");
    return null;
  });
  const [persona, setPersonaState] = useState<OnboardingPersona | null>(readPersona);
  const [checklist, setChecklist] = useState<ChecklistState>(readChecklist);
  const [checklistDismissed, setChecklistDismissed] = useState(readChecklistDismissed);

  const login = useCallback((profile?: UserProfile) => {
    const nextUser = profile ?? readUserProfile() ?? buildUserProfile("demo@lastro.io");
    writeUserProfile(nextUser);
    writeAuthenticated(true);
    setUser(nextUser);
    setIsAuthenticated(true);
  }, []);

  const logout = useCallback(() => {
    writeAuthenticated(false);
    writeUserProfile(null);
    writePersona(null);
    writeChecklist(EMPTY_CHECKLIST);
    writeChecklistDismissed(false);
    setIsAuthenticated(false);
    setUser(null);
    setPersonaState(null);
    setChecklist({ ...EMPTY_CHECKLIST });
    setChecklistDismissed(false);
  }, []);

  const setPersona = useCallback((next: OnboardingPersona) => {
    writePersona(next);
    setPersonaState(next);
  }, []);

  const completeStep = useCallback(
    (step: ChecklistStep) => {
      setChecklist((prev) => {
        if (prev[step]) return prev;
        const next = { ...prev, [step]: true };
        writeChecklist(next);
        return next;
      });
    },
    [],
  );

  const dismissChecklist = useCallback(() => {
    writeChecklistDismissed(true);
    setChecklistDismissed(true);
  }, []);

  const restoreChecklist = useCallback(() => {
    resetChecklistDismissed();
    setChecklistDismissed(false);
  }, []);

  const syncChecklistFromAudit = useCallback(
    (auditTotal: number) => {
      if (auditTotal > 0) {
        setChecklist((prev) => {
          if (prev.batch) return prev;
          const next = { ...prev, batch: true };
          writeChecklist(next);
          return next;
        });
      }
    },
    [],
  );

  const value = useMemo(
    () => ({
      isAuthenticated,
      user,
      persona,
      checklist,
      checklistComplete: isChecklistComplete(checklist),
      checklistDismissed,
      login,
      logout,
      setPersona,
      completeStep,
      dismissChecklist,
      restoreChecklist,
      syncChecklistFromAudit,
    }),
    [
      isAuthenticated,
      user,
      persona,
      checklist,
      checklistDismissed,
      login,
      logout,
      setPersona,
      completeStep,
      dismissChecklist,
      restoreChecklist,
      syncChecklistFromAudit,
    ],
  );

  return (
    <OnboardingContext.Provider value={value}>{children}</OnboardingContext.Provider>
  );
}

export function useOnboarding() {
  const ctx = useContext(OnboardingContext);
  if (!ctx) {
    throw new Error("useOnboarding must be used within OnboardingProvider");
  }
  return ctx;
}
