// React Native, Chrome, Safari and Firefox word a failed fetch differently
const FETCH_FAILURES = new Set([
  "Network request failed",
  "Failed to fetch",
  "Load failed",
  "NetworkError when attempting to fetch resource.",
]);

/** No server answered: what `fetchOrNetworkError` turns a rejected fetch into. */
export class NetworkError extends Error {
  name = "NetworkError";
}

/**
 * fetch for Apollo's HttpLink. An HTTP error resolves, so a rejection means no
 * server answered; expo/fetch rejects with its own FetchError ("fetch failed:
 * …UnknownHostException") that names nothing a check could rely on. Cast:
 * `typeof fetch` also carries Bun's `preconnect` in this repo's types.
 */
export const fetchOrNetworkError = ((
  input: RequestInfo | URL,
  init?: RequestInit,
) =>
  fetch(input, init).catch((error: unknown) => {
    if (init?.signal?.aborted) throw error;
    throw new NetworkError(
      error instanceof Error ? error.message : String(error),
      { cause: error },
    );
  })) as typeof fetch;

/** A dropped connection, not an answer from the server (GraphQL or HTTP error). */
export function isNetworkError(error: unknown): boolean {
  if (error instanceof NetworkError) return true;
  if (error instanceof TypeError) return FETCH_FAILURES.has(error.message);
  return typeof error === "object" && error !== null && "networkError" in error;
}

/**
 * Whether the error link toasts a failure: not when the operation asks for
 * silence, nor when only the connection dropped and a query can wait or a
 * mutation keeps its work for later (`queueOffline`).
 */
export function shouldToast(
  context: Readonly<Record<string, unknown>>,
  error: unknown,
  isQuery: boolean,
): boolean {
  if (context.silent) return false;
  return !(isNetworkError(error) && (isQuery || context.queueOffline));
}
