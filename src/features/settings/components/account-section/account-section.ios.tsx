import {
  Button,
  HStack,
  Section,
  Spacer,
  VStack,
  ZStack,
} from "@expo/ui/swift-ui";
import {
  background,
  clipShape,
  foregroundStyle,
  frame,
} from "@expo/ui/swift-ui/modifiers";
import { useValue } from "@legendapp/state/react";
import { ROW_FILL } from "@/components/native/swift-ui/constants";
import { Image } from "@/components/native/swift-ui/image";
import { Text } from "@/components/native/swift-ui/text";
import { Icon, Icons } from "@/components/ui/icon";
import { useRowBackground } from "@/features/settings/hooks/use-row-background";
import { greeting } from "@/features/settings/utils/greeting";
import { useThemeColor } from "@/hooks/use-theme-color";
import { session$ } from "@/state/session";
import type { AccountSectionProps } from "./account-section";

const AVATAR = 40;

export function AccountSection({ onPress }: AccountSectionProps) {
  const user = useValue(session$.user);
  const card = useThemeColor("card");
  const rowBackground = useRowBackground();

  const content = (
    <HStack spacing={12} modifiers={onPress ? ROW_FILL : undefined}>
      <ZStack
        modifiers={[
          frame({ width: AVATAR, height: AVATAR }),
          background(card),
          clipShape("circle"),
        ]}
      >
        {user?.avatarUrl ? (
          <Image source={{ uri: user.avatarUrl }} />
        ) : (
          <Text textStyle="headline">
            {user?.name?.[0]?.toUpperCase() ?? "?"}
          </Text>
        )}
      </ZStack>
      <VStack alignment="leading" spacing={2}>
        <Text textStyle="headline" modifiers={[foregroundStyle("primary")]}>
          {greeting(user?.name)}
        </Text>
        <Text
          textStyle="subheadline"
          modifiers={[foregroundStyle("secondary")]}
        >
          Signed in with AniList
        </Text>
      </VStack>
      {onPress && <Spacer />}
      {onPress && <Icon name={Icons.chevronRight} size={13} muted />}
    </HStack>
  );

  return (
    <Section modifiers={[rowBackground]}>
      {onPress ? <Button onPress={onPress}>{content}</Button> : content}
    </Section>
  );
}
