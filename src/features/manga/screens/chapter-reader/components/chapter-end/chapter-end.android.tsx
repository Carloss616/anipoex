import {
  Button,
  Column,
  OutlinedButton,
  Row,
  TextButton,
} from "@expo/ui/jetpack-compose";
import {
  background,
  clip,
  fillMaxWidth,
  padding,
  paddingAll,
  Shapes,
  semantics,
  weight,
} from "@expo/ui/jetpack-compose/modifiers";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { GUTTER } from "@/components/native/constants";
import { Text } from "@/components/native/jetpack-compose/text";
import { Host } from "@/components/ui/host";
import { Icon, Icons } from "@/components/ui/icon";
import { Loader } from "@/components/ui/loader";
import { useThemeM3Colors } from "@/hooks/use-theme/use-theme.android";
import type { ChapterEndProps } from "./chapter-end";

const LABEL = { typography: "labelLarge" } as const;
const FILL = [fillMaxWidth()];

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
  const m3 = useThemeM3Colors();
  const confirming = save.state === "confirm";
  const saving = save.state === "saving";

  const lines = save.changes.map((line) => (
    <Text
      key={line}
      style={{ typography: "bodySmall" }}
      color={m3.onSecondaryContainer}
    >
      {line}
    </Text>
  ));

  return (
    <Host matchContents={{ vertical: true }} className="w-full">
      <Column
        verticalArrangement={{ spacedBy: 24 }}
        modifiers={[
          fillMaxWidth(),
          // Clear of the page count floating at the bottom.
          padding(GUTTER, 32, GUTTER, insets.bottom + 80),
        ]}
      >
        <Column verticalArrangement={{ spacedBy: 4 }}>
          <Text
            style={{ typography: "labelMedium" }}
            color={m3.onSurfaceVariant}
          >
            END OF
          </Text>
          <Text style={{ typography: "titleMedium" }}>{chapter}</Text>
        </Column>

        {(save.state === "saved" || saving) && (
          <Row
            verticalAlignment="top"
            horizontalArrangement={{ spacedBy: 12 }}
            modifiers={[
              fillMaxWidth(),
              clip(Shapes.RoundedCorner(16)),
              background(m3.secondaryContainer),
              paddingAll(16),
            ]}
          >
            {saving ? (
              <Loader size="sm" />
            ) : (
              <Icon name={Icons.checkCircle} size={24} color={m3.secondary} />
            )}
            <Column
              verticalArrangement={{ spacedBy: 4 }}
              modifiers={[weight(1)]}
            >
              <Text
                style={{ typography: "titleMedium" }}
                color={m3.onSecondaryContainer}
              >
                {saving ? "Saving to AniList…" : "Saved to AniList"}
              </Text>
              {lines}
            </Column>
            <TextButton
              onClick={onUndo}
              enabled={!saving}
              modifiers={[
                semantics({ contentDescription: "Undo the AniList save" }),
              ]}
            >
              <Text style={LABEL}>Undo</Text>
            </TextButton>
          </Row>
        )}

        {confirming && (
          <Column
            verticalArrangement={{ spacedBy: 12 }}
            modifiers={[
              fillMaxWidth(),
              clip(Shapes.RoundedCorner(16)),
              background(m3.surfaceContainer),
              paddingAll(16),
            ]}
          >
            <Text style={{ typography: "titleMedium" }}>
              Not in your AniList list
            </Text>
            <Column verticalArrangement={{ spacedBy: 4 }}>
              <Text
                style={{ typography: "bodyMedium" }}
                color={m3.onSurfaceVariant}
              >
                Add it to your list?
              </Text>
              {lines}
            </Column>
            <Row horizontalArrangement={{ spacedBy: 8 }}>
              <Button onClick={onAdd} modifiers={[weight(1)]}>
                <Text style={LABEL}>Add to list</Text>
              </Button>
              <OutlinedButton onClick={onNotNow} modifiers={[weight(1)]}>
                <Text style={LABEL}>Not now</Text>
              </OutlinedButton>
            </Row>
          </Column>
        )}

        <Column verticalArrangement={{ spacedBy: 10 }}>
          {next &&
            // Outlined while the add card above asks for the primary tap.
            (confirming ? (
              <OutlinedButton onClick={next.onPress} modifiers={FILL}>
                <Text style={LABEL}>{next.label}</Text>
              </OutlinedButton>
            ) : (
              <Button onClick={next.onPress} modifiers={FILL}>
                <Text style={LABEL}>{next.label}</Text>
              </Button>
            ))}
          <OutlinedButton onClick={onBack} modifiers={FILL}>
            <Text style={LABEL}>Back to chapters</Text>
          </OutlinedButton>
        </Column>
      </Column>
    </Host>
  );
}
