import { HStack, VStack } from "@expo/ui/swift-ui";
import { foregroundStyle, frame, lineLimit } from "@expo/ui/swift-ui/modifiers";
import { Text } from "@/components/native/swift-ui/text";
import { Badge } from "@/components/ui/badge";
import { Icon, Icons } from "@/components/ui/icon";
import { STATUS_COLOR } from "@/features/manga/components/manga-card/constants";
import type { MangaDetail } from "@/features/manga/utils/to-detail";
import { metaLines } from "./utils/meta-lines";

const SECONDARY = foregroundStyle("secondary");

export function Meta({ manga }: { manga: MangaDetail }) {
  const { synonyms, state } = metaLines(manga);

  return (
    <VStack alignment="leading" spacing={8}>
      {!!synonyms && (
        <Text textStyle="subheadline" modifiers={[SECONDARY, lineLimit(3)]}>
          {synonyms}
        </Text>
      )}

      {!!manga.author && (
        <HStack spacing={8}>
          <Icon name={Icons.person} size={12} muted />
          <Text textStyle="subheadline" weight="medium">
            {manga.author}
          </Text>
        </HStack>
      )}

      {!!state && (
        <HStack spacing={8}>
          {manga.status ? (
            // The icon column's width, so the dot lines up with them.
            <VStack modifiers={[frame({ width: 12 })]}>
              <Badge color={STATUS_COLOR[manga.status]} />
            </VStack>
          ) : (
            <Icon name={Icons.calendar} size={12} muted />
          )}
          <Text textStyle="subheadline" modifiers={[SECONDARY]}>
            {state}
          </Text>
        </HStack>
      )}

      {!!manga.averageScore && (
        <HStack spacing={8}>
          <Icon name={Icons.star} size={12} muted />
          <Text textStyle="subheadline" modifiers={[SECONDARY]}>
            {`${manga.averageScore}% community`}
          </Text>
        </HStack>
      )}
    </VStack>
  );
}
