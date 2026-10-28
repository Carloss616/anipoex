import { Alert } from "panelui-native/components/alert";
import { Surface } from "panelui-native/components/surface";
import { Typography } from "panelui-native/components/typography";
import { View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Button } from "@/components/ui/button";

export interface ChapterEndProps {
  /** "Chapter 13". */
  chapter: string;
  /** What reaching the end is saving or saved, or would add once confirmed; "none" shows nothing. */
  save: { state: "saved" | "saving" | "confirm" | "none"; changes: string[] };
  onUndo: () => void;
  onAdd: () => void;
  onNotNow: () => void;
  /** "Load chapter 14" or "Load next chapter"; absent after the last one. */
  next?: { label: string; onPress: () => void };
  onBack: () => void;
}

function Lines({ changes }: { changes: string[] }) {
  return changes.map((line) => (
    <Typography key={line} type="body-xs" muted>
      {line}
    </Typography>
  ));
}

/** The block under the last page: the AniList save, then the way on. */
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
  const confirming = save.state === "confirm";
  const saving = save.state === "saving";

  return (
    <View
      className="gutters gap-6 px-gx pt-8"
      // Clear of the page count floating at the bottom.
      style={{ paddingBottom: insets.bottom + 80 }}
    >
      <View className="gap-1">
        <Typography type="body-xs" muted className="tracking-widest">
          END OF
        </Typography>
        <Typography type="h4">{chapter}</Typography>
      </View>

      {(save.state === "saved" || saving) && (
        <Alert variant={saving ? "default" : "success"} className="items-start">
          <Alert.Indicator />
          <Alert.Content>
            <Alert.Title>
              {saving ? "Saving to AniList…" : "Saved to AniList"}
            </Alert.Title>
            <Lines changes={save.changes} />
          </Alert.Content>
          <Button
            variant="ghost"
            size="sm"
            className="-my-2 -mr-2.5"
            onPress={onUndo}
            disabled={saving}
            accessibilityLabel="Undo the AniList save"
          >
            Undo
          </Button>
        </Alert>
      )}

      {confirming && (
        <Surface bordered className="gap-3">
          <Typography type="body-sm" weight="semibold">
            Not in your AniList list
          </Typography>
          <View>
            <Typography type="body-sm" muted>
              Add it to your list?
            </Typography>
            <Lines changes={save.changes} />
          </View>
          <View className="flex-row gap-2">
            <Button className="flex-1" size="sm" onPress={onAdd}>
              Add to list
            </Button>
            <Button
              className="flex-1"
              size="sm"
              variant="outline"
              onPress={onNotNow}
            >
              Not now
            </Button>
          </View>
        </Surface>
      )}

      <View className="gap-2.5">
        {next && (
          // Secondary while the add card above asks for the primary tap.
          <Button
            size="lg"
            variant={confirming ? "secondary" : "primary"}
            onPress={next.onPress}
          >
            {next.label}
          </Button>
        )}
        <Button size="lg" variant="outline" onPress={onBack}>
          Back to chapters
        </Button>
      </View>
    </View>
  );
}
