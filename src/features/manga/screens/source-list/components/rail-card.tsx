import { MangaCard } from "@/features/manga/components/manga-card";
import { BY_TITLE_MARK, COVER, CURRENT_MARK, SIMILAR_MARK } from "../constants";
import type { RailItem } from "../utils/rail-items";

export interface RailCardProps {
  item: RailItem;
  /** Sent with the cover: some image hosts need the Referer. */
  headers?: Record<string, string>;
  /** Given by the menu around the card: a tap opens it. */
  onPress?: () => void;
}

/** A result's cover and title; a tap opens its menu, with every action. */
export function RailCard({ item, headers, ...props }: RailCardProps) {
  const uri = item.manga.thumbnailUrl;
  return (
    <MangaCard
      {...props}
      cover={uri ? { uri, headers } : null}
      title={item.manga.title}
      mark={
        item.current
          ? item.byTitle
            ? BY_TITLE_MARK
            : CURRENT_MARK
          : item.similar
            ? SIMILAR_MARK
            : undefined
      }
      titlePosition="below"
      accessibilityLabel={
        item.current
          ? `${item.manga.title}, current match${item.byTitle ? ", same title as another source" : ""}`
          : item.similar
            ? `${item.manga.title}, similar title`
            : item.manga.title
      }
      style={{ width: COVER.width }}
    />
  );
}
