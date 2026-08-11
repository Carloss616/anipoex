import { Spacer } from "@expo/ui";
import { Stack, useIsPreview, useLocalSearchParams } from "expo-router";
import { cn } from "heroui-native/utils";
import { EmptyState } from "@/components/empty-state";
import { Center } from "@/components/layout/center";
import { Column } from "@/components/layout/column";
import { Row } from "@/components/layout/row";
import { ScrollView } from "@/components/layout/scroll-view";
import { Badge } from "@/components/ui/badge";
import { Chip } from "@/components/ui/chip";
import { Host } from "@/components/ui/host";
import { Icon } from "@/components/ui/icon";
import { Spinner } from "@/components/ui/spinner";
import { Typography } from "@/components/ui/typography";
import { useMangaEntry } from "@/features/manga/hooks/use-manga-entry";
import { useStackToolbarTheme } from "@/hooks/use-theme";
import { MangaCard } from "../../components/manga-card";
import { CHAPTERS } from "../../mocks";
import { Actions } from "./components/actions";
import { Chapters } from "./components/chapters";
import { DownloadButton } from "./components/download-button";
import { Meta } from "./components/meta";
import { Tracking } from "./components/tracking";

const MENU_ACTIONS = [
  {
    icon: Icon.select({
      ios: "square.and.arrow.up",
      android: require("@expo/material-symbols/share.xml"),
    }),
    label: "Share",
  },
  {
    icon: Icon.select({
      ios: "arrow.down.circle",
      android: require("@expo/material-symbols/download.xml"),
    }),
    label: "Download",
  },
];

export function MangaDetail() {
  const isPreview = useIsPreview();
  const { id } = useLocalSearchParams<{ id: string }>();
  const toolbarTheme = useStackToolbarTheme();
  // `isLoading`, not `isPending`: a disabled query (bad id) is pending forever.
  const { data: manga, isLoading } = useMangaEntry(id);

  if (isLoading || !manga) {
    return (
      <Host className={cn("flex-1", isPreview && "ios:bg-background")}>
        <Center>
          {isLoading ? (
            <Spinner size="lg" />
          ) : (
            <EmptyState
              title="Manga not found"
              description="We couldn't find this manga on AniList."
            />
          )}
        </Center>
      </Host>
    );
  }

  return (
    <>
      <Stack.Title large>{manga.title}</Stack.Title>
      <Stack.Toolbar placement="right" {...toolbarTheme}>
        <Stack.Toolbar.Menu
          icon={Icon.select({
            ios: "ellipsis",
            android: require("@expo/material-symbols/more_vert.xml"),
          })}
        >
          {MENU_ACTIONS.map(({ icon, label }) => (
            <Stack.Toolbar.MenuAction key={label} icon={icon}>
              {label}
            </Stack.Toolbar.MenuAction>
          ))}
        </Stack.Toolbar.Menu>
      </Stack.Toolbar>

      <Host className={cn("flex-1", isPreview && "ios:bg-background")}>
        <ScrollView>
          <Column className="gutters pt-gt pb-gb">
            <Column className="gutters gap-6 android:px-safe-offset-gx px-gx">
              <Row className="gap-4" alignment="center">
                <MangaCard
                  cover={manga.cover}
                  coverThumb={manga.coverThumb}
                  coverColor={manga.coverColor}
                  className="w-36"
                />
                <Meta manga={manga} className="web:self-auto!" />
              </Row>

              <Tracking manga={manga} />
              <Actions />
            </Column>

            {manga.genres.length > 0 && (
              <ScrollView direction="horizontal" showsIndicators={false}>
                <Row className="gutters gap-2 android:px-safe-offset-gx px-gx py-6">
                  {manga.genres.map((g) => (
                    <Chip key={g} variant="secondary" size="sm">
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
              <Chapters />
            </Column>
          </Column>
        </ScrollView>
      </Host>
    </>
  );
}
