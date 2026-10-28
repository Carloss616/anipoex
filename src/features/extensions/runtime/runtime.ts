import { desktop } from "@/utils/desktop";
import { bridgeRuntime } from "./utils/bridge-runtime";
import { unavailableRuntime } from "./utils/unavailable";

export interface InstalledSource {
  id: string;
  name: string;
  lang: string;
  /** The source's website, `HttpSource.getHomeUrl()`; null when it has none. */
  homeUrl: string | null;
  /** `HttpSource.headers`: what its covers are requested with, as Mihon does (a Referer some image hosts require). */
  headers: Record<string, string>;
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

/** The resolver extensions look hosts up with: the system's, or a DNS-over-HTTPS provider. */
export type DnsId = "system" | "cloudflare" | "google" | "adguard" | "quad9";

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
  /**
   * The URI the reader shows for a page: fetched through the source's own client, as Mihon's reader does, so its
   * interceptors run (some rewrite the image, e.g. to put a scrambled page back in order).
   */
  pageImage(sourceId: string, page: SourcePage): Promise<string>;
  getDns(): Promise<DnsId>;
  /** Applies to the next lookup of every source; the runtime stores it. */
  setDns(dns: DnsId): Promise<void>;
}

/** The desktop app runs extensions in its JVM sidecar; a plain browser has no runtime. */
export const isRuntimeAvailable: boolean = desktop !== undefined;

export const runtime: RuntimeApi = desktop
  ? {
      ...bridgeRuntime(desktop.runtime),
      // Main already swapped each page for its own URL, which it serves through the source.
      pageImage: async (_, page) => page.imageUrl,
    }
  : unavailableRuntime;
