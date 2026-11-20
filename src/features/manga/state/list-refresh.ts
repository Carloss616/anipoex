import { AppState } from "react-native";
import { cacheRestored, client } from "@/graphql/client";
import { network$ } from "@/state/network";
import { session$ } from "@/state/session";
import { settings$ } from "@/state/settings";
import { MangaListDocument } from "../graphql/manga-list.generated";
import { wholeCollection } from "../utils/file-entry";
import { isListStale } from "../utils/list-stale";

let running = false;

/**
 * The list is cache-first, so progress read on another device stays old
 * until it's fetched: on open and on return, a list older than the chosen
 * interval is fetched whole, quietly. Every entry's progress lands in the
 * cache, whichever list shows it.
 */
async function refreshListIfStale() {
  const { onOpen, minutes } = settings$.mangaList.refresh.peek();
  const userId = session$.user.peek()?.id;
  if (!onOpen || userId == null || running || !network$.online.peek()) return;
  if (
    !isListStale(settings$.device.listRefreshedAt.peek(), minutes, Date.now())
  )
    return;
  running = true;
  try {
    await client.query({
      query: MangaListDocument,
      variables: wholeCollection(userId),
      fetchPolicy: "network-only",
      context: { silent: true },
    });
    settings$.device.listRefreshedAt.set(Date.now());
  } catch {
    // Silent: the next open or return tries again.
  } finally {
    running = false;
  }
}

void cacheRestored.then(refreshListIfStale);
AppState.addEventListener("change", (state) => {
  if (state === "active") void refreshListIfStale();
});
