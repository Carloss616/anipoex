import type { SourceMatch } from "@/features/manga/utils/source-match";
import type { Chapter } from "@/features/manga/utils/to-chapters";
import type { MangaDetail } from "@/features/manga/utils/to-detail";
import { type Continue$, useContinue } from "../hooks/use-continue";

/** Draws nothing: a leaf, so the entry's progress re-renders only it. */
export function ContinueSync(props: {
  manga: MangaDetail;
  chapters: Chapter[];
  match: SourceMatch | undefined;
  continue$: Continue$;
}) {
  useContinue(props.manga, props.chapters, props.match, props.continue$);
  return null;
}
