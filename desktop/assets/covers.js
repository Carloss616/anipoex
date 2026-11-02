// shortcut: learned per session from `installed` and `search` replies, so a stored cover shown before its source searches goes without them; persist the hosts if that bites.
/** The headers a source's covers are requested with, by the host they come from: some image hosts refuse an `<img>` without the site's Referer. */
export function coverHeaders() {
  const bySource = new Map();
  const byHost = new Map();
  return {
    /** Learns each source's headers from an `installed` reply. */
    learnSources: (extensions) => {
      for (const { sources = [] } of extensions ?? [])
        for (const { id, headers } of sources)
          if (headers) bySource.set(id, headers);
    },
    /** Learns which hosts a page of a source's results takes its covers from. */
    learnCovers: (sourceId, page) => {
      const headers = bySource.get(sourceId);
      if (!headers) return;
      for (const { thumbnailUrl } of page?.mangas ?? []) {
        const url = URL.parse(thumbnailUrl ?? "");
        if (url && ["http:", "https:"].includes(url.protocol))
          byHost.set(url.host, headers);
      }
    },
    /** An image request's headers with its source's added; `Origin` left out, as for pages. */
    apply: (url, requestHeaders) => {
      const headers = byHost.get(URL.parse(url)?.host);
      if (!headers) return requestHeaders;
      const added = Object.entries(headers).filter(
        ([name]) => name.toLowerCase() !== "origin",
      );
      return { ...requestHeaders, ...Object.fromEntries(added) };
    },
  };
}
