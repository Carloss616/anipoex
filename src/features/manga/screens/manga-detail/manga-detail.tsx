import { Spacer } from "@expo/ui";
import { Stack, useIsPreview, useLocalSearchParams } from "expo-router";
import { cn } from "panelui-native/utils/cn";
import { EmptyState } from "@/components/empty-state";
import { Center } from "@/components/layout/center";
import { Column } from "@/components/layout/column";
import { Row } from "@/components/layout/row";
import { ScrollView } from "@/components/layout/scroll-view";
import { Toolbar } from "@/components/layout/toolbar";
import { Badge } from "@/components/ui/badge";
import { Chip } from "@/components/ui/chip";
import { Host } from "@/components/ui/host";
import { Icons } from "@/components/ui/icon";
import { Loader } from "@/components/ui/loader";
import { Typography } from "@/components/ui/typography";
import { useMangaEntry } from "@/features/manga/hooks/use-manga-entry";
import { useThemeColor } from "@/hooks/use-theme-color";
import { openExternal } from "@/utils/open-external";
import { noop } from "@/utils/utils";
import { MangaCard } from "../../components/manga-card";
import { CHAPTERS } from "../../mocks";
import { Chapters } from "./components/chapters";
import { DetailScroll } from "./components/detail-scroll";
import { Hero } from "./components/hero";
import { Meta } from "./components/meta";
import { SourcePicker } from "./components/source-picker";
import { Synopsis } from "./components/synopsis";
import { Tracking } from "./components/tracking";

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
  const isPreview = useIsPreview();
  const { id } = useLocalSearchParams<{ id: string }>();
  const mutedForeground = useThemeColor("muted-foreground");
  const { manga, loading, refreshing, refresh } = useMangaEntry(id);

  if (loading || !manga) {
    return (
      <>
        <Stack.Title large>{manga?.title?.userPreferred}</Stack.Title>
        <Host className={cn("flex-1", isPreview && "ios:bg-background")}>
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

      <DetailScroll
        className={cn(isPreview && "ios:bg-background")}
        refreshing={refreshing}
        onRefresh={refresh}
        hero={<Hero manga={manga} />}
      >
        <Column className="gutters pt-gt pb-gb">
          <Row
            className="gutters gap-4 android:px-safe-offset-gx px-gx"
            alignment="end"
          >
            <MangaCard
              cover={manga.coverImage?.large}
              coverThumb={manga.coverImage?.medium}
              coverColor={manga.coverImage?.color}
              accessibilityLabel={manga.title?.userPreferred ?? undefined}
              testID="manga-detail-cover"
              // Width as a style, not `w-36`: inside the Host the card has to read it
              // back to work out its height, and a class never reaches it.
              style={{ width: 144 }}
            />
            <Meta manga={manga} className="web:self-auto! web:flex-1" />
          </Row>

          {!!manga.genres?.length && (
            <ScrollView direction="horizontal" showsIndicators={false}>
              <Row className="gutters gap-2 android:px-safe-offset-gx px-gx py-6">
                {manga.genres.map((g) => (
                  <Chip key={g} size="sm">
                    <Chip.Label>{g}</Chip.Label>
                  </Chip>
                ))}
              </Row>
            </ScrollView>
          )}

          <Column
            className={cn(
              "gutters gap-6 android:px-safe-offset-gx px-gx",
              !manga.genres?.length && "pt-6",
            )}
          >
            <Tracking manga={manga} />
            <Synopsis text={manga.description} />

            <Row alignment="center" className="gap-2">
              <Typography weight="semibold">Chapters</Typography>
              <Badge>{manga.chapters ?? CHAPTERS.length}</Badge>
              <Spacer flexible />
              <SourcePicker
                mangaId={manga.id}
                entryId={manga.mediaListEntry?.id}
                total={manga.chapters}
              />
            </Row>
            <Chapters entryId={manga.mediaListEntry?.id} chapters={CHAPTERS} />
          </Column>
        </Column>
      </DetailScroll>
    </>
  );
}
