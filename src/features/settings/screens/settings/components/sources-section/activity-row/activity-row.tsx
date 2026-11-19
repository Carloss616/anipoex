import { Memo } from "@legendapp/state/react";
import { useRouter } from "expo-router";
import { Typography } from "panelui-native/components/typography";
import { Frame } from "panelui-web/frame";
import { Badge } from "@/components/ui/badge";
import { badgeCount } from "@/features/activity/utils/badge-count";
import { DESCRIPTIONS } from "../../../constants";
import { activityLabel } from "./utils/activity-label";

export interface ActivityRowProps {
  /**
   * Its place in the section, for its corners.
   * @platform android
   */
  index?: number;
  /** @platform android */
  count?: number;
}

// Takes the props so the Android file, typed through this one, can.
export function ActivityRow(_: ActivityRowProps) {
  const router = useRouter();

  return (
    <Frame.Row chevron onClick={() => router.push("/settings/activity")}>
      <Frame.Content>
        <Frame.Title as="p">Activity</Frame.Title>
        <Frame.Description>{DESCRIPTIONS.activity}</Frame.Description>
      </Frame.Content>
      <Frame.Actions>
        <Typography type="body-sm" muted>
          <Memo>{activityLabel}</Memo>
        </Typography>
        <Memo>
          {() => {
            const count = badgeCount();
            return count ? <Badge color="inherit">{count}</Badge> : null;
          }}
        </Memo>
      </Frame.Actions>
    </Frame.Row>
  );
}
