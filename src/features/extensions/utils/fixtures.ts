import type { Extension, Language } from "./extension";

export const EN: Language = { code: "en", name: "English" };
export const KO: Language = { code: "ko", name: "Korean" };
export const MULTI: Language = { code: "mul", name: "Multi" };

/** Test fixtures shared by the `utils` tests. */
export const ext = (
  over: Partial<Extension> & Pick<Extension, "id">,
): Extension => ({
  name: over.id,
  initials: "XX",
  language: EN,
  version: "1.0.0",
  installed: false,
  ...over,
});

export const LIST: Extension[] = [
  ext({ id: "mangadex", name: "MangaDex", language: MULTI, installed: true }),
  ext({
    id: "asura",
    name: "Asura Scans",
    installed: true,
    latestVersion: "1.1.0",
  }),
  ext({
    id: "comick",
    name: "ComicK",
    language: MULTI,
    installed: true,
    latestVersion: "1.0.1",
  }),
  ext({ id: "flame", name: "Flame Comics" }),
  ext({ id: "kakao", name: "Kakao Page", language: KO }),
];
