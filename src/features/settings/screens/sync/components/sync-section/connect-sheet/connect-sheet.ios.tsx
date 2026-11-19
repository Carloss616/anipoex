import { Button, HStack, VStack } from "@expo/ui/swift-ui";
import {
  background,
  buttonBorderShape,
  buttonStyle,
  clipShape,
  controlSize,
  disabled,
  foregroundStyle,
  frame,
  padding,
} from "@expo/ui/swift-ui/modifiers";
import { useValue } from "@legendapp/state/react";
import { Text } from "@/components/native/swift-ui/text";
import { BottomSheet } from "@/components/ui/bottom-sheet";
import { Loader } from "@/components/ui/loader";
import {
  closeConnect,
  connect$,
  copyCodeAndOpenGitHub,
} from "@/features/sync/state/connect-sheet";
import { useThemeColor } from "@/hooks/use-theme-color";

const SECONDARY = [foregroundStyle("secondary")];

/** iOS: the code to type on GitHub; the app connects once it's authorized. */
export function ConnectSheet() {
  const open = useValue(connect$.open);
  const code = useValue(connect$.code);
  const error = useValue(connect$.error);
  const tint = useThemeColor("primary");
  const destructive = useThemeColor("destructive");

  return (
    <BottomSheet
      isPresented={open}
      onDismiss={closeConnect}
      contentKey={code ? 1 : 0}
    >
      <Text
        textStyle="title3"
        weight="semibold"
        modifiers={[padding({ all: 16 })]}
      >
        Connect GitHub
      </Text>
      <VStack
        alignment="leading"
        spacing={14}
        modifiers={[
          padding({ horizontal: 16, bottom: 16 }),
          frame({ maxWidth: Infinity }),
        ]}
      >
        <Text textStyle="subheadline" modifiers={SECONDARY}>
          Enter this code on GitHub. It connects here by itself.
        </Text>
        <Text
          textStyle="title"
          weight="semibold"
          modifiers={[
            frame({ maxWidth: Infinity }),
            padding({ vertical: 14 }),
            background(`${tint}26`),
            clipShape("roundedRectangle"),
          ]}
        >
          {code?.userCode ?? "····-····"}
        </Text>
        <Button
          onPress={copyCodeAndOpenGitHub}
          modifiers={[
            buttonStyle("borderedProminent"),
            buttonBorderShape("capsule"),
            controlSize("large"),
            disabled(!code),
          ]}
        >
          <Text modifiers={[frame({ maxWidth: Infinity })]}>
            Copy code and open GitHub
          </Text>
        </Button>
        {error ? (
          <Text
            textStyle="subheadline"
            modifiers={[foregroundStyle(destructive)]}
          >
            {error}
          </Text>
        ) : (
          <HStack spacing={8} modifiers={[frame({ maxWidth: Infinity })]}>
            <Loader size="sm" />
            <Text textStyle="subheadline" modifiers={SECONDARY}>
              Waiting for GitHub…
            </Text>
          </HStack>
        )}
      </VStack>
    </BottomSheet>
  );
}
