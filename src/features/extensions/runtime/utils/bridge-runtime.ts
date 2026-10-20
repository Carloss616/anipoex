import type { RuntimeApi } from "../runtime";

type Send = (
  method: string,
  args: Record<string, unknown>,
) => Promise<{ result?: unknown; error?: string }>;

/** A `RuntimeApi` over any transport that answers `{result}` or `{error}`, so the app shows the extension's own message. */
export const bridgeRuntime = (send: Send): RuntimeApi => {
  const call = async <T>(
    method: string,
    args: Record<string, unknown> = {},
  ): Promise<T> => {
    const reply = await send(method, args);
    if (reply.error !== undefined) throw new Error(reply.error);
    return reply.result as T;
  };
  return {
    install: (apkUrl, signingKey) => call("install", { apkUrl, signingKey }),
    installed: () => call("installed"),
    uninstall: (pkg) => call("uninstall", { pkg }),
    search: (sourceId, query, page) =>
      call("search", { sourceId, query, page }),
    chapters: (sourceId, mangaUrl, title) =>
      call("chapters", { sourceId, mangaUrl, title }),
    mangaWebUrl: (sourceId, mangaUrl) =>
      call("mangaWebUrl", { sourceId, mangaUrl }),
    pages: (sourceId, chapterUrl, memo) =>
      call("pages", { sourceId, chapterUrl, memo }),
  };
};
