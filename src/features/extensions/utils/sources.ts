import { initialsOf, type Source } from "@/features/manga/utils/source";
import { isWebUrl } from "@/utils/is-web-url";
import type { InstalledExtension } from "../runtime";
import { isMulti, offered, singleLanguages } from "./languages";

/**
 * The installed extensions' sources; the language joins the name when an
 * extension has several. A multi-language extension offers only the
 * languages of the single-language ones, unless `all`.
 */
export function toSources(
  installed: InstalledExtension[],
  { all = false }: { all?: boolean } = {},
): Source[] {
  const languages = all ? [] : singleLanguages(installed);
  return installed.flatMap((ext) =>
    ext.sources
      .filter(({ lang }) => !isMulti(ext) || offered(lang, languages))
      .map(({ id, name, lang, homeUrl, headers }) => ({
        id,
        name: ext.sources.length > 1 ? `${name} (${lang.toUpperCase()})` : name,
        baseName: name,
        lang,
        initials: initialsOf(name),
        iconUrl: ext.icon ?? undefined,
        ...(homeUrl && isWebUrl(homeUrl) && { homeUrl }),
        headers,
      })),
  );
}

/** `shown` plus the chosen source when the language filter hid it. */
export function withChosen(
  shown: Source[],
  all: Source[],
  chosenId: string | undefined,
): Source[] {
  if (!chosenId || shown.some(({ id }) => id === chosenId)) return shown;
  const chosen = all.find(({ id }) => id === chosenId);
  return chosen ? [...shown, chosen] : shown;
}

/** Whether an installed extension provides the source, in any language. */
export const hasSource = (installed: InstalledExtension[], sourceId: string) =>
  installed.some(({ sources }) => sources.some(({ id }) => id === sourceId));
