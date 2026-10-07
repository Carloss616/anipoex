import { MediaListStatus } from "@/graphql/types.generated";
import { MANGA_STATUSES } from "../constants";

/** `?list=` from the URL; anything that isn't a status opens Reading. */
export function parseList(value: string | string[] | undefined) {
  const raw = Array.isArray(value) ? value[0] : value;
  // `hasOwn`, not `in`: `"toString" in {}` is true.
  return raw && Object.hasOwn(MANGA_STATUSES, raw)
    ? (raw as MediaListStatus)
    : MediaListStatus.Current;
}
