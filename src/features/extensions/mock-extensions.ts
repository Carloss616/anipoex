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
    id: "source-1",
    name: "Source 1",
    initials: "S1",
    language: MULTI,
    version: "1.4.12",
    latestVersion: "1.4.13",
    installed: true,
  },
  {
    id: "source-2",
    name: "Source 2",
    initials: "S2",
    language: MULTI,
    version: "1.4.40",
    installed: true,
  },
  {
    id: "source-3",
    name: "Source 3",
    initials: "S3",
    language: EN,
    version: "1.4.7",
    latestVersion: "1.4.9",
    installed: true,
  },
  {
    id: "source-4",
    name: "Source 4",
    initials: "S4",
    language: EN,
    version: "1.4.2",
    installed: true,
  },
  {
    id: "source-5",
    name: "Source 5",
    initials: "S5",
    language: MULTI,
    version: "1.3.9",
    installed: true,
  },
  {
    id: "source-6",
    name: "Source 6",
    initials: "S6",
    language: MULTI,
    version: "1.4.3",
    installed: false,
  },
  {
    id: "source-7",
    name: "Source 7",
    initials: "S7",
    language: EN,
    version: "1.4.1",
    installed: false,
  },
  {
    id: "source-8",
    name: "Source 8",
    initials: "S8",
    language: MULTI,
    version: "1.4.20",
    installed: false,
  },
  {
    id: "source-9",
    name: "Source 9",
    initials: "S9",
    language: MULTI,
    version: "1.4.11",
    installed: false,
  },
  {
    id: "source-10",
    name: "Source 10",
    initials: "S1",
    language: EN,
    version: "1.4.4",
    nsfw: true,
    installed: false,
  },
  {
    id: "source-11",
    name: "Source 11",
    initials: "S1",
    language: KO,
    version: "1.2.0",
    installed: false,
  },
  {
    id: "source-12",
    name: "Source 12",
    initials: "S1",
    language: ZH,
    version: "1.3.1",
    installed: false,
  },
];
