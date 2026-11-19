import { Row } from "@expo/ui/jetpack-compose";
import { Memo } from "@legendapp/state/react";
import { useRouter } from "expo-router";
import { SegmentedListItem } from "@/components/native/jetpack-compose/segmented-list-item";
import { Text } from "@/components/native/jetpack-compose/text";
import { Badge } from "@/components/ui/badge";
import { Icon, Icons } from "@/components/ui/icon";
import { DESCRIPTIONS } from "../../../constants";
import { useRowProps } from "../../../hooks/use-row-props";
import { LeadingIcon } from "../../leading-icon";
import type { PendingRowProps } from "./pending-row";
import { countLabel } from "./utils";

export function PendingRow({ index = 0, count = 1 }: PendingRowProps) {
  const router = useRouter();
  const row = useRowProps();

  return (
    <SegmentedListItem
      index={index}
      count={count}
      {...row}
      onPress={() => router.push("/settings/pending")}
    >
      <SegmentedListItem.Leading>
        <LeadingIcon name={Icons.uploading} />
      </SegmentedListItem.Leading>
      <Text>Pending</Text>
      <SegmentedListItem.Supporting>
        <Text style={{ typography: "bodyMedium" }}>{DESCRIPTIONS.pending}</Text>
      </SegmentedListItem.Supporting>
      <SegmentedListItem.Trailing>
        <Row verticalAlignment="center">
          <Memo>
            {() => {
              const count = countLabel();
              return count ? <Badge color="inherit">{count}</Badge> : null;
            }}
          </Memo>
          <Icon name={Icons.chevronRight} color="inherit" />
        </Row>
      </SegmentedListItem.Trailing>
    </SegmentedListItem>
  );
}
