import { Card, Column, FilledTonalButton, Row } from "@expo/ui/jetpack-compose";
import {
  clip,
  fillMaxWidth,
  padding,
  Shapes,
  size,
  weight,
} from "@expo/ui/jetpack-compose/modifiers";
import { ActiveFilters } from "@/components/blocks/active-filters";
import { GUTTER } from "@/components/native/constants";
import { Image } from "@/components/native/jetpack-compose/image";
import { Text } from "@/components/native/jetpack-compose/text";
import { useThemeM3Colors } from "@/hooks/use-theme/use-theme.android";
import { filterBy, openManga } from "../../utils/row-menu";
import type { FilterCardProps } from "./filter-card";
import { useFilterCard } from "./hooks/use-filter-card";

/** The chip that drops the filter, then the manga it narrows to. */
export function FilterCard({ mediaId }: FilterCardProps) {
  const { title, cover, detail } = useFilterCard(mediaId);
  const m3 = useThemeM3Colors();

  return (
    <Column
      verticalArrangement={{ spacedBy: 12 }}
      modifiers={[padding(0, 8, 0, 4)]}
    >
      <ActiveFilters
        filters={[{ label: title, clear: () => filterBy(undefined) }]}
      />
      <Card
        colors={{ containerColor: m3.primaryContainer }}
        modifiers={[fillMaxWidth(), padding(GUTTER, 0, GUTTER, 0)]}
      >
        <Row
          verticalAlignment="center"
          horizontalArrangement={{ spacedBy: 12 }}
          modifiers={[padding(12, 12, 12, 12)]}
        >
          {cover?.medium ? (
            <Image
              source={{ uri: cover.medium }}
              modifiers={[size(46, 68), clip(Shapes.RoundedCorner(8))]}
            />
          ) : null}
          <Column modifiers={[weight(1)]}>
            <Text
              style={{ typography: "titleMedium" }}
              color={m3.onPrimaryContainer}
              maxLines={2}
              overflow="ellipsis"
            >
              {title}
            </Text>
            <Text
              style={{ typography: "bodyMedium" }}
              color={m3.onPrimaryContainer}
            >
              {detail}
            </Text>
          </Column>
          <FilledTonalButton onClick={() => openManga(mediaId)}>
            <Text style={{ typography: "labelLarge" }}>Open</Text>
          </FilledTonalButton>
        </Row>
      </Card>
    </Column>
  );
}
