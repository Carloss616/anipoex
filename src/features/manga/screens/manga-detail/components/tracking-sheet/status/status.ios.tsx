import { List, Picker, Section, VStack } from "@expo/ui/swift-ui";
import {
  labelsHidden,
  listRowBackground,
  listStyle,
  pickerStyle,
  scrollContentBackground,
  tag,
  tint,
} from "@expo/ui/swift-ui/modifiers";
import { Text, useFont } from "@/components/native/swift-ui/text";
import { MANGA_STATUS_ENTRIES } from "@/features/manga/constants";
import type { MediaListStatus } from "@/graphql/types.generated";
import { useThemeColor } from "@/hooks/use-theme-color";
import { Header } from "../header.ios";
import { useStatus } from "./hooks/use-status";
import type { StatusProps } from "./status";

/** The statuses as an inline picker: List rows, a check on the chosen one. */
export function Status({
  form,
  mediaId,
  total,
  onCancel,
  onConfirm,
}: StatusProps) {
  const { selected, setSelected, next, dirty, changes } = useStatus(
    form,
    mediaId,
    total,
  );
  const [primary, cell] = useThemeColor(["primary", "muted"]);

  return (
    <VStack alignment="leading" spacing={0}>
      <Header
        title="Status"
        onCancel={onCancel}
        onConfirm={() => onConfirm(next)}
        canConfirm={dirty}
      />

      <List
        modifiers={[
          listStyle("insetGrouped"),
          scrollContentBackground("hidden"),
          useFont(),
        ]}
      >
        <Section
          modifiers={[listRowBackground(cell)]}
          footer={
            changes.length > 0 ? <Text>{changes.join("\n")}</Text> : undefined
          }
        >
          {/* Keyed on the tint: a picker keeps the one it was built with. */}
          <Picker
            key={primary}
            selection={selected ?? null}
            onSelectionChange={(value) => {
              if (typeof value === "string")
                setSelected(value as MediaListStatus);
            }}
            modifiers={[pickerStyle("inline"), labelsHidden(), tint(primary)]}
          >
            {MANGA_STATUS_ENTRIES.map(([status, title]) => (
              <Text key={status} modifiers={[tag(status)]}>
                {title}
              </Text>
            ))}
          </Picker>
        </Section>
      </List>
    </VStack>
  );
}
