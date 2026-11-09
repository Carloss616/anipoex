import { Column } from "@expo/ui/jetpack-compose";
import {
  fillMaxWidth,
  padding,
  verticalScroll,
} from "@expo/ui/jetpack-compose/modifiers";
import { useValue } from "@legendapp/state/react";
import { Stack } from "expo-router";
import { useHeaderHeight } from "expo-router/react-navigation";
import { EmptyState } from "@/components/blocks/empty-state";
import { GUTTER } from "@/components/native/constants";
import {
  SEGMENTED_GAP,
  SegmentedListItem,
} from "@/components/native/jetpack-compose/segmented-list-item";
import { Text } from "@/components/native/jetpack-compose/text";
import { Host } from "@/components/ui/host";
import { Icons } from "@/components/ui/icon";
import { ContextMenu } from "@/components/ui/menu";
import {
  languageName,
  languageOrder$,
  useLoadInstalled,
} from "@/features/extensions";
import { useThemeM3Colors } from "@/hooks/use-theme/use-theme.android";
import { settings$ } from "@/state/settings";
import { moveTo } from "@/utils/move-to";
import { EMPTY, FOOTNOTE } from "./constants";

/** M3 has no drag to reorder a list: a row's long-press menu moves it. */
export function Languages() {
  useLoadInstalled();
  const codes = useValue(() => languageOrder$.get().join())
    .split(",")
    .filter(Boolean);
  const headerHeight = useHeaderHeight();
  const m3 = useThemeM3Colors();

  if (!codes.length)
    return (
      <>
        <Stack.Title>Languages</Stack.Title>
        <EmptyState {...EMPTY} />
      </>
    );

  return (
    <>
      <Stack.Title>Languages</Stack.Title>
      <Host className="flex-1" style={{ marginTop: headerHeight }}>
        <Column
          modifiers={[
            verticalScroll(),
            fillMaxWidth(),
            padding(GUTTER, 8, GUTTER, GUTTER),
          ]}
        >
          <Column verticalArrangement={{ spacedBy: SEGMENTED_GAP }}>
            {codes.map((code, i) => {
              const move = (to: number) =>
                settings$.sources.languages.set(
                  moveTo(languageOrder$.peek(), code, to),
                );
              return (
                <ContextMenu
                  key={code}
                  items={[
                    {
                      label: "Move up",
                      icon: Icons.moveUp,
                      disabled: i === 0,
                      onPress: () => move(i - 1),
                    },
                    {
                      label: "Move down",
                      icon: Icons.moveDown,
                      disabled: i === codes.length - 1,
                      onPress: () => move(i + 1),
                    },
                    {
                      label: "Move to top",
                      icon: Icons.moveToTop,
                      disabled: i === 0,
                      onPress: () => move(0),
                    },
                  ]}
                >
                  <SegmentedListItem
                    index={i}
                    count={codes.length}
                    containerColor={m3.surfaceContainerLow}
                  >
                    <Text>{languageName(code)}</Text>
                  </SegmentedListItem>
                </ContextMenu>
              );
            })}
          </Column>
          <Text
            style={{ typography: "bodySmall" }}
            color={m3.onSurfaceVariant}
            modifiers={[padding(4, 8, 4, 0)]}
          >
            {`${FOOTNOTE} Long-press one to move it.`}
          </Text>
        </Column>
      </Host>
    </>
  );
}
