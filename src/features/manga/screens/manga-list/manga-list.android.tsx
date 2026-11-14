import { IconButton } from "@expo/ui/jetpack-compose";
import { fillMaxSize } from "@expo/ui/jetpack-compose/modifiers";
import { useObservable, useValue } from "@legendapp/state/react";
import { router, Stack, useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { LoadingState } from "@/components/blocks/loading-state";
import { TopAppBar } from "@/components/native/jetpack-compose/top-app-bar";
import { Host } from "@/components/ui/host";
import { Icon, Icons } from "@/components/ui/icon";
import { Menu } from "@/components/ui/menu";
import { MANGA_STATUS_ENTRIES } from "@/features/manga/constants";
import {
  emptyMangaList,
  type MangaListStore,
} from "@/features/manga/hooks/use-manga-list";
import { useMangaListCounts } from "@/features/manga/hooks/use-manga-list-counts";
import {
  libraryScan$,
  scanReading,
  stopReadingScan,
} from "@/features/manga/state/library-scan";
import { parseList } from "@/features/manga/utils/parse-list";
import { MediaListStatus } from "@/graphql/types.generated";
import { useSearchQuery } from "@/hooks/use-search-query";
import { useThemeM3Colors } from "@/hooks/use-theme/use-theme.android";
import { ListPage } from "./components/list-page";
import { openViewSheet, ViewSheet } from "./components/view-sheet";

const ACTIVITY_ITEM = {
  label: "Activity",
  onPress: () => router.push("/settings/activity"),
};
const SCAN_ITEMS = [
  { label: "Scan for new chapters", onPress: () => void scanReading() },
  {
    label: "Rescan everything",
    onPress: () => void scanReading({ everything: true }),
  },
  ACTIVITY_ITEM,
];
const SCANNING_ITEMS = [
  ACTIVITY_ITEM,
  { label: "Stop scan", onPress: stopReadingScan },
];

function ScanButton({
  onPress,
  color,
}: {
  onPress?: () => void;
  color?: string;
}) {
  return (
    <IconButton onClick={onPress} colors={{ contentColor: color }}>
      <Icon
        name={Icons.scanList}
        accessibilityLabel="Scan Reading"
        color="inherit"
      />
    </IconButton>
  );
}

/** Its own component, so a scan starting or ending redraws only this. */
function ScanAction() {
  const scanning = useValue(libraryScan$);
  const m3 = useThemeM3Colors();

  return (
    <Menu items={scanning ? SCANNING_ITEMS : SCAN_ITEMS}>
      <ScanButton color={scanning ? m3.primary : undefined} />
    </Menu>
  );
}

/**
 * Android: a search app bar over M3 tabs and a pager, drawn in the screen's own
 * Host instead of the stack header, so the bar and tabs can leave together as
 * a page scrolls. A page loads the first time it's shown.
 */
export function MangaList() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { list } = useLocalSearchParams<{ list?: string }>();
  const status = parseList(list);
  const page = MANGA_STATUS_ENTRIES.findIndex(([key]) => key === status);
  const counts = useMangaListCounts();
  const { query$, setQuery } = useSearchQuery();
  const [visited, setVisited] = useState(() => new Set([status]));
  const lists$ = useObservable(
    Object.fromEntries(
      MANGA_STATUS_ENTRIES.map(([key]) => [key, emptyMangaList()]),
    ) as Record<MediaListStatus, MangaListStore>,
  );

  const select = (key: MediaListStatus) => router.setParams({ list: key });

  useEffect(() => {
    setVisited((seen) => (seen.has(status) ? seen : new Set(seen).add(status)));
  }, [status]);

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <Host className="flex-1">
        <TopAppBar
          search={{ placeholder: "Search manga", onChangeText: setQuery }}
          scrollBehavior="enterAlways"
          tabs={MANGA_STATUS_ENTRIES.map(([key, title]) => ({
            title,
            count: counts[key] ?? undefined,
          }))}
          page={page}
          // Not M3's 52dp: the labels line up with the search bar and covers.
          tabsEdgePadding={Math.max(insets.left, insets.right)}
          onPageChange={(index) => select(MANGA_STATUS_ENTRIES[index][0])}
          modifiers={[fillMaxSize()]}
        >
          <TopAppBar.Actions>
            <IconButton onClick={openViewSheet}>
              <Icon
                name={Icons.grid}
                accessibilityLabel="View options"
                color="inherit"
              />
            </IconButton>
            {status === MediaListStatus.Current && <ScanAction />}
          </TopAppBar.Actions>
          {MANGA_STATUS_ENTRIES.map(([key]) =>
            visited.has(key) ? (
              <ListPage
                key={key}
                status={key}
                query$={query$}
                list$={lists$[key]}
              />
            ) : (
              <LoadingState key={key} variant="spinner" />
            ),
          )}
        </TopAppBar>
        <ViewSheet />
      </Host>
    </>
  );
}
