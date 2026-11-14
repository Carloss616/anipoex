import { Memo } from "@legendapp/state/react";
import { useRouter } from "expo-router";
import { Typography } from "panelui-native/components/typography";
import { Frame } from "panelui-web/frame";
import { DESCRIPTIONS } from "../../constants";
import { runningLabel } from "./utils";

export function ActivitySection() {
  const router = useRouter();

  return (
    <Frame>
      <Frame.Panel data-attached="column">
        <Frame.Row chevron onClick={() => router.push("/settings/activity")}>
          <Frame.Content>
            <Frame.Title as="p">Activity</Frame.Title>
            <Frame.Description>{DESCRIPTIONS.activity}</Frame.Description>
          </Frame.Content>
          <Frame.Actions>
            <Typography type="body-sm" muted>
              <Memo>{runningLabel}</Memo>
            </Typography>
          </Frame.Actions>
        </Frame.Row>
      </Frame.Panel>
    </Frame>
  );
}
