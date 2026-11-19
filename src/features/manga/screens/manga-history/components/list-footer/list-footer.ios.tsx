import { Button, HStack, VStack } from "@expo/ui/swift-ui";
import {
  buttonStyle,
  foregroundStyle,
  frame,
  onAppear,
} from "@expo/ui/swift-ui/modifiers";
import { Text } from "@/components/native/swift-ui/text";
import { Loader } from "@/components/ui/loader";
import type { ListFooterProps } from "./list-footer";

/**
 * The list's last row: shown, it asks for the next page (`onAppear`, since
 * SwiftUI's `List` has no end-reached event).
 */
export function ListFooter({ moreFailed, ended, onLoadMore }: ListFooterProps) {
  const fill = frame({ maxWidth: Infinity });
  if (moreFailed)
    return (
      <VStack spacing={6} modifiers={[fill]}>
        <Text textStyle="footnote" modifiers={[foregroundStyle("secondary")]}>
          Couldn't load older activity
        </Text>
        <Button
          label="Retry"
          onPress={onLoadMore}
          modifiers={[buttonStyle("borderless")]}
        />
      </VStack>
    );
  if (ended)
    return (
      <Text
        textStyle="footnote"
        modifiers={[foregroundStyle("secondary"), fill]}
      >
        That's all since you joined AniList
      </Text>
    );
  return (
    <HStack modifiers={[fill, onAppear(onLoadMore)]}>
      <Loader />
    </HStack>
  );
}
