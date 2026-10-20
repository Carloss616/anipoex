export const PAGE_SCHEME = "anipoex-page";

const isWeb = (url) => ["http:", "https:"].includes(URL.parse(url)?.protocol);

// shortcut: kept in memory and reset on restart, so a reader open across a restart reloads its chapter; persist if that bites.
export function pageStore(limit = 1000) {
  const entries = new Map();
  return {
    /** Swaps each page's real request for a `PAGE_SCHEME` URL; non-web upstream URLs are dropped. */
    rewrite: (pages) =>
      pages
        .filter((page) => isWeb(page.imageUrl))
        .map((page) => {
          const id = crypto.randomUUID();
          entries.set(id, { imageUrl: page.imageUrl, headers: page.headers });
          if (entries.size > limit) entries.delete(entries.keys().next().value);
          return { ...page, imageUrl: `${PAGE_SCHEME}://p/${id}`, headers: {} };
        }),
    lookup: (url) => entries.get(URL.parse(url ?? "")?.pathname.slice(1)),
  };
}

const empty = (status) => new Response(null, { status });

/** Downloads a remembered page with the headers its source asked for; errors carry an empty body. */
export async function servePage(store, url, fetch) {
  const page = store.lookup(url);
  if (!page || !isWeb(page.imageUrl)) return empty(404);
  let upstream;
  try {
    // shortcut: sources that rewrite images in OkHttp interceptors are not covered, handle them in the extension runtime if one needs it.
    // Without `Origin`: net.fetch fails a request that carries one (some sources send it) with net::ERR_FAILED.
    upstream = await fetch(page.imageUrl, {
      headers: Object.fromEntries(
        Object.entries(page.headers).filter(
          ([name]) => name.toLowerCase() !== "origin",
        ),
      ),
    });
  } catch {
    return empty(502);
  }
  if (!upstream.ok) return empty(upstream.status);
  const type = upstream.headers.get("Content-Type");
  return new Response(upstream.body, {
    headers: type ? { "Content-Type": type } : {},
  });
}
