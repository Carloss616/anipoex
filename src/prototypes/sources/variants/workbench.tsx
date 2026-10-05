import { Badge } from "panelui-native/components/badge";
import { Item } from "panelui-native/components/item";
import { Swipe } from "panelui-native/components/swipe";
import { Tabs } from "panelui-native/components/tabs";
import { useState } from "react";
import { View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ScrollView } from "@/components/layout/scroll-view";
import { BottomSheet } from "@/components/ui/bottom-sheet";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { Surface } from "@/components/ui/surface";
import { toast } from "@/components/ui/toast";
import { Typography } from "@/components/ui/typography";
import {
  type Extension,
  type ExtensionsStore,
  formatInstalls,
  LANGUAGE_LABEL,
} from "../data";
import { ExtensionMark } from "../extension-mark";

export function WorkbenchVariant({ store }: { store: ExtensionsStore }) {
  const insets = useSafeAreaInsets();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const selected = store.extensions.find((ext) => ext.id === selectedId);

  return (
    <View className="flex-1 bg-background" style={{ paddingTop: insets.top }}>
      <View className="gap-1 px-gx pt-gt pb-3">
        <Typography type="h4" weight="semibold">
          Sources
        </Typography>
        <Typography type="body-xs" muted>
          Manage installed providers, browse the catalog, ship updates.
        </Typography>
      </View>

      <Tabs defaultValue="installed" className="min-h-0 flex-1 px-gx">
        <Tabs.List>
          <Tabs.Trigger value="installed">Installed</Tabs.Trigger>
          <Tabs.Trigger value="browse">Browse</Tabs.Trigger>
          <Tabs.Trigger
            value="updates"
            badge={
              store.outdated.length > 0 ? (
                <Badge variant="destructive" count={store.outdated.length} />
              ) : undefined
            }
          >
            Updates
          </Tabs.Trigger>
        </Tabs.List>

        <Tabs.Content value="installed" className="min-h-0 flex-1 pt-3">
          <ScrollView fill showsIndicators={false}>
            <View className="gap-2 pb-32">
              {store.installed.length === 0 ? (
                <Surface className="items-center gap-2 px-4 py-10">
                  <Typography type="body-sm" muted>
                    Nothing installed yet
                  </Typography>
                  <Typography type="body-xs" muted align="center">
                    Switch to Browse and pick a community provider.
                  </Typography>
                </Surface>
              ) : (
                <Swipe.Group>
                  <Surface padding="none" elevated className="overflow-hidden">
                    {store.installed.map((ext, index) => (
                      <View key={ext.id}>
                        {index > 0 ? <Item.Separator className="mx-4" /> : null}
                        <Swipe>
                          <Swipe.End>
                            <Swipe.Action
                              label="Uninstall"
                              color="destructive"
                              icon={
                                <Icon name="trash-2" size={18} color="#fff" />
                              }
                              onPress={() => {
                                store.uninstall(ext.id);
                                toast(`Uninstalled ${ext.name}`);
                              }}
                            />
                          </Swipe.End>
                          <Item
                            onPress={() => setSelectedId(ext.id)}
                            className="bg-card"
                          >
                            <Item.Media>
                              <ExtensionMark extension={ext} />
                            </Item.Media>
                            <Item.Content>
                              <Item.Title>{ext.name}</Item.Title>
                              <Item.Description>
                                {ext.enabled ? "Enabled" : "Disabled"} · v
                                {ext.version}
                                {ext.version !== ext.latestVersion
                                  ? ` · update ${ext.latestVersion}`
                                  : ""}
                              </Item.Description>
                            </Item.Content>
                            <Item.Actions>
                              <Icon name="chevron-right" size={18} muted />
                            </Item.Actions>
                          </Item>
                        </Swipe>
                      </View>
                    ))}
                  </Surface>
                </Swipe.Group>
              )}
            </View>
          </ScrollView>
        </Tabs.Content>

        <Tabs.Content value="browse" className="min-h-0 flex-1 pt-3">
          <ScrollView fill showsIndicators={false}>
            <View className="pb-32">
              <Surface padding="none" elevated className="overflow-hidden">
                <Item.Group>
                  {store.available.map((ext, index) => (
                    <View key={ext.id}>
                      {index > 0 ? <Item.Separator className="mx-4" /> : null}
                      <Item onPress={() => setSelectedId(ext.id)}>
                        <Item.Media>
                          <ExtensionMark extension={ext} />
                        </Item.Media>
                        <Item.Content>
                          <Item.Title>{ext.name}</Item.Title>
                          <Item.Description>
                            {LANGUAGE_LABEL[ext.language]} ·{" "}
                            {formatInstalls(ext.installs)} installs
                          </Item.Description>
                        </Item.Content>
                        <Item.Actions>
                          <Button
                            size="sm"
                            onPress={() => {
                              store.install(ext.id);
                              toast(`Installed ${ext.name}`);
                            }}
                          >
                            Install
                          </Button>
                        </Item.Actions>
                      </Item>
                    </View>
                  ))}
                </Item.Group>
              </Surface>
            </View>
          </ScrollView>
        </Tabs.Content>

        <Tabs.Content value="updates" className="min-h-0 flex-1 pt-3">
          <ScrollView fill showsIndicators={false}>
            <View className="gap-3 pb-32">
              {store.outdated.length === 0 ? (
                <Surface className="items-center gap-2 px-4 py-10">
                  <Icon name="circle-check" size={28} muted />
                  <Typography type="body-sm" muted>
                    All sources are up to date
                  </Typography>
                </Surface>
              ) : (
                <>
                  <Button
                    onPress={() => {
                      const count = store.outdated.length;
                      store.updateAll();
                      toast(`Updated ${count} sources`);
                    }}
                  >
                    Update all ({store.outdated.length})
                  </Button>
                  <Surface padding="none" elevated className="overflow-hidden">
                    <Item.Group>
                      {store.outdated.map((ext, index) => (
                        <View key={ext.id}>
                          {index > 0 ? (
                            <Item.Separator className="mx-4" />
                          ) : null}
                          <Item>
                            <Item.Media>
                              <ExtensionMark extension={ext} />
                            </Item.Media>
                            <Item.Content>
                              <Item.Title>{ext.name}</Item.Title>
                              <Item.Description>
                                v{ext.version} → v{ext.latestVersion}
                              </Item.Description>
                            </Item.Content>
                            <Item.Actions>
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
                            </Item.Actions>
                          </Item>
                        </View>
                      ))}
                    </Item.Group>
                  </Surface>
                </>
              )}
            </View>
          </ScrollView>
        </Tabs.Content>
      </Tabs>

      <ExtensionSheet
        extension={selected}
        isPresented={selectedId != null}
        onDismiss={() => setSelectedId(null)}
        store={store}
      />
    </View>
  );
}

