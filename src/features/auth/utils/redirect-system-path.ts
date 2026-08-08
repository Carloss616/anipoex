/**
 * Decides what an incoming deep link should navigate to.
 *
 * @see https://docs.expo.dev/router/advanced/native-intent/
 * @see https://github.com/expo/router/issues/157
 */
export function redirectSystemPath({ path }: { path: string }): string {
  // Any scheme, not just ours: these links are already routed to this app.
  const route = path.replace(/^[\w+.-]+:\/\//, "/").replace(/[?#].*$/, "");

  return route === "/auth" ? "/" : path;
}
