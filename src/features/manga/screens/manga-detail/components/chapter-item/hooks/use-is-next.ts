import { useValue } from "@legendapp/state/react";
import type { Continue$ } from "../../../hooks/use-continue";

/** A move re-renders only the two rows it flips. */
export const useIsNext = (continue$: Continue$, chapterId: string) =>
  useValue(() => continue$.get()?.chapter?.id === chapterId);
