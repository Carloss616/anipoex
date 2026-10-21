import { readMatch, type Titles } from "../utils/source-match";
import { dropChapters } from "./chapters";
import { decideByHand } from "./exclusions";
import { clearManual, type ManualMatch, setManual } from "./manual-matches";
import { selectSource, source$, storeMatch } from "./source";

const isChosen = (mangaId: number, sourceId: string) =>
  readMatch(source$[mangaId].peek())?.sourceId === sourceId;

/** Makes `match` the source's page for the manga and includes the source by hand; the chosen source switches to it at once. */
export function setMatchByHand(
  mangaId: number,
  source: { id: string; name: string },
  match: ManualMatch,
) {
  setManual(mangaId, source.id, match);
  decideByHand(mangaId, source.id, false, "other");
  if (isChosen(mangaId, source.id))
    storeMatch(mangaId, source.id, { url: match.url, title: match.title });
}

/** Forgets the page set by hand; the chosen source is matched by title again. The pin stays. */
export async function removeMatchByHand(
  mangaId: number,
  source: { id: string; name: string },
  titles: Titles,
) {
  clearManual(mangaId, source.id);
  // Its chapters were read from the manual page, so a stored list would bring that page back.
  dropChapters(mangaId, source.id);
  if (isChosen(mangaId, source.id)) await selectSource(mangaId, source, titles);
}
