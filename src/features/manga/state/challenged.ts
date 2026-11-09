import { observable } from "@legendapp/state";
import { syncObservable } from "@legendapp/state/sync";
import { runtime } from "@/features/extensions";
import { ObservablePersist } from "@/state/observable-persist";
import { sameSite } from "../utils/same-site";
import type { Source } from "../utils/source";
import { withTimeout } from "../utils/with-timeout";

// A scan's pick waits on the answer: a stuck bridge mustn't hold it.
const HOSTS_TIMEOUT_MS = 3000;

/** By source id: when its site first served a Cloudflare challenge (ms). */
export const challenged$ = observable<Record<string, number>>({});

syncObservable(challenged$, {
  persist: { name: "source-challenged", plugin: ObservablePersist },
});

/**
 * Marks the sources whose homepage is on a host the runtime saw challenge.
 * shortcut: a source whose API lives on an unrelated host is missed; read the
 * host per source from the runtime when that matters.
 */
export async function recordChallenges(sources: Source[]): Promise<void> {
  const hosts = await withTimeout(
    runtime.challengedHosts(),
    HOSTS_TIMEOUT_MS,
  ).catch(() => []);
  if (!hosts.length) return;
  const now = Date.now();
  for (const { id, homeUrl } of sources) {
    if (!homeUrl || challenged$[id].peek()) continue;
    if (hosts.some((host) => sameSite(host, homeUrl))) challenged$[id].set(now);
  }
}
