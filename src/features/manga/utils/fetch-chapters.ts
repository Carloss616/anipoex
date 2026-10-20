import { runtime } from "@/features/extensions";

const inFlight = new Map<string, ReturnType<typeof runtime.chapters>>();

/** The manga's chapters from its source; overlapping loads share one call, since lib 1.6 sources reject a second update of a manga while one runs. */
export function fetchChapters(sourceId: string, url: string, title: string) {
  const key = `${sourceId}\n${url}`;
  let call = inFlight.get(key);
  if (!call) {
    call = runtime
      .chapters(sourceId, url, title)
      .finally(() => inFlight.delete(key));
    inFlight.set(key, call);
  }
  return call;
}
