import { Row } from "@expo/ui/jetpack-compose";
import { Memo } from "@legendapp/state/react";
import { useRouter } from "expo-router";
import { SegmentedListItem } from "@/components/native/jetpack-compose/segmented-list-item";
import { Text } from "@/components/native/jetpack-compose/text";
import { Badge } from "@/components/ui/badge";
import { Icon, Icons } from "@/components/ui/icon";
import { badgeCount } from "@/features/activity/utils/badge-count";
import { LeadingIcon } from "@/features/settings/components/leading-icon";
import { DESCRIPTIONS } from "@/features/settings/constants";
import { useRowProps } from "@/features/settings/hooks/use-row-props";
import type { ActivityRowProps } from "./activity-row";
import { activityLabel } from "./utils/activity-label";

export function ActivityRow({ index = 0, count = 1 }: ActivityRowProps) {
  const router = useRouter();
  const row = useRowProps();

  return (
    <SegmentedListItem
      index={index}
      count={count}
      {...row}
      onPress={() => router.push("/settings/activity")}
    >
      <SegmentedListItem.Leading>
        <LeadingIcon name={Icons.update} />
      </SegmentedListItem.Leading>
      <Text>Activity</Text>
      <SegmentedListItem.Supporting>
        <Text style={{ typography: "bodyMedium" }}>
          {DESCRIPTIONS.activity}
        </Text>
      </SegmentedListItem.Supporting>
      <SegmentedListItem.Trailing>
        <Row verticalAlignment="center">
          <Memo>{() => <Text>{activityLabel()}</Text>}</Memo>
          <Memo>
            {() => {
              const count = badgeCount();
              return count ? <Badge color="inherit">{count}</Badge> : null;
            }}
          </Memo>
          <Icon name={Icons.chevronRight} color="inherit" />
        </Row>
      </SegmentedListItem.Trailing>
    </SegmentedListItem>
  );
}
