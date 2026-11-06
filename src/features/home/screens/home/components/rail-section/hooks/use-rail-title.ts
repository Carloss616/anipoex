import { useValue } from "@legendapp/state/react";
import { listView$ } from "@/features/manga/state/list-view";
import { railTitlePosition } from "@/features/manga/utils/list-view";

/** The Manga grid's choice, as far as a rail's small cards can follow it. */
export const useRailTitle = () =>
  useValue(() => railTitlePosition(listView$.title.get()));
