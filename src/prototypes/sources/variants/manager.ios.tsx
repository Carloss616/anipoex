import {
  HStack,
  List,
  Section,
  Spacer,
  SwipeActions,
  Text,
  TextField,
  Toggle,
  VStack,
} from "@expo/ui/swift-ui";
import {
  font,
  foregroundStyle,
  listStyle,
  textFieldStyle,
} from "@expo/ui/swift-ui/modifiers";
import { Button } from "@/components/ui/button";
import { EnsureRNHostView, Host } from "@/components/ui/host";
import { toast } from "@/components/ui/toast";
import { useFontFamily } from "@/hooks/use-font";
import { LANGUAGE_LABEL } from "../data";
import { ExtensionMark } from "../extension-mark";
import {
  extensionSubtitle,
  type ManagerVariantProps,
  useManagerLists,
} from "./manager-shared";

/**
 * Manager on iOS — SwiftUI `List` / `Section` / `Toggle`, same craft bar as
 * manga-detail chapters (native controls inside `Host`).
 */
export function ManagerVariant({ store }: ManagerVariantProps) {
  const fontFamily = useFontFamily("normal");
  const { setQuery, installed, available } = useManagerLists(store);

  return (
    <Host className="flex-1 pb-28">
      <List modifiers={[listStyle("insetGrouped")]}>
        <Section
          header={<Text>Sources</Text>}
          footer={
            <Text>
              Enable providers you already trust. Swipe an installed source to
              uninstall.
            </Text>
          }
        >
          <TextField
            placeholder="Filter sources"
            onTextChange={setQuery}
            modifiers={[
              textFieldStyle("roundedBorder"),
              font({ size: 15, family: fontFamily }),
            ]}
          />
        </Section>

        <Section title={`Installed (${installed.length})`}>
          {installed.length === 0 ? (
            <Text
              modifiers={[
                foregroundStyle({ type: "hierarchical", style: "secondary" }),
              ]}
            >
              No installed sources match this filter.
            </Text>
          ) : (
            installed.map((ext) => (
              <SwipeActions key={ext.id}>
                <SwipeActions.Actions edge="trailing" allowsFullSwipe>
                  <Button
                    variant="destructive"
                    onPress={() => {
                      store.uninstall(ext.id);
                      toast(`Uninstalled ${ext.name}`);
                    }}
                  >
                    Uninstall
                  </Button>
                </SwipeActions.Actions>
                <HStack spacing={12}>
                  <EnsureRNHostView matchContents>
                    <ExtensionMark extension={ext} size="sm" />
                  </EnsureRNHostView>
                  <VStack alignment="leading" spacing={2}>
                    <Text modifiers={[font({ size: 16, weight: "semibold" })]}>
                      {ext.name}
                    </Text>
                    <Text
                      modifiers={[
                        font({ size: 12, family: fontFamily }),
                        foregroundStyle({
                          type: "hierarchical",
                          style: "secondary",
                        }),
                      ]}
                    >
                      {extensionSubtitle(ext)}
                    </Text>
                  </VStack>
                  <Spacer />
                  {ext.version !== ext.latestVersion ? (
                    <Button
                      size="sm"
                      variant="outline"
                      onPress={() => {
                        store.update(ext.id);
                        toast(`Updated ${ext.name}`);
                      }}
                    >
                      Update
                    </Button>
                  ) : null}
                  <Toggle
                    isOn={ext.enabled}
                    onIsOnChange={(value) => {
                      store.setEnabled(ext.id, value);
                      toast(
                        value ? `${ext.name} enabled` : `${ext.name} disabled`,
                      );
                    }}
                  />
                </HStack>
              </SwipeActions>
            ))
          )}
        </Section>

        <Section title={`Available (${available.length})`}>
          {available.map((ext) => (
            <HStack key={ext.id} spacing={12}>
              <EnsureRNHostView matchContents>
                <ExtensionMark extension={ext} size="sm" />
              </EnsureRNHostView>
              <VStack alignment="leading" spacing={2}>
                <Text modifiers={[font({ size: 16, weight: "semibold" })]}>
                  {ext.name}
                </Text>
                <Text
                  modifiers={[
                    font({ size: 12, family: fontFamily }),
                    foregroundStyle({
                      type: "hierarchical",
                      style: "secondary",
                    }),
                  ]}
                >
                  {ext.author} · {LANGUAGE_LABEL[ext.language]}
                </Text>
              </VStack>
              <Spacer />
              <Button
                size="sm"
                onPress={() => {
                  store.install(ext.id);
                  toast(`Installed ${ext.name}`);
                }}
              >
                Install
              </Button>
            </HStack>
          ))}
        </Section>
      </List>
    </Host>
  );
}
