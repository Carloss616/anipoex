import { Frame } from "panelui-native/components/frame";
import { Input } from "panelui-native/components/input";
import { Switch } from "panelui-native/components/switch";
import { View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ScrollView } from "@/components/layout/scroll-view";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { Menu } from "@/components/ui/menu";
import { toast } from "@/components/ui/toast";
import { Typography } from "@/components/ui/typography";
import { LANGUAGE_LABEL } from "../data";
import { ExtensionMark } from "../extension-mark";
import {
  extensionSubtitle,
  type ManagerVariantProps,
  useManagerLists,
} from "./manager-shared";

export type { ManagerVariantProps };

/** Web Manager — PanelUI Frame list. Native siblings use SwiftUI / Jetpack. */
export function ManagerVariant({ store }: ManagerVariantProps) {
  const insets = useSafeAreaInsets();
  const { query, setQuery, installed, available } = useManagerLists(store);

  return (
    <View className="flex-1 bg-background" style={{ paddingTop: insets.top }}>
      <View className="gap-1 px-gx pt-gt pb-3">
        <Typography type="h4" weight="semibold">
          Sources
        </Typography>
        <Typography type="body-xs" muted>
          Enable providers you already trust. Browse the rest below.
        </Typography>
      </View>

      <View className="px-gx pb-3">
        <Input
          variant="filled"
          size="sm"
          placeholder="Filter sources"
          value={query}
          onChangeText={setQuery}
          startContent={<Icon name="search" size={16} muted />}
          interactiveContent={false}
        />
      </View>

      <ScrollView fill showsIndicators={false}>
        <View className="gap-5 px-gx pb-32">
          <Frame>
            <Frame.Header>
              <Frame.Title>Installed</Frame.Title>
              <Frame.Action>{installed.length}</Frame.Action>
            </Frame.Header>
            <Frame.Panel>
              {installed.length === 0 ? (
                <View className="px-4 py-6">
                  <Typography type="body-xs" muted>
                    No installed sources match this filter.
                  </Typography>
                </View>
              ) : (
                installed.map((ext) => (
                  <Frame.Row key={ext.id}>
                    <Frame.Media>
                      <ExtensionMark extension={ext} size="sm" />
                    </Frame.Media>
                    <Frame.Content>
                      <Frame.Title>{ext.name}</Frame.Title>
                      <Frame.Description>
                        {extensionSubtitle(ext)}
                      </Frame.Description>
                    </Frame.Content>
                    <Frame.Actions>
                      <View className="flex-row items-center gap-2">
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
                        <Switch
                          size="sm"
                          value={ext.enabled}
                          haptics
                          accessibilityLabel={`Enable ${ext.name}`}
                          onValueChange={(value) => {
                            store.setEnabled(ext.id, value);
                            toast(
                              value
                                ? `${ext.name} enabled`
                                : `${ext.name} disabled`,
                            );
                          }}
                        />
                        <Menu
                          items={[
                            {
                              label: "Uninstall",
                              destructive: true,
                              icon: Icon.select({
                                ios: "trash",
                                android: require("@expo/material-symbols/delete.xml"),
                                web: "trash-2",
                              }),
                              onPressMode: "dialog",
                              dialogConfig: {
                                title: `Uninstall ${ext.name}?`,
                                description:
                                  "Chapters already downloaded stay on device. You can reinstall later.",
                                confirmLabel: "Uninstall",
                              },
                              onPress: () => {
                                store.uninstall(ext.id);
                                toast(`Uninstalled ${ext.name}`);
                              },
                            },
                          ]}
                        >
                          <Button size="sm" variant="ghost">
                            <Icon name="ellipsis" size={16} />
                          </Button>
                        </Menu>
                      </View>
                    </Frame.Actions>
                  </Frame.Row>
                ))
              )}
            </Frame.Panel>
          </Frame>

          <Frame>
            <Frame.Header>
              <Frame.Title>Available</Frame.Title>
              <Frame.Action>{available.length}</Frame.Action>
            </Frame.Header>
            <Frame.Panel>
              {available.map((ext) => (
                <Frame.Row key={ext.id}>
                  <Frame.Media>
                    <ExtensionMark extension={ext} size="sm" />
                  </Frame.Media>
                  <Frame.Content>
                    <Frame.Title>{ext.name}</Frame.Title>
                    <Frame.Description>
                      {ext.author} · {LANGUAGE_LABEL[ext.language]}
                    </Frame.Description>
                  </Frame.Content>
                  <Frame.Actions>
                    <Button
                      size="sm"
                      onPress={() => {
                        store.install(ext.id);
                        toast(`Installed ${ext.name}`);
                      }}
                    >
                      Install
                    </Button>
                  </Frame.Actions>
                </Frame.Row>
              ))}
            </Frame.Panel>
          </Frame>
        </View>
      </ScrollView>
    </View>
  );
}
