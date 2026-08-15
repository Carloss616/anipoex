import { useFragment } from "@apollo/client/react";
import { Spacer } from "@expo/ui";
import { Divider, VStack } from "@expo/ui/swift-ui";
import { glassEffect, opacity } from "@expo/ui/swift-ui/modifiers";
import { Fragment } from "react";
import { EmptyState } from "@/components/empty-state";
import { Column } from "@/components/layout/column";
import { Row } from "@/components/layout/row";
import { Button } from "@/components/ui/button";
import { Typography } from "@/components/ui/typography";
import { MangaDetailFragmentDoc } from "@/features/manga/graphql/manga-fragments.generated";
import { noop } from "@/utils/utils";
import { DownloadButton } from "../download-button";
import type { ChaptersProps } from "./chapters";

export function Chapters({ id, __typename, chapters }: ChaptersProps) {
  const { data } = useFragment({
    fragment: MangaDetailFragmentDoc,
    fragmentName: "MangaDetail",
    from: { __typename, id },
  });

  const progress = data?.mediaListEntry?.progress ?? 0;

  if (!chapters.length) return <EmptyState title="No chapters available" />;

  return (
    <Column
      className="gap-0"
      modifiers={[
        glassEffect({
          glass: { variant: "regular", interactive: false },
          shape: "roundedRectangle",
          cornerRadius: 24,
        }),
      ]}
    >
      {chapters.map((chapter, index) => (
        <Fragment key={chapter.id}>
          {index > 0 && <Divider />}
          <Button key={chapter.id} onPress={noop} variant="ghost">
            <Row alignment="center" className="gap-2 p-4">
              <VStack
                alignment="leading"
                spacing={2}
                modifiers={[opacity(progress > chapter.id ? 0.4 : 1)]}
              >
                <Typography type="body-sm" weight="semibold">
                  {chapter.title}
                </Typography>
                <Typography type="body-xs" muted>
                  {chapter.date}
                </Typography>
              </VStack>
              <Spacer />
              <DownloadButton />
            </Row>
          </Button>
        </Fragment>
      ))}
    </Column>
  );
}
