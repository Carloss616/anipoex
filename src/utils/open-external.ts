import {
  openBrowserAsync,
  WebBrowserPresentationStyle,
} from "expo-web-browser";
import { isWebUrl } from "./is-web-url";

/** Opens an http(s) URL outside the app, the platform's way; ignores others. */
export function openExternal(href: string): boolean {
  if (!isWebUrl(href)) return false;
  void openBrowserAsync(href, {
    presentationStyle: WebBrowserPresentationStyle.AUTOMATIC,
  });
  return true;
}
