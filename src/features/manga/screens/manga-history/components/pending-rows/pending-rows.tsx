import { Image } from "expo-image";
import { cn } from "panelui-native/utils/cn";
import { Frame } from "panelui-web/frame";
import { memo } from "react";
import { Icon, Icons } from "@/components/ui/icon";
import { COVER_ROUNDED } from "@/features/manga/components/manga-card";
import { openManga } from "../../utils/row-menu";
import { usePendingIds } from "./hooks/use-pending-ids";
import { usePendingRow } from "./hooks/use-pending-row";

export interface PendingRowsProps {
  /** Only this manga's change, when the list is filtered. */
  mediaId: number | undefined;
}

/** Changes made offline that AniList doesn't have yet, above the activity. */
export function PendingRows({ mediaId }: PendingRowsProps) {
  const ids = usePendingIds(mediaId);
  if (ids.length === 0) return null;

  return (
    <Frame className="gutters mx-gx mb-4">
      <Frame.Header>
        <Frame.Title>Waiting to sync</Frame.Title>
      </Frame.Header>
      <Frame.Panel>
        {ids.map((id) => (
          <PendingRow key={id} mediaId={id} />
        ))}
      </Frame.Panel>
    </Frame>
  );
}

const PendingRow = memo(function PendingRow({ mediaId }: { mediaId: string }) {
  const { title, cover, action } = usePendingRow(mediaId);

  return (
    <Frame.Row
      aria-label={`${title}: ${action}, waiting to sync`}
      onClick={() => openManga(Number(mediaId))}
    >
      <Frame.Media>
        <Image
          source={cover?.medium}
          contentFit="cover"
          className={cn("aspect-2/3 w-9", COVER_ROUNDED)}
          style={{ backgroundColor: cover?.color ?? undefined }}
        />
      </Frame.Media>
      <Frame.Content>
        <Frame.Title as="p">{title}</Frame.Title>
        <Frame.Description>{action}</Frame.Description>
      </Frame.Content>
      <Frame.Actions>
        <Icon
          name={Icons.offline}
          size={16}
          className="text-muted-foreground"
        />
      </Frame.Actions>
    </Frame.Row>
  );
});
