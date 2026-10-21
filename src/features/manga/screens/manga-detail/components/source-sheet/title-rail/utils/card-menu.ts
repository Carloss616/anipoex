import type { MenuItem } from "@/components/ui/menu";
import type { SourceManga } from "@/features/extensions";
import { noop } from "@/utils/utils";
import type { RailItem } from "../../utils/rail-items";

/** A card's menu: its full title (cards cut it at two lines), the match action it allows, and its page. The match actions wait while the source is scanned, whose landing would undo them. */
export function cardMenu(
  item: RailItem,
  manual: boolean,
  on: {
    setMatch: (manga: SourceManga) => void;
    removeMatch: () => void;
    openPage: (url: string) => void;
  },
  scanning = false,
): MenuItem[] {
  const match: MenuItem[] = !item.current
    ? [
        {
          label: "Use as match",
          disabled: scanning,
          onPress: () => on.setMatch(item.manga),
        },
      ]
    : manual
      ? [{ label: "Remove match", disabled: scanning, onPress: on.removeMatch }]
      : [];
  return [
    { label: item.manga.title, disabled: true, onPress: noop },
    ...match,
    { label: "Open website", onPress: () => on.openPage(item.manga.url) },
  ];
}
