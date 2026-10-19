import { useValue } from "@legendapp/state/react";
import { useEffect, useMemo } from "react";
import type { Source } from "@/features/manga/sources";
import { installed$, refreshInstalled } from "../state/extensions";
import { enabledLanguages, toSources } from "../utils/sources";

/** The sources of the installed extensions in the enabled languages; empty until loaded. */
export function useInstalledSources(): Source[] {
  const installed = useValue(installed$);

  useEffect(() => {
    refreshInstalled();
  }, []);

  return useMemo(
    () =>
      toSources(
        installed,
        enabledLanguages(Intl.DateTimeFormat().resolvedOptions().locale),
      ),
    [installed],
  );
}
