import { useValue } from "@legendapp/state/react";
import { Stack } from "expo-router";
import { Typography } from "panelui-native/components/typography";
import { Button } from "panelui-web/button";
import { Frame } from "panelui-web/frame";
import { memo } from "react";
import { ScrollView, View } from "react-native";
import { EmptyState } from "@/components/blocks/empty-state";
import { HeaderInsetView } from "@/components/layout/header-inset-view";
import { Icon } from "@/components/ui/icon";
import {
  languageName,
  languageOrder$,
  useLoadInstalled,
} from "@/features/extensions";
import {
  type DragList$,
  useDragList,
  useDragReorder,
} from "@/hooks/use-drag-reorder";
import { useHeaderScroll } from "@/hooks/use-header-scroll";
import { settings$ } from "@/state/settings";
import { moveTo } from "@/utils/move-to";
import { EMPTY, FOOTNOTE } from "./constants";

/** The installed languages as rows with a drag handle. */
export function Languages() {
  useLoadInstalled();
  const headerScroll = useHeaderScroll();
  const drag$ = useDragList();
  const order = useValue(() => languageOrder$.get().join()).split(",");
  const codes = order.filter(Boolean);

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
      <ScrollView className="flex-1" {...headerScroll}>
        <HeaderInsetView className="gutters px-gx pb-gb w-full max-w-2xl gap-4 self-center">
          <Frame className="mt-4">
            <Frame.Panel data-attached="column">
              {codes.map((code, index) => (
                <LanguageRow
                  key={code}
                  drag$={drag$}
                  code={code}
                  index={index}
                  count={codes.length}
                />
              ))}
            </Frame.Panel>
          </Frame>
          <Typography type="body-sm" muted>
            {FOOTNOTE}
          </Typography>
        </HeaderInsetView>
      </ScrollView>
    </>
  );
}

const LanguageRow = memo(function LanguageRow({
  drag$,
  code,
  index,
  count,
}: {
  drag$: DragList$;
  code: string;
  index: number;
  count: number;
}) {
  const name = languageName(code);
  const { row, handle } = useDragReorder({
    drag$,
    index,
    count,
    label: `Reorder ${name}, position ${index + 1} of ${count}`,
    onMove: (to) =>
      settings$.sources.languages.set(moveTo(languageOrder$.peek(), code, to)),
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
          <Frame.Title as="p">{name}</Frame.Title>
          {/* Without Intl.DisplayNames the name is already the code. */}
          {name !== code.toUpperCase() && (
            <Frame.Description>{code.toUpperCase()}</Frame.Description>
          )}
        </Frame.Content>
      </Frame.Row>
    </View>
  );
});
