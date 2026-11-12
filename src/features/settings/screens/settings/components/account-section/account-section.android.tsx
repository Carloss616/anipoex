import { Box } from "@expo/ui/jetpack-compose";
import {
  background,
  clip,
  matchParentSize,
  Shapes,
  size,
} from "@expo/ui/jetpack-compose/modifiers";
import { useValue } from "@legendapp/state/react";
import { Image } from "@/components/native/jetpack-compose/image";
import { SegmentedListItem } from "@/components/native/jetpack-compose/segmented-list-item";
import { Text } from "@/components/native/jetpack-compose/text";
import { useThemeM3Colors } from "@/hooks/use-theme/use-theme.android";
import { session$ } from "@/state/session";
import { useRowProps } from "../../hooks/use-row-props";
import { greeting } from "../../utils";

export function AccountSection() {
  const user = useValue(session$.user);
  const m3 = useThemeM3Colors();
  const row = useRowProps();

  return (
    <SegmentedListItem index={0} count={1} {...row}>
      <SegmentedListItem.Leading>
        <Box
          contentAlignment="center"
          modifiers={[
            size(40, 40),
            clip(Shapes.Circle),
            background(m3.primaryContainer),
          ]}
        >
          {user?.avatarUrl ? (
            <Image
              source={{ uri: user.avatarUrl }}
              modifiers={[matchParentSize()]}
            />
          ) : (
            <Text
              style={{ typography: "titleMedium" }}
              color={m3.onPrimaryContainer}
            >
              {user?.name?.[0]?.toUpperCase() ?? "?"}
            </Text>
          )}
        </Box>
      </SegmentedListItem.Leading>
      <Text>{greeting(user?.name)}</Text>
      <SegmentedListItem.Supporting>
        <Text style={{ typography: "bodyMedium" }}>Signed in with AniList</Text>
      </SegmentedListItem.Supporting>
    </SegmentedListItem>
  );
}
