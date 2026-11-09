import { useValue } from "@legendapp/state/react";
import { Stack } from "expo-router";
import { Typography } from "panelui-native/components/typography";
import { Button } from "panelui-web/button";
import { ButtonGroup } from "panelui-web/button-group";
import { Frame } from "panelui-web/frame";
import { Switch } from "panelui-web/switch";
import { memo } from "react";
import { ScrollView, View } from "react-native";
import { HeaderInsetView } from "@/components/layout/header-inset-view";
import { Badge } from "@/components/ui/badge";
import { Icon } from "@/components/ui/icon";
import { useDragReorder } from "@/hooks/use-drag-reorder";
import { useHeaderScroll } from "@/hooks/use-header-scroll";
import { settings$ } from "@/state/settings";
import {
  ACCOUNT_SECTIONS,
  PRESET_LABELS,
  PRESET_NOTES,
  type Preset,
  SECTIONS,
  type SectionId,
} from "../../constants";
import { moved, toggled, withPreset } from "../../utils/home-layout";

const PRESETS: Preset[] = ["balanced", "discover", "personal"];

const KIND_LABELS = {
  continue: "Progress rows",
  hero: "Hero carousel",
  rail: "Rail",
  genres: "Genre tiles",
  activity: "Activity list",
};

/** Presets in a button group, the sections as rows with a drag handle. */
export function HomeLayout() {
  const headerScroll = useHeaderScroll();
  const preset = useValue(settings$.home.preset);
  const order = useValue(() => settings$.home.order.get().join()).split(
    ",",
  ) as SectionId[];

  return (
    <>
      <Stack.Title>Home layout</Stack.Title>
      <ScrollView className="flex-1" {...headerScroll}>
        <HeaderInsetView className="gutters px-gx pb-gb w-full max-w-2xl gap-4 self-center">
          <Frame className="mt-4">
            <Frame.Header>
              <Frame.Title>Preset</Frame.Title>
            </Frame.Header>
            <Frame.Panel>
              <View className="flex-row flex-wrap items-center gap-3 p-4">
                <ButtonGroup aria-label="Preset">
                  {PRESETS.map((id) => (
                    <Button
                      key={id}
                      size="sm"
                      variant={preset === id ? "secondary" : "outline"}
                      aria-pressed={preset === id}
                      onClick={() => settings$.home.set(withPreset(id))}
                    >
                      {PRESET_LABELS[id]}
                    </Button>
                  ))}
                </ButtonGroup>
                <Typography type="body-sm" muted>
                  {PRESET_NOTES[preset]}
                </Typography>
              </View>
            </Frame.Panel>
          </Frame>
          <Frame>
            <Frame.Header>
              <Frame.Title>Sections</Frame.Title>
            </Frame.Header>
            <Frame.Panel>
              {order.map((id, index) => (
                <SectionRow
                  key={id}
                  id={id}
                  index={index}
                  count={order.length}
                />
              ))}
            </Frame.Panel>
          </Frame>
          <Typography type="body-sm" muted>
            Drag a row by its handle, or focus the handle and press ↑ or ↓.
            Changes reach Home right away.
          </Typography>
          <View className="items-start">
            <Button
              variant="ghost"
              onClick={() => settings$.home.set(withPreset("balanced"))}
            >
              Reset to Balanced
            </Button>
          </View>
        </HeaderInsetView>
      </ScrollView>
    </>
  );
}

const SectionRow = memo(function SectionRow({
  id,
  index,
  count,
}: {
  id: SectionId;
  index: number;
  count: number;
}) {
  const on = useValue(() => settings$.home.on.get().includes(id));
  const { title, kind } = SECTIONS[id];
  const { row, handle } = useDragReorder({
    index,
    count,
    label: `Reorder ${title}, position ${index + 1} of ${count}`,
    onMove: (to) => settings$.home.set(moved(settings$.home.peek(), id, to)),
  });

  return (
    <View {...row}>
      <Frame.Row>
        <Frame.Media>
          <Button variant="ghost" size="icon-sm" {...handle}>
            <Icon name="grip-vertical" muted />
          </Button>
        </Frame.Media>
        <Frame.Content>
          <Frame.Title as="p">
            {title}{" "}
            {ACCOUNT_SECTIONS.includes(id) && <Badge>AniList account</Badge>}
          </Frame.Title>
          <Frame.Description>{KIND_LABELS[kind]}</Frame.Description>
        </Frame.Content>
        <Frame.Actions>
          <Switch
            label={`Show ${title}`}
            checked={on}
            onCheckedChange={() =>
              settings$.home.set(toggled(settings$.home.peek(), id))
            }
          />
        </Frame.Actions>
      </Frame.Row>
    </View>
  );
});
