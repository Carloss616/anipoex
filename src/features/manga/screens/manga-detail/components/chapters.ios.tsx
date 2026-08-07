import { Spacer } from "@expo/ui";
import { Divider, VStack } from "@expo/ui/swift-ui";
import { glassEffect } from "@expo/ui/swift-ui/modifiers";
import { Fragment } from "react";
import { Column } from "@/components/layout/column";
import { Row } from "@/components/layout/row";
import { Button } from "@/components/ui/button";
import { Typography } from "@/components/ui/typography";
import { noop } from "@/utils/utils";
import { CHAPTERS } from "../../../mocks";
import { DownloadButton } from "./download-button";

export function Chapters() {
  return (
    <Column
      modifiers={[
        glassEffect({
          glass: { variant: "regular", interactive: false },
          shape: "roundedRectangle",
          cornerRadius: 24,
        }),
      ]}
    >
      {CHAPTERS.map((chapter, index) => (
        <Fragment key={chapter.id}>
          {index > 0 && <Divider />}
          <Button key={chapter.id} onPress={noop} variant="ghost">
            <Row alignment="center" className="gap-2 p-4">
              <VStack alignment="leading" spacing={2}>
                <Typography type="body-sm" weight="semibold">
                  {chapter.title}
                </Typography>
                <Typography type="body-xs" color="muted">
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
