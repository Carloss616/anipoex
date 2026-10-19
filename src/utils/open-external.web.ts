import { isWebUrl } from "./is-web-url";

/**
 * A new tab, the way an `<a target="_blank">` gives one; non-http(s) URLs are ignored.
 *
 * Not `openBrowserAsync`: on web it always builds a window-features string with
 * a width and a height, and passing features at all is what makes the browser
 * open a sized popup instead of a tab. Only `noopener,noreferrer` is passed,
 * which no browser reads as a request for a popup — it is the same severing an
 * anchor's `target="_blank"` already does for itself.
 */
export function openExternal(href: string): boolean {
  if (!isWebUrl(href)) return false;
  window.open(href, "_blank", "noopener,noreferrer");
  return true;
}
