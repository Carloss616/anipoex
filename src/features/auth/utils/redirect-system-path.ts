/**
 * Decides what an incoming deep link should navigate to.
 *
 * @see https://docs.expo.dev/router/advanced/native-intent/
 * @see https://github.com/expo/router/issues/157
 */
export function redirectSystemPath({ path }: { path: string }): string {
  const route = path.replace(/^anipoex:\/\//, "/").replace(/[?#].*$/, "");

  return route === "/auth" ? "/" : path;
}
