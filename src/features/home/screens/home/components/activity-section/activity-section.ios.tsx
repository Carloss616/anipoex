import { Divider, HStack, Spacer, VStack, ZStack } from "@expo/ui/swift-ui";
import {
  accessibilityAddTraits,
  accessibilityElement,
  accessibilityLabel,
  background,
  clipShape,
  contentShape,
  foregroundStyle,
  frame,
  lineLimit,
  onTapGesture,
  padding,
  shapes,
} from "@expo/ui/swift-ui/modifiers";
import { useRouter } from "expo-router";
import { memo } from "react";
import { GUTTER } from "@/components/native/constants";
import { Image } from "@/components/native/swift-ui/image";
import { Text } from "@/components/native/swift-ui/text";
import type { HomeActivityFragment } from "@/features/home/graphql/home-sections.generated";
import { useThemeColor } from "@/hooks/use-theme-color";
import type { ActivitySectionProps } from "./activity-section";
import { activityAction, timeAgo } from "./utils";

const AVATAR = 32;

/** An inset-grouped card of rows, drawn in the page's scroll. */
export function ActivitySection({ title, activities }: ActivitySectionProps) {
  const cell = useThemeColor("muted");

  return (
    <VStack alignment="leading" spacing={8}>
      <Text
        textStyle="title3"
        weight="bold"
        modifiers={[padding({ horizontal: GUTTER })]}
      >
        {title}
      </Text>
      <VStack
        spacing={0}
        modifiers={[
          background(cell),
          clipShape("roundedRectangle", 22),
          padding({ horizontal: GUTTER }),
        ]}
      >
        {activities.map((activity, i) => (
          <VStack key={activity.id} spacing={0}>
            {i > 0 && (
              <Divider modifiers={[padding({ leading: 14 + AVATAR + 12 })]} />
            )}
            <ActivityRow activity={activity} />
          </VStack>
        ))}
      </VStack>
    </VStack>
  );
}

const ActivityRow = memo(function ActivityRow({
  activity,
}: {
  activity: HomeActivityFragment;
}) {
  const router = useRouter();
  const overlay = useThemeColor("overlay");
  const { user, media } = activity;
  const line = [
    user?.name,
    activityAction(activity),
    media?.title?.userPreferred,
  ]
    .filter(Boolean)
    .join(" ");
  const when = timeAgo(activity.createdAt);

  return (
    <HStack
      spacing={12}
      modifiers={[
        padding({ horizontal: 14, vertical: 10 }),
        frame({ maxWidth: Infinity, alignment: "leading" }),
        contentShape(shapes.rectangle()),
        ...(media
          ? [onTapGesture(() => router.push(`/manga/${media.id}`))]
          : []),
        accessibilityElement("ignore"),
        accessibilityLabel(`${line}, ${when}`),
        accessibilityAddTraits(["isButton"]),
      ]}
    >
      <ZStack
        modifiers={[
          frame({ width: AVATAR, height: AVATAR }),
          background(overlay),
          clipShape("circle"),
        ]}
      >
        {user?.avatar?.medium && <Image source={{ uri: user.avatar.medium }} />}
      </ZStack>
      <VStack alignment="leading" spacing={2}>
        <Text textStyle="footnote" modifiers={[lineLimit(2)]}>
          {line}
        </Text>
        <Text textStyle="caption" modifiers={[foregroundStyle("secondary")]}>
          {when}
        </Text>
      </VStack>
      <Spacer />
      <ZStack
        modifiers={[
          frame({ width: 30, height: 44 }),
          background(media?.coverImage?.color ?? overlay),
          clipShape("roundedRectangle", 5),
        ]}
      >
        {media?.coverImage?.medium && (
          <Image source={{ uri: media.coverImage.medium }} />
        )}
      </ZStack>
    </HStack>
  );
});
