import type { SFSymbol } from "expo-symbols";
import { MediaListStatus } from "@/graphql/types.generated";

/** The trailing symbol of each list in the iOS menu. */
export const LIST_SYMBOLS: Record<MediaListStatus, SFSymbol> = {
  [MediaListStatus.Current]: "book",
  [MediaListStatus.Planning]: "bookmark",
  [MediaListStatus.Completed]: "checkmark.circle",
  [MediaListStatus.Paused]: "pause.circle",
  [MediaListStatus.Dropped]: "xmark.circle",
  [MediaListStatus.Repeating]: "arrow.counterclockwise",
};

/** The same, for every custom list. */
export const CUSTOM_LIST_SYMBOL: SFSymbol = "list.star";
