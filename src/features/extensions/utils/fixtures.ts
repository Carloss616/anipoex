import type { Extension } from "./extension";

/** Test fixtures shared by the `utils` tests. */
export const ext = (
  over: Partial<Extension> & Pick<Extension, "id">,
): Extension => ({
  name: over.id,
  initials: "XX",
  language: "English",
  version: "1.0.0",
  installed: false,
  ...over,
});

export const LIST: Extension[] = [
  ext({ id: "mangadex", name: "MangaDex", language: "Multi", installed: true }),
  ext({
    id: "asura",
    name: "Asura Scans",
    installed: true,
    latestVersion: "1.1.0",
  }),
  ext({
    id: "comick",
    name: "ComicK",
    language: "Multi",
    installed: true,
    latestVersion: "1.0.1",
  }),
  ext({ id: "flame", name: "Flame Comics" }),
  ext({ id: "kakao", name: "Kakao Page", language: "Korean" }),
];
