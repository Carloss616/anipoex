export interface InstalledSource {
  id: string;
  name: string;
  lang: string;
  /** The source's website, `HttpSource.getHomeUrl()`; null when it has none. */
  homeUrl: string | null;
}

export interface InstalledExtension {
  pkg: string;
  name: string;
  version: string;
  lib: number;
  signingKey: string;
  /** `file://` PNG of the APK's app icon; null when it couldn't be read. */
  icon: string | null;
  sources: InstalledSource[];
}

export interface SourceManga {
  url: string;
  title: string;
  thumbnailUrl: string | null;
}

export interface MangasPage {
  mangas: SourceManga[];
  hasNextPage: boolean;
}

export interface SourceChapter {
  url: string;
  name: string;
  number: number;
  scanlator: string | null;
  dateUpload: number;
}

export interface RuntimeApi {
  install(apkUrl: string, signingKey: string): Promise<InstalledExtension>;
  installed(): Promise<InstalledExtension[]>;
  uninstall(pkg: string): Promise<void>;
  search(sourceId: string, query: string, page: number): Promise<MangasPage>;
  chapters(
    sourceId: string,
    mangaUrl: string,
    title: string,
  ): Promise<{ chapters: SourceChapter[] }>;
  /** The manga's page on the source's website; null when the source has none. */
  mangaWebUrl(sourceId: string, mangaUrl: string): Promise<string | null>;
}

/** Android only (`expo-module` `ExtensionRuntime`); other platforms list nothing. */
export const isRuntimeAvailable: boolean = false;

const UNAVAILABLE = "Extensions run on Android only for now.";

const unavailable = (): Promise<never> =>
  Promise.reject(new Error(UNAVAILABLE));

export const runtime: RuntimeApi = {
  install: unavailable,
  installed: async () => [],
  uninstall: unavailable,
  search: unavailable,
  chapters: unavailable,
  mangaWebUrl: async () => null,
};
