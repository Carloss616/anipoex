import { HStack, Section, VStack, ZStack } from "@expo/ui/swift-ui";
import {
  background,
  clipShape,
  foregroundStyle,
  frame,
} from "@expo/ui/swift-ui/modifiers";
import { useValue } from "@legendapp/state/react";
import { Image } from "@/components/native/swift-ui/image";
import { Text } from "@/components/native/swift-ui/text";
import { useThemeColor } from "@/hooks/use-theme-color";
import { session$ } from "@/state/session";
import { useRowBackground } from "../../hooks/use-row-background";
import { greeting } from "../../utils";

const AVATAR = 40;

export function AccountSection() {
  const user = useValue(session$.user);
  const card = useThemeColor("card");
  const rowBackground = useRowBackground();

  return (
    <Section modifiers={[rowBackground]}>
      <HStack spacing={12}>
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
          <Text textStyle="headline">{greeting(user?.name)}</Text>
          <Text
            textStyle="subheadline"
            modifiers={[foregroundStyle("secondary")]}
          >
            Signed in with AniList
          </Text>
        </VStack>
      </HStack>
    </Section>
  );
}
