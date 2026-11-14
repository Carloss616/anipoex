import { Row } from "@expo/ui/jetpack-compose";
import { Memo } from "@legendapp/state/react";
import { useRouter } from "expo-router";
import { SegmentedListItem } from "@/components/native/jetpack-compose/segmented-list-item";
import { Text } from "@/components/native/jetpack-compose/text";
import { Icon, Icons } from "@/components/ui/icon";
import { DESCRIPTIONS } from "../../constants";
import { useRowProps } from "../../hooks/use-row-props";
import { LeadingIcon } from "../leading-icon";
import { runningLabel } from "./utils";

export function ActivitySection() {
  const router = useRouter();
  const row = useRowProps();

  return (
    <SegmentedListItem
      index={0}
      count={1}
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
          <Memo>{() => <Text>{runningLabel()}</Text>}</Memo>
          <Icon name={Icons.chevronRight} color="inherit" />
        </Row>
      </SegmentedListItem.Trailing>
    </SegmentedListItem>
  );
}
