import { isWebUrl } from "./is-web-url";

/**
 * A new tab, like `<a target="_blank">`; non-http(s) URLs are ignored.
 *
 * Not `openBrowserAsync`: on web it always passes window features (a width and
 * a height), and any features make the browser open a sized popup, not a tab.
 * `noopener,noreferrer` doesn't, and is what `target="_blank"` does anyway.
 */
export function openExternal(href: string): boolean {
  if (!isWebUrl(href)) return false;
  window.open(href, "_blank", "noopener,noreferrer");
  return true;
}
