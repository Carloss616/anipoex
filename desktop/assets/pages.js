import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";

export const PAGE_SCHEME = "anipoex-page";

const isWeb = (url) => ["http:", "https:"].includes(URL.parse(url)?.protocol);

// shortcut: kept in memory and reset on restart, so a reader open across a restart reloads its chapter; persist if that bites.
export function pageStore(limit = 1000) {
  const entries = new Map();
  return {
    /** Swaps each of a source's pages for a `PAGE_SCHEME` URL; non-web upstream URLs are dropped. */
    rewrite: (sourceId, pages) =>
      pages
        .filter((page) => isWeb(page.imageUrl))
        .map((page) => {
          const id = crypto.randomUUID();
          entries.set(id, {
            sourceId,
            imageUrl: page.imageUrl,
            index: page.index,
          });
          if (entries.size > limit) entries.delete(entries.keys().next().value);
          return { ...page, imageUrl: `${PAGE_SCHEME}://p/${id}`, headers: {} };
        }),
    lookup: (url) => entries.get(URL.parse(url ?? "")?.pathname.slice(1)),
  };
}

const empty = (status) => new Response(null, { status });

/**
 * Serves a remembered page as the runtime fetched it through its source (`image`: its client and interceptors, which
 * may rewrite the image); `image` resolves to the file's `{uri, type}`. Errors carry an empty body.
 */
export async function servePage(store, url, image) {
  const page = store.lookup(url);
  if (!page) return empty(404);
  let bytes;
  let type;
  try {
    const file = await image(page);
    bytes = await readFile(fileURLToPath(file.uri));
    type = file.type?.toLowerCase() ?? "";
  } catch {
    return empty(502);
  }
  if (type.startsWith("image/"))
    return new Response(bytes, { headers: { "Content-Type": type } });
  // Never a document the renderer could run; untyped bytes (S3-style CDNs) still reach the <img>, which sniffs them.
  if (/^text\/|html|javascript|xml/.test(type)) return empty(415);
  return new Response(bytes, {
    headers: { "Content-Type": "application/octet-stream" },
  });
}
