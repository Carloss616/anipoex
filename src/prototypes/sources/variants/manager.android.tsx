import MoreVertIcon from "@expo/material-symbols/more_vert.xml";
import SearchIcon from "@expo/material-symbols/search.xml";
import {
  HorizontalDivider,
  ListItem,
  OutlinedTextField,
  Switch,
  useNativeState,
} from "@expo/ui/jetpack-compose";
import { Fragment } from "react";
import { View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Column } from "@/components/layout/column";
import { ScrollView } from "@/components/layout/scroll-view";
import { Button } from "@/components/ui/button";
import { EnsureRNHostView, Host } from "@/components/ui/host";
import { Icon } from "@/components/ui/icon";
import { Menu } from "@/components/ui/menu";
import { Surface } from "@/components/ui/surface";
import { toast } from "@/components/ui/toast";
import { Typography } from "@/components/ui/typography";
import { LANGUAGE_LABEL } from "../data";
import { ExtensionMark } from "../extension-mark";
import {
  extensionSubtitle,
  type ManagerVariantProps,
  useManagerLists,
} from "./manager-shared";

/**
 * Manager on Android — Jetpack `ListItem` + `Switch`, same pattern as
 * manga-detail `chapters.android.tsx`.
 */
export function ManagerVariant({ store }: ManagerVariantProps) {
  const insets = useSafeAreaInsets();
  const queryState = useNativeState("");
  const { setQuery, installed, available } = useManagerLists(store);

  return (
    <Host className="flex-1" style={{ paddingTop: insets.top }}>
      <ScrollView fill showsIndicators={false}>
        <Column className="gap-5 px-gx pt-gt pb-32">
          <Column className="gap-1">
            <Typography type="h4" weight="semibold">
              Sources
            </Typography>
            <Typography type="body-xs" muted>
              Enable providers you already trust. Browse the rest below.
            </Typography>
          </Column>

          <OutlinedTextField
            value={queryState}
            onValueChange={(next) => {
              queryState.value = next;
              setQuery(next);
            }}
            singleLine
            keyboardOptions={{ imeAction: "search" }}
          >
            <OutlinedTextField.Placeholder>
              <Typography type="body-sm" muted>
                Filter sources
              </Typography>
            </OutlinedTextField.Placeholder>
            <OutlinedTextField.LeadingIcon>
              <Icon name={SearchIcon} size={20} muted />
            </OutlinedTextField.LeadingIcon>
          </OutlinedTextField>

          <Column className="gap-2">
            <Typography type="body-sm" weight="semibold">
              Installed ({installed.length})
            </Typography>
            <Surface padding="none" elevated>
              {installed.length === 0 ? (
                <View className="px-4 py-6">
                  <Typography type="body-xs" muted>
                    No installed sources match this filter.
                  </Typography>
                </View>
              ) : (
                installed.map((ext, index) => (
                  <Fragment key={ext.id}>
                    {index > 0 ? <HorizontalDivider /> : null}
                    <ListItem colors={{ containerColor: "transparent" }}>
                      <ListItem.LeadingContent>
                        <EnsureRNHostView matchContents>
                          <ExtensionMark extension={ext} size="sm" />
                        </EnsureRNHostView>
                      </ListItem.LeadingContent>
                      <ListItem.HeadlineContent>
                        <Typography type="body-sm" weight="semibold">
                          {ext.name}
                        </Typography>
                      </ListItem.HeadlineContent>
                      <ListItem.SupportingContent>
                        <Typography type="body-xs" muted>
                          {extensionSubtitle(ext)}
                        </Typography>
                      </ListItem.SupportingContent>
                      <ListItem.TrailingContent>
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
                            value={ext.enabled}
                            onCheckedChange={(value) => {
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
                              <Icon name={MoreVertIcon} size={18} />
                            </Button>
                          </Menu>
                        </View>
                      </ListItem.TrailingContent>
                    </ListItem>
                  </Fragment>
                ))
              )}
            </Surface>
          </Column>

          <Column className="gap-2">
            <Typography type="body-sm" weight="semibold">
              Available ({available.length})
            </Typography>
            <Surface padding="none" elevated>
              {available.map((ext, index) => (
                <Fragment key={ext.id}>
                  {index > 0 ? <HorizontalDivider /> : null}
                  <ListItem colors={{ containerColor: "transparent" }}>
                    <ListItem.LeadingContent>
                      <EnsureRNHostView matchContents>
                        <ExtensionMark extension={ext} size="sm" />
                      </EnsureRNHostView>
                    </ListItem.LeadingContent>
                    <ListItem.HeadlineContent>
                      <Typography type="body-sm" weight="semibold">
                        {ext.name}
                      </Typography>
                    </ListItem.HeadlineContent>
                    <ListItem.SupportingContent>
                      <Typography type="body-xs" muted>
                        {ext.author} · {LANGUAGE_LABEL[ext.language]}
                      </Typography>
                    </ListItem.SupportingContent>
                    <ListItem.TrailingContent>
                      <Button
                        size="sm"
                        onPress={() => {
                          store.install(ext.id);
                          toast(`Installed ${ext.name}`);
                        }}
                      >
                        Install
                      </Button>
                    </ListItem.TrailingContent>
                  </ListItem>
                </Fragment>
              ))}
            </Surface>
          </Column>
        </Column>
      </ScrollView>
    </Host>
  );
}
