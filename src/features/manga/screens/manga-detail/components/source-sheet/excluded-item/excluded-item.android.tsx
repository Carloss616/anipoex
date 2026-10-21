import {
  Column,
  // biome-ignore lint/style/noRestrictedImports: opened by long-press, as on Available rows
  DropdownMenu,
  // biome-ignore lint/style/noRestrictedImports: as above
  DropdownMenuItem,
  ListItem,
  Row,
  TextButton,
} from "@expo/ui/jetpack-compose";
import {
  combinedClickable,
  fillMaxWidth,
} from "@expo/ui/jetpack-compose/modifiers";
import { Computed, useValue } from "@legendapp/state/react";
import { memo, useState } from "react";
import { Text } from "@/components/native/jetpack-compose/text";
import { Badge } from "@/components/ui/badge";
import { Dialog } from "@/components/ui/dialog";
import { isScanBusy, probes$ } from "@/features/manga/state/probes";
import { REASONS } from "@/features/manga/utils/msu";
import { useSearching } from "../hooks/use-searching";
import { Tile } from "../tile";
import { TitleRail } from "../title-rail";
import { errorDialog, excludedBadge, searchItem } from "../utils/row-content";
import type { ExcludedItemProps } from "./excluded-item";

export const ExcludedItem = memo(function ExcludedItem({
  source,
  reason,
  pinned,
  mangaKey,
  actions,
}: ExcludedItemProps) {
  const error = useValue(() => probes$[mangaKey][source.id].error.get());
  const [menuOpen, setMenuOpen] = useState(false);
  const [showError, setShowError] = useState(false);
  const search = searchItem(source, useSearching(mangaKey, source.id), actions);

  const item = (
    <ListItem
      colors={{ containerColor: "transparent" }}
      // A tap or long-press opens its menu, as on Available rows.
      modifiers={[
        combinedClickable({
          onClick: () => setMenuOpen(true),
          onLongClick: () => setMenuOpen(true),
        }),
      ]}
    >
      <ListItem.LeadingContent>
        <Tile source={source} />
      </ListItem.LeadingContent>
      <ListItem.HeadlineContent>
        <Text style={{ fontWeight: "500" }}>
          {source.baseName ?? source.name}
        </Text>
      </ListItem.HeadlineContent>
      <ListItem.SupportingContent>
        <Row verticalAlignment="center" horizontalArrangement={{ spacedBy: 6 }}>
          {source.lang && <Badge>{source.lang.toUpperCase()}</Badge>}
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
        {/* A dialog window, not laid out in the row. */}
        {error && (
          <Dialog
            {...errorDialog(source.name, error, true)}
            open={showError}
            onOpenChange={setShowError}
            onConfirm={() => actions.include(source.id)}
          />
        )}
      </ListItem.TrailingContent>
    </ListItem>
  );

  return (
    <Column>
      <DropdownMenu
        expanded={menuOpen}
        onDismissRequest={() => setMenuOpen(false)}
        modifiers={[fillMaxWidth()]}
      >
        <DropdownMenu.Trigger>{item}</DropdownMenu.Trigger>
        <DropdownMenu.Items>
          <DropdownMenuItem
            onClick={() => {
              setMenuOpen(false);
              search.onPress();
            }}
          >
            <DropdownMenuItem.Text>
              <Text style={{ typography: "labelLarge" }}>{search.label}</Text>
            </DropdownMenuItem.Text>
          </DropdownMenuItem>
          {error && (
            <DropdownMenuItem
              onClick={() => {
                setMenuOpen(false);
                setShowError(true);
              }}
            >
              <DropdownMenuItem.Text>
                <Text style={{ typography: "labelLarge" }}>See error</Text>
              </DropdownMenuItem.Text>
            </DropdownMenuItem>
          )}
        </DropdownMenu.Items>
      </DropdownMenu>
      <TitleRail
        mangaKey={mangaKey}
        mangaId={Number(mangaKey)}
        source={source}
        actions={actions}
      />
    </Column>
  );
});
