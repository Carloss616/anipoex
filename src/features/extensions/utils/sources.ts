import { initialsOf, type Source } from "@/features/manga/utils/source";
import type { InstalledExtension } from "../runtime";

/** Every source of the installed extensions; the language joins the name when an extension has several. */
export function toSources(installed: InstalledExtension[]): Source[] {
  return installed.flatMap(({ sources, icon }) =>
    sources.map(({ id, name, lang }) => ({
      id,
      name: sources.length > 1 ? `${name} (${lang.toUpperCase()})` : name,
      baseName: name,
      lang,
      initials: initialsOf(name),
      iconUrl: icon ?? undefined,
    })),
  );
}

/** Whether an installed extension provides the source, in any language. */
export const hasSource = (installed: InstalledExtension[], sourceId: string) =>
  installed.some(({ sources }) => sources.some(({ id }) => id === sourceId));
