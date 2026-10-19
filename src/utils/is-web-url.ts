/** Whether a value from outside the app (a repo index, extension code) is safe to open: http(s) only. */
export function isWebUrl(value: string): boolean {
  try {
    const { protocol } = new URL(value);
    return protocol === "http:" || protocol === "https:";
  } catch {
    return false;
  }
}
