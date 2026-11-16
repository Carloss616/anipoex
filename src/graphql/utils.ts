import { isNetworkError } from "@/features/manga/state/pending-progress";

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
