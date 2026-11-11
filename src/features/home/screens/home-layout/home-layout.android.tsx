import { Box, Column, Switch } from "@expo/ui/jetpack-compose";
import {
  fillMaxSize,
  fillMaxWidth,
  padding,
  semantics,
  verticalScroll,
} from "@expo/ui/jetpack-compose/modifiers";
import { useValue } from "@legendapp/state/react";
import { Stack } from "expo-router";
import { useHeaderHeight } from "expo-router/react-navigation";
import { GUTTER } from "@/components/native/constants";
import { ButtonGroup } from "@/components/native/jetpack-compose/button-group";
import { pinnedScrollBehavior } from "@/components/native/jetpack-compose/pinned-scroll-behavior";
import {
  SEGMENTED_GAP,
  SegmentedListItem,
} from "@/components/native/jetpack-compose/segmented-list-item";
import { Text } from "@/components/native/jetpack-compose/text";
import { Host } from "@/components/ui/host";
import { Icons } from "@/components/ui/icon";
import { ContextMenu } from "@/components/ui/menu";
import { useSetHeaderScrolled } from "@/hooks/use-header-scroll";
import { useThemeM3Colors } from "@/hooks/use-theme/use-theme.android";
import { settings$ } from "@/state/settings";
import {
  ACCOUNT_SECTIONS,
  PRESET_LABELS,
  PRESET_NOTES,
  PRESETS,
  type Preset,
  SECTIONS,
} from "../../constants";
import { moved, toggled, withPreset } from "../../utils/home-layout";

const PRESET_KEYS = Object.keys(PRESETS) as Preset[];

/**
 * Presets as a button group, then every section with its switch. M3 has no
 * drag to reorder a lazy list: a row's long-press menu moves it.
 */
export function HomeLayout() {
  const layout = useValue(settings$.home);
  const headerHeight = useHeaderHeight();
  const setHeaderScrolled = useSetHeaderScrolled();
  const m3 = useThemeM3Colors();
  const preset = PRESET_KEYS.indexOf(layout.preset as Preset);
  const { order } = layout;

  return (
    <>
      <Stack.Title>Home layout</Stack.Title>
      <Host className="flex-1" style={{ marginTop: headerHeight }}>
        <Box
          modifiers={[fillMaxSize(), pinnedScrollBehavior(setHeaderScrolled)]}
        >
          <Column
            modifiers={[
              verticalScroll(),
              fillMaxWidth(),
              padding(GUTTER, 8, GUTTER, GUTTER),
            ]}
          >
            <ButtonGroup
              options={PRESET_KEYS.map((key) => PRESET_LABELS[key])}
              selected={preset < 0 ? [] : [preset]}
              onChange={(index) =>
                settings$.home.set(withPreset(PRESET_KEYS[index]))
              }
              modifiers={[fillMaxWidth()]}
            />
            <Text
              style={{ typography: "bodyMedium" }}
              color={m3.onSurfaceVariant}
              modifiers={[padding(4, 8, 4, 0)]}
            >
              {PRESET_NOTES[layout.preset]}
            </Text>
            <Text
              style={{ typography: "titleSmall" }}
              color={m3.primary}
              modifiers={[padding(4, 24, 4, 8)]}
            >
              Sections
            </Text>
            <Column verticalArrangement={{ spacedBy: SEGMENTED_GAP }}>
              {order.map((id, i) => {
                const on = layout.on.includes(id);
                const toggle = () => settings$.home.set(toggled(layout, id));
                const move = (to: number) =>
                  settings$.home.set(moved(layout, id, to));
                return (
                  <ContextMenu
                    key={id}
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
                        disabled: i === order.length - 1,
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
                      count={order.length}
                      colors={{ containerColor: m3.surfaceContainerLow }}
                      onPress={toggle}
                    >
                      <Text>{SECTIONS[id].title}</Text>
                      {ACCOUNT_SECTIONS.includes(id) && (
                        <SegmentedListItem.Supporting>
                          <Text style={{ typography: "bodyMedium" }}>
                            AniList account
                          </Text>
                        </SegmentedListItem.Supporting>
                      )}
                      <SegmentedListItem.Trailing>
                        <Switch
                          value={on}
                          onCheckedChange={toggle}
                          modifiers={[
                            semantics({
                              contentDescription: `Show ${SECTIONS[id].title}`,
                            }),
                          ]}
                        />
                      </SegmentedListItem.Trailing>
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
              Long-press a section to move it.
            </Text>
          </Column>
        </Box>
      </Host>
    </>
  );
}
