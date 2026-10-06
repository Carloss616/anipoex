import { ProgressView, ScrollView } from "@expo/ui/swift-ui";
import {
  frame,
  padding,
  refreshable,
  scaleEffect,
  tint,
} from "@expo/ui/swift-ui/modifiers";
import { useValue } from "@legendapp/state/react";
import { useBreakpoint } from "panelui-native/hooks/use-breakpoint";
import { useState } from "react";
import { useWindowDimensions } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Center } from "@/components/layout/center";
import { LazyVStack } from "@/components/layout/lazy-v-stack";
import { Row } from "@/components/layout/row";
import { Host } from "@/components/ui/host";
import { Loader } from "@/components/ui/loader";
import { useMangaList } from "@/features/manga/hooks/use-manga-list";
import { useThemeColor } from "@/hooks/use-theme-color";
import { ListEmpty } from "../list-empty";
import { ListHeader } from "../list-header";
import { ListItem, useItemWidth } from "../list-item";
import { COLUMNS, toRows } from "./grid";
import type { ListSceneProps } from "./list-scene";

const ROW = "gap-2 px-gx";

export function ListScene({ status, query$, counts$ }: ListSceneProps) {
  const { current } = useBreakpoint();
  const { width } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const { manga$, genres$, genre$, loading, refetching, refetch } =
    useMangaList(status, query$, counts$);
  const manga = useValue(manga$);
  const mutedForeground = useThemeColor("muted-foreground");
  const [pulling, setPulling] = useState(false);

  const columns = COLUMNS[current];
  // The Host already insets the safe area.
  const cell = useItemWidth(ROW, columns, width - insets.left - insets.right);
  const rows = toRows(manga, columns);

  if (loading && !refetching) {
    return (
      <Center>
        <Loader variant="morph-ring" speed={3} size="lg" />
      </Center>
    );
  }

  return (
    <Host className="flex-1">
      <ScrollView
        modifiers={[
          refreshable(async () => {
            setPulling(true);
            try {
              await refetch();
            } finally {
              setPulling(false);
            }
          }),
        ]}
      >
        <LazyVStack className="gap-2 pb-gb" alignment="leading">
          {/* Native-looking spinner for refreshes `refreshable` doesn't show. */}
          {refetching && !pulling && (
            <ProgressView
              modifiers={[
                scaleEffect(1.4),
                tint(mutedForeground),
                // The 60pt band the native refresh opens, minus the stack's gap.
                frame({ maxWidth: Infinity, minHeight: 60, maxHeight: 60 }),
                padding({ bottom: -8 }),
              ]}
            />
          )}
          <ListHeader genre$={genre$} genres$={genres$} />
          {rows.length === 0 && <ListEmpty genre$={genre$} query$={query$} />}
          <LazyVStack.ForEach
            data={rows}
            keyExtractor={(row) => row.map((m) => m.id).join()}
            estimatedItemSize={cell * 1.5}
          >
            {({ item: row }) => (
              <Row className={ROW}>
                {row.map((item) => (
                  <ListItem key={item.id} item={item} width={cell} />
                ))}
              </Row>
            )}
          </LazyVStack.ForEach>
        </LazyVStack>
      </ScrollView>
    </Host>
  );
}
