import {
  openBrowserAsync,
  WebBrowserPresentationStyle,
} from "expo-web-browser";

/** Opens a URL outside the app, in whatever the platform's idea of that is. */
export function openExternal(href: string) {
  void openBrowserAsync(href, {
    presentationStyle: WebBrowserPresentationStyle.AUTOMATIC,
  });
}
