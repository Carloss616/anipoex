import { IconButton, Row, TextButton } from "@expo/ui/jetpack-compose";
import { semantics } from "@expo/ui/jetpack-compose/modifiers";
import { Text } from "@/components/native/jetpack-compose/text";
import { Icon, Icons } from "@/components/ui/icon";
import { useThemeM3Colors } from "@/hooks/use-theme/use-theme.android";
import { SourceSheet } from "../source-sheet";
import { useSourcePicker } from "./hooks/use-source-picker";
import type { SourcePickerProps } from "./source-picker";

export function SourcePicker({ manga }: SourcePickerProps) {
  const picker = useSourcePicker(manga);
  const m3 = useThemeM3Colors();

  return (
    <>
      <TextButton onClick={picker.open}>
        <Row verticalAlignment="center" horizontalArrangement={{ spacedBy: 4 }}>
          <Text
            style={{ typography: "bodyMedium" }}
            color={m3.onSurfaceVariant}
          >
            {picker.label}
          </Text>
          <Icon name={Icons.chevronDown} size={16} color="inherit" />
        </Row>
      </TextButton>
      {picker.match?.manga && (
        <IconButton
          onClick={picker.openWeb}
          colors={{ contentColor: m3.onSurfaceVariant }}
          modifiers={[
            semantics({ contentDescription: `Open on ${picker.label}` }),
          ]}
        >
          <Icon name={Icons.website} size={20} color="inherit" />
        </IconButton>
      )}

      <SourceSheet
        isPresented={picker.isPresented}
        selectedId={picker.sourceId}
        onSelect={picker.select}
        onDismiss={picker.close}
      />
    </>
  );
}
