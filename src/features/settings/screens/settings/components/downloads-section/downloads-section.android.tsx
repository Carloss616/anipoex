import { FilledTonalButton } from "@expo/ui/jetpack-compose";
import { fillMaxWidth, padding } from "@expo/ui/jetpack-compose/modifiers";
import { ButtonGroup } from "@/components/native/jetpack-compose/button-group";
import { SegmentedListItem } from "@/components/native/jetpack-compose/segmented-list-item";
import { Text } from "@/components/native/jetpack-compose/text";
import { Icons } from "@/components/ui/icon";
import { Label } from "@/features/settings/components/label";
import { LeadingIcon } from "@/features/settings/components/leading-icon";
import { useRowProps } from "@/features/settings/hooks/use-row-props";
import { useThemeM3Colors } from "@/hooks/use-theme/use-theme.android";
import { DOWNLOADS_FOOTER, SAVE_TO_OPTIONS } from "./constants";
import { useDownloadsSection } from "./hooks/use-downloads-section";

export function DownloadsSection() {
  const downloads = useDownloadsSection();
  const m3 = useThemeM3Colors();
  const row = useRowProps();

  return (
    <>
      <Label>Downloads</Label>
      <Text
        style={{ typography: "bodyMedium" }}
        color={m3.onSurfaceVariant}
        modifiers={[padding(4, 0, 4, 8)]}
      >
        Save to
      </Text>
      <ButtonGroup
        options={SAVE_TO_OPTIONS.map((option) => option.label)}
        selected={[
          SAVE_TO_OPTIONS.findIndex((option) => option.id === downloads.saveTo),
        ]}
        onChange={(index) =>
          void downloads.setSaveTo(SAVE_TO_OPTIONS[index].id)
        }
        modifiers={[fillMaxWidth()]}
      />
      {downloads.note ? (
        <Text
          style={{ typography: "bodyMedium" }}
          color={m3.onSurfaceVariant}
          modifiers={[padding(4, 8, 4, 0)]}
        >
          {downloads.note}
        </Text>
      ) : null}
      {downloads.folder ? (
        <SegmentedListItem
          index={0}
          count={1}
          {...row}
          onPress={downloads.folder.change}
          modifiers={[padding(0, 8, 0, 0)]}
        >
          <SegmentedListItem.Leading>
            <LeadingIcon name={Icons.folder} />
          </SegmentedListItem.Leading>
          <Text>{downloads.folder.name}</Text>
          <SegmentedListItem.Trailing>
            <FilledTonalButton onClick={downloads.folder.change}>
              <Text style={{ typography: "labelLarge" }}>Change</Text>
            </FilledTonalButton>
          </SegmentedListItem.Trailing>
        </SegmentedListItem>
      ) : null}
      <Text
        style={{ typography: "bodySmall" }}
        color={m3.onSurfaceVariant}
        modifiers={[padding(16, 8, 16, 0)]}
      >
        {DOWNLOADS_FOOTER}
      </Text>
    </>
  );
}
