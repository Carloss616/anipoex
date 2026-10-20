import {
  Button,
  HStack,
  Image,
  ProgressView,
  Spacer,
  VStack,
} from "@expo/ui/swift-ui";
import {
  accessibilityLabel,
  background,
  buttonStyle,
  controlSize,
  disabled,
  foregroundStyle,
  frame,
  glassEffect,
  kerning,
  padding,
  shapes,
} from "@expo/ui/swift-ui/modifiers";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { GUTTER } from "@/components/native/constants";
import { Text, useFont } from "@/components/native/swift-ui/text";
import { Host } from "@/components/ui/host";
import { useThemeColor } from "@/hooks/use-theme-color";
import type { ChapterEndProps } from "./chapter-end";

type Style = Parameters<typeof buttonStyle>[0];

function Lines({ changes }: { changes: string[] }) {
  return changes.map((line) => (
    <Text
      key={line}
      textStyle="footnote"
      modifiers={[foregroundStyle("secondary")]}
    >
      {line}
    </Text>
  ));
}

/** A button as wide as its row: the label fills it, so the whole capsule is the button. */
function Wide({
  label,
  style,
  onPress,
}: {
  label: string;
  style: Style;
  onPress: () => void;
}) {
  const font = useFont("body", "medium");

  return (
    <Button
      onPress={onPress}
      modifiers={[buttonStyle(style), controlSize("large")]}
    >
      <Text modifiers={[font, frame({ maxWidth: Infinity })]}>{label}</Text>
    </Button>
  );
}

export function ChapterEnd({
  chapter,
  save,
  onUndo,
  onAdd,
  onNotNow,
  next,
  onBack,
}: ChapterEndProps) {
  const insets = useSafeAreaInsets();
  const success = useThemeColor("success");
  const successSoft = useThemeColor("success-soft");
  const undoFont = useFont("subheadline", "medium");
  const confirming = save.state === "confirm";
  const saving = save.state === "saving";

  return (
    <Host matchContents={{ vertical: true }} className="w-full">
      <VStack
        alignment="leading"
        spacing={24}
        modifiers={[
          // Clear of the page count floating at the bottom.
          padding({ horizontal: GUTTER, top: 32, bottom: insets.bottom + 80 }),
          frame({ maxWidth: Infinity, alignment: "leading" }),
        ]}
      >
        <VStack alignment="leading" spacing={4}>
          <Text
            textStyle="caption"
            modifiers={[foregroundStyle("secondary"), kerning(2)]}
          >
            END OF
          </Text>
          <Text textStyle="title2" weight="semibold">
            {chapter}
          </Text>
        </VStack>

        {(save.state === "saved" || saving) && (
          <HStack
            alignment="top"
            spacing={12}
            modifiers={[
              padding({ all: 16 }),
              background(
                successSoft,
                shapes.roundedRectangle({ cornerRadius: 16 }),
              ),
            ]}
          >
            {saving ? (
              <ProgressView />
            ) : (
              <Image systemName="checkmark.circle.fill" color={success} />
            )}
            <VStack alignment="leading" spacing={4}>
              <Text weight="semibold">
                {saving ? "Saving to AniList…" : "Saved to AniList"}
              </Text>
              <Lines changes={save.changes} />
            </VStack>
            <Spacer />
            <Button
              label="Undo"
              onPress={onUndo}
              modifiers={[
                buttonStyle("borderless"),
                undoFont,
                disabled(saving),
                accessibilityLabel("Undo the AniList save"),
              ]}
            />
          </HStack>
        )}

        {confirming && (
          <VStack
            alignment="leading"
            spacing={12}
            modifiers={[
              padding({ all: 16 }),
              frame({ maxWidth: Infinity, alignment: "leading" }),
              glassEffect({
                glass: { variant: "regular" },
                shape: "roundedRectangle",
                cornerRadius: 24,
              }),
            ]}
          >
            <Text weight="semibold">Not in your AniList list</Text>
            <VStack alignment="leading" spacing={4}>
              <Text
                textStyle="subheadline"
                modifiers={[foregroundStyle("secondary")]}
              >
                Add it to your list?
              </Text>
              <Lines changes={save.changes} />
            </VStack>
            <HStack spacing={8}>
              <Wide
                label="Add to list"
                style="glassProminent"
                onPress={onAdd}
              />
              <Wide label="Not now" style="glass" onPress={onNotNow} />
            </HStack>
          </VStack>
        )}

        <VStack spacing={10}>
          {next && (
            // Secondary while the add card above asks for the primary tap.
            <Wide
              label={next.label}
              style={confirming ? "glass" : "glassProminent"}
              onPress={next.onPress}
            />
          )}
          <Wide label="Back to chapters" style="glass" onPress={onBack} />
        </VStack>
      </VStack>
    </Host>
  );
}
