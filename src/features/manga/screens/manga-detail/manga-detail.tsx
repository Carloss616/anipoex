import { Stack, useLocalSearchParams } from "expo-router";
import { EmptyState } from "@/components/empty-state";
import { Center } from "@/components/layout/center";
import { Toolbar } from "@/components/layout/toolbar";
import { Host } from "@/components/ui/host";
import { Icons } from "@/components/ui/icon";
import { Loader } from "@/components/ui/loader";
import { useMangaEntry } from "@/features/manga/hooks/use-manga-entry";
import { useThemeColor } from "@/hooks/use-theme-color";
import { openExternal } from "@/utils/open-external";
import { noop } from "@/utils/utils";
import { CHAPTERS } from "../../mocks";
import { DetailHeader } from "./components/detail-header";
import { DetailList } from "./components/detail-list";
import { Hero } from "./components/hero";
import { SourcePicker } from "./components/source-picker";

const MENU_ACTIONS = [
  {
    icon: Icons.share,
    label: "Share",
    onPress: () => noop(),
  },
  {
    icon: Icons.download,
    label: "Download",
    onPress: () => noop(),
  },
  {
    icon: Icons.openExternal,
    // The destination names itself better than "Website" did.
    label: "View on AniList",
    onPress: (id: string) => openExternal(`https://anilist.co/manga/${id}`),
  },
] as const;

export function MangaDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const mutedForeground = useThemeColor("muted-foreground");
  const { manga, loading, refreshing, refresh } = useMangaEntry(id);

  if (loading || !manga) {
    return (
      <>
        <Stack.Title large>{manga?.title?.userPreferred}</Stack.Title>
        <Host className="flex-1">
          {loading ? (
            <Center>
              <Loader variant="morph-ring" speed={3} size="lg" />
            </Center>
          ) : (
            <EmptyState
              title="Manga not found"
              description="We couldn't find this manga on AniList."
            />
          )}
        </Host>
      </>
    );
  }

  return (
    <>
      <Stack.Title large>{manga.title?.userPreferred}</Stack.Title>
      <Toolbar spinning={refreshing}>
        <Stack.Toolbar placement="right">
          <Stack.Toolbar.Button
            icon={Icons.refresh}
            onPress={refresh}
            disabled={refreshing}
            tintColor={refreshing ? mutedForeground : undefined}
            accessibilityLabel="Refresh"
          />
          <Stack.Toolbar.Menu
            icon={Icons.more}
            accessibilityLabel="More options"
          >
            {MENU_ACTIONS.map(({ icon, label, onPress }) => (
              <Stack.Toolbar.MenuAction
                key={label}
                icon={icon}
                onPress={() => onPress(id)}
              >
                {label}
              </Stack.Toolbar.MenuAction>
            ))}
          </Stack.Toolbar.Menu>
        </Stack.Toolbar>
      </Toolbar>

      <DetailList
        refreshing={refreshing}
        onRefresh={refresh}
        hero={<Hero manga={manga} />}
        chapters={CHAPTERS}
        total={manga.chapters ?? CHAPTERS.length}
        action={
          <SourcePicker
            mangaId={manga.id}
            entryId={manga.mediaListEntry?.id}
            total={manga.chapters}
          />
        }
        entryId={manga.mediaListEntry?.id}
        header={<DetailHeader manga={manga} />}
      />
    </>
  );
}
