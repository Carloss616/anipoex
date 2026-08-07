/**
 * Extracts parameters from a URL fragment (`#a=1&b=2`).
 * Implemented manually to avoid dependencies and maintain compatibility.
 */
export function parseFragment(url: string): Record<string, string> {
  const fragment = url.split("#")[1];
  if (!fragment) return {};

  const params: Record<string, string> = {};
  for (const pair of fragment.split("&")) {
    if (!pair) continue;
    const separator = pair.indexOf("=");
    const key = separator === -1 ? pair : pair.slice(0, separator);
    const value = separator === -1 ? "" : pair.slice(separator + 1);
    params[decodeURIComponent(key)] = decodeURIComponent(value);
  }
  return params;
}
