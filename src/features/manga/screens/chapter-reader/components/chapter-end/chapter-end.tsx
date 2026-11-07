import { Typography } from "panelui-native/components/typography";
import { Alert } from "panelui-web/alert";
import { Button } from "panelui-web/button";
import { View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export interface ChapterEndProps {
  /** "Chapter 13". */
  chapter: string;
  /**
   * What reaching the end is saving or saved, or would add once confirmed;
   * "none" shows nothing.
   */
  save: { state: "saved" | "saving" | "confirm" | "none"; changes: string[] };
  onUndo: () => void;
  onAdd: () => void;
  onNotNow: () => void;
  /** "Load chapter 14" or "Load next chapter"; absent after the last one. */
  next?: { label: string; onPress: () => void };
  onBack: () => void;
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
      className="gutters px-gx gap-6 pt-8"
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
        <Alert tone={saving ? "neutral" : "success"}>
          <Alert.Icon />
          <Alert.Title>
            {saving ? "Saving to AniList…" : "Saved to AniList"}
          </Alert.Title>
          <Alert.Description className="whitespace-pre-line">
            {save.changes.join("\n")}
          </Alert.Description>
          <Alert.Actions>
            <Button
              variant="ghost"
              size="sm"
              onClick={onUndo}
              disabled={saving}
              aria-label="Undo the AniList save"
            >
              Undo
            </Button>
          </Alert.Actions>
        </Alert>
      )}

      {confirming && (
        <Alert tone="info">
          <Alert.Icon />
          <Alert.Title>Not in your AniList list</Alert.Title>
          <Alert.Description className="whitespace-pre-line">
            {["Add it to your list?", ...save.changes].join("\n")}
          </Alert.Description>
          <Alert.Actions>
            <Button variant="outline" size="sm" onClick={onNotNow}>
              Not now
            </Button>
            <Button size="sm" onClick={onAdd}>
              Add to list
            </Button>
          </Alert.Actions>
        </Alert>
      )}

      <View className="gap-2.5">
        {next && (
          // Secondary while the add card above asks for the primary tap.
          <Button
            size="lg"
            variant={confirming ? "secondary" : "default"}
            onClick={next.onPress}
          >
            {next.label}
          </Button>
        )}
        <Button size="lg" variant="outline" onClick={onBack}>
          Back to chapters
        </Button>
      </View>
    </View>
  );
}
