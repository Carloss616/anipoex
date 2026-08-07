import { RNHostView, Spacer } from "@expo/ui";
import { Stack, useIsPreview, useLocalSearchParams } from "expo-router";
import { cn } from "heroui-native/utils";
import { useState } from "react";
import { Platform, View } from "react-native";
import { Column } from "@/components/layout/column";
import { Row } from "@/components/layout/row";
import { ScrollView } from "@/components/layout/scroll-view";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Chip } from "@/components/ui/chip";
import { Host } from "@/components/ui/host";
import { Icon } from "@/components/ui/icon";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Typography } from "@/components/ui/typography";
import { useStackToolbarTheme } from "@/hooks/use-theme";
import { noop } from "@/utils/utils";
import { CHAPTERS, MANGA_DETAIL } from "../../mocks";
import { Chapters } from "./components/chapters";
import { DownloadButton } from "./components/download-button";

function Cover() {
  return (
    <Card className="aspect-2/3 w-36 p-0">
      <Card.Body className="web:flex-1 items-center justify-center">
        <Icon
          name={Icon.select({
            ios: "book",
            android: require("@expo/material-symbols/book_5.xml"),
            web: "book-open",
          })}
          size={22}
          colorClassName="accent-muted"
        />
      </Card.Body>
    </Card>
  );
}

function Meta({ className }: { className: string }) {
  const isPreview = useIsPreview();

  return (
    <Column className={cn("gap-2", className)} alignment="start">
      <Typography.Heading type="h3" className={cn(!isPreview && "hidden")}>
        {MANGA_DETAIL.title}
      </Typography.Heading>
      <Row className="gap-1" alignment="center">
        <Icon
          name={Icon.select({
            ios: "person",
            android: require("@expo/material-symbols/person.xml"),
            web: "user",
          })}
          size={12}
          colorClassName="accent-muted"
        />
        <Typography.Paragraph type="body-sm" color="muted">
          {MANGA_DETAIL.author}
        </Typography.Paragraph>
      </Row>
      <Row className="gap-1" alignment="center">
        <Icon
          name={Icon.select({
            ios: "clock",
            android: require("@expo/material-symbols/schedule.xml"),
            web: "clock",
          })}
          size={12}
          colorClassName="accent-muted"
        />
        <Typography.Paragraph type="body-sm" color="muted">
          {MANGA_DETAIL.status}
        </Typography.Paragraph>
      </Row>
      <Row className="gap-1" alignment="center">
        <Icon
          name={Icon.select({
            ios: "calendar",
            android: require("@expo/material-symbols/calendar_today.xml"),
            web: "calendar",
          })}
          size={12}
          colorClassName="accent-muted"
        />
        <Typography.Paragraph type="body-sm" color="muted">
          {MANGA_DETAIL.year}
        </Typography.Paragraph>
      </Row>
      <Row className="gap-1" alignment="center">
        <Icon
          name={Icon.select({
            ios: "star",
            android: require("@expo/material-symbols/star.xml"),
            web: "star",
          })}
          size={12}
          colorClassName="accent-muted"
        />
        <Typography.Paragraph type="body-sm" color="muted">
          {MANGA_DETAIL.score}
        </Typography.Paragraph>
      </Row>
    </Column>
  );
}

function Tracking() {
  return (
    <Button
      variant={Platform.select({
        android: "outline",
        default: "tertiary",
      })}
      onPress={noop}
      className="h-auto web:w-full web:rounded-full py-4"
    >
      <Column className="web:w-full gap-2">
        <Row alignment="center" className="gap-2">
          <RNHostView matchContents>
            <View className="size-2 rounded-full bg-accent" />
          </RNHostView>
          <Button.Label className="ios:text-foreground">Reading</Button.Label>
          <Spacer flexible />
          <Typography.Code className="web:self-auto">42/120</Typography.Code>
          <Typography type="body-xs" color="muted">
            35%
          </Typography>
          <Icon
            name={Icon.select({
              ios: "chevron.right",
              android: require("@expo/material-symbols/chevron_right.xml"),
              web: "chevron-right",
            })}
            size={18}
            colorClassName="web:accent-accent"
          />
        </Row>
        <Progress value={0.35} />
      </Column>
    </Button>
  );
}

function Synopsis() {
  const [collapse, setCollapse] = useState(false);
  return (
    <Typography.Paragraph
      numberOfLines={collapse ? undefined : 2}
      color="muted"
      onPress={() => setCollapse((c) => !c)}
    >
      {MANGA_DETAIL.synopsis}
    </Typography.Paragraph>
  );
}

function Actions() {
  return (
    <Row alignment="center">
      <Button variant="ghost" className="h-auto">
        <Column className="web:self-auto! gap-0.5" alignment="center">
          <Icon
            name={Icon.select({
              ios: "book",
              android: require("@expo/material-symbols/book_2.xml"),
              web: "book-open",
            })}
            size={18}
            colorClassName="web:accent-accent"
          />
          <Button.Label className="ios:text-foreground">Source</Button.Label>
        </Column>
      </Button>
      <Spacer flexible />
      <Separator orientation="vertical" className="h-8" />
      <Spacer flexible />
      <Button variant="ghost" className="h-auto">
        <Column className="web:self-auto! gap-0.5" alignment="center">
          <Icon
            name={Icon.select({
              ios: "hourglass",
              android: require("@expo/material-symbols/hourglass.xml"),
              web: "hourglass",
            })}
            size={18}
            colorClassName="web:accent-accent"
          />
          <Button.Label className="ios:text-foreground">4 days</Button.Label>
        </Column>
      </Button>
      <Spacer flexible />
      <Separator orientation="vertical" className="h-8" />
      <Spacer flexible />
      <Button variant="ghost" className="h-auto">
        <Column className="web:self-auto! gap-0.5" alignment="center">
          <Icon
            name={Icon.select({
              ios: "globe",
              android: require("@expo/material-symbols/public.xml"),
              web: "globe",
            })}
            size={18}
            colorClassName="web:accent-accent"
          />
          <Button.Label className="ios:text-foreground">Website</Button.Label>
        </Column>
      </Button>
    </Row>
  );
}

export function MangaDetail() {
  const isPreview = useIsPreview();
  const { id } = useLocalSearchParams<{ id: string }>();
  const toolbarTheme = useStackToolbarTheme();

  return (
    <>
      <Stack.Title large>
        {MANGA_DETAIL.title} - {id}
      </Stack.Title>
      <Stack.Toolbar placement="right" {...toolbarTheme}>
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
          <Column className="gutters pt-gt pb-gb">
            <Column className="gutters gap-6 android:px-safe-offset-gx px-gx">
              <Row className="gap-4" alignment="center">
                <Cover />
                <Meta className="web:self-auto!" />
              </Row>

              <Tracking />
              <Actions />
              <Synopsis />
            </Column>

            <ScrollView direction="horizontal" showsIndicators={false}>
              <Row className="gutters gap-2 android:px-safe-offset-gx px-gx py-6">
                {MANGA_DETAIL.genres.map((g) => (
                  <Chip key={g} variant="secondary" size="sm">
                    <Chip.Label>{g}</Chip.Label>
                  </Chip>
                ))}
              </Row>
            </ScrollView>

            <Column className="gutters gap-6 android:px-safe-offset-gx px-gx">
              <Row alignment="center" className="gap-2">
                <Typography weight="semibold">Chapters</Typography>
                <Badge>{CHAPTERS.length}</Badge>
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
