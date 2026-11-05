import { useFragment } from "@apollo/client/react";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { Frame } from "panelui-web/frame";
import { memo } from "react";
import { Progress } from "@/components/ui/progress";
import type { ContinueItem } from "@/features/home/utils/continue-items";
import { MangaMediaFragmentDoc } from "@/features/manga/graphql/manga-fragments.generated";

export interface ContinueSectionProps {
  title: string;
  items: ContinueItem[];
}

export function ContinueSection({ title, items }: ContinueSectionProps) {
  return (
    <Frame>
      <Frame.Header>
        <Frame.Title>{title}</Frame.Title>
        <Frame.Action>{items.length} reading</Frame.Action>
      </Frame.Header>
      <Frame.Panel>
        {items.map((item) => (
          <ContinueRow
            key={item.mangaId}
            mangaId={item.mangaId}
            unread={item.unread}
            chapterId={item.next.id}
            chapterNumber={item.next.number}
          />
        ))}
      </Frame.Panel>
    </Frame>
  );
}

/** Title, cover and progress from the cache, so a save in the reader shows. */
const ContinueRow = memo(function ContinueRow({
  mangaId,
  unread,
  chapterId,
  chapterNumber,
}: {
  mangaId: number;
  unread: number;
  chapterId: string;
  chapterNumber: number;
}) {
  const router = useRouter();
  const { data } = useFragment({
    fragment: MangaMediaFragmentDoc,
    fragmentName: "MangaMedia",
    from: { __typename: "Media", id: mangaId },
  });
  const read = data.mediaListEntry?.progress ?? 0;
  const title = data.title?.userPreferred ?? "";

  return (
    <Frame.Row
      aria-label={`${title}: read chapter ${chapterNumber}, ${unread} new`}
      onClick={() =>
        router.push({
          pathname: "/manga/[id]/reader",
          params: { id: mangaId, chapter: chapterId },
        })
      }
    >
      <Frame.Media>
        <Image
          source={data.coverImage?.medium}
          contentFit="cover"
          style={{
            width: 40,
            height: 58,
            borderRadius: 8,
            backgroundColor: data.coverImage?.color ?? undefined,
          }}
        />
      </Frame.Media>
      <Frame.Content>
        <Frame.Title as="p">{title}</Frame.Title>
        <Frame.Description>
          c.{read} · {unread} new
        </Frame.Description>
        <Progress
          value={read}
          maxValue={read + unread}
          size="sm"
          className="mt-1.5"
        />
      </Frame.Content>
      <Frame.Actions className="text-muted-foreground text-sm">
        Read c.{chapterNumber}
      </Frame.Actions>
    </Frame.Row>
  );
});
