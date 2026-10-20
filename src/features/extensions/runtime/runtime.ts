import { unavailableRuntime } from "./utils/unavailable";

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
  /** Image URL (`file://` on Android, `data:` on desktop and iOS) of the APK's app icon; null when it couldn't be read. */
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
  /** The source's own data for the chapter, as JSON, handed back to `pages`; null when it keeps none. */
  memo: string | null;
}

export interface SourcePage {
  index: number;
  imageUrl: string;
  /** Request headers the image needs (referer, cookies). */
  headers: Record<string, string>;
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
  /** The chapter's page images, in reading order. */
  pages(
    sourceId: string,
    chapterUrl: string,
    memo?: string,
  ): Promise<SourcePage[]>;
}

/** Android, iOS (`expo-module` `ExtensionRuntime`) and the desktop app run extensions; a plain browser lists nothing. */
export const isRuntimeAvailable: boolean = false;

export const runtime: RuntimeApi = unavailableRuntime;
