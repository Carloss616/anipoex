import {
  Button,
  Divider,
  HStack,
  LazyHStack,
  RoundedRectangle,
  ScrollView,
  VStack,
  ZStack,
} from "@expo/ui/swift-ui";
import {
  accessibilityLabel,
  background,
  border,
  buttonStyle,
  clipShape,
  foregroundStyle,
  frame,
  lineLimit,
  onAppear,
  padding,
} from "@expo/ui/swift-ui/modifiers";
import { memo } from "react";
import { Image } from "@/components/native/swift-ui/image";
import { Text } from "@/components/native/swift-ui/text";
import { Loader } from "@/components/ui/loader";
import { Menu } from "@/components/ui/menu";
import { useThemeColor } from "@/hooks/use-theme-color";
import type { RailItem } from "../utils/rail-items";
import { useRail, useSearching } from "./hooks/use-rail";
import type { TitleRailProps } from "./title-rail";

const WIDTH = 80;
const HEIGHT = 114;
const RADIUS = 6;
const COVER = frame({ width: WIDTH, height: HEIGHT });

function Card({ item, muted }: { item: RailItem; muted: string }) {
  return (
    <VStack
      alignment="leading"
      spacing={6}
      modifiers={[
        frame({ width: WIDTH }),
        accessibilityLabel(
          item.current
            ? `${item.manga.title}, current match`
            : item.manga.title,
        ),
      ]}
    >
      <ZStack
        modifiers={[
          COVER,
          background(muted),
          clipShape("roundedRectangle", RADIUS),
          ...(item.current ? [border({ content: "primary", width: 2 })] : []),
        ]}
      >
        {item.manga.thumbnailUrl && <Image url={item.manga.thumbnailUrl} />}
      </ZStack>
      <Text
        textStyle="caption"
        weight="medium"
        modifiers={[
          lineLimit(2),
          frame({ width: WIDTH, alignment: "topLeading" }),
        ]}
      >
        {item.manga.title}
      </Text>
    </VStack>
  );
}

function Rail({ mangaKey, mangaId, source, actions }: TitleRailProps) {
  const muted = useThemeColor("muted");
  const { rail, items, menu, loadMore, retry } = useRail(
    mangaKey,
    mangaId,
    source.id,
    actions,
  );
  if (!rail) return null;

  if (rail.status === "loading")
    return (
      <HStack spacing={10} modifiers={[padding({ bottom: 6 })]}>
        {[0, 1, 2, 3].map((i) => (
          <RoundedRectangle
            key={i}
            cornerRadius={RADIUS}
            modifiers={[COVER, foregroundStyle(muted)]}
          />
        ))}
      </HStack>
    );
  if (rail.status === "error" && items.length === 0)
    return (
      <HStack spacing={8}>
        <Text textStyle="subheadline" modifiers={[foregroundStyle("red")]}>
          Couldn't search
        </Text>
        <Button
          label="Retry"
          onPress={retry}
          modifiers={[buttonStyle("borderless")]}
        />
      </HStack>
    );
  if (items.length === 0)
    return (
      <Text textStyle="subheadline" modifiers={[foregroundStyle("secondary")]}>
        No results
      </Text>
    );

  return (
    <ScrollView axes="horizontal" showsIndicators={false}>
      <LazyHStack
        spacing={10}
        alignment="top"
        modifiers={[padding({ bottom: 6 })]}
      >
        {items.map((item, i) => [
          <Menu key={item.manga.url} items={menu(item)}>
            <Card item={item} muted={muted} />
          </Menu>,
          item.current && i === 0 && items.length > 1 && (
            <Divider key="divider" modifiers={[frame({ height: HEIGHT })]} />
          ),
        ])}
        {(rail.hasNextPage || rail.loadingMore) && (
          // Loads as it scrolls into view; a tap retries a page that failed.
          <Button
            onPress={loadMore}
            modifiers={[
              buttonStyle("plain"),
              onAppear(loadMore),
              accessibilityLabel("More"),
            ]}
          >
            <ZStack
              modifiers={[
                COVER,
                background(muted),
                clipShape("roundedRectangle", RADIUS),
              ]}
            >
              {rail.loadingMore ? (
                <Loader size="sm" />
              ) : (
                <Text textStyle="caption" weight="medium">
                  More
                </Text>
              )}
            </ZStack>
          </Button>
        )}
      </LazyHStack>
    </ScrollView>
  );
}

/** A source's title results under its row, while it searches. */
export const TitleRail = memo(function TitleRail(props: TitleRailProps) {
  return useSearching(props.mangaKey, props.source.id) ? (
    <Rail {...props} />
  ) : null;
});
