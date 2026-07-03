import {
  markDemoCollectionInitialized,
  seedDemoCollection,
} from "./demoMints";
import { buildUserProfile, writeUserProfile } from "./userSession";
import { readPersona, resetChecklistDismissed, writeAuthenticated, writePersona } from "./onboarding";

const DEMO_ACCOUNT_KEY = "casper-demo-account";

/** Ensures local demo state is populated so every screen has data to explore. */
export function initDemoSession(): void {
  if (typeof localStorage === "undefined") return;

  if (localStorage.getItem("lastro-auth") !== "1") {
    writeAuthenticated(true);
    writeUserProfile(buildUserProfile("demo@lastro.io"));
  }

  if (!readPersona()) {
    writePersona("explorer");
  }

  resetChecklistDismissed();

  if (!localStorage.getItem(DEMO_ACCOUNT_KEY)) {
    localStorage.setItem(DEMO_ACCOUNT_KEY, "casper-demo-account-preview");
  }

  seedDemoCollection();
  markDemoCollectionInitialized();
}
