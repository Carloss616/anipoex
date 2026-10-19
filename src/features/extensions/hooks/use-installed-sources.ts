import { useValue } from "@legendapp/state/react";
import { useEffect, useMemo } from "react";
import type { Source } from "@/features/manga/utils/source";
import { installed$, refreshInstalled } from "../state/extensions";
import { toSources } from "../utils/sources";

/** Every source of the installed extensions; empty until loaded. */
export function useInstalledSources(): Source[] {
  const installed = useValue(installed$);

  useEffect(() => {
    refreshInstalled();
  }, []);

  return useMemo(() => toSources(installed), [installed]);
}
