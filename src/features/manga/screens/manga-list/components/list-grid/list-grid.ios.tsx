import { useApolloClient } from "@apollo/client/react";
import { ScrollView, ZStack } from "@expo/ui/swift-ui";
import { refreshable } from "@expo/ui/swift-ui/modifiers";
import { useValue } from "@legendapp/state/react";
import { useBreakpoint } from "panelui-native/hooks/use-breakpoint";
import { cn } from "panelui-native/utils/cn";
import { useWindowDimensions } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Center } from "@/components/layout/center";
import { LazyVStack } from "@/components/layout/lazy-v-stack";
import { Row } from "@/components/layout/row";
import { Loader } from "@/components/ui/loader";
import { listView$ } from "@/features/manga/state/list-view";
import { columnsFor, toTitlePosition } from "@/features/manga/utils/list-view";
import { ListEmpty } from "../list-empty";
import { ListItem, useItemWidth } from "../list-item";
import { toRows } from "./grid";
import type { ListGridProps } from "./list-grid";

const ROW = "gap-2 px-gx";

/** Renders inside the screen's Host, which stacks it under the view sheet. */
export function ListGrid({ list, query$, genre$, header }: ListGridProps) {
  const { current } = useBreakpoint();
  const { width } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const { manga$, loading, refetching, refetch } = list;
  const manga = useValue(manga$);
  const client = useApolloClient();

  const columns = columnsFor(current, useValue(listView$.density));
  const titlePosition = toTitlePosition(useValue(listView$.title));
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
    // Keyed: re-parented covers miss their expo-image load; a fresh grid doesn't.
    <ZStack key={titlePosition}>
      <ScrollView
        modifiers={[
          refreshable(async () => {
            await Promise.all([
              refetch(),
              client.refetchQueries({ include: ["MangaListCounts"] }),
            ]);
          }),
        ]}
      >
        <LazyVStack
          className={cn("pb-gb", titlePosition === "below" ? "gap-5" : "gap-2")}
          alignment="leading"
        >
          {header}
          <LazyVStack.ForEach
            data={rows}
            keyExtractor={(row) => row.map((m) => m.id).join()}
            // Two lines of title and the caption sit under the cover when `below`.
            estimatedItemSize={
              cell * 1.5 + (titlePosition === "below" ? 68 : 0)
            }
          >
            {({ item: row }) => (
              <Row className={ROW}>
                {row.map((item) => (
                  <ListItem
                    key={item.id}
                    item={item}
                    width={cell}
                    titlePosition={titlePosition}
                  />
                ))}
              </Row>
            )}
          </LazyVStack.ForEach>
        </LazyVStack>
      </ScrollView>
      {/* Over the grid, centred in the visible area; a lazy row can't fill it. */}
      {rows.length === 0 && <ListEmpty genre$={genre$} query$={query$} />}
    </ZStack>
  );
}
