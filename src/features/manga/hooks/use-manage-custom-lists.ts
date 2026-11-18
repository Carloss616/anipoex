import { useApolloClient } from "@apollo/client/react";
import { observable } from "@legendapp/state";
import { session$ } from "@/state/session";
import { failed, succeeded } from "@/utils/haptics";
import {
  MangaListCountsDocument,
  UpdateMangaCustomListsDocument,
} from "../graphql/manga-list.generated";
import { SaveMangaTrackingDocument } from "../graphql/manga-tracking.generated";
import { removalPlan } from "../utils/custom-lists";
import {
  dropCustomList,
  fileSaved,
  renameCustomList,
} from "../utils/file-entry";
import { accountNames } from "../utils/to-counts";
import { useCustomLists } from "./use-manga-list-counts";

/**
 * The name of the list being deleted. Another delete or a rename would move
 * lists its plan still saves by name, so they wait.
 */
export const deleting$ = observable<string | null>(null);

/** Whether `work` went through; the error link toasts a failure. */
async function felt(work: () => Promise<unknown>) {
  try {
    await work();
    succeeded();
    return true;
  } catch {
    failed();
    return false;
  }
}

/** The account's custom lists, and making, renaming and deleting them. */
export function useManageCustomLists() {
  const client = useApolloClient();
  const lists = useCustomLists();

  /**
   * The account's names as AniList has them now, repeats too: a change sends
   * every name back, and cached ones would restore a list deleted elsewhere.
   */
  const namesNow = async (userId: number, errorMessage: string) => {
    const { data } = await client.query({
      query: MangaListCountsDocument,
      variables: { userId },
      fetchPolicy: "network-only",
      context: { errorMessage },
    });
    return { data, names: accountNames(data) ?? [] };
  };

  const setNames = (customLists: string[], errorMessage: string) =>
    client.mutate({
      mutation: UpdateMangaCustomListsDocument,
      variables: { customLists },
      context: { errorMessage },
    });

  /**
   * After a change AniList took: its counts, which hold what the app can't
   * guess (a new list can come back with manga a deleted one left at its
   * position). Silent: offline, the cache as the change left it stays.
   */
  const refreshCounts = (userId: number) =>
    void client
      .query({
        query: MangaListCountsDocument,
        variables: { userId },
        fetchPolicy: "network-only",
        context: { silent: true },
      })
      .catch(() => {});

  return {
    lists,
    /** `name` passed `listNameError`. */
    create: (name: string) =>
      felt(async () => {
        const userId = session$.user.peek()?.id;
        if (userId == null) throw new Error("Signed out");
        const errorMessage = "Couldn't create the list";
        const { names } = await namesNow(userId, errorMessage);
        await setNames([...names, name.trim()], errorMessage);
        refreshCounts(userId);
      }),
    /** Free: AniList keeps each entry's lists by position, not by name. */
    rename: (from: string, to: string) =>
      felt(async () => {
        const userId = session$.user.peek()?.id;
        if (userId == null || deleting$.peek()) throw new Error("Busy");
        const trimmed = to.trim();
        const errorMessage = "Couldn't rename the list";
        const { names } = await namesNow(userId, errorMessage);
        await setNames(
          names.map((name) => (name === from ? trimmed : name)),
          errorMessage,
        );
        renameCustomList(client.cache, userId, from, trimmed);
        refreshCounts(userId);
      }),
    remove: (name: string) =>
      felt(async () => {
        const userId = session$.user.peek()?.id;
        if (userId == null || deleting$.peek()) throw new Error("Busy");
        deleting$.set(name);
        try {
          await removeList(userId, name);
        } finally {
          deleting$.set(null);
          refreshCounts(userId);
        }
      }),
  };

  async function removeList(userId: number, name: string) {
    const errorMessage = "Couldn't delete the list";

    // The plan moves entries by where AniList has them now.
    const { data, names } = await namesNow(userId, errorMessage);
    const groups = data?.MediaListCollection?.lists ?? [];
    const { next, resaves } = removalPlan(names, groups, name);

    await setNames(next, errorMessage);
    // One at a time, for AniList's rate limit; one failing must not leave
    // the rest moved.
    let failures = 0;
    for (const variables of resaves) {
      try {
        await client.mutate({
          mutation: SaveMangaTrackingDocument,
          variables,
          context: { errorMessage: "Couldn't keep every manga in its lists" },
          update: (cache, { data }) => {
            const entry = data?.SaveMediaListEntry;
            if (entry?.media) fileSaved(cache, userId, entry.media.id, entry);
          },
        });
      } catch {
        failures++;
      }
    }
    dropCustomList(client.cache, userId, name);
    if (failures) throw new Error(`${failures} manga kept the wrong lists`);
  }
}
