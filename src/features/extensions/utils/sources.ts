import { initialsOf, type Source } from "@/features/manga/sources";
import type { InstalledExtension } from "../runtime";

/** The languages the source picker shows: all, English and the device's own. */
export function enabledLanguages(locale: string): string[] {
  return [...new Set(["all", "en", locale.split("-")[0].toLowerCase()])];
}

/** The sources of the installed extensions in those languages; the language joins the name when an extension keeps several. */
export function toSources(
  installed: InstalledExtension[],
  languages: string[],
): Source[] {
  return installed.flatMap(({ sources, icon }) => {
    const visible = sources.filter(({ lang }) =>
      languages.includes(lang.split("-")[0].toLowerCase()),
    );
    return visible.map(({ id, name, lang }) => ({
      id,
      name: visible.length > 1 ? `${name} (${lang.toUpperCase()})` : name,
      initials: initialsOf(name),
      iconUrl: icon ?? undefined,
    }));
  });
}

/** Whether an installed extension provides the source, in any language. */
export const hasSource = (installed: InstalledExtension[], sourceId: string) =>
  installed.some(({ sources }) => sources.some(({ id }) => id === sourceId));
