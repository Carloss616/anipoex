import { FilledTonalButton, IconButton, Row } from "@expo/ui/jetpack-compose";
import { semantics } from "@expo/ui/jetpack-compose/modifiers";
import { Text } from "@/components/native/jetpack-compose/text";
import { Icon, Icons } from "@/components/ui/icon";
import { useSourcePicker } from "../../hooks/use-source-picker";
import type { SourcePickerProps } from "./source-picker";

export function SourcePicker({ manga, entryId, open$ }: SourcePickerProps) {
  const picker = useSourcePicker(manga, entryId, open$);

  return (
    <>
      {/* M3's padding for a button with a trailing icon. */}
      <FilledTonalButton
        onClick={picker.open}
        contentPadding={{ start: 16, top: 8, end: 12, bottom: 8 }}
      >
        <Row verticalAlignment="center" horizontalArrangement={{ spacedBy: 8 }}>
          <Text style={{ typography: "labelLarge" }}>{picker.label}</Text>
          <Icon name={Icons.chevronDown} size={18} color="inherit" />
        </Row>
      </FilledTonalButton>
      {picker.hasWeb && (
        <IconButton
          onClick={picker.openWeb}
          modifiers={[
            semantics({ contentDescription: `Open on ${picker.label}` }),
          ]}
        >
          <Icon name={Icons.website} size={20} color="inherit" />
        </IconButton>
      )}
    </>
  );
}
