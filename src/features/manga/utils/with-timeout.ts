export const SEARCH_TIMEOUT_MS = 30_000;
// Some sources page their chapter list in a WebView (~2 min); past the
// runtime's 2-minute host call, so the runtime's own error comes first.
export const CHAPTERS_TIMEOUT_MS = 180_000;

/** What `withTimeout` rejects with. */
export class SourceTimeout extends Error {
  constructor() {
    super("Source timed out");
  }
}

/** Rejects past `ms`, so a hung call ends like a failed one. */
export function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  let timer: ReturnType<typeof setTimeout>;
  const timeout = new Promise<never>((_, reject) => {
    timer = setTimeout(() => reject(new SourceTimeout()), ms);
  });
  return Promise.race([promise, timeout]).finally(() => clearTimeout(timer));
}
