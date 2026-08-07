import { MANGA_LISTS } from "../mocks";

// ponytail: the seam for AniList's MediaListCollection — swap the mock for the
// query here and the screen stays untouched. Returns lists + entries in one go,
// so there is no per-tab fetch.
export function useMangaLists() {
  return MANGA_LISTS;
}
