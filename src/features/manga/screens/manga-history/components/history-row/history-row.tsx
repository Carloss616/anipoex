import { Image } from "expo-image";
import { cn } from "panelui-native/utils/cn";
import { Frame } from "panelui-web/frame";
import { memo } from "react";
import { View } from "react-native";
import { Icon } from "@/components/ui/icon";
import { ContextMenu } from "@/components/ui/menu";
import { COVER_ROUNDED } from "@/features/manga/components/manga-card";
import type { HistoryActivityFragment } from "@/features/manga/graphql/manga-history.generated";
import { KIND_ICON } from "../../constants";
import {
  activityTime,
  type HistoryKind,
  historyAction,
  historyKind,
} from "../../utils/history-action";
import { openManga, rowMenu } from "../../utils/row-menu";

export interface HistoryRowProps {
  activity: HistoryActivityFragment;
  /**
   * First and last of its day, for the group's corners; iOS's sections draw
   * their own.
   */
  first?: boolean;
  last?: boolean;
  /** The list shows one manga, so the menu drops its filter item. */
  filtered: boolean;
}

const KIND_BG: Record<HistoryKind, string> = {
  read: "bg-primary",
  add: "bg-info",
  done: "bg-success",
  pause: "bg-warning",
  drop: "bg-destructive",
};

/** One list activity in its day's card; opens the manga. */
export const HistoryRow = memo(function HistoryRow({
  activity,
  first,
  last,
  filtered,
}: HistoryRowProps) {
  const { media } = activity;
  const title = media?.title?.userPreferred ?? "";
  const action = historyAction(activity);
  const kind = historyKind(activity.status);
  const time = activityTime(activity.createdAt);

  return (
    <Frame
      className={cn(
        "gutters mx-gx rounded-t-none border-t-0",
        last ? "mb-4" : "rounded-b-none border-b-0",
      )}
    >
      <Frame.Panel
        data-attached="column"
        className={cn(!first && "rounded-t-none!")}
      >
        {media ? (
          <ContextMenu items={rowMenu(media.id, filtered)}>
            <Frame.Row
              aria-label={`${title}: ${action}, ${time}`}
              onClick={() => openManga(media.id)}
            >
              <Content
                cover={media.coverImage}
                kind={kind}
                title={title}
                action={action}
                time={time}
              />
            </Frame.Row>
          </ContextMenu>
        ) : (
          <Frame.Row>
            <Content kind={kind} title={title} action={action} time={time} />
          </Frame.Row>
        )}
      </Frame.Panel>
    </Frame>
  );
});

function Content({
  cover,
  kind,
  title,
  action,
  time,
}: {
  cover?: NonNullable<HistoryActivityFragment["media"]>["coverImage"];
  kind: HistoryKind;
  title: string;
  action: string;
  time: string;
}) {
  return (
    <>
      <Frame.Media>
        <View>
          <Image
            source={cover?.medium}
            contentFit="cover"
            className={cn("aspect-2/3 w-9", COVER_ROUNDED)}
            style={{ backgroundColor: cover?.color ?? undefined }}
          />
          <View
            className={cn(
              "border-card absolute -right-1.5 -bottom-1.5 size-5 items-center justify-center rounded-full border-2",
              KIND_BG[kind],
            )}
          >
            <Icon name={KIND_ICON[kind]} size={10} className="text-white" />
          </View>
        </View>
      </Frame.Media>
      <Frame.Content>
        <Frame.Title as="p">{title}</Frame.Title>
        <Frame.Description>{action}</Frame.Description>
      </Frame.Content>
      <Frame.Actions>
        <Frame.Description>{time}</Frame.Description>
      </Frame.Actions>
    </>
  );
}
