import { Box, Column, Row } from "@expo/ui/jetpack-compose";
import { width } from "@expo/ui/jetpack-compose/modifiers";
import { Text } from "@/components/native/jetpack-compose/text";
import { Badge } from "@/components/ui/badge";
import { Icon, Icons } from "@/components/ui/icon";
import { STATUS_COLOR } from "@/features/manga/components/manga-card/constants";
import type { MangaDetail } from "@/features/manga/utils/to-detail";
import { useThemeM3Colors } from "@/hooks/use-theme/use-theme.android";
import { metaLines } from "./meta-lines";

const BODY = { typography: "bodyMedium" } as const;

export function Meta({ manga }: { manga: MangaDetail }) {
  const m3 = useThemeM3Colors();
  const { synonyms, state } = metaLines(manga);

  return (
    <Column verticalArrangement={{ spacedBy: 8 }}>
      {!!synonyms && (
        <Text
          style={BODY}
          color={m3.onSurfaceVariant}
          maxLines={3}
          overflow="ellipsis"
        >
          {synonyms}
        </Text>
      )}

      {!!manga.author && (
        <Row verticalAlignment="center" horizontalArrangement={{ spacedBy: 8 }}>
          <Icon name={Icons.person} size={12} muted />
          <Text style={{ ...BODY, fontWeight: "500" }}>{manga.author}</Text>
        </Row>
      )}

      {!!state && (
        <Row verticalAlignment="center" horizontalArrangement={{ spacedBy: 8 }}>
          {manga.status ? (
            // The icon column's width, so the dot lines up with them.
            <Box contentAlignment="center" modifiers={[width(12)]}>
              <Badge color={STATUS_COLOR[manga.status]} />
            </Box>
          ) : (
            <Icon name={Icons.calendar} size={12} muted />
          )}
          <Text style={BODY} color={m3.onSurfaceVariant}>
            {state}
          </Text>
        </Row>
      )}

      {!!manga.averageScore && (
        <Row verticalAlignment="center" horizontalArrangement={{ spacedBy: 8 }}>
          <Icon name={Icons.star} size={12} muted />
          <Text style={BODY} color={m3.onSurfaceVariant}>
            {`${manga.averageScore}% community`}
          </Text>
        </Row>
      )}
    </Column>
  );
}
