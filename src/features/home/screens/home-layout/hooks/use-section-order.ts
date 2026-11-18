import { useValue } from "@legendapp/state/react";
import { useDeferredValue } from "react";
import type { SectionId } from "@/features/home/constants";
import { settings$ } from "@/state/settings";

/** The sections' order, deferred so a preset tap commits first. */
export function useSectionOrder() {
  const order = useDeferredValue(
    useValue(() => settings$.home.order.get().join()),
  );
  return order.split(",") as SectionId[];
}
