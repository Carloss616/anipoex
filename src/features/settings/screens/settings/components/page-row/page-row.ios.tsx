import { Button, HStack, Spacer, ZStack } from "@expo/ui/swift-ui";
import {
  background,
  clipShape,
  foregroundStyle,
  frame,
  lineLimit,
} from "@expo/ui/swift-ui/modifiers";
import { Computed } from "@legendapp/state/react";
import { useRouter } from "expo-router";
import { ROW_FILL } from "@/components/native/swift-ui/constants";
import { Text } from "@/components/native/swift-ui/text";
import { Icon, Icons } from "@/components/ui/icon";
import {
  PAGE_ICONS,
  PAGE_SUMMARIES,
} from "@/features/settings/utils/page-details";
import { ICON_TINTS } from "../../constants";
import type { PageRowProps } from "./page-row";

const TILE = 28;

export function PageRow({ page }: PageRowProps) {
  const router = useRouter();
  const summary = PAGE_SUMMARIES[page.id];

  return (
    <Button onPress={() => router.push(page.href)}>
      <HStack spacing={12} modifiers={ROW_FILL}>
        <ZStack
          modifiers={[
            frame({ width: TILE, height: TILE }),
            background(ICON_TINTS[page.id]),
            clipShape("roundedRectangle", 7),
          ]}
        >
          <Icon name={PAGE_ICONS[page.id]} size={15} color="white" />
        </ZStack>
        <Text modifiers={[foregroundStyle("primary")]}>{page.title}</Text>
        <Spacer />
        {summary && (
          <Computed>
            {() => (
              <Text modifiers={[foregroundStyle("secondary"), lineLimit(1)]}>
                {summary()}
              </Text>
            )}
          </Computed>
        )}
        <Icon name={Icons.chevronRight} size={13} muted />
      </HStack>
    </Button>
  );
}
