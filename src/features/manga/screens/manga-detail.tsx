import { Spacer } from "@expo/ui";
import { Stack, useIsPreview, useLocalSearchParams } from "expo-router";
import { useThemeColor } from "heroui-native/hooks";
import { cn } from "heroui-native/utils";
import { Fragment, useState } from "react";
import { Column } from "@/components/layout/column";
import { Row } from "@/components/layout/row";
import { ScrollView } from "@/components/layout/scroll-view";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Chip } from "@/components/ui/chip";
import { Host } from "@/components/ui/host";
import { Icon } from "@/components/ui/icon";
import { Progress } from "@/components/ui/progress";
import { Typography } from "@/components/ui/typography";
import { noop } from "@/utils/utils";
import { CHAPTERS, MANGA_DETAIL, STATS } from "../mocks";

function Cover() {
  const mutedColor = useThemeColor("muted");
  return (
    <Card className="aspect-2/3 w-30 p-0 md:w-36">
      <Card.Body className="web:flex-1 items-center justify-center">
        <Icon
          name={Icon.select({
            ios: "book",
            android: require("@expo/material-symbols/book_5.xml"),
            web: "book-open",
          })}
          size={22}
          color={mutedColor}
        />
      </Card.Body>
    </Card>
  );
}

function Meta() {
  const isPreview = useIsPreview();
  const mutedColor = useThemeColor("muted");

  return (
    <Column className="gap-2" alignment="center">
      <Typography.Heading type="h3" className={cn(!isPreview && "hidden")}>
        {MANGA_DETAIL.title}
      </Typography.Heading>
      <Typography.Paragraph type="body-sm" color="muted">
        {MANGA_DETAIL.author}
      </Typography.Paragraph>
      <Row className="web:self-auto! gap-1" alignment="center">
        <Icon
          name={Icon.select({
            ios: "star",
            android: require("@expo/material-symbols/star.xml"),
            web: "star",
          })}
          size={13}
          color={mutedColor}
        />
        <Typography.Paragraph type="body-sm" color="muted">
          {MANGA_DETAIL.score} · {MANGA_DETAIL.year} · {MANGA_DETAIL.status}
        </Typography.Paragraph>
      </Row>
      <Row className="web:self-auto! gap-2">
        {MANGA_DETAIL.genres.map((g) => (
          <Chip key={g} variant="secondary" size="sm">
            <Chip.Label>{g}</Chip.Label>
          </Chip>
        ))}
      </Row>
    </Column>
  );
}
function Actions({
  saved,
  onToggle,
}: {
  saved: boolean;
  onToggle: () => void;
}) {
  return (
    <Row className="gap-3" alignment="center">
      <Button className="flex-1">
        <Icon
          name={Icon.select({
            ios: "play",
            android: require("@expo/material-symbols/play_arrow.xml"),
            web: "play",
          })}
          size={18}
          className="android:light:text-white text-accent-foreground"
        />
        <Button.Label>Continue {MANGA_DETAIL.lastRead}</Button.Label>
      </Button>
      <Button
        isIconOnly
        variant={saved ? "secondary" : "outline"}
        onPress={onToggle}
      >
        <Icon
          name={Icon.select({
            ios: saved ? "bookmark.fill" : "bookmark",
            android: saved
              ? require("@expo/material-symbols/bookmark_check.xml")
              : require("@expo/material-symbols/bookmark.xml"),
            web: saved ? "bookmark-check" : "bookmark",
          })}
          size={24}
          className="text-muted"
        />
      </Button>
    </Row>
  );
}

function ProgressIndicator() {
  return (
    <Column className="gap-1">
      <Row className="gap-2">
        <Typography.Paragraph type="body-xs" color="muted">
          Progress
        </Typography.Paragraph>
        <Spacer flexible />
        <Typography.Paragraph type="body-xs" color="muted">
          {Math.round(MANGA_DETAIL.progress * 100)}%
        </Typography.Paragraph>
      </Row>
      <Progress value={MANGA_DETAIL.progress} />
      {/* <Slider value={MANGA_DETAIL.progress * 100}>
        <Slider.Track className="h-1">
          <Slider.Fill />
        </Slider.Track>
      </Slider> */}
    </Column>
  );
}

