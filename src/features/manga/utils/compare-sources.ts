import { baseLang } from "@/features/extensions/utils/languages";
import type { ProbeMap } from "./msu";

/** What breaks a tie on new chapters. */
export interface PickPrefs {
  /** Sources whose site served a Cloudflare challenge: they load slower. */
  challenged: Record<string, number>;
  /** Base languages, preferred first. */
  languages: string[];
}

type Ranked = { id: string; name: string; lang?: string };

// Progress is a whole chapter, so 42 and 42.5 leave the same +N.
const newest = (probes: ProbeMap, id: string) =>
  Math.floor(probes[id]?.latest ?? -1);

const languageRank = ({ lang }: Ranked, languages: string[]) => {
  const index = lang ? languages.indexOf(baseLang(lang)) : -1;
  return index < 0 ? languages.length : index;
};

/**
 * Most new chapters first; on a tie, a source with no Cloudflare check, then
 * the preferred language, then the name.
 */
export const compareSources = (
  a: Ranked,
  b: Ranked,
  probes: ProbeMap,
  prefs: PickPrefs,
) =>
  newest(probes, b.id) - newest(probes, a.id) ||
  Number(a.id in prefs.challenged) - Number(b.id in prefs.challenged) ||
  languageRank(a, prefs.languages) - languageRank(b, prefs.languages) ||
  a.name.localeCompare(b.name);
