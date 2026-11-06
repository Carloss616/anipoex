import { observable } from "@legendapp/state";
import { useValue } from "@legendapp/state/react";
import { Stack } from "expo-router";
import { Typography } from "panelui-native/components/typography";
import { cn } from "panelui-native/utils/cn";
import { Button } from "panelui-web/button";
import { ButtonGroup } from "panelui-web/button-group";
import { Frame } from "panelui-web/frame";
import { Switch } from "panelui-web/switch";
import { type KeyboardEvent, memo, type PointerEvent, useRef } from "react";
import { ScrollView, View } from "react-native";
import { HeaderInsetView } from "@/components/layout/header-inset-view";
import { Badge } from "@/components/ui/badge";
import { Icon } from "@/components/ui/icon";
import { useHeaderScroll } from "@/hooks/use-header-scroll";
import {
  ACCOUNT_SECTIONS,
  PRESET_LABELS,
  PRESET_NOTES,
  type Preset,
  SECTIONS,
  type SectionId,
} from "../../constants";
import {
  homeLayout$,
  moved,
  toggled,
  withPreset,
} from "../../state/home-layout";

const PRESETS: Preset[] = ["balanced", "discover", "personal"];

const KIND_LABELS = {
  continue: "Progress rows",
  hero: "Hero carousel",
  rail: "Rail",
  genres: "Genre tiles",
  activity: "Activity list",
};

/** The row being dragged: where it was, how far it moved, where it lands. */
const drag$ = observable<{
  from: number;
  to: number;
  dy: number;
  height: number;
} | null>(null);

/** How far row `index` is drawn from its place while another one is dragged. */
function shift(index: number) {
  const drag = drag$.get();
  if (!drag) return 0;
  const { from, to, dy, height } = drag;
  if (index === from) return dy;
  if (from < index && index <= to) return -height;
  if (to <= index && index < from) return height;
  return 0;
}

/** Web: presets in a button group, the sections as rows with a drag handle. */
export function HomeLayout() {
  const headerScroll = useHeaderScroll();
  const preset = useValue(homeLayout$.preset);
  const order = useValue(() => homeLayout$.order.get().join()).split(
    ",",
  ) as SectionId[];

  return (
    <>
      <Stack.Title>Home layout</Stack.Title>
      <ScrollView className="flex-1" {...headerScroll}>
        <HeaderInsetView className="gutters w-full max-w-2xl gap-4 self-center px-gx pt-2 pb-gb">
          <Frame>
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
                      onClick={() => homeLayout$.set(withPreset(id))}
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
              onClick={() => homeLayout$.set(withPreset("balanced"))}
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
  const on = useValue(() => homeLayout$.on.get().includes(id));
  const offset = useValue(() => shift(index));
  const dragging = useValue(() => drag$.get()?.from === index);
  // Only while a drag runs: at the drop, the rows jump to their new places.
  const sliding = useValue(() => drag$.get() != null) && !dragging;
  const handle = useRef<HTMLButtonElement>(null);
  const start = useRef(0);
  const { title, kind } = SECTIONS[id];

  const move = (to: number) => {
    homeLayout$.set(moved(homeLayout$.peek(), id, to));
    // Keyed by id, the row keeps its node; moving it in the DOM drops focus.
    requestAnimationFrame(() => handle.current?.focus());
  };

  const onKeyDown = (event: KeyboardEvent) => {
    const step = { ArrowUp: -1, ArrowDown: 1 }[event.key];
    if (!step) return;
    event.preventDefault();
    const to = index + step;
    if (to >= 0 && to < count) move(to);
  };

  const onPointerDown = (event: PointerEvent<HTMLButtonElement>) => {
    const row = event.currentTarget.closest<HTMLElement>("[data-row]");
    if (!row) return;
    event.currentTarget.setPointerCapture(event.pointerId);
    start.current = event.clientY;
    drag$.set({ from: index, to: index, dy: 0, height: row.offsetHeight });
  };

  const onPointerMove = (event: PointerEvent) => {
    const drag = drag$.peek();
    if (drag?.from !== index) return;
    const dy = event.clientY - start.current;
    const to = Math.max(
      0,
      Math.min(count - 1, index + Math.round(dy / drag.height)),
    );
    drag$.set({ ...drag, dy, to });
  };

  const onPointerEnd = () => {
    const drag = drag$.peek();
    if (drag?.from !== index) return;
    drag$.set(null);
    if (drag.to !== index) move(drag.to);
  };

  return (
    <View
      data-row
      style={{
        transform: [{ translateY: offset }],
        zIndex: dragging ? 1 : 0,
      }}
      className={cn(
        dragging && "bg-card shadow-lg",
        sliding && "transition-transform duration-150",
      )}
    >
      <Frame.Row>
        <Frame.Media>
          <Button
            ref={handle}
            variant="ghost"
            size="icon-sm"
            aria-label={`Reorder ${title}, position ${index + 1} of ${count}`}
            className="cursor-grab touch-none active:cursor-grabbing"
            onKeyDown={onKeyDown}
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={onPointerEnd}
            onPointerCancel={onPointerEnd}
          >
            {/* Web only: the native editors reorder their own way. */}
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
              homeLayout$.set(toggled(homeLayout$.peek(), id))
            }
          />
        </Frame.Actions>
      </Frame.Row>
    </View>
  );
});
