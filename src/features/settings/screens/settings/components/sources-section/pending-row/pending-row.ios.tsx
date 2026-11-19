import { Button, HStack, Spacer, VStack } from "@expo/ui/swift-ui";
import { foregroundStyle } from "@expo/ui/swift-ui/modifiers";
import { Memo } from "@legendapp/state/react";
import { useRouter } from "expo-router";
import { ROW_FILL } from "@/components/native/swift-ui/constants";
import { Text } from "@/components/native/swift-ui/text";
import { Badge } from "@/components/ui/badge";
import { Icon, Icons } from "@/components/ui/icon";
import { DESCRIPTIONS } from "../../../constants";
import { countLabel } from "./utils";

export function PendingRow() {
  const router = useRouter();

  return (
    <Button onPress={() => router.push("/settings/pending")}>
      <HStack spacing={8} modifiers={ROW_FILL}>
        <VStack alignment="leading">
          <Text modifiers={[foregroundStyle("primary")]}>Pending</Text>
          <Text
            textStyle="subheadline"
            modifiers={[foregroundStyle("secondary")]}
          >
            {DESCRIPTIONS.pending}
          </Text>
        </VStack>
        <Spacer />
        <Memo>
          {() => {
            const count = countLabel();
            return count ? <Badge color="inherit">{count}</Badge> : null;
          }}
        </Memo>
        <Icon name={Icons.chevronRight} size={13} muted />
      </HStack>
    </Button>
  );
}
