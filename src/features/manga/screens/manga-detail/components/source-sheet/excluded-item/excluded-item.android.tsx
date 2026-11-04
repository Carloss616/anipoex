import {
  Column,
  // biome-ignore lint/style/noRestrictedImports: opened by long-press, as on Available rows
  DropdownMenu,
  // biome-ignore lint/style/noRestrictedImports: as above
  DropdownMenuItem,
  IconButton,
  ListItem,
  Row,
  TextButton,
} from "@expo/ui/jetpack-compose";
import {
  combinedClickable,
  fillMaxWidth,
  semantics,
} from "@expo/ui/jetpack-compose/modifiers";
import { useValue } from "@legendapp/state/react";
import { memo, useState } from "react";
import { Text } from "@/components/native/jetpack-compose/text";
import { Badge } from "@/components/ui/badge";
import { Dialog } from "@/components/ui/dialog";
import { BUTTON_ICON_SIZE, Icon, Icons } from "@/components/ui/icon";
import { Loader } from "@/components/ui/loader";
import { probes$, scanning$ } from "@/features/manga/state/probes";
import { REASONS } from "@/features/manga/utils/msu";
import { useMatchUrl } from "../hooks/use-match-url";
import { useSearching } from "../hooks/use-searching";
import { Rail } from "../rail";
import { Tile } from "../tile";
import { errorDialog, excludedBadge, searchItem } from "../utils/row-content";
import type { ExcludedItemProps } from "./excluded-item";

export const ExcludedItem = memo(function ExcludedItem({
  source,
  reason,
  pinned,
  mangaKey,
  actions,
}: ExcludedItemProps) {
  // Rechecked or picked by hand, it stays here until its probe judges it.
  const scanning = useValue(
    () => scanning$[mangaKey][source.id].get() === true,
  );
  const lastError = useValue(() => probes$[mangaKey][source.id].error.get());
  // The last read's failure, hidden while the source is read again.
  const error = scanning ? undefined : lastError;
  const [menuOpen, setMenuOpen] = useState(false);
  const [showError, setShowError] = useState(false);
  const searching = useSearching(mangaKey, source.id);
  const search = searchItem(source, searching, actions);
  const searchIcon = searching ? Icons.searchTitlesOff : Icons.searchTitles;
  const url = useMatchUrl(mangaKey, source.id);

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
          {scanning ? (
            <Badge>scanning…</Badge>
          ) : (
            <Badge color={REASONS[reason].color}>
              {excludedBadge(reason, pinned)}
            </Badge>
          )}
        </Row>
      </ListItem.SupportingContent>
      <ListItem.TrailingContent>
        {scanning ? (
          <Row verticalAlignment="center">
            <Loader size="sm" />
            <IconButton
              onClick={() => actions.stop(source.id)}
              modifiers={[
                semantics({
                  contentDescription: `Stop scanning ${source.name}`,
                }),
              ]}
            >
              <Icon
                name={Icons.close}
                size={BUTTON_ICON_SIZE}
                color="inherit"
              />
            </IconButton>
          </Row>
        ) : (
          <TextButton onClick={() => actions.include(source.id)}>
            <Text style={{ typography: "labelLarge" }}>Include</Text>
          </TextButton>
        )}
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
            <DropdownMenuItem.LeadingIcon>
              <Icon name={searchIcon} size={BUTTON_ICON_SIZE} />
            </DropdownMenuItem.LeadingIcon>
          </DropdownMenuItem>
          {(url || source.homeUrl) && (
            <DropdownMenuItem
              onClick={() => {
                setMenuOpen(false);
                actions.openWebsite(source, url);
              }}
            >
              <DropdownMenuItem.Text>
                <Text style={{ typography: "labelLarge" }}>Open website</Text>
              </DropdownMenuItem.Text>
              <DropdownMenuItem.LeadingIcon>
                <Icon name={Icons.website} size={BUTTON_ICON_SIZE} />
              </DropdownMenuItem.LeadingIcon>
            </DropdownMenuItem>
          )}
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
              <DropdownMenuItem.LeadingIcon>
                <Icon name={Icons.error} size={BUTTON_ICON_SIZE} />
              </DropdownMenuItem.LeadingIcon>
            </DropdownMenuItem>
          )}
        </DropdownMenu.Items>
      </DropdownMenu>
      <Rail
        mangaKey={mangaKey}
        mangaId={Number(mangaKey)}
        source={source}
        actions={actions}
      />
    </Column>
  );
});
