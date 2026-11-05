import { Box, Column } from "@expo/ui/jetpack-compose";
import {
  background,
  clip,
  matchParentSize,
  padding,
  Shapes,
  size,
} from "@expo/ui/jetpack-compose/modifiers";
import { useRouter } from "expo-router";
import { GUTTER } from "@/components/native/constants";
import { Image } from "@/components/native/jetpack-compose/image";
import { SectionHeader } from "@/components/native/jetpack-compose/section-header";
import {
  SEGMENTED_GAP,
  SegmentedListItem,
} from "@/components/native/jetpack-compose/segmented-list-item";
import { Text } from "@/components/native/jetpack-compose/text";
import { useThemeM3Colors } from "@/hooks/use-theme/use-theme.android";
import type { ActivitySectionProps } from "./activity-section";
import { activityAction } from "./utils";

/** Who read what, as segmented rows; a row opens the manga. */
export function ActivitySection({ title, activities }: ActivitySectionProps) {
  const router = useRouter();
  const m3 = useThemeM3Colors();

  return (
    <Column>
      <SectionHeader title={title} />
      <Column
        verticalArrangement={{ spacedBy: SEGMENTED_GAP }}
        modifiers={[padding(GUTTER, 0, GUTTER, 0)]}
      >
        {activities.map((a, i) => {
          const media = a.media;
          const avatar = a.user?.avatar?.medium;
          const cover = media?.coverImage?.medium;
          return (
            <SegmentedListItem
              key={a.id}
              index={i}
              count={activities.length}
              containerColor={m3.surfaceContainerLow}
              onPress={
                media ? () => router.push(`/manga/${media.id}`) : undefined
              }
            >
              <SegmentedListItem.Leading>
                <Box
                  modifiers={[
                    size(40, 40),
                    clip(Shapes.Circle),
                    background(m3.surfaceContainerHighest),
                  ]}
                >
                  {avatar && (
                    <Image
                      source={{ uri: avatar }}
                      modifiers={[matchParentSize()]}
                    />
                  )}
                </Box>
              </SegmentedListItem.Leading>
              <Text maxLines={2} overflow="ellipsis">
                {[a.user?.name, activityAction(a)].filter(Boolean).join(" ")}
              </Text>
              <SegmentedListItem.Supporting>
                <Text
                  style={{ typography: "bodyMedium" }}
                  maxLines={1}
                  overflow="ellipsis"
                >
                  {media?.title?.userPreferred ?? ""}
                </Text>
              </SegmentedListItem.Supporting>
              <SegmentedListItem.Trailing>
                <Box
                  modifiers={[
                    size(34, 50),
                    clip(Shapes.RoundedCorner(8)),
                    background(
                      media?.coverImage?.color ?? m3.surfaceContainerHighest,
                    ),
                  ]}
                >
                  {cover && (
                    <Image
                      source={{ uri: cover }}
                      modifiers={[matchParentSize()]}
                    />
                  )}
                </Box>
              </SegmentedListItem.Trailing>
            </SegmentedListItem>
          );
        })}
      </Column>
    </Column>
  );
}
