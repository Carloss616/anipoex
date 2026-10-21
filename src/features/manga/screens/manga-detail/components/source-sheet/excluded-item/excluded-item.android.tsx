import { ListItem, Row, TextButton } from "@expo/ui/jetpack-compose";
import { Computed } from "@legendapp/state/react";
import { memo } from "react";
import { Text } from "@/components/native/jetpack-compose/text";
import { Badge } from "@/components/ui/badge";
import { isScanBusy } from "@/features/manga/state/probes";
import { REASONS } from "@/features/manga/utils/msu";
import { Tile } from "../tile";
import { excludedBadge } from "../utils/row-content";
import type { ExcludedItemProps } from "./excluded-item";

export const ExcludedItem = memo(function ExcludedItem({
  source,
  reason,
  pinned,
  mangaKey,
  actions,
}: ExcludedItemProps) {
  return (
    <ListItem colors={{ containerColor: "transparent" }}>
      <ListItem.LeadingContent>
        <Tile source={source} />
      </ListItem.LeadingContent>
      <ListItem.HeadlineContent>
        <Text style={{ fontWeight: "500" }}>{source.name}</Text>
      </ListItem.HeadlineContent>
      <ListItem.SupportingContent>
        <Row>
          <Badge color={REASONS[reason].color}>
            {excludedBadge(reason, pinned)}
          </Badge>
        </Row>
      </ListItem.SupportingContent>
      <ListItem.TrailingContent>
        <Computed>
          {() => (
            <TextButton
              enabled={!isScanBusy(mangaKey)}
              onClick={() => actions.include(source.id)}
            >
              <Text style={{ typography: "labelLarge" }}>Include</Text>
            </TextButton>
          )}
        </Computed>
      </ListItem.TrailingContent>
    </ListItem>
  );
});
