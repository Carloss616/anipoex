import { Spacer } from "@expo/ui";
import { Stack, useIsPreview, useLocalSearchParams } from "expo-router";
import { cn } from "panelui-native/utils/cn";
import { EmptyState } from "@/components/empty-state";
import { Center } from "@/components/layout/center";
import { Column } from "@/components/layout/column";
import { Row } from "@/components/layout/row";
import { ScrollView } from "@/components/layout/scroll-view";
import { withWebToolbar } from "@/components/layout/with-web-toolbar";
import { Badge } from "@/components/ui/badge";
import { Chip } from "@/components/ui/chip";
import { Host } from "@/components/ui/host";
import { Icon } from "@/components/ui/icon";
import { Spinner } from "@/components/ui/spinner";
import { Typography } from "@/components/ui/typography";
import { useMangaEntry } from "@/features/manga/hooks/use-manga-entry";
import { useStackToolbarTheme } from "@/hooks/use-theme";
import { noop } from "@/utils/utils";
import { MangaCard } from "../../components/manga-card";
import { CHAPTERS } from "../../mocks";
import { Actions } from "./components/actions";
import { Chapters } from "./components/chapters";
import { DownloadButton } from "./components/download-button";
import { Meta } from "./components/meta";
import { Synopsis } from "./components/synopsis";
import { Tracking } from "./components/tracking";

const MENU_ACTIONS = [
  {
    icon: Icon.select({
      ios: "square.and.arrow.up",
      android: require("@expo/material-symbols/share.xml"),
      web: "share",
    }),
    label: "Share",
    onPress: noop,
  },
  {
    icon: Icon.select({
      ios: "arrow.down.circle",
      android: require("@expo/material-symbols/download.xml"),
      web: "download",
    }),
    label: "Download",
    onPress: noop,
  },
] as const;

export function MangaDetail() {
  const isPreview = useIsPreview();
  const { id } = useLocalSearchParams<{ id: string }>();
  const toolbarTheme = useStackToolbarTheme();
  const { manga, loading, refetching } = useMangaEntry(id);

  if (loading || refetching || !manga) {
    return (
      <>
        <Stack.Title large>{manga.title?.userPreferred}</Stack.Title>
        <Host className={cn("flex-1", isPreview && "ios:bg-background")}>
          <Center>
            {loading || refetching ? (
              <Spinner size="lg" />
            ) : (
              <EmptyState
                title="Manga not found"
                description="We couldn't find this manga on AniList."
              />
            )}
          </Center>
        </Host>
      </>
    );
  }

  return (
    <>
      <Stack.Title large>{manga.title?.userPreferred}</Stack.Title>
      {withWebToolbar(
        <Stack.Toolbar placement="right" {...toolbarTheme}>
          <Stack.Toolbar.Menu
            icon={Icon.select({
              ios: "ellipsis",
              android: require("@expo/material-symbols/more_vert.xml"),
              web: "ellipsis-vertical",
            })}
            accessibilityLabel="More options"
          >
            {MENU_ACTIONS.map(({ icon, label, onPress }) => (
              <Stack.Toolbar.MenuAction
                key={label}
                icon={icon}
                onPress={onPress}
              >
                {label}
              </Stack.Toolbar.MenuAction>
            ))}
          </Stack.Toolbar.Menu>
        </Stack.Toolbar>,
      )}

      <Host className={cn("flex-1", isPreview && "ios:bg-background")}>
        <ScrollView>
          <Column className="gutters pt-gt pb-gb">
            <Column className="gutters gap-6 android:px-safe-offset-gx px-gx">
              <Row className="gap-4" alignment="center">
                <MangaCard
                  cover={manga.coverImage?.large}
                  coverThumb={manga.coverImage?.medium}
                  coverColor={manga.coverImage?.color}
                  className="w-36"
                />
                <Meta manga={manga} className="web:self-auto!" />
              </Row>

              <Tracking id={manga.id} __typename={manga.__typename} />
              <Actions id={manga.id} />
              <Synopsis text={manga.description} />
            </Column>

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

            <Column className="gutters gap-6 android:px-safe-offset-gx px-gx">
              <Row alignment="center" className="gap-2">
                <Typography weight="semibold">Chapters</Typography>
                <Badge>{manga.chapters ?? CHAPTERS.length}</Badge>
                <Spacer flexible />
                <DownloadButton />
              </Row>
              <Chapters
                id={manga.id}
                __typename={manga.__typename}
                chapters={[]}
              />
            </Column>
          </Column>
        </ScrollView>
      </Host>
    </>
  );
}
