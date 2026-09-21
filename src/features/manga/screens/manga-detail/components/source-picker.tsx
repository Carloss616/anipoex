import { useValue } from "@legendapp/state/react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { Typography } from "@/components/ui/typography";
import { MOCK_SOURCES } from "@/features/manga/sources";
import { source$ } from "@/features/manga/state/source";
import { SourceSheet } from "./source-sheet";

/**
 * The source is the scope of the chapter list, so its trigger sits against what
 * it changes. Named for the control rather than `Source`, which is the shape a
 * registry hands over.
 */
export function SourcePicker({
  mangaId,
  entryId,
  total,
}: {
  mangaId: number;
  entryId: number | null | undefined;
  total: number | null | undefined;
}) {
  const [isPresented, setIsPresented] = useState(false);
  const sourceId = useValue(source$[mangaId]);

  const source = MOCK_SOURCES.find((entry) => entry.id === sourceId);

  return (
    <>
      <Button variant="ghost" size="sm" onPress={() => setIsPresented(true)}>
        <Typography type="body-sm" muted>
          {source?.name ?? "Source"}
        </Typography>
        <Icon
          name={Icon.select({
            ios: "chevron.down",
            android: require("@expo/material-symbols/arrow_drop_down.xml"),
            web: "chevron-down",
          })}
          size={16}
          className="text-inherit web:text-primary"
        />
      </Button>

      <SourceSheet
        isPresented={isPresented}
        entryId={entryId}
        total={total}
        selectedId={sourceId}
        onSelect={(nextId) => {
          source$[mangaId].set(nextId);
          setIsPresented(false);
        }}
        onDismiss={() => setIsPresented(false)}
      />
    </>
  );
}
