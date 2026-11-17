import { MediaListStatus } from "@/graphql/types.generated";
import { MANGA_STATUSES } from "../constants";

/** A list the Manga tab opens: a status, or a custom list by its name. */
export type ListKey = MediaListStatus | `custom:${string}`;

const CUSTOM = "custom:";

export const customKey = (name: string): ListKey => `${CUSTOM}${name}`;

/** The custom list's name, or null for a status. */
export const customName = (key: ListKey) =>
  key.startsWith(CUSTOM) ? key.slice(CUSTOM.length) : null;

/** `?list=` from the URL; anything that isn't a list opens Reading. */
export function parseList(value: string | string[] | undefined): ListKey {
  const raw = Array.isArray(value) ? value[0] : value;
  if (raw?.startsWith(CUSTOM) && raw.length > CUSTOM.length) {
    return raw as ListKey;
  }
  // `hasOwn`, not `in`: `"toString" in {}` is true.
  return raw && Object.hasOwn(MANGA_STATUSES, raw)
    ? (raw as MediaListStatus)
    : MediaListStatus.Current;
}

/**
 * Reading for a custom list the account no longer has (deleted, or a stale
 * link), once its names have loaded (`names` not null).
 */
export function resolveList(key: ListKey, names: string[] | null): ListKey {
  const name = customName(key);
  return name == null || names == null || names.includes(name)
    ? key
    : MediaListStatus.Current;
}

export const listTitle = (key: ListKey) =>
  customName(key) ?? MANGA_STATUSES[key as MediaListStatus];
