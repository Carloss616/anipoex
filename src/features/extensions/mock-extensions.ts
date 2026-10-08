import type { Extension, Language } from "./utils/extension";

const MULTI: Language = { code: "mul", name: "Multi" };
const EN: Language = { code: "en", name: "English" };
const KO: Language = { code: "ko", name: "Korean" };
const ZH: Language = { code: "zh", name: "Chinese" };

/**
 * SCAFFOLDING. Stands in until there is a registry that fetches, like
 * `MOCK_SOURCES` does for the source sheet — swap this export for the real
 * list and nothing else moves. Languages, versions and `nsfw` are invented.
 */
export const MOCK_EXTENSIONS: Extension[] = [
  {
    id: "mangadex",
    name: "MangaDex",
    initials: "MD",
    language: MULTI,
    version: "1.4.12",
    latestVersion: "1.4.13",
    installed: true,
  },
  {
    id: "comick",
    name: "ComicK",
    initials: "CK",
    language: MULTI,
    version: "1.4.40",
    installed: true,
  },
  {
    id: "asurascans",
    name: "Asura Scans",
    initials: "AS",
    language: EN,
    version: "1.4.7",
    latestVersion: "1.4.9",
    installed: true,
  },
  {
    id: "weebcentral",
    name: "Weeb Central",
    initials: "WC",
    language: EN,
    version: "1.4.2",
    installed: true,
  },
  {
    id: "batoto",
    name: "Bato.to",
    initials: "BT",
    language: MULTI,
    version: "1.3.9",
    installed: true,
  },
  {
    id: "mangapark",
    name: "MangaPark",
    initials: "MP",
    language: MULTI,
    version: "1.4.3",
    installed: false,
  },
  {
    id: "flamecomics",
    name: "Flame Comics",
    initials: "FC",
    language: EN,
    version: "1.4.1",
    installed: false,
  },
  {
    id: "mangafire",
    name: "MangaFire",
    initials: "MF",
    language: MULTI,
    version: "1.4.20",
    installed: false,
  },
  {
    id: "webtoons",
    name: "Webtoons",
    initials: "WT",
    language: MULTI,
    version: "1.4.11",
    installed: false,
  },
  {
    id: "toonily",
    name: "Toonily",
    initials: "TN",
    language: EN,
    version: "1.4.4",
    nsfw: true,
    installed: false,
  },
  {
    id: "kakaopage",
    name: "Kakao Page",
    initials: "KP",
    language: KO,
    version: "1.2.0",
    installed: false,
  },
  {
    id: "bilibilicomics",
    name: "Bilibili Comics",
    initials: "BC",
    language: ZH,
    version: "1.3.1",
    installed: false,
  },
];
