import { runtime } from "@/features/extensions";
import { SEARCH_TIMEOUT_MS, withTimeout } from "./with-timeout";

const inFlight = new Map<string, ReturnType<typeof runtime.chapters>>();

/** The manga's chapters from its source; overlapping loads share one call, since lib 1.6 sources reject a second update of a manga while one runs. */
export function fetchChapters(
  sourceId: string,
  url: string,
  title: string,
  timeoutMs = SEARCH_TIMEOUT_MS,
) {
  const key = `${sourceId}\n${url}`;
  let call = inFlight.get(key);
  if (!call) {
    // The timeout lives in the shared call, so a hung load is evicted and the next one calls again.
    call = withTimeout(
      runtime.chapters(sourceId, url, title),
      timeoutMs,
    ).finally(() => inFlight.delete(key));
    inFlight.set(key, call);
  }
  return call;
}
