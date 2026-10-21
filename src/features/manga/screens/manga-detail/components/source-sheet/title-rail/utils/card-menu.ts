import type { MenuAction } from "@/components/ui/menu";
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
): MenuAction[] {
  const match: MenuAction[] = !item.current
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

/** What tapping a card does: use a result as the match, or remove a match set by hand; nothing on an automatic one or during a scan. A long press opens `cardMenu`. */
export function cardTap(
  item: RailItem,
  manual: boolean,
  on: { setMatch: (manga: SourceManga) => void; removeMatch: () => void },
  scanning = false,
): (() => void) | undefined {
  if (scanning) return undefined;
  if (!item.current) return () => on.setMatch(item.manga);
  return manual ? on.removeMatch : undefined;
}
