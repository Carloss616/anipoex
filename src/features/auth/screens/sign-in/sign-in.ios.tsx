import { Button, VStack } from "@expo/ui/swift-ui";
import {
  buttonStyle,
  disabled,
  foregroundStyle,
  frame,
  multilineTextAlignment,
  padding,
} from "@expo/ui/swift-ui/modifiers";
import { Text, useFont } from "@/components/native/swift-ui/text";
import { Host } from "@/components/ui/host";
import { useSignIn } from "./hooks/use-sign-in";

const CENTER = multilineTextAlignment("center");

export function SignIn() {
  const { isBusy, signIn, close } = useSignIn();
  const buttonFont = useFont("body", "medium");

  return (
    <Host className="flex-1">
      <VStack
        spacing={16}
        modifiers={[
          padding({ horizontal: 32, vertical: 96 }),
          frame({ maxWidth: Infinity, maxHeight: Infinity }),
        ]}
      >
        <Text textStyle="headline" modifiers={[CENTER]}>
          Connect your account
        </Text>
        <Text
          textStyle="caption"
          modifiers={[foregroundStyle("secondary"), CENTER]}
        >
          Sync your reading progress with AniList.
        </Text>
        <Button
          label={isBusy ? "Connecting..." : "Sign in with AniList"}
          onPress={signIn}
          modifiers={[buttonStyle("glass"), buttonFont, disabled(isBusy)]}
        />
        <Button
          label="Not now"
          onPress={close}
          modifiers={[buttonStyle("borderless"), buttonFont, disabled(isBusy)]}
        />
      </VStack>
    </Host>
  );
}
