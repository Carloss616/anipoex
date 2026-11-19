import { useApolloClient } from "@apollo/client/react";
import { useObservable, useValue } from "@legendapp/state/react";
import { useLocalSearchParams } from "expo-router";
import { useEffect, useRef } from "react";
import { Keyboard } from "react-native";
import type { SearchBarCommands } from "react-native-screens";
import { MangaListDocument } from "@/features/manga/graphql/manga-list.generated";
import { wholeCollection } from "@/features/manga/utils/file-entry";
import { useSearchQuery } from "@/hooks/use-search-query";
import { session$ } from "@/state/session";
import { filterBy } from "../utils/row-menu";

/**
 * The manga History shows (the route's `mediaId`) and the search that picks
 * it. The library the search suggests from loads with the screen, not on the
 * first key.
 */
export function useHistoryFilter() {
  const client = useApolloClient();
  const userId = useValue(session$.user)?.id;
  const params = useLocalSearchParams<{ mediaId?: string }>();
  const mediaId = Number(params.mediaId) || undefined;
  const { query$, setQuery } = useSearchQuery();
  const searchBar = useRef<SearchBarCommands>(null);
  // The search a manga was picked from: its matches stay hidden, since
  // Android's field can't be emptied from here.
  const picked$ = useObservable("");
  const showMatches = useValue(() => {
    const query = query$.get();
    return query !== "" && query !== picked$.get();
  });

  useEffect(() => {
    if (userId == null) return;
    client
      .query({ query: MangaListDocument, variables: wholeCollection(userId) })
      .catch(() => {});
  }, [client, userId]);

  const pick = (id: number) => {
    filterBy(id);
    picked$.set(query$.peek());
    searchBar.current?.cancelSearch();
    Keyboard.dismiss();
  };

  return { mediaId, query$, setQuery, searchBar, showMatches, pick };
}
