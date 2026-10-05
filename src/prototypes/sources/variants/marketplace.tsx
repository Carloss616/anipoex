import { Badge } from "panelui-native/components/badge";
import { Input } from "panelui-native/components/input";
import { Item } from "panelui-native/components/item";
import { useMemo, useState } from "react";
import { View } from "react-native";
import Animated, {
  FadeInDown,
  useReducedMotion,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Row } from "@/components/layout/row";
import { ScrollView } from "@/components/layout/scroll-view";
import { Button } from "@/components/ui/button";
import { Chip } from "@/components/ui/chip";
import { Icon } from "@/components/ui/icon";
import { Surface } from "@/components/ui/surface";
import { toast } from "@/components/ui/toast";
import { Typography } from "@/components/ui/typography";
import {
  type Extension,
  type ExtensionLanguage,
  type ExtensionsStore,
  formatInstalls,
  LANGUAGE_LABEL,
} from "../data";
import { ExtensionMark } from "../extension-mark";

const FILTERS: Array<{ id: "all" | ExtensionLanguage; label: string }> = [
  { id: "all", label: "All" },
  { id: "en", label: "English" },
  { id: "es", label: "Español" },
  { id: "ja", label: "日本語" },
  { id: "multi", label: "Multi" },
];

export function MarketplaceVariant({ store }: { store: ExtensionsStore }) {
  const insets = useSafeAreaInsets();
  const reducedMotion = useReducedMotion();
  const [query, setQuery] = useState("");
  const [lang, setLang] = useState<"all" | ExtensionLanguage>("all");

  const catalog = useMemo(() => {
    const q = query.trim().toLowerCase();
    return store.extensions.filter((ext) => {
      if (lang !== "all" && ext.language !== lang) return false;
      if (!q) return true;
      return (
        ext.name.toLowerCase().includes(q) ||
        ext.author.toLowerCase().includes(q) ||
        ext.description.toLowerCase().includes(q)
      );
    });
  }, [store.extensions, query, lang]);

  const featured = useMemo(
    () =>
      store.extensions
        .slice()
        .sort((a, b) => b.installs - a.installs)
        .slice(0, 4),
    [store.extensions],
  );

  return (
    <View className="flex-1 bg-background" style={{ paddingTop: insets.top }}>
      <ScrollView fill showsIndicators={false}>
        <View className="gap-5 pb-32">
          <View className="gap-3 px-gx pt-gt">
            <View className="gap-1">
              <Typography type="h3" weight="bold">
                Extensions
              </Typography>
              <Typography type="body-sm" muted>
                Discover community manga providers and install them in one tap.
              </Typography>
            </View>

            <Input
              variant="filled"
              placeholder="Search the catalog"
              value={query}
              onChangeText={setQuery}
              startContent={<Icon name="search" size={18} muted />}
              interactiveContent={false}
            />

            <ScrollView direction="horizontal" showsIndicators={false}>
              <Row className="gap-2">
                {FILTERS.map((filter) => (
                  <Chip
                    key={filter.id}
                    selected={lang === filter.id}
                    onPress={() => setLang(filter.id)}
                  >
                    <Chip.Label>{filter.label}</Chip.Label>
                  </Chip>
                ))}
              </Row>
            </ScrollView>
          </View>

          {store.outdated.length > 0 ? (
            <Surface className="mx-gx flex-row items-center justify-between gap-3 px-4 py-3">
              <View className="min-w-0 flex-1 gap-0.5">
                <Typography type="body-sm" weight="medium">
                  {store.outdated.length} update
                  {store.outdated.length === 1 ? "" : "s"} ready
                </Typography>
                <Typography type="body-xs" muted>
                  Keep sources current for chapter listings.
                </Typography>
              </View>
              <Button
                size="sm"
                onPress={() => {
                  const count = store.outdated.length;
                  store.updateAll();
                  toast(`Updated ${count} extensions`);
                }}
              >
                Update all
              </Button>
            </Surface>
          ) : null}

          <View className="gap-3">
            <Typography type="body-sm" weight="semibold" className="px-gx">
              Featured
            </Typography>
            <ScrollView direction="horizontal" showsIndicators={false}>
              <Row className="gap-3 px-gx">
                {featured.map((ext, i) => (
                  <FeaturedCard
                    key={ext.id}
                    extension={ext}
                    index={i}
                    reducedMotion={!!reducedMotion}
                    onInstall={() => {
                      store.install(ext.id);
                      toast(`Installed ${ext.name}`);
                    }}
                    onOpen={() => {
                      if (ext.installed) {
                        store.setEnabled(ext.id, !ext.enabled);
                        toast(
                          ext.enabled
                            ? `${ext.name} disabled`
                            : `${ext.name} enabled`,
                        );
                      }
                    }}
                  />
                ))}
              </Row>
            </ScrollView>
          </View>

          <View className="gap-2 px-gx">
            <Typography type="body-sm" weight="semibold">
              Community catalog
            </Typography>
            <Surface padding="none" elevated className="w-full overflow-hidden">
              <Item.Group>
                {catalog.map((ext, index) => (
                  <Animated.View
                    key={ext.id}
                    entering={
                      reducedMotion
                        ? undefined
                        : FadeInDown.delay(Math.min(index, 8) * 40).duration(
                            220,
                          )
                    }
                  >
                    {index > 0 ? <Item.Separator className="mx-4" /> : null}
                    <Item>
                      <Item.Media>
                        <ExtensionMark extension={ext} />
                      </Item.Media>
                      <Item.Content>
                        <View className="flex-row items-center gap-2">
                          <Item.Title>{ext.name}</Item.Title>
                          {ext.installed ? (
                            <Badge variant="success" shape="default">
                              Installed
                            </Badge>
                          ) : null}
                        </View>
                        <Item.Description numberOfLines={2}>
                          {ext.description}
                        </Item.Description>
                        <Typography type="body-xs" muted className="mt-1">
                          {LANGUAGE_LABEL[ext.language]} ·{" "}
                          {formatInstalls(ext.installs)} installs · v
                          {ext.latestVersion}
                        </Typography>
                      </Item.Content>
                      <Item.Actions>
                        {ext.installed ? (
                          <Button
                            size="sm"
                            variant="outline"
                            onPress={() => {
                              store.uninstall(ext.id);
                              toast(`Uninstalled ${ext.name}`);
                            }}
                          >
                            Remove
                          </Button>
                        ) : (
                          <Button
                            size="sm"
                            onPress={() => {
                              store.install(ext.id);
                              toast(`Installed ${ext.name}`);
                            }}
                          >
                            Install
                          </Button>
                        )}
                      </Item.Actions>
                    </Item>
                  </Animated.View>
                ))}
              </Item.Group>
            </Surface>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

function FeaturedCard({
  extension,
  index,
  reducedMotion,
  onInstall,
  onOpen,
}: {
  extension: Extension;
  index: number;
  reducedMotion: boolean;
  onInstall: () => void;
  onOpen: () => void;
}) {
  return (
    <Animated.View
      entering={
        reducedMotion ? undefined : FadeInDown.delay(index * 50).duration(240)
      }
    >
      <Surface className="w-56 gap-3 p-4">
        <View className="flex-row items-start justify-between gap-2">
          <ExtensionMark extension={extension} size="lg" />
          <Badge variant="secondary">
            {formatInstalls(extension.installs)}
          </Badge>
        </View>
        <View className="gap-1">
          <Typography type="body-sm" weight="semibold" numberOfLines={1}>
            {extension.name}
          </Typography>
          <Typography type="body-xs" muted numberOfLines={2}>
            {extension.description}
          </Typography>
        </View>
        {extension.installed ? (
          <Button size="sm" variant="outline" onPress={onOpen}>
            {extension.enabled ? "Disable" : "Enable"}
          </Button>
        ) : (
          <Button size="sm" onPress={onInstall}>
            Install
          </Button>
        )}
      </Surface>
    </Animated.View>
  );
}
