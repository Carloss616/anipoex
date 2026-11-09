import { useValue } from "@legendapp/state/react";
import { useEffect, useMemo } from "react";
import type { Source } from "@/features/manga/utils/source";
import { installed$, refreshInstalled } from "../state/extensions";
import { toSources, withChosen } from "../utils/sources";

/** Reads what the runtime has installed when the screen opens. */
export function useLoadInstalled() {
  useEffect(() => {
    refreshInstalled();
  }, []);
}

function useInstalled() {
  useLoadInstalled();
  return useValue(installed$);
}

/**
 * The sources the user is offered, plus `chosenId` when its language is
 * hidden; empty until loaded.
 */
export function useInstalledSources(chosenId?: string): Source[] {
  const installed = useInstalled();
  return useMemo(
    () =>
      withChosen(
        toSources(installed),
        toSources(installed, { all: true }),
        chosenId,
      ),
    [installed, chosenId],
  );
}

/** Every installed source, those in hidden languages too: for lookups by id. */
export function useAllInstalledSources(): Source[] {
  const installed = useInstalled();
  return useMemo(() => toSources(installed, { all: true }), [installed]);
}