function ExtensionSheet({
  extension,
  isPresented,
  onDismiss,
  store,
}: {
  extension: Extension | undefined;
  isPresented: boolean;
  onDismiss: () => void;
  store: ExtensionsStore;
}) {
  if (!extension) return null;

  return (
    <BottomSheet
      isPresented={isPresented}
      onDismiss={onDismiss}
      snapPoints={[{ fraction: 0.55 }]}
    >
      <View className="gap-5 px-gx pt-2 pb-8">
        <View className="flex-row items-start gap-3">
          <ExtensionMark extension={extension} size="lg" />
          <View className="min-w-0 flex-1 gap-1">
            <Typography type="h5" weight="semibold">
              {extension.name}
            </Typography>
            <Typography type="body-xs" muted>
              by {extension.author} · {LANGUAGE_LABEL[extension.language]} · v
              {extension.latestVersion}
            </Typography>
          </View>
        </View>

        <Typography type="body-sm" muted>
          {extension.description}
        </Typography>

        <Typography type="body-xs" muted>
          {formatInstalls(extension.installs)} community installs
        </Typography>

        <View className="gap-2">
          {extension.installed ? (
            <>
              <Button
                variant={extension.enabled ? "outline" : "primary"}
                onPress={() => {
                  store.setEnabled(extension.id, !extension.enabled);
                  toast(
                    extension.enabled
                      ? `${extension.name} disabled`
                      : `${extension.name} enabled`,
                  );
                }}
              >
                {extension.enabled ? "Disable source" : "Enable source"}
              </Button>
              {extension.version !== extension.latestVersion ? (
                <Button
                  variant="outline"
                  onPress={() => {
                    store.update(extension.id);
                    toast(`Updated ${extension.name}`);
                  }}
                >
                  Update to v{extension.latestVersion}
                </Button>
              ) : null}
              <Button
                variant="destructive"
                onPress={() => {
                  store.uninstall(extension.id);
                  toast(`Uninstalled ${extension.name}`);
                  onDismiss();
                }}
              >
                Uninstall
              </Button>
            </>
          ) : (
            <Button
              onPress={() => {
                store.install(extension.id);
                toast(`Installed ${extension.name}`);
                onDismiss();
              }}
            >
              Install extension
            </Button>
          )}
        </View>
      </View>
    </BottomSheet>
  );
}
