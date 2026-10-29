import { MangaCard } from "@/features/manga/components/manga-card";
import { COVER, CURRENT_MARK } from "./constants";
import type { RailItem } from "./utils/rail-items";

export interface RailCardProps {
  item: RailItem;
  /** Sent with the cover: some image hosts refuse a request without the Referer. */
  headers?: Record<string, string>;
  /** Given by the menu around the card: a tap opens it. */
  onPress?: () => void;
}

/** A result's cover and title. A tap opens its menu, which holds every action. */
export function RailCard({ item, headers, ...props }: RailCardProps) {
  const uri = item.manga.thumbnailUrl;
  return (
    <MangaCard
      {...props}
      cover={uri ? { uri, headers } : null}
      title={item.manga.title}
      mark={item.current ? CURRENT_MARK : undefined}
      titlePosition="below"
      accessibilityLabel={
        item.current ? `${item.manga.title}, current match` : item.manga.title
      }
      style={{ width: COVER.width }}
    />
  );
}
