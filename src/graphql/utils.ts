// React Native, Chrome, Safari and Firefox word a failed fetch differently
const FETCH_FAILURES = new Set([
  "Network request failed",
  "Failed to fetch",
  "Load failed",
  "NetworkError when attempting to fetch resource.",
]);

/** A dropped connection, not an answer from the server (GraphQL or HTTP error). */
export function isNetworkError(error: unknown): boolean {
  if (error instanceof TypeError) return FETCH_FAILURES.has(error.message);
  return typeof error === "object" && error !== null && "networkError" in error;
}

/**
 * Whether the error link toasts a failure: not when the operation asks for
 * silence, nor when it keeps its work for later (`queueOffline`) and only the
 * connection dropped.
 */
export function shouldToast(
  context: Readonly<Record<string, unknown>>,
  error: unknown,
): boolean {
  if (context.silent) return false;
  return !(context.queueOffline && isNetworkError(error));
}
