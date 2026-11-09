import type { InstalledExtension } from "../runtime/runtime";

/** `es-419` → `es`. */
export const baseLang = (code: string) =>
  code.toLowerCase().split(/[-_]/)[0] ?? "";

const isAll = (code: string) => code === "all" || code === "mul";

/**
 * An extension whose sources span several languages, or all of them; regions
 * of one language (`es`, `es-419`) are one.
 */
export function isMulti(ext: { sources: { lang: string }[] }): boolean {
  const codes = ext.sources.map(({ lang }) => lang);
  return new Set(codes.map(baseLang)).size > 1 || codes.some(isAll);
}

/** The base languages of the installed single-language extensions. */
export const singleLanguages = (installed: InstalledExtension[]) =>
  [
    ...new Set(
      installed
        .filter((ext) => ext.sources.length && !isMulti(ext))
        .map((ext) => baseLang(ext.sources[0].lang)),
    ),
  ].sort();

/**
 * The user's order of the installed languages: the stored order first, then
 * the rest, the system language before the others.
 */
export function languagePriority(
  stored: string[],
  installed: string[],
  system: string,
): string[] {
  const kept = stored.filter((code) => installed.includes(code));
  const rest = installed
    .filter((code) => !kept.includes(code))
    .sort((a, b) => Number(b === system) - Number(a === system));
  return [...kept, ...rest];
}

export function systemLanguage(): string {
  try {
    return baseLang(Intl.DateTimeFormat().resolvedOptions().locale) || "en";
  } catch {
    return "en";
  }
}

/**
 * Whether a multi extension offers a source in `lang`: an all-languages
 * source always, another only in a language some single extension has.
 */
export const offered = (lang: string, languages: string[]) =>
  isAll(lang) || !languages.length || languages.includes(baseLang(lang));
