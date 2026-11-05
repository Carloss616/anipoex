import { useValue } from "@legendapp/state/react";
import type { SectionId } from "../constants";
import { homeLayout$, visibleSections } from "../state/home-layout";

/** The sections Home shows, in order; re-renders only when that changes. */
export function useVisibleSections(): SectionId[] {
  const key = useValue(() => visibleSections(homeLayout$.get()).join());
  return key ? (key.split(",") as SectionId[]) : [];
}
