import { useValue } from "@legendapp/state/react";
import { useDeferredValue } from "react";
import { settings$ } from "@/state/settings";
import type { SectionId } from "../constants";
import { visibleSections } from "../utils/home-layout";

/** The sections Home shows, deferred so a Home layout tap commits first. */
export function useVisibleSections(): SectionId[] {
  const key = useDeferredValue(
    useValue(() => visibleSections(settings$.home.get()).join()),
  );
  return key ? (key.split(",") as SectionId[]) : [];
}
