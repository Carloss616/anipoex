import { useValue } from "@legendapp/state/react";
import { useEffect, useMemo } from "react";
import type { Source } from "@/features/manga/utils/source";
import { installed$, refreshInstalled } from "../state/extensions";
import { toSources } from "../utils/sources";

function useSources(all: boolean): Source[] {
  const installed = useValue(installed$);

  useEffect(() => {
    refreshInstalled();
  }, []);

  return useMemo(() => toSources(installed, { all }), [installed, all]);
}

/** The sources the user is offered; empty until loaded. */
export const useInstalledSources = () => useSources(false);

/** Every installed source, those in hidden languages too: for lookups by id. */
export const useAllInstalledSources = () => useSources(true);
