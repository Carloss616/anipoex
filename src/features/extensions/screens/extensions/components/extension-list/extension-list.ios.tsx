import {
  ContentUnavailableView,
  List,
  Section,
  Spacer,
  Button as SwiftUIButton,
  SwipeActions,
} from "@expo/ui/swift-ui";
import {
  listStyle,
  scrollContentBackground,
  tint,
} from "@expo/ui/swift-ui/modifiers";
import { useValue } from "@legendapp/state/react";
import { isLiquidGlassAvailable } from "expo-glass-effect";
import { Stack } from "expo-router";
import { useState } from "react";
import { Row } from "@/components/layout/row";
import { Toolbar } from "@/components/layout/toolbar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { Host } from "@/components/ui/host";
import { Item } from "@/components/ui/item";
import { Typography } from "@/components/ui/typography";
import {
  describeVersion,
  type Extension,
  hasUpdate,
  installExtension,
  uninstallExtension,
  updateAllExtensions,
  updateExtension,
} from "@/features/extensions";
import { FilterPicker } from "@/features/extensions/components/filter-picker";
import { sourceColor } from "@/features/manga/sources";
import { useThemeColor } from "@/hooks/use-theme-color";
import { theme$ } from "@/state/theme";
import type { ExtensionListProps } from "./extension-list";

/**
 * `NativeTabs.BottomAccessory` belongs to the iOS 26 tab bar; without it
 * (older iOS, or the app opted out of Liquid Glass) the picker goes in the list.
 * Same gate as `headerBlurEffect` in `use-theme.ts`.
 */
const HAS_ACCESSORY = isLiquidGlassAvailable();

const EMPTY = (
  <ContentUnavailableView
    title="No Extensions"
    systemImage="puzzlepiece.extension"
    description="Nothing matches this filter."
  />
);

export function ExtensionList({
  sections,
  counts,
  language,
  languages,
  onLanguageChange,
}: ExtensionListProps) {
  return (
    <>
      <Toolbar>
        <Stack.Toolbar placement="right">
          <Stack.Toolbar.Menu
            icon="line.3.horizontal.decrease"
            accessibilityLabel="Language"
          >
            {[undefined, ...languages].map((l) => (
              <Stack.Toolbar.MenuAction
                key={l ?? "all"}
                icon={l === language ? "checkmark" : undefined}
                onPress={() => onLanguageChange(l)}
              >
                {l ?? "All languages"}
              </Stack.Toolbar.MenuAction>
            ))}
          </Stack.Toolbar.Menu>
        </Stack.Toolbar>
      </Toolbar>

      <Host className="flex-1">
        {sections.length === 0 && HAS_ACCESSORY ? (
          EMPTY
        ) : (
          <List
            modifiers={[
              listStyle("insetGrouped"),
              // The List paints its own grouped background over any `background`.
              scrollContentBackground("hidden"),
            ]}
          >
            {/* Kept above an empty result too, so a filter can always be left. */}
            {!HAS_ACCESSORY && (
              <Section>
                <FilterPicker />
              </Section>
            )}
            {sections.length === 0 && EMPTY}
            {sections.map((s) => (
              <Section
                key={s.key}
                header={
                  <Row alignment="center" className="gap-3">
                    <Typography type="small" muted>
                      {s.title}
                    </Typography>
                    <Badge>{s.data.length}</Badge>
                    <Spacer />
                    {s.key !== "available" && counts.updates > 0 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onPress={updateAllExtensions}
                      >
                        Update all · {counts.updates}
                      </Button>
                    )}
                  </Row>
                }
              >
                <List.ForEach data={s.data} keyExtractor={(e) => e.id}>
                  {({ item: e }) =>
                    e.installed ? (
                      <InstalledRow extension={e} />
                    ) : (
                      <ExtensionRow extension={e} />
                    )
                  }
                </List.ForEach>
              </Section>
            ))}
          </List>
        )}
      </Host>
    </>
  );
}

/**
 * A swipe action is a native button, so it can't be a `Dialog.Trigger`: it
 * opens the dialog through `open`. The row is the trigger the sheet anchors to
 * (it ignores the `onPress` that adds), and it sits inside `SwipeActions`
 * because SwiftUI only honors swipe actions on the row's top view.
 */
function InstalledRow({ extension: e }: { extension: Extension }) {
  const [confirming, setConfirming] = useState(false);
  const destructive = useThemeColor("destructive");

  return (
    <SwipeActions>
      <Dialog
        alert
        open={confirming}
        onOpenChange={setConfirming}
        title={`Uninstall ${e.name}?`}
        description="You can install it again from Available."
        confirmLabel="Uninstall"
        destructive
        onConfirm={() => uninstallExtension(e.id)}
      >
        <Dialog.Trigger>
          <ExtensionRow extension={e} />
        </Dialog.Trigger>
      </Dialog>
      <SwipeActions.Actions edge="trailing">
        {/* SwiftUI's own Button, red by tint: a destructive role makes the
            List drop the row before the dialog can confirm, and the app
            Button's other variants don't render as a swipe action. */}
        <SwiftUIButton
          label="Uninstall"
          modifiers={[tint(destructive)]}
          onPress={() => setConfirming(true)}
        />
      </SwipeActions.Actions>
    </SwipeActions>
  );
}

function ExtensionRow({ extension: e }: { extension: Extension }) {
  const mode = useValue(theme$.mode);

  return (
    // The List row already insets its content.
    <Item className="p-0">
      <Item.Media
        variant="icon"
        style={{ backgroundColor: sourceColor(e, mode) }}
      >
        <Typography type="body-xs" weight="semibold">
          {e.initials}
        </Typography>
      </Item.Media>
      <Item.Content>
        <Item.Title numberOfLines={1}>
          {e.nsfw ? `${e.name} · 18+` : e.name}
        </Item.Title>
        <Item.Description numberOfLines={1}>
          {`${e.language} · ${describeVersion(e)}`}
        </Item.Description>
      </Item.Content>
      <Item.Actions>
        {!e.installed ? (
          <Button
            size="sm"
            variant="outline"
            onPress={() => installExtension(e.id)}
          >
            Install
          </Button>
        ) : hasUpdate(e) ? (
          <Button size="sm" onPress={() => updateExtension(e.id)}>
            Update
          </Button>
        ) : (
          <Badge>Installed</Badge>
        )}
      </Item.Actions>
    </Item>
  );
}
