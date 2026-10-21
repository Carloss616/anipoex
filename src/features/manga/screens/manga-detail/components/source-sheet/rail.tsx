import { memo } from "react";
import type { Source } from "@/features/manga/utils/source";
import { useSearching } from "./hooks/use-searching";
import type { SourceActions } from "./hooks/use-source-actions";
import { RailContent } from "./rail-content";

export interface RailProps {
  mangaKey: string;
  mangaId: number;
  source: Source;
  actions: SourceActions;
}

/** A source's title results under its row, while it searches. */
export const Rail = memo(function Rail(props: RailProps) {
  return useSearching(props.mangaKey, props.source.id) ? (
    <RailContent {...props} />
  ) : null;
});