function Synopsis() {
  return (
    <Typography.Paragraph numberOfLines={3} color="muted">
      {MANGA_DETAIL.synopsis}
    </Typography.Paragraph>
  );
}

/**
 * `Spacer flexible` instead of `flex-1` on each item: `UniversalStyle` has no
 * flex, so the slack is distributed by spacers rather than by the children.
 */
function Stats() {
  return (
    <Card variant="tertiary" className="web:w-full">
      <Row alignment="center">
        {STATS.map((s, i) => (
          <Fragment key={s.label}>
            {i > 0 && (
              <>
                <Spacer flexible />
                <Column className="h-8 w-px bg-separator" />
                <Spacer flexible />
              </>
            )}
            <Column className="gap-0.5" alignment="center">
              <Typography.Paragraph className="font-semibold">
                {s.value}
              </Typography.Paragraph>
              <Typography.Paragraph type="body-xs" color="muted">
                {s.label}
              </Typography.Paragraph>
            </Column>
          </Fragment>
        ))}
      </Row>
    </Card>
  );
}

function Chapters() {
  const mutedColor = useThemeColor("muted");
  return (
    <Column className="web:items-stretch! gap-3">
      {CHAPTERS.map((c) => (
        <Card key={c.id} className="p-3" onPress={noop}>
          <Row className="gap-3" alignment="center">
            <Column className="gap-0.5">
              <Typography.Paragraph
                numberOfLines={1}
                color={c.read ? "muted" : "default"}
                className="font-medium"
              >
                {c.title}
              </Typography.Paragraph>
              <Typography.Paragraph type="body-xs" color="muted">
                {c.date}
              </Typography.Paragraph>
            </Column>
            <Spacer flexible />
            {c.read && (
              <Icon
                name={Icon.select({
                  ios: "checkmark",
                  android: require("@expo/material-symbols/check.xml"),
                  web: "check",
                })}
                size={14}
                color={mutedColor}
              />
            )}
            <Icon
              name={Icon.select({
                ios: "chevron.right",
                android: require("@expo/material-symbols/chevron_right.xml"),
                web: "chevron-right",
              })}
              size={16}
              color={mutedColor}
            />
          </Row>
        </Card>
      ))}
    </Column>
  );
}

export function MangaDetail() {
  const isPreview = useIsPreview();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [saved, setSaved] = useState(false);

  return (
    <>
      <Stack.Title large>{MANGA_DETAIL.title}</Stack.Title>
      <Stack.Toolbar placement="right">
        <Stack.Toolbar.Menu
          icon={Icon.select({
            ios: "ellipsis",
            android: require("@expo/material-symbols/more_vert.xml"),
          })}
        >
          <Stack.Toolbar.MenuAction
            icon={Icon.select({
              ios: "square.and.arrow.up",
              android: require("@expo/material-symbols/share.xml"),
            })}
          >
            Share
          </Stack.Toolbar.MenuAction>
          <Stack.Toolbar.MenuAction
            icon={Icon.select({
              ios: "arrow.down.circle",
              android: require("@expo/material-symbols/download.xml"),
            })}
          >
            Download
          </Stack.Toolbar.MenuAction>
        </Stack.Toolbar.Menu>
      </Stack.Toolbar>

      <Host className={cn("flex-1", isPreview && "ios:bg-background")}>
        <ScrollView>
          <Column className="gap-6 px-gutter py-gutter">
            <Column className="gap-6" alignment="center">
              <Cover />
              <Meta />
              <Synopsis />
            </Column>

            <Column className="gap-6">
              <Actions saved={saved} onToggle={() => setSaved((s) => !s)} />
              <ProgressIndicator />
              <Stats />
              <Typography.Paragraph className="font-semibold">
                Chapters
              </Typography.Paragraph>
              <Chapters />
              <Typography.Paragraph type="body-xs" color="muted">
                ID: {id}
              </Typography.Paragraph>
            </Column>
          </Column>
        </ScrollView>
      </Host>
    </>
  );
}
