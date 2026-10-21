import type { MenuItem } from "@/components/ui/menu";
import type { SourceManga } from "@/features/extensions";
import { noop } from "@/utils/utils";
import type { RailItem } from "../../utils/rail-items";

/** A card's menu: its full title (cards cut it at two lines), the match action it allows, and its page. */
export function cardMenu(
  item: RailItem,
  manual: boolean,
  on: {
    setMatch: (manga: SourceManga) => void;
    removeMatch: () => void;
    openPage: (url: string) => void;
  },
): MenuItem[] {
  const match: MenuItem[] = !item.current
    ? [{ label: "Use as match", onPress: () => on.setMatch(item.manga) }]
    : manual
      ? [{ label: "Remove match", onPress: on.removeMatch }]
      : [];
  return [
    { label: item.manga.title, disabled: true, onPress: noop },
    ...match,
    { label: "Open website", onPress: () => on.openPage(item.manga.url) },
  ];
}
