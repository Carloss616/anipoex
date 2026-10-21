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
  buttonStyle,
  clipShape,
  foregroundStyle,
  frame,
  multilineTextAlignment,
  onAppear,
  padding,
} from "@expo/ui/swift-ui/modifiers";
import { Text } from "@/components/native/swift-ui/text";
import { Loader } from "@/components/ui/loader";
import { Menu } from "@/components/ui/menu";
import { useThemeColor } from "@/hooks/use-theme-color";
import { COVER } from "../constants";
import type { RailProps } from "../rail";
import { RailCard } from "../rail-card";
import { useRail } from "./hooks/use-rail";

const RADIUS = 6;
const COVER_FRAME = frame(COVER);

/** The rail itself: a skeleton while the first page loads, then the cards and a More card. */
export function RailContent({ mangaKey, mangaId, source, actions }: RailProps) {
  const [muted, foreground] = useThemeColor(["muted", "foreground"]);
  const { rail, items, notice, menu, loadMore, retry } = useRail(
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
            modifiers={[COVER_FRAME, foregroundStyle(muted)]}
          />
        ))}
      </HStack>
    );
  // A failed or empty first page, said beside the current card when there is one.
  const line =
    notice === "error" ? (
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
    ) : notice === "empty" ? (
      <Text textStyle="subheadline" modifiers={[foregroundStyle("secondary")]}>
        No results
      </Text>
    ) : null;
  if (items.length === 0) return line;

  return (
    <VStack alignment="leading" spacing={8}>
      <ScrollView axes="horizontal" showsIndicators={false}>
        <LazyHStack
          spacing={10}
          alignment="top"
          modifiers={[padding({ bottom: 6 })]}
        >
          {items.map((item, i) => [
            <Menu key={item.manga.url} items={menu(item)}>
              {/* A menu label takes the tint and centres its text: the card keeps its own look. */}
              <VStack
                modifiers={[
                  foregroundStyle(foreground),
                  multilineTextAlignment("leading"),
                ]}
              >
                <RailCard item={item} />
              </VStack>
            </Menu>,
            item.current && i === 0 && items.length > 1 && (
              <Divider
                key="divider"
                modifiers={[frame({ height: COVER.height })]}
              />
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
                  COVER_FRAME,
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
      {line}
    </VStack>
  );
}
