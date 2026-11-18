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
import {
  useCustomLists,
  useMangaListCounts,
} from "@/features/manga/hooks/use-manga-list-counts";
import {
  libraryScan$,
  scanReading,
  stopReadingScan,
} from "@/features/manga/state/library-scan";
import { listOptions$ } from "@/features/manga/state/list-options";
import { hasActiveFilters } from "@/features/manga/utils/list-options";
import { type ListKey, parseList } from "@/features/manga/utils/parse-list";
import { MediaListStatus } from "@/graphql/types.generated";
import { useSearchQuery } from "@/hooks/use-search-query";
import { useThemeM3Colors } from "@/hooks/use-theme/use-theme.android";
import { ListPage } from "./components/list-page";
import { ListRedirect } from "./components/list-redirect";
import { OptionsSheet, openOptionsSheet } from "./components/options-sheet";

const openCustomLists = () => router.push("/manga/custom-lists");

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

/** Tinted while a filter is on; the sort alone doesn't count. */
function OptionsAction() {
  const filtered = useValue(() => hasActiveFilters(listOptions$.filters.get()));
  const m3 = useThemeM3Colors();

  return (
    <IconButton
      onClick={openOptionsSheet}
      colors={{ contentColor: filtered ? m3.primary : undefined }}
    >
      <Icon
        name={Icons.filter}
        accessibilityLabel="List options"
        color="inherit"
      />
    </IconButton>
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
  const counts = useMangaListCounts();
  const customLists = useCustomLists();
  const tabs = [
    ...MANGA_STATUS_ENTRIES.map(([key, title]) => ({
      key: key as ListKey,
      title,
      count: counts[key] ?? undefined,
    })),
    ...(customLists ?? []).map(({ key, name, count }) => ({
      key,
      title: name,
      count,
    })),
  ];
  // A custom list shows Reading's page until the lists load.
  const page = Math.max(
    0,
    tabs.findIndex(({ key }) => key === status),
  );
  const { query$, setQuery } = useSearchQuery();
  const [visited, setVisited] = useState(() => new Set([status]));
  const lists$ = useObservable(
    Object.fromEntries(
      [...MANGA_STATUS_ENTRIES.map(([key]) => key), status].map((key) => [
        key,
        emptyMangaList(),
      ]),
    ) as Record<ListKey, MangaListStore>,
  );

  const select = (key: ListKey) => router.setParams({ list: key });

  useEffect(() => {
    if (!lists$[status].peek()) lists$[status].set(emptyMangaList());
    setVisited((seen) => (seen.has(status) ? seen : new Set(seen).add(status)));
  }, [status, lists$]);

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <Host className="flex-1">
        <TopAppBar
          search={{ placeholder: "Search manga", onChangeText: setQuery }}
          scrollBehavior="enterAlways"
          tabs={tabs}
          page={page}
          // Not M3's 52dp: the labels line up with the search bar and covers.
          tabsEdgePadding={Math.max(insets.left, insets.right)}
          onPageChange={(index) => {
            const tab = tabs[index];
            if (index !== page && tab) select(tab.key);
          }}
          modifiers={[fillMaxSize()]}
        >
          <TopAppBar.Actions>
            <IconButton onClick={openCustomLists}>
              <Icon
                name={Icons.listEdit}
                accessibilityLabel="Manage lists"
                color="inherit"
              />
            </IconButton>
            <OptionsAction />
            {status === MediaListStatus.Current && <ScanAction />}
          </TopAppBar.Actions>
          {tabs.map(({ key }) =>
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
        <OptionsSheet />
      </Host>
      <ListRedirect list={status} />
    </>
  );
}
