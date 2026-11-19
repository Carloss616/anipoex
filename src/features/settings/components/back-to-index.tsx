import { router } from "expo-router";
import { useEffect } from "react";

/** Leaves a page this platform can't show for the index under it. */
export function BackToIndex() {
  // Not <Redirect>: it replaces the page, stacking a second index on the first.
  useEffect(() => router.dismissTo("/settings"), []);
  return null;
}
