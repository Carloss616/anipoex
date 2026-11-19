import { Button, HStack, Spacer, VStack } from "@expo/ui/swift-ui";
import { foregroundStyle } from "@expo/ui/swift-ui/modifiers";
import { Memo } from "@legendapp/state/react";
import { useRouter } from "expo-router";
import { ROW_FILL } from "@/components/native/swift-ui/constants";
import { Text } from "@/components/native/swift-ui/text";
import { Badge } from "@/components/ui/badge";
import { Icon, Icons } from "@/components/ui/icon";
import { badgeCount } from "@/features/activity/utils/badge-count";
import { DESCRIPTIONS } from "../../../constants";
import { activityLabel } from "./utils/activity-label";

export function ActivityRow() {
  const router = useRouter();

  return (
    <Button onPress={() => router.push("/settings/activity")}>
      <HStack spacing={8} modifiers={ROW_FILL}>
        <VStack alignment="leading">
          <Text modifiers={[foregroundStyle("primary")]}>Activity</Text>
          <Text
            textStyle="subheadline"
            modifiers={[foregroundStyle("secondary")]}
          >
            {DESCRIPTIONS.activity}
          </Text>
        </VStack>
        <Spacer />
        <Memo>
          {() => (
            <Text modifiers={[foregroundStyle("secondary")]}>
              {activityLabel()}
            </Text>
          )}
        </Memo>
        <Memo>
          {() => {
            const count = badgeCount();
            return count ? <Badge color="inherit">{count}</Badge> : null;
          }}
        </Memo>
        <Icon name={Icons.chevronRight} size={13} muted />
      </HStack>
    </Button>
  );
}
