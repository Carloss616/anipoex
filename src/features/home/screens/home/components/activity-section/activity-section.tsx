import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { Avatar } from "panelui-web/avatar";
import { Frame } from "panelui-web/frame";
import { memo } from "react";
import type { HomeActivityFragment } from "@/features/home/graphql/home-sections.generated";
import { activityAction, timeAgo } from "./utils";

export interface ActivitySectionProps {
  title: string;
  activities: HomeActivityFragment[];
}

export function ActivitySection({ title, activities }: ActivitySectionProps) {
  return (
    <Frame>
      <Frame.Header>
        <Frame.Title>{title}</Frame.Title>
      </Frame.Header>
      <Frame.Panel>
        {activities.map((activity) => (
          <ActivityRow key={activity.id} activity={activity} />
        ))}
      </Frame.Panel>
    </Frame>
  );
}

const ActivityRow = memo(function ActivityRow({
  activity,
}: {
  activity: HomeActivityFragment;
}) {
  const router = useRouter();
  const { user, media } = activity;
  const name = user?.name ?? "";
  const title = media?.title?.userPreferred ?? "";
  const action = activityAction(activity);
  const ago = timeAgo(activity.createdAt);

  return (
    <Frame.Row
      aria-label={`${name} ${action} ${title}, ${ago}`}
      onClick={media ? () => router.push(`/manga/${media.id}`) : undefined}
    >
      <Frame.Media>
        <Avatar src={user?.avatar?.medium ?? undefined} name={name} size="sm" />
      </Frame.Media>
      <Frame.Content>
        <Frame.Title as="p" className="font-normal whitespace-normal!">
          <b className="font-semibold">{name}</b> {action}{" "}
          <b className="font-semibold">{title}</b>
        </Frame.Title>
        <Frame.Description>{ago}</Frame.Description>
      </Frame.Content>
      <Frame.Actions>
        <Image
          source={media?.coverImage?.medium}
          contentFit="cover"
          style={{
            width: 32,
            height: 46,
            borderRadius: 6,
            backgroundColor: media?.coverImage?.color ?? undefined,
          }}
        />
      </Frame.Actions>
    </Frame.Row>
  );
});
