import { useValue } from "@legendapp/state/react";
import { settings$ } from "@/state/settings";
import type { SectionId } from "../constants";
import { visibleSections } from "../utils/home-layout";

/** The sections Home shows, in order; re-renders only when that changes. */
export function useVisibleSections(): SectionId[] {
  const key = useValue(() => visibleSections(settings$.home.get()).join());
  return key ? (key.split(",") as SectionId[]) : [];
}
